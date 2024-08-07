FROM --platform=linux/ARM64 node:18

WORKDIR /user

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3003

CMD ["node" , "src/index.js"]
 