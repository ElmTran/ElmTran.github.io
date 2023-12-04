---
layout: post
title: "Interview Questions for Go"
description: "常见的Go语言面试题"
categories: [technology]
tags: [computer science, interview, Go]
redirect_from:
  - /2023/12/03/
---

## 基础

1. Go语言的特征：静态类型、编译型、并发型、垃圾回收、快速编译、跨平台。

2. Go语言的基本类型：布尔型、数字类型、字符串类型、派生类型。

## 数组

1. 数组与切片的区别：

    |   数组   |   切片   |
    | :------: | :------: |
    | 长度固定 | 长度可变 |
    |  值类型  | 引用类型 |

    引申：`[3]int`和`[4]int`是不同的类型，但`[]int`是一个类型。

2. 切片的数据结构

    ```go
    type slice struct {
        array unsafe.Pointer    // 指向底层数组的指针
        len   int            // 切片的长度
        cap   int         // 切片的容量
    }
    ```

3. 修改切片中的值：

    ```go
    func main() {
        s := []int{1, 2, 3}
        modifySlice(s)
        fmt.Println(s) // [1, 2, 3]
    }

    func modifySlice(s []int) {
        s[0] = 100
    }
    ```

    传递切片时，传递的是切片的引用，所以在函数内部修改切片的值，会影响到原切片。

4. 切片的扩容策略：

    - 如果新申请的容量小于256，则新容量为原容量的2倍。
    - 若新申请的容量大于等于256，则`newcap = oldcap+(oldcap+3*256)/4`。
    - 使用`growslice`函数进内存对齐。

    ```go
    func func1() {
        s := []int{5}
        s = append(s, 7)
        s = append(s, 9)
        x := append(s, 11)
        y := append(s, 12)
        fmt.Println(s, x, y)    // [5 7 9] [5 7 9 12] [5 7 9 12]
    }

    func func2() {
        s := []int{1,2}
        s = append(s,4,5,6)
        fmt.Printf("len=%d, cap=%d",len(s),cap(s))  // len=5, cap=6
    }
    ```

5. `append`函数：

    - `append`函数返回值是一个新的切片，且必须作为返回值接收。
    - `append(slice, elem1, elem2)`
    - `append(slice, slice2...)`

6. 切片作为函数参数时：

    - 如果直接传递切片，实参slice并不会被函数操作改变。
    - 如果传递切片的指针，实参slice会被函数操作改变。
    - 但是通过指针传递切片，会导致切片的底层数组被修改，所以不推荐。

    ```go
    func main() {
        s := []int{1, 2, 3}
        modifySlice(s)
        fmt.Println(s) // [1, 2, 3]
        modifySlice2(&s)
        fmt.Println(s) // [100, 2, 3]
    }

    func modifySlice(s []int) {
        s[0] = 100
    }

    func modifySlice2(s *[]int) {
        (*s)[0] = 100
    }
    ```


## Reference

- [Go 程序员面试笔试宝典](https://golang.design/go-questions/)