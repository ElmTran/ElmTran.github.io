---
layout: post
title: "Encapsulate gin return"
description: "Encapsulate gin return"
categories: [technology]
tags: [Golang, gin, technology]
redirect_from:
  - /2023/10/25/
---

## define response interface

```go
package response

type Responses struct {
    SetCode(int32)
    SetMsg(string)
    SetData(interface{})
    SetInfo(string)
    SetStatus(bool)
    SetTraceId(string)
    Clone() *Responses
}
```

## define response model

```go
type Response struct {
    RequestId string `json:"request_idm,omitempty"`
    Code      int32  `json:"code,omitempty"`
    Msg       string `json:"msg,omitempty"`
    Info      string `json:"info,omitempty"`
    Status    string  `json:"status,omitempty"`
}

type response struct {
    Response
    Data any `json:"data"`
}

func (e *response) SetCode(code int32) {
    e.Code = code
}

func (e *response) SetMsg(msg string) {
    e.Msg = msg
}

func (e *response) SetData(data any) {
    e.Data = data
}

func (e *response) SetInfo(info string) {
    e.Info = info
}

func (e *response) SetStatus(status bool) {
    if status {
        e.Status = "success"
    } else {
        e.Status = "fail"
    }
}

func (e *response) SetTraceId(traceId string) {
    e.RequestId = traceId
}

func (e *response) Clone() *Responses {
    return &e
}
```

## define response middleware

```go
package response

import (
    "github.com/gin-gonic/gin"
    "net/http"
    ...
)

var Default = &response{}

func Error (c *gin.Context, code int, err error, msg string) {
    resp := Default.Clone()
    resp.SetCode(code)
    resp.SetMsg(msg)
    resp.SetInfo(err.Error())
    resp.SetStatus(false)
    resp.SetTraceId(c.GetString("trace_id"))
    // logging
    // update context
    c.AbortWithStatusJSON(http.StatusOK, resp)
}

func OK (c *gin.Context, data any, msg string) {
    resp := Default.Clone()
    resp.SetCode(0)
    resp.SetMsg(msg)
    resp.SetData(data)
    resp.SetStatus(true)
    resp.SetTraceId(c.GetString("trace_id"))
    // logging
    // update context
    c.AbortWithStatusJSON(http.StatusOK, resp)
}

func Paging (c *gin.Context, result any, count int, pageIdx int, pageSize int, msg string) {
    var res page
    res.List = result
    res.Count = count
    res.PageIdx = pageIdx
    res.PageSize = pageSize
    OK(c, res, msg)
```

## Reference

- [「容器管理系统」开发篇：2. 封装gin统一返回JSON](https://mp.weixin.qq.com/s/XNRn1MXvztQtOqn29TK4RA)
