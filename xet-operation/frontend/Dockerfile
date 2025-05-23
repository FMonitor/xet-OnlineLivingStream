FROM node:18 AS builder
WORKDIR /app
COPY ./xet-frontend/ .
RUN npm install 

RUN npm run build

FROM nginx:stable
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 nginx 配置
COPY ./xet-operation/frontend/nginx.conf /etc/nginx/conf.d/default.conf
 
# 拷贝本地证书
COPY ./xet-operation/frontend/ssl/lcmonitor.dynv6.net/fullchain.pem /etc/ssl/certs/fullchain.pem
COPY ./xet-operation/frontend/ssl/lcmonitor.dynv6.net/privkey.pem /etc/ssl/private/privkey.pem