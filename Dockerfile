FROM node:8

# Create app directory
WORKDIR /nile-instance

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3334

CMD [ "npm", "start" ]
