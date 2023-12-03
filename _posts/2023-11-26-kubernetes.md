---
layout: post
title: "Kubernetes"
description: "Study notes for Kubernetes."
categories: [technology]
tags: [kubernetes, docker, container, devops, k8s]
redirect_from:
  - /2023/11/26/
---

## 概述

### 分布式资源管理器发展历程：

apache mesos -> docker swarm -> kubernetes

### 什么是kubernetes

kubernetes是google开源的容器集群管理系统，是google内部Borg系统的开源版本。

### 特性

1. 自动装箱

2. 自动修复

3. 弹性伸缩（水平扩展）

4. 负载均衡

5. 滚动更新

6. 版本回退

7. 密钥和配置管理

8. 存储编排

9. 批处理执行

## 架构

### 架构图

![kubernetes架构图](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/kubernetes.webp)

### 组件

#### Master

1. API Server: 提供http restful接口，供客户端和其他组件调用，是kubernetes的入口。

2. Scheduler: 负责资源调度，根据资源情况和调度策略，将pod调度到合适的node上。

3. controller manager: 负责集群资源的管理，如node、pod、rc、service等。

4. etcd: 分布式键值存储，保存了整个集群的状态和持久化信息。具有高可用性，可以通过部署多个etcd实例来实现。

#### Node

kubelet: 负责维护容器的生命周期，同时与master节点通信，将node上的信息汇报给master，如node上运行的pod、node的状态等。

kube-proxy: 写入iptables规则，负责为pod提供cluster内部的服务发现和负载均衡。

docker: 负责容器的创建、启停等任务。

#### 插件

1. coredns: 负责为pod提供dns服务。

2. dashboard: 提供web界面，用于集群的管理。

3. ingress controller: 负责集群外部的访问，如将外部的请求转发到集群内部的pod。

4. fedration: 负责多集群的管理。

5. prometheus: 提供监控服务。

6. elk（elasticsearch、logstash、kibana）: 提供日志服务。

### 核心概念

#### Pod

1. Pod：pod是kubernetes的最小调度单位，是一组容器的集合，pod中的容器共享网络和存储。生命周期短暂，随时可能被销毁，因此pod中的容器不应该存储持久化数据。pause容器是pod中的第一个容器，负责为pod中的其他容器提供网络和存储。

2. Controller：pod的控制器，用于管理pod的生命周期，如创建pod、更新pod、删除pod等。常见的控制器有：Replication Controller、Replica Set、Deployment、StatefulSet、DaemonSet、Job、CronJob。

#### Service

服务，用于定义一组pod（比如一组nginx pod）的访问规则。服务分为两种类型：

  - ClusterIP: 仅在集群内部可以访问。
  - NodePort: 在集群内部和集群外部都可以访问。

### 高可用集群

- 架构

    ![kubernetes高可用集群架构图](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/kubernetes-ha.webp)

- master中新增组件

  - keepalived: 用于实现虚拟ip，检查master状态，保证master节点的高可用性。

  - haproxy: 用于实现负载均衡，将请求转发到master节点。

### 容器交付流程

1. 开发阶段：开发人员在本地开发环境中编写代码，本地测试，编写Dockerfile。

2. CI/CD阶段：开发人员将代码提交到git仓库，触发CI/CD流程，将代码打包成镜像，推送到镜像仓库。

3. 部署阶段：运维人员在kubernetes集群中部署镜像，创建pod、service，ingress等。

4. 运维阶段：运维人员监控集群状态，对集群进行扩容、升级等操作。

### K8S项目部署流程

制作镜像 -> 推送镜像 -> 部署镜像（Deployment） -> 暴露服务（Service） -> 访问服务（Ingress）-> 集群监控（Prometheus）-> 集群日志（ELK）

## Tips

- 集群数量：大于等于3个，最好是奇数个，保证高可用性（投票机制）。如果是偶数个，可能会出现脑裂的情况。
