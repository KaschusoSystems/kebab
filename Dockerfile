FROM node:14
ENV NODE_ENV=production

WORKDIR /app/kebab

RUN ls

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install
COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]