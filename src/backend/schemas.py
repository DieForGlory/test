"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict
class HistoryEventBase(BaseModel):
    year: str
    title: str
    description: str
    image: str
    order: int

class HistoryEventCreate(HistoryEventBase):
    pass
# Boutique Schemas
class BoutiqueHero(BaseModel):
    title: str
    description: str
    coverImage: str

class BoutiqueInfoBlock(BaseModel):
    heading: str
    text: str
    hours: str
    image: str
    imagePosition: str
class PolicyData(BaseModel):
    title: str
    content: str
class ServiceItem(BaseModel):
    id: str
    title: str
    description: str

class GalleryItem(BaseModel):
    id: str
    url: str

class BoutiquePageData(BaseModel):
    hero: BoutiqueHero
    infoBlock: BoutiqueInfoBlock
    services: List[ServiceItem]
    gallery: List[GalleryItem]
class HistoryEventUpdate(BaseModel):
    year: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    order: Optional[int] = None
# Product schemas
class ProductBase(BaseModel):
    name: str
    collection: str
    price: float
    image: Optional[str] = None
    images: Optional[List[str]] = []
    description: Optional[str] = None
    features: Optional[List[str]] = []
    specs: Optional[Dict[str, str]] = {}
    inStock: bool = True
    stockQuantity: int = 0
    sku: Optional[str] = None

    # Новые фильтры
    brand: Optional[str] = "Orient"
    gender: Optional[str] = None
    caseDiameter: Optional[float] = None
    strapMaterial: Optional[str] = None

    # Существующие фильтры (добавляем их в схему, чтобы API их принимал)
    movement: Optional[str] = None
    caseMaterial: Optional[str] = None
    dialColor: Optional[str] = None
    waterResistance: Optional[str] = None

    # SEO fields
    seoTitle: Optional[str] = None
    seoDescription: Optional[str] = None
    seoKeywords: Optional[str] = None
    # Facebook Open Graph fields
    fbTitle: Optional[str] = None
    fbDescription: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    collection: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    specs: Optional[Dict[str, str]] = None
    inStock: Optional[bool] = None
    stockQuantity: Optional[int] = None

    # Новые фильтры
    brand: Optional[str] = None
    gender: Optional[str] = None
    caseDiameter: Optional[float] = None
    strapMaterial: Optional[str] = None

    # Существующие фильтры
    movement: Optional[str] = None
    caseMaterial: Optional[str] = None
    dialColor: Optional[str] = None
    waterResistance: Optional[str] = None

    # SEO & FB
    seoTitle: Optional[str] = None
    seoDescription: Optional[str] = None
    seoKeywords: Optional[str] = None
    fbTitle: Optional[str] = None
    fbDescription: Optional[str] = None

# Collection schemas
class CollectionBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    number: Optional[str] = None
    active: bool = True
    brand: str = "Orient"

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    number: Optional[str] = None
    active: Optional[bool] = None
    brand: Optional[str] = None

# Order schemas
class OrderItem(BaseModel):
    productId: str
    quantity: int
    price: float

class CustomerData(BaseModel):
    fullName: str
    email: EmailStr
    phone: str

class DeliveryAddress(BaseModel):
    address: str
    city: str
    postalCode: str
    country: str

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer: CustomerData
    deliveryMethod: str
    paymentMethod: str
    deliveryAddress: Optional[DeliveryAddress] = None
    subtotal: float
    shipping: float
    total: float
    notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

# Content schemas
class HeroContent(BaseModel):
    title: str
    subtitle: str
    image: str
    mobileImage: Optional[str] = ""
    ctaText: str
    ctaLink: str
    # Цвета (опциональны, чтобы не ломать старые запросы)
    buttonTextColor: Optional[str] = "#FFFFFF"
    buttonBgColor: Optional[str] = "transparent"
    buttonHoverTextColor: Optional[str] = "#000000"
    buttonHoverBgColor: Optional[str] = "#FFFFFF"

class PromoBanner(BaseModel):
    text: str
    code: str
    active: bool
    backgroundColor: str
    textColor: str
    highlightColor: str

class FeaturedWatch(BaseModel):
    productId: str
    order: int
    isNew: bool

class HeritageSection(BaseModel):
    title: str
    subtitle: str
    description: str
    ctaText: str
    ctaLink: str
    yearsText: str

# Booking schemas
class BookingCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    date: str
    time: str
    message: Optional[str] = None
    boutique: Optional[str] = "Orient Ташкент"

class BookingUpdate(BaseModel):
    status: str  # pending, confirmed, completed, cancelled

class BookingResponse(BaseModel):
    id: int
    booking_number: str
    name: str
    phone: str
    email: str
    date: str
    time: str
    message: Optional[str]
    status: str
    boutique: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
class PromoCodeBase(BaseModel):
    code: str
    discount_percent: float
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    applicable_products: List[str] = []
    applicable_collections: List[str] = []
    active: bool = True

class PromoCodeCreate(PromoCodeBase):
    pass

class PromoCodeUpdate(PromoCodeBase):
    pass

class PromoCodeResponse(PromoCodeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True