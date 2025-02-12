---
layout: post
title: "Port Forwarding"
description: "三种端口转发及ssh实现"
categories: [technology]
tags: [port forwarding, ssh, tennel]
date: 2022/03/21
---

## 动态转发

    通过本机端口访问远程服务：
        ssh -D local-port tennel-host -N
        -D: 表示动态转发
        local-port: 本地端口
        tunnel-host: 服务器地址
        -N: 表示只进行端口转发，不远程登录
    访问示例：
        前置条件：
            本地 -> www.example.com ×
            tennel -> hostwww.example.com ✔
        转发之后：
            本地 -> www.example.com ✔
        访问方法：
            curl -x socks5://localhost:local-port http://www.example.com
    持久化转发：
        在~/.ssh/config写入：DynamicForward tunnel-host:local-port

## 本地转发

    通过本机端口访问跳板机再到远程服务：
        ssh -L local-port:target-host:target-port tunnel-host -N
        -L: 表示本地转发
        local-host: 本地端口
        target-host: 需要转发的目标服务器
        target-port: 需要转发的目标端口
        tunnel-host: 跳板机
        -N:不登录
    访问示例：
        前置条件：
            other-host -> target-host:target-port ×
            other-host -> local-host:local-port ✔
        转发之后：
            other-host -> target-host:target-port
        访问方法：
            curl local-host:local-port
    持久化转发：
        在~/.ssh/config写入：
            Host tennel-host
            LocalForward local-ip:local-port target-ip:target-port
    注意：只有本地到跳板机这一段是加密的，跳板机到目标服务器是未加密的。

## 远程转发

    通过访问远程的机器到本地服务：
        ssh -R remote-port:target-host:target-port remote-host -f
        -R: 表示远程转发
        remote-port: 表示远程计算机端口
        target-host: 表示目标服务器地址
        target-port: 表示目标服务器端口
        remotehost: 是远程计算机
        -f: 表示后台运行
    使用示例：
        前置条件：
            other-host -> remote-host:remote-port ✔
            other-host -> target-host:target-port ×
        转发之后：
            other-host -> target-host:target-port ✔
        访问方法：
            curl remote-host:remote-port
    持久化转发：
        在~/.ssh/config写入：
            Host remote-forward
            HostName remote-host
            RemoteForward remote-port target-host:target-port
        执行：ssh -N remote-forward

## 应用场景

- 简易 VPN  
   `ssh -L local-port:remote-host:port tunnel-host -N`
- 两级跳板
  - 在本机执行，这里的 localhost 是指 tunnel1-host 的：  
     `ssh -L port:localhost:tunnel1-port tunnel1-host`
  - 在跳板机 1 上执行，通过跳板机 2 连接到目标机器  
     `ssh -L tunnel1-port:target-host:target-port tunnel2-host -N`
  - 转发过程：
    1. 先将本地 local-port 和 tennel1-host 建立一条隧道，也就是 tunelhost1 收到本机收到请求后转发给 tunnel1-host 的 localhost:tunnel1-port。
    2. tunnel1-host:tunnel1-port 收到请求后通过跳板机 2(tennel2-host)链接到 target-host:target-port。

## 参考链接

- [An Illustrated Guide to SSH Tunnels](https://solitum.net/posts/an-illustrated-guide-to-ssh-tunnels/), Scott Wiersdorf
- [SSH 端口转发](https://wangdoc.com/ssh/port-forwarding.html), 阮一峰
