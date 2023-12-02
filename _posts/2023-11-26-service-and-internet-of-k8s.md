---
layout: post
title: "Service and Internet of k8s"
description: "Kubernetes Series: service and internet of k8s"
categories: [technology]
tags: [kubernetes, docker, container, devops, k8s, Ingress, IPVS]
redirect_from:
  - /2023/11/26/
---

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

### Ingress

- Ingress是对service的升级，支持七层负载均衡。Ingress Controller是Ingress的实现，Ingress Controller通过service实现七层负载均衡。Ingress Controller可以是nginx、traefik、haproxy等。

- Ingress在service的基础上，增加了host和path的匹配规则。Ingress Controller会根据host和path的匹配规则，将请求转发到对应的service上。

- Ingress还可以实现TLS终止，将https请求转发到http请求。

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

1. 同一个pod中的容器可以通过localhost进行通信。
2. 不同pod中的容器可以通过overlay network进行通信。如果pod在同一个node上，可以通过veth pair进行通信；如果pod在不同的node上，可以通过vxlan进行通信。
3. pod与service之间的通信，通过iptables规则进行转发。现在默认使用ipvs进行转发。
4. pot到外网，查找路由表，通过node（宿主机）的网关转发。宿主网卡完成路由选择后，itables执行mapquerade规则，将pod的ip地址转换为node的ip地址，然后发送出去。
5. 外网访问pod：通过NodePort或者LoadBalancer进行访问。

### 网络解决方案

1. flannel: 使用vxlan技术，为pod提供overlay network。etcd保存可分配的ip段。监控etcd中pod的实际地址，在内存中建立和维护pod的路由表。包转发采用udp协议。