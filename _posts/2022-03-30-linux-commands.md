---
layout: post
title: "Linux commands"
description: "Linux命令速查表"
categories: [technology]
tags: [linux, bash, shell, efficiency]
redirect_from:
  - /2022/03/30/
---

## 查看操作

- 查看linux版本

  - `lsb_release -a    # 打印发行版的具体信息，包括发行版名称、版本号、代号等`
  - `cat /etc/issue`
  - `cat /etc/issue.net`
  - `cat /etc/lsb-release`
  - `cat /etc/os-release`
  - `uname -a`
  - `cat /proc/version`
  - `dmesg | grep "Linux"`
  - `yum info nano`
  - `yum repolist`
  - `rpm -q nano`
  - `apt-cache policy nano`


- 查找包含字符串的python文件
  - `find . -type f -name '*.py'|xargs grep 'xxx'`  

## 修改操作

- history命令优化

  - `curl -L http://hengyunabc.github.io/bash_completion_install.sh | sh`

## 命令

### 普通命令
- xargs命令: 管道传参，将前面命令的标准输出转换成标准输入作为后边命令的参数。  
  `<command1> | xargs <command2>`


### 性能优化相关

- `uptime`

    ```sh
    02:34:03 up 2 days, 20:14,  1 user,  load average: 0.63, 0.83, 0.88
    # 当前时间，系统运行时间，当前登录用户数，平均负载（1分钟，5分钟，10分钟）
    ```
    tip：平均负载指平均活跃进程数，包括可运行状态和不可中断状态的进程。

- 查看系统cpu核数：`grep 'model name' /proc/cpuinfo -l`

- 压测工具：`stress`

- 性能分析工具：
  - `sysstat`：包含两个命令
      - `mpstat`：查看多核CPU性能指标和CPU平均指标

          ```sh
          mpstat -P ALL 5
          # 5秒后输出所有核参数
          ```
      - `pidstat`：进程性能分析工具

          ```sh
          pidstat -u 5 1
          # 5秒后输出一组cpu指标
          ```
  - `vmstat`：常用内存状态，上下文切换，中断次数查看 
    
    ```sh
    procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
    r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
    0      0 6634112   2076 22086852    0    0     1    13    1    3  9  3 88  0  0
    # cs(context switch)：每秒上下文切换次数
    # in(interrupt)：每秒中断次数
    # r(running or runnable)：就绪队列长度
    # b(blocked)：不可终端睡眠进程数
    ```

  - `perf`：CPU进程分析工具

    ```
    perf top
    # samples：采样率
    ```

- cpu使用率相关指标

    - `user(us)`：用户态CPU时间，不包括nice时间，但是包括guest时间

    - `nice(ni)`：低优先级用户态CPU时间

    - `system(sys)`：内核态CPU时间

    - `idle(id)`：空闲时间，不包括I/O等待时间

    - `iowait(wa)`：I/O等待时间

    - `irq(hi)`：硬中断时间

    - `softirq(si)`：软中断时间

    - `steal(st)`：运行在虚拟机或者被其他虚拟机占用时间

    - `guest`：运行虚拟机时间

    - `guest_nice`：以低优先级运行虚拟机时间

- 网络性能查询

    - `ss`：套接字信息

        ```sh
        ss -ltnp | head -n 3
        # -l 表示只显示监听套接字
        # -t 表示只显示 TCP 套接字
        # -n 表示显示数字地址和端口 (而不是名字)
        # -p 表示显示进程信息
        State    Recv-Q    Send-Q        Local Address:Port        Peer Address:Port
        LISTEN   0         128           127.0.0.53%lo:53               0.0.0.0:*        users:(("systemd-resolve",pid=840,fd=13))
        LISTEN   0         128                 0.0.0.0:22               0.0.0.0:*        users:(("sshd",pid=1459,fd=3))
        # State 套接字状态
        # Recv-Q 接受队列
        # Send-Q 发送队列
        # Local Address:Port 本地地址
        # Peer Address:Port 远程地址
        # 进程名、pid
        ```

    - `netstat`：套接字信息

        ```sh
        $ netstat -nlp | head -n 3
        # head -n 3 表示只显示前面 3 行
        # -l 表示只显示监听套接字
        # -n 表示显示数字地址和端口 (而不是名字)
        # -p 表示显示进程信息
        ```

    - `sar`：查看网络吞吐和PPS

        ```sh
        sar -n DEV 1
        Linux 4.15.0-1035-azure (ubuntu) 	01/06/19 	_x86_64_	(2 CPU)
    
        13:21:40        IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s   %ifutil
        13:21:41         eth0     18.00     20.00      5.79      4.25      0.00      0.00      0.00      0.00
        13:21:41      docker0      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
        13:21:41           lo      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
        # rxpck/s 接收PSS
        # txpck/s 发送PSS
        # rxkB/s 接收吞吐量
        # txkB/s 发送吞吐量
        # rxcmp/s 接收压缩包数量
        # txcmp/s 发送压缩包数量
        # %ifutil 网络接口使用率
        ```

    - `ping`：连通性测试
        ```sh
        ping -c3 114.114.114.114

        PING 114.114.114.114 (114.114.114.114) 56(84) bytes of data.
        64 bytes from 114.114.114.114: icmp_seq=1 ttl=65 time=31.1 ms
        64 bytes from 114.114.114.114: icmp_seq=2 ttl=85 time=31.6 ms
        64 bytes from 114.114.114.114: icmp_seq=3 ttl=66 time=31.2 ms

        --- 114.114.114.114 ping statistics ---
        3 packets transmitted, 3 received, 0% packet loss, time 2002ms
        rtt min/avg/max/mdev = 31.144/31.343/31.649/0.219 ms
        # icmp_seq icmp序列号
        # ttl 生存时间或跳数
        # time 往返时延
        # statistics 三次统计
        ```

    - 查看网路配置
        - `ifconfig`

            ```sh
            ifconfig
            docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
                    inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
                    ether 02:42:b5:6f:1b:a4  txqueuelen 0  (Ethernet)
                    RX packets 0  bytes 0 (0.0 B)
                    RX errors 0  dropped 0  overruns 0  frame 0
                    TX packets 0  bytes 0 (0.0 B)
                    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
            
            # MTU 网络接口配置的最大传输单元，IP包最大
            # errors 错误包数
            # dropped 丢弃包数
            # overruns 超限数据包数
            # carrier carrier错误包数，比如双工模式不匹配，物理线缆问题等
            # collisions 碰撞包数
            ```

        - `ip`

            ```sh
            3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
                link/ether 02:42:b5:6f:1b:a4 brd ff:ff:ff:ff:ff:ff
                inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
                valid_lft forever preferred_lft forever
                RX: bytes  packets  errors  dropped overrun mcast
                0          0        0       0       0       0
                TX: bytes  packets  errors  dropped carrier collsns
                0          0        0       0       0       0
            
            # 参数和ifconfig类似
            ```


- 各协议层网络测试
    - `pktgen`

        ```sh
        modprobe pktgen
        # pktgen是内核线程，需要先加载内核模块，然后通过/proc/net/pktgen下面的同名文件进行交互
        ```