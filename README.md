# Route53 Clone

A production-quality full-stack clone of the AWS Route53 management console. The app includes hosted zone and DNS record management, session-based mocked auth, search, pagination, modals, and a real backend API with SQLite persistence.

## Architecture

- `frontend/`: Next.js App Router with TypeScript and Tailwind CSS.
- `backend/`: FastAPI backend with SQLAlchemy ORM, Pydantic v2, mocked session auth, and SQLite storage.
-- `docker-compose.yml`: (removed) project is runnable locally without Docker.

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Running locally (no Docker)

Follow these steps to run the app locally without Docker.

Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # PowerShell/CMD on Windows
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

## Database Schema

Tables:

- `users`: `id`, `email`, `password_hash`, `created_at`
- `hosted_zones`: `id`, `domain_name`, `description`, `type`, `record_count`, `owner_id`, `created_at`, `updated_at`
- `dns_records`: `id`, `hosted_zone_id`, `name`, `type`, `value`, `ttl`, `priority`, `created_at`, `updated_at`

## API Overview

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Authenticate and set session cookie |
| POST | `/api/v1/auth/logout` | Remove session cookie |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/hosted-zones` | List hosted zones |
| POST | `/api/v1/hosted-zones` | Create hosted zone |
| GET | `/api/v1/hosted-zones/{id}` | Get hosted zone details |
| PATCH | `/api/v1/hosted-zones/{id}` | Update hosted zone |
| DELETE | `/api/v1/hosted-zones/{id}` | Delete hosted zone |
| GET | `/api/v1/hosted-zones/{id}/records` | List DNS records |
| POST | `/api/v1/hosted-zones/{id}/records` | Create DNS record |
| GET | `/api/v1/hosted-zones/{id}/records/{rid}` | Get DNS record |
| PATCH | `/api/v1/hosted-zones/{id}/records/{rid}` | Update DNS record |
| DELETE | `/api/v1/hosted-zones/{id}/records/{rid}` | Delete DNS record |

## Mocked vs Real

- Auth is mocked using JWT session cookies, not real AWS IAM.
- DNS behavior is mocked; record CRUD operations are persisted, but no DNS propagation or resolution occurs.

## Notes

- Backend CORS allows requests from `http://localhost:3000`.
- Use `/docs` on the backend to inspect the API contract.
