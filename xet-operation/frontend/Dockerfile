FROM node:18 AS builder

WORKDIR /app

# 先拷贝 package.json 文件，利用缓存
COPY ./xet-frontend/package*.json ./
RUN npm install --network-timeout=1000000 --registry=https://registry.npmmirror.com

# 再拷贝其他源码文件
COPY ./xet-frontend/ .
RUN npm run build

FROM nginx:stable
COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./xet-operation/frontend/navigate.html /usr/share/nginx/html/navigate.html

# 拷贝 nginx 配置
COPY ./xet-operation/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./xet-operation/frontend/navigate.html /usr/share/nginx/html/navigate.html
 
# 拷贝本地证书
COPY ./xet-operation/frontend/ssl/lcmonitor.dynv6.net/fullchain.pem /etc/ssl/certs/fullchain.pem
COPY ./xet-operation/frontend/ssl/lcmonitor.dynv6.net/privkey.pem /etc/ssl/private/privkey.pem