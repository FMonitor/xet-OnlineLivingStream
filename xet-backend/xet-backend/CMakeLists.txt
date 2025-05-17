cmake_minimum_required(VERSION 3.1)

set(project_name xet-backend) ## rename your project here

project(${project_name})

set(CMAKE_CXX_STANDARD 17)

include_directories(src)

add_library(${project_name}-lib
        src/AppComponent.hpp
        src/controller/MyController.cpp
        src/controller/MyController.hpp
        src/dto/DTOs.hpp
        # 视频流相关文件
        src/controller/MediaController.cpp
        src/controller/MediaController.hpp
        src/Utils.cpp
        src/Utils.hpp
        src/hls/Playlist.cpp
        src/hls/Playlist.hpp
        

)

## link libs

find_package(oatpp 1.3.0 REQUIRED)

target_link_libraries(${project_name}-lib
        PUBLIC oatpp::oatpp
        PUBLIC oatpp::oatpp-test
)

## add executables

add_executable(${project_name}-exe
        src/App.cpp
)
target_link_libraries(${project_name}-exe ${project_name}-lib)
add_dependencies(${project_name}-exe ${project_name}-lib)

add_executable(${project_name}-test
        test/tests.cpp
        test/app/TestComponent.hpp
        test/app/MyApiTestClient.hpp
        test/MyControllerTest.cpp
        test/MyControllerTest.hpp
)
target_link_libraries(${project_name}-test ${project_name}-lib)
add_dependencies(${project_name}-test ${project_name}-lib)

# 视频流：规定视频文件存储路径
add_definitions(
        -DEXAMPLE_MEDIA_FOLDER="${CMAKE_CURRENT_LIST_DIR}/video"
)

set_target_properties(${project_name}-lib ${project_name}-exe ${project_name}-test PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        CXX_STANDARD_REQUIRED ON
        LINKER_LANGUAGE CXX
)



# enable_testing()
# add_test(project-tests ${project_name}-test)