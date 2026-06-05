# Setup Guide

KelaniXchange has two apps:

- `client` - React, Vite, Tailwind CSS
- `server` - Node.js, Express, MongoDB, Socket.IO

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop, optional but recommended
- MongoDB Atlas connection string
- Cloudinary account for image uploads

## Option 1: Run With Docker

1. Copy the server environment file.

```bash
cp server/.env.example server/.env
```

2. Fill in `server/.env` with MongoDB, JWT, and Cloudinary values.

3. Start Docker Desktop.

4. Build and run the containers.

```bash
docker compose up --build
```

5. Open the app.

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

Stop the containers:

```bash
docker compose down
```

## Option 2: Run Locally

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Create `server/.env` from `server/.env.example` and fill in real values.

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

## Useful Commands

```bash
cd client
npm run build
```

```bash
cd client
npm run lint
```

```bash
cd server
npm start
```
