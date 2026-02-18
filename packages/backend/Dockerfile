# ---------- Dev stage ----------
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN npm install
COPY packages/shared packages/shared
COPY packages/backend packages/backend
RUN npm run build -w packages/shared
WORKDIR /app/packages/backend
RUN npx prisma generate
CMD ["npx", "tsx", "watch", "src/index.ts"]

# ---------- Builder stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN npm ci
COPY packages/shared packages/shared
COPY packages/backend packages/backend
RUN npm run build -w packages/shared
WORKDIR /app/packages/backend
RUN npx prisma generate
RUN npx tsc

# ---------- Production stage ----------
FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN npm ci --omit=dev
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/backend/dist packages/backend/dist
COPY --from=builder /app/packages/backend/prisma packages/backend/prisma
COPY --from=builder /app/packages/backend/node_modules/.prisma packages/backend/node_modules/.prisma
WORKDIR /app/packages/backend
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "dist/index.js"]
