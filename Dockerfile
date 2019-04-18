FROM node:8.14-alpine

RUN apk --update add tzdata

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY src src
COPY public public
COPY package.json .
COPY .babelrc .
COPY tailwind.js .
COPY webpack.mix.js .

RUN mkdir dist

RUN npm install
RUN npm run build

RUN npm prune --production

RUN rm -rf package.json .babelrc tailwind.js webpack.mix.js src/