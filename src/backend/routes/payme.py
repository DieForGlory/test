"""
Payme payment integration routes
Documentation: https://developer.help.paycom.uz/
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import base64
import time
import json
import sys
import os

from database import get_db, Order, Transaction
from auth import require_admin

router = APIRouter()

# === НАСТРОЙКИ PAYME ===
PAYME_MERCHANT_ID = os.getenv("PAYME_MERCHANT_ID")
PAYME_TEST_KEY = os.getenv("PAYME_TEST_KEY")
PAYME_KEY = os.getenv("PAYME_KEY") # Боевой ключ
# Читаем URL из env, если нет — ставим боевой по умолчанию
PAYME_CHECKOUT_URL = os.getenv("PAYME_CHECKOUT_URL", "https://checkout.paycom.uz")
# --- Хелперы для работы с данными транзакции в Notes ---

def get_transaction_data(order_notes: str) -> dict:
    """Извлекает JSON данные транзакции из поля notes"""
    if not order_notes:
        return None

    marker = "[Payme Transaction]"
    if marker not in order_notes:
        return None

    try:
        # Ищем строку с маркером
        for line in order_notes.split('\n'):
            if marker in line:
                json_str = line.split(marker)[1].strip()
                return json.loads(json_str)
    except:
        return None
    return None

def update_transaction_data(order, new_data: dict):
    """Обновляет данные транзакции в notes"""
    marker = "[Payme Transaction]"
    json_str = json.dumps(new_data)
    new_line = f"{marker} {json_str}"

    if not order.notes:
        order.notes = new_line
    elif marker in order.notes:
        # Заменяем существующую строку
        lines = order.notes.split('\n')
        new_lines = []
        replaced = False
        for line in lines:
            if marker in line:
                if not replaced:
                    new_lines.append(new_line)
                    replaced = True
            else:
                new_lines.append(line)
        order.notes = '\n'.join(new_lines)
    else:
        order.notes = f"{order.notes}\n{new_line}"

def verify_payme_auth(auth_header: str) -> bool:
    """Проверка авторизации"""
    try:
        if not auth_header: return False
        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != "Basic": return False

        decoded = base64.b64decode(parts[1]).decode("utf-8")
        if ":" not in decoded: return False

        merchant_id, key = decoded.split(":", 1)

        # Проверяем ID мерчанта
        if merchant_id != PAYME_MERCHANT_ID and merchant_id != "Paycom":
             return False

        # Проверяем ключ (сначала боевой, потом тестовый)
        # Важно: В Payme Sandbox пароль может быть тестовым ключом
        if key != PAYME_KEY and key != PAYME_TEST_KEY:
            print(f"PAYME AUTH FAILED: {merchant_id}:{key}")
            sys.stdout.flush()
            return False

        return True
    except:
        return False

# --- Endpoints ---

class PaymeInitRequest(BaseModel):
    order_id: str
    amount: float

class PaymeInitResponse(BaseModel):
    checkout_url: str

@router.post("/api/payme/init")
async def init_payme_payment(data: PaymeInitRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_number == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    amount_tiyin = int(data.amount * 100)

    # Определяем URL сайта для редиректа
    site_url = os.getenv("VITE_SITE_URL", "https://orientwatch.uz")

    params = {
        "m": PAYME_MERCHANT_ID,
        "ac.order_id": data.order_id,
        "a": amount_tiyin,
        "c": f"{site_url}/cart" # Возврат в корзину после оплаты (где будет проверка статуса)
    }
    params_str = ";".join([f"{k}={v}" for k, v in params.items()])
    params_base64 = base64.b64encode(params_str.encode()).decode()
    checkout_url = f"{PAYME_CHECKOUT_URL}/{params_base64}"
    print("\n" + "=" * 60)
    print("PAYME INIT DEBUG")
    print("=" * 60)
    print(f"1. ИСПОЛЬЗУЕМЫЙ MERCHANT ID: '{PAYME_MERCHANT_ID}'")
    print(f"2. БАЗОВЫЙ URL PAYME:       '{PAYME_CHECKOUT_URL}'")
    print(f"3. ПАРАМЕТРЫ (ДЕКОДИРОВАННЫЕ):")
    print(f"   {params_str}")
    print(f"4. ИТОГОВАЯ ССЫЛКА (ЧТО МЫ ОТДАЕМ КЛИЕНТУ):")
    print(f"   {checkout_url}")
    print("=" * 60 + "\n")
    sys.stdout.flush()
    return PaymeInitResponse(checkout_url=checkout_url)

@router.post("/api/payme/callback")
async def payme_callback(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not verify_payme_auth(auth_header):
        return {"error": {"code": -32504, "message": "Insufficient privilege"}}

    try:
        body = await request.json()
        method = body.get("method")
        params = body.get("params", {})
        request_id = body.get("id")
    except:
        return {"error": {"code": -32700, "message": "Parse error"}}

    handlers = {
        "CheckPerformTransaction": handle_check_perform_transaction,
        "CreateTransaction": handle_create_transaction,
        "PerformTransaction": handle_perform_transaction,
        "CancelTransaction": handle_cancel_transaction,
        "CheckTransaction": handle_check_transaction,
        "GetStatement": handle_get_statement,  # <--- ДОБАВЛЕН МЕТОД
        "ChangePassword": lambda p, i, d: {"result": {"success": True}, "id": i}
    }

    if method in handlers:
        return handlers[method](params, request_id, db)
    else:
        return {"error": {"code": -32601, "message": "Method not found"}, "id": request_id}

# --- Handlers ---

def handle_check_perform_transaction(params: dict, request_id: int, db: Session):
    order_id = params.get("account", {}).get("order_id")
    amount = params.get("amount")

    if not order_id:
        return {"error": {"code": -31050, "message": "Order ID missing"}, "id": request_id}

    order = db.query(Order).filter(Order.order_number == order_id).first()
    if not order:
        return {"error": {"code": -31050, "message": "Order not found"}, "id": request_id}

    expected_amount = int(order.total * 100)
    if abs(int(amount) - expected_amount) > 10:
        return {"error": {"code": -31001, "message": "Wrong amount"}, "id": request_id}

    if order.status == "completed":
        # Если статус уже completed, но транзакция не найдена (редкий кейс),
        # то позволяем, иначе Payme может вернуть ошибку.
        # Но по документации, если заказ оплачен - возвращаем ошибку, если это новая попытка
        return {"error": {"code": -31008, "message": "Order already paid"}, "id": request_id}

    return {"result": {"allow": True}, "id": request_id}

def handle_create_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")
    order_id = params.get("account", {}).get("order_id")
    time_param = params.get("time") # Время создания от Payme
    amount = params.get("amount")

    # 1. Сначала проверяем CheckPerform логику
    check_res = handle_check_perform_transaction(params, request_id, db)
    if "error" in check_res and check_res["error"]["code"] != -31008:
        return check_res

    # 2. Ищем существующую транзакцию в БД
    transaction = db.query(Transaction).filter(Transaction.payme_trans_id == transaction_id).first()

    if transaction:
        # Идемпотентность: если транзакция уже есть, возвращаем её статус
        if transaction.state != 1:
             return {"error": {"code": -31008, "message": "Transaction already processed"}, "id": request_id}

        # Проверка тайм-аута (43200000 ms = 12 часов)
        if int(time.time() * 1000) - transaction.create_time > 43200000:
             transaction.state = -1
             transaction.reason = 4
             db.commit()
             return {"error": {"code": -31008, "message": "Transaction expired"}, "id": request_id}

        return {
            "result": {
                "create_time": transaction.create_time,
                "transaction": str(transaction.id),
                "state": 1
            },
            "id": request_id
        }

    # 3. Проверяем, нет ли другой активной транзакции для этого заказа
    active_tx = db.query(Transaction).filter(
        Transaction.order_id == order_id,
        Transaction.state == 1
    ).first()

    if active_tx:
        return {"error": {"code": -31050, "message": "Order has pending transaction"}, "id": request_id}

    # 4. Создаем новую транзакцию
    try:
        new_tx = Transaction(
            payme_trans_id=transaction_id,
            time=time_param,
            amount=amount,
            account=json.dumps(params.get("account")),
            create_time=time_param, # Важно использовать время Payme
            state=1,
            order_id=order_id
        )
        db.add(new_tx)

        # Обновляем статус заказа
        order = db.query(Order).filter(Order.order_number == order_id).first()
        if order:
            order.status = "processing"
            # Сохраняем в notes для совместимости со старым кодом, если нужно
            update_transaction_data(order, {
                "transaction_id": transaction_id,
                "create_time": time_param,
                "state": 1
            })

        db.commit()
        db.refresh(new_tx)

        return {
            "result": {
                "create_time": time_param,
                "transaction": str(new_tx.id),
                "state": 1
            },
            "id": request_id
        }
    except Exception as e:
        print(f"Error creating transaction: {e}")
        return {"error": {"code": -31008, "message": "Internal error"}, "id": request_id}

def handle_perform_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")

    # Ищем транзакцию в таблице Transaction
    transaction = db.query(Transaction).filter(Transaction.payme_trans_id == transaction_id).first()

    if not transaction:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": request_id}

    if transaction.state == 1:
        if int(time.time() * 1000) - transaction.create_time > 43200000:
             transaction.state = -1
             transaction.reason = 4
             db.commit()
             return {"error": {"code": -31008, "message": "Timeout"}, "id": request_id}

        # Выполняем
        perform_time = int(time.time() * 1000)
        transaction.state = 2
        transaction.perform_time = perform_time
        db.commit()

        # Обновляем заказ
        order = db.query(Order).filter(Order.order_number == transaction.order_id).first()
        if order:
            order.status = "completed"
            # Обновляем legacy notes
            update_transaction_data(order, {
                "transaction_id": transaction_id,
                "create_time": transaction.create_time,
                "perform_time": perform_time,
                "state": 2
            })
            db.commit()

        return {
            "result": {
                "transaction": str(transaction.id),
                "perform_time": perform_time,
                "state": 2
            },
            "id": request_id
        }

    if transaction.state == 2:
        return {
            "result": {
                "transaction": str(transaction.id),
                "perform_time": transaction.perform_time,
                "state": 2
            },
            "id": request_id
        }

    return {"error": {"code": -31008, "message": "Transaction cancelled/failed"}, "id": request_id}

def handle_cancel_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")
    reason = params.get("reason")

    transaction = db.query(Transaction).filter(Transaction.payme_trans_id == transaction_id).first()

    if not transaction:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": request_id}

    if transaction.state == 1:
        cancel_time = int(time.time() * 1000)
        transaction.state = -1
        transaction.cancel_time = cancel_time
        transaction.reason = reason
        db.commit()

        # Обновляем заказ
        order = db.query(Order).filter(Order.order_number == transaction.order_id).first()
        if order:
            order.status = "cancelled"
            db.commit()

        return {
            "result": {
                "transaction": str(transaction.id),
                "cancel_time": cancel_time,
                "state": -1
            },
            "id": request_id
        }

    if transaction.state == 2:
        cancel_time = int(time.time() * 1000)
        transaction.state = -2
        transaction.cancel_time = cancel_time
        transaction.reason = reason
        db.commit()

        # Обновляем заказ (возврат средств)
        order = db.query(Order).filter(Order.order_number == transaction.order_id).first()
        if order:
            order.status = "cancelled"
            db.commit()

        return {
            "result": {
                "transaction": str(transaction.id),
                "cancel_time": cancel_time,
                "state": -2
            },
            "id": request_id
        }

    return {
        "result": {
            "transaction": str(transaction.id),
            "cancel_time": transaction.cancel_time,
            "state": transaction.state
        },
        "id": request_id
    }

def handle_check_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")

    transaction = db.query(Transaction).filter(Transaction.payme_trans_id == transaction_id).first()

    if not transaction:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": request_id}

    return {
        "result": {
            "create_time": transaction.create_time,
            "perform_time": transaction.perform_time,
            "cancel_time": transaction.cancel_time,
            "transaction": str(transaction.id),
            "state": transaction.state,
            "reason": transaction.reason
        },
        "id": request_id
    }

# --- НОВЫЙ МЕТОД: GetStatement ---
def handle_get_statement(params: dict, request_id: int, db: Session):
    from_time = params.get("from")
    to_time = params.get("to")

    # Ищем транзакции в указанном диапазоне по полю time (время создания в Payme)
    # Используем таблицу Transactions, так как мы ее создали в миграции
    transactions = db.query(Transaction).filter(
        Transaction.time >= from_time,
        Transaction.time <= to_time
    ).all()

    formatted_transactions = []
    for tx in transactions:
        formatted_transactions.append({
            "id": tx.payme_trans_id,
            "time": tx.time,
            "amount": tx.amount,
            "account": json.loads(tx.account) if tx.account else {},
            "create_time": tx.create_time,
            "perform_time": tx.perform_time,
            "cancel_time": tx.cancel_time,
            "transaction": str(tx.id),
            "state": tx.state,
            "reason": tx.reason
        })

    return {
        "result": {
            "transactions": formatted_transactions
        },
        "id": request_id
    }

# Admin endpoint (оставляем для админки)
@router.get("/api/admin/payme/status/{order_id}")
async def get_payme_status(
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    order = db.query(Order).filter(Order.order_number == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tx = db.query(Transaction).filter(Transaction.order_id == order_id).first()

    return {
        "order_id": order_id,
        "order_status": order.status,
        "tx_data": {
            "id": tx.payme_trans_id,
            "state": tx.state,
            "perform_time": tx.perform_time
        } if tx else None
    }