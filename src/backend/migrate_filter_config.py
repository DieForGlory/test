"""
Migration: Add filter_config to Settings table
"""
from database import engine, SessionLocal, Settings
from sqlalchemy import text
import json


def migrate():
    print("🔄 Adding filter_config column to settings...")

    with engine.connect() as conn:
        try:
            # SQLite specific syntax for adding column
            conn.execute(text("ALTER TABLE settings ADD COLUMN filter_config TEXT"))
            print("✅ Column added")
        except Exception as e:
            print(f"⚠️ Column might already exist: {e}")

    # Set default value
    db = SessionLocal()
    try:
        settings = db.query(Settings).filter(Settings.id == 1).first()
        if settings:
            default_config = {
                "priceRanges": [
                    {"id": "1", "label": "До 1 000 000 сум", "min": 0, "max": 1000000},
                    {"id": "2", "label": "1 000 000 - 3 000 000 сум", "min": 1000000, "max": 3000000},
                    {"id": "3", "label": "От 3 000 000 сум", "min": 3000000, "max": 0}
                ]
            }
            if not settings.filter_config:
                settings.filter_config = json.dumps(default_config, ensure_ascii=False)
                db.commit()
                print("✅ Default configuration set")
    finally:
        db.close()


if __name__ == "__main__":
    migrate()