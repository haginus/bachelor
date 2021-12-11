FROM node:12.14-alpine AS build
WORKDIR /dist/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM nginx:latest AS ngi
COPY --from=build /dist/src/app/dist/bachelor /usr/share/nginx/html
COPY /docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80