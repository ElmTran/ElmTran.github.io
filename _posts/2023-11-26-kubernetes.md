---
layout: post
title: "Kubernetes"
description: "Study notes for Kubernetes."
categories: [technology]
tags: [kubernetes, docker, container, devops]
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

## 网络通信

### 通信方式

1. 同一个pod中的容器可以通过localhost进行通信。
2. 不同pod中的容器可以通过overlay network进行通信。如果pod在同一个node上，可以通过veth pair进行通信；如果pod在不同的node上，可以通过vxlan进行通信。
3. pod与service之间的通信，通过iptables规则进行转发。现在默认使用ipvs进行转发。
4. pot到外网，查找路由表，通过node（宿主机）的网关转发。宿主网卡完成路由选择后，itables执行mapquerade规则，将pod的ip地址转换为node的ip地址，然后发送出去。
5. 外网访问pod：通过NodePort或者LoadBalancer进行访问。

### 网络解决方案

1. flannel: 使用vxlan技术，为pod提供overlay network。etcd保存可分配的ip段。监控etcd中pod的实际地址，在内存中建立和维护pod的路由表。包转发采用udp协议。

## kubectl

### Base
```
create      -- 从文件或标准输入中创建资源
get         -- 显示一个或多个资源
run         -- 在集群中运行一个特定的镜像
expose      -- 为pod、deployment或service创建一个新的service
delete      -- 删除一个或多个资源
```
### APP Management
```
apply       -- 从文件、标准输入或计算资源中创建或更新配置
annotate    -- 更新资源的注释
autoscale   -- 自动调整pod的副本数
debug       -- 为pod创建一个调试容器
diff        -- 显示当前文件和计算资源之间的差异
edit        -- 编辑资源
kustomize   -- 从kustomization目录中构建配置
label       -- 更新资源的标签
patch       -- 使用补丁更新资源
replace     -- 从文件、标准输入或计算资源中替换资源
rollout     -- 管理资源的部署
scale       -- 设置资源的副本数
set         -- 设置资源的特定字段
wait        -- 阻塞，直到资源满足特定条件
```

### Working with Apps
```
attach    -- 连接到pod中的容器
auth      -- 检查授权
cp        -- 在pod和本地文件系统之间复制文件和目录
describe  -- 显示一个或多个资源的详细信息
exec      -- 在pod中执行命令
logs      -- 打印pod的日志
port-forward -- 将本地端口转发到pod
proxy     -- 运行一个代理以访问kubernetes api
top       -- 显示集群资源的资源使用情况
```

### Cluster Management
```
api-versions -- 列出集群支持的api版本
certificate  -- 修改证书相关的配置
cluster-info -- 显示集群信息
cordon       -- 标记node为不可调度
drain        -- 从node上删除pod，并标记node为不可调度
taint        -- 更新node的taints
uncordon     -- 标记node为可调度
```

### Kuberctl Settings and Usage
```
alpha       -- 用于测试的命令
api-resources -- 打印集群中的资源
completion  -- 生成shell自动补全脚本
config      -- 修改kubeconfig文件
explain     -- 显示资源或数据结构的文档
options     -- 打印kubernetes的命令行选项
plugin      -- 运行一个kubernetes插件
version     -- 打印客户端和服务器的版本信息
```

### Examples

1. 显示集群信息：
    ```bash
    kubectl cluster-info
    ```

2. 显示集群节点信息：
    ```bash
    kubectl get nodes
    ```

3. 显示所有命名空间中的所有资源：
    ```bash
    kubectl get all --all-namespaces
    ```

4. 显示特定命名空间中的所有资源：
    ```bash
    kubectl get all -n <namespace>
    ```

5. 显示特定资源的详细信息：
    ```bash
    kubectl describe <resource_type> <resource_name>
    ```

6. 创建或应用配置文件中定义的资源：
    ```bash
    kubectl apply -f <filename.yaml>
    ```

7. 删除资源：
    ```bash
    kubectl delete <resource_type> <resource_name>
    ```

8. 获取Pod的日志：
    ```bash
    kubectl logs <pod_name>
    ```

9. 进入Pod的容器：
    ```bash
    kubectl exec -it <pod_name> -- /bin/bash
    ```

10. 在运行的Pod中执行命令：
    ```bash
    kubectl exec <pod_name> -- <command>
    ```

11. 创建一个Pod：
    ```bash
    kubectl run <pod_name> --image=<image_name>
    ```

12. 创建一个Deployment：
    ```bash
    kubectl create deployment <deployment_name> --image=<image_name>
    ```

13. 创建一个Service：
    ```bash
    kubectl expose deployment <deployment_name> --port=<port> --target-port=<target_port>
    ```

## 资源编排

```
# 控制器定义
apiVersion: v1  # api版本
kind: Pod       # 资源类型
metadata:       # 元数据
  name: nginx   # 资源名称
  labels:       # 标签
    app: nginx
spec:           # 规格
    replicas: 3 # 副本数
    selector:   # 选择器
        matchLabels:    # 匹配标签
            app: nginx  # 标签
    template:   # 模板
        metadata:
            labels:
                app: nginx
        spec:
            containers:   # 容器
            - name: nginx # 容器名称
                image: nginx:1.14.2 # 容器镜像
                ports:      # 容器端口
                - containerPort: 80
```

### 使用kubectl创建资源

1. 创建pod：
    ```bash
    kubectl create -f <pod.yaml>
    ```

2. 创建deployment：
    ```bash
    kubectl create -f <deployment.yaml>
    ```

3. 创建service：
    ```bash
    kubectl create -f <service.yaml>
    ```

4. 创建yaml文件：
    ```bash
    kubectl create deployment <deployment_name> --image=<image_name> --dry-run=client -o yaml > <deployment.yaml>
    ```

5. export yaml文件：
    ```bash
    kubectl get <resource_type> <resource_name> -o yaml > <resource.yaml>
    ```

## Pod

### Pod的生命周期

1. Pod状态：Pending、Running、Succeeded、Failed、Unknown。

2. 生命周期: Pause Container -> Init Container -> App Container (Start、Readiness、Liveness、Stop) -> Termination.

3. Pod分类

    - 自主式：退出后不会重启。
    - 控制器管理的：始终要维持pod的副本数。

### Init Container

1. 如果Pod的init container失败，Pod会一直处于Pending状态，重复执行init container。除非Pod的restartPolicy设置为Never，否则Pod会一直重启。在Pod中，所有的init container都会在网络和存储初始化完成后才会执行。在下一个init container开始执行之前，必须保证上一个init container执行成功。

2. Init Container的作用：初始化Pod的环境，如创建配置文件、初始化数据库等。

3. Pod重启时，init container会重新执行，但是app container不会重新执行。

4. Init Container的spec修改被限制在image字段，不能修改其他字段。修改image字段后，会重启Pod。

5. Init Container具有除了ReadinessProbe之外的所有字段。

6. Init Container的name不可以和其他容器的name相同。

7. 举例
    ```
    apiVersion: v1
    kind: Pod
    metadata:
      name: init-demo
    spec:
        containers:
        - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
            volumeMounts:
            - name: workdir
            mountPath: /usr/share/nginx/html
        initContainers:
        - name: install
            image: busybox
            command:
            - wget
            - "-O"
            - "/work-dir/index.html"
            - http://kubernetes.io
            volumeMounts:
            - name: workdir
            mountPath: "/work-dir"
        dnsPolicy: Default
        volumes:
        - name: workdir
            emptyDir: {}
    ```

### Probe

1. pod的probe方式：

    - exec: 在容器中执行命令，如果命令返回0，则认为容器健康；如果命令返回非0，则认为容器不健康。
    - httpGet: 发送http请求，如果返回状态码在200-399之间，则认为容器健康；否则认为容器不健康。
    - tcpSocket: 发送tcp请求，如果连接成功，则认为容器健康；否则认为容器不健康。

2. pod的probe类型：

    - readinessProbe: 用于探测容器是否已经准备好接收流量。如果容器不健康，则不会将流量转发到容器。
    - livenessProbe: 用于探测容器是否存活。如果容器不健康，则会重启容器。
    - startupProbe: 用于探测容器是否已经启动完成。如果容器不健康，则会重启容器。

3. pod的probe字段：

    - initialDelaySeconds: 容器启动后，延迟多少秒开始探测。
    - periodSeconds: 探测的间隔时间。
    - timeoutSeconds: 探测的超时时间。
    - successThreshold: 探测成功的次数。
    - failureThreshold: 探测失败的次数。

4. 举例
    ```
    apiVersion: v1
    kind: Pod
    metadata:
      name: liveness-exec
    spec:
        containers:
        - name: liveness
            image: k8s.gcr.io/busybox
            args:
            - /bin/sh
            - -c
            - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
            livenessProbe:
            exec:
                command:
                - cat
                - /tmp/healthy
            initialDelaySeconds: 5
            periodSeconds: 5
    ```

### postStart和preStop

    ```
    apiVersion: v1
    kind: Pod
    metadata:
      name: lifecycle-demo
    spec:
        containers:
        - name: lifecycle-demo-container
            image: nginx
            lifecycle:
            postStart:
                exec:
                command: ["/bin/sh", "-c", "echo Hello from the postStart handler > /usr/share/message"]
            preStop:
                exec:
                command: ["/bin/sh","-c","nginx -s quit; while killall -0 nginx; do sleep 1; done"]
    ```

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

## Service

一组Pod的逻辑分组，一种访问他们的策略，通常成为微服务。通过label selector将Pod分组。service能够提供负载均衡（四层）、服务发现、session保持、虚拟IP等功能。Ingrees是service的升级版，支持七层负载均衡。

### Service Type

- ClusterIP: 提供一个虚拟IP，只能在集群内部访问。
- NodePort: 在ClusterIP的基础上，为service在每个node上绑定一个端口，可以通过node的IP和端口访问service。
- LoadBalancer: 在NodePort的基础上，借助cloud providerr为service提供一个外部的负载均衡器，可以通过负载均衡器的IP和端口访问service。
- ExternalName: 为service提供一个CNAME记录，可以通过CNAME访问service。

### Proxy Mode

#### userspace: 通过iptables实现，性能较差。

![userspace_proxy](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/userspace_proxy.webp)

clusterlP主要在每个node节点使用iptables，将发向clusterIP对应端口的数据，转发到kube-proxy中。然后kube-proxy自己内部实现有负载均衡的方法，并可以查询到这个service下对应pod的地址和端口，进而把数据转发给对应的pod的地址和端口。

#### iptables: 通过iptables实现，性能较好。

![iptables_proxy](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/iptables_proxy.webp)

#### ipvs: 通过ipvs实现，性能最好。

![ipvs_proxy](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/ipvs_proxy.webp)

举例
```
apiVersion: v1
kind: Service
metadata:
    name: nginx
spec:
    type: NodePort
    selector:
    app: nginx
    ports:
    - port: 80
    targetPort: 80
    nodePort: 30080
```

## Tips

- 集群数量：大于等于3个，最好是奇数个，保证高可用性（投票机制）。如果是偶数个，可能会出现脑裂的情况。
