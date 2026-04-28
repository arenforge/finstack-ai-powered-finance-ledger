# Personal Finance Ledger

Personal Finance Ledger is a full-stack budgeting and expense tracking app with Firebase authentication, a Node/Express API, MongoDB persistence, and a Vite-powered React client.

The app is built around daily money logging with views for today, all-time trends, monthly summaries, bills, savings goals, shared budgets, and an AI assistant that answers finance questions from recent transaction data.

## Features

- Secure login with Firebase email/password and Google sign-in
- Daily transaction logging with a quick-add modal
- Dashboard charts for income, expenses, savings rate, category splits, and recent spending
- Dedicated views for today, monthly analysis, full transaction history, goals, bills, and shared budgets
- AI finance chat powered by Gemini using recent transaction aggregates
- Demo-friendly auth and in-memory data fallback for local development

## Tech Stack

- Client: React 19, React Router, Axios, Recharts, Vite, Vitest
- Server: Node.js, Express, Mongoose, Firebase Admin SDK
- Data and services: MongoDB, Firebase Authentication, Google Gemini

## Project Structure

```text
Personal Finance Ledger/
|-- client/    # Vite React frontend
|-- server/    # Express API and background jobs
|-- README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string for persistent storage
- Firebase project for client auth and server-side token verification
- Gemini API key for the AI finance chat feature

## Environment Variables

Create these files before running the app:

- `client/.env`
- `server/.env`

### Client `.env`

Based on [client/.env.example](</D:/1. New Study Material/Personal Finance Ledger/client/.env.example>):

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEMO_AUTH=false
```

### Server `.env`

Based on [server/.env.example](</D:/1. New Study Material/Personal Finance Ledger/server/.env.example>):

```env
MONGODB_URI=
MONGO_URI=
MONGODB_DIRECT_URI=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
DEV_AUTH_BYPASS=false
DEV_DATA_MEMORY=false
```

## Local Development

Install dependencies in both apps:

```bash
cd client
npm install

cd ../server
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Default local URLs:

- Client: `http://localhost:5173`
- API: `http://localhost:5000`

## Demo Mode

The project includes a local demo path that skips real Firebase login and can run without MongoDB persistence.

Use these settings for a lightweight local run:

Client:

```env
REACT_APP_DEMO_AUTH=true
REACT_APP_API_URL=http://localhost:5000
```

Server:

```env
DEV_AUTH_BYPASS=true
DEV_DATA_MEMORY=true
```

When `DEV_AUTH_BYPASS=true`, the API accepts the client's `dev-token`. When MongoDB is unavailable or `DEV_DATA_MEMORY=true`, the server falls back to an in-memory store for transactions, goals, bills, and shared budgets.

## Available Scripts

### Client

From [client/package.json](</D:/1. New Study Material/Personal Finance Ledger/client/package.json>):

- `npm run dev` starts the Vite dev server
- `npm run start` aliases the Vite dev server
- `npm run build` creates a production build in `client/dist`
- `npm run preview` serves the production build locally
- `npm test` runs the Vitest test suite

### Server

From [server/package.json](</D:/1. New Study Material/Personal Finance Ledger/server/package.json>):

- `npm run dev` starts the Express server
- `npm start` starts the Express server
- `npm test` checks `server.js` syntax with Node

## API Overview

Most API routes require a Firebase ID token, or the demo token when auth bypass is enabled.

- `GET /health`
- `GET/POST/PUT/DELETE /api/transactions`
- `GET/POST/PUT/DELETE /api/goals`
- `GET/POST/PUT/DELETE /api/bills`
- `GET/POST /api/shared-budgets`
- `POST /api/ai/query`

## Testing

Frontend:

```bash
cd client
npm test
```

Production build check:

```bash
cd client
npm run build
```

Backend syntax check:

```bash
cd server
npm test
```

## Notes

- The client now uses Vite rather than Create React App.
- The frontend still reads env vars with the `REACT_APP_` prefix, which is supported by the current Vite config.
- If MongoDB is not configured, the server still starts, but database-backed routes depend on the in-memory fallback behavior.
