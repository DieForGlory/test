"""
Migration: Create promocodes table
"""
from database import engine, Base

def migrate():
    print("🔄 Creating promocodes table...")
    Base.metadata.create_all(bind=engine)
    print("✅ Promocodes table created!")

if __name__ == "__main__":
    migrate()