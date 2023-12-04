---
layout: post
title: "K8s-7: Scheduler"
description: "Kubernetes Series: scheduler"
categories: [technology]
tags: [kubernetes, docker, container, devops, k8s]
redirect_from:
  - /2023/11/26/
---

## Scheduler

### 调度过程

1. 调度器从etcd中获取所有的node和pod信息。
2. 调度器根据pod的spec和node的spec，过滤掉不符合要求的node。（predicate）
3. 调度器根据node的spec和pod的spec，计算出每个node的优先级。(priority)
4. 调度器将pod调度到优先级最高的node上。
5. 调度器将pod的信息写入etcd中。
6. kubelet从etcd中获取pod的信息，然后创建pod。

### predicate算法

- PodFitsResources: 判断node上的资源是否满足pod的资源需求。
- PodFitsHost: 判断pod是否被调度到指定的node上。
- PodFitsHostPorts: 判断pod的端口是否被占用。
- NoDiskConflict: 判断pod的volume是否和其他pod的volume冲突。
- MatchNodeSelector: 判断node的label是否满足pod的nodeSelector。

### priority算法

- LeastRequestedPriority: 优先级最低的pod，优先被调度。
- BalancedResourceAllocation: 资源分配最均衡的pod，优先被调度。
- ImageLocalityPriority: 镜像在node上的缓存情况，优先被调度。

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

### pod亲和性

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

- Taint和Toleration

    - Taint: 污点，node上的标签，用于标记node的特殊属性，如node上不运行pod。

    - effect:
      - NoSchedule: 不允许调度pod到污点的node上。
      - PreferNoSchedule: 尽量不要调度pod到污点的node上。
      - NoExecute: 不允许调度pod到污点的node上，如果已经调度到污点的node上，会被驱逐。

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

    - Toleration: 容忍度，pod上的标签，用于标记pod的特殊属性，如pod可以运行在污点的node上。key, value, effect必须和node上的taint匹配。且当operator为Exists时，value将被忽略。tolerationSeconds用于设置pod容忍污点的时间, 即被驱逐之前的时间。不指定key和effect时，表示容忍所有污点。

### 固定调度

- 使用spec.nodeName字段，将pod调度到指定的node上。

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
- 使用nodeSelector字段，将pod调度到匹配标签的node上。

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
