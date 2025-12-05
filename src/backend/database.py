"""
Database configuration and connection
SQLite database with SQLAlchemy ORM
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON,BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json

# Database URL
DATABASE_URL = "sqlite:////var/www/orient/src/backend/orient.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="user")  # user, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    collection = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    image = Column(String)
    images = Column(Text)  # JSON array
    description = Column(Text)
    features = Column(Text)  # JSON array
    specs = Column(Text)  # JSON object
    in_stock = Column(Boolean, default=True)
    stock_quantity = Column(Integer, default=0)
    sku = Column(String, unique=True)
    is_featured = Column(Boolean, default=False)
    
    # Filter fields
    movement = Column(String, index=True)  # automatic, mechanical, quartz
    case_material = Column(String, index=True)  # steel, titanium, gold
    dial_color = Column(String, index=True)  # black, blue, white, green, etc
    water_resistance = Column(String, index=True)  # 200m, 100m, 50m
    
    # SEO fields
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    seo_keywords = Column(String, nullable=True)
    
    # Facebook Open Graph fields
    fb_title = Column(String, nullable=True)
    fb_description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "collection": self.collection,
            "price": self.price,
            "image": self.image,
            "images": json.loads(self.images) if self.images else [],
            "description": self.description,
            "features": json.loads(self.features) if self.features else [],
            "specs": json.loads(self.specs) if self.specs else {},
            "inStock": self.in_stock,
            "stockQuantity": self.stock_quantity,
            "sku": self.sku,
            "isFeatured": self.is_featured,
            "movement": self.movement,
            "caseMaterial": self.case_material,
            "dialColor": self.dial_color,
            "waterResistance": self.water_resistance,
            "seoTitle": self.seo_title,
            "seoDescription": self.seo_description,
            "seoKeywords": self.seo_keywords,
            "fbTitle": self.fb_title,
            "fbDescription": self.fb_description,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class ContentBoutique(Base):
    __tablename__ = "content_boutique"

    id = Column(Integer, primary_key=True, default=1)

    # Hero section
    hero_title = Column(String, default="ФЛАГМАНСКИЙ БУТИК")
    hero_description = Column(Text, default="Погрузитесь в мир японского часового искусства в центре города.")
    hero_image = Column(String, default="")

    # Info Block
    info_heading = Column(String, default="Атмосфера")
    info_text = Column(Text, default="Наш бутик — это не просто магазин...")
    info_image = Column(String, default="")
    info_image_position = Column(String, default="right")
    info_hours = Column(String, default="Пн-Вс: 10:00 - 22:00")
    # JSON fields for arrays
    services = Column(Text, default="[]")  # JSON list of services
    gallery = Column(Text, default="[]")  # JSON list of images

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    payme_trans_id = Column(String, unique=True, index=True)  # ID транзакции из Payme
    time = Column(BigInteger)  # Время создания (timestamp ms)
    amount = Column(Integer)
    account = Column(Text)  # JSON с параметрами аккаунта (order_id)
    create_time = Column(BigInteger)
    perform_time = Column(BigInteger, default=0)
    cancel_time = Column(BigInteger, default=0)
    state = Column(Integer)
    reason = Column(Integer, nullable=True)

    # Связь с заказом (по order_id строковому)
    order_id = Column(String, ForeignKey("orders.order_number"))
class ContentPolicy(Base):
    __tablename__ = "content_policies"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)  # 'privacy', 'warranty', etc.
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # Можно хранить HTML или Markdown
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContentHistoryEvent(Base):
    __tablename__ = "content_history_events"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image = Column(String, nullable=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    image = Column(String)
    number = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FilterOption(Base):
    __tablename__ = "filter_options"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)  # movement, case_material, dial_color, water_resistance
    label = Column(String, nullable=False)
    value = Column(String, nullable=False)
    order = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_data = Column(Text)  # JSON object
    items = Column(Text)  # JSON array
    subtotal = Column(Float, nullable=False)
    shipping = Column(Float, default=0)
    total = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, cancelled
    payment_method = Column(String)
    delivery_method = Column(String)
    delivery_address = Column(Text)  # JSON object
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_number = Column(String, unique=True, index=True)
    name = Column(String)
    phone = Column(String)
    email = Column(String)
    date = Column(String)
    time = Column(String)
    message = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    boutique = Column(String, default="Orient Ташкент")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContentSiteLogo(Base):
    __tablename__ = "content_site_logo"
    
    id = Column(Integer, primary_key=True, default=1)
    logo_url = Column(String, nullable=False)
    logo_dark_url = Column(String, nullable=True)  # For dark backgrounds
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContentHero(Base):
    __tablename__ = "content_hero"

    id = Column(Integer, primary_key=True, default=1)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=False)
    image = Column(String, nullable=False)
    mobile_image = Column(String, default="")
    cta_text = Column(String, nullable=False)
    cta_link = Column(String, nullable=False)

    # Новые поля для цветов
    button_text_color = Column(String, default="#FFFFFF")
    button_bg_color = Column(String, default="transparent")
    button_hover_text_color = Column(String, default="#000000")
    button_hover_bg_color = Column(String, default="#FFFFFF")

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContentPromoBanner(Base):
    __tablename__ = "content_promo_banner"
    
    id = Column(Integer, primary_key=True, default=1)
    text = Column(String, nullable=False)
    code = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    background_color = Column(String, default="#000000")
    text_color = Column(String, default="#FFFFFF")
    highlight_color = Column(String, default="#C8102E")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContentHeritage(Base):
    __tablename__ = "content_heritage"
    
    id = Column(Integer, primary_key=True, default=1)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    cta_text = Column(String, nullable=False)
    cta_link = Column(String, nullable=False)
    years_text = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, default=1)
    # Site info
    site_name = Column(String, default="Orient Watch")
    site_email = Column(String, default="info@orient.uz")
    site_phone = Column(String, default="+998 71 123 45 67")
    site_address = Column(String, default="Ташкент, Узбекистан")
    
    # Shipping
    free_shipping_threshold = Column(Float, default=100000)
    standard_shipping_cost = Column(Float, default=50000)
    express_shipping_cost = Column(Float, default=100000)
    
    # Currency
    currency_code = Column(String, default="UZS")
    currency_symbol = Column(String, default="₽")
    
    # Social media
    facebook_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    filter_config = Column(Text, nullable=True)  # Добавлено
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)