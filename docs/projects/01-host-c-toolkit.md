---
title: P1 主机端 C 工具库
description: 不接开发板，先把 C、测试和构建练扎实
---

# P1 主机端 C 工具库

## 目标

在 macOS/Linux 上实现一个可测试的 C 工具库，包含：

- 环形缓冲区。
- 命令解析器。
- 表驱动状态机。
- CRC8/CRC16。
- 错误码和日志接口。

## 技术要求

- C11，`-Wall -Wextra -Werror`。
- CMake + Ninja。
- 主机端单元测试。
- ASan/UBSan。
- GitHub Actions 或本地脚本自动构建。

## 目录

```text
p1-host-toolkit/
├── include/
│   ├── ring_buffer.h
│   ├── frame_parser.h
│   └── state_machine.h
├── src/
├── tests/
├── CMakeLists.txt
└── README.md
```

## 验收用例

### 环形缓冲区

- 空读返回失败。
- 满写返回失败。
- 回绕后数据顺序正确。
- 容量为 0/空指针返回明确错误。

### 命令解析器

- 分片输入能拼出完整命令。
- 超长帧被拒绝。
- 错误 CRC 后能重新同步。
- 随机字节流不崩溃。

### 状态机

- 正常状态转换。
- 非法事件保持/进入错误态。
- 超时事件触发重试。

## 交付物

- 可运行测试：`ctest --output-on-failure`。
- 覆盖率或测试清单。
- README 说明 API 和错误码。
- 一次 ASan 发现的问题及修复记录。

## 加分项

- 模糊测试（libFuzzer/AFL）。
- 静态分析（clang-tidy）。
- 性能基准。
- 把同一个库编译到 ARM 目标。

## 面试表达

> 我先在主机上实现纯逻辑模块，用 ASan/UBSan 和边界测试保证正确，再接入硬件。这样调试硬件时，能排除大部分 C 逻辑问题。

