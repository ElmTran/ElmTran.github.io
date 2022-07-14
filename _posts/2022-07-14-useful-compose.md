---
layout: post
title: "Some Useful Docker Compose"
description: "一些docker compose安装命令"
categories: [technology]
tags: [Docker, Docker Compose]
redirect_from:
  - /2022/06/29/
---


```yml
version: '3'
services:
    mongo:
        image: bitnami/mongodb
        ports:
            - "27017:27017"
        volumes:
            - "./data/mongodb:/data/db"
            - "/etc/localtime:/etc/localtime"
        environment:
            - TZ=Asia/Shanghai
            - MONGO_INITDB_ROOT_USERNAME=${USERNAME}
            - MONGO_INITDB_ROOT_PASSWORD=${PASSWORD}
        # privileged: true
        command: --auth
```