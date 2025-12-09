"""
Reset admin password
Use this script if you can't login to admin panel
"""
from database import SessionLocal, User
from auth import get_password_hash

def reset_admin_password():
    """Reset admin password to default"""
    db = SessionLocal()
    
    try:
        # Find admin user
        admin = db.query(User).filter(
            User.email == "admin@orient.uz",
            User.role == "admin"
        ).first()
        
        if not admin:
            print("❌ Admin user not found!")
            print("Creating new admin user...")
            
            # Create new admin
            admin = User(
                email="admin@orient.uz",
                password_hash=get_password_hash("admin123"),
                name="Admin User",
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created!")
        else:
            # Reset password
            admin.password_hash = get_password_hash("admin123")
            db.commit()
            print("✅ Admin password reset!")
        
        print("\n" + "="*50)
        print("ADMIN CREDENTIALS:")
        print("="*50)
        print("Email:    admin@orient.uz")
        print("Password: admin123")
        print("="*50)
        
        # Test password
        from auth import verify_password
        if verify_password("admin123", admin.password_hash):
            print("✅ Password verification: OK")
        else:
            print("❌ Password verification: FAILED")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Resetting admin password...")
    reset_admin_password()
