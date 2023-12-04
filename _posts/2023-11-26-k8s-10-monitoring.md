---
layout: post
title: "K8s-10: Monitoring"
description: "Kubernetes Series: monitoring"
categories: [technology]
tags: [kubernetes, docker, container, devops, k8s，prometheus, grafana]
redirect_from:
  - /2023/11/26/
---

## 监控

### 监控指标

- 集群层面

  - 节点资源利用率: CPU、内存、磁盘、网络

  - 节点数

  - pod数

- Pod层面

  - 容器资源利用率

  - 应用指标

### Prometheus

开源的监控系统，由SoundCloud开发，于2016年加入CNCF，使用Go语言开发。

- 优点

  - 多维度数据模型

  - 灵活的查询语言

  - 不依赖分布式存储

  - 通过pull模式采集时间序列数据

  - 支持多种图形和仪表盘

### Grafana

开源的数据可视化工具，支持多种数据源，如Prometheus、ElasticSearch、InfluxDB、MySQL、PostgreSQL等。

### 监控架构

- 部署步骤

  - 部署node-exporter

  - 部署kube-state-metrics

  - 部署prometheus

  - 部署grafana

    ![kubernetes监控架构图](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/monitoring-k8s.webp)

