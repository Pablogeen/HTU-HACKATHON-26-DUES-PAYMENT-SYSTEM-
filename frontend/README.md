# COMPSSA Dues Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the COMPSSA Dues Payment System (Ho Technical University).

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Spring Boot API base URL (no trailing slash) |

Example:

```
VITE_API_BASE_URL=https://htu-hackathon-26-dues-payment-system.onrender.com
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in Vercel
3. Set **Root Directory** to `frontend`
4. Add `VITE_API_BASE_URL` in Environment Variables
5. Deploy
6. Add your Vercel URL to backend CORS allowed origins

## Features

- Email + OTP authentication with JWT refresh
- Role-based routing (Student, President, Financial Secretary, Admin)
- Student dashboard, profile, Paystack payment, receipts
- Admin student management, CSV import, reports, transactions

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
