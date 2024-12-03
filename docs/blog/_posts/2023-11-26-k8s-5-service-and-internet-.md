---
layout: post
title: "K8s-05: Service and Internet"
description: "Kubernetes Series: service and internet"
categories: [technology]
tags: [kubernetes, docker, container, devops, k8s, Ingress, IPVS]
date: 2023/11/26
---

## Service

一组 Pod 的逻辑分组，一种访问他们的策略，通常成为微服务。通过 label selector 将 Pod 分组。service 能够提供负载均衡（四层）、服务发现、session 保持、虚拟 IP 等功能。Ingrees 是 service 的升级版，支持七层负载均衡。

### Service Type

- ClusterIP: 提供一个虚拟 IP，只能在集群内部访问。
- NodePort: 在 ClusterIP 的基础上，为 service 在每个 node 上绑定一个端口，可以通过 node 的 IP 和端口访问 service。
- LoadBalancer: 在 NodePort 的基础上，借助 cloud providerr 为 service 提供一个外部的负载均衡器，可以通过负载均衡器的 IP 和端口访问 service。
- ExternalName: 为 service 提供一个 CNAME 记录，可以通过 CNAME 访问 service。

### Proxy Mode

#### userspace: 通过 iptables 实现，性能较差。

![userspace_proxy](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/userspace_proxy.webp)

clusterlP 主要在每个 node 节点使用 iptables，将发向 clusterIP 对应端口的数据，转发到 kube-proxy 中。然后 kube-proxy 自己内部实现有负载均衡的方法，并可以查询到这个 service 下对应 pod 的地址和端口，进而把数据转发给对应的 pod 的地址和端口。

#### iptables: 通过 iptables 实现，性能较好。

![iptables_proxy](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/iptables_proxy.webp)

#### ipvs: 通过 ipvs 实现，性能最好。

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

### Ingress

- Ingress 是对 service 的升级，支持七层负载均衡。Ingress Controller 是 Ingress 的实现，Ingress Controller 通过 service 实现七层负载均衡。Ingress Controller 可以是 nginx、traefik、haproxy 等。

- Ingress 在 service 的基础上，增加了 host 和 path 的匹配规则。Ingress Controller 会根据 host 和 path 的匹配规则，将请求转发到对应的 service 上。

  ![ingress](https://raw.githubusercontent.com/ElmTran/ImgStg/main/img/ingress.webp)

- Ingress 还可以实现 TLS 终止，将 https 请求转发到 http 请求。加快后端服务的处理速度。

举例

```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
    name: nginx
spec:
    rules:
    - host: nginx.example.com
        http:
        paths:
        - path: /
        backend:
            serviceName: nginx
            servicePort: 80
```

## 网络通信

### 通信方式

1. 同一个 pod 中的容器可以通过 localhost 进行通信。
2. 不同 pod 中的容器可以通过 overlay network 进行通信。如果 pod 在同一个 node 上，可以通过 veth pair 进行通信；如果 pod 在不同的 node 上，可以通过 vxlan 进行通信。
3. pod 与 service 之间的通信，通过 iptables 规则进行转发。现在默认使用 ipvs 进行转发。
4. pot 到外网，查找路由表，通过 node（宿主机）的网关转发。宿主网卡完成路由选择后，itables 执行 mapquerade 规则，将 pod 的 ip 地址转换为 node 的 ip 地址，然后发送出去。
5. 外网访问 pod：通过 NodePort 或者 LoadBalancer 进行访问。

### 网络解决方案

1. flannel: 使用 vxlan 技术，为 pod 提供 overlay network。etcd 保存可分配的 ip 段。监控 etcd 中 pod 的实际地址，在内存中建立和维护 pod 的路由表。包转发采用 udp 协议。
