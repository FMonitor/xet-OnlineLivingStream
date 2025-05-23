FROM cmake:latest AS builder
WORKDIR /app
COPY ./xet-backend .

RUN cd xet-backend

RUN cd xet-backend-async
RUN mkdir build && cd build
RUN cmake .. && make
COPY xet-backend-async-exe ../../package
RUN cd ../..

RUN cd xet-backend-sync
RUN mkdir build && cd build
RUN cmake .. && make
COPY xet-backend-async-exe ../../package
RUN cd ../..

RUN cd ..

FROM ubuntu:24.04
WORKDIR /app

COPY --from=builder /app/xet-backend/package /app

# 安装oatpp
RUN cd oatpp-1.3.0-latest 
RUN mkdir build && cd build
RUN cmake .. && sudo make install
RUN cd ../..
# 安装oatpp-websocket
RUN cd oatpp-websocket-1.3.0-latest
RUN mkdir build && cd build
RUN cmake .. && sudo make install
RUN cd ../..
# 安装MySQL Connector/C++
RUN sudo dpkg -i libmysqlcppconnx2_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo dpkg -i libmysqlcppconn10_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo dpkg -i libmysqlcppconn-dev_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo dpkg -i libmysqlcppconnx2-dbgsym_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo dpkg -i libmysqlcppconn10-dbgsym_9.3.0-1ubuntu24.04_amd64.deb

# 删除安装文件
RUN sudo rm -rdf oatpp-1.3.0-latest
RUN sudo rm -rdf oatpp-websocket-1.3.0-latest
RUN sudo rm -r libmysqlcppconnx2_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo rm -r libmysqlcppconn10_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo rm -r libmysqlcppconn-dev_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo rm -r libmysqlcppconnx2-dbgsym_9.3.0-1ubuntu24.04_amd64.deb
RUN sudo rm -r libmysqlcppconn10-dbgsym_9.3.0-1ubuntu24.04_amd64.deb

# 执行程序
RUN xet-backend-async-exe
RUN xet-backend-sync-exe
