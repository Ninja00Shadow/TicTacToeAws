FROM node:17-alpine
ARG FRONTEND_PORT
WORKDIR /frontend
COPY . .
RUN npm install
RUN npm run build

EXPOSE ${FRONTEND_PORT}
CMD ["npm", "start"]