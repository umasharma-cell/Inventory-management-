# Inventory Management System

Production-ready full-stack Inventory & Order Management System built with FastAPI, PostgreSQL, React, Docker, and Docker Compose.

## Features

- Product management with unique SKU validation, search, pagination, edit, and delete
- Customer management with unique email validation, search, pagination, and delete
- Order management with multiple products, stock validation, automatic total calculation, stock deduction, and order detail view
- Dashboard with totals, low-stock products, and responsive charts
- PostgreSQL persistence with Alembic migrations
- Containerized backend, frontend, and database services

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, Alembic, PostgreSQL
- Frontend: React, Vite, Axios, React Router
- Infrastructure: Docker, Docker Compose, Nginx

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `backend/.env` if your local PostgreSQL credentials differ.

Run migrations:

```bash
alembic -c alembic.ini upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:

- API: `http://localhost:8000`
- Health: `http://localhost:8000/health`
- OpenAPI: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Docker Setup

Create a root `.env` file:

```bash
copy .env.example .env
```

Build and start all services:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

Stop services:

```bash
docker compose down
```

Stop services and remove the PostgreSQL volume:

```bash
docker compose down -v
```

PostgreSQL data is persisted in the named Docker volume:

```text
postgres_data
```

## Environment Variables

Root `.env` for Docker Compose:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_management
POSTGRES_PORT=5432

APP_NAME=Inventory Management API
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/inventory_management
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
RUN_MIGRATIONS=true

VITE_API_BASE_URL=http://localhost:8000
```

For production, set strong database credentials, set `DEBUG=false`, and use deployed frontend/backend URLs in CORS and API variables.

## Deployment Instructions

### Backend on Render or Railway

1. Create a PostgreSQL database on Render or Railway.
2. Create a backend web service from the `backend/` directory.
3. Use Docker deployment with `backend/Dockerfile`.
4. Set environment variables:
   - `DATABASE_URL`
   - `APP_NAME`
   - `ENVIRONMENT=production`
   - `DEBUG=false`
   - `BACKEND_CORS_ORIGINS=<deployed-frontend-url>`
   - `RUN_MIGRATIONS=true`
5. Deploy and verify:
   - `/health`
   - `/docs`

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the frontend root directory to `frontend`.
3. Set environment variable:
   - `VITE_API_BASE_URL=<deployed-backend-url>`
4. Build command:
   - `npm run build`
5. Output directory:
   - `dist`
6. Deploy and verify the app can call the deployed backend.

### Docker Hub Backend Image

Build and push the backend image:

```bash
docker build -t <dockerhub-username>/inventory-backend:latest ./backend
docker push <dockerhub-username>/inventory-backend:latest
```

Use the pushed image URL in the final assignment submission.

## API Overview

Products:

- `POST /products`
- `GET /products?page=1&limit=10&search=iphone`
- `GET /products/{product_id}`
- `PUT /products/{product_id}`
- `DELETE /products/{product_id}`

Customers:

- `POST /customers`
- `GET /customers?page=1&limit=10&search=john`
- `GET /customers/{customer_id}`
- `DELETE /customers/{customer_id}`

Orders:

- `POST /orders`
- `GET /orders?page=1&limit=10`
- `GET /orders/{order_id}`
- `DELETE /orders/{order_id}`

Dashboard:

- `GET /dashboard/summary`

## Verification

Backend:

```bash
python -m compileall backend
```

Frontend:

```bash
cd frontend
npm run build
```

Docker:

```bash
docker compose config
docker compose up --build
```
