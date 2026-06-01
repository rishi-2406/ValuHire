FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY services/runner/package*.json ./services/runner/
COPY prisma ./prisma
RUN npm install

COPY services/runner ./services/runner

WORKDIR /app/services/runner
CMD ["npm", "run", "dev"]
