---
title: 1.1 C 的编译模型
description: 从源代码到 ELF，理解预处理、编译、汇编和链接
---

# 1.1 C 的编译模型

> 本节目标：理解 C 不是“直接运行”的语言，而是经过预处理、编译、汇编、链接生成机器码；这决定了头文件、符号、库和链接错误的行为。

## 四个阶段

```mermaid
flowchart LR
  A[.c / .h] --> B[预处理 .i]
  B --> C[编译 .s]
  C --> D[汇编 .o]
  D --> E[链接 ELF]
  E --> F[HEX / BIN]
```

| 阶段 | 工具 | 主要工作 |
| --- | --- | --- |
| 预处理 | `gcc -E` | 展开宏、包含头文件、条件编译 |
| 编译 | `gcc -S` | 语法分析、优化、生成汇编 |
| 汇编 | `gcc -c` | 把汇编转成目标文件 |
| 链接 | `ld` / `gcc` | 合并段、解析符号、生成 ELF |

## 一个最小的多文件工程

```c
/* math_utils.h */
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int clamp_int(int value, int min, int max);

#endif
```

```c
/* math_utils.c */
#include "math_utils.h"

int clamp_int(int value, int min, int max)
{
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
```

```c
/* main.c */
#include <stdio.h>
#include "math_utils.h"

int main(void)
{
    printf("%d\n", clamp_int(120, 0, 100));
    return 0;
}
```

编译：

```bash
gcc -Wall -Wextra -Werror -std=c11 -c math_utils.c -o math_utils.o
gcc -Wall -Wextra -Werror -std=c11 -c main.c -o main.o
gcc main.o math_utils.o -o demo
./demo
```

如果只编译 `main.c` 而不链接 `math_utils.o`，会看到：

```text
undefined reference to `clamp_int'
```

这不是“函数写错了”，而是链接器找不到符号定义。

## 头文件与符号

- 头文件主要放声明、宏、类型和 `extern`，不要放函数定义，除非明确使用 `static inline`。
- 每个 `.c` 编译成独立目标文件，未解析的符号留到链接阶段处理。
- `static` 函数只在本编译单元可见，可以用来隐藏实现。
- 同名全局符号可能造成重复定义或意外覆盖。

## 查看构建产物

```bash
nm -C main.o              # 查看符号
objdump -d main.o         # 查看反汇编
readelf -S demo           # 查看段表
size demo                 # 查看 text/data/bss
```

在嵌入式里，`size` 特别重要：Flash 主要放代码和只读数据，SRAM 放已初始化数据、BSS、栈和堆。每次版本发布都应该记录体积变化。

## 编译选项

```bash
-Wall -Wextra -Werror       # 打开警告并把警告当错误
-std=c11                    # 固定语言标准
-O0 / -O2 / -Os             # 调试、性能、体积优化
-g3                         # 生成调试信息
-ffunction-sections         # 每个函数独立段，便于裁剪
-fdata-sections
-Wl,--gc-sections           # 链接时删除未使用段
```

调试版本用 `-O0 -g3`，发布版本再逐步测试 `-O2` 或 `-Os`。优化等级变化可能暴露未定义行为，不能只在 `-O0` 下验证。

## 前端类比与差异

前端构建也会做“解析、打包、压缩”，但 C 的链接阶段更接近“把多个模块和一个运行时拼成完整地址空间”。在 MCU 上，链接脚本会决定代码放在 Flash 的哪个地址、变量放在 SRAM 的哪个区域，这是 Web 构建中没有的约束。

## 常见坑

- 头文件没有 include guard，重复包含导致类型重定义。
- 在头文件定义全局变量，多个 `.c` 包含后产生重复符号。
- 只声明不定义，链接时才报错。
- 修改了头文件但没有重新编译依赖它的 `.c`。
- 用 `-O2` 后程序行为改变，说明代码存在未定义行为或缺少 `volatile`。

## 动手实验

1. 把 `clamp_int` 改成 `static`，观察链接错误。
2. 删除 `math_utils.o`，观察链接错误。
3. 用 `nm` 查看符号，区分 `T`、`t`、`U`、`B`。
4. 用 `size` 比较 `-O0` 和 `-Os` 的产物大小。
5. 故意在头文件定义变量，复现重复定义错误并修复。

## 检查清单

- [ ] 能解释预处理、编译、汇编、链接各做什么。
- [ ] 能理解 `undefined reference` 和 `multiple definition`。
- [ ] 会用 `nm`、`objdump`、`size` 查看产物。
- [ ] 知道头文件应该放什么、不应该放什么。
- [ ] 已完成一次优化等级对比。

