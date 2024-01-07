FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

USER node
ENV PORT=4000
EXPOSE 4000

CMD [ "node", "dist/main.js" ]
