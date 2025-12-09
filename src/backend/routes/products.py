"""
Products routes - CRUD operations
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List
import json
from datetime import datetime
from database import get_db, Product
from schemas import ProductCreate, ProductUpdate
from auth import require_admin
from sqlalchemy import func, or_, asc, desc

router = APIRouter()

# Public endpoints

@router.get("/api/products/feed")
async def get_products_feed(db: Session = Depends(get_db)):
    """
    Public product feed - returns all products with full information in JSON format
    """
    products = db.query(Product).filter(Product.in_stock == True).all()

    feed_data = {
        "meta": {
            "total": len(products),
            "generated_at": datetime.utcnow().isoformat(),
            "currency": "RUB",
            "brand": "Orient Watch"
        },
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "collection": product.collection,
                "price": product.price,
                "currency": "RUB",
                "image": product.image,
                "images": json.loads(product.images) if product.images else [],
                "description": product.description,
                "features": json.loads(product.features) if product.features else [],
                "specs": json.loads(product.specs) if product.specs else {},
                "inStock": product.in_stock,
                "stockQuantity": product.stock_quantity,
                "sku": product.sku,
                "isFeatured": product.is_featured,
                "movement": product.movement,
                "caseMaterial": product.case_material,
                "dialColor": product.dial_color,
                "waterResistance": product.water_resistance,
                "seo": {
                    "title": product.seo_title,
                    "description": product.seo_description,
                    "keywords": product.seo_keywords
                },
                "social": {
                    "fbTitle": product.fb_title,
                    "fbDescription": product.fb_description
                },
                "url": f"/product/{product.id}",
                "createdAt": product.created_at.isoformat() if product.created_at else None,
                "updatedAt": product.updated_at.isoformat() if product.updated_at else None
            }
            for product in products
        ]
    }

    return feed_data


@router.get("/api/products")
async def get_products(
        page: int = Query(1, ge=1),
        limit: int = Query(20, ge=1, le=100),
        search: Optional[str] = None,
        collection: Optional[str] = None,

        # Цены (Aliases обязательны!)
        min_price: Optional[float] = Query(None, alias="minPrice"),
        max_price: Optional[float] = Query(None, alias="maxPrice"),

        # Новые фильтры (Aliases обязательны!)
        brand: Optional[str] = None,
        gender: Optional[str] = None,
        min_diameter: Optional[float] = Query(None, alias="minDiameter"),
        max_diameter: Optional[float] = Query(None, alias="maxDiameter"),
        strap_material: Optional[str] = Query(None, alias="strapMaterial"),

        # Существующие фильтры (Aliases обязательны, так как фронт шлет camelCase!)
        movement: Optional[str] = None,  # movement совпадает, alias не критичен, но лучше оставить
        case_material: Optional[str] = Query(None, alias="caseMaterial"),
        dial_color: Optional[str] = Query(None, alias="dialColor"),
        water_resistance: Optional[str] = Query(None, alias="waterResistance"),

        features: Optional[List[str]] = Query(None),
        sort: str = Query('popular'),
        db: Session = Depends(get_db)
):
    """Get all products with filters"""
    query = db.query(Product)

    # --- Search & Collection ---
    if search:
        query = query.filter(or_(Product.name.contains(search), Product.sku.contains(search)))
    if collection:
        query = query.filter(Product.collection == collection)

    # --- Price ---
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # --- New Filters ---
    if brand:
        query = query.filter(Product.brand == brand)
    if gender:
        query = query.filter(Product.gender == gender)
    if min_diameter is not None:
        query = query.filter(Product.case_diameter >= min_diameter)
    if max_diameter is not None:
        query = query.filter(Product.case_diameter <= max_diameter)
    if strap_material:
        query = query.filter(Product.strap_material == strap_material)

    # --- Existing Filters ---
    if movement:
        query = query.filter(Product.movement == movement)
    if case_material:
        query = query.filter(Product.case_material == case_material)
    if dial_color:
        query = query.filter(Product.dial_color == dial_color)
    if water_resistance:
        query = query.filter(Product.water_resistance == water_resistance)

    # --- Features ---
    if features:
        for feature in features:
            query = query.filter(Product.features.contains(feature))

    # --- Sorting ---
    if sort == 'price-asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price-desc':
        query = query.order_by(Product.price.desc())
    elif sort == 'newest':
        query = query.order_by(Product.created_at.desc())
    elif sort == 'name':
        query = query.order_by(Product.name.asc())
    else:
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())

    # --- Pagination ---
    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    return {
        "data": [product.to_dict() for product in products],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/api/products/filters")
async def get_available_filters(db: Session = Depends(get_db)):
    """Get available filter options"""

    def get_options(column):
        results = db.query(column, func.count(Product.id)) \
            .filter(column.isnot(None)) \
            .group_by(column) \
            .all()
        # Сортируем по алфавиту для удобства
        opts = [{"label": str(r[0]), "value": str(r[0]), "count": r[1]} for r in results if r[0]]
        return sorted(opts, key=lambda x: x['label'])

    return {
        "brands": get_options(Product.brand),
        "genders": get_options(Product.gender),
        "strapMaterials": get_options(Product.strap_material),
        "movements": get_options(Product.movement),
        "caseMaterials": get_options(Product.case_material),
        "dialColors": get_options(Product.dial_color),
        "waterResistances": get_options(Product.water_resistance)
    }

# <--- НОВЫЙ ЭНДПОИНТ ДЛЯ АДМИНКИ (ПОЛУЧЕНИЕ ВСЕХ ОСОБЕННОСТЕЙ) --->
@router.get("/api/products/features/unique")
async def get_unique_features(db: Session = Depends(get_db)):
    """Get all unique features from all products (for admin setup)"""
    products = db.query(Product.features).all()

    unique_set = set()
    for p in products:
        if p.features:
            try:
                # Пытаемся распарсить JSON
                feats = json.loads(p.features)
                if isinstance(feats, list):
                    for f in feats:
                        unique_set.add(f.strip())
            except:
                pass

    return sorted(list(unique_set))

@router.get("/api/products/{product_id}")
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product by ID (public)"""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product.to_dict()

# Admin endpoints
@router.get("/api/admin/products")
async def get_all_products_admin(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    collection: Optional[str] = None,
    brand: Optional[str] = None,  # <--- ДОБАВЛЕНО
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get all products with filters (admin)"""
    query = db.query(Product)

    if search:
        query = query.filter(
            or_(
                Product.name.contains(search),
                Product.sku.contains(search)
            )
        )

    if collection:
        query = query.filter(Product.collection == collection)

    # <--- ДОБАВЛЕНО: Фильтрация по бренду
    if brand:
        query = query.filter(Product.brand == brand)

    # Сортировка по дате создания (новые сверху)
    query = query.order_by(Product.created_at.desc())

    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    data = [product.to_dict() for product in products]

    return {
        "data": data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }

@router.get("/api/admin/products/{product_id}")
async def get_product_admin(
    product_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get product by ID (admin)"""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product.to_dict()

@router.post("/api/admin/products")
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    if product.sku:
        existing = db.query(Product).filter(Product.sku == product.sku).first()
        if existing:
            raise HTTPException(status_code=409, detail="SKU already exists")

    product_id = product.name.lower().replace(" ", "-").replace("&", "and")
    existing_id = db.query(Product).filter(Product.id == product_id).first()
    if existing_id:
        import uuid
        product_id = f"{product_id}-{str(uuid.uuid4())[:8]}"

    db_product = Product(
        id=product_id,
        name=product.name,
        collection=product.collection,
        price=product.price,
        image=product.image,
        images=json.dumps(product.images),
        description=product.description,
        features=json.dumps(product.features),
        specs=json.dumps(product.specs),
        in_stock=product.inStock,
        stock_quantity=product.stockQuantity,
        sku=product.sku,
        # Новые поля
        brand=product.brand,
        gender=product.gender,
        case_diameter=product.caseDiameter,
        strap_material=product.strapMaterial,
        # Существующие поля
        movement=product.movement,
        case_material=product.caseMaterial,
        dial_color=product.dialColor,
        water_resistance=product.waterResistance,
        # SEO & FB
        seo_title=product.seoTitle,
        seo_description=product.seoDescription,
        seo_keywords=product.seoKeywords,
        fb_title=product.fbTitle,
        fb_description=product.fbDescription,
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product.to_dict()

@router.put("/api/admin/products/{product_id}")
async def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.dict(exclude_unset=True)

    for key, value in update_data.items():
        # Special mappings
        if key in ["images", "features", "specs"] and value is not None:
            setattr(db_product, key, json.dumps(value))
        # CamelCase to snake_case mappings
        elif key == "inStock": setattr(db_product, "in_stock", value)
        elif key == "stockQuantity": setattr(db_product, "stock_quantity", value)
        # New filters
        elif key == "caseDiameter": setattr(db_product, "case_diameter", value)
        elif key == "strapMaterial": setattr(db_product, "strap_material", value)
        # Existing filters
        elif key == "caseMaterial": setattr(db_product, "case_material", value)
        elif key == "dialColor": setattr(db_product, "dial_color", value)
        elif key == "waterResistance": setattr(db_product, "water_resistance", value)
        # SEO & FB
        elif key == "seoTitle": setattr(db_product, "seo_title", value)
        elif key == "seoDescription": setattr(db_product, "seo_description", value)
        elif key == "seoKeywords": setattr(db_product, "seo_keywords", value)
        elif key == "fbTitle": setattr(db_product, "fb_title", value)
        elif key == "fbDescription": setattr(db_product, "fb_description", value)
        else:
            setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product.to_dict()

@router.delete("/api/admin/products/{product_id}")
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete product (admin)"""
    db_product = db.query(Product).filter(Product.id == product_id).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()

    return {"message": "Product deleted", "id": product_id}