FROM ubuntu:24.04
WORKDIR /app

COPY ./xet-backend .

RUN echo "升级apt-get工具"
RUN for i in 1 2 3; do apt-get update && break || (echo "升级apt-get工具失败,重试次数$i" && sleep 2); done
RUN echo "安装g++编译器"
RUN for i in 1 2 3; do apt-get install -y build-essential g++ && break || (echo "安装g++编译器失败,重试次数$i" && sleep 2); done
RUN echo "安装cmake"
RUN for i in 1 2 3; do apt-get install -y cmake && break || (echo "安装cmake失败,重试次数$i" && sleep 2); done

# 安装MySQL Connector/C++
RUN echo "安装MySQL Connector/C++"
WORKDIR /app/package
RUN dpkg -i libmysqlcppconnx2_9.3.0-1ubuntu24.04_amd64.deb
RUN dpkg -i libmysqlcppconn10_9.3.0-1ubuntu24.04_amd64.deb
RUN dpkg -i libmysqlcppconn-dev_9.3.0-1ubuntu24.04_amd64.deb
RUN dpkg -i libmysqlcppconnx2-dbgsym_9.3.0-1ubuntu24.04_amd64.deb
RUN dpkg -i libmysqlcppconn10-dbgsym_9.3.0-1ubuntu24.04_amd64.deb

# 安装OpenSSL
RUN echo "安装OpenSSL"
RUN apt-get install -y libssl-dev

# 安装oatpp
RUN echo "安装oatpp"
WORKDIR /app/package/oatpp
RUN rm -rdf build && mkdir build
WORKDIR /app/package/oatpp/build
RUN cmake .. && make install

# 安装oatpp-websocket
RUN echo "安装oatpp-websocket"
WORKDIR /app/package/oatpp-websocket
RUN rm -rdf build && mkdir build
WORKDIR /app/package/oatpp-websocket/build
RUN cmake .. && make install

RUN echo "启动后端异步服务器"
WORKDIR /app/xet-backend-async
RUN rm -rdf build && mkdir build
WORKDIR /app/xet-backend-async/build
RUN cmake .. && make
RUN mv xet-backend-async-exe ../../package

RUN echo "启动后端同步服务器"
WORKDIR /app/xet-backend-sync
RUN rm -rdf build && mkdir build
WORKDIR /app/xet-backend-sync/build
RUN cmake .. && make
RUN mv xet-backend-sync-exe ../../package

# 删除安装文件
WORKDIR /app/package
RUN echo "删除安装文件"
RUN rm -rdf oatpp
RUN rm -rdf oatpp-websocket
RUN rm -r libmysqlcppconnx2_9.3.0-1ubuntu24.04_amd64.deb
RUN rm -r libmysqlcppconn10_9.3.0-1ubuntu24.04_amd64.deb
RUN rm -r libmysqlcppconn-dev_9.3.0-1ubuntu24.04_amd64.deb
RUN rm -r libmysqlcppconnx2-dbgsym_9.3.0-1ubuntu24.04_amd64.deb
RUN rm -r libmysqlcppconn10-dbgsym_9.3.0-1ubuntu24.04_amd64.deb

# 执行程序
WORKDIR /app/package
RUN chmod +x run.sh
CMD ["/app/package/run.sh"]
