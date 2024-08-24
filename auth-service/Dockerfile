FROM --platform=linux/ARM64 node:18

WORKDIR /client

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node" , "src/index.js"]