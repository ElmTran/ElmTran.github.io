---
layout: post
title: "controller of k8s"
description: "Kubernetes Series: controller of k8s"
categories: [technology]
tags: [kubernetes, docker, container, devops, controller, k8s]
redirect_from:
  - /2023/11/26/
---

## Controller

### ReplicationController/ReplicaSet

维持Pod的副本数，确保Pod的副本数符合用户的要求。RS支持集合式的selector, 如matchLabels和matchExpressions。举例：

```
apiVersion: v1
kind: ReplicaSet
metadata:
    name: nginx
spec:
    replicas: 3
    selector:
    matchLabels:
        app: nginx
    template:
    metadata:
        labels:
        app: nginx
    spec:
        containers:
        - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### Deployment

- 定义Deployment时，会自动创建一个RS，Deployment会管理这个RS。

- 滚动升级和版本回退

- 扩容和缩容

- 暂停和恢复

- 举例：
    ```
    apiVersion: apps/v1
    kind: Deployment
    metadata:
        name: nginx
    spec:
        replicas: 3
        selector:
        matchLabels:
            app: nginx
        template:
        metadata:
            labels:
            app: nginx
        spec:
            containers:
            - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
    ```

- 扩容：`kubectl scale deployment nginx --replicas=5`

- autoscale: `kubectl autoscale deployment nginx --min=3 --max=5 --cpu-percent=80`

- 滚动升级：`kubectl set image deployment nginx nginx=nginx:1.15.12`

- 版本回退：`kubectl rollout undo deployment nginx`

- 更新策略：保证升级时只有一定数量的pod处于down状态，默认值为25%。

  - RollingUpdate: 逐步升级，先创建新的pod，再删除旧的pod。
  - Recreate: 先删除旧的pod，再创建新的pod。

### DaemonSet

DaemonSet保证所有（或者一些）node上运行一个pod的副本。当node加入集群时，pod会被自动创建；当node从集群中删除时，pod也会被自动删除。应用场景：

  - 运行集群存储daemon，如glusterd、ceph。
  - 日志收集daemon，如fluentd、logstash。
  - 监控daemon，如node-exporter、`collectd`、prometheus-node-exporter、datadog-agent、newrelic-agent、`ganglia-gmond`。

举例：
```
apiVersion: apps/v1
kind: DaemonSet
metadata:
    name: nginx
spec:
    selector:
    matchLabels:
        app: nginx
    template:
    metadata:
        labels:
        app: nginx
    spec:
        containers:
        - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### StatefulSet

有状态的pod，每个pod都有唯一的标识，pod的创建和销毁都有顺序，pod的网络和存储都是稳定的。应用场景：

  - 稳定的持久化存储：基于PVC的存储卷，重新调度后，pod仍然可以访问到相同的存储卷。
  - 稳定的网络表示：pod的hostname和subdomain是稳定的。基于headless service的网络标识，不会因为pod的重启而改变。
  - 有序的部署和扩展：基于init container实现。
  - 有序收缩和删除。

### Job/CronJob

  - Job: 用于批处理任务，保证批处理任务的一个或者多个pod成功结束。

  - Job举例：
    ```
    apiVersion: batch/v1
    kind: Job
    metadata:
        name: pi
    spec:
        template:
        spec:
            containers:
            - name: pi
            image: perl
            command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
            restartPolicy: Never
        backoffLimit: 4
    ```
  - Cron: 用于定时任务，支持秒级别的定时任务。给定时间仅执行一次，周期性地在给定时间执行任务。给定时间之前没有执行的任务，会被丢弃。创建Job的操作是幂等的，即如果Job已经存在，则不会重复创建。

  - 应用：定时备份、定时清理、定时同步，邮件发送。

  - Cron举例：
    ```
    apiVersion: batch/v1beta1
    kind: CronJob
    metadata:
        name: hello
    spec:
        schedule: "*/1 * * * *"
        jobTemplate:
        spec:
            template:
            spec:
                containers:
                - name: hello
                image: busybox
                args:
                - /bin/sh
                - -c
                - date; echo Hello from the Kubernetes cluster
                restartPolicy: OnFailure
    ```

  - spec:

    - schedule: 定时任务的时间表达式。
    - jobTemplate: 定时任务的模板。
    - startingDeadlineSeconds: 定时任务的启动截止时间。错过被调度的任务将被视为失败。
    - concurrencyPolicy: 定时任务的并发策略。默认为Allow，表示允许并发执行。如果设置为Forbid，表示禁止并发执行。如果设置为Replace，表示如果有任务正在执行，则取消正在执行的任务，只保留最后一个任务。
    - successfulJobsHistoryLimit: 保留成功完成的任务的数量。默认为3。
    - suspend: 暂停定时任务的调度。

### HorizontalPodAutoscaler(HPA)

用于根据pod的cpu使用率和内存使用率，自动调整pod的副本数。仅支持Deployment和ReplicaSet。