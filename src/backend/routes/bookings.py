from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import random
import string

from database import get_db, Booking
from schemas import BookingCreate, BookingResponse, BookingUpdate
from auth import require_admin

router = APIRouter()

def generate_booking_number():
    """Generate unique booking number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.digits, k=4))
    return f"BK{timestamp}{random_part}"

# Public endpoint - create booking
@router.post("/api/bookings", response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    """Create new boutique booking"""
    
    # Generate unique booking number
    booking_number = generate_booking_number()
    while db.query(Booking).filter(Booking.booking_number == booking_number).first():
        booking_number = generate_booking_number()
    
    db_booking = Booking(
        booking_number=booking_number,
        name=booking.name,
        phone=booking.phone,
        email=booking.email,
        date=booking.date,
        time=booking.time,
        message=booking.message,
        boutique=booking.boutique or "Orient Ташкент",
        status="pending"
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    return db_booking

# Admin endpoints
@router.get("/api/admin/bookings", response_model=List[BookingResponse])
def get_bookings(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all bookings (admin only)"""
    query = db.query(Booking)
    
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    return bookings

@router.get("/api/admin/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get booking by ID (admin only)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.put("/api/admin/bookings/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    update: BookingUpdate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update booking status (admin only)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = update.status
    booking.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(booking)
    
    return booking

@router.delete("/api/admin/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete booking (admin only)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    
    return {"message": "Booking deleted successfully"}

@router.get("/api/admin/bookings/stats/summary")
def get_bookings_stats(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get booking statistics (admin only)"""
    total = db.query(Booking).count()
    pending = db.query(Booking).filter(Booking.status == "pending").count()
    confirmed = db.query(Booking).filter(Booking.status == "confirmed").count()
    completed = db.query(Booking).filter(Booking.status == "completed").count()
    cancelled = db.query(Booking).filter(Booking.status == "cancelled").count()
    
    return {
        "total": total,
        "pending": pending,
        "confirmed": confirmed,
        "completed": completed,
        "cancelled": cancelled
    }