################################################################################
### 基础配置区 - 项目元信息与编译标准设置
################################################################################
cmake_minimum_required(VERSION 3.1)
set(project_name xet-backend-async)  ## 项目名称定义（需重命名处）
project(${project_name})

################################################################################
### 核心库构建区 - 构建项目主库及头文件配置
################################################################################
## 主库文件集合（包含组件/控制器/服务/DAO层）
add_library(${project_name}-lib
        src/AppComponent.hpp
        src/dto/DTOs.hpp
        src/ErrorHandler.hpp
        src/ErrorHandler.cpp

        # 视频流相关文件
        src/controller/MediaController.cpp
        src/controller/MediaController.hpp
        src/Utils.cpp
        src/Utils.hpp
        src/hls/Playlist.cpp
        src/hls/Playlist.hpp

        # websocket服务器相关组件
        src/controller/RoomsController.hpp
        src/rooms/Peer.cpp
        src/rooms/Peer.hpp
        src/rooms/Room.cpp
        src/rooms/Room.hpp
        src/rooms/Lobby.cpp
        src/rooms/Lobby.hpp

        # 数据库相关组件
        src/service/Service.hpp
        src/service/Service.cpp
        src/dto/DTOs.hpp
        # swaggerui相关组件
        # src/SwaggerComponent.hpp
)

## 主库头文件路径配置
target_include_directories(${project_name}-lib PUBLIC src)

################################################################################
### 依赖管理区 - 第三方库发现与链接
################################################################################
## OATPP核心依赖
find_package(oatpp 1.3.0 REQUIRED)
find_package(oatpp-websocket 1.3.0 REQUIRED) # 加载swagger组件
## Linux系统级依赖
if(CMAKE_SYSTEM_NAME MATCHES Linux)
    find_package(Threads REQUIRED)          ## 线程库支持
endif()
################################################################################
### 链接配置区 - 库与可执行文件链接关系
################################################################################
## 主库依赖链接（OATPP系列）
target_link_libraries(${project_name}-lib PUBLIC
    oatpp::oatpp
    oatpp::oatpp-websocket
)

## Linux系统库补充链接
if(CMAKE_SYSTEM_NAME MATCHES Linux)
    target_link_libraries(${project_name}-lib INTERFACE 
        Threads::Threads 
        ${CMAKE_DL_LIBS}
    )
endif()

################################################################################
### 可执行文件构建区 - 主程序与测试程序
################################################################################
## 主程序构建
add_executable(${project_name}-exe
    src/App.cpp
)
target_link_libraries(${project_name}-exe ${project_name}-lib)
add_dependencies(${project_name}-exe ${project_name}-lib)

## 测试程序构建
# add_executable(${project_name}-test
#     test/tests.cpp
#     test/app/TestComponent.hpp
#     test/app/MyApiTestClient.hpp
#     test/MyControllerTest.cpp
#     test/MyControllerTest.hpp
# )
# target_link_libraries(${project_name}-test ${project_name}-lib)
# add_dependencies(${project_name}-test ${project_name}-lib)

target_link_libraries(${project_name}-exe 
    ${project_name}-lib
)
################################################################################
### 编译选项区 - 预定义宏与标准设置
################################################################################
## 全局预定义宏
add_definitions(
    -DEXAMPLE_MEDIA_FOLDER="${CMAKE_CURRENT_LIST_DIR}/file"  ## 视频文件存储路径

)

## 目标属性统一配置
set_target_properties(${project_name}-lib ${project_name}-exe PROPERTIES
    CXX_STANDARD 17
    CXX_EXTENSIONS OFF
    CXX_STANDARD_REQUIRED ON
    LINKER_LANGUAGE CXX
)

################################################################################
### 测试配置区 - 测试框架集成
################################################################################
# enable_testing()
# add_test(NAME project-tests COMMAND ${project_name}-test)