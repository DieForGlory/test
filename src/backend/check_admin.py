"""
Check admin user and test login
"""
from database import SessionLocal, User
from auth import verify_password, get_password_hash
import json

def check_admin():
    """Check admin user in database"""
    db = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("CHECKING ADMIN USER")
        print("="*60)
        
        # Find all users
        all_users = db.query(User).all()
        print(f"\n📊 Total users in database: {len(all_users)}")
        
        for user in all_users:
            print(f"\n👤 User:")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Name: {user.name}")
            print(f"   Role: {user.role}")
            print(f"   Password hash: {user.password_hash[:50]}...")
        
        # Find admin
        admin = db.query(User).filter(
            User.email == "admin@orient.uz",
            User.role == "admin"
        ).first()
        
        if not admin:
            print("\n❌ Admin user NOT FOUND!")
            print("Run: python reset_admin.py")
            return
        
        print("\n" + "="*60)
        print("ADMIN USER FOUND")
        print("="*60)
        print(f"ID: {admin.id}")
        print(f"Email: {admin.email}")
        print(f"Name: {admin.name}")
        print(f"Role: {admin.role}")
        
        # Test password
        print("\n" + "="*60)
        print("TESTING PASSWORD")
        print("="*60)
        
        test_password = "admin123"
        is_valid = verify_password(test_password, admin.password_hash)
        
        if is_valid:
            print(f"✅ Password '{test_password}' is CORRECT")
        else:
            print(f"❌ Password '{test_password}' is INCORRECT")
            print("Run: python reset_admin.py")
        
        # Test hash generation
        print("\n" + "="*60)
        print("TESTING HASH GENERATION")
        print("="*60)
        
        new_hash = get_password_hash(test_password)
        print(f"New hash: {new_hash[:50]}...")
        print(f"Stored hash: {admin.password_hash[:50]}...")
        
        # Verify new hash
        if verify_password(test_password, new_hash):
            print("✅ New hash verification: OK")
        else:
            print("❌ New hash verification: FAILED")
        
        print("\n" + "="*60)
        print("CREDENTIALS TO USE")
        print("="*60)
        print("Email:    admin@orient.uz")
        print("Password: admin123")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_admin()
