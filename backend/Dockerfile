# ---- build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run generate
RUN npm run build

# ---- runtime stage ----
FROM node:24-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Prisma schema + migrations (needed for migrate deploy & generate)
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm run generate

COPY --from=builder /app/dist ./dist

EXPOSE 20002

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
