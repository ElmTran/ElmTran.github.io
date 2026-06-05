---
layout: post
title: "Go Dev Environment"
description: "搭建go开发环境"
categories: [technology]
tags: [go, dev-environment, programming]
date: 2022/05/06
---

## Install Go

- by scoop

  `scoop install go`

- check version

  `go version`

- set proxy (optional)

```sh
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

- install vscode extension

## Install Go Tools

- install nunu (cli tool)

  `go install github.com/go-nunu/nunu@latest`

## Init Project

- create project

  `nunu new project`

- create component

```
nunu create handler user
nunu create service user
nunu create repository user
nunu create model user
```

or

```
nunu create all user
```

## Run Project

- run project

  `nunu run`

## Compile wire.go

- compile wire.go

  `nunu wire`

## golangci-lint

- [Go 编写优雅规范的代码，静态代码扫描](https://mp.weixin.qq.com/s/Am7rTcbOFSKLRyggHcvaSA)

## Reference

- [go-nunu](https://github.com/go-nunu/nunu)
