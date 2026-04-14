---
layout: post
title: "Go Channel"
description: "Usage and implementation of Go Channel"
categories: [technology]
tags: [programming language, go, channel, concurrency]
date: 2023/04/21
---

# Go Channel

## 1. What is Channel

Channel is a special type in Go language, which can be used for safe and convenient data communication between different Goroutines (lightweight threads in Go language). Channels are data structures created on the heap, which provide a mechanism for one goroutine to safely send data to another goroutine, and this communication is synchronous. The role of Channel in Go language is similar to that of pipeline in Unix system.

在 Go 语言中，Channel 是一种特殊的类型，可用于在不同的 Goroutine（Go 语言中的轻量级线程）之间进行安全和简便的数据通信。Channels 是创建在堆上的数据结构，它们提供了一种机制，使得一个 goroutine 能够安全地向另一个 goroutine 发送数据，并且这种通信是同步的。Channel 在 Go 语言中的作用和 Unix 系统中管道相似。

## 2. Types of Channel

Unbuffered Channels（非缓冲型通道）和 Buffered Channels（缓冲型通道）。

### 2.1 Unbuffered Channel

Unbuffered Channel is a channel without buffer. When sending data to the channel, the sender will block until the data is received by the receiver. When receiving data from the channel, the receiver will block until the data is sent by the sender. Unbuffered Channel is also called synchronous channel.

非缓冲型通道是没有缓冲区的通道。当向通道发送数据时，发送者会阻塞，直到数据被接收者接收。当从通道接收数据时，接收者会阻塞，直到数据被发送者发送。非缓冲型通道也叫同步通道。

### 2.2 Buffered Channel

Buffered Channel is a channel with buffer. When sending data to the channel, if the buffer is not full, the sender will not block, otherwise the sender will block until the data is received by the receiver. When receiving data from the channel, if the buffer is not empty, the receiver will not block, otherwise the receiver will block until the data is sent by the sender. Buffered Channel is also called asynchronous channel.

缓冲型通道是有缓冲区的通道。当向通道发送数据时，如果缓冲区未满，发送者不会阻塞，否则发送者会阻塞，直到数据被接收者接收。当从通道接收数据时，如果缓冲区不为空，接收者不会阻塞，否则接收者会阻塞，直到数据被发送者发送。缓冲型通道也叫异步通道。

## 3. Usage of Channel

Channel is widely used in Go program design to safely pass data between different Goroutines and synchronize between Goroutines. Common Channel patterns include: function parameters, function return values, Select statement Case, broadcast mechanism, semaphore mechanism, mutex, conditional variables, event publishing and subscription mechanism, timeout mechanism, timer, iterator, thread pool, message queue, connection pool, etc.

在 Go 程序设计中，Channel 被广泛用于在不同的 Goroutine 之间安全地传递数据和在 Goroutine 之间进行同步。常用的 Channel 模式有：函数参数，函数返回值，Select 语句的 Case，广播机制，信号量机制，互斥锁，条件变量，事件发布订阅机制，超时机制，定时器，迭代器，线程池，消息队列，连接池等。

Scenarios(场景)：

1. Concurrency control(并发控制)
2. Task distribution(任务分发)
3. Event subscription(事件订阅)
4. Control flow synchronization(控制流同步)
5. Error handling(错误处理)

## 4. Implementation of Channel

### 4.1 Unbuffered Channel

```go
ch := make(chan int)
```

### 4.2 Buffered Channel

```go
ch := make(chan int, 10)
```

### 4.3 Channel Close

```go
close(ch)
```

### 4.4 Channel Send

```go
ch <- 1
```

### 4.5 Channel Receive

```go
x := <-ch
```

### 4.6 Channel Select

```go
select {
case x := <-ch:
    // do something
case ch <- x:
    // do something
default:
    // do something
}
```

### 4.7 Channel Range

```go
for x := range ch {
    // do something
}
```

## Examples

### 1. Fibonacci

```go
import (
    "fmt"
)

func fibonacci(ch, quit chan int) {
    x, y := 0, 1
    for {
        select {
        case ch <- x:
            x, y = y, x+y
        case <-quit:
            fmt.Println("quit")
            return
        }
    }
}

func main() {
    ch := make(chan int)
    quit := make(chan int)
    go func() {
        for i := 0; i < 10; i++ {
            fmt.Println(<-ch)
        }
        quit <- 0
    }()
    fibonacci(ch, quit)
}
```

### 2. Prime

```go
import (
    "fmt"
)

func generate(ch chan int) {
    for i := 2; ; i++ {
        ch <- i
    }
}

func filter(in, out chan int, prime int) {
    for {
        i := <-in
        if i%prime != 0 {
            out <- i
        }
    }
}

func main() {
    ch := make(chan int)
    go generate(ch)
    for i := 0; i < 10; i++ {
        prime := <-ch
        fmt.Println(prime)
        ch1 := make(chan int)
        go filter(ch, ch1, prime)
        ch = ch1
    }
}
```

## Reference

- [Go Channel 详解](https://colobu.com/2016/04/14/Golang-Channels/#Channel%E7%B1%BB%E5%9E%8B), smallnest

- [Go by Example: Channels](https://gobyexample.com/channels)
