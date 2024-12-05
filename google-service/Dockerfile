FROM node:18-alpine

WORKDIR /google

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3002

CMD ["node" , "src/index.js"]