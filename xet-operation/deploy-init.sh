#!/bin/bash

# 设置国内源
echo "正在更新 APT 源..."
sudo apt-get update
sudo apt-get install -y curl gnupg ca-certificates lsb-release git apt-transport-https software-properties-common

# 添加 Docker
echo "安装 Docker..."
sudo apt-get install -y docker.io docker-compose 
sudo systemctl start docker

# 设置 Docker 国内镜像源
echo "配置 Docker 加速镜像..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF

sudo systemctl daemon-reexec
sudo systemctl restart docker

# 检查版本
echo "初始化完成，版本信息如下："
docker --version
docker-compose version
