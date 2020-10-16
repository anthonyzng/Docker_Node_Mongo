FROM node:12.18.4

WORKDIR /anthonyz/movie-app/app
COPY package*.json ./
RUN npm install

COPY . /anthonyz/movie-app/app

EXPOSE 8124
CMD ["node", "server.js"]
