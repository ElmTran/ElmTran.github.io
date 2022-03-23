---
layout: post
title: "Install Scoop and Optimize Windows Terminal"
description: "安装scoop和美化windows terminal"
categories: [technology]
tags: [windows, scoop, windows terminal, efficiency]
redirect_from:
  - /2022/03/22/
---

## Install scoop  
```
# 设置执行权限  

    Set-ExecutionPolicy RemoteSigned -scope CurrentUser  

# 从网络下载脚本并安装(官方地址)  

    Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')  

# (加速地址)  

    Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://cdn.yulinyige.com/script/scoop-installs.ps1')


# 可选选项

- 安装位置和用户

    $env:SCOOP='D:\Software\Scoop'
    [Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')

- 全局安装目录

    $env:SCOOP_GLOBAL='F:\Applications\GlobalScoopApps'
    [Environment]::SetEnvironmentVariable('SCOOP_GLOBAL', $env:SCOOP_GLOBAL, 'Machine')

- 常用来源

    scoop bucket add extras
    scoop bucket add nerd-fonts
    scoop bucket add versions

- 常用软件

    scoop install 7zip broot curl dark git sudo vim quicklook scoop-completion colortool
    scoop install FiraCode-NF -g
```

## Beautify powershell  
- Install powershell相关包  
  
  ```
  Install-Module posh-git
  Install-Module oh-my-posh
  Install-Module DirColors
  ```

- 开启`Prompt`
  
  ```
  # 这是开启默认配置的

    Set-Prompt

  # 初始化配置文件

    $PROFILE

  # 编辑配置文件

    code $PROFILE

  # 配置文件内容

    Import-Module posh-git
    Import-Module oh-my-posh
    Import-Module DirColors
    Set-PoshPrompt M365Princess
    Set-PSReadLineOption -PredictionSource History # 设置预测文本来源为历史记录
    Set-PSReadlineKeyHandler -Key Tab -Function Complete # 设置 Tab 键补全
    Set-PSReadLineKeyHandler -Key "Ctrl+d" -Function MenuComplete # 设置 Ctrl+d 为菜单补全和 Intellisense
    Set-PSReadLineKeyHandler -Key "Ctrl+z" -Function Undo # 设置 Ctrl+z 为撤销
    Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward # 设置向上键为后向搜索历史录
    Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward # 设置向下键为前向搜索历史纪录

    '%USERNAME%\scoop\apps\scoop-completion\0.2.3\Scoop-Completion.psd1' # 设置scoop-completion

    If (-Not (Test-Path Variable:PSise)) {
        Import-Module Get-ChildItemColor
        Set-Alias l Get-ChildItem -option AllScope
        Set-Alias ls Get-ChildItemColorFormatWide -option AllScope
        Set-Alias ll Get-ChildItem -option AllScope
    }

  ```

- 开启ColorTool
  ```

  # 查看内置的配色方案，共有 8 种

    colortool --schemes

  # 设置主题，后面是配色方案名称。

    colortool OneHalfDark.itermcolors
  ```

## Windows Terminal优化  
    setting.json文件打开失败，暂时请采用手动配置

## 参考链接
- [Windows包管理工具Scoop简单使用](https://zhuanlan.zhihu.com/p/142234641), 章之昂
- [Windows Terminal 主题美化](https://zhuanlan.zhihu.com/p/352882990), 写代码的陈主任