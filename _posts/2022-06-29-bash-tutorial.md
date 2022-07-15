---
layout: post
title: "Bash Tutorial"
description: "bash笔记"
categories: [technology]
tags: [Shell, Bash, Script, Linux]
redirect_from:
  - /2022/06/29/
---

## 基本语法
- 命令组合
    - `;`： 上一个命令不管执行失败还是成功都会执行下一个命令  
    - `&&`： 上一个命令执行成功，执行下一个命令  
    - `||`： 上一个命令执行失败，执行下一个命令  

- 基本命令：
    - `echo`： 标准输出
    - `type`： 查看命令类型
    - `shopt`： 调整命令状态  
        `dotglob`： 使扩展命令包含隐藏文件  
        `failglob`： 不匹配直接报错  
        `nullgolb`： 不匹配返回空  

- 快捷键：
    - `ctrl + l`： 清屏
    - `ctrl + u`： 清除到行首
    - `ctrl + k`： 清除到行尾
    - `ctrl + w`： 删除一个域
    - `ctrl + a`： 跳转到行首
    - `ctrl + e`： 跳转到行尾

- 扩展：
    - `?`： 任意单字符
    - `*`： 任意多字符
    - `[]`： 匹配括号内的字符
    - `{}`： 遍历括号里面的所有值，值用逗号连接，不能有空格
    - `$`： 变成变量  
      `${!variable}`： 间接引用，获得变量的变量值  
      `${!string*}`： 扩展指定前缀变量  
      `$(...)`： 扩展另一命令结果  
      `$((...))`： 算术结果  
    - `[[：class：]]`： 字符类  

- 量词语法：
    - `?`： 匹配零次或一次
    - `*`： 匹配零次或多次
    - `+`： 匹配一次或多次
    - `@`： 只匹配一次
    - `!`： 否判断

- 单引号：保留字符的基本含义。  
  如果需要转义，需要双重转义，`$'\''`，或者使用`"'"`

- 双引号：大部分特殊字符都会失去原含义。  
  除了：  
  `$`： 引用变量  
  `` ` ``： 执行子命令  
  `\`： 转义

- Here文档：  
  ```
  << token  
  token
  ```  

- Here字符串： `<<< string`

## 变量
- 定义变量：`variable=value`

- 读取变量：`$variable` or `${variable}`, 放在双引号里读取保留原有格式。

- 删除变量：`unset variable` or `variable=''` or `variable=`

- 输出变量：`export variable`

- 特殊变量：  
    `$?`： 上一个命令的退出码  
    `$$`： 当前shell的进程ID  
    `$_`： 上一个命令的最后一个参数  
    `$!`： 最后一个后台执行的异步命令id  
    `$0`： 当前shell的名称  
    `$-`： 当前shell的启动参数  
    `$@`： 脚本参数数量
    `$#`： 脚本参数值

- 变量默认值
    `${var：-word}`： 返回变量值（存在不为空）或者word  
    `${var：=word}`： 返回变量值（存在不为空），否则把word赋给变量并返回
    `${var：+word}`： 变量存在不为空，则返回word，否则返回空
    `${var：?word}`： 返回变量值（存在不为空）或者`var：word`

- 声明特殊变量：  
    `declare OPTION VARIABLE=value`
    `readonly OPTION VARIABLE=value`
    `let`

## 字符串操作

- 获取字符串长度：`${#var}`  

- 提取子字符串：`${var：offset：length}`

- 字符串头部匹配：  
    `${var#pattern}`： 非贪婪  
    `${var##pattern`： 贪婪

- 字符串尾部匹配：  
    `${var%pattern`： 非贪婪  
    `${var%%pattern`： 贪婪  

- 字符串任意位置匹配：  
    `${var/pattern}`： 非贪婪  
    `${var//pattern}`： 贪婪  

- 替换：  
    `${var#pattern/string}`  
    `${var%pattern/string}`  
    `${var/pattern/string}`  

- 改变大小写
    `${var^^}`： 转大写  
    `${var,,}`： 转小写  

## 运算（待施工）

## 行操作（待施工）

## 目录堆栈（待施工）

## 脚本基础

- 执行一个环境变量中的命令：
    `/usr/bin/env NAME`

- 注释：`#`

- 脚本特殊变量：
    `$0`： 脚本文件名  
    `$1-9`： 脚本参数  
    `$#`： 参数总和  
    `$@`： 全部参数，空格分隔
    `$*`： 全部参数，使用`$IFS`值第一个字符分隔  

- `-n`： 变量为空

- `-d`： 变量为目录

- `shift`： 移除脚本第一个参数

- `getopts`： 解析复杂的脚本命令行参数

- `--`： 配置项参数终止符

- `exit`： 退出命令

- `source`： 执行命令，通常重新加载配置，不新建shell

- `alias`： 别名

## 标准输入

- `read [-options] [variable...]`： 读取输入
- `IFS="：" read [-options] [variable...]`： 修改分隔标志
- `<<<`： 将变量转化为标准输入
- `<`： 定向符，将文件内容导入read，每次读取一行

## 条件判断

- if结构：
    ```bash
    if commands; then
        commands
    [elif commands; then
        commands...]
    [else
        commands]
    fi
    ```

- test命令：  `test expression`  or `[expression]`  or `[[expression]]`  
- 常用test命令：  
    - 文件
      - `[ -a file ]`： file存在
      - `[ -b file ]`： file存在且为块文件
      - `[ -c file ]`： file存在且为字符文件
      - `[ -d file ]`： file存在且为目录
      - `[ -e file ]`： file存在
      - `[ -f file ]`： file存在且为普通文件
      - `[ -g file ]`： file设置了组id
      - `[ -G file ]`： file设置了有效组ID
      - `[ -h file ]`： file为符号链接
      - `[ -k file ]`： file设置了sticky bit
      - `[ -L file ]`： file设置了是软链接
      - `[ -N file ]`： 上次读取后已修改
      - `[ -O file ]`： 属于有效用户id
      - `[ -p file ]`： 是一个命名管道
      - `[ -r file ]`： 存在且可读
      - `[ -w file ]`： 存在且可写
      - `[ -x file ]`： 存在且可执行
      - `[ -s file ]`： 存在长度大于0
      - `[ -S file ]`： 是一个socket
      - `[ file1 -nt file2 ]`： file1比file2更新，或file1存在file2不存在
      - `[ file1 -ot file2 ]`： file1比file2更旧，或file1不存在file2存在

    - 字符串
      - `[ string ]`： 不为空
      - `[ -n string ]`： string长度大于0
      - `[ -z string ]`： string长度为0
      - `[ string1 = string2 ]`： string1和string2相同
      - `[ string1 == string2 ]`： 同上
      - `[ string1 != string2 ]`： 不相同
      - `[ string1 '>' string2 ]`： string1字典顺序在string2之后
      - `[ string1 '<' string2 ]`： string1在string2前  

        字符串判断时，变量要放到双引号中。

    - 整数
      - `[ integer1 -eq integer2 ]`： =
      - `[ integer1 -ne integer2 ]`： !=
      - `[ integer1 -le integer2 ]`： <=
      - `[ integer1 -lt integer2 ]`： <
      - `[ integer1 -ge integer2 ]`： >=
      - `[ integer1 -gt integer2 ]`： >

    - 正则
      - `[[ string1 =~ regex ]]`

    - 逻辑运算
      - `&& or || or !`

    - 算术运算
      - `((3 > 2))`

- case 结构
    ```bash
    case expression in 
        pattern )
            command ;;
        pattern )
            command ;;
        ...
    esac
    ```

## 循环

- while循环
    ```bash
    while condition; do
        command
    done
    ```

- util循环
    ```bash
    until condition; do
        command
    done
    ```

- for循环
    ```bash
    for variable in list; do
        command
    done
    ```

    ```bash
    for (( expression1; expression2; expression3 )); do
        command
    done
    # expression1 初始化条件
    # expression2 判断条件
    # expression3 更新值
    ```

- `break`： 跳出循环


- `continue`： 进入下一轮循环

- select结构(一般和case联动)
    ```bash
    select name [in list]
    do
        command
    done
    ```

## 函数

- 定义：
    ```bash
    func() {
        command
        return
    }
    ```
    或者
    ```bash
    function func() {
        command
        return
    }
    ```

- 删除函数：`unset -f FuncName`

- 查看所有的函数：`declare -f`

- 查看函数定义：`declare -f FuncName`

- 参数：
    - `$1-$9`： 第1-9个参数
    - `$0`： 脚本名
    - `$#`： 参数总和
    - `$@`： 全部参数，空格分隔
    - `$*`： 全部参数，`$IFS`第一个字符分隔
- 函数内的变量是全局变量，如果要声明局部变量需要使用`local`

## 数组

- 创建数组
    - `ARRAY[INDEX]=value`
    - `ARRAY=(val1 val2 val3)`
    - `ARRAY=([0]=val2 [2]=val1 [1]=val3)`
    - `ARRAY=( *.mp3 )` 使用通配符
    - `declare -a ARRAY`
    - `read -a ARRAY`

- 读取数组
    - `${array[i]}`
    - `${array[@]}` or `${array[*]}` 读取所有成员："aa bb" 会被读取成aa bb两个成员 
    - `"${array[@]}"` 读取所有成员："aa bb"会被读取成一个成员
    - `"${array[*]}"` 所有成员会被变成一个单字符串读取
    - 如果没有指定成员，默认使用0号成员
    - 读取数组长度：`${#array[*]}` or `${#array[@]}`
    - 读取所有成员索引：`${!array[@]}` or `${!array[*]}`

- 切片：`${array[@]：position：length}`

- 追加成员：`array+=(val)`

- 删除数组：
    - `unset array[idx]`
    - `unset array`：删除整个数组

- 关联数组(类似字典)
    - `declare -A array`

## 脚本环境

- `set`
    - `set -u` or `set -o nounset`：不忽略不存在的变量
    - `set -x` or `set -o xtrace`：输出结果先输出命令
    - `set -e` or `set -o errexit`：失败即退出
    - `set -eo pipfail`：管道命令失败即退出
    - `set -E`：修正没有被trap捕获的命令（设置了`set -e`）
    - `set -n` or `set -o noexec`：不运行，检查语法正确
    - `set -f` or `set -o noglob`：不对通配符进行文件名扩展
    - `set -v` or `set -o verbose`：打印接受的输入
    - `set -o noclobber`：防止重定向运算符`>`覆盖已存在文件。
    - 

- 报错退出(三种写法)
    - `command || { echo "command failed"; exit 1; }`

    - `if ! command; then echo "command failed"; exit 1; fi`

    - `command; if [ "$?" -ne 0 ]; then echo "command failed"; exit 1; fi`

- 忽略某行失败不退出（设置了`set -e`）
    - 使用`set +e`
        ```
        set +e
        command
        set -e
        ```
    - 使用`command || true`

- `shopt`
    - `shopt -s`：开启参数
    - `shopt -u`：关闭参数
    - `shopt` or `shopt -q`：查询参数状态

## 脚本除错

- 考虑命令失败的情况，特别是删除等操作，一定要确保文件存在。

- `$LINENO`：脚本中的行号

- `$FUNCNAME`：返回本函数和引用者名称的数组

- `$BASH_SOURCE`：返回本脚本和调用者名称的数组

- `$BASH_LINENO`：返回每一轮调用的行号

- 临时文件创建原则：
    - 检查文件是否已存在
    - 确保文件创建成功
    - 权限限制
    - 使用不可预测文件名
    - 脚本退出时要清理临时文件

- `mktemp`：
    - `-d`：创建临时目录
    - `-p`：指定路径，默认`/tmp`
    - `-t`：指定模板

- `trap command signal`：响应系统信号
    - `HUP`：编号1，脚本与所在终端脱离联系
    - `INT`：编号2，Ctrl+C，终止脚本运行
    - `QUIT`：编号3，Ctrl+a，退出脚本
    - `KILL`：编号9，杀死进程
    - `TERM`：编号15，kill默认信号
    - `EXIT`：bash脚本特有信号，退出产生

## 启动环境

- 登录session
    - 脚本环境初始化顺序：
        - `/etc/profile`
        - `/etc/profile.d`
        - `~/.bash_profile`
        - `~/.bash_login`
        - `~/.profile`

        其中bash_profile、bash_login若执行后就不往后执行了，没有的情况下往后执行

      - `bash --login`：强制执行登录session的脚本

      - `bash --noprofile`：会跳过上面的profile脚本

- 非登录session
    - 脚本环境初始化顺序：
        - `/etc/bash.bashrc`
        - `/.bashrc`

    - `bash --norc`：禁止调用.bashrc脚本

    - `bash --rcfile filename`：指定bashrc脚本

    - `~/.bash_logout`：退出时的清理工作

- `bash`参数
    - `-n`：不执行脚本，只检查语法错误
    - `-v`：输出执行语句
    - `-x`：输出执行命令

- `~/.inputrc`：键盘绑定

## 参考链接

- [Bash 脚本教程](https://wangdoc.com/bash/index.html), 阮一峰