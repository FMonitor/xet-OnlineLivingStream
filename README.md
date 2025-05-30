# xet-OnlineLivingStream

本项目为一个轻量级直播互动平台，包含前端展示、后端服务与部署管理三部分，特性包括前后端分离、消息推送、用户交互和文件下载。

## 技术栈

![Static Badge](https://img.shields.io/badge/Oatpp-blue?style=social&logo=oatpp&logoColor=%23000000)  ![Static Badge](https://img.shields.io/badge/Mysql%20Connector%2FC%2B%2B-blue?style=social&logo=mysql&logoColor=%2304479C)  ![Static Badge](https://img.shields.io/badge/Nginx-blue?style=social&logo=nginx&logoColor=%23009688)  ![Static Badge](https://img.shields.io/badge/Docker-blue?style=social&logo=docker&logoColor=%23009688)  ![Static Badge](https://img.shields.io/badge/Vue%2BVite-blue?style=social&logo=vuedotjs&logoColor=%2341B883)  ![Static Badge](https://img.shields.io/badge/Node.js-blue?style=social&logo=nodedotjs&logoColor=%23339933)   ![Static Badge](https://img.shields.io/badge/GitHub%20Actions-blue?style=social&logo=githubactions&logoColor=%233288FF)

## 项目功能介绍

**公网访问地址**：[lcmonitor.dynv6.net](https://lcmonitor.dynv6.net/)

### 前端功能
 
**导航页面**: 提供直播间查看、回放查看并跳转的功能  

**直播间页面**
- 视频功能： 开始/结束直播（仅主播）、返回导航页面、观看直播、调整音量、拖拽进度条、倍速、切换线路、全屏等
- 评论区功能：Websocket实时聊天、向上滚动加载历史信息、发送讲解内容（仅主播）、发送文字和表情评论、下载文件等  

*注：1. 已对手机端进行响应式适配，但视频播放存在一些问题亟待修复。2.可以通过切换用户身份模拟不同用户*

### 后端功能

**MySQL**: 记录用户信息、直播间信息（直播状态、讲解、评论、文件及下载地址）以及回放地址

**同步服务器**: 负责处理数据库相关的修改和访问

**异步服务器**: 负责处理文件、直播流相关访问

### 运维功能

**Docker**: 容器化平台各模块，便于服务部署和管理

**Github Actions**: 开发过程中提供一键上传，自动部署测试环境的功能，降低调试难度

**Nginx**: 实现路由功能，统一请求入口便于管理

**公网域名和SSL证书**: 提供安全的访问入口

**Portainer**: 实时监控各个容器运行状态，便于调试和后期维护

### 项目开发日志

[前端开发日志](./xet-frontend/README.md)   [后端开发日志](./xet-backend/开发日志.md)  

## 项目目录结构：

```
xet-project/
├── document/              # 项目文档存放目录（目前为空）
├── xet-backend/           # 后端代码目录
|   |-package 打包相关文件
│   ├── xet-backend-async/ # 异步 Oatpp 后端服务（CMake 主目录）
│   └── xet-backend-sunc/  # 同步 Oatpp 后端服务（CMake 主目录）
├── xet-frontend/          # 前端 Vue 项目（Vite + npm）
├── xet-operation/         # 运维部署目录，包括Dockerfile，docker-compose.yml等
└── README.md              # 项目说明文档
```

## Docker结构

- `xet-backend-img` 后端编译镜像，包括同步和异步服务器
- `xet-frontend-img` 基于Nginx打包的前端编译镜像
- `Mysql` MySQL 数据库镜像
- `Portainer` 管理 Docker 容器的可视化工具镜像

## CI/CD 流程说明

项目采用简易 CI/CD 流程，支持从 GitHub 自动构建和部署：

1. 从 dev 分支拉取最新前后端代码
2. 前端构建
   - 使用 npm run build 生成 dist 目录
3. 后端构建
   - CMake + Oatpp 编译同步或异步后端
4. 生成 SSL 证书
   - 使用现有 PEM 文件
5. 打包镜像
   - 前端 + nginx 打包为 xet-frontend-img
   - 后端编译产物打包为 xet-backend-img
6. 拉取基础镜像
   - MySQL、Portainer 等必要服务
7. 通过 docker-compose 启动所有服务

## 开发环境

| 名称 | 工具版本 | 官方文档 |
|----------|----------|----------|
| Windows  | 11       | [Windows 官方文档](https://learn.microsoft.com/en-us/windows/) |
| Ubuntu   | 24.04    | [Ubuntu 官方文档](https://ubuntu.com/) |
| Node.js  | Latest   | [Node.js 官方文档](https://nodejs.org/) |

## 前端

| 技术     | 描述     | 官方文档 |
|----------|----------|----------|
| JavaScript | 前端脚本语言 | [JavaScript 官方文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript) |
| HTML     | 超文本标记语言 | [HTML 官方文档](https://developer.mozilla.org/en-US/docs/Web/HTML) |
| CSS      | 样式表语言 | [CSS 官方文档](https://developer.mozilla.org/en-US/docs/Web/CSS) |

## 运维

| 工具名称 | 工具版本 | 官方文档 |
|----------|----------|----------|
| Docker   | Latest   | [Docker 官方文档](https://docs.docker.com/) |
| Nginx    | Latest   | [Nginx 官方文档](https://nginx.org/en/docs/) |

## 后端

| 工具名称 | 工具版本 | 官方文档 |
|----------|----------|----------|
| C++      | 17       | [C++ 官方文档](https://en.cppreference.com/w/) |
| oat++    | 1.3.0    | [oat++ 官方文档](https://oatpp.io/) |
| MySQL    | 8.0.20   | [MySQL 官方文档](https://dev.mysql.com/doc/) |

## 开发工具

| 工具名称 | 工具版本 | 官方文档 |
|----------|----------|----------|
| Git      | Latest   | [Git 官方文档](https://git-scm.com/doc) |
| CMake    | Latest   | [CMake 官方文档](https://cmake.org/documentation/) |
| VS Code  | Latest   | [VS Code 官方文档](https://code.visualstudio.com/docs) |
| Navicat  | Latest   | [Navicat 官方文档](https://www.navicat.com/en/manual) |