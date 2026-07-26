from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, dns_records, hosted_zones
from app.core.config import settings
from app.core.database import Base, engine

# Ensures models are registered on Base.metadata before create_all
import app.models  # noqa: F401

from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema for tags column if missing
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE hosted_zones ADD COLUMN tags VARCHAR(2000) DEFAULT '[]'"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(hosted_zones.router, prefix=settings.api_v1_prefix)
app.include_router(dns_records.router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
