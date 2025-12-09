"""
Migration script: Add mobile_image to ContentHero table
"""
from database import engine, init_db
from sqlalchemy import text

def migrate():
    print("🔄 Initializing database tables...")
    # Гарантируем, что таблицы существуют
    init_db()

    print("🔄 Adding mobile_image column to content_hero table...")

    with engine.connect() as conn:
        try:
            # Добавляем колонку
            conn.execute(text("ALTER TABLE content_hero ADD COLUMN mobile_image VARCHAR DEFAULT ''"))
            print("✅ Added mobile_image column")
        except Exception as e:
            # Если колонка уже есть, SQLite выбросит ошибку "duplicate column name"
            if "duplicate column name" in str(e).lower():
                print("ℹ️ mobile_image column already exists")
            else:
                print(f"⚠️ Error adding mobile_image: {e}")

        conn.commit()

    print("\n✅ Migration complete!")

if __name__ == "__main__":
    migrate()