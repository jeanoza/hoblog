# ---- build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* vars are baked at build time
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---- runtime stage ----
FROM node:24-alpine AS runner
WORKDIR /app

# NODE_ENV, PORT → set at runtime via docker-compose (root .env)

# standalone output bundles everything needed to run
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# EXPOSE 20001

CMD ["node", "server.js"]
