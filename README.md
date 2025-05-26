# xet-OnlineLivingStream

本项目为一个轻量级直播互动平台，包含前端展示、后端服务与部署管理三部分，特性包括前后端分离、消息推送、用户交互和文件下载。

## 项目目录结构：

```
xet-project/
├── document/              # 项目文档存放目录（目前为空）
├── xet-backend/           # 后端代码目录
│   ├── xet-backend-async/ # 异步 Oatpp 后端服务（CMake 主目录）
│   └── xet-backend-sunc/  # 同步 Oatpp 后端服务（CMake 主目录）
├── xet-frontend/          # 前端 Vue 项目（Vite + npm）
├── xet-operation/         # 运维部署目录，包括Dockerfile，docker-compose.yml等
└── README.md              # 项目说明文档
```

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