FROM node:latest
LABEL authors="khanh"

RUN npm install -g tsx

WORKDIR /app/
COPY package.json /app/

RUN npm install
COPY . /app/
RUN npm run build

ENTRYPOINT ["npm", "run", "start"]