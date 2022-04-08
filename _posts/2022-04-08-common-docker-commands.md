---
layout: post
title: "Common Docker Commands"
description: "Docker命令速查表"
categories: [technology]
tags: [docker, docker-compose, docker-swarm]
redirect_from:
  - /2022/04/08/
---

## Docker-compose
- 验证yaml文件  
  `docker-compose config -q`  

- 构建镜像  
  `docker-compose build image-name`  
  可以添加`--no-cache`参数创建不带缓存的镜像  

- 构建并启动  
  `docker-compose up -d container-name`  

- 删除容器和镜像  
  `docker-compose down`  

- 显示所有容器  
  `docker-compose ps`  

- 启动容器  
  `docker-compose start container-name`

- 停止容器  
  `docker-compose stop container-name`

- 重启容器  
  `docker-compose restart container-name`  

- 暂停容器  
  `docker-compose pause container-name`  

- 恢复容器  
  `docker-compose unpause container-name`  

- 删除容器  
  `docker-compose rm container-name`   

- 执行命令  
  `docker-compose exec container-name command`  

- 查看日志  
  `docker-compose logs container-name`  
  `-f`参数查看实时日志  
