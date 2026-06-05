# Environment Variables

The backend reads configuration from `server/.env`. Start by copying:

```bash
cp server/.env.example server/.env
```

## Server Variables

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `PORT` | Yes | `5000` | Express server port. |
| `MONGO_URI` | Yes | `mongodb+srv://...` | MongoDB Atlas connection string. |
| `JWT_SECRET` | Yes | `replace_me` | Secret used to sign authentication tokens. |
| `CLOUDINARY_CLOUD_NAME` | Yes | `my-cloud` | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes | `123456789` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | `replace_me` | Cloudinary API secret. |
| `CLIENT_URL` | Yes | `http://localhost:5173` | Frontend URL allowed by CORS and app links. |
| `API_PUBLIC_URL` | Recommended | `http://localhost:5000` | Public backend URL used when generating API-facing links. |

## Local Development Values

Use these defaults when running the frontend through Vite:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:5000
```

## Docker Values

The Docker Compose setup serves the frontend from Nginx on port `3000`, so use:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
API_PUBLIC_URL=http://localhost:5000
```

## Security Notes

- Do not commit `server/.env`.
- Use a long, random `JWT_SECRET` in production.
- Rotate Cloudinary credentials if they are exposed.
- Use separate MongoDB databases for development and production.
