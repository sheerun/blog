FROM nginx

COPY _site /usr/share/nginx/html

VOLUME /usr/share/nginx/html
