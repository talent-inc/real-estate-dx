# Web Frontend Dockerfile
# Multi-stage build for optimized production image

# Development stage
FROM node:24-alpine AS development
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY ../../pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Copy Next.js config files
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY components.json ./

# Expose port
EXPOSE 3000

# Development command
CMD ["pnpm", "run", "dev"]

# Dependencies stage
FROM node:24-alpine AS deps
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install pnpm and dependencies
RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile

# Builder stage
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy configuration files
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY components.json ./

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application
RUN corepack enable pnpm
RUN pnpm run build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package files and install production dependencies
COPY package*.json ./
RUN corepack enable pnpm
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Production command
CMD ["dumb-init", "node", "server.js"]