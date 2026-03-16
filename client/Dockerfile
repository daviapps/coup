FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY client/package.json ./client/

RUN yarn install --frozen-lockfile

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

COPY client ./client
RUN yarn build

FROM nginx:alpine AS runner
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
