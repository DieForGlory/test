"""
Migration: Add brand to collections table
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL


def migrate():
    print("🔄 Adding brand column to collections...")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    with engine.connect() as conn:
        try:
            # Добавляем колонку brand со значением по умолчанию 'Orient'
            conn.execute(text("ALTER TABLE collections ADD COLUMN brand VARCHAR DEFAULT 'Orient'"))
            print("✅ Column brand added to collections")
        except Exception as e:
            print(f"ℹ️ Column might already exist: {e}")


if __name__ == "__main__":
    migrate()