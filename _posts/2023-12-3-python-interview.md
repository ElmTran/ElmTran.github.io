---
layout: post
title: "Python Interview"
description: "常见的Python面试题"
categories: [technology]
tags: [computer science, interview, python, Django, Flask]
redirect_from:
  - /2023/10/10/
---

## Python

1. 多线程

   - GIL：全局解释器锁，Python中的一个线程对应于C语言中的一个线程，GIL使得同一时刻只有一个线程在一个CPU上执行字节码，无法将多个线程映射到多个CPU上执行。GIL会根据执行的字节码行数以及时间片释放GIL，GIL在遇到IO操作时主动释放。

   - 多线程的作用：对于IO密集型程序，多线程能够提高程序的执行效率，提高程序的响应速度。

   - 实现多线程的方式：threading模块、multiprocessing模块、concurrent.futures模块、asyncio模块。

        - threading模块：创建线程的方式，创建线程的方式有两种，一种是直接调用threading.Thread()方法，另一种是继承threading.Thread类并重写run()方法。

        - multiprocessing模块：创建进程的方式，创建进程的方式有两种，一种是直接调用multiprocessing.Process()方法，另一种是继承multiprocessing.Process类并重写run()方法。

        - futures模块：线程池和进程池，使用线程池和进程池的方式有两种，一种是直接调用concurrent.futures.ThreadPoolExecutor()方法或concurrent.futures.ProcessPoolExecutor()方法，另一种是继承concurrent.futures.ThreadPoolExecutor类或concurrent.futures.ProcessPoolExecutor类并重写run()方法。

        - asyncio模块：协程，使用协程的方式有两种，一种是直接调用asyncio.coroutine()方法，另一种是使用async关键字。

2. 常用数据结构

   - 列表：list，有序，可变，可重复，可嵌套，可切片，可迭代，可排序，可比较，可拼接，可删除，可修改，可增加，可查找，可遍历，可推导，可转换，可复制，可清空，可删除，可获取长度，可获取最大值，可获取最小值，可获取索引，可获取元素。本质是可变长度的数组。
   - 元组：tuple，有序，不可变。本质是固定长度、不可变的数组。
   - 字典：dict，无序，可变。本质是伪随机探测的哈希表。
   - 集和：set，无序，可变，不可重复。本质是空值的哈希表。

3. 拷贝

    - 直接赋值：`a = b`，a和b指向同一个对象，修改a会影响b，修改b会影响a。
    - 浅拷贝：`a = b.copy()`，a和b指向不同的对象，修改a不会影响b，修改b会影响a，但是如果a和b中的元素是可变对象，修改a中的元素会影响b中的元素，修改b中的元素会影响a中的元素。
    - 深拷贝：`a = copy.deepcopy(b)`，a和b指向不同的对象，修改a不会影响b，修改b不会影响a。
    - 数组拷贝：`a = b[:]`，浅拷贝。

4. 装饰器

    - 装饰器的作用：在不修改原函数的情况下，为原函数添加新的功能。
    - 装饰器的实现：使用闭包实现装饰器，使用functools.wraps()装饰内部函数。使用@符号将装饰器应用到函数上。
    - 装饰器的分类：无参装饰器、有参装饰器、类装饰器、装饰器链。

    - example：

        ```python
        import functools

        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                print('before')
                result = func(*args, **kwargs)
                print('after')
                return result
            return wrapper

        @decorator
        def func():
            print('func')

        func()
        ```

5. 生成器

    - 生成器的作用：生成器是一种特殊的迭代器，生成器是一个函数，使用yield关键字返回一个迭代器，生成器的本质是一个迭代器。
    - 生成器的实现：使用yield关键字实现生成器，使用for循环遍历生成器。
    - example：

        ```python
        def generator():
            for i in range(10):
                yield i

        for i in generator():
            print(i)
        ```

6. 闭包

    - 闭包的作用：闭包是一个函数，它可以访问其他函数内部的变量，闭包可以将函数内部的变量保存在内存中，闭包可以避免使用全局变量。
    - 闭包的实现：使用闭包的方式有两种，一种是使用嵌套函数，另一种是使用类。
    - example：

        ```python
        def outer():
            a = 1
            def inner():
                print(a)
            return inner

        func = outer()
        func()
        ```

7. "+"问题及优化

    - "+"问题：字符串是不可变的，使用"+"拼接字符串时，每次都会创建一个新的字符串对象，然后将原字符串对象和新的字符串对象拼接，连续使用"+"拼接字符串时，会产生大量的临时字符串对象，占用大量的内存空间，影响程序的执行效率。
    - 优化：使用列表代替字符串，使用"".join()方法拼接字符串。


9. "=="和"is"的区别

    - "=="：比较两个对象的值是否相等。
    - "is"：比较两个对象的内存地址是否相等。

10. 垃圾回收机制

    - 当python的某个对象引用计数为0时，该对象就要成为被回收的对象。Del对象后，垃圾回收启动，将所占内存清空。垃圾回收时，python不进行其他任务，频繁回收，会降低工作效率。分配对象和取消分配对象差值高于阈值时，才会启动回收。

11. 内存管理方式

    - 引用计数：当一个对象被引用时，它的引用计数加1，当一个对象的引用计数为0时，它会被垃圾回收机制回收。
    - 标记清除：当一个对象被引用时，它的标记为1，当一个对象的标记为0时，它会被垃圾回收机制回收。
    - 分代回收（内存池）：将所有的对象分为三代，当一个对象被引用时，它的代数为0，当一个对象的代数为2时，它会被垃圾回收机制回收。

12. 循环引用处理：
    - 延迟导入；
    - 将`from module import package`改为`import module.package`；
    - 重新组织代码结构；
    - 使用弱引用。

13. 文件操作注意事项：打开模式、异常处理、文件对象的关闭，接收缓冲区的大小。

14. 调试方式：

    - 断点打印
    - 断言
    - 日志
    - IDE调试
    - pdb调试

15. 面向对象三大特性：封装、继承、多态。

    - 封装：将数据和方法封装到类中，数据和方法只对类的内部可见，对外部不可见。
    - 继承：子类继承父类的属性和方法。
    - 多态：同一种事物的多种形态。

16. python的语言特性：面向对象、动态类型、强类型、解释型、可扩展，代码可读性好。

17. 拦截器和修饰器的区别：

    - 拦截器：拦截器是一种机制，允许在视图处理前后执行自定义的逻辑。在请求到达视图函数或类之前，请求可能会经过一个或多个拦截器，这些拦截器可以执行诸如身份验证、日志记录等操作。
    - 修饰器：修饰器是一种语法糖，用于修饰函数或类，修饰器可以在不修改原函数或类的情况下，为原函数或类添加新的功能。

18. Python2和Python3的区别：

    |          | Python2              | Python3                |
    | :------- | :------------------- | :--------------------- |
    | print    | print "hello"        | print("hello")         |
    | 编码     | ASCII                | Unicode                |
    | 整除     | 3/2=1                | 3/2=1.5                |
    | 异常     | except Exception, e: | except Exception as e: |
    | xrange   | 有                   | 无                     |
    | input    | 无                   | 有                     |
    | Unicode  | 无                   | 有                     |
    | 模块     | 无                   | 有                     |
    | 长整型   | 无                   | 有                     |
    | 迭代     | 迭代器               | 生成器                 |
    | urllib   | urllib2              | urllib                 |
    | 不等号   | <>                   | !=                     |
    | 除法     | /                    | //                     |
    | f-string | 无                   | 有                     |

19. xrange和range的区别：

    - xrange：返回一个生成器，节省内存，适用于循环。
    - range：返回一个列表，占用内存，适用于索引。(python3已弃用xrange,range默认返回一个生成器)

20. enumerate的作用：

    - enumerate是一个内置函数，它可以将一个可迭代对象转换为枚举对象，枚举对象包含了索引和值。
    - example：

        ```python
        for index, value in enumerate(['a', 'b', 'c']):
            print(index, value)
        ```

21. zip的作用：

    - zip是一个内置函数，它可以将多个可迭代对象打包成一个元组，然后返回一个可迭代对象。
    - example：

        ```python
        for i in zip([1, 2, 3], ['a', 'b', 'c']):
            print(i)
        ```

22. map的作用：
    
        - map是一个内置函数，它可以将一个函数作用于一个可迭代对象的每个元素，然后返回一个可迭代对象。
        - example：
    
            ```python
            def func(x):
                return x + 1
    
            for i in map(func, [1, 2, 3]):
                print(i)
            ```

### Django

1. Django vs Flask

    - Django: 自带ORM，admin管理界面, sqlite数据库和测试组件等内置功能，鼓励快速开发和简洁的设计。但对于性能要求较高的项目，需要对Django的一些内置功能进行重构。

    - Flask: 具有高度的灵活性和自由度，核心功能只包含路由分发和模板引擎，可扩展性强，项目组织结构和功能完全由开发者自己决定。

2. Django的特点

    - Django是走大而全的方向，它的目标是帮助开发者快速开发和部署项目。
    - Django的设计哲学是“不重复造轮子”，它鼓励开发者使用现有的组件，而不是重复开发。它提供了一整套解决方案，包括ORM、模板引擎、路由系统、中间件、表单、认证系统、缓存、国际化、管理后台、测试等，这些功能都是可插拔的，开发者可以根据自己的需求选择使用。
    - 但是性能扩展性不如Flask，Django的一些内置功能会影响性能。
    - 适合中小型项目，或者大型项目的快速开发阶段。
3. Django的访问生命周期：

    url -> wsgi -> middleware -> router -> view -> middleware -> response -> wsgi -> url

    1. url解析
    2. wsgi将Web服务器收到的HTTP请求转发给Django应用程序.
    3. 中间件是一种机制，允许在视图处理前后执行自定义的逻辑。在这个步骤中，请求可能会经过一个或多个中间件，这些中间件可以执行诸如身份验证、日志记录等操作。
    4. Django的路由系统会根据URL将请求分发到相应的视图函数或类。
    5. 在视图阶段，请求被传递给匹配的视图函数或类，这里进行具体的请求处理逻辑，比如从数据库中获取数据、进行业务逻辑处理等。
    6. 在视图处理完成后，响应会被传递给中间件，中间件可以执行诸如日志记录、缓存等操作。
    7. 在视图函数或类处理完请求后，生成HTTP响应，包括响应的内容和状态码等。
    8. 最后，响应通过WSGI接口返回给Web服务器，然后由Web服务器发送给客户端。

4. Django的组件