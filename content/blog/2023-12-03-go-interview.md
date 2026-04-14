---
layout: post
title: "Interview Questions for Go"
description: "常见的Go语言面试题"
categories: [technology]
tags: [computer science, interview, Go]
date: 2023/12/03
---

## 基础

1. Go 语言的特征：静态类型、编译型、并发型、垃圾回收、快速编译、跨平台。

2. Go 语言的基本类型：布尔型、数字类型、字符串类型、派生类型。

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

   - 如果新申请的容量小于 256，则新容量为原容量的 2 倍。
   - 若新申请的容量大于等于 256，则`newcap = oldcap+(oldcap+3*256)/4`。
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

   - 如果直接传递切片，实参 slice 并不会被函数操作改变。
   - 如果传递切片的指针，实参 slice 会被函数操作改变。
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

## Map

1. Map 的数据结构：

   ```go
   type hmap struct {
       count int
       flags uint8
       B     uint8
       noverflow uint16
       hash0 uint32
       buckets unsafe.Pointer
       oldbuckets unsafe.Pointer
       nevacuate uintptr
       extra *mapextra
   }
   ```

2. go 的 map 是使用哈希表实现的，并采用链表法解决哈希冲突。

3. map 的操作

   - `make(map[keyType]valueType, cap)`：创建 map。
   - `map[key] = value`：添加元素。
   - `delete(map, key)`：删除元素。
   - `value, ok := map[key]` or `value = map[key]`：获取元素。
   - `len(map)`：获取元素个数。

4. map 的遍历

   ```go
   func main() {
       m := map[string]int{
           "a": 1,
           "b": 2,
           "c": 3,
       }
       for k, v := range m {
           fmt.Println(k, v)
       }
   }
   ```

5. map 的 key

   - map 的 key 必须支持`==`和`!=`操作。
   - map 的 key 不能是函数类型、map 类型和切片类型。
   - struct 类型不包含上述字段，也可以作为 key。
   - 无序性：map 的遍历顺序与添加顺序无关。

6. 无法对 map 进行取址操作，因为 map 可能会进行扩容，导致地址发生变化。

7. 比较两个 map 是否相等：

   - map 只能与 nil 比较。
   - map 不能使用`==`比较，只能遍历比较。

   ```go
   func main() {
       m1 := map[string]int{
           "a": 1,
           "b": 2,
           "c": 3,
       }
       m2 := map[string]int{
           "a": 1,
           "b": 2,
           "c": 3,
       }
       fmt.Println(m1 == m2) // invalid operation: m1 == m2 (map can only be compared to nil)
       fmt.Println(m1 == nil) // false
       fmt.Println(m1Equal(m1, m2)) // true
   }

   func m1Equal(m1, m2 map[string]int) bool {
       if len(m1) != len(m2) {
           return false
       }
       for k, v := range m1 {
           if v2, ok := m2[k]; !ok || v != v2 {
               return false
           }
       }
       return true
   }
   ```

8. map 不是线程安全的，如果需要并发读写，需要加锁。

9. map 的扩容条件：

   - 装载因子超过阈值（6.5）
   - overflow 的 bucket 数量过多
   - 采用渐进式搬迁扩容策略。

## 接口

1. 值类型接收者会隐含地创建指针型接收者的方法。参考：[值接收者和指针接收者](https://golang.design/go-questions/interface/receiver/#%e5%80%bc%e6%8e%a5%e6%94%b6%e8%80%85%e5%92%8c%e6%8c%87%e9%92%88%e6%8e%a5%e6%94%b6%e8%80%85)

   ```
   type greeter interface {
       greet()
       farewell()
   }

   type english struct {
   }

   func (e english) greet() {
       fmt.Println("Hello")
   }

   func (e *english) farewell() {
       fmt.Println("Goodbye")
   }

   func main() {
       var e greeter = &english{}
       e.greet()
       e.farewell()
   }
   ```

   这里的`e`是一个指针，但是`e.greet()`是可以调用的，因为编译器会隐式地将`e.greet()`转换为`(*e).greet()`, 即由值类型的接收者为指针类型接收者创建了一个方法。相反如果`e`是一个值类型，那么`e.farewell()`就会报错，因为编译器不会隐式地将`e.farewell()`转换为`(&e).farewell()`。

2. 接口的实现：

   - 接口的实现是隐式的，只要实现了接口的方法，就实现了该接口。
   - 接口的实现是`非侵入式`的，不需要在实现类中显式地声明实现了哪些接口。

3. iface vs eface

   - iface：定义了接口的类型，包含两个指针，一个指向类型的方法表，一个指向实际的数据。只有当接口存储的类型和对象都为 nil 时，接口才为 nil。
   - eface：空接口，包含两个指针，一个指向类型的类型信息，一个指向实际的数据。

4. 检查 T 类型是否实现了某个接口：

   ```go
   var _ interface{} = (*T)(nil)
   var _ interface{} = T{}
   ```

5. 断言

   ```go
   var i interface{} = "hello"
   if s, ok := i.(string); ok {
       fmt.Println(s)
   }
   ```

6. 使用接口实现多态

   ```go
   type animal interface {
       call()
       grow()
   }

   type cat struct {
       age int
   }

   func (c cat) call() {
       println("miao")
   }

   func (c *cat) grow() {
       c.age++
   }

   type dog struct {
       age int
   }

   func (d dog) call() {
       println("wang")
   }

   func (d *dog) grow() {
       d.age += 2
   }

   func howl(a animal) {
       a.call()
   }

   func grow(a animal) {
       a.grow()
   }

   func main() {
       c := cat{age: 1}
       howl(&c)
       grow(&c)
       println(c.age)
       d := dog{age: 2}
       howl(&d)
       grow(&d)
       println(d.age)
   }
   ```

## 内置函数

1. `new`和`make`的区别：

   - `new`用于值类型和用户定义的类型，如自定义结构体。
   - `make`用于内置引用类型，如`map`、`slice`、`channel`。

2. 常用的内置函数：

   - `len`：返回长度。
   - `cap`：返回容量。
   - `append`：追加元素。
   - `copy`：复制切片。
   - `close`：关闭通道。
   - `delete`：删除 map 中的元素。
   - `new`：分配内存，返回指针。
   - `make`：分配内存，返回引用类型。
   - `panic`：停止常规的 goroutine。
   - `recover`：允许程序恢复 goroutine。
   - `reflect.TypeOf`：返回变量的实际类型。
   - `reflect.ValueOf`：返回变量的实际值。
   - `unsafe.Sizeof`：返回变量的字节大小。

## Reference

- [Go 程序员面试笔试宝典](https://golang.design/go-questions/)
