---
layout: post
title: "Java-01: Object-Oriented"
description: "Java-01: 面向对象"
categories: [technology]
tags: [java, programming language, technology]
date: 2025/05/30
---

# 面向对象

## 封装

```java
public class Person {
    private String name;
    private int age;

    public String getName() {
        return name;
    }

    public void work() {
        System.out.println("working...");
    }
}
```

## 继承

```java
Animal {
    public void eat() {
        System.out.println("eating...");
    }
}

Cat extends Animal {
    public void meow() {
        System.out.println("meowing...");
    }
}

Animal a = new Cat();
a.eat();
```

- 里氏替换原则：子类可以替换父类，并且不影响程序的正确性

## 多态

### 多态分类

- 编译时多态：方法重载

- 运行时多态：方法重写

### 多态的实现条件

- 继承关系
- 覆盖（重写）
- 向上转型：父类引用指向子类对象

  ```java

  public class Animal {
      public void call() {
          System.out.println("animal calling...");
      }
  }

  public class Cat extends Animal {
      public void call() {
          System.out.println("meow meow...");
      }
  }

  public class Dog extends Animal {
      public void call() {
          System.out.println("wang wang...");
      }
  }

  public class Test {
      public static void main(String[] args) {
          List<Animal> animals = new ArrayList<>();
          animals.add(new Cat());
          animals.add(new Dog());
          for (Animal animal : animals) {
              animal.call();
          }
      }
  }
  ```

## 类图

- 泛化关系: 使用 extends 关键字

  ```mermaid
  classDiagram
      direction LR

      class Shape {
          +String color
          +void calculateArea()
      }

      class Circle {
          +double radius
          +void getCircumference()
      }
      Shape <|-- Circle
  ```

- 实现关系: 使用 implements 关键字

  ```mermaid
  classDiagram
      direction LR

      class MoveBehavior

      class Fly
      class Run

      MoveBehavior <|.. Fly
      MoveBehavior <|.. Run
  ```

- 聚合关系：整体与部分的关系，一个整体可以包含多个部分，但是部分可以独立存在

  ```mermaid
  classDiagram
      direction LR

  class Computer

  class CPU

  class GPU

  class RAM

  Computer o-- CPU

  Computer o-- GPU

  Computer o-- RAM
  ```

- 组合关系：整体和部分强依赖，整体不存在，部分也不存在

  ```mermaid
  classDiagram
      direction LR

  class Company

  class Employee

  Company *-- Employee
  ```

- 关联关系：不同类对象之间关联，静态关系，与运行时状态无关，一个类可以有多个关联对象

  ```mermaid
  classDiagram
      direction LR

  class School

  class Student

  School "1"--"n" Student
  ```

- 依赖关系：依赖关系在运行时起作用，有三种形式：1.A 类是 B 类的局部变量；2.A 类是 B 类方法的参数；3.A 类给 B 类发消息，影响 B 类

  ```plantuml
  @startuml
  ' You can specify direction if needed, but PlantUML often lays out well automatically
  ' left to right direction
  ' top to bottom direction

  class Vehicle {
      +move(MoveBehavior)
  }

  interface MoveBehavior {
      +move()
  }

  note "MoveBehavior.move()" as N

  Vehicle ..> MoveBehavior
  Vehicle .. N
  @enduml
  ```
