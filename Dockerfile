FROM node:20-bookworm-slim AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app


FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Ensure markdown directory always exists in build context
RUN mkdir -p /app/markdown

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Ensure native module (better-sqlite3) is compiled against glibc (Debian)
RUN npm rebuild better-sqlite3 --build-from-source

FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Install sqlite3 CLI for database management
RUN apt-get update \
 && apt-get install -y --no-install-recommends sqlite3 \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd -r nodejs --gid=1001 \
 && useradd -r -g nodejs --uid=1001 nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Copy better-sqlite3 native bindings (required for database)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Ensure markdown directory always exists and is owned by nodejs
COPY --from=builder --chown=nodejs:nodejs /app/markdown ./markdown

USER nodejs

EXPOSE $PORT

CMD ["server.js"]
