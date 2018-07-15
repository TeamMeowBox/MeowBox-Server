FROM node

MAINTAINER MeowBox 

RUN apt-get update

ENV NODE_ENV production

EXPOSE 3003

COPY ./ /MeowBox-Server

RUN npm install --prefix /MeowBox-Server && npm install -g pm2 node-gyp

CMD ["pm2 start", "./bin/www","--name","meow"]
