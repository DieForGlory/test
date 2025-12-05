"""
Admin routes - authentication and dashboard
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from database import get_db, User, Product, Order
from schemas import LoginRequest, LoginResponse
from auth import verify_password, create_access_token, require_admin

router = APIRouter()

@router.post("/api/admin/login", response_model=LoginResponse)
async def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    """Admin login"""
    # Find user
    user = db.query(User).filter(
        User.email == request.email,
        User.role == "admin"
    ).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    token = create_access_token(data={
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@router.get("/api/admin/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get dashboard statistics"""
    total_products = db.query(func.count(Product.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    
    # Total revenue from completed orders
    total_revenue = db.query(func.sum(Order.total)).filter(
        Order.status == "completed"
    ).scalar() or 0
    
    total_users = db.query(func.count(User.id)).filter(
        User.role == "user"
    ).scalar()
    
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status == "pending"
    ).scalar()
    
    completed_orders = db.query(func.count(Order.id)).filter(
        Order.status == "completed"
    ).scalar()
    
    return {
        "totalProducts": total_products,
        "totalOrders": total_orders,
        "totalRevenue": total_revenue,
        "totalUsers": total_users,
        "pendingOrders": pending_orders,
        "completedOrders": completed_orders
    }

@router.get("/api/admin/orders/recent")
async def get_recent_orders(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get recent orders"""
    orders = db.query(Order).order_by(
        Order.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for order in orders:
        customer_data = json.loads(order.customer_data) if order.customer_data else {}
        
        result.append({
            "id": order.order_number,
            "customerName": customer_data.get("fullName", "Unknown"),
            "total": order.total,
            "status": order.status,
            "date": order.created_at.strftime("%Y-%m-%d")
        })
    
    return result