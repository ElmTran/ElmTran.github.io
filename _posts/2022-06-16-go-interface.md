---
layout: post
title: "Go interface"
description: "go接口"
categories: [technology]
tags: [Go, Programming Language, Development]
redirect_from:
  - /2022/05/06/
---

# 概念理解
- 定义一个接口
    ```go
    type Duck interface {
        Quack() // 鸭子叫
        DuckGo() // 鸭子走
    }
    ```
    这里的鸭子是一些方法的集合，但是我不知道方法的具体实现，后面的某一个结构体可能会包含这些方法。

- 实现一个结构体
    ```go
    type Platypus struct {
    }

    func (p Platypus) IsPlatpytus {
        fmt.Println("我是可达鸭")
    }

    // 同时他可以像鸭子一样叫，鸭子一样走路
    func (p Platypus) Quack() {
        fmt.Println("嘎嘎嘎")
    }

    func (p Platypus) DuckGo() {
        fmt.Println("摇摆")
    }
    ```
    这只聪明的可达鸭虽然是鸭嘴兽但是他能做鸭子做的事，所以他可以也是一直鸭子(接口)

- 使用接口调用
    ```go
    func DoDuck(d Duck) {
        d.Quack()
        d.DuckGo()
    }

    func main() {
        p := Platypus{}
        DoDuck(p)
    }
    ```

# 空接口
- 用法
    ```go
    // 用法1 赋予任意类型的值
    type i interface{}
    i = 1
    fmt.Println(i)

    // 用法2 接受任意类型的参数
    func print (iface interface{}) {
        fmt.Println(iface)
    }

    // 用法3 接受任意多的值
    func print (ifaces ...interface) {
        for _, iface := range(ifaces) {
            fmt.Println(iface)
        }
    }

    // 用法4 任意类型的array、slice、map、struct
    ```