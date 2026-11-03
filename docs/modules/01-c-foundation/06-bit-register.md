---
title: 1.6 位运算、寄存器与 volatile
description: 读懂寄存器定义，安全地置位、清位和等待状态
---

# 1.6 位运算、寄存器与 volatile

> 本节目标：掌握嵌入式最常见的位操作，理解内存映射寄存器、`volatile` 和读改写（RMW）的陷阱。

## 位操作基础

```c
#define BIT(n) (1UL << (n))

uint32_t reg = 0;

reg |= BIT(3);             /* 置位 bit 3 */
reg &= ~BIT(5);            /* 清除 bit 5 */
reg ^= BIT(7);             /* 翻转 bit 7 */

if ((reg & BIT(3)) != 0U) {
    /* bit 3 为 1 */
}
```

常见掩码：

```c
#define MODE_MASK  (0x3UL << 4)
#define MODE_00    (0x0UL << 4)
#define MODE_10    (0x2UL << 4)

reg = (reg & ~MODE_MASK) | MODE_10;
```

先清目标位，再写入新值，避免破坏同字段中的其他位。

## 内存映射寄存器

外设寄存器有固定地址。典型写法：

```c
#define GPIOA_BASE  (0x40020000UL)
#define GPIOA_ODR   (*(volatile uint32_t *)(GPIOA_BASE + 0x14UL))

GPIOA_ODR |= BIT(5);
```

这里的 `volatile` 告诉编译器：这个地址的内容可能在程序之外改变，不能把读写优化掉。

## `volatile` 不等于原子

```c
volatile uint32_t counter;
counter++;  /* 读、加、写三步，可能被中断打断 */
```

`volatile` 只保证访问不被优化，不保证操作原子。共享计数必须使用临界区、原子指令或 RTOS 同步机制。

## 读改写陷阱

```c
reg |= BIT(3);  /* 读 reg，改，再写回 */
```

如果中断也修改同一个寄存器，可能发生丢失更新。解决方式：

- 使用硬件提供的置位/清位寄存器，例如 STM32 的 `BSRR`。
- 在临界区内完成读改写。
- 使用原子置位/清位指令（平台支持时）。

STM32 GPIO 示例：

```c
GPIOA_BSRR = BIT(5);          /* 置位 PA5 */
GPIOA_BSRR = BIT(5 + 16);     /* 清除 PA5 */
```

## 位域的风险

```c
struct {
    uint32_t enable : 1;
    uint32_t mode   : 2;
    uint32_t irq    : 1;
} ctrl;
```

位域布局依赖编译器和 ABI，字段顺序、跨字节行为和访问方式都不适合直接映射硬件寄存器或协议。寄存器操作优先使用显式掩码和移位。

## 等待状态位

```c
#define UART_TXE BIT(7)

static int uart_wait_txe(volatile uint32_t *sr, uint32_t timeout_ms)
{
    uint32_t start = tick_ms();

    while ((*sr & UART_TXE) == 0U) {
        if ((tick_ms() - start) > timeout_ms) {
            return ERR_TIMEOUT;
        }
    }
    return OK;
}
```

轮询必须带超时，否则总线或外设异常会导致系统永久卡死。

## 常见坑

- 忘记 `volatile`，循环等待状态位被优化成死循环。
- 以为 `volatile` 能解决多任务竞态。
- 对只读或保留位写入非零值。
- 清位时用 `reg &= BIT(n)`，误把其他位全部清掉。
- 在中断和主循环同时读改写同一寄存器。

## 动手实验

1. 用位运算实现一个 32 位标志集合，支持 set/clear/toggle/test。
2. 读取一个真实 GPIO 输出寄存器，观察置位和清位。
3. 用 `BSRR` 替代 `ODR` 的读改写，比较代码和时序。
4. 写一个带超时的状态位轮询函数。
5. 故意去掉 `volatile`，在 `-O2` 下观察行为变化。

## 检查清单

- [ ] 能熟练使用置位、清位、翻转和掩码。
- [ ] 能解释 `volatile` 保证什么、不保证什么。
- [ ] 知道 RMW 操作为什么可能丢失更新。
- [ ] 优先使用硬件置位/清位寄存器或临界区。
- [ ] 所有轮询都有超时和错误返回。

