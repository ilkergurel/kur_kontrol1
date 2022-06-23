FROM node:16.3.0-alpine
COPY . .
RUN npm install
CMD [ "node", "node-app2.js" ]