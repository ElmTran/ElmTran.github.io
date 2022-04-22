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
  `docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]`

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

  - Dockerfile指令
    - COPY: 从源路径中的文件/目录复制到新的一层镜像的目标路径  
     `COPY [--chown=<user>:<group>] <源路径>...<目标路径>`
    - ADD: 更高级的url，和COPY的格式类似，但是源路径可以是url，如果是tar文件，格式是gzip,bzip2,xz的情况，会自动解压。
    - CMD: 容器启动命令  
     `CMD <命令>`  
     `CMD ["可执行文件", "参数1", "参数2", ...]`  
     `CMD ["参数1", "参数2", ...]`（用于指定ENTRYPOINT指令的参数）  
     这类格式在被解析时会被解析成json格式，所以这里只能用双引号。
    - ENTRYPOINT: 和RUN类似，让镜像变得像命令一样使用，应用运行前的准备。
     `<ENTRYPOINT> "<CMD>"`
    - ENV: 设置环境变量  
     `ENV <key> <value>`  
     `ENV <key1>=<value1> <key2>=<value2>`  
    - ARG: 设置环境变量，容器运行后将失效  
     `ARG <参数名>[=<默认值>]`  
    - VOLUME 挂载匿名卷  
     `VOLUME ["<路径1>","<路径2>"...]  
    - EXPOSE 开放端口  
     `EXPOSE <端口1> [<端口2>...]`  
    - WORKDIR 指定工作目录  
     `WORKDIR <工作目录路径>`  
    - USER 指定当前用户  
     `USER <用户名> [:<用户组>]`  
    - HEALTHCHECK 健康检查  
     `HEALTHCHECK [选项] CMD <命令>`  
     `HEALTHCHECK NONE`
    - ONBUILD 构建下一级镜像的时候执行  
     `ONBUILD <其他指令>`  
    - LABEL 添加元数据  
     `LABEL <key>=<value> <key>=<value> <key>=<value> ...`
    - SHELL 指定shell
     `SHELL ["executable", "parameters"]`

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
  查看实时日志使用`-f`参数  


## 参考链接
- [Dockerfile 官方文档](https://docs.docker.com/engine/reference/builder/)
- [Dockerfile 实践文档](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)