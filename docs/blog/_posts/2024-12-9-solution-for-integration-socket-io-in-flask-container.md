---
layout: post
title: "Solution for integration socket-io in flask container"
description: "在flask容器中集成socket-io"
categories: [technology]
tags: [flask, socket-io, docker, python, k8s, nginx, gunicorn]
date: 2024/12/09
---

## Background

在 flask 容器中使用 gunicorn 多进程模型时，无法使用 socket-io。

Socket-io can only be used in single-process mode.

## Solution

### flask 设置

- 使用循环创建多个 flask 进程 （单节点）

- Use loop to create multiple flask processes (single node)

  ```bash
  for port in $(seq 5001 5002)
  do
      if [ $port -eq 5002 ]; then
          gunicorn -w 1 -b 0.0.0.0:$port --timeout 600 manage:app --worker-class eventlet
      else
          gunicorn -w 1 -b 0.0.0.0:$port --timeout 600 manage:app --worker-class eventlet &
      fi
  done
  ```

### 容器中 nginx 配置

- 在容器中添加第一层 nginx 反向代理，将请求转发到多个 flask 进程，并使用 nginx 的 ip_hash 负载均衡

- Use nginx ip_hash load balancing to forward requests to multiple flask processes

  ```nginx
  upstream web {
      ip_hash;
      server 127.0.0.1:5001;
      server 127.0.0.1:5002;
  }

  server {
      listen 80;
      server_name localhost;
      location / {
          proxy_pass http://web;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```

### 外部 nginx 配置

- 多节点部署，外部 nginx 代理也使用 ip_hash

- Use ip_hash for external nginx proxy in multi-node deployment

  ```nginx
  upstream web {
      ip_hash;
      server 192.168.0.1:5000;
      server 192.168.0.2:5000;
  }
  ```

### Ingress 配置

- ingress 需要使用 hash 负载均衡

- ingress uses hash load balancing

  ```nginx
  nginx.ingress.kubernetes.io/upstream-hash-by: "request_uri"
  ```

## Conclusion

为了会话保持，需要用户访问时，需要将请求转发到同一个 flask 进程。

Forward the request to the same flask process when the user accesses.

## Reference

- [How to use multiple nodes with socket.io](https://socket.io/docs/v4/using-multiple-nodes/)
