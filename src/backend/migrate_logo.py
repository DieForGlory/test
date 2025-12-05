"""
Migration script to add logo table
"""
from database import init_db

def migrate():
    print("🔄 Starting logo table migration...")
    
    # Initialize DB (creates new tables if needed)
    init_db()
    print("✅ Logo table created successfully!")
    print("\n📝 Next steps:")
    print("1. Restart backend: uvicorn main:app --reload --port 8000")
    print("2. Go to Admin → Content → Site Logo")
    print("3. Upload your logo images")

if __name__ == "__main__":
    migrate()
