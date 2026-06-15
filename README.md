# ShopEZ

Full-stack e-commerce web application with separate `frontend` and `backend` folders.

## Repository structure

- `backend/` — Express API server
- `frontend/` — React + Vite client
- `README.md` — project setup and run instructions
- `package.json` — root installer and runner scripts

## Requirements

- Node.js LTS (18+ recommended)
- npm

## Setup

From the repository root:

```powershell
cd C:\Users\HOME\OneDrive\Desktop\shopez
npm install
```

This runs the root `postinstall` script and installs dependencies for both `backend` and `frontend`.

## Run locally

### Option 1: Run backend and frontend separately

#### Backend
```powershell
cd C:\Users\HOME\OneDrive\Desktop\shopez\backend
npm install
npm run dev
```

#### Frontend
```powershell
cd C:\Users\HOME\OneDrive\Desktop\shopez\frontend
npm install
npm run dev
```

### Option 2: Run both from root

```powershell
cd C:\Users\HOME\OneDrive\Desktop\shopez
npm run dev
```

This uses `concurrently` to start backend and frontend together.

## Available scripts

### Root scripts

- `npm run install-backend` — install backend dependencies
- `npm run install-frontend` — install frontend dependencies
- `npm run install-all` — install both backend and frontend
- `npm run dev` — run backend and frontend together
- `npm run seed` — run backend seed data script

### Backend scripts

- `npm start` — run `node server.js`
- `npm run dev` — run `nodemon server.js`
- `npm run seed` — run `node utils/seeder.js`

### Frontend scripts

- `npm run dev` — start Vite development server
- `npm run build` — build production files
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Notes

- Do not run `npm install` or `npm run dev` from the repository root unless you want to use the root helper scripts.
- The `backend` and `frontend` folders each contain their own `package.json` files.
- If your environment requires additional configuration, create the required `.env` file in `backend/` with your MongoDB URI, JWT secret, Stripe keys, etc.

## GitHub repository

Pushed to:

`https://github.com/yashashveninashaboina/ShopEZ-.git`
