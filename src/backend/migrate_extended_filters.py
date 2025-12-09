"""
Migration script to add extended filter columns to products table
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL


def migrate():
    print("🔄 Starting extended filters migration...")

    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

    with engine.connect() as conn:
        # 1. Brand
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN brand VARCHAR DEFAULT 'Orient'"))
            print("✅ Added brand column")
        except Exception as e:
            print(f"ℹ️  brand column might already exist: {e}")

        # 2. Gender
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN gender VARCHAR"))
            print("✅ Added gender column")
        except Exception as e:
            print(f"ℹ️  gender column might already exist: {e}")

        # 3. Case Diameter (Float for range filtering)
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN case_diameter FLOAT"))
            print("✅ Added case_diameter column")
        except Exception as e:
            print(f"ℹ️  case_diameter column might already exist: {e}")

        # 4. Strap Material
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN strap_material VARCHAR"))
            print("✅ Added strap_material column")
        except Exception as e:
            print(f"ℹ️  strap_material column might already exist: {e}")

        conn.commit()

    print("\n✅ Migration completed successfully!")


if __name__ == "__main__":
    migrate()