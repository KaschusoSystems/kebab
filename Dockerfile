############################################################################
FROM alpine AS source-container

WORKDIR /app

COPY . ./.

############################################################################
FROM node:14 AS build-backend
ENV NODE_ENV=production

COPY --from=source-container /app /app
WORKDIR /app/src

RUN yarn install

############################################################################
FROM node:lts-alpine AS build-frontend

USER root
COPY --from=source-container /app /app
WORKDIR /app/src/webclient

RUN yarn install
RUN yarn build

############################################################################
FROM node:14
ENV NODE_ENV=production

WORKDIR /app/src
RUN mkdir public
COPY --from=build-backend /app/src ./
COPY --from=build-frontend /app/src/webclient/dist ./public

EXPOSE 8080
CMD [ "node", "app.js" ]