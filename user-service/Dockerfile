FROM node:18-alpine

WORKDIR /user

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3003

CMD ["node" , "src/index.js"]
 