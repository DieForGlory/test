"""
Orient Watch - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from database import init_db
from routes import admin, products, collections, orders, content, upload, bookings, products_export, settings, payme, promocodes

# Load environment variables
load_dotenv()

# Initialize database
init_db()

app = FastAPI(
    title="Orient Watch API",
    description="API for Orient Watch e-commerce platform",
    version="1.0.0"
)

# CORS - Get allowed origins from environment variable
# Default includes localhost and common Visual Studio Code ports
cors_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,http://localhost:5174,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:5174,http://127.0.0.1:8080"
)
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

print(f"🌐 CORS enabled for origins: {allowed_origins}")

# CORS middleware - MUST be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers BEFORE mounting static files
app.include_router(admin.router)
app.include_router(products_export.router)
app.include_router(products.router)
app.include_router(collections.router)
app.include_router(orders.router)
app.include_router(content.router)
app.include_router(upload.router)
app.include_router(bookings.router)
app.include_router(settings.router)
app.include_router(payme.router)
app.include_router(promocodes.router)
# Mount uploads directory AFTER routes
upload_dir = os.getenv("UPLOAD_DIR", "uploads")
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.get("/")
def read_root():
    return {
        "message": "Orient Watch API",
        "version": "1.0.0",
        "status": "running",
        "cors_origins": allowed_origins
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/test")
def test_endpoint():
    """Test endpoint to verify API is working"""
    return {"message": "API is working!", "cors": "enabled"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting server on http://0.0.0.0:{port}")
    print(f"📚 API docs: http://localhost:{port}/docs")
    print(f"💳 Payme integration: enabled")
    uvicorn.run(app, host="0.0.0.0", port=port)