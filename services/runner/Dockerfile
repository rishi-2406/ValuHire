FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY services/runner/package*.json ./services/runner/
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

COPY services/runner ./services/runner
COPY apps/api/src/lib ./apps/api/src/lib

WORKDIR /app/services/runner
CMD ["npm", "start"]
