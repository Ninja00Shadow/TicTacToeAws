FROM node:17-alpine as build
ARG BACKEND_IP
WORKDIR /frontend
COPY . .
RUN npm install -fetch-timeout=240000
RUN REACT_APP_API_IP=${BACKEND_IP} npm run build

# CMD ["npm", "start"]

FROM nginx:alpine
COPY --from=build /frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]