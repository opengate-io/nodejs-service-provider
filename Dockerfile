FROM node:8.4-alpine
MAINTAINER DUONG Dinh Cuong <cuong3ihut@gmail.com>

ENV LOG_LEVEL "info"

COPY . /opt/service-provider
RUN chmod +x /opt/service-provider/docker-entrypoint.sh
RUN apk --update add curl git ca-certificates python build-base libtool autoconf automake &&\
    cd /opt/service-provider && npm install &&\
    rm -rf /var/lib/apt/lists/* &&\
    rm -rf /var/cache/apk/*

WORKDIR "/opt/service-provider/"

EXPOSE 8000

CMD ["npm","start"]