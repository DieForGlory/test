"""
Initialize database with tables and default data
Run this script once to set up the database
"""
from database import init_db, SessionLocal, User, Product, Collection
from database import ContentHero, ContentPromoBanner, ContentHeritage
from auth import get_password_hash
import json

def create_default_data():
    """Create default data for testing"""
    db = SessionLocal()
    
    try:
        print("Creating admin user...")
        # Create admin user
        admin = User(
            email="admin@orient.uz",
            password_hash=get_password_hash("admin123"),
            name="Admin User",
            role="admin"
        )
        db.add(admin)
        
        print("Creating collections...")
        # Create collections
        collections = [
            Collection(
                id="sports",
                name="SPORTS",
                description="Профессиональные дайверские часы с непревзойденной надежностью и водонепроницаемостью до 200 метров.",
                image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                number="01",
                active=True
            ),
            Collection(
                id="classic",
                name="CLASSIC",
                description="Элегантные часы для особых случаев, сочетающие классический дизайн и современные технологии.",
                image="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
                number="02",
                active=True
            ),
            Collection(
                id="contemporary",
                name="CONTEMPORARY",
                description="Современные часы с инновационным дизайном для активного образа жизни.",
                image="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80",
                number="03",
                active=True
            )
        ]
        
        for col in collections:
            db.add(col)
        
        print("Creating products...")
        # Create sample products
        products = [
            Product(
                id="kamasu-automatic-diver",
                name="Kamasu Automatic Diver",
                collection="SPORTS",
                price=45900,
                image="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80",
                images=json.dumps([
                    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80",
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
                ]),
                description="Профессиональные дайверские часы с непревзойденной надежностью и стильным дизайном.",
                features=json.dumps([
                    "Автоматический механизм Orient F6922",
                    "Водонепроницаемость 200 метров (ISO 6425)",
                    "Односторонний вращающийся безель",
                    "Сапфировое стекло с AR покрытием"
                ]),
                specs=json.dumps({
                    "Механизм": "Автоматический Orient F6922",
                    "Корпус": "Нержавеющая сталь 316L",
                    "Диаметр": "41.8 мм",
                    "Водонепроницаемость": "200 метров",
                    "Стекло": "Сапфировое",
                    "Гарантия": "2 года"
                }),
                in_stock=True,
                stock_quantity=15,
                sku="RA-AA0004E19B",
                is_featured=True
            ),
            Product(
                id="bambino-classic",
                name="Bambino Classic",
                collection="CLASSIC",
                price=32900,
                image="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80",
                images=json.dumps([
                    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80"
                ]),
                description="Элегантные классические часы с автоматическим механизмом.",
                features=json.dumps([
                    "Автоматический механизм",
                    "Классический дизайн",
                    "Кожаный ремешок"
                ]),
                specs=json.dumps({
                    "Механизм": "Автоматический",
                    "Корпус": "Нержавеющая сталь",
                    "Диаметр": "40.5 мм"
                }),
                in_stock=True,
                stock_quantity=20,
                sku="RA-AC0001S10B",
                is_featured=True
            ),
            Product(
                id="mako-iii-automatic",
                name="Mako III Automatic",
                collection="SPORTS",
                price=41900,
                image="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80",
                images=json.dumps([
                    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80"
                ]),
                description="Надежные дайверские часы с автоматическим механизмом.",
                features=json.dumps([
                    "Автоматический механизм",
                    "Водонепроницаемость 200м",
                    "Светящиеся стрелки"
                ]),
                specs=json.dumps({
                    "Механизм": "Автоматический",
                    "Водонепроницаемость": "200 метров"
                }),
                in_stock=True,
                stock_quantity=10,
                sku="RA-AA0003L19B",
                is_featured=True
            ),
            Product(
                id="sun-moon-classic",
                name="Sun & Moon Classic",
                collection="CLASSIC",
                price=67900,
                image="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80",
                images=json.dumps([
                    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80"
                ]),
                description="Элегантные часы с индикатором фаз луны.",
                features=json.dumps([
                    "Индикатор фаз луны",
                    "Автоматический механизм",
                    "Премиум дизайн"
                ]),
                specs=json.dumps({
                    "Механизм": "Автоматический",
                    "Функции": "Фазы луны"
                }),
                in_stock=True,
                stock_quantity=8,
                sku="RA-AK0305S10B",
                is_featured=True
            ),
            Product(
                id="ray-ii-automatic",
                name="Ray II Automatic",
                collection="SPORTS",
                price=38900,
                image="https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&q=80",
                images=json.dumps([
                    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&q=80"
                ]),
                description="Классические дайверские часы.",
                features=json.dumps([
                    "Автоматический механизм",
                    "Водонепроницаемость 200м"
                ]),
                specs=json.dumps({
                    "Механизм": "Автоматический"
                }),
                in_stock=True,
                stock_quantity=12,
                sku="RA-AA0002L19B",
                is_featured=False
            ),
            Product(
                id="defender-chronograph",
                name="Defender Chronograph",
                collection="CONTEMPORARY",
                price=52900,
                image="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
                images=json.dumps([
                    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80"
                ]),
                description="Современный хронограф для активного образа жизни.",
                features=json.dumps([
                    "Хронограф",
                    "Кварцевый механизм",
                    "Спортивный дизайн"
                ]),
                specs=json.dumps({
                    "Механизм": "Кварцевый",
                    "Функции": "Хронограф"
                }),
                in_stock=True,
                stock_quantity=18,
                sku="RA-KV0001L19B",
                is_featured=True
            )
        ]
        
        for product in products:
            db.add(product)
        
        print("Creating default content...")
        # Create default hero content
        hero = ContentHero(
            id=1,
            title="НАЙДИТЕ\nИДЕАЛЬНЫЕ\nЧАСЫ.",
            subtitle="Японское мастерство и точность в каждой детали",
            image="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
            cta_text="Смотреть коллекцию",
            cta_link="/catalog"
        )
        db.add(hero)
        
        # Create default promo banner
        promo = ContentPromoBanner(
            id=1,
            text="СКИДКА 15% НА ВСЕ ЧАСЫ С КОДОМ",
            code="PRE2025",
            active=True,
            background_color="#000000",
            text_color="#FFFFFF",
            highlight_color="#C8102E"
        )
        db.add(promo)
        
        # Create default heritage content
        heritage = ContentHeritage(
            id=1,
            title="75 лет\nмастерства",
            subtitle="С 1950 года",
            description="Orient создает механические часы высочайшего качества, объединяя традиционное японское мастерство с современными технологиями.",
            cta_text="Узнать историю",
            cta_link="/history",
            years_text="75"
        )
        db.add(heritage)
        
        db.commit()
        print("✅ Database initialized successfully!")
        print("\n" + "="*50)
        print("DEFAULT CREDENTIALS:")
        print("="*50)
        print("Email:    admin@orient.uz")
        print("Password: admin123")
        print("="*50)
        print("\n✅ 6 products created")
        print("✅ 3 collections created")
        print("✅ Default content created")
        print("\nYou can now start the server with: python main.py")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("\nCreating default data...")
    create_default_data()