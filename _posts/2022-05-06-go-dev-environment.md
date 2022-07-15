---
layout: post
title: "Go Dev Environment"
description: "搭建go开发环境"
categories: [technology]
tags: [Go, Programming Language, Development]
redirect_from:
  - /2022/05/06/
---

## 安装Go

- 通过scoop安装  
  `scoop install go`

- 查看go版本  
  `go version`

- 配置代理  
    ```sh
    go env -w GO111MODULE=on
    go env -w GOPROXY=https://goproxy.cn,direct
    ```

- vscode安装go插件