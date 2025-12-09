"""
Payme payment integration routes
Documentation: https://developer.help.paycom.uz/
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import base64
import time
import json
import sys
import os

from database import get_db, Order, Transaction
from auth import require_admin

router = APIRouter()

# === НАСТРОЙКИ PAYME (Sandbox) ===
PAYME_MERCHANT_ID = os.getenv("PAYME_MERCHANT_ID", "6928576d155c805660108939")
PAYME_KEY = os.getenv("PAYME_TEST_KEY", "j1MhEdjYm9U7McURjDMt@y@WUA8Xq5C6HsX9")
PAYME_CHECKOUT_URL = "https://test.paycom.uz"

# --- Auth Helper ---
def verify_payme_auth(auth_header: str) -> bool:
    try:
        if not auth_header: return False
        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != "Basic": return False

        decoded = base64.b64decode(parts[1]).decode("utf-8")
        if ":" not in decoded: return False

        merchant_id, key = decoded.split(":", 1)

        # Разрешаем "Paycom" как логин для песочницы
        if (merchant_id == PAYME_MERCHANT_ID or merchant_id == "Paycom") and key == PAYME_KEY:
            return True

        print(f"PAYME AUTH FAILED: {merchant_id}:{key}")
        return False
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
    site_url = os.getenv('SITE_URL', 'https://orientwatch.uz')
    params_str = f"m={PAYME_MERCHANT_ID};ac.order_id={data.order_id};a={amount_tiyin};c={site_url}/order/{data.order_id}"
    params_base64 = base64.b64encode(params_str.encode()).decode()

    return PaymeInitResponse(checkout_url=f"{PAYME_CHECKOUT_URL}/{params_base64}")

@router.post("/api/payme/callback")
async def payme_callback(request: Request, db: Session = Depends(get_db)):
    if not verify_payme_auth(request.headers.get("Authorization")):
        return {"error": {"code": -32504, "message": "Insufficient privilege"}}

    try:
        body = await request.json()
        method = body.get("method")
        params = body.get("params", {})
        rid = body.get("id")
    except:
        return {"error": {"code": -32700, "message": "Parse error"}}

    if method == "CheckPerformTransaction":
        return handle_check_perform(params, rid, db)
    elif method == "CreateTransaction":
        return handle_create(params, rid, db)
    elif method == "PerformTransaction":
        return handle_perform(params, rid, db)
    elif method == "CancelTransaction":
        return handle_cancel(params, rid, db)
    elif method == "CheckTransaction":
        return handle_check(params, rid, db)
    elif method == "ChangePassword":
        return {"result": {"success": True}, "id": rid}
    else:
        return {"error": {"code": -32601, "message": "Method not found"}, "id": rid}

# --- Handlers ---

def handle_check_perform(params, rid, db):
    order_id = params.get("account", {}).get("order_id")
    amount = params.get("amount")

    if not order_id:
        return {"error": {"code": -31050, "message": "Order ID missing"}, "id": rid}

    order = db.query(Order).filter(Order.order_number == order_id).first()
    if not order:
        return {"error": {"code": -31050, "message": "Order not found"}, "id": rid}

    # Проверка суммы (допуск 10 тийин)
    if abs(int(amount) - int(order.total * 100)) > 10:
        return {"error": {"code": -31001, "message": "Wrong amount"}, "id": rid}

    if order.status == "completed":
        return {"error": {"code": -31008, "message": "Order already paid"}, "id": rid}

    return {"result": {"allow": True}, "id": rid}

def handle_create(params, rid, db):
    trans_id = params.get("id")
    order_id = params.get("account", {}).get("order_id")
    time_ms = params.get("time")
    amount = params.get("amount")

    # 1. Проверяем существование транзакции
    trans = db.query(Transaction).filter(Transaction.payme_trans_id == trans_id).first()
    if trans:
        # Идемпотентность
        if trans.state != 1:
             return {"error": {"code": -31008, "message": "Transaction already processed"}, "id": rid}

        # Проверка таймаута (12 часов)
        if int(time.time() * 1000) - trans.create_time > 43200000:
             trans.state = -1
             trans.reason = 4
             db.commit()
             return {"error": {"code": -31008, "message": "Transaction expired"}, "id": rid}

        return {
            "result": {
                "create_time": trans.create_time,
                "transaction": str(trans.id),
                "state": 1
            },
            "id": rid
        }

    # 2. Проверяем заказ и СУММУ (используем логику CheckPerform)
    # Это исправляет ошибку -31001 на этапе создания
    check_res = handle_check_perform(params, rid, db)
    if "error" in check_res:
        return check_res

    # 3. Блокировка параллельных транзакций
    active_tx = db.query(Transaction).filter(
        Transaction.order_id == order_id,
        Transaction.state == 1
    ).first()

    if active_tx:
        return {"error": {"code": -31050, "message": "Order has pending transaction"}, "id": rid}

    # 4. Создаем новую
    try:
        new_tx = Transaction(
            payme_trans_id=trans_id,
            time=time_ms,
            amount=amount,
            account=json.dumps(params.get("account")),
            create_time=time_ms,
            state=1,
            order_id=order_id
        )
        db.add(new_tx)

        order = db.query(Order).filter(Order.order_number == order_id).first()
        if order: order.status = "processing"
        db.commit()

        return {
            "result": {
                "create_time": time_ms,
                "transaction": str(new_tx.id),
                "state": 1
            },
            "id": rid
        }
    except Exception as e:
        print(f"Error creating: {e}")
        return {"error": {"code": -31008, "message": "Internal error"}, "id": rid}

def handle_perform(params, rid, db):
    trans_id = params.get("id")
    trans = db.query(Transaction).filter(Transaction.payme_trans_id == trans_id).first()

    if not trans:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": rid}

    if trans.state == 1:
        if int(time.time() * 1000) - trans.create_time > 43200000:
             trans.state = -1
             trans.reason = 4
             db.commit()
             return {"error": {"code": -31008, "message": "Timeout"}, "id": rid}

        # Выполняем
        trans.state = 2
        trans.perform_time = int(time.time() * 1000)
        db.commit()

        order = db.query(Order).filter(Order.order_number == trans.order_id).first()
        if order:
            order.status = "completed"
            db.commit()

        return {
            "result": {
                "transaction": str(trans.id),
                "perform_time": trans.perform_time,
                "state": 2
            },
            "id": rid
        }

    if trans.state == 2:
        return {
            "result": {
                "transaction": str(trans.id),
                "perform_time": trans.perform_time,
                "state": 2
            },
            "id": rid
        }

    return {"error": {"code": -31008, "message": "Transaction cancelled/failed"}, "id": rid}

def handle_cancel(params, rid, db):
    trans_id = params.get("id")
    reason = params.get("reason")
    trans = db.query(Transaction).filter(Transaction.payme_trans_id == trans_id).first()

    if not trans:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": rid}

    if trans.state == 1:
        trans.state = -1
        trans.cancel_time = int(time.time() * 1000)
        trans.reason = reason
        db.commit()

        order = db.query(Order).filter(Order.order_number == trans.order_id).first()
        if order: order.status = "cancelled"
        db.commit()

        return {
            "result": {
                "transaction": str(trans.id),
                "cancel_time": trans.cancel_time,
                "state": -1
            },
            "id": rid
        }

    if trans.state == 2:
        trans.state = -2
        trans.cancel_time = int(time.time() * 1000)
        trans.reason = reason
        db.commit()

        order = db.query(Order).filter(Order.order_number == trans.order_id).first()
        if order: order.status = "cancelled"
        db.commit()

        return {
            "result": {
                "transaction": str(trans.id),
                "cancel_time": trans.cancel_time,
                "state": -2
            },
            "id": rid
        }

    return {
        "result": {
            "transaction": str(trans.id),
            "cancel_time": trans.cancel_time,
            "state": trans.state
        },
        "id": rid
    }

def handle_check(params, rid, db):
    trans_id = params.get("id")
    trans = db.query(Transaction).filter(Transaction.payme_trans_id == trans_id).first()

    if not trans:
        return {"error": {"code": -31003, "message": "Transaction not found"}, "id": rid}

    return {
        "result": {
            "create_time": trans.create_time,
            "perform_time": trans.perform_time,
            "cancel_time": trans.cancel_time,
            "transaction": str(trans.id),
            "state": trans.state,
            "reason": trans.reason
        },
        "id": rid
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

    tx = db.query(Transaction).filter(Transaction.order_id == order_id).first()

    return {
        "order_id": order_id,
        "order_status": order.status,
        "tx_data": {
            "id": tx.payme_trans_id,
            "state": tx.state
        } if tx else None
    }