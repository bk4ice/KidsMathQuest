FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl-dev openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Add labels for Docker Hub
LABEL maintainer="bllxk"
LABEL description="KidsMathQuest Backend - Node.js API server with Prisma ORM and SQLite database"
LABEL version="1.0.0"
LABEL repository="https://github.com/bk4ice/KidsMathQuest"

EXPOSE 5000

CMD ["sh", "-c", "mkdir -p /app/prisma /app/uploads && if [ ! -f '/app/prisma/dev.db' ]; then npx prisma db push --skip-generate; fi && npm start"]
