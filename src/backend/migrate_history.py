"""
Migration script to add history events table and seed data
"""
from database import engine, Base, SessionLocal, ContentHistoryEvent


def migrate():
    print("🔄 Starting history table migration...")

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if data exists
        if db.query(ContentHistoryEvent).count() > 0:
            print("⚠️  History events already exist. Skipping seed.")
            return

        print("📝 Seeding default history events...")
        events = [
            ContentHistoryEvent(
                year="1950",
                title="ОСНОВАНИЕ",
                description="Orient Watch Company была основана в Токио с миссией создавать доступные, но качественные механические часы для японского рынка. С самого начала компания фокусировалась на собственном производстве механизмов.",
                image="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80",
                order=1
            ),
            ContentHistoryEvent(
                year="1970",
                title="ТЕХНОЛОГИЧЕСКИЙ ПРОРЫВ",
                description="Запуск собственного автоматического механизма Orient 46 серии, который стал основой для многих будущих моделей. Этот механизм отличался надежностью и точностью хода.",
                image="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
                order=2
            ),
            ContentHistoryEvent(
                year="1990",
                title="МИРОВОЕ ПРИЗНАНИЕ",
                description="Orient выходит на международный рынок и получает признание за качество своих механических часов. Запуск культовой коллекции Bambino, которая становится символом доступной элегантности.",
                image="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
                order=3
            ),
            ContentHistoryEvent(
                year="2009",
                title="НОВАЯ ЭРА",
                description="Orient присоединяется к Seiko Epson Corporation, получая доступ к передовым технологиям, сохраняя при этом свою уникальную идентичность и независимость в дизайне.",
                image="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80",
                order=4
            ),
            ContentHistoryEvent(
                year="2025",
                title="СОВРЕМЕННОСТЬ",
                description="Сегодня Orient продолжает традиции японского часового мастерства, создавая механические часы высочайшего качества. Каждая модель сочетает проверенные временем технологии с современным дизайном.",
                image="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
                order=5
            )
        ]

        for event in events:
            db.add(event)

        db.commit()
        print("✅ Default history events created!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

    print("✅ Migration complete!")


if __name__ == "__main__":
    migrate()