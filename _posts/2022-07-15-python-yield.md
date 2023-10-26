---
layout: post
title: "Generator and Yield in Python"
description: "python中生成器和yield及相关应用"
categories: [technology]
tags: [python, programming language, 生成器, yield]
redirect_from:
  - /2022/07/15/
---

## 生成器
- 定义：使用了yield的函数

- 作用：
  - 先谈一谈python2中的range和xrange  
    range会生成一个list，当list较大时，会消耗较多的资源。  
    xrange后者会生成一个可迭代对象，占用内存小。

    这个可迭代对象就是生成器，主要作用是节约资源。

## yield和return的区别

```python
def simpleGenerator():
    for i in range(3):
        yield i
        i += 1
    return i

for i in simpleGenerator():
    print(i)

# 0, 1, 2
```

```python
def simpleGenerator():
    for i in range(3):
        yield i
        i += 1
        return i

for i in simpleGenerator():
    print(i)

# 0
```

yield返回后会继续执行后面的逻辑，而return会终止函数的运行。

## 实际应用

### Fibonacci number

- 递归实现

    ```python
        def fib(n):
            if n == 0:
                return [0]
            elif n == 1:
                return [0, 1]
            else:
                fibs = fib(n - 1)
                fibs.append(fibs[-1] + fibs[-2])
                return fibs
    ```

- 性能优化
    ```python
    def fib(n):
        if n == 0:
            return [0]
        fibs = [0, 1]
        for _ in range(2, n + 1):
            fibs.append(fibs[-1] + fibs[-2])
        return fibs
    ```

- 空间优化

    ```python
    def fib3(n):
        idx, a, b = 0, 0, 1
        while idx < n + 1:
            yield a
            a, b = b, a + b
            idx += 1
    ```

### 协程实现

- 通过生成器阻塞的特性，我们可以利用yield和send可以实现协程

    ```python
    def consumer():
        ret = ""
        while True:
            n = yield ret
            if not n:
                return
            print(f"[CONSUMER] Consuming {n}...")
            time.sleep(1)
            ret = f"200 OK: {n}"


    def producer(c):
        c.send(None)
        n = 0
        while n < 5:
            n += 1
            print(f"[PRODUCER] Producing {n}...")
            r = c.send(n)
            print(f"[PRODUCER] Consumer return: {r}")
        c.close()


    if __name__ == "__main__":
        c = consumer()
        producer(c)
        print("Done.")
    
    # consumer返回一个生成器，producer使用send(None)调用这个生成器  
    # n+1后, 切换到consumer，赋值给n，继续执行yield之后的数据  
    # yield把数据返回后，producer调用send获取，进入下一个循环  
    # producer和consumer在同一个线程下执行，且无锁，通过yield和send自由切换实现了“协程”的概念，但是协程本身是需要操作系统参与的。
    ```

### python爬虫

- 在讲述生成器在爬虫的中的作用之前，我们大致看一下scrapy爬虫过程：

    从cmdline的`excute`方法为入口，初始化了一个`CrawlerProcess`实例`crawl`方法和`start`方法

    ```python
    def execute(argv=None, settings=None):
        ...
        cmd.crawler_process = CrawlerProcess(settings)
    ```

    然后调用了`cmd.run`方法，分别调用了crawler实例的

    ```python
    def run(self, args, opts):
        ...
        crawl_defer = self.crawler_process.crawl(spname, **opts.spargs)
        if ...
        else:
            self.crawler_process.start()
            ...
    ```

    `start`方法的主要作用是注册协程池，`crawl`方法最终调用的是`Crawler`类的`crawl`方法，主要功能是实例化spider和engine，并把控制权交给engine

    ```python
    def crawl(self, *args, **kwargs):
        ...
        try:
            self.spider = self._create_spider(*args, **kwargs)
            self.engine = self._create_engine()
            start_requests = iter(self.spider.start_requests())
            yield self.engine.open_spider(self.spider, start_requests)
            yield defer.maybeDeferred(self.engine.start)
        except Exception:
            self.crawling = False
            if self.engine is not None:
                yield self.engine.close()
            raise
    ```

    然后crawler调用了`start_requests`, 这个方法想必写过爬虫的都比较熟悉吧，在这里我们就开始构造我们的请求了。

    ```python
    def start_requests(self):
        if not self.start_urls and hasattr(self, 'start_url'):
            raise AttributeError(
                "Crawling could not start: 'start_urls' not found "
                "or empty (but found 'start_url' attribute instead, "
                "did you miss an 's'?)")
        for url in self.start_urls:
            yield Request(url, dont_filter=True)
    ```

    Request对象封装了请求相关的参数、方法、回调和其他附加信息。然后回到上层crawler构造好了请求对象后调用了open_spider方法。

    ```python
    def open_spider(self, spider:Spider, start_requests: Iterable = (), close_if_idle: bool = True):
        ...
        nextcall = CallLaterOnce(self._next_request)
        scheduler = create_instance(self.scheduler_cls, settings=None, crawler=self.crawler)
        start_requests = yield self.scraper.spidermw.process_start_requests(start_requests, spider)
        self.slot = Slot(start_requests, close_if_idle, nextcall, scheduler)
        self.spider = spider
        if hasattr(scheduler, "open"):
            yield scheduler.open(spider)
        yield self.scraper.open_spider(spider)
        self.crawler.stats.open_spider(spider)
        yield self.signals.send_catch_log_deferred(signals.spider_opened, spider=spider)
        self.slot.nextcall.schedule()
        self.slot.heartbeat.start(5)
    ```

    open_spider先实例化了一个CallLaterOnce，这是封装的循环执行的方法类，用于循环调度`_next_request`. 然后调用了process_start_requests方法，用来调用我们的爬虫中间件，进行过滤等操作。  
    然后调用scheduler的`open`方法实例化优先级队列。再调用scraper的`open_spider`方法

    ```python
    def open_spider(self, spider: Spider):
        """Open the given spider for scraping and allocate resources for it"""
        self.slot = Slot(self.crawler.settings.getint('SCRAPER_SLOT_MAX_ACTIVE_SIZE'))
        yield self.itemproc.open_spider(spider)
    ```

    主要作用是开启spider并分配资源给它。  
    然后`nextcall.schedule()`就是在做循环调度，调度是我们注册的`_next_request`方法，该方法会调用`_needs_backout`检查是否需要等待

    ```python
    def _needs_backout(self) -> bool:
        return (
            not self.running
            or self.slot.closing  # type: ignore[union-attr]
            or self.downloader.needs_backout()
            or self.scraper.slot.needs_backout()  # type: ignore[union-attr]
        )
    ```

    等待条件是engine是否停止、slot是否关闭、download数量超过预设、返回请求超过预设。如果无须等待，就会调用_next_request_from_scheduler从调度器里面取出请求进行处理。
    爬虫调度器进行网络下载的时候调用了`_download`方法,实现如下

    ```python
    def _download(self, request: Request, spider: Spider) -> Deferred:
        def _on_success(result: Union(Response, Request)) -> Union[Response, Request]:
            ...
        def _on_complete(_):
            self.slot.nextcall.schedule()
            return _

        dwld = self.downloader.fetch(request, spider)
        dwld.addCallbacks(_on_success)
        dwld.addBoth(_on_complete)
        return dwld
    ```

    调用了一个`downloader.fetch`,实现方法如下

    ```python
    def fetch(self, request, spider):
        def _deactivate(response):
            self.active.remove(request)
            return response

        self.active.add(request)
        dfd = self.middleware.download(self._engine_request, request, spider)
        return dfd.addBoth(_deactivate)
    ```

    这里调用了中间件的download方法，调用了Downloader`_enqueue_request`，

    ```python
    def _enqueue_request(self, request, spider):
        ...
        slot.queue.append((request, deferred))
        self._process_queue(spider, slot)
        return deferred
    ```

    这里给了另一个队列用于延迟下载的作用，最后定位到真正的请求是`handlers.download_request`，其实就是根据不同的请求类型使用不同的下载处理器（就是封装的多类型下载包）。  
    拿到下载结果后回到`_next_request_from_scheduler`中的`handle_downloader_output`方法

    ```python
    def handle_downloader_output(self, result: Union[Request, Response, Failure], request: Request
    ) -> Optional[Deferred]:
        assert self.spider is not None  # typing

        if not isinstance(result, (Request, Response, Failure)):
            raise TypeError(f"Incorrect type: expected Request, Response or Failure, got {type(result)}: {result!r}")

        # downloader middleware can return requests (for example, redirects)
        if isinstance(result, Request):
            self.crawl(result)
            return None
        d = self.scraper.enqueue_scrape(result, request, self.spider):
        ...
    ```

    如果返回结果是Request实例则放入队列，如果是Response则调用scraper的`enqueue_scrape`方法，该方法后面会通过`handle_spider_output`对结果进行解析，最终调用Pipeline的`process_item`对数据进行存储。新的Request会进入队列等待下一次调度。直到队列中没有等待的任务，程序正常退出。  


- 从整体上来讲，我们都是在通过队列来处理请求。所以，scrapy框架本身使用了大量的生成器来保证我们的处理逻辑不会阻塞在某个环节。同时对于这种需要处理大量数据的程序，生成器也能够节约非常多的内存资源。所以我们在返回爬虫数据的时候建议使用yield，而不是return。