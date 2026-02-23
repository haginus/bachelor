FROM node:22-slim AS build
WORKDIR /usr
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM nginx:1.27.0 AS ngi
COPY --from=build /usr/dist/bachelor/browser /usr/share/nginx/html
EXPOSE 80
