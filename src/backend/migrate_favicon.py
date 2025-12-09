"""
Migration script: Add favicon_url to ContentSiteLogo table
"""
from database import engine, init_db
from sqlalchemy import text


def migrate():
    print("🔄 Initializing database tables...")
    init_db()

    print("🔄 Adding favicon_url column to content_site_logo table...")

    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE content_site_logo ADD COLUMN favicon_url VARCHAR DEFAULT ''"))
            print("✅ Added favicon_url column")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️ favicon_url column already exists")
            else:
                print(f"⚠️ Error adding favicon_url: {e}")

        conn.commit()

    print("\n✅ Migration complete!")


if __name__ == "__main__":
    migrate()