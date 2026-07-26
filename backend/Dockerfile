FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Chạy server ở chế độ dev
CMD ["npm", "run", "dev"]
