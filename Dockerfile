FROM jekyll/builder:pages

RUN gem install redcarpet

COPY . /srv/jekyll

RUN jekyll build --destination /tmp/build

RUN ls -la /tmp/build

FROM nginx:alpine

COPY --from=0 /tmp/build /usr/share/nginx/html
