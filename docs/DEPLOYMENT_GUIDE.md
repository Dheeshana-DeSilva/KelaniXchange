# Deployment Guide

KelaniXchange can be deployed as separate frontend and backend services or with Docker.

## Production Requirements

- Production MongoDB database
- Cloudinary credentials
- Strong `JWT_SECRET`
- Public backend URL
- Public frontend URL
- HTTPS for both client and API

## Docker Deployment

1. Configure `server/.env`.

```env
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend-domain.com
API_PUBLIC_URL=https://your-api-domain.com
```

2. Update `docker-compose.yml` if production ports or domains differ.

3. Build and start containers.

```bash
docker compose up --build -d
```

4. Check status.

```bash
docker compose ps
docker compose logs server
docker compose logs client
```

## Separate Frontend Deployment

Build the frontend:

```bash
cd client
npm install
npm run build
```

Deploy the `client/dist` folder to a static host or Nginx.

Make sure the frontend build uses the correct API URL. The Docker build passes:

```text
VITE_API_URL=http://localhost:5000
```

Use the production API URL when deploying.

## Separate Backend Deployment

Install and run the backend:

```bash
cd server
npm install
npm start
```

The backend must be able to connect to MongoDB Atlas and Cloudinary.

## CORS

Set `CLIENT_URL` to the exact frontend origin:

```env
CLIENT_URL=https://your-frontend-domain.com
```

If the frontend runs at `https://www.example.com`, do not use `https://example.com` unless both are configured.

## Post Deployment Checks

- Open frontend URL.
- Confirm API root returns `KelaniXchange API Running`.
- Register and log in with a test user.
- Create a listing with an image.
- Create a lost and found post with an image.
- Test chat/notifications if Socket.IO is enabled on the host.
