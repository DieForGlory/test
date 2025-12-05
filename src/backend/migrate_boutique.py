"""
Migration script to add boutique content table
"""
from database import engine, Base, SessionLocal, ContentBoutique
import json


def migrate():
    print("🔄 Creating boutique content table...")

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        content = db.query(ContentBoutique).filter(ContentBoutique.id == 1).first()

        if not content:
            print("📝 Seeding default boutique data...")
            default_services = [
                {"id": "1", "title": "Персональная консультация", "description": "Помощь в выборе идеальных часов"},
                {"id": "2", "title": "Сервисное обслуживание", "description": "Ремонт и обслуживание ваших часов"},
            ]

            boutique = ContentBoutique(
                id=1,
                hero_title="ФЛАГМАНСКИЙ БУТИК",
                hero_description="Погрузитесь в мир японского часового искусства в центре города.",
                hero_image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
                info_heading="Атмосфера",
                info_hours="Пн-Вс: 10:00 - 22:00",
                info_text="Наш бутик — это пространство, где время замедляет свой ход...",
                services=json.dumps(default_services)
            )
            db.add(boutique)
            db.commit()
            print("✅ Default data created!")
        else:
            print("✅ Table already exists.")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    migrate()