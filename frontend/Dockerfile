FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Add labels for Docker Hub
LABEL maintainer="bllxk"
LABEL description="KidsMathQuest Frontend - React application with animal-island-ui design system"
LABEL version="1.0.0"
LABEL repository="https://github.com/bk4ice/KidsMathQuest"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
