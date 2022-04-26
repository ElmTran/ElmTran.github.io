---
layout: post
title: "Common Linux commands"
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

- xargs命令: 管道传参，将前面命令的标准输出转换成标准输入作为后边命令的参数。  
  `<command1> | xargs <command2>`