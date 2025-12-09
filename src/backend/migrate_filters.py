"""
Migration script to add filter fields to existing products
"""
from database import SessionLocal, Product, init_db
from sqlalchemy import text

def migrate():
    print("🔄 Starting filter fields migration...")
    
    # Initialize DB (creates new tables if needed)
    init_db()
    print("✅ Database tables initialized")
    
    db = SessionLocal()
    
    try:
        # Add sample filter data to existing products
        products = db.query(Product).all()
        
        if not products:
            print("⚠️  No products found in database")
            return
        
        print(f"📦 Found {len(products)} products")
        
        # Sample filter values
        movements = ["automatic", "mechanical"]
        materials = ["steel", "titanium"]
        colors = ["black", "blue", "white", "green"]
        water_res = ["200m", "100m", "50m"]
        
        for i, product in enumerate(products):
            # Assign filter values based on product index
            product.movement = movements[i % len(movements)]
            product.case_material = materials[i % len(materials)]
            product.dial_color = colors[i % len(colors)]
            product.water_resistance = water_res[i % len(water_res)]
            
            print(f"  ✓ Updated {product.name}")
            print(f"    - Movement: {product.movement}")
            print(f"    - Material: {product.case_material}")
            print(f"    - Color: {product.dial_color}")
            print(f"    - Water resistance: {product.water_resistance}")
        
        db.commit()
        print("\n✅ Migration completed successfully!")
        print(f"✅ Updated {len(products)} products with filter data")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
