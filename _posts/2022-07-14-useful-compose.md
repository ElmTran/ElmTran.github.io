---
layout: post
title: "Useful Compose"
description: "一些docker compose安装命令"
categories: [technology]
tags: [Docker, Docker Compose]
redirect_from:
  - /2022/06/29/
---

- mongodb

    ```yaml
    version: '3'
    services:
        mongodb:
            image: mongodb:latest
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

- kafka & zookeeper

    ```yaml
    version: '3'
    services:
        zookeeper:
            image: 'zookeeper:latest'
            ports:
            - '2181:2181'
            environment:
            - ALLOW_ANONYMOUS_LOGIN=yes
        kafka:
            image: 'kafka:latest'
            ports:
                - '9092:9092'
            environment:
                - KAFKA_BROKER_ID=1
                - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092
                - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
                - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
                - ALLOW_PLAINTEXT_LISTENER=yes
    ```

- redis

    ```yaml
    version: '3'
    services:
        redis:
            image: redis:latest
            ports:
                - '6379:6379'
            command: >
                redis-server --save 20 1 --loglevel warning --requirepass ${PASSWORD}
            volumes:
                - ./data/redis:/data
    ```

- rabbitmq

    ```yaml
    version: '3'
    services:
        rabbitmq:
            image: rabbitmq:latest
            ports:
                - 5672:5672
                - 15672:15672
            volumes:
                - ./data/rabbitmq/:/var/lib/rabbitmq/
                - ./data/rabbitmq/log/:/var/log/rabbitmq
    ```

- mysql

    ```yaml
    version: '3'
    services:
        mysql:
            image: mysql:5.7.18
            volumes:
                - ./data/mysql/mydir:/mydir
                - ./data/mysql/datadir:/var/lib/mysql
                - ./data/mysql/conf/my.cnf:/etc/my.cnf
                # 数据库还原目录 可将需要还原的sql文件放在这里
                - ./data/mysql/source:/docker-entrypoint-initdb.d
            environment:
                - "MYSQL_ROOT_PASSWORD=${PASSWORD}"
                - "MYSQL_DATABASE=${DBNAME}"
                - "MYSQL_USER=${USERNAME}"
                - "MYSQL_PASSWORD=${PASSWORD}"
                - "TZ=Asia/Shanghai"
            ports:
                - 3306:3306
    ```

- arangodb

    ```yaml
    version: '3'
    services:
        arangodb:
            image: arangodb:latest
            environment:
                ARANGO_ROOT_PASSWORD: ${PASSWORD}
            ports:
                - 38529:8529
            volumes:
                - ./data/arangodb/3:/var/lib/arangodb3
                - ./data/arangodb/apps:/var/lib/arangodb3-apps
    ```

- elasticsearch

    ```yaml
    version: '3'
    services:
        elasticsearch:
            image: elasticsearch:latest
            environment:
                - discovery.type=single-node
            volumes:
                - /etc/localtime:/etc/localtime
                - ./data/es:/usr/share/elasticsearch/data
                - ./plugins:/usr/share/elasticsearch/plugins
            ports:
                - "9200:9200"
                - "9300:9300"
    ```