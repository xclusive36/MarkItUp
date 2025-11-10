FROM node:lts-alpine AS base
RUN apk add --no-cache libc6-compat
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

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

# Copy better-sqlite3 native bindings (required for database)
COPY --from=builder --chown=nonroot:nonroot /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# Ensure markdown directory always exists and is owned by nonroot
COPY --from=builder --chown=nonroot:nonroot /app/markdown ./markdown

USER nonroot

EXPOSE $PORT

CMD ["server.js"]
