# syntax=docker/dockerfile:1
ARG NODE_VERSION=20

# Base stage with pnpm
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat openssl ca-certificates
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate
WORKDIR /app

# Dependencies stage - monorepo aware
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Use BuildKit cache mount for pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch --frozen-lockfile

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @real-estate-dx/api...

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy package files
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Copy application files
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm exec prisma generate
WORKDIR /app

# Expose port
EXPOSE 8000

# Development command
CMD ["pnpm", "--filter", "@real-estate-dx/api", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy all files
COPY . .

# Generate Prisma client and build
RUN pnpm --filter @real-estate-dx/api prisma generate
RUN pnpm --filter @real-estate-dx/api build
RUN pnpm --filter @real-estate-dx/shared build

# Production dependencies
FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter @real-estate-dx/api...

# Production stage
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist

# Create uploads directory
RUN mkdir -p /app/apps/api/uploads && chown nodejs:nodejs /app/apps/api/uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the server
WORKDIR /app/apps/api
CMD ["dumb-init", "node", "dist/index.js"]