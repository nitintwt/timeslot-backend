FROM node:18-alpine

WORKDIR /email

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node" , "src/index.js"]