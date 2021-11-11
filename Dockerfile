FROM nginx:alpine
RUN mkdir -p /var/www/ivs-frontend-assessment
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./src /var/www/ivs-frontend-assessment/