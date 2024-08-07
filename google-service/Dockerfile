FROM --platform=linux/ARM64 node:18

WORKDIR /google

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3002

CMD ["node" , "src/index.js"]