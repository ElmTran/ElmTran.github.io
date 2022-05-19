---
layout: post
title: "Python Generator"
description: "Python生成器"
categories: [technology]
tags: [python, programming language, generator, yield]
redirect_from:
  - /2022/05/19/
---

## 什么是生成器
简言之，就是使用了yield的函数。

## 生成器的作用
- 先了解一下python2中range和xrange的区别。  
  range(n)会生成一个list, xrange(n)会生成一个可迭代对象。  
  当n值较大时，前者会占用较多的资源。  

  注：python已经默认使用xrange并更名为range。

- yield和return的区别
    ```python
    def SimpleGenerator():
        for i in range(3):
            yield i
            i +=1
        return i
    
    for i in SimpleGenerator():
        print(i)
    
    # result: 0, 1, 2
    ```

    ```python
    def SimpleGenerator():
        for i in range(3):
            yield i
            i += 1
            return i
    for i in SimpleGenerator():
        print(i)
    
    # result: 0
    ```
    结论：yield会上报值，但不会影响生成器的继续执行。return终止生成器。

## 实际应用
- 斐式数列  
  一种常见思路: 初始化一个数组，然后讲生成的数列填充到数组，并返回。  
  使用生成器：  
    ```python
    def fib(n):
        idx, a, b = 0, 0, 1
        while idx < n:
            yield b
            a, b = b, a + b
            idx + 1
    ```

- scrapy爬虫
    ```python
    def parse(self):
        for page in pages:
            yield scrapy.Request(
                url = f"{url_template}?page={page}",
                callback = self.parse_detail,
                meta=meta
            )
    ```
    爬虫一般会涉及到很多页面和很多层，占用资源非常高。所以，当我们把这些页面内容存储到列表里面返回时，很容易耗尽资源导致程序失败。这时候生成器就发挥了很重要的作用，因此生成器的使用在爬虫中非常常见。

- 生成器设计模式(联系并不大，只是查资料查到了，做个扩展)  
    考虑一个场景：我们需要造一辆车。  
    1. 一般我们会造一个车身和四个轮子（构造一个基类）  
    2. 当这辆车需要更多的功能的时候：  
       我们会给车添加车载空调、自动驾驶系统、甚至武器系统。根据不同的需求，我们需要生产出不同的车型。（生成子类）
    3. 每一次扩展我们都可能生产更复杂的结构，为每一个可能生产一种车型（生成大量子类），会导致我们的车间变得很复杂。
    4. 一种解决方案：在原始车型上创建一个超级构造函数，可以变成所有的可能的车型。（超级基类-同时它也是一个超级鸡肋，因为有大量参数都不会使用到。对构造函数的调用也非常不美观）
    5. 生成器设计方案：  
        将对象构造代码从产品中抽离出来，将其放在一个独立的生成器对象中。  
        使用生成器生产汽车和对应的手册（描述汽车部件功能-抽象为同一个过程不同结果的子类）
        ```python
        class Car:        # 不同的车型会使用不同的部件
            def __init__(self) -> None:
                self.parts = []

            def add(self, part: Any) -> None:
                self.parts.append(part)

            def print_parts(self) -> None:
                print(f"this car has {','.join(self.parts)}")

        class Manual:     # 描述部件功能，相当于和造车同一过程，却得到不同的结果对象
            def __init__(self) -> None:
                self.parts = []

            def add(self, part: Any) -> None:
                self.parts.append(part)

            def print_parts(self) -> None:
                print(f"this manual has {','.join(self.parts)}")

        class Builder:
            @property
            @abstractmethod
            def car(self) -> None:
                pass

            @abstractmethod
            def reset():
                pass

            @abstractmethod
            def buildSeats():
                pass

            @abstractmethod
            def buildEngine():
                pass

            @abstractmethod
            def buildGps():
                pass
            
            # ...
        class CarBuilder(Builder):
            def __init__(self) -> None:
                self.reset()
            
            def reset(self) -> None:
                self._car = Car()

            def car(self) -> Car:
                car = self._car
                self.reset()
                return car

            def buildSeats():
                self._car.add('seats')

            def buildEngine():
                self._car.add('engine')

            def buildGps():
                self._car.add('gps')
            
            # ...
        
        class ManualBuilder(Builder):
            def __init__(self) -> None:
                self.reset()

            def reset(self) -> None:
                self._manual = Manual()

            def manual(self) -> Manual:
                manual = self._manual
                self.reset()
                return manual

            def buildSeats():
                self._manual.add('seats_introduction')

            def buildEngine():
                self._manual.add('engine_introduction')

            def buildGps():
                self._manual.add('gps_introduction')

        class Director():
            def __init__(self) -> None:
                self._builder = None

            @property
            def builder(self) -> Builder:
                return self._builder

            @builder.setter
            def builder(self, builder) -> None:
                self._builder = builder

            def build_minimal_car(self) -> None:
                self.builder.buildSeats()
                self.builder.buildEngine()

            def build_full-featured_car(self) -> None:
                self.builder.buildSeats()
                self.builder.buildEngine()
                self.builder.buildGps()

        if __name__ == "__main__":
            director = Director()

            car_builder = CarBuilder()
            director.builder = car_builder()
            director.build_minimal_car()
            car_builder.car.print_parts()

            manual_builder = ManualBuilder()
            director.builder = manual_builder()
            director.build_full_featured_car()
            manual_builder.manual.print_parts()

            # custom build
            car_builder.reset()
            car_builder.buildSeats()
            car_builder.buildGps()
            car_builder.car.print_parts()

        ```

## 参考链接
- [生成器模式](https://refactoringguru.cn/design-patterns/builder)
