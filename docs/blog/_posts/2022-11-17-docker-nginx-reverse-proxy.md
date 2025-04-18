---
layout: post
title: "Docker Nginx Reverse Proxy"
description: "Docker Nginx Reverse Proxy"
categories: [technology]
tags: [learning, technology, docker, nginx, reverse-proxy]
date: 2022/11/17
---

## A Example

### Docker Compose

```yaml
version: "3"
services:
  dufs:
    image: sigoden/dufs
    volumes: ...
    environment:
      - "DUFS_PASSWORD=${DUFS_PASSWORD}"
      - "DUFS_USER=${DUFS_USER}"
    command: ...
    ports:
      - 8000:8000
  nginx:
    image: nginx:latest
    volumes:
      - ./nginx/conf:/etc/nginx
      - ./nginx/html:/usr/share/nginx/html
    ports:
      - 80:80
      - 443:443
```

### Nginx Configuration

```nginx

server {
    listen       80;
    listen       443;
    listen  [::]:80;
    listen  [::]:443;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    location /files/ {
        proxy_pass http://dufs:8000/;
        client_max_body_size 1024m;
    }

    location ~ .*dufs.*\.(gif|jpg|jpeg|png|bmp|swf|flv|mp4|ico)$ {
        proxy_pass http://dufs:8000;
        expires 12h;
    }

    location ~ .*dufs.*\.(js|css)?$ {
        proxy_pass http://dufs:8000;
        expires 7h;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}

```

### Nginx With Certificate

```nginx
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name domain.com;

    ssl_certificate   /etc/nginx/cert.crt;
    ssl_certificate_key  /etc/nginx/cert.key;
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # Aria2 API
    location ~ .*jsonrpc$ {
        proxy_pass https://aria2:6800;
    }

    # File manager
    location /files/ {
        proxy_pass http://dufs:8000/;
        client_max_body_size 1024m;
    }

    # Aria2 webui
    location /download/ {
        proxy_pass http://ariang:6880/;
    }

    # Other static files
    location ~ .*dufs.*\.(gif|jpg|jpeg|png|bmp|swf|flv|mp4|ico)$ {
        proxy_pass http://dufs:8000;
        expires 12h;
    }

    location ~ .*dufs.*\.(js|css)?$ {
        proxy_pass http://dufs:8000;
        expires 7h;
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```
