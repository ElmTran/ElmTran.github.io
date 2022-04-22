---
layout: post
title: "AC Automaton(python)"
description: "python实现AC自动机"
categories: [technology]
tags: [Aho–Corasick algorithm, python, string-searching]
redirect_from:
  - /2022/04/19/
---


```
class Node():
    static = 0

    def __init__(self):
        self.fail = None
        self.next = {}
        self.end = False
        self.word = None
        Node.static += 1


class AcAutomaton():
    def __init__(self):
        self.root = Node()
        self.queue = []

    def insert(self, word):
        """
        @attention: 插入词
        @param words:
        @return:
        """
        p = self.root
        for char in word:
            if char not in p.next:
                p.next[char] = Node()
            p = p.next[char]
        p.end = True
        p.word = word

    def build(self):
        """
        @attention: 构建自动机
        @return:
        """
        self.root.fail = None
        self.queue.append(self.root)
        while len(self.queue) != 0:
            parent = self.queue.pop(0)
            for char, child in parent.next.items():
                if child is None:
                    continue
                if parent == self.root:
                    child.fail = self.root
                else:
                    p = parent.fail
                    while p is not None:
                        if char in p.next:
                            child.fail = p.next[char]
                            break
                        p = p.fail
                    if p is None:
                        child.fail = self.root
                self.queue.append(child)

    def match(self, content):
        """
        @attention: 是否存在匹配的词
        @param content:
        @return:
        """
        p = self.root
        for char in content:
            while char not in p.next and p != self.root:
                p = p.fail
            if char in p.next:
                p = p.next[char]
            else:
                p = self.root
            if p.end:
                return True
        return False


if __name__ == "__main__":
    ac = AcAutomaton()
    words = ["金缕衣", "少年", "少年时"]
    content = "劝君莫惜金缕衣，劝君惜取少年时。"
    for word in words:
        ac.insert(word)
    ac.build()
    print(ac.match(content))

```