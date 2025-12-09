"""
Orders routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import json
from datetime import datetime

from database import get_db, Order
from schemas import OrderCreate, OrderStatusUpdate
from auth import require_admin

router = APIRouter()

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"ORD-{timestamp}"

@router.post("/api/orders")
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create new order (public endpoint)"""
    # Generate order number
    order_number = generate_order_number()
    
    # Create order
    db_order = Order(
        order_number=order_number,
        customer_data=json.dumps(order.customer.dict()),
        items=json.dumps([item.dict() for item in order.items]),
        subtotal=order.subtotal,
        shipping=order.shipping,
        total=order.total,
        payment_method=order.paymentMethod,
        delivery_method=order.deliveryMethod,
        delivery_address=json.dumps(order.deliveryAddress.dict()) if order.deliveryAddress else None,
        notes=order.notes,
        status="pending"
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return {
        "message": "Order created successfully",
        "orderNumber": order_number,
        "id": db_order.id
    }

@router.get("/api/admin/orders")
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get all orders"""
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    total = query.count()
    offset = (page - 1) * limit
    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    
    data = []
    for order in orders:
        customer_data = json.loads(order.customer_data) if order.customer_data else {}
        items = json.loads(order.items) if order.items else []
        
        data.append({
            "id": order.order_number,
            "orderNumber": order.order_number,
            "customer": customer_data,
            "items": items,
            "subtotal": order.subtotal,
            "shipping": order.shipping,
            "total": order.total,
            "status": order.status,
            "paymentMethod": order.payment_method,
            "deliveryMethod": order.delivery_method,
            "createdAt": order.created_at.isoformat() if order.created_at else None
        })
    
    return {
        "data": data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }

@router.get("/api/admin/orders/{order_id}")
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get order by ID"""
    order = db.query(Order).filter(Order.order_number == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    customer_data = json.loads(order.customer_data) if order.customer_data else {}
    items = json.loads(order.items) if order.items else []
    delivery_address = json.loads(order.delivery_address) if order.delivery_address else None
    
    return {
        "id": order.order_number,
        "orderNumber": order.order_number,
        "customer": customer_data,
        "items": items,
        "subtotal": order.subtotal,
        "shipping": order.shipping,
        "total": order.total,
        "status": order.status,
        "paymentMethod": order.payment_method,
        "deliveryMethod": order.delivery_method,
        "deliveryAddress": delivery_address,
        "notes": order.notes,
        "createdAt": order.created_at.isoformat() if order.created_at else None,
        "updatedAt": order.updated_at.isoformat() if order.updated_at else None
    }

@router.put("/api/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update order status"""
    order = db.query(Order).filter(Order.order_number == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_update.status
    if status_update.note:
        order.notes = status_update.note
    
    db.commit()
    
    return {
        "message": "Order status updated",
        "id": order_id,
        "status": status_update.status
    }