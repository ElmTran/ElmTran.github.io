---
layout: post
title: "AC Automaton(python)"
description: "Implement AC Automaton in python"
categories: [technology]
tags: [Aho–Corasick algorithm, python, string-searching]
redirect_from:
  - /2022/04/19/
---


```python
class Node:

    def __init__(self):
        self.fail = None    # fail pointer: point to the longest suffix of the current node
        self.next = {}
        self.end = False
        self.word = None


class AcAutomaton:
    def __init__(self):
        self.root = Node()
        self.queue = []

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.next:
                node.next[char] = Node()
            node = node.next[char]
        node.end = True
        node.word = word

    def build(self):
        self.queue.append(self.root)
        while self.queue:
            p = self.queue.pop(0)
            for char, child in p.next.items():
                if child is None:
                    continue
                if p == self.root:
                    child.fail = self.root
                else:
                    q = p.fail
                    while q:
                        if char in q.next:
                            child.fail = q.next[char]
                            break
                        q = q.fail
                    if not q:
                        child.fail = self.root
                self.queue.append(child)

    def match(self, text):
        res = []
        p = self.root
        for char in text:
            while char not in p.next and p != self.root:
                p = p.fail
            p = p.next.get(char, self.root)
            tmp = p
            while tmp != self.root:
                if tmp.end:
                    res.append(tmp.word)
                tmp = tmp.fail
        return res


if __name__ == '__main__':
    ac = AcAutomaton()
    for word in ['he', 'she', 'hers', 'his']:
        ac.insert(word)
    ac.build()
    print(ac.match('ahishers'))

```