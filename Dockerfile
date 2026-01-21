FROM node:24-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start:dev"]