FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app


EXPOSE 3000

CMD ["npm", "start"]

# docker run -p 3000:8080 app
# docker build -t app .