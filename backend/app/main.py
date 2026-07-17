from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.api import auth, articles, resources, bookmarks, chat, dashboard, admin

# Create tables in SQLite / PostgreSQL on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend service for Startup Navigator, providing authentication, guides, resources, and RAG semantic search.",
    version="1.0.0"
)

# CORS configuration
# Allow local Next.js environment and Vercel domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, limit this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(articles.router, prefix=f"{settings.API_V1_STR}/articles", tags=["Articles"])
app.include_router(resources.router, prefix=f"{settings.API_V1_STR}/resources", tags=["Resources"])
app.include_router(bookmarks.router, prefix=f"{settings.API_V1_STR}/bookmarks", tags=["Bookmarks"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["AI Search / RAG"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Panel"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Startup Navigator API", "status": "healthy"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
