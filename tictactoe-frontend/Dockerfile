FROM node:18-alpine AS build
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_WS_URL=ws://localhost:8000
ARG REACT_APP_AUTH_MODE=local
WORKDIR /frontend
COPY . .
RUN npm install -fetch-timeout=240000
RUN REACT_APP_API_URL=${REACT_APP_API_URL} REACT_APP_WS_URL=${REACT_APP_WS_URL} REACT_APP_AUTH_MODE=${REACT_APP_AUTH_MODE} npm run build

# CMD ["npm", "start"]

FROM nginx:alpine
COPY --from=build /frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
