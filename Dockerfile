# ===== Stage 1: install dependencies (cacheable) =====
FROM node:20-alpine AS deps
WORKDIR /app

# Copy manifest trước để cache npm ci
COPY package*.json ./
RUN npm ci --omit=dev

# ===== Stage 2: runtime gọn nhẹ =====
FROM node:20-alpine AS runner
WORKDIR /app

# Chạy bằng non-root cho an toàn
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp
USER nodeuser

# Env mặc định – có thể override khi run
ENV NODE_ENV=production
ENV PORT=8080

# Copy node_modules từ stage deps và toàn bộ source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# (Khuyến nghị) Healthcheck – tạo route /health trong app nếu chưa có
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 8080

# Dùng script start trong package.json
CMD ["npm", "run", "start"]
