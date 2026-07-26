"""Seed a demo user for local development.

Usage:
    python seed.py
"""
from sqlalchemy import select

import app.models  # noqa: F401  (register models on Base.metadata)
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User

DEMO_EMAIL = "demo@route53clone.dev"
DEMO_PASSWORD = "Demo1234!"


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.email == DEMO_EMAIL))
        if existing:
            print(f"Demo user already exists: {DEMO_EMAIL}")
            return

        user = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))
        db.add(user)
        db.commit()
        print(f"Created demo user -> email: {DEMO_EMAIL}  password: {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
