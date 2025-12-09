"""
Migration script to create settings table
Run this after updating database.py with Settings model
"""
from database import engine, Base, SessionLocal, Settings

def migrate():
    print("🔄 Creating settings table...")
    
    # Create settings table
    Base.metadata.create_all(bind=engine)
    
    # Create default settings if not exists
    db = SessionLocal()
    try:
        settings = db.query(Settings).filter(Settings.id == 1).first()
        
        if not settings:
            print("📝 Creating default settings...")
            settings = Settings(
                id=1,
                site_name="Orient Watch",
                site_email="info@orient.uz",
                site_phone="+998 71 123 45 67",
                site_address="Ташкент, Узбекистан",
                free_shipping_threshold=100000,
                standard_shipping_cost=50000,
                express_shipping_cost=100000,
                currency_code="UZS",
                currency_symbol="₽",
                facebook_url="https://facebook.com/orient",
                instagram_url="https://instagram.com/orient",
                twitter_url="https://twitter.com/orient"
            )
            db.add(settings)
            db.commit()
            print("✅ Default settings created!")
        else:
            print("✅ Settings table already exists!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("✅ Migration complete!")

if __name__ == "__main__":
    migrate()
