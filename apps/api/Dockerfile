FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY services/runner/package*.json ./services/runner/
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY apps/api ./apps/api

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]
