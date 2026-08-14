# AI Banking Assistant

Modern enterprise-style AI Banking Assistant built with Spring Boot 3, Java 21, React, Vite, TypeScript, Tailwind CSS, JWT security, PostgreSQL-ready persistence, and a Gemini API integration hook.

## What is included

- AI banking chat assistant with Markdown responses, typing state, chat clear action, and backend chat history persistence.
- Transaction summary API and dashboard table for income, expense, categories, savings, and suggestions.
- EMI calculator with monthly EMI, total interest, and total payable.
- Credit card recommendation workflow based on salary, spending habits, travel, and shopping profile.
- Fraud-awareness prompt handling with safe local fallback responses.
- JWT register/login flow, role-ready user model, protected APIs, and Google OAuth configuration placeholders.
- Premium responsive dark dashboard with profile and settings pages.
- Docker Compose setup for frontend, backend, and PostgreSQL.

## Project structure

```text
backend/
  src/main/java/com/aibank/assistant/
    config/ controller/ dto/ entity/ exception/ repository/ security/ service/
frontend/
  src/
    components/ context/ hooks/ layout/ pages/ services/ types/
docker-compose.yml
```

## Run locally

### Backend

Set `JAVA_HOME` to your Java 21 installation, then run:

```powershell
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. Without PostgreSQL variables it uses in-memory H2 for quick development.

### Frontend

PowerShell may block `npm.ps1`, so use `npm.cmd`:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

The frontend starts on `http://localhost:5173`.

## Environment

Backend variables are documented in [backend/.env.example](backend/.env.example). Set `GEMINI_API_KEY` to enable live Gemini responses; otherwise the backend uses a deterministic local banking assistant fallback.

Frontend variables are documented in [frontend/.env.example](frontend/.env.example).

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/chat`
- `GET /api/chat/history`
- `DELETE /api/chat/history`
- `POST /api/banking/transactions/summary`
- `POST /api/banking/emi`
- `POST /api/banking/cards/recommend`

## Docker

```powershell
docker compose up --build
```

This starts PostgreSQL, Spring Boot, and the built frontend container.

## Deployment notes

- Frontend can be built with `npm.cmd run build` and deployed to Firebase Hosting.
- Backend can be deployed to Render as a Java 21 Maven service.
- Use a strong `JWT_SECRET`, PostgreSQL credentials, and real Gemini/Google OAuth secrets in production.

## Render secrets

Configure these values in Render environment variables instead of committing them:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_DRIVER`
