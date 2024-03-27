# development stage
FROM node:20.9.0-alpine3.18 as develop-stage

WORKDIR /app

RUN npm install -g pnpm

RUN pnpm config set store-dir /home/pnpm

CMD pnpm i && pnpm dev --host
