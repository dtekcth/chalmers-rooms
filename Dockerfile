FROM node:8.14-alpine

RUN apk --update add tzdata

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY src src
COPY public public
COPY .babelrc .
COPY tailwind.js .
COPY webpack.mix.js .

RUN mkdir dist

RUN npm run build

RUN npm prune --production

RUN rm -rf package.json .babelrc tailwind.js webpack.mix.js src/

ENV NODE_ENV production
ENV TZ=Europe/Stockholm
ENV PORT 3000
EXPOSE $PORT

CMD node dist/app.js
