---
layout: post
title: "Linux commands"
description: "Linux命令速查表"
categories: [technology]
tags: [linux, bash, shell, efficiency]
date: 2022/03/30
---

## 查看操作

- 查看 linux 版本

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

- 查找包含字符串的 python 文件
  - `find . -type f -name '*.py'|xargs grep 'xxx'`

## 修改操作

- history 命令优化

  - `curl -L http://hengyunabc.github.io/bash_completion_install.sh | sh`

## 命令

### 普通命令

- `ls`: 列出目录下的文件和目录。

  1. 参数：

     - -a：显示所有文件和目录，包括隐藏文件和目录。
     - -l：显示文件和目录的详细信息。
     - -h：以人类可读的方式显示文件和目录的大小。
     - -d：显示目录的详细信息。
     - -i：显示文件和目录的 inode 号。
     - -R：递归显示目录下的文件和目录。
     - -t：按照文件和目录的修改时间排序。
     - -S：按照文件和目录的大小排序。
     - -r：按照文件和目录的修改时间倒序排序。
     - -1：每行显示一个文件或目录。
     - -m：每行显示多个文件或目录。

  2. 显示结果和含义：

     ```
     -rw-rw-r-- 1 owner group  8980 Jun 24 16:44 file.txt
     drwxrwxr-x 2 owner group  4096 Jun 24 16:44 dir
     lrwxrwxrwx 1 owner group     3 Jun 24 16:44 link -> dir
     ```

     - 第一列：

       - 文件类型：
         - -：普通文件
         - d：目录
         - l：链接文件
         - b：块设备文件
         - c：字符设备文件
         - s：套接字文件
         - p：管道文件
       - 文件权限，每 3 位一组，分别表示文件所有者、文件所属组、其他用户的权限
         - r：读权限
         - w：写权限
         - x：执行权限
         - -：没有权限。

     - 第二列：硬链接数，表示有多少个文件名指向该文件。

     - 第三列：文件所有者。

     - 第四列：文件所属组。

     - 第五列：文件大小，单位为字节。

     - 第六列：文件最后修改时间。

     - 第七列：文件名。

- `cat`: 显示文件内容。

  1. 参数：

     - -n：显示行号。
     - -b：显示行号，空白行不显示行号。
     - -s：多个空白行合并成一行。
     - -A：显示所有字符，包括制表符、换行符等。
     - -T：显示制表符。
     - -E：显示换行符。
     - -v：显示控制字符。

  2. 显示结果和含义：

     ```
     1  line1
     2  line2
     3  line3
     4  line4
     5  line5
     6  line6
     7  line7
     8  line8
     9  line9
     10 line10
     ```

- `tac`: 逆序输出文件内容

  1. 参数：

     - -r：--regex，使用正则表达式。
     - -s：--separator=STRING，指定分隔符。
     - -b：--before，指定分隔符前的内容。

  2. 显示结果和含义：

     ```
     10 line10
     ```

- `more`: 分页显示文件内容

  1. 参数：

     - -d：显示“[press space to continue, 'q' to quit.]”提示信息。
     - -c：不进行滚屏操作，显示内容，清楚行尾。
     - -p：不进行滚屏操作，直接清屏显示。
     - -s：将多个空行合并成一行。
     - -u：禁止滚屏操作。
     - -num：指定每屏显示的行数。

  2. 操作：

     - 空格：向下翻页。
     - 回车：向下翻一行。
     - b：向上翻页。
     - q：退出。

- `less`: 分页显示文件内容，支持向前翻页

  1. 参数：

     - -N：显示行号。
     - -n：不显示行号。
     - -S：将多个空行合并成一行。
     - -s：将多个空行合并成一行。
     - -num：指定每屏显示的行数。

  2. 操作：

     - 空格：向下翻页。
     - 回车：向下翻一行。
     - b：向上翻页。
     - q：退出。
     - /：向下搜索。
     - ?：向上搜索。
     - n：重复上一次搜索。
     - N：反向重复上一次搜索。

- `awk`: 文本处理工具，可以对文本进行格式化处理，支持结构化的数据处理和更复杂的操作。

  1. 基本用法

     ```
     awk 'pattern {action}' filename
     ```

  2. 参数

     - -F：指定分隔符。
     - -v：定义变量。
     - -f：指定脚本文件。

  3. 示例

  ```
  awk '{print $1}' file.txt   # 打印第一列
  awk -F: '{print $1}' /etc/passwd    # 以:为分隔符，打印第一列
  awk -F: '{print $1,$3}' /etc/passwd   # 以:为分隔符，打印第一列和第三列
  ```

- `sed`: 基于行的文本编辑器，主要用于基于行的模式匹配和替换，适用于简单的文本处理任务。

  1. 基本用法

     ```
     sed [option] 'pattern {action}' filename
     ```

  2. 参数

     - -n：禁止默认输出。
     - -e：多条命令。
     - -f：指定脚本文件。
     - -i：直接修改文件内容。

  3. 示例

     ```
     sed -n 's/old/new/p' file.txt   # 替换文件中的old为new
     sed -n {1,10}p file.txt   # 打印文件的第1到10行
     ```

- `grep`: 搜索文件内容

  1. 基本用法

     ```
     grep [option] 'pattern' filename
     ```

  2. 参数

     - -i：忽略大小写。
     - -v：反向选择，只显示不匹配的行。
     - -r：递归搜索。
     - -n：显示行号。
     - -l：只显示文件名。

  3. 示例

     ```
     grep -i 'hello' file.txt   # 搜索文件中的hello，忽略大小写
     ```

- `sort`: 对文件内容进行排序

  1. 用法

     ```
     sort [option] filename
     ```

  2. 参数

     - -n：按照数值排序。
     - -r：逆序排序。
     - -u：去重。
     - -t：指定分隔符。
     - -k：指定列。

  3. 示例

     ```
     sort -n file.txt   # 对文件内容进行数值排序
     ```

- `uniq`: 对文件内容进行去重

  1. 用法

     ```
     uniq [option] filename
     ```

  2. 参数

     - -c：显示重复次数。
     - -d：只显示重复行。
     - -u：只显示不重复行。

  3. 示例

     ```
     uniq -c file.txt   # 对文件内容进行去重，并显示重复次数
     ```

- `wc`: 统计文件内容

  1. 用法

     ```
     wc [option] filename
     ```

  2. 参数

     - -l：统计行数。
     - -w：统计单词数。
     - -c：统计字节数。

  3. 示例

     ```
     wc -l file.txt   # 统计文件的行数
     ```

- `head`: 查看文件头部内容

  1. 用法

     ```
     head [option] filename
     ```

  2. 参数

     - -n：指定显示的行数。

  3. 示例

     ```
     head -n 10 file.txt   # 查看文件的前10行
     ```

- `tail`: 查看文件尾部内容

  1. 用法

     ```
     tail [option] filename
     ```

  2. 参数

     - -n：指定显示的行数。
     - -f：实时显示文件内容。

  3. 示例

     ```
     tail -n 10 file.txt   # 查看文件的后10行
     ```

- `cut`: 截取文件内容

  1. 用法

     ```
     cut [option] filename
     ```

  2. 参数

     - -c：按照字符截取。
     - -f：按照列截取。
     - -d：指定分隔符。

  3. 示例

     ```
     cut -c 1-5 file.txt   # 截取文件的第1到5个字符
     ```

- `paste`: 合并文件内容

  1. 用法

     ```
     paste [option] filename
     ```

  2. 参数

     - -d：指定分隔符。

  3. 示例

     ```
     paste -d: file1.txt file2.txt   # 合并两个文件的内容，以:为分隔符
     ```

- `tr`: 替换文件内容

  1. 用法

     ```
     tr [option] filename
     ```

  2. 参数

     - -d：删除指定字符。
     - -s：压缩连续重复的字符。
     - -c：替换指定字符。

  3. 示例

     ```
     tr -d ' ' file.txt   # 删除文件中的空格
     ```

- `xargs`: 管道传参，将前面命令的标准输出转换成标准输入作为后边命令的参数。

  1. 用法

     ```
     xargs [option] command
     ```

  2. 参数

     - -I：用于指定一个替换字符串，xargs 会将该字符串替换为从标准输入读取的内容。
     - -d：指定分隔符。
     - -n：指定每次传递给 command 命令的参数个数。

  3. 示例

     ```
     find /etc -name '*.conf' | xargs rm -rf   # 删除/etc目录下的所有.conf文件
     ```

- `which`: 用于查找可执行文件的路径。

  1. 用法

     ```
     which [option] command
     ```

  2. 参数

     - -a：显示所有匹配的命令。

  3. 示例

     ```
     which ls   # 查找ls命令的绝对路径
     ```

- `whereis`: 用于查找可执行文件、源代码文件和帮助文档的路径。

  1. 用法

     ```
     whereis [option] command
     ```

  2. 参数

     - -b：只查找二进制文件。
     - -m：只查找帮助文件。
     - -s：只查找源代码文件。

  3. 示例

     ```
     whereis ls   # 查找ls命令的绝对路径
     ```

- `locate`: 用于在文件数据库中快速查找文件路径。

  1. 用法

     ```
     locate [option] filename
     ```

  2. 参数

     - -i：忽略大小写。
     - -l：只显示文件名。
     - -c：只显示匹配的文件数量。

  3. 示例

     ```
     locate -i file.txt   # 查找文件，忽略大小写
     ```

- `find`: 查找文件

  1. 基本用法

     ```
     find [path] [option] [action]
     ```

  2. 参数

     - -name：按照文件名查找。
     - -type：按照文件类型查找。
     - -size：按照文件大小查找。
     - -user：按照文件属主查找。
     - -mtime：按照文件修改时间查找。
     - -exec：执行命令。

  3. 示例

     ```
     find /etc -name '*.conf' -type f -mtime -1  -exec rm -rf {} \;   # 删除/etc目录下修改时间在1天内的.conf文件
     ```

- `file`: 查看文件类型

  1. 用法

     ```
     file [option] filename
     ```

  2. 参数

     - -i：显示 mime 类型。
     - -b：只显示文件类型。

  3. 示例

     ```
     file -i file.txt   # 查看文件的mime类型
     ```

- `touch`: 创建文件

  1. 用法

     ```
     touch [option] filename
     ```

  2. 参数

     - -a：只修改访问时间。
     - -m：只修改修改时间。
     - -c：如果文件不存在，不创建文件。

  3. 示例

     ```
     touch file.txt   # 创建文件
     ```

- `set`: 查看系统环境变量

  1. 用法

     ```
     set [option]
     ```

  2. 参数

     - -o：查看 shell 选项。
     - -a：查看所有变量。
     - -f：查看函数定义。
     - -h：查看 shell 函数。
     - -n：查看只读变量。
     - -p：查看 shell 进程号。
     - -v：查看 shell 变量。

  3. 示例

     ```
     set -o   # 查看shell选项
     ```

- `unset`: 删除环境变量

  1. 用法

     ```
     unset [option] variable
     ```

  2. 参数

     - -f：删除 shell 函数。
     - -v：删除 shell 变量。

  3. 示例

     ```
     unset -v PATH   # 删除PATH变量
     ```

- `env`: 查看环境变量

  1. 用法

     ```
     env [option]
     ```

  2. 参数

     - -i：清除所有环境变量。
     - -u：删除指定环境变量。

  3. 示例

     ```
     env -i   # 清除所有环境变量
     ```

- `export`: 设置环境变量

  1. 用法

     ```
     export [option] variable=value
     ```

  2. 参数

     - -n：删除指定环境变量。

  3. 示例

     ```
     export PATH=/usr/local/bin:$PATH   # 设置PATH环境变量
     ```

- `read`: 读取用户输入

  1. 用法

     ```
     read [option] variable
     ```

  2. 参数

     - -p：指定提示符。
     - -t：指定等待时间。
     - -s：隐藏输入内容。

  3. 示例

     ```
     read -p "Please input your name: " name   # 读取用户输入
     ```

- `declare`: 声明变量

  1. 用法

     ```
     declare [option] variable=value
     ```

  2. 参数

     - -a：声明数组。
     - -i：声明整数。
     - -r：声明只读变量。
     - -x：声明环境变量。

  3. 示例

     ```
     declare -i num=10   # 声明整数
     ```

- `typeset`: 声明变量

  1. 用法

     ```
     typeset [option] variable=value
     ```

  2. 参数

     - -a：声明数组。
     - -i：声明整数。
     - -r：声明只读变量。
     - -x：声明环境变量。

  3. 示例

     ```
     typeset -i num=10   # 声明整数
     ```

- `df`: 查看磁盘使用情况

  1. 用法

     ```
     df [option] [path]
     ```

  2. 参数

     - -a：显示所有文件系统。
     - -h：以人类可读的方式显示。
     - -i：显示 inode 信息。
     - -T：显示文件系统类型。

  3. 示例

     ```
     df -h   # 查看磁盘使用情况
     ```

  4. 结果

     ```
     Filesystem      Size  Used Avail Use% Mounted on
     /dev/vda1        40G  2.1G   36G   6% /
     devtmpfs        1.9G     0  1.9G   0% /dev
     ```

     - Filesystem：文件系统。
     - Size：总大小。
     - Used：已使用。
     - Avail：可用。
     - Use%：使用率。
     - Mounted on：挂载点。

- `du`: 查看文件大小

  1. 用法

     ```
     du [option] [path]
     ```

  2. 参数

     - -a：显示所有文件。
     - -h：以人类可读的方式显示。
     - -s：只显示总大小。

  3. 示例

     ```
     du -h   # 查看文件大小
     ```

- `ln`: 创建链接

  1. 用法

     ```
     ln [option] target link
     ```

  2. 参数

     - -s：创建软链接。
     - -f：强制创建。

  3. 示例

     ```
     ln -s /usr/local/bin /usr/bin/local   # 创建软链接
     ```

- `diff`: 比较文件

  1. 用法

     ```
     diff [option] file1 file2
     ```

  2. 参数

     - -b：忽略空格。
     - -i：忽略大小写。
     - -w：忽略所有空格。
     - -B：忽略空白行。
     - -q：只显示是否不同。
     - -r：递归比较目录。

  3. 示例

     ```
     diff -q file1.txt file2.txt   # 比较文件
     ```

- `ps`: 查看进程

  1. 用法

     ```
     ps [option]
     ```

  2. 参数

     - -a：显示所有进程。
     - -u：显示用户信息。
     - -x：显示没有控制终端的进程。
     - -e：显示所有进程。
     - -f：显示全格式。
     - -l：显示长格式。
     - -h：不显示标题。
     - -o：自定义显示格式。

  3. 示例

     ```
     ps -ef   # 查看进程
     ```

  4. 结果

     ```
     UID        PID  PPID  C STIME TTY          TIME CMD
     root         1     0  0  2019 ?        00:00:01 /sbin/init
     root         2     0  0  2019 ?        00:00:00 [kthreadd]
     root         3     2  0  2019 ?        00:00:00 [ksoftirqd/0]
     root         5     2  0  2019 ?        00:00:00 [kworker/0:0H]
     root         7     2  0  2019 ?        00:00:00 [rcu_sched]
     root         8     2  0  2019 ?        00:00:00 [rcu_bh]
     ```

     - UID：用户 ID。
     - PID：进程 ID。
     - PPID：父进程 ID。
     - C：CPU 占用率。
     - STIME：启动时间。
     - TTY：终端。
     - TIME：CPU 占用时间。
     - CMD：命令。
     - %CPU：CPU 占用率。
     - %MEM：内存占用率。
     - VSZ：虚拟内存大小。
     - RSS：实际内存大小。
     - STAT：进程状态。I<：空闲，R：运行，S：睡眠，T：停止，Z：僵尸，N：低优先级，L：内存锁页，s：会话，+：前台进程组。

- `top`: 查看进程

  1. 用法

     ```
     top [option]
     ```

  2. 参数

     - -d：指定刷新间隔。
     - -n：指定刷新次数。
     - -p：指定进程号。

  3. 示例

     ```
     top -d 1 -n 10   # 查看进程
     ```

  4. 结果

     ```
     top - 23:17:30 up 24 days,  3:08,  2 users,  load average: 0.01, 0.02, 0.00
     Tasks: 102 total,   1 running, 101 sleeping,   0 stopped,   0 zombie
     %Cpu(s):  1.3 us,  0.7 sy,  0.0 ni, 98.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
     MiB Mem :   1949.8 total,    291.8 free,    620.9 used,   1037.1 buff/cache
     MiB Swap:      0.0 total,      0.0 free,      0.0 used.   1134.0 avail Mem

         PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
             1 root      20   0  168.9m  10.3m   7.9m S   0.0   0.5   0:01.02 systemd
             2 root      20   0       0      0      0 S   0.0   0.0   0:00.00 kthreadd
     ```

     - top：当前时间。up：系统运行时间。users：登录用户数。load average：系统负载。
     - Tasks：进程信息。total：进程总数。running：运行进程数。sleeping：睡眠进程数。stopped：停止进程数。zombie：僵尸进程数。
     - %Cpu(s)：CPU 占用率。us：用户空间占用率。sy：内核空间占用率。ni：用户进程空间占用率。id：空闲占用率。wa：等待 IO 占用率。hi：硬中断占用率。si：软中断占用率。st：虚拟机占用率。
     - MiB Mem：内存信息。total：总内存。free：空闲内存。used：已用内存。buff/cache：缓存内存。
     - MiB Swap：交换分区信息。total：总交换分区。free：空闲交换分区。used：已用交换分区。avail Mem：可用内存。
     - PID：进程 ID。USER：用户。PR：Priority 优先级。NI：Nice Value 优先级。VIRT：虚拟内存。RES：实际内存。SHR：共享内存。S：进程状态。%CPU：CPU 占用率。%MEM：内存占用率。TIME+：CPU 占用时间。COMMAND：命令。

- `ifconfig`: 查看网络

  1. 用法

     ```
     ifconfig [interface] [option]
     ```

  2. 参数

     - interface：网卡名称。
     - option：选项。

  3. 示例

     ```
     ifconfig eth0   # 查看网卡
     ```

  4. 结果

     ```
     eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
             inet 124.23.31.31 netmask 255.255.255.255 broadcast 123.31.31.4
              inet6 xxx  prefixlen 64  scopeid 0x20<link>
              ether 00:50:56:00:00:00  txqueuelen 1000  (Ethernet)
                 RX packets 0  bytes 0 (0.0 B)
                 RX errors 0  dropped 0  overruns 0  frame 0
                 TX packets 0  bytes 0 (0.0 B)
                 TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
     ```

     - flags：标志位。UP：网卡启用。BROADCAST：广播地址。RUNNING：网卡运行。MULTICAST：多播地址。
     - mtu：最大传输单元。
     - inet：IP 地址。netmask：子网掩码。broadcast：广播地址。
     - inet6：IPv6 地址。prefixlen：前缀长度。scopeid：范围 ID。
     - ether：MAC 地址。
     - txqueuelen：发送队列长度。
     - RX packets：接收数据包数。bytes：接收字节数。errors：接收错误数。dropped：接收丢弃数。overruns：接收溢出数。frame：接收帧数。

- `netstat`：查看网络

  1. 用法

     ```
     netstat [option]
     ```

  2. 参数

     - r: 显示路由表。
     - i: 显示网络接口信息。
     - n: 显示网络连接信息。
     - a: 显示所有连接信息。
     - t: 显示 TCP 连接信息。
     - u: 显示 UDP 连接信息。
     - l: 显示监听状态。
     - p: 显示进程信息。
     - e: 显示扩展信息。
     - s: 显示统计信息。
     - c: 持续显示。
     - v: 显示版本信息。
     - h: 显示帮助信息。

  3. 示例

     ```
     netstat -an | grep docker   # 查看网络
     ```

  4. 结果

     ```
     unix  2      [ ACC ]     STREAM     LISTENING     22331    /var/run/docker/swarm/control.sock
     ```

     - unix：协议。
     - 2：连接状态。1：等待连接。2：已连接。3：正在关闭连接。
     - [ ACC ]：连接状态。[ ACC ]：等待连接。[ CLOS ]：正在关闭连接。[ LISTEN ]：正在监听。
     - STREAM：连接类型。STREAM：TCP 连接。DGRAM：UDP 连接。
     - LISTENING：监听状态。LISTENING：正在监听。NOT-LISTENING：未监听。
     - 22331：连接 ID。
     - /var/run/docker/swarm/control.sock：连接地址。

- `iostat`: 查看磁盘

  1. 用法

     ```
     iostat [option] [interval] [count]
     ```

  2. 参数

     -d: 仅显示磁盘信息。
     -c: 仅显示 CPU 信息。

  3. 示例

     ```
     iostat -d [interval] [count]   # 查看磁盘
     ```

- `ping`: 测试网络

  1. 用法

     ```
     ping [option] [host]
     ```

  2. 参数

     -c: 指定发送次数。
     -i: 指定发送间隔。
     -s: 指定发送数据包大小。

  3. 示例

     ```
     ping -c 4 www.baidu.com   # 测试网络
     ```

  4. 结果

     ```
     PING www.wshifen.com (104.193.88.77) 56(84) bytes of data.
     64 bytes from 104.193.88.77 (104.193.88.77): icmp_seq=1 ttl=44 time=141 ms
     64 bytes from 104.193.88.77 (104.193.88.77): icmp_seq=2 ttl=44 time=141 ms
     64 bytes from 104.193.88.77 (104.193.88.77): icmp_seq=3 ttl=44 time=141 ms
     64 bytes from 104.193.88.77 (104.193.88.77): icmp_seq=4 ttl=44 time=141 ms
     ```

     - 64 bytes: 数据包大小。
     - 104.193.88.77: 目标 IP 地址。
     - icmp_seq: 发送序列号。
     - ttl: 生存时间。
     - time: 响应时间。

- `traceroute`: 路由跟踪

  1. 用法

     ```
     traceroute [option] [host]
     ```

  2. 参数

     - -n: 不解析 IP 地址。
     - -w: 指定超时时间。
     - -q: 指定发送次数。

  3. 示例

     ```
     traceroute -n -w 1 -q 1 www.baidu.com   # 路由跟踪
     ```

  4. 结果

     ```
     traceroute to www.example.com (93.184.216.34), 30 hops max, 60 byte packets
     1  192.168.1.1 (192.168.1.1)  1.234 ms  1.456 ms  1.678 ms
     2  10.0.0.1 (10.0.0.1)  2.345 ms  2.567 ms  2.789 ms
     ```

     第一行显示了正在跟踪的目标主机的名称、IP 地址以及最大跳数和每个数据包的大小。
     从第二行开始，每一行表示跟踪路径中的一个跳跃（hop）。每个跳跃都显示了跳跃的序号，跳跃的 IP 地址和主机名（如果可用），以及三个时间值（以毫秒为单位）。
     时间值表示从源主机到达该跳跃点的往返时间（Round-Trip Time，RTT）。每个跳跃点都发送了三个 ICMP 回显请求（ping）报文，并显示了每个报文的往返时间。

- `telnet`: 远程登录，测试端口

  1. 用法

     ```
     telnet [option] [host] [port]
     ```

  2. 参数

     -l: 指定用户名。
     -p: 指定端口号。

  3. 示例

     ```
     telnet -l root
     ```

- `nc`: 远程登录，测试端口

  1. 用法

     ```
     nc [option] [host] [port]
     ```

  2. 参数

     -z: 只扫描，不发送数据。
     -v: 显示详细信息。

  3. 示例

     ```
     nc -zv www.baidu.com 80
     ```

- `wget`: 下载文件

  1. 用法

     ```
     wget [option] [url]
     ```

  2. 参数

     -c: 断点续传。
     -b: 后台下载。
     -t: 指定重试次数。
     -o: 指定日志文件。
     -O: 指定下载文件名。

  3. 示例

     ```
     wget -c -t 0 -o wget.log -O wget.html www.baidu.com
     ```

- `curl`: 下载文件

  1. 用法

     ```
     curl [option] [url]
     ```

  2. 参数

     -C: 断点续传。
     -o: 指定下载文件名。

  3. 示例

     ```
     curl -C - -o curl.html www.baidu.com
     ```

- `scp`: 上传下载文件

  1. 用法

     ```
     scp [option] [source] [target]
     ```

  2. 参数

     -r: 递归复制。

  3. 示例

     ```
     scp -r root@132.2.2.2:/home/wwwroot/www.example.com /home/wwwroot/www.example.com
     ```

- `ssh`: 远程登录

  1. 用法

     ```
     ssh [option] [user@host]
     ```

  2. 参数

     -p: 指定端口号。

  3. 示例

     ```
     ssh -p 22 root@123.1.12.3
     ```

- `tar`: 打包压缩

  1. 用法

     ```
     tar [option] [file]
     ```

  2. 参数

     -c: 创建压缩包。
     -x: 解压缩。
     -z: 使用 gzip 压缩。
     -j: 使用 bzip2 压缩。
     -v: 显示详细信息。
     -f: 指定压缩包文件名。

  3. 示例

     ```
     tar -czvf test.tar.gz test  # 打包压缩
     tar -xzvf test.tar.gz       # 解压缩
     ```

- `zip/unzip`: 打包压缩

  1. 用法

     ```
     zip [option] [file]
     ```

  2. 参数

     - -r: 递归压缩。
     - -v: 显示详细信息。
     - -q: 静默模式。
     - -m: 压缩后删除源文件。
     - -d: 删除压缩包中的文件。
     - -u: 更新压缩包中的文件。
     - -l: 显示压缩包中的文件。
     - -c: 压缩包中的文件转换为大写。
     - -C: 压缩包中的文件转换为小写。
     - -z: 使用 gzip 压缩。
     - -j: 使用 bzip2 压缩。
     - -0: 不压缩。
     - -9: 最大压缩。
     - -q: 静默模式。
     - -r: 递归压缩。
     - -v: 显示详细信息。
     - -f: 指定压缩包文件名。

  3. 示例

     ```
     zip -r test.zip test  # 打包压缩
     unzip test.zip        # 解压缩
     ```

- `gzip/gunzip`: 压缩

  1. 用法

     ```
     gzip [option] [file]
     ```

  2. 参数

     -d: 解压缩。
     -v: 显示详细信息。
     -f: 强制压缩。

  3. 示例

     ```
     gzip -v test.txt  # 压缩
     gzip -dv test.txt # 解压缩
     ```

- `bzip2/bunzip2`: 压缩

  1. 用法

     ```
     bzip2 [option] [file]
     ```

  2. 参数

     -d: 解压缩。
     -v: 显示详细信息。
     -f: 强制压缩。

  3. 示例

     ```
     bzip2 -v test.txt  # 压缩
     bzip2 -dv test.txt # 解压缩
     ```

- `lsof`: 用于列出当前系统中打开的文件和进程信息。

  1. 用法

     ```
     lsof [option] [file]
     ```

  2. 参数

     - -i: 查看网络连接。
     - -p: 查看进程打开的文件。
     - -u: 查看用户打开的文件。
     - -c: 查看指定进程打开的文件。
     - -g: 查看指定组打开的文件。
     - -d: 查看指定文件描述符打开的文件。
     - -a: 与其他选项联合使用，表示并集。
     - -d: 与其他选项联合使用，表示交集。
     - -n: 与其他选项联合使用，表示取反。

  3. 示例

     ```
     lsof：列出所有打开的文件和进程信息。
     lsof -i :80：列出所有使用端口80的网络连接。
     lsof -p 1234：列出进程ID为1234的打开文件。
     lsof -u username：列出属于指定用户名的打开文件。
     lsof -c ssh：列出与ssh命令相关的打开文件。
     lsof -t /path/to/file：仅显示打开指定文件的进程ID。
     lsof -n -i TCP:8080：禁止解析IP地址和端口号，并列出使用TCP端口8080的网络连接信息。
     ```

- `kill`: 用于终止进程。

  1. 用法

     ```
     kill [option] [pid]
     ```

  2. 参数

     - -l: 列出所有信号。
     - -s: 指定信号。
     - -p: 指定进程 ID。
     - -a: 与其他选项联合使用，表示并集。
     - -d: 与其他选项联合使用，表示交集。
     - -n: 与其他选项联合使用，表示取反。
     - -9: 强制终止进程。

  3. 示例

     ```
     kill -l：列出所有信号。
     kill -s 9 1234：向进程ID为1234的进程发送SIGKILL信号。
     ```

- `nohup`: 用于在后台运行命令。

  1. 用法

     ```
     nohup [option] [command]
     ```

  2. 参数

     - > /dev/null 2>&1: 将输出重定向到/dev/null。

  3. 示例

     ```
     nohup command &：在后台运行命令。
     nohup command > /dev/null 2>&1 &：在后台运行命令，并将输出重定向到/dev/null。
     ```

- `screen`: 用于创建多个虚拟终端。

  1. 用法

     ```
     screen [option] [command]
     ```

  2. 参数

     - -S: 指定会话名称。
     - -r: 恢复会话。
     - -d: 分离会话。
     - -ls: 列出会话。
     - -X: 向会话发送命令。
     - -x: 连接会话。
     - -L: 启动日志功能。
     - -R: 恢复会话，如果会话不存在则创建会话。
     - -D: 分离会话，如果会话不存在则创建会话。
     - -m: 忽略权限检查。
     - -S: 指定会话名称。
     - -t: 指定会话 ID。
     - -p: 指定会话 ID。
     - -r: 恢复会话。
     - -d: 分离会话。
     - -ls: 列出会话。
     - -X: 向会话发送命令。
     - -x: 连接会话。
     - -L: 启动日志功能。
     - -R: 恢复会话，如果会话不存在则创建会话。
     - -D: 分离会话，如果会话不存在则创建会话。
     - -m: 忽略权限检查。

  3. 示例

     ```
     screen：创建会话。
     screen -S session_name：创建会话，并指定会话名称。
     ```

- `time`: 用于统计命令执行时间。

  1. 用法

     ```
     time [option] [command]
     ```

  2. 参数

     -v: 显示详细信息。

  3. 示例

     ```
     time command：统计命令执行时间。
     ```

- `date`: 用于显示或设置系统时间。

  1. 用法

     ```
     date [option] [date]
     ```

  2. 参数

     - -s: 设置系统时间。
     - -d: 显示指定时间。
     - -u: 显示 UTC 时间。
     - -R: 显示 RFC-2822 格式时间。
     - -I: 显示 ISO-8601 格式时间。
     - -r: 显示指定文件的最后修改时间。
     - -s: 设置系统时间。
     - -d: 显示指定时间。
     - -u: 显示 UTC 时间。
     - -R: 显示 RFC-2822 格式时间。
     - -I: 显示 ISO-8601 格式时间。
     - -r: 显示指定文件的最后修改时间。

  3. 示例

     ```
     date：显示系统时间。
     date -s "2019-01-01 00:00:00"：设置系统时间。
     date -d "2019-01-01 00:00:00"：显示指定时间。
     date -u：显示UTC时间。
     date -R：显示RFC-2822格式时间。
     date -I：显示ISO-8601格式时间。
     date -r /etc/passwd：显示/etc/passwd文件的最后修改时间。
     ```

- `cal`: 用于显示日历。

  1. 用法

     ```
     cal [option] [month] [year]
     ```

  2. 参数

     - -3: 显示上个月，本月，下个月的日历。
     - -j: 显示一年中的第几天。
     - -m: 显示一年中的第几个月。
     - -y: 显示一年的日历。
     - -3: 显示上个月，本月，下个月的日历。
     - -j: 显示一年中的第几天。
     - -m: 显示一年中的第几个月。
     - -y: 显示一年的日历。

  3. 示例

     ```
     cal：显示本月的日历。
     cal 2019：显示2019年的日历。
     cal 1 2019：显示2019年1月的日历。
     cal -3：显示上个月，本月，下个月的日历。
     cal -j：显示一年中的第几天。
     cal -m：显示一年中的第几个月。
     cal -y：显示一年的日历。
     ```

- `alias/unalias`: 用于设置/取消命令别名。

  1. 用法

     ```
     alias [name[=value] ...]
     unalias [option] name
     ```

  2. 参数

     -p: 列出所有别名。
     -p: 列出所有别名。

  3. 示例

     ```
     alias：列出所有别名。
     alias ll='ls -l'：设置ll命令别名。
     unalias ll：取消ll命令别名。
     ```

- `history`: 用于显示历史命令。

  1. 用法

     ```
     history [option]
     ```

  2. 参数

     - -c: 清空历史命令。
     - -d: 删除指定历史命令。
     - -a: 将缓冲区中的命令写入历史命令文件。
     - -w: 将缓冲区中的命令写入历史命令文件。
     - -r: 从历史命令文件中读取命令。
     - -n: 从历史命令文件中读取命令。
     - -p: 从历史命令文件中读取命令。
     - -s: 从历史命令文件中读取命令。
     - -c: 清空历史命令。
     - -d: 删除指定历史命令。
     - -a: 将缓冲区中的命令写入历史命令文件。
     - -w: 将缓冲区中的命令写入历史命令文件。
     - -r: 从历史命令文件中读取命令。
     - -n: 从历史命令文件中读取命令。
     - -p: 从历史命令文件中读取命令。
     - -s: 从历史命令文件中读取命令。

  3. 示例

     ```
     history：显示历史命令。
     history -c：清空历史命令。
     ```

- `source`: 用于在当前 shell 中执行脚本。

  1. 用法

     ```
     source [file]
     ```

  2. 示例

     ```
     source /etc/profile：在当前shell中执行/etc/profile脚本。
     ```

- `sleep`: 用于延迟执行。

  1. 用法

     ```
     sleep [option] time
     ```

  2. 参数

     -s: 指定时间单位为秒。
     -m: 指定时间单位为分钟。
     -h: 指定时间单位为小时。
     -d: 指定时间单位为天。
     -s: 指定时间单位为秒。
     -m: 指定时间单位为分钟。
     -h: 指定时间单位为小时。
     -d: 指定时间单位为天。

  3. 示例

     ```
     sleep 1：延迟1秒。
     sleep 1s：延迟1秒。
     sleep 1m：延迟1分钟。
     sleep 1h：延迟1小时。
     sleep 1d：延迟1天。
     ```

- `wait`: 用于等待后台进程执行完毕。

  1. 用法

     ```
     wait [pid]
     ```

  2. 示例

     ```
     wait 1234：等待进程号为1234的进程执行完毕。
     ```

- `exit`: 用于脚本或子进程，终止脚本或子进程并返回到父进程，可指定退出状态码。

  1. 用法

     ```
     exit [n]
     ```

  2. 示例

     ```
     exit：退出当前shell。
     exit 1：退出当前shell，并返回状态码1。
     ```

- `logout`: 用于交互式终端会话，注销用户并终止会话。命令不会保留信息到内存，会立即终止会话。

  1. 用法

     ```
     logout
     ```

  2. 示例

     ```
     logout：注销用户并终止会话。
     ```

- `su`: 用于切换用户。

  1. 用法

     ```
     su [option] [user]
     ```

  2. 参数

     -l: 切换到指定用户。
     -c: 执行指定命令。
     -l: 切换到指定用户。
     -c: 执行指定命令。

  3. 示例

     ```
     su：切换到root用户。
     su -：切换到root用户。
     su - root：切换到root用户。
     su - root -c "ls -l"：切换到root用户，并执行ls -l命令。
     ```

- `sudo`: 用于以其他用户身份执行命令。

  1. 用法

     ```
     sudo [option] command
     ```

  2. 参数

     -l: 列出用户可执行的命令。
     -u: 以指定用户身份执行命令。
     -l: 列出用户可执行的命令。
     -u: 以指定用户身份执行命令。
     -i: 以 root 用户身份执行命令。

  3. 示例

     ```
     sudo ls -l：以root用户身份执行ls -l命令。
     sudo -u root ls -l：以root用户身份执行ls -l命令。
     ```

- `passwd`: 用于修改用户密码。

  1. 用法

     ```
     passwd [option] [user]
     ```

  2. 参数

     -l: 锁定用户。
     -u: 解锁用户。
     -d: 删除用户密码。
     -e: 强制用户下次登录修改密码。
     -l: 锁定用户。
     -u: 解锁用户。
     -d: 删除用户密码。
     -e: 强制用户下次登录修改密码。

  3. 示例

     ```
     passwd：修改当前用户密码。
     passwd root：修改root用户密码。
     ```

- `chown`: 用于修改文件或目录的所有者。

  1. 用法

     ```
     chown [option] user:group file
     ```

  2. 参数

     -R: 递归修改。

  3. 示例

     ```
     chown root:root file：将file文件的所有者修改为root，所属组修改为root。
     chown -R root:root dir：将dir目录的所有者修改为root，所属组修改为root，且递归修改子目录和文件。
     ```

- `chmod`: 用于修改文件或目录的权限。

  1. 用法

     ```
     chmod [option] mode file
     ```

  2. 参数

     -R: 递归修改。
     -R: 递归修改。

  3. 示例

     ```
     chmod 777 file：将file文件的权限修改为777。
     chmod -R 777 dir：将dir目录的权限修改为777，且递归修改子目录和文件。
     ```

  4. 权限

     - 0/-: 没有权限。
     - 1/x: 执行权限。
     - 2/w: 写权限。
     - 3/x+w: 执行和写权限。
     - 4/r: 读权限。
     - 5/r+x: 读和执行权限。
     - 6/r+w: 读和写权限。
     - 7/r+w+x: 读、写和执行权限。

- `chgrp`: 用于修改文件或目录的所属组。

  1. 用法

     ```
     chgrp [option] group file
     ```

  2. 参数

     -R: 递归修改。

  3. 示例

     ```
     chgrp root file：将file文件的所属组修改为root。
     chgrp -R root dir：将dir目录的所属组修改为root，且递归修改子目录和文件。
     ```

- `umask`: 用于设置文件或目录的默认权限。

  1. 用法

     ```
     umask [option] mode
     ```

  2. 参数

     -S: 显示权限。

  3. 示例

     ```
     umask：显示当前umask值。
     umask 022：设置umask值为022。
     umask -S：显示当前umask值。
     ```

- `useradd`: 用于创建用户。

  1. 用法

     ```
     useradd [option] user
     ```

  2. 参数

     - -m: 创建用户的家目录。
     - -M: 不创建用户的家目录。
     - -s: 指定用户的 shell。
     - -d: 指定用户的家目录。
     - -g: 指定用户的所属组。
     - -G: 指定用户的附加组。

  3. 示例

     ```
     useradd user：创建user用户。
     useradd -m user：创建user用户，并创建家目录。
     useradd -M user：创建user用户，不创建家目录。
     useradd -s /bin/bash user：创建user用户，并指定shell为/bin/bash。
     useradd -d /home/user user：创建user用户，并指定家目录为/home/user。
     useradd -g root user：创建user用户，并指定所属组为root。
     useradd -G root user：创建user用户，并指定附加组为root。
     ```

- `userdel`: 用于删除用户。

  1. 用法

     ```
     userdel [option] user
     ```

  2. 参数

     -r: 删除用户的家目录。

  3. 示例

     ```
     userdel user：删除user用户。
     userdel -r user：删除user用户，并删除家目录。
     ```

- `usermod`: 用于修改用户。

  1. 用法

     ```
     usermod [option] user
     ```

  2. 参数

     - -l: 修改用户名。
     - -d: 修改用户的家目录。
     - -m: 修改用户的家目录。
     - -s: 修改用户的 shell。
     - -g: 修改用户的所属组。
     - -G: 修改用户的附加组。

  3. 示例

     ```
     usermod -l user1 user：将user用户的用户名修改为user1。
     usermod -d /home/user1 user：将user用户的家目录修改为/home/user1。
     usermod -m -d /home/user1 user：将user用户的家目录修改为/home/user1，并将原家目录的内容移动到新家目录。
     usermod -s /bin/bash user：将user用户的shell修改为/bin/bash。
     usermod -g root user：将user用户的所属组修改为root。
     usermod -G root user：将user用户的附加组修改为root。
     ```

- `groupadd`: 用于创建组。

  1. 用法

     ```
     groupadd [option] group
     ```

  2. 参数

     - -g: 指定组的 GID。

  3. 示例

     ```
     groupadd group：创建group组。
     groupadd -g 1000 group：创建group组，并指定GID为1000。
     ```

- `groupdel`: 用于删除组。

  1. 用法

     ```
     groupdel [option] group
     ```

  2. 参数

     - -r: 删除组的家目录。

  3. 示例

     ```
     groupdel group：删除group组。
     groupdel -r group：删除group组，并删除家目录。
     ```

- `groupmod`: 用于修改组。

  1. 用法

     ```
     groupmod [option] group
     ```

  2. 参数

     - -n: 修改组名。
     - -g: 修改组的 GID。

- 3. 示例

     ```
     groupmod -n group1 group：将group组的组名修改为group1。
     groupmod -g 1000 group：将group组的GID修改为1000。
     ```

- `passwd`: 用于修改用户密码。

  1. 用法

     ```
     passwd [option] user
     ```

  2. 参数

     - -l: 锁定用户。
     - -u: 解锁用户。
     - -d: 删除用户密码。
     - -e: 强制用户下次登录修改密码。

  3. 示例

     ```
     passwd user：修改user用户的密码。
     passwd -l user：锁定user用户。
     passwd -u user：解锁user用户。
     passwd -d user：删除user用户的密码。
     passwd -e user：强制user用户下次登录修改密码。
     ```

- `chattr`: 用于修改文件属性。

  1. 用法

     ```
     chattr [option] file
     ```

  2. 参数

     +: 添加属性。
     -: 删除属性。
     =: 设置属性。
     +: 添加属性。
     -: 删除属性。
     =: 设置属性。

  3. 示例

     ```
     chattr +i file：将file文件设置为不可修改。
     chattr -i file：将file文件设置为可修改。
     chattr +a file：将file文件设置为只能追加内容，不能修改和删除。
     chattr -a file：将file文件设置为可修改和删除。
     chattr +d file：将file文件设置为不能删除。
     chattr -d file：将file文件设置为可删除。
     chattr +s file：将file文件设置为不能被系统回收。
     chattr -s file：将file文件设置为可被系统回收。
     chattr +c file：将file文件设置为压缩后存储。
     chattr -c file：将file文件设置为不压缩存储。
     chattr +u file：将file文件设置为可被恢复。
     chattr -u file：将file文件设置为不可被恢复。
     chattr +j file：将file文件设置为可被日志记录。
     chattr -j file：将file文件设置为不可被日志记录。
     chattr +t file：将file文件设置为不可被修改。
     chattr -t file：将file文件设置为可被修改。
     ```

- `shutdown`: 用于关机。会将未保存的数据和进程信息写入内存，并安全地关闭系统，在下次启动时恢复。

  1. 用法

     ```
     shutdown [option] time [message]
     ```

  2. 参数

     - -c: 取消关机。
     - -h: 关机。
     - -r: 重启。
     - -k: 发送警告信息。

  3. 示例

     ```
     shutdown -h now：立即关机。
     shutdown -h 10：10分钟后关机。
     shutdown -h 10:00：10点关机。
     shutdown -h +10：10分钟后关机。
     shutdown -h +10:00：10点关机。
     shutdown -r now：立即重启。
     shutdown -r 10：10分钟后重启。
     shutdown -r 10:00：10点重启。
     shutdown -r +10：10分钟后重启。
     shutdown -r +10:00：10点重启。
     shutdown -k now：立即发送警告信息。
     shutdown -k 10：10分钟后发送警告信息。
     shutdown -k 10:00：10点发送警告信息。
     shutdown -k +10：10分钟后发送警告信息。
     shutdown -k +10:00：10点发送警告信息。
     shutdown -c：取消关机。
     ```

- `reboot`: 用于重启系统。命令会清空内存中的所有信息，在重新启动时从头开始。

  1. 用法

     ```
     reboot [option]
     ```

  2. 参数

     - -f: 强制重启。

  3. 示例

     ```
     reboot：重启系统。
     reboot -f：强制重启系统。
     ```

### 性能优化相关

- `uptime`

  ```sh
  02:34:03 up 2 days, 20:14,  1 user,  load average: 0.63, 0.83, 0.88
  # 当前时间，系统运行时间，当前登录用户数，平均负载（1分钟，5分钟，10分钟）
  ```

  tip：平均负载指平均活跃进程数，包括可运行状态和不可中断状态的进程。

- 查看系统 cpu 核数：`grep 'model name' /proc/cpuinfo -l`

- 压测工具：`stress`

- 性能分析工具：

  - `sysstat`：包含两个命令

    - `mpstat`：查看多核 CPU 性能指标和 CPU 平均指标

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

  - `perf`：CPU 进程分析工具

    ```
    perf top
    # samples：采样率
    ```

- cpu 使用率相关指标

  - `user(us)`：用户态 CPU 时间，不包括 nice 时间，但是包括 guest 时间

  - `nice(ni)`：低优先级用户态 CPU 时间

  - `system(sys)`：内核态 CPU 时间

  - `idle(id)`：空闲时间，不包括 I/O 等待时间

  - `iowait(wa)`：I/O 等待时间

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

  - `sar`：查看网络吞吐和 PPS

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
