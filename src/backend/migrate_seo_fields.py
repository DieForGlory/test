"""
Migration script to add SEO and Facebook meta fields to products table
Run this script to update existing database
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL

def migrate():
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    with engine.connect() as conn:
        # Add SEO fields
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN seo_title VARCHAR"))
            print("✅ Added seo_title column")
        except Exception as e:
            print(f"⚠️  seo_title column already exists or error: {e}")
        
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN seo_description TEXT"))
            print("✅ Added seo_description column")
        except Exception as e:
            print(f"⚠️  seo_description column already exists or error: {e}")
        
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN seo_keywords VARCHAR"))
            print("✅ Added seo_keywords column")
        except Exception as e:
            print(f"⚠️  seo_keywords column already exists or error: {e}")
        
        # Add Facebook Open Graph fields
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN fb_title VARCHAR"))
            print("✅ Added fb_title column")
        except Exception as e:
            print(f"⚠️  fb_title column already exists or error: {e}")
        
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN fb_description TEXT"))
            print("✅ Added fb_description column")
        except Exception as e:
            print(f"⚠️  fb_description column already exists or error: {e}")
        
        conn.commit()
    
    print("\n✅ Migration completed successfully!")
    print("\nNew fields added to products table:")
    print("  - seo_title (VARCHAR)")
    print("  - seo_description (TEXT)")
    print("  - seo_keywords (VARCHAR)")
    print("  - fb_title (VARCHAR)")
    print("  - fb_description (TEXT)")

if __name__ == "__main__":
    print("🔄 Starting migration: Adding SEO and Facebook meta fields...")
    migrate()
