# ---------- Dev stage ----------
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/
RUN npm install
COPY packages/shared packages/shared
COPY packages/frontend packages/frontend
RUN npm run build -w packages/shared
CMD ["npm", "run", "dev", "-w", "packages/frontend"]

# ---------- Builder stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci
COPY packages/shared packages/shared
COPY packages/frontend packages/frontend
RUN npm run build -w packages/shared
RUN npm run build -w packages/frontend

# ---------- Production stage ----------
FROM nginx:alpine AS production
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
