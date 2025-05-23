FROM aldebaran638/ubuntu_24.04:git-cmake-oatpp_1.3.1-MySQL_9.3.0_cpp
WORKDIR /app

COPY ./xet-backend .

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

# 执行程序
WORKDIR /app/package
CMD ["/app/package/run.sh"]
