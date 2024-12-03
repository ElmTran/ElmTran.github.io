---
layout: post
title: "Interview Questions for Python"
description: "常见的Python面试题"
categories: [technology]
tags: [computer science, interview, python, Django, Flask]
date: 2023/12/03
---

## Python

1.  多线程

    - GIL：全局解释器锁，Python 中的一个线程对应于 C 语言中的一个线程，GIL 使得同一时刻只有一个线程在一个 CPU 上执行字节码，无法将多个线程映射到多个 CPU 上执行。GIL 会根据执行的字节码行数以及时间片释放 GIL，GIL 在遇到 IO 操作时主动释放。

    - 多线程的作用：对于 IO 密集型程序，多线程能够提高程序的执行效率，提高程序的响应速度。

    - 实现多线程的方式：threading 模块、multiprocessing 模块、concurrent.futures 模块、asyncio 模块。

      - threading 模块：创建线程的方式，创建线程的方式有两种，一种是直接调用 threading.Thread()方法，另一种是继承 threading.Thread 类并重写 run()方法。

      - multiprocessing 模块：创建进程的方式，创建进程的方式有两种，一种是直接调用 multiprocessing.Process()方法，另一种是继承 multiprocessing.Process 类并重写 run()方法。

      - futures 模块：线程池和进程池，使用线程池和进程池的方式有两种，一种是直接调用 concurrent.futures.ThreadPoolExecutor()方法或 concurrent.futures.ProcessPoolExecutor()方法，另一种是继承 concurrent.futures.ThreadPoolExecutor 类或 concurrent.futures.ProcessPoolExecutor 类并重写 run()方法。

      - asyncio 模块：协程，使用协程的方式有两种，一种是直接调用 asyncio.coroutine()方法，另一种是使用 async 关键字。

2.  常用数据结构

    - 列表：list，有序，可变，可重复，可嵌套，可切片，可迭代，可排序，可比较，可拼接，可删除，可修改，可增加，可查找，可遍历，可推导，可转换，可复制，可清空，可删除，可获取长度，可获取最大值，可获取最小值，可获取索引，可获取元素。本质是可变长度的数组。
    - 元组：tuple，有序，不可变。本质是固定长度、不可变的数组。
    - 字典：dict，无序，可变。本质是伪随机探测的哈希表。
    - 集和：set，无序，可变，不可重复。本质是空值的哈希表。

3.  拷贝

    - 直接赋值：`a = b`，a 和 b 指向同一个对象，修改 a 会影响 b，修改 b 会影响 a。
    - 浅拷贝：`a = b.copy()`，拷贝 b 的父对象，引用子对象，复杂子对象的修改会互相影响。切片，工厂函数，copy.copy()都是浅拷贝。
    - 深拷贝：`a = copy.deepcopy(b)`，a 和 b 指向不同的对象，修改 a 不会影响 b，修改 b 不会影响 a。

4.  装饰器

    - 装饰器的作用：在不修改原函数的情况下，为原函数添加新的功能。
    - 装饰器的实现：使用闭包实现装饰器，使用 functools.wraps()装饰内部函数。使用@符号将装饰器应用到函数上。
    - 装饰器的分类：无参装饰器、有参装饰器、类装饰器、装饰器链。

    - example：

      ```python
      def decorator(func):
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

5.  生成器

    - 定义：生成器是使用 yield 关键字返回一个函数，生成器的本质是一个迭代器。
    - 使用`next()`方法获取生成器的下一个元素，使用`send()`方法向生成器发送数据。
    - 作用：生成器可以节省内存，提高程序的执行效率。
    - example：

      ```python
      def generator():
          for i in range(10):
              yield i

      for i in generator():
          print(i)
      ```

6.  闭包

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

7.  "+"问题及优化

    - "+"问题：字符串是不可变的，使用"+"拼接字符串时，每次都会创建一个新的字符串对象，然后将原字符串对象和新的字符串对象拼接，连续使用"+"拼接字符串时，会产生大量的临时字符串对象，占用大量的内存空间，影响程序的执行效率。
    - 优化：使用列表代替字符串，使用"".join()方法拼接字符串。

8.  "=="和"is"的区别

    - "=="：比较两个对象的值是否相等。
    - "is"：比较两个对象的内存地址是否相等。

9.  垃圾回收机制

    - 当 python 的某个对象引用计数为 0 时，该对象就要成为被回收的对象。Del 对象后，垃圾回收启动，将所占内存清空。垃圾回收时，python 不进行其他任务，频繁回收，会降低工作效率。分配对象和取消分配对象差值高于阈值时，才会启动回收。

10. 内存管理方式：引用计数、标记清除、分代回收（内存池）。

    - 引用计数：当 python 的某个对象引用计数为 0 时，该对象就要成为被回收的对象。Del 对象后，垃圾回收启动，将所占内存清空。垃圾回收时，python 不进行其他任务，频繁回收，会降低工作效率。分配对象和取消分配对象差值高于阈值时，才会启动回收。
    - 标记清除：标记清除是一种垃圾回收算法，它分为两个阶段，第一个阶段是标记阶段，第二个阶段是清除阶段。标记阶段从根对象开始，遍历所有的可达对象，将可达对象进行标记，未被标记的对象就是垃圾对象。清除阶段将垃圾对象进行清除，将垃圾对象所占的内存空间进行回收。
    - 分代回收：分代回收是一种垃圾回收算法，它将对象分为三代，新创建的对象放在第 0 代，第 0 代满了之后，将第 0 代中的存活对象复制到第 1 代，第 1 代满了之后，将第 1 代中的存活对象复制到第 2 代，第 2 代满了之后，将第 2 代中的存活对象复制到第 0 代，依次循环。

11. 循环引用处理：

    - 延迟导入；
    - 将`from module import package`改为`import module.package`；
    - 重新组织代码结构；
    - 使用弱引用。

12. 文件操作注意事项：打开模式、异常处理、文件对象的关闭，接收缓冲区的大小。

    ```python
    with open('test.txt', 'r', encoding='utf-8') as f:
        f.read()
    ```

13. 调试方式：

    - 断点打印
    - 断言
    - 日志
    - IDE 调试
    - pdb 调试

14. 面向对象三大特性：封装、继承、多态。

    - 封装：将数据和方法封装到类中，数据和方法只对类的内部可见，对外部不可见。
    - 继承：子类继承父类的属性和方法。
    - 多态：同一种事物的多种形态。

15. python 的语言特性：面向对象、动态类型、强类型、解释型、可扩展，代码可读性好。

16. 拦截器和修饰器的区别：

    - 拦截器：拦截器是一种机制，允许在视图处理前后执行自定义的逻辑。在请求到达视图函数或类之前，请求可能会经过一个或多个拦截器，这些拦截器可以执行诸如身份验证、日志记录等操作。
    - 修饰器：修饰器是一种语法糖，用于修饰函数或类，修饰器可以在不修改原函数或类的情况下，为原函数或类添加新的功能。

17. Python2 和 Python3 的区别：

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

18. xrange 和 range 的区别：

    - xrange：返回一个生成器，节省内存，适用于循环。
    - range：返回一个列表，占用内存，适用于索引。(python3 已弃用 xrange,range 默认返回一个生成器)

19. enumerate 的作用：

    - enumerate 是一个内置函数，它可以将一个可迭代对象转换为枚举对象，枚举对象包含了索引和值。
    - example：

      ```python
      for index, value in enumerate(['a', 'b', 'c']):
          print(index, value)
      ```

20. zip 的作用：

    - zip 是一个内置函数，它可以将多个可迭代对象打包成一个元组，然后返回一个可迭代对象。
    - example：

      ```python
      for i in zip([1, 2, 3], ['a', 'b', 'c']):
          print(i)
      ```

21. map 的作用：

    - map 是一个内置函数，它可以将一个函数作用于一个可迭代对象的每个元素，然后返回一个可迭代对象。

            ```python
            def func(x):
                return x + 1

            for i in map(func, [1, 2, 3]):
                print(i)
            ```

### Django

1. Django vs Flask

   - Django: 自带 ORM，admin 管理界面, sqlite 数据库和测试组件等内置功能，鼓励快速开发和简洁的设计。但对于性能要求较高的项目，需要对 Django 的一些内置功能进行重构。

   - Flask: 具有高度的灵活性和自由度，核心功能只包含路由分发和模板引擎，可扩展性强，项目组织结构和功能完全由开发者自己决定。

2. Django 的特点

   - Django 是走大而全的方向，它的目标是帮助开发者快速开发和部署项目。
   - Django 的设计哲学是“不重复造轮子”，它鼓励开发者使用现有的组件，而不是重复开发。它提供了一整套解决方案，包括 ORM、模板引擎、路由系统、中间件、表单、认证系统、缓存、国际化、管理后台、测试等，这些功能都是可插拔的，开发者可以根据自己的需求选择使用。
   - 但是性能扩展性不如 Flask，Django 的一些内置功能会影响性能。
   - 适合中小型项目，或者大型项目的快速开发阶段。

3. Django 的访问生命周期：

   url -> wsgi -> middleware -> router -> view -> middleware -> response -> wsgi -> url

   1. url 解析
   2. wsgi 将 Web 服务器收到的 HTTP 请求转发给 Django 应用程序.
   3. 中间件是一种机制，允许在视图处理前后执行自定义的逻辑。在这个步骤中，请求可能会经过一个或多个中间件，这些中间件可以执行诸如身份验证、日志记录等操作。
   4. Django 的路由系统会根据 URL 将请求分发到相应的视图函数或类。
   5. 在视图阶段，请求被传递给匹配的视图函数或类，这里进行具体的请求处理逻辑，比如从数据库中获取数据、进行业务逻辑处理等。
   6. 在视图处理完成后，响应会被传递给中间件，中间件可以执行诸如日志记录、缓存等操作。
   7. 在视图函数或类处理完请求后，生成 HTTP 响应，包括响应的内容和状态码等。
   8. 最后，响应通过 WSGI 接口返回给 Web 服务器，然后由 Web 服务器发送给客户端。

4. 什么是 usgi 和 wsgi

   - WSGI：Web Server Gateway Interface，是一种规范，定义了 Web 服务器如何与 Python 应用程序进行交互，WSGI 规范中定义了两个接口，分别是应用程序接口和服务器网关接口。
   - uWSGI：是一个 Web 服务器，实现了 WSGI 协议，它是一个全功能的 HTTP 服务器，uWSGI 服务器可以独立于 Web 服务器运行，也可以作为 Web 服务器的模块运行。

5. FBV 和 CBV 的区别

   - FBV：函数视图，将请求和处理逻辑封装在一个函数中。
   - CBV：类视图，将请求和处理逻辑封装在一个类中，类视图继承自 View 类，View 类是一个抽象类，它提供了一些常用的方法，比如 as_view()方法，as_view()方法将类视图转换为函数视图。

6. MVC 和 MTV 的区别

   - MVC：Model-View-Controller，模型-视图-控制器，模型用于封装数据，视图用于展示数据，控制器用于处理用户的请求。
   - MTV：Model-Template-View，模型-模板-视图，模型用于封装数据，模板用于展示数据，视图用于处理用户的请求。

7. django 路由中 name 的作用：反向解析路由。

8. Django 的内置组件：

   - ORM：对象关系映射，将数据库中的表映射为类，将数据库中的字段映射为类的属性，将数据库中的记录映射为类的实例。
   - 模板引擎：Django 提供了一套模板语言，用于将数据渲染到模板中。
   - Admin 管理后台：Django 提供了一个管理后台，可以通过管理后台对数据库中的数据进行增删改查。
   - ModelForm：Django 提供了一个 ModelForm 类，它可以根据模型自动生成表单。
   - Form：Django 提供了一个 Form 类，它可以根据开发者自定义的字段生成表单。
   - 路由系统：Django 提供了一个路由系统，用于将请求分发到相应的视图函数或类。
   - Model：Django 提供了一个 Model 类，它是一个抽象类，开发者可以继承 Model 类，然后定义模型类，模型类对应数据库中的表。

9. Django 的中间件:

   中间件是一种机制，允许在视图处理前后执行自定义的逻辑。在请求到达视图函数或类之前，请求可能会经过一个或多个中间件，这些中间件可以执行诸如身份验证、日志记录等操作。

10. Django 的中间件方法：

    - process_request(self, request)：在视图函数或类处理请求前执行。
    - process_view(self, request, view_func, view_args, view_kwargs)：在视图函数或类处理请求前执行，如果 process_request()方法返回 None 或 HttpResponse 对象，则会执行 process_view()方法。
    - process_exception(self, request, exception)：在视图函数或类抛出异常时执行。
    - process_response(self, request, response)：在视图函数或类处理请求后执行。
    - process_template_response(self, request, response)：在视图函数或类处理请求后执行，如果 process_response()方法返回 None 或 HttpResponse 对象，则会执行 process_template_response()方法。

11. django 中 request 对象的创建时机：

    - 在 WSGIHandler 类的**call**()方法中创建 request 对象，然后将 request 对象作为参数传递给视图函数或类。

12. django 的重定向实现

    - 使用 HttpResponseRedirect 类实现重定向，使用 reverse()方法实现反向解析。

13. django 中 csrf 的实现

    - 在请求中添加 csrf_token，然后在视图函数或类中验证 csrf_token。

14. 为什么不使用 runserver 部署项目

    - runserver 是一个单线程的开发和测试服务器，使用 uWSGI 部署项目具有更好的性能。

15. orm 方法

    - `all()`: 查询所有数据
    - `filter()`: 查询满足条件的数据
    - `exclude()`: 查询不满足条件的数据
    - `get()`: 查询单条数据
    - `create()`: 创建数据
    - `update()`: 更新数据
    - `delete()`: 删除数据
    - `order_by()`: 排序
    - `reverse()`: 反转
    - `values()`: 返回字典
    - `values_list()`: 返回元组
    - `count()`: 返回数量
    - `exists()`: 判断是否存在
    - `first()`: 返回第一条数据
    - `last()`: 返回最后一条数据
    - `distinct()`: 去重

16. `select_related()`和`prefetch_related()`的区别

    - `select_related()`：一次性将关联的数据查询出来，减少数据库的查询次数，但是会增加内存的消耗。
    - `prefetch_related()`：分别查询主表和关联表的数据，然后将关联表的数据与主表的数据进行关联，减少内存的消耗，但是会增加数据库的查询次数。

17. django 的缓存机制

    - Django 的缓存机制是一个抽象层，它可以将缓存的实现与缓存的使用分离，开发者可以根据自己的需求选择使用不同的缓存后端，比如 Memcached、Redis 等。
    - Django 的缓存机制提供了一些常用的方法，比如 get()方法、set()方法、delete()方法等。
    - 三种缓存模式：全站缓存、视图缓存、模板缓存。

18. `F()`和`Q()`的作用

    - `F()`：用于对模型的字段进行操作，比如对模型的字段进行加减乘除等操作。
    - `Q()`：用于对查询条件进行操作，比如对查询条件进行与或非等操作。

19. django 的信号机制

    - Django 的信号机制是一种观察者模式，它允许在信号发送者和信号接收者之间进行解耦，当信号发送者发送信号时，信号接收者会接收到信号并执行相应的操作。
    - Django 的信号机制提供了一些常用的信号，比如 pre_save 信号、post_save 信号、pre_delete 信号、post_delete 信号等。

20. django 的 form 和 modelform

    - Form：Django 提供了一个 Form 类，它可以根据开发者自定义的字段生成表单。
    - ModelForm：Django 提供了一个 ModelForm 类，它可以根据模型自动生成表单。

21. django 中执行 sql 语句的方法：`raw()`, `extra()`, `execute()`

22. django 中如何实现读写分离

    - 使用数据库路由系统实现读写分离，数据库路由系统是一个抽象层，它可以将数据库的读写操作分发到不同的数据库上。
    - 在`settings.py`中配置数据库路由系统，然后在路由类中实现`db_for_read()`方法和`db_for_write()`方法，`db_for_read()`方法用于将读操作分发到从数据库上，`db_for_write()`方法用于将写操作分发到主数据库上。

23. 基于已存在的数据库表创建模型类

    - 使用`inspectdb`命令生成模型类。

24. orm 和 sql 的区别

    - ORM：对象关系映射，将数据库中的表映射为类，将数据库中的字段映射为类的属性，将数据库中的记录映射为类的实例。具有开发速度快、可移植性好、可维护性好的优点，但是性能较差。
    - SQL：结构化查询语言，用于操作数据库。执行效率高，性能好。

25. restful api

    - restful api 是一种软件架构风格，它是一种设计风格，不是标准，它是一种约定俗成的规范。
    - restful api 的设计原则：统一接口、无状态、可缓存、分层系统、按需编码。
    - restful api 的设计规范：使用名词而不是动词、使用复数形式、使用 HTTP 动词、使用 HTTP 状态码、使用 JSON 格式, 使用版本控制, 体现是否为 API, 使用 SSL, 携带请求参数, 使用分页, 使用字段过滤, 使用错误信息, 使用 HATEOAS。

26. 接口的幂等性

    - 幂等性是指对同一个接口的多次请求，对资源的影响是一致的。
    - 幂等性的实现：使用 HTTP 动词、使用 HTTP 状态码、使用事务。

27. rpc 和 restful api 的区别

    - rpc：远程过程调用，是一种通信协议，它允许程序调用另一个地址空间的子程序，而不需要程序员显式编码这个远程调用的细节。
    - restful api：restful api 是一种软件架构风格，它是一种设计风格，不是标准，它是一种约定俗成的规范。

28. 为什么要使用 django rest framework

    - Django REST framework 是一个强大灵活的工具包，用于构建 Web API。
    - Django REST framework 提供了一些常用的功能，比如序列化、反序列化、分页、过滤、排序、认证、权限、版本控制等。
    - Django REST framework 提供了一些常用的类，比如 APIView 类、GenericAPIView 类、ViewSet 类、ModelViewSet 类等。

29. django rest framework 的序列化和反序列化

    - 序列化：将模型类的实例转换为字典。
    - 反序列化：将字典转换为模型类的实例。

30. django rest framework 的组件

    - 序列化组件 serializer：用于序列化和反序列化。
    - 路由组件：用于路由。
    - 视图组件：用于视图。
    - 认证组件：用于认证用户。
    - 权限组件：用于权限控制。
    - 频率组件：用于频率控制。
    - 解析器组件：用于解析请求。
    - 渲染器组件：用于渲染响应。
    - 分页组件：用于分页。
    - 版本控制组件：用于版本控制。

31. django rest framework 的认证和权限

    - 认证：认证是指验证用户的身份，Django REST framework 提供了一些常用的认证组件，比如 SessionAuthentication 组件、BasicAuthentication 组件、TokenAuthentication 组件、JSONWebTokenAuthentication 组件等。
    - 权限：权限是指控制用户对资源的访问权限，Django REST framework 提供了一些常用的权限组件，比如 AllowAny 组件、IsAuthenticated 组件、IsAdminUser 组件、IsAuthenticatedOrReadOnly 组件等。
    - 认证流程：用户发送请求时，通过 APIView 类的 initial()方法获取认证组件，然后调用认证组件的 authenticate()方法进行认证，如果认证成功，则将认证后的用户赋值给 request.user 属性，如果认证失败，则抛出异常。

32. django rest framework 的频率控制

    - 频率控制是指控制用户对资源的访问频率，Django REST framework 提供了一些常用的频率控制组件，比如 AnonRateThrottle 组件、UserRateThrottle 组件、ScopedRateThrottle 组件等。

33. 什么是跨域，如何解决跨域问题

    - 跨域是指浏览器不能执行其他网站的脚本，跨域是由浏览器的同源策略造成的，同源策略是浏览器的一种安全策略，它用于限制一个 origin 的文档或者它加载的脚本如何能与另一个源的资源进行交互，跨域是指协议、域名、端口号有一个不同就会产生跨域。
    - 解决跨域问题的方式有两种，一种是使用 JSONP，另一种是使用 CORS。
    - Django 解决跨域问题的方式有两种，一种是使用 django-cors-headers 第三方库，另一种是使用中间件。

34. 将 dict 转化为 url 参数

    - 使用`urllib.parse.urlencode()`方法将字典转换为 url 参数。
