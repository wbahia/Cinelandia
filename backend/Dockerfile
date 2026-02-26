FROM node:20-slim

# Dependências (Prisma precisa de openssl)
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma Client
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Migrations e up do server
CMD npx prisma db push && npm run start