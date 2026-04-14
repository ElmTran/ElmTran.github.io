---
layout: post
title: "R Language"
description: "R Language"
categories: [technology]
tags: [learning, technology, R, programming, data science]
date: 2022/09/21
---

# shortscut

- `Ctrl + Shift + N` : new script
- `Tab` : auto indent and auto complete
- `Ctrl + Shift + C` : comment and uncomment
- `Ctrl + Enter` : run current line
- `Ctrl + Shift + Enter` : run all lines
- `Ctrl + A`: select all
- `Shift + arrow` : select text
- `Ctrl + D` : delete line
- `Ctrl + Z` : undo
- `Ctrl + Shift + Z` : redo
- `Alt + -` : assign to
- `Ctrl + I`: auto indent
- `Ctrl + Shift + A` : auto format
- `Ctrl + F` : select and replace
- `Ctrl + Alt + X`: extract function

# foundation of syntax

## data types

- `integer double complex character logical`

## Identifier Rules

- `a-z A-Z 0-9 _ .`
- `case sensitive`
- `cannot start with number or _`
- `cannot be reserved words`

## operators

- `+ - * / ^ %% %/%`

- `== != > < >= <=`

- `& | ! && ||`

- `= -> <-`

- `( ) [ ] { }`

- `:`：create a sequence

- `;`：separate multiple statements

- `@`：access localtion

- `::`：access variable

- `$`: extract element

- `~`：formula

- `?`：help

- `%`：custom operator

## conditional statements

```r
if (condition) {
    # do something
} else if (condition) {
    # do something
} else {
    # do something
}
```

```r
ifelse(condition, true, false)
```

```R
switch(expression, case1, case2, case3, ...)

switch(1, "a", "b", "c")

switch("a", a = "a", b = "b", c = "c")
```

## loop statements

```r
for (var in seq) {
    # do something
}
```

```r

while (condition) {
    # do something
}
```

## function

```r
function_name <- function(arg1, arg2, ...) {
    # do something
    return (value)
}
```

```r
# anonymous function
lapply(seq, function_name(x) {
    # do something
    return (value)
})

```

## package

- `install.packages("package_name")`: install package

- `library(package_name)`: load package

- `detach("package_name")`: unload package

- `remove.packages("package_name")`: remove package

## awesome functions

- `abs(x)`: absolute value

- `sqrt(x)`: square root

- `ceiling(x)`: ceiling

- `floor(x)`: floor

- `trunc(x)`: truncate to integer

- `round(x, digits)`: round to digits

- `signif(x, digits)`: significant digits

- `cos(x) sin(x) tan(x)`: trigonometric functions

- `acos(x) asin(x) atan(x)`: inverse trigonometric functions

- `cosh(x) sinh(x) tanh(x)`: hyperbolic trigonometric functions

- `acosh(x) asinh(x) atanh(x)`: inverse hyperbolic trigonometric functions

- `log(x, base)`: log

- `log(x)`: natural log

- `log10(x)`: log10

- `exp(x)`: exponential

- `mean(x)`: mean

- `median(x)`: median

- `var(x)`: variance

- `sd(x)`: standard deviation

- `mad(x)`: median absolute deviation

- `range(x)`: range

- `min(x)`: minimum

- `max(x)`: maximum

- `sum(x)`: sum

- `diff(x, lag)`: difference between consecutive elements

- `quantile(x, probs)`: quantile of x

- `scale(x, center, scale)`: scale x
