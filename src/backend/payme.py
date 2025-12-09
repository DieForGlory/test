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

from database import get_db, Order
from auth import require_admin

router = APIRouter()

# === НАСТРОЙКИ PAYME ===
PAYME_MERCHANT_ID = "6928576d155c805660108939"
PAYME_TEST_KEY = "j1MhEdjYm9U7McURjDMt@y@WUA8Xq5C6HsX9"
PAYME_CHECKOUT_URL = "https://test.paycom.uz"

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

        # В Sandbox логин может быть "Paycom"
        is_merchant_valid = (merchant_id == PAYME_MERCHANT_ID) or (merchant_id == "Paycom")

        if not is_merchant_valid or key != PAYME_TEST_KEY:
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
    params = {
        "m": PAYME_MERCHANT_ID,
        "ac.order_id": data.order_id,
        "a": amount_tiyin,
        "c": f"https://orientwatch.uz/order/{data.order_id}"
    }
    params_str = ";".join([f"{k}={v}" for k, v in params.items()])
    params_base64 = base64.b64encode(params_str.encode()).decode()
    checkout_url = f"{PAYME_CHECKOUT_URL}/{params_base64}"
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
        return {"error": {"code": -31008, "message": "Order already paid"}, "id": request_id}

    return {"result": {"allow": True}, "id": request_id}

def handle_create_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")
    order_id = params.get("account", {}).get("order_id")
    time_param = params.get("time") # Время создания от Payme

    order = db.query(Order).filter(Order.order_number == order_id).first()
    if not order:
        return {"error": {"code": -31050, "message": "Order not found"}, "id": request_id}

    # Проверка существующей транзакции
    tx_data = get_transaction_data(order.notes)

    if tx_data:
        active_id = tx_data.get("transaction_id")
        active_state = int(tx_data.get("state", 0))

        # 1. Идемпотентность: повторный запрос с тем же ID
        if active_id == transaction_id:
            # Возвращаем те же данные, что сохранили, НЕ меняя create_time
            return {
                "result": {
                    "create_time": tx_data.get("create_time"),
                    "transaction": str(active_id),
                    "state": active_state
                },
                "id": request_id
            }

        # 2. Попытка создать новую транзакцию, пока старая активна (state=1)
        if active_state == 1:
            return {
                "error": {
                    "code": -31050,
                    "message": "Order is already in progress"
                },
                "id": request_id
            }

    # Создаем новую транзакцию
    # Важно: сохраняем time_param из запроса, чтобы возвращать его в CheckTransaction
    new_tx = {
        "transaction_id": transaction_id,
        "create_time": time_param,
        "perform_time": 0,
        "cancel_time": 0,
        "state": 1,
        "reason": None
    }

    update_transaction_data(order, new_tx)
    order.status = "processing"
    db.commit()

    return {
        "result": {
            "create_time": time_param,
            "transaction": str(transaction_id),
            "state": 1
        },
        "id": request_id
    }

def handle_perform_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")

    # Ищем заказ (проверяем все, т.к. notes поле текстовое)
    orders = db.query(Order).filter(Order.notes.contains(transaction_id)).all()
    if not orders:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": request_id}

    order = orders[0]
    tx_data = get_transaction_data(order.notes)

    if not tx_data:
         return {"error": {"code": -31003, "message": "Transaction data corrupted"}, "id": request_id}

    state = int(tx_data.get("state", 0))

    # Идемпотентность: если уже оплачено (state 2)
    if state == 2:
        return {
            "result": {
                "transaction": str(transaction_id),
                "perform_time": tx_data.get("perform_time"),
                "state": 2
            },
            "id": request_id
        }

    # Если отменена
    if state < 0:
         return {"error": {"code": -31008, "message": "Transaction cancelled"}, "id": request_id}

    # Выполняем оплату
    perform_time = int(time.time() * 1000)
    tx_data["state"] = 2
    tx_data["perform_time"] = perform_time

    update_transaction_data(order, tx_data)
    order.status = "completed"
    db.commit()

    return {
        "result": {
            "transaction": str(transaction_id),
            "perform_time": perform_time,
            "state": 2
        },
        "id": request_id
    }

def handle_cancel_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")
    reason = params.get("reason")

    orders = db.query(Order).filter(Order.notes.contains(transaction_id)).all()
    if not orders:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": request_id}

    order = orders[0]
    tx_data = get_transaction_data(order.notes)
    if not tx_data:
        return {"error": {"code": -31003, "message": "Data corrupted"}, "id": request_id}

    current_state = int(tx_data.get("state", 0))

    # Идемпотентность: если уже отменена
    if current_state < 0:
        return {
            "result": {
                "transaction": str(transaction_id),
                "cancel_time": tx_data.get("cancel_time"),
                "state": current_state
            },
            "id": request_id
        }

    # Отмена (1 -> -1, 2 -> -2)
    new_state = -1 if current_state == 1 else -2
    cancel_time = int(time.time() * 1000)

    tx_data["state"] = new_state
    tx_data["cancel_time"] = cancel_time
    tx_data["reason"] = reason

    update_transaction_data(order, tx_data)
    order.status = "cancelled"
    db.commit()

    return {
        "result": {
            "transaction": str(transaction_id),
            "cancel_time": cancel_time,
            "state": new_state
        },
        "id": request_id
    }

def handle_check_transaction(params: dict, request_id: int, db: Session):
    transaction_id = params.get("id")

    orders = db.query(Order).filter(Order.notes.contains(transaction_id)).all()
    if not orders:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": request_id}

    order = orders[0]
    tx_data = get_transaction_data(order.notes)

    if not tx_data:
        return {"error": {"code": -31003, "message": "Data corrupted"}, "id": request_id}

    # Возвращаем СТРОГО сохраненные данные
    return {
        "result": {
            "create_time": tx_data.get("create_time", 0),
            "perform_time": tx_data.get("perform_time", 0),
            "cancel_time": tx_data.get("cancel_time", 0),
            "transaction": str(transaction_id),
            "state": int(tx_data.get("state", 0)),
            "reason": tx_data.get("reason")
        },
        "id": request_id
    }

# Admin endpoint
@router.get("/api/admin/payme/status/{order_id}")
async def get_payme_status(
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    order = db.query(Order).filter(Order.order_number == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order_id,
        "order_status": order.status,
        "tx_data": get_transaction_data(order.notes)
    }