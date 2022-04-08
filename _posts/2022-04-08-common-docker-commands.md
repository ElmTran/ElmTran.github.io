---
layout: post
title: "Common Docker Commands"
description: "Docker命令速查表"
categories: [technology]
tags: [docker, docker-compose, docker-swarm]
redirect_from:
  - /2022/04/08/
---

## Docker

### 镜像
- 拉取镜像  
  `$ docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]`

- 查看镜像  
  `docker image ls`

- 查看镜像体积  
  `docker system df`

- 删除镜像  
  `docker image rm [long ID/short ID/image name]`  
  删除虚悬镜像：`docker image prune`

- 保存镜像  
  `docker commit [选项] <容器ID或容器名> [<仓库名>[:<标签>]]`  

- 构建镜像  
  `docker build -t [<仓库名>[:<标签>]] <上下文路径/URL/->`
  - Dockerfile
    ```
    FROM  [基础镜像]           # 指定基础镜像
    COPY [file] [path]        # 拷贝当前上下文环境的文件到镜像中
    RUN [command1] \          # 执行命令
        && [command2] \
        ...
    ```

  - Dockerfile指令(待施工)
  - 多阶段构建(待施工)
  - 其他  
    - 构建支持多架构的镜像
    - 其他镜像制作方法（待施工）

### 容器

- 对比改动  
  `docker diff [container]`  

- 查看镜像历史  
  `docker history [image]`

## Docker-compose
- 验证yaml文件  
  `docker-compose config -q`  

- 构建镜像  
  `docker-compose build [image-name]`  
  可以添加`--no-cache`参数创建不带缓存的镜像  

- 构建并启动  
  `docker-compose up -d [container]`  

- 删除容器和镜像  
  `docker-compose down`  

- 显示所有容器  
  `docker-compose ps`  

- 启动容器  
  `docker-compose start [container]`

- 停止容器  
  `docker-compose stop [container]`

- 重启容器  
  `docker-compose restart [container]`  

- 暂停容器  
  `docker-compose pause [container]`  

- 恢复容器  
  `docker-compose unpause [container]`  

- 删除容器  
  `docker-compose rm [container]`   

- 执行命令  
  `docker-compose exec [container] [command]`  

- 查看日志  
  `docker-compose logs [container]`  
  `-f`参数查看实时日志  
