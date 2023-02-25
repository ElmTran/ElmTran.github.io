---
layout: post
title: "Windows bugs"
description: "windows bugs和解决方案记录"
categories: [technology]
tags: [Windows Bug]
redirect_from:
  - /2022/06/29/
---

- windows输入法切换插件被重置或不生效  
    修复方案：修改注册表  

    使 `\HKEY_USERS\.DEFAULT\Control Panel\Input Method\Hot Keys\`  

    与 `\HKEY_CURRENT_USER\Control Panel\Input Method\Hot Keys\`  
    保持一致。


- 照片打不开，显示file system error

    修复方案：install Media Feature Pack

    Setting-APP-Optional Features-Media Feature Pack

- 输入法不显示

    取消勾选 Use the desktop language bar when it's available

- cpu休眠bug（正在测试）】

    registry key: HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Dwm
    item: OverlayTestMode