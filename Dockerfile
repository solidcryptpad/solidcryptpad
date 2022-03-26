# Stage 0
# build frontend
FROM node:16 as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm ci
COPY ./ /app/
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration

# Stage 1
# copy compiled app and serve with Nginx
FROM nginx:1.21
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf