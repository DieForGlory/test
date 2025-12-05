from database import engine, Base

def migrate():
    print("Creating transactions table...")
    Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    migrate()