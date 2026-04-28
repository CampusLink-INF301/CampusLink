FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

RUN npm install

COPY apps/backend/ ./apps/backend/

RUN npm run build:backend

EXPOSE 3000

CMD ["node", "apps/backend/dist/main"]
