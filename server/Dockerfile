# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Production Stage ----
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
