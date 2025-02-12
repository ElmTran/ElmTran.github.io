---
layout: post
title: "Python Tools"
description: "Python相关内容"
categories: [technology]
tags: [python, programming language]
date: 2022/03/23
---

## Pip Source

```
# 清华

    pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple/

# 阿里

    pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/

# 腾讯

    pip config set global.index-url http://mirrors.cloud.tencent.com/pypi/simple/

# douban

    pip config set global.index-url http://pypi.douban.com/simple/
```

## Virtual Environment

- virtualenv

  ```
    # install

        pip install virtualenv

    # create

        virtualenv venv

    # active

        source venv/bin/active

    # deactive

        deactive
  ```

## 虚拟环境和依赖管理

- [poetry](https://python-poetry.org/)

- [uv](https://github.com/astral-sh/uv)
