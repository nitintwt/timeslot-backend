FROM --platform=linux/ARM64 node:18

WORKDIR /email

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node" , "src/index.js"]