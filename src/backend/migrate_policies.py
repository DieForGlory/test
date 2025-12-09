"""
Migration: Create and seed policies table
"""
from database import engine, Base, SessionLocal, ContentPolicy


def migrate():
    print("🔄 Creating policies table...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Список страниц для создания
        policies = [
            {
                "slug": "privacy",
                "title": "Политика конфиденциальности",
                "content": "<p>Здесь будет текст политики конфиденциальности...</p>"
            },
            {
                "slug": "warranty",
                "title": "Гарантия качества",
                "content": "<p>Информация о гарантийном обслуживании...</p>"
            },
            {
                "slug": "return",
                "title": "Возврат и обмен",
                "content": "<p>Условия возврата товара...</p>"
            },
            {
                "slug": "delivery",
                "title": "Доставка и оплата",
                "content": "<p>Информация о доставке...</p>"
            }
        ]

        for p_data in policies:
            existing = db.query(ContentPolicy).filter(ContentPolicy.slug == p_data["slug"]).first()
            if not existing:
                print(f"📝 Creating {p_data['slug']}...")
                policy = ContentPolicy(
                    slug=p_data["slug"],
                    title=p_data["title"],
                    content=p_data["content"]
                )
                db.add(policy)
            else:
                print(f"✅ {p_data['slug']} already exists")

        db.commit()
        print("✅ Migration complete!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    migrate()