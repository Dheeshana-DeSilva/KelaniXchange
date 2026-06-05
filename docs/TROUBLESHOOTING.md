# Troubleshooting

## Docker Engine Is Not Running

Error examples:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

Fix:

1. Start Docker Desktop.
2. Wait until Docker says it is running.
3. Run:

```bash
docker compose up --build
```

## Port Already In Use

If `3000`, `5000`, or `5173` is already used, stop the other process or change the port mapping.

Check running containers:

```bash
docker ps
```

Stop this project:

```bash
docker compose down
```

## npm Or node Is Not Recognized

Error:

```text
npm is not recognized
```

Fix:

1. Install Node.js 20 or newer.
2. Restart the terminal.
3. Run:

```bash
node -v
npm -v
```

Docker can still run the app even when local Node.js is unavailable.

## MongoDB Connection Fails

Check:

- `MONGO_URI` is correct.
- MongoDB Atlas user/password are correct.
- Your IP address is allowed in Atlas Network Access.
- The database user has read/write permissions.

Check backend logs:

```bash
docker compose logs server
```

## Cloudinary Upload Fails

Check:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- Uploaded file is an image.
- File size is within the upload limits.

## CORS Errors

Check `CLIENT_URL` in `server/.env`.

For Vite local development:

```env
CLIENT_URL=http://localhost:5173
```

For Docker:

```env
CLIENT_URL=http://localhost:3000
```

Restart the backend after changing `.env`.

## Frontend Cannot Reach Backend

Check:

- Backend is running on `http://localhost:5000`.
- The frontend API base URL is configured correctly.
- Docker Compose exposes `5000:5000`.

Quick check:

```bash
curl http://localhost:5000
```

Expected response:

```text
KelaniXchange API Running
```

## Image Upload Card Looks Broken

If Tailwind styling does not appear:

1. Confirm `client/src/index.css` contains `@import "tailwindcss";`.
2. Rebuild the frontend.
3. Restart the dev server or Docker containers.

```bash
docker compose up --build
```
