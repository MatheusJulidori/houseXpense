FROM node:24-bookworm

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL 

WORKDIR /usr/src/app

COPY apps/server/package*.json ./
RUN npm install


COPY apps/server .

# RUN apt-get update -y && apt-get install -y openssl  ## Se user bookwork-slim, descomentar esta linha

CMD ["sh","-c","npx prisma generate && node index.js"]
