"""
Migration script to add bookings table
Run this after updating database.py
"""
from database import init_db

if __name__ == "__main__":
    print("Running migration: Adding bookings table...")
    init_db()
    print("✅ Migration complete! Bookings table created.")
