---
layout: post
title: "K8s-07: Scheduler"
description: "Kubernetes Series: scheduler"
categories: [technology]
tags: [kubernetes, docker, container, devops, k8s]
date: 2023/11/26
---

## Scheduler

### 调度过程

1. 调度器从 etcd 中获取所有的 node 和 pod 信息。
2. 调度器根据 pod 的 spec 和 node 的 spec，过滤掉不符合要求的 node。（predicate）
3. 调度器根据 node 的 spec 和 pod 的 spec，计算出每个 node 的优先级。(priority)
4. 调度器将 pod 调度到优先级最高的 node 上。
5. 调度器将 pod 的信息写入 etcd 中。
6. kubelet 从 etcd 中获取 pod 的信息，然后创建 pod。

### predicate 算法

- PodFitsResources: 判断 node 上的资源是否满足 pod 的资源需求。
- PodFitsHost: 判断 pod 是否被调度到指定的 node 上。
- PodFitsHostPorts: 判断 pod 的端口是否被占用。
- NoDiskConflict: 判断 pod 的 volume 是否和其他 pod 的 volume 冲突。
- MatchNodeSelector: 判断 node 的 label 是否满足 pod 的 nodeSelector。

### priority 算法

- LeastRequestedPriority: 优先级最低的 pod，优先被调度。
- BalancedResourceAllocation: 资源分配最均衡的 pod，优先被调度。
- ImageLocalityPriority: 镜像在 node 上的缓存情况，优先被调度。

### 节点亲和性

- 硬策略：requiredDuringSchedulingIgnoredDuringExecution

  ```
  apiVersion: v1
  kind: Pod
  metadata:
      name: nginx
  spec:
      affinity:
      nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
          - matchExpressions:
              - key: disktype
              operator: In
              values:
              - ssd
      containers:
      - name: nginx
          image: nginx:1.14.2
          ports:
          - containerPort: 80
  ```

- 软策略：preferredDuringSchedulingIgnoredDuringExecution

  ```
  apiVersion: v1
  kind: Pod
  metadata:
      name: nginx
  spec:
      affinity:
      nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
              preference:
              matchExpressions:
              - key: disktype
              operator: In
              values:
              - ssd
      containers:
      - name: nginx
          image: nginx:1.14.2
          ports:
          - containerPort: 80
  ```

### pod 亲和性

- 硬策略：requiredDuringSchedulingIgnoredDuringExecution

  ```
  apiVersion: v1
  kind: Pod
  metadata:
      name: nginx
  spec:
      affinity:
      podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: security
              operator: In
              values:
              - S1
              topologyKey: failure-domain.beta.kubernetes.io/zone
      containers:
      - name: nginx
          image: nginx:1.14.2
          ports:
          - containerPort: 80
  ```

- 软策略：preferredDuringSchedulingIgnoredDuringExecution

  ```
  apiVersion: v1
  kind: Pod
  metadata:
      name: nginx
  spec:
      affinity:
      podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
              podAffinityTerm:
              labelSelector:
                  matchExpressions:
                  - key: security     # pod的lable security in (S1)
                  operator: In
                  values:
                  - S1
              # node的lable failure-domain.beta.kubernetes.io/zone
              topologyKey: failure-domain.beta.kubernetes.io/zone
      containers:
      - name: nginx
          image: nginx:1.14.2
          ports:
          - containerPort: 80
  ```

- 亲和性关系

|    调度策略     | 匹配标签 |                 操作符                  | 拓扑支持 | 调度目标 |
| :-------------: | :------: | :-------------------------------------: | :------: | :------: |
|  NodeAffinity   |   Node   | In、NotIn、Exists、DoesNotExist, Gt, Lt |    No    |   node   |
|   PodAffinity   |   Pod    |     In、NotIn、Exists、DoesNotExist     |   Yes    |   pod    |
| PodAntiAffinity |   Pod    |     In、NotIn、Exists、DoesNotExist     |   Yes    |   pod    |

- Taint 和 Toleration

  - Taint: 污点，node 上的标签，用于标记 node 的特殊属性，如 node 上不运行 pod。

  - effect:

    - NoSchedule: 不允许调度 pod 到污点的 node 上。
    - PreferNoSchedule: 尽量不要调度 pod 到污点的 node 上。
    - NoExecute: 不允许调度 pod 到污点的 node 上，如果已经调度到污点的 node 上，会被驱逐。

  - 举例：

    ```
    apiVersion: v1
    kind: Pod
    metadata:
        name: nginx
    spec:
        tolerations:
        - key: "key"
            operator: "Equal"
            value: "value"
            effect: "NoSchedule"
        containers:
        - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
    ```

  - Toleration: 容忍度，pod 上的标签，用于标记 pod 的特殊属性，如 pod 可以运行在污点的 node 上。key, value, effect 必须和 node 上的 taint 匹配。且当 operator 为 Exists 时，value 将被忽略。tolerationSeconds 用于设置 pod 容忍污点的时间, 即被驱逐之前的时间。不指定 key 和 effect 时，表示容忍所有污点。

### 固定调度

- 使用 spec.nodeName 字段，将 pod 调度到指定的 node 上。

```
apiVersion: v1
kind: Pod
metadata:
    name: nginx
spec:
    nodeName: node01
    containers:
    - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

- 使用 nodeSelector 字段，将 pod 调度到匹配标签的 node 上。

```
apiVersion: v1
kind: Pod
metadata:
    name: nginx
spec:
    nodeSelector:
    disktype: ssd
    containers:
    - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```
