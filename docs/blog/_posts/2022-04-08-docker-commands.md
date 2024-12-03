---
layout: post
title: "Docker Commands"
description: "Docker命令速查表"
categories: [technology]
tags: [docker, docker-compose, docker-swarm]
date: 2022/04/08
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

  - Dockerfile 指令

    - COPY: 从源路径中的文件/目录复制到新的一层镜像的目标路径  
      `COPY [--chown=<user>:<group>] <源路径>...<目标路径>`
    - ADD: 更高级的 url，和 COPY 的格式类似，但是源路径可以是 url，如果是 tar 文件，格式是 gzip,bzip2,xz 的情况，会自动解压。
    - CMD: 容器启动命令  
      `CMD <命令>`  
      `CMD ["可执行文件", "参数1", "参数2", ...]`  
      `CMD ["参数1", "参数2", ...]`（用于指定 ENTRYPOINT 指令的参数）  
      这类格式在被解析时会被解析成 json 格式，所以这里只能用双引号。
    - ENTRYPOINT: 和 RUN 类似，让镜像变得像命令一样使用，应用运行前的准备。
      `<ENTRYPOINT> "<CMD>"`
    - ENV: 设置环境变量  
      `ENV <key> <value>`  
      `ENV <key1>=<value1> <key2>=<value2>`
    - ARG: 设置环境变量，容器运行后将失效  
      `ARG <参数名>[=<默认值>]`
    - VOLUME 挂载匿名卷  
      `VOLUME ["<路径1>","<路径2>"...]`
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
    - SHELL 指定 shell  
      `SHELL ["executable", "parameters"]`

  - [多阶段构建](https://yeasy.gitbook.io/docker_practice/image/multistage-builds)
  - 其他
    - 构建支持多架构的镜像
      - 创建 manifest 列表  
        `docker manifest create MANIFEST_LIST MANIFEST [MANIFEST...]`
      - 设置 manifest 列表  
        `docker manifest annotate [OPTIONS] MANIFEST_LIST MANIFEST`
      - 查看 manifest 列表  
        `docker manifest inspect <镜像名>`
      - 推送 manifest 列表  
        `docker manifest push <镜像名>`
    - 其他镜像制作方法
      - 从 rootfs 压缩包导入:  
        `docker import [选项] <文件>|<URL>|- [<仓库名>[:<标签>]]`
      - 导出镜像:  
        `docker save`
      - 导入镜像:  
        `docker load`

### Docker Buildx

- 使用文件缓存  
  `--mount=type=cache, target=[container_path], id=[cache_id]`

- 挂载镜像或上阶段文件  
  `--mount=type=bind`

- 挂载 tmpfs
  `--mount=type=tmpfs`

- 挂载密钥
  `--mount=type=secret`

- 挂载 ssh 密钥
  `--mount=type=ssh`

- 构建镜像
  `docker buildx build`

### 容器

- 启动容器  
  `docker run`: 新建并启动  
  `docker container start`: 启动一个终止(exited)的容器  
  `-d`: 守护态  
  `-i`: 交互模式  
  `-t`: 分配一个终端

- 终止容器  
  `docker container stop`

- 重启容器  
  `docker container restart`

- 进入容器  
  `docker attach`: 从 stdin 退出，会导致容器终止。  
  `docker exec`: 不会导致容器终止

- 导出容器  
  `docker export`: 快照将丢弃所有的历史记录和元信息

- 导入容器  
  `docker import`: 可以重新指定标签等元信息

- 删除容器  
  `docker container rm`

- 清空容器  
  `docker container prune`

- 查看容器信息  
  `docker container ls`

- 查看容器日志  
  `docker container logs [container_id or container_name]`

- 对比改动  
  `docker diff [container]`

- 查看镜像历史  
  `docker history [image]`

## Docker-compose

- 验证 yaml 文件  
  `docker-compose config -q`

- 构建镜像  
  `docker-compose build [image-name]`  
  可以添加`--no-cache`参数创建不带缓存的镜像

- 构建并启动  
  `docker-compose up -d [container]`

- 拉取服务依赖镜像  
  `docker-compose pull`

- 推送服务依赖镜像
  `docker-compose push`

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

- 执行命令(进入容器)  
  `docker-compose exec [container] [command]`

- 在指定服务上执行一个命令  
  `docker-compose run`

- 强制停止容器
  `docker-compose kill`

- 设置规模  
  `docker-compose scale`

- 查看容器进程  
  `docker-compose top`

- 查看日志  
  `docker-compose logs [container]`  
  查看实时日志使用`-f`参数

- 指定模板  
  `-f,--file [file]`

- 指定项目名称  
  `-p, --project [project]`

- 输出更多调试信息  
  `--verbose`

- 查看所有镜像  
  `--images`

## Docker-compose 模板

- 构建镜像
  `build`

- 控制内核能力
  `cap_add, cap_drop`

- 默认执行命令
  `command`

- 指定父组
  `cgroup_parent`

- 指定容器名称
  `container_name`

- 指定设备映射关系
  `devices`

- 解决依赖关系
  `depends_on`

- 设置 dns
  `dns`

- 设置搜索域
  `dns-search`

- 挂载 tmpfs 到文件系统
  `tmpfs`

- 指定环境变量文件
  `env_file`

- 指定环境变量内容
  `environment`

- 暴露端口
  `expose`

- 链接到外部容器
  `external_links`

- 指定额外的 host 名称映射信息
  `external_hosts`

- 健康检查
  `healthcheck`

- 指定镜像
  `image`

- 添加元数据
  `labels`

- 日志配置
  `logging`

- 网络模式
  `network_model`

- 连接网络
  `networks`

- 暴露端口信息
  `ports`

- 存储敏感信息
  `secrets`

- 指定容器模板标签的默认属性(用户、角色、类型、等级等)
  `security_opt`

- 指定其他信号停止容器
  `stop_signal`

- 配置容器内容参数
  `sysctls`

- 指定 ulimits 限制值
  `ulimits`

- 挂载目录
  `volumes`

- [其他指令](https://yeasy.gitbook.io/docker_practice/compose/compose_file)

### Docker Swarm

- 初始化: `docker swarm init`

- 增加工作节点: `docker swarm join --token`

- 查看当前网络: `docker network ls`

- 查看节点: `docker node ls`

- 新建服务: `docker service create`

- 查看服务列表: `docker service ls`

- 查看服务详情: `docker service ps <service-name>`

- 查看服务日志: `docker service logs`

- 更新服务: `docker service update <service-name>`  
  `--force`: 参数强制更新(重启)

- 回退服务: `docker service rollback`

- 服务扩容: `docker service scale`

- 移除服务: `docker service rm`

- 使用 docker-compose: `docker stack deploy -c docker-compose.yml <name>`

- 创建密钥: `openssl rand -base64 20 | docker secret create`

- 查看密钥: `docker secret ls`

- 配置文件: `docker config`

- 环境变量必须通过'--env-file'显式指定，且不要在 envorinment 中重复指定相同的变量

### 仓库

- 登录: `docker login`

- 登出: `docker logout`

- 查找镜像: `docker search`

- 标记镜像: `docker tag`

- 上传镜像: `docker push`

- [Docker Compose 创建私有仓库](https://yeasy.gitbook.io/docker_practice/repository/registry_auth)

- [Nexus3 创建私有仓库](https://yeasy.gitbook.io/docker_practice/repository/nexus3_registry)

### 数据管理

- 创建数据卷  
  `docker volume create [volume]`

- 查看所有数据卷  
  `docker volume ls`

- 查看数据卷信息  
  `docker volume inspect [volume]`

- 启动挂载数据卷的容器  
  `--mount source=[volume], target=[container_path]`

- 挂载本地目录  
  `--mount type=bind, source=[host_path], target=[container_path]`

- 删除数据卷  
  `docker volume rm [volume]`

- 清理无主数据卷  
  `docker volume prune`

### 网络管理

- 端口映射  
  `-p [ip:host_port:container_port]/[ip::container_port]/[host_port:container_port]`

- 查看映射  
  `docker port`

- 自定义 docker 网络  
  `docker network create -d [netType] [netName]`

- 连接自定义网络
  `--network [netName]`

- 配置 dns  
  修改全部 dns：更改`/etc/docker/daemon.json`文件
  指定容器 dns：`-h HOSTNAME/--hostname=HOSTNAME`或者`--dns=IP_ADDRESS`
  设置搜索域：`--dns-search=DOMAIN`

- [高级网络配置](https://yeasy.gitbook.io/docker_practice/advanced_network)

## 参考链接

- [Dockerfile 官方文档](https://docs.docker.com/engine/reference/builder/)
- [Dockerfile 实践文档](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker 镜像 实现原理](https://yeasy.gitbook.io/docker_practice/image/internal)
