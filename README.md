# Route53 Clone

A full-stack clone of the AWS Route53 management console with user authentication, hosted zone management, and DNS record operations. Built with Next.js, FastAPI, and SQLite for demo purposes.

## What It Does

- **User Authentication**: Email-based OTP verification with account creation and login
- **Hosted Zone Management**: Create, view, edit, and delete DNS hosted zones
- **DNS Record Management**: Add, modify, and remove DNS records (A, AAAA, CNAME, MX, TXT, NS)
- **Search & Pagination**: Filter hosted zones by domain name with pagination
- **Responsive UI**: AWS-inspired design with Tailwind CSS

## Features

### Authentication
- Email OTP verification via Resend API
- Multi-step sign-up flow (email, verification, password, billing plan, contact info)
- JWT-based session authentication with 24-hour expiry
- Phone number validation (10 digits required)

### DNS Management
- Hosted zone CRUD operations
- DNS record CRUD operations with type-specific fields
- Real-time search and filtering
- Modal-based forms for creating/editing records
- Confirmation dialogs for destructive actions

### UI/UX
- AWS Route53-inspired design
- Responsive layout for desktop and mobile
- Toast notifications for user feedback
- Loading states and error handling
- Plan selection with feature comparison (Free vs Paid)

## Requirements

### Backend Requirements
- Python 3.9+
- FastAPI, SQLAlchemy, Pydantic
- SQLite database
- Resend API key for email OTP (get free at https://resend.com/signup)

### Frontend Requirements
- Node.js 18+
- Next.js 14+ with App Router
- TypeScript, Tailwind CSS

### Environment Variables
```
# Backend (.env)
DATABASE_URL=sqlite:///./route53_clone.db
JWT_SECRET_KEY=your-secret-key
RESEND_API_KEY=your-resend-api-key
FRONTEND_ORIGIN=http://localhost:3000
```

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your RESEND_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Frontend**: Next.js App Router with TypeScript and Tailwind CSS
- **Backend**: FastAPI with SQLAlchemy ORM and Pydantic v2
- **Database**: SQLite for demo persistence
- **Auth**: JWT session cookies with email OTP verification

## API Overview

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/send-otp` | Send verification code to email |
| POST | `/api/v1/auth/verify-otp` | Verify OTP and create/login user |
| POST | `/api/v1/auth/login` | Authenticate with password |
| POST | `/api/v1/auth/logout` | Remove session cookie |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/hosted-zones` | List hosted zones |
| POST | `/api/v1/hosted-zones` | Create hosted zone |
| GET | `/api/v1/hosted-zones/{id}` | Get hosted zone details |
| PATCH | `/api/v1/hosted-zones/{id}` | Update hosted zone |
| DELETE | `/api/v1/hosted-zones/{id}` | Delete hosted zone |
| GET | `/api/v1/hosted-zones/{id}/records` | List DNS records |
| POST | `/api/v1/hosted-zones/{id}/records` | Create DNS record |
| PATCH | `/api/v1/hosted-zones/{id}/records/{rid}` | Update DNS record |
| DELETE | `/api/v1/hosted-zones/{id}/records/{rid}` | Delete DNS record |

## Database Schema

- **users**: `id`, `email`, `password_hash`, `account_name`, `full_name`, `phone_number`, `country`, `address`, `billing_plan`, `created_at`
- **hosted_zones**: `id`, `domain_name`, `description`, `type`, `record_count`, `owner_id`, `created_at`, `updated_at`
- **dns_records**: `id`, `hosted_zone_id`, `name`, `type`, `value`, `ttl`, `priority`, `created_at`, `updated_at`

## Notes

- This is a UI clone - no actual AWS API integration or DNS propagation
- SMTP ports (587, 465) blocked on cloud hosts like Render - use HTTPS email APIs (Resend/Brevo)
- In-memory OTP storage resets on server restart
- Temporary email addresses (temp-mail.org) are blocked by email providers
- CORS configured for `http://localhost:3000` - update for production
- Visit `/docs` on backend for interactive API documentation
