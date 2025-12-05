"""
Migration script: Add button color customization to ContentHero table
"""
from database import engine, init_db
from sqlalchemy import text

def migrate():
    print("🔄 Initializing database tables...")
    # Сначала создаем таблицы, если их нет
    init_db()

    print("🔄 Adding color columns to content_hero table...")

    with engine.connect() as conn:
        try:
            # Цвет текста кнопки (обычный)
            conn.execute(text("ALTER TABLE content_hero ADD COLUMN button_text_color VARCHAR DEFAULT '#FFFFFF'"))
            print("✅ Added button_text_color")
        except Exception as e:
            # Игнорируем ошибку, если колонка уже есть
            if "duplicate column name" in str(e):
                print("ℹ️ button_text_color already exists")
            else:
                print(f"⚠️ Error adding button_text_color: {e}")

        try:
            # Цвет фона кнопки (обычный)
            conn.execute(text("ALTER TABLE content_hero ADD COLUMN button_bg_color VARCHAR DEFAULT 'transparent'"))
            print("✅ Added button_bg_color")
        except Exception as e:
            if "duplicate column name" in str(e):
                print("ℹ️ button_bg_color already exists")
            else:
                print(f"⚠️ Error adding button_bg_color: {e}")

        try:
            # Цвет текста при наведении
            conn.execute(text("ALTER TABLE content_hero ADD COLUMN button_hover_text_color VARCHAR DEFAULT '#000000'"))
            print("✅ Added button_hover_text_color")
        except Exception as e:
            if "duplicate column name" in str(e):
                print("ℹ️ button_hover_text_color already exists")
            else:
                print(f"⚠️ Error adding button_hover_text_color: {e}")

        try:
            # Цвет фона при наведении
            conn.execute(text("ALTER TABLE content_hero ADD COLUMN button_hover_bg_color VARCHAR DEFAULT '#FFFFFF'"))
            print("✅ Added button_hover_bg_color")
        except Exception as e:
            if "duplicate column name" in str(e):
                print("ℹ️ button_hover_bg_color already exists")
            else:
                print(f"⚠️ Error adding button_hover_bg_color: {e}")

        conn.commit()

    print("\n✅ Migration complete!")

if __name__ == "__main__":
    migrate()