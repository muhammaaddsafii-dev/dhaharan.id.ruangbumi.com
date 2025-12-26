# =========================
# 1️⃣ Build Stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Vite app (output: dist/)
RUN npm run build

# =========================
# 2️⃣ Runtime Stage
# =========================
FROM nginx:alpine

# Hapus default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (SPA friendly)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build dari stage sebelumnya
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run listen di 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
