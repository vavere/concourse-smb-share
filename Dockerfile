FROM alpine:3.9

MAINTAINER Lauris Vavere <lauris@ma-1.lv>

RUN apk add --no-cache nodejs samba-client

COPY lib/* /opt/resource/lib/
COPY index.js /opt/resource/index.js

RUN cd /opt/resource \
&& chmod +x index.js \
&& ln -s index.js check \
&& ln -s index.js in \
&& ln -s index.js out

WORKDIR /opt/resource/
