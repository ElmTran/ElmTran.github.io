---
layout: post
title: "LLM RoadMap"
description: "From AI Application Engineer to LLM Systems Engineer"
categories: [technology]
tags: [llm, transformer, cuda, inference]
date: 2026/06/08
---

# LLM RoadMap

## Current Position

- [ ] Stage 1 - Transformer Fundamentals
- [ ] Stage 2 - Build MiniGPT
- [ ] Stage 3 - PyTorch Internals
- [ ] Stage 4 - Modern LLM Architecture
- [ ] Stage 5 - Inference Systems
- [ ] Stage 6 - Modern C++
- [ ] Stage 7 - CUDA Programming
- [ ] Stage 8 - GPU Architecture
- [ ] Stage 9 - FlashAttention
- [ ] Stage 10 - Production LLM Systems

---

# Stage 1 - Transformer Fundamentals

目标：彻底理解 Transformer 工作原理

推荐资料：

- Build a Large Language Model From Scratch
- The Illustrated Transformer
- Attention Is All You Need

## 学习内容

### Tokenization

术语：

- Token
- Vocabulary
- BPE
- SentencePiece

### Embedding

术语：

- Token Embedding
- Position Embedding

### Self-Attention

术语：

- Query
- Key
- Value
- Attention Score
- Softmax

核心公式：

```python
attention = softmax(Q @ K.T)
output = attention @ V
```

### Multi-Head Attention

术语：

- Head
- Projection Matrix

### Feed Forward Network

术语：

- MLP
- Hidden Dimension

### LayerNorm

术语：

- Mean
- Variance
- Normalization

### Positional Encoding

术语：

- Positional Encoding
- RoPE

---

## Checkpoint

- [ ] 能向非 AI 从业者解释 Transformer
- [ ] 能画出 Transformer Block
- [ ] 能解释 Query / Key / Value
- [ ] 能解释 Attention 的工作流程
- [ ] 能解释为什么 Transformer 取代 RNN
- [ ] 能看懂 Transformer 论文结构图

---

# Stage 2 - Build MiniGPT

目标：从零实现最小可运行 GPT

## 学习内容

- [ ] 实现 Tokenizer
- [ ] 实现 Dataset
- [ ] 实现 Self-Attention
- [ ] 实现 Transformer Block
- [ ] 实现 GPT Model
- [ ] 实现 Training Loop

术语：

- Context Window
- Sequence Length
- Forward
- Backward
- Loss
- Optimizer

---

## Checkpoint

- [ ] 独立实现 Tokenizer
- [ ] 独立实现 Self-Attention
- [ ] 独立实现 Transformer Block
- [ ] 独立实现 MiniGPT
- [ ] 完成一次训练
- [ ] 模型能够生成可读文本

---

# Stage 3 - PyTorch Internals

目标：理解框架内部机制

## 学习内容

### Autograd

术语：

- Computational Graph
- Forward Pass
- Backward Pass

### nn.Module

术语：

- Parameter
- Buffer

### Tensor

术语：

- Tensor
- Storage
- Device

---

## Checkpoint

- [ ] 能解释 loss.backward()
- [ ] 能解释 Autograd 工作流程
- [ ] 能看懂 nn.Linear 源码
- [ ] 能看懂 nn.MultiHeadAttention 源码
- [ ] 能追踪 Tensor 的生命周期

---

# Stage 4 - Modern LLM Architecture

目标：理解 GPT 之后的重要演进

## 学习内容

### RoPE

- Rotary Position Embedding

### KV Cache

- Key Cache
- Value Cache

### GQA

- Multi Query Attention
- Grouped Query Attention

### MoE

- Expert
- Router

### Speculative Decoding

- Draft Model
- Verify Model

---

## Checkpoint

- [ ] 能解释 RoPE
- [ ] 能解释 KV Cache
- [ ] 能解释 GQA
- [ ] 能解释 MoE
- [ ] 能解释 Speculative Decoding

---

# Stage 5 - Inference Systems

目标：读懂 vLLM 核心设计

## 学习内容

### Continuous Batching

- Dynamic Batching
- Scheduling

### PagedAttention

- KV Cache
- Memory Fragmentation

### Prefix Cache

- Prompt Cache

### Parallelism

- Tensor Parallel
- Pipeline Parallel
- Expert Parallel

---

## Checkpoint

- [ ] 看懂 vLLM 整体架构
- [ ] 理解 Continuous Batching
- [ ] 理解 PagedAttention
- [ ] 理解 Prefix Cache
- [ ] 能分析 TPS 下降原因
- [ ] 能分析 TTFT 过高原因

---

# Stage 6 - Modern C++

目标：获得阅读推理框架源码的能力

## 学习内容

- RAII
- Smart Pointer
- Move Semantics
- Template
- STL

---

## Checkpoint

- [ ] 能阅读现代 C++ 项目
- [ ] 能阅读 vLLM C++ 扩展代码
- [ ] 能阅读 TensorRT-LLM 部分源码

---

# Stage 7 - CUDA Programming

目标：进入 GPU 编程领域

## 学习内容

- Thread
- Warp
- Block
- Grid

- Global Memory
- Shared Memory
- Register

---

## Checkpoint

- [ ] 理解 CUDA 编程模型
- [ ] 实现 Vector Add
- [ ] 实现 Matrix Multiply
- [ ] 能编写简单 CUDA Kernel

---

# Stage 8 - GPU Architecture

目标：理解 GPU 为什么快

## 学习内容

- SIMD
- SIMT
- Occupancy
- Warp Scheduler
- Memory Coalescing

---

## Checkpoint

- [ ] 能解释 Warp
- [ ] 能解释 Occupancy
- [ ] 能解释 Shared Memory
- [ ] 能分析 Kernel 性能瓶颈

---

# Stage 9 - FlashAttention

目标：理解现代 Attention 优化技术

## 学习内容

- HBM
- SRAM
- IO Awareness

---

## Checkpoint

- [ ] 能解释 FlashAttention 核心思想
- [ ] 能解释 IO Bottleneck
- [ ] 能读懂 FlashAttention 论文

---

# Stage 10 - Production LLM Systems

目标：成为 AI Infra / LLM Systems Engineer

## 学习内容

组件：

- vLLM
- SGLang
- TensorRT-LLM
- Ray
- KServe
- NCCL

指标：

- TTFT
- TPS
- Throughput
- Latency

---

## Checkpoint

- [ ] 能设计推理服务架构
- [ ] 能分析线上性能问题
- [ ] 能设计多 GPU 推理方案
- [ ] 能设计生产级 LLM 平台

---

# Milestones

## Milestone 1

完成 Stage 1 ~ Stage 3

能力：

- 理解 Transformer
- 实现 MiniGPT
- 阅读 PyTorch

---

## Milestone 2

完成 Stage 4 ~ Stage 5

能力：

- 理解现代 LLM 架构
- 理解推理系统
- 阅读 vLLM 源码

这是 AI Infra 岗位的重要分水岭。

---

## Milestone 3

完成 Stage 6 ~ Stage 9

能力：

- 理解 CUDA
- 理解 GPU 架构
- 理解 FlashAttention

进入高性能 AI 系统领域。

---

## Final Goal

成为能够同时理解：

- Model
- Framework
- Inference Engine
- GPU
- Distributed System

的 LLM Systems Engineer。
