# ===== Stage 1: install dependencies (cacheable) =====
FROM node:22-alpine AS deps
WORKDIR /app

# Thêm toolchain nếu cần build native module
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# ===== Stage 2: runtime gọn nhẹ =====
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp
USER nodeuser

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=deps /app/node_modules ./node_modules
COPY . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 8080
CMD ["npm", "run", "start"]
