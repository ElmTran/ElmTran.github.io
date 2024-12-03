---
layout: post
title: "Bash Execute Python"
description: "Execute Python in Bash"
categories: [technology]
tags: [technology, bash, python, programming]
date: 2022/07/30
---

## Simple Example

```bash
$ foo="hello world"; python -c "print('$foo')"

$ bar=`python -c "print('hello world')"`; echo $bar

$ foo="hello world"
$ python << EOF
> print('$foo')
> EOF
```

## Send Parameters to python

```bash
$ python -c "import sys; print(sys.argv[1])" "hello world"
```

## Execute Python Script

```bash
$ python test.py "hello world"
```

```python
# test.py
import sys
print(sys.argv[1])
```

## Reference

- [如何在 bash 里面写 python](https://blog.csdn.net/weixin_44881875/article/details/120417593), 2018-06-06, 漠漠颜
- [shell 调用 python 脚本，并且向 python 脚本传递参数](https://blog.csdn.net/weixin_44881875/article/details/120417593), 2022-10-17, Hwrn.aou
