# syntax=docker/dockerfile:1.6

########################
# Base image
########################
ARG NODE_IMAGE=node:25-alpine

FROM ${NODE_IMAGE} AS base
WORKDIR /app
RUN apk add --no-cache bash curl
RUN chown -R node:node /app
USER node

########################
# Dependencies (dev + prod)
########################
FROM base AS deps
COPY --chown=node package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

########################
# Development runtime
########################
FROM deps AS development
ENV NODE_ENV=development
COPY --chown=node . .
CMD ["npm", "run", "start:dev"]

########################
# Build stage
########################
FROM deps AS build
ENV NODE_ENV=production
COPY --chown=node . .
RUN npm run build && npm cache clean --force

########################
# Production dependencies
########################
FROM base AS prod-deps
COPY --chown=node package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

########################
# Production runtime
########################
FROM ${NODE_IMAGE} AS production
WORKDIR /app
RUN apk add --no-cache curl
RUN chown -R node:node /app
USER node
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--enable-source-maps
COPY --from=prod-deps --chown=node /app/node_modules ./node_modules
COPY --from=build --chown=node /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf http://localhost:${PORT}/api/health/live >/dev/null || exit 1
CMD ["node", "dist/main.js"]