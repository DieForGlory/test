"""
Fix script: Add info_hours column to content_boutique table
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL


def fix_table():
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

    print("🛠 Исправление таблицы content_boutique...")

    with engine.connect() as conn:
        try:
            # Пытаемся добавить колонку
            conn.execute(
                text("ALTER TABLE content_boutique ADD COLUMN info_hours VARCHAR DEFAULT 'Пн-Вс: 10:00 - 22:00'"))
            conn.commit()
            print("✅ Колонка 'info_hours' успешно добавлена!")
        except Exception as e:
            # Если ошибка содержит "duplicate column name", значит колонка уже есть
            if "duplicate column name" in str(e).lower():
                print("ℹ️ Колонка уже существует.")
            else:
                print(f"⚠️ Ошибка (возможно, таблица не существует или колонка уже есть): {e}")


if __name__ == "__main__":
    fix_table()