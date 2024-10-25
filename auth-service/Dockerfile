FROM node:18-alpine

WORKDIR /client

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3004

CMD ["node" , "src/index.js"]