---
layout: post
title: "Some Tools for Python, Updating~"
description: "Python相关内容，持续更新中~"
categories: [technology]
tags: [python, programming language]
redirect_from:
  - /2022/03/23/
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