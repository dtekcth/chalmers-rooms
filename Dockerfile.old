FROM node:8.14-alpine

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json .

RUN mkdir dist
COPY dist dist

COPY public public

RUN npm install --quiet --production