# syntax=docker/dockerfile:1.6

########################
# Base setup
########################
FROM node:25-alpine AS base
WORKDIR /app
RUN apk add --no-cache bash
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
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

########################
# Build stage
########################
FROM deps AS build
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_APP_NAME=houseXpense
ARG VITE_APP_VERSION=1.0.0
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
COPY --chown=node . .
RUN npm run build && npm cache clean --force

########################
# Production runtime
########################
FROM nginx:1.29-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]