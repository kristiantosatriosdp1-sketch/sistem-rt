# Stage 1: Build SvelteKit application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sistem_rt"
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts, migrations, and scripts
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Start script: run migrations then start Node server
CMD ["sh", "-c", "node scripts/migrate.js && node build"]
