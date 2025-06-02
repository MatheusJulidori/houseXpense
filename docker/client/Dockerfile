FROM node:24-bookworm-slim AS builder

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /usr/src/app

COPY apps/client/package*.json ./
RUN npm install

COPY apps/client .
RUN npm run build


FROM nginx:1.28.0-bookworm AS production

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
