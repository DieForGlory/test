"""
Settings routes - Site configuration
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from database import get_db, Settings
from auth import require_admin

router = APIRouter()

# Pydantic models
class SiteInfo(BaseModel):
    name: str
    email: str
    phone: str
    address: str

class ShippingInfo(BaseModel):
    freeShippingThreshold: float
    standardCost: float
    expressCost: float

class CurrencyInfo(BaseModel):
    code: str
    symbol: str

class SocialInfo(BaseModel):
    facebook: str
    instagram: str
    twitter: str

class PriceRange(BaseModel):
    id: str
    label: str
    min: float
    max: float

class FilterConfig(BaseModel):
    priceRanges: list[PriceRange]
    enabledFeatures: list[str] = [] # <--- ДОБАВЛЕНО

class SettingsData(BaseModel):
    site: SiteInfo
    shipping: ShippingInfo
    currency: CurrencyInfo
    social: SocialInfo
    filterConfig: FilterConfig

# Admin endpoints
@router.get("/api/admin/settings")
async def get_settings(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get site settings (admin)"""
    settings = db.query(Settings).filter(Settings.id == 1).first()

    if not settings:
        settings = Settings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Parse filter config
    try:
        filter_config = json.loads(settings.filter_config) if settings.filter_config else {"priceRanges": [], "enabledFeatures": []}
        # Убедимся, что ключ есть, даже если JSON старый
        if "enabledFeatures" not in filter_config:
            filter_config["enabledFeatures"] = []
    except:
        filter_config = {"priceRanges": [], "enabledFeatures": []}

    return {
        "site": {
            "name": settings.site_name,
            "email": settings.site_email,
            "phone": settings.site_phone,
            "address": settings.site_address
        },
        "shipping": {
            "freeShippingThreshold": settings.free_shipping_threshold,
            "standardCost": settings.standard_shipping_cost,
            "expressCost": settings.express_shipping_cost
        },
        "currency": {
            "code": settings.currency_code,
            "symbol": settings.currency_symbol
        },
        "social": {
            "facebook": settings.facebook_url or "",
            "instagram": settings.instagram_url or "",
            "twitter": settings.twitter_url or ""
        },
        "filterConfig": filter_config
    }

@router.put("/api/admin/settings")
async def update_settings(
    data: SettingsData,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update site settings (admin)"""
    settings = db.query(Settings).filter(Settings.id == 1).first()

    if not settings:
        settings = Settings(id=1)
        db.add(settings)

    # Update site info
    settings.site_name = data.site.name
    settings.site_email = data.site.email
    settings.site_phone = data.site.phone
    settings.site_address = data.site.address

    # Update shipping
    settings.free_shipping_threshold = data.shipping.freeShippingThreshold
    settings.standard_shipping_cost = data.shipping.standardCost
    settings.express_shipping_cost = data.shipping.expressCost

    # Update currency
    settings.currency_code = data.currency.code
    settings.currency_symbol = data.currency.symbol

    # Update social
    settings.facebook_url = data.social.facebook
    settings.instagram_url = data.social.instagram
    settings.twitter_url = data.social.twitter

    # Update filter config
    settings.filter_config = json.dumps(data.filterConfig.dict(), ensure_ascii=False)

    db.commit()

    return {"message": "Settings updated successfully"}

# Public endpoints
@router.get("/api/settings/currency")
async def get_currency(db: Session = Depends(get_db)):
    """Get currency settings (public)"""
    settings = db.query(Settings).filter(Settings.id == 1).first()

    if not settings:
        return {
            "code": "UZS",
            "symbol": "₽"
        }

    return {
        "code": settings.currency_code,
        "symbol": settings.currency_symbol
    }

@router.get("/api/settings/site")
async def get_site_info(db: Session = Depends(get_db)):
    """Get site information (public)"""
    settings = db.query(Settings).filter(Settings.id == 1).first()

    if not settings:
        return {
            "name": "Orient Watch",
            "email": "info@orient.uz",
            "phone": "+998 71 123 45 67",
            "address": "Ташкент, Узбекистан"
        }

    return {
        "name": settings.site_name,
        "email": settings.site_email,
        "phone": settings.site_phone,
        "address": settings.site_address
    }

@router.get("/api/settings/social")
async def get_social_links(db: Session = Depends(get_db)):
    """Get social media links (public)"""
    settings = db.query(Settings).filter(Settings.id == 1).first()

    if not settings:
        return {
            "facebook": "https://facebook.com/orient",
            "instagram": "https://instagram.com/orient",
            "twitter": "https://twitter.com/orient"
        }

    return {
        "facebook": settings.facebook_url or "",
        "instagram": settings.instagram_url or "",
        "twitter": settings.twitter_url or ""
    }

@router.get("/api/settings/shipping")
async def get_shipping_info(db: Session = Depends(get_db)):
    """Get shipping settings (public)"""
    settings = db.query(Settings).filter(Settings.id == 1).first()

    if not settings:
        return {
            "freeShippingThreshold": 100000,
            "standardCost": 50000,
            "expressCost": 100000
        }

    return {
        "freeShippingThreshold": settings.free_shipping_threshold,
        "standardCost": settings.standard_shipping_cost,
        "expressCost": settings.express_shipping_cost
    }

@router.get("/api/settings/filters")
async def get_filter_settings(db: Session = Depends(get_db)):
    """Get public filter settings"""
    settings = db.query(Settings).filter(Settings.id == 1).first()
    if not settings or not settings.filter_config:
        return {"priceRanges": [], "enabledFeatures": []}

    try:
        data = json.loads(settings.filter_config)
        if "enabledFeatures" not in data:
            data["enabledFeatures"] = []
        return data
    except:
        return {"priceRanges": [], "enabledFeatures": []}