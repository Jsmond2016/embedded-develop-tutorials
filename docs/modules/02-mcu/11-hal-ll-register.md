---
title: 2.11 HAL、LL 与裸寄存器
description: 在开发效率、可移植性和可控性之间做取舍
---

# 2.11 HAL、LL 与裸寄存器

> 本节目标：不是站队某一种抽象层，而是知道什么时候用 HAL、什么时候用 LL、什么时候必须看寄存器。

## 三种层次

| 层次 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| HAL | 开发快，跨系列较统一 | 代码大、抽象多、时序不直观 | 原型、业务层、常规外设 |
| LL | 接近寄存器，开销小 | 依赖厂商头文件，仍需懂手册 | 时序敏感、资源受限 |
| 裸寄存器 | 最可控、最小 | 可读性和移植性差，易错 | 启动、极低功耗、底层驱动 |

## 同一个 GPIO 置位

HAL：

```c
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);
```

LL：

```c
LL_GPIO_SetOutputPin(GPIOA, LL_GPIO_PIN_5);
```

寄存器：

```c
GPIOA->BSRR = GPIO_BSRR_BS5;
```

三者最终都写硬件寄存器。区别在于 HAL 做了参数检查和状态管理，LL 只做薄封装，裸寄存器要求你自己查位定义。

## HAL 的问题

- 一次调用可能包含多条分支和状态判断。
- 出错时返回值可能被忽略。
- 初始化结构体字段多，容易漏配。
- 不同 STM32 系列的 HAL 行为有差异。

HAL 不是黑盒。至少要学会在调试器里跟到寄存器，或者查看 `stm32xxxx_hal_gpio.c` 的实现。

## LL 的适用场景

```c
LL_GPIO_InitTypeDef gpio = {0};
gpio.Pin = LL_GPIO_PIN_5;
gpio.Mode = LL_GPIO_MODE_OUTPUT;
gpio.Speed = LL_GPIO_SPEED_FREQ_LOW;
gpio.OutputType = LL_GPIO_OUTPUT_PUSHPULL;
gpio.Pull = LL_GPIO_PULL_NO;
LL_GPIO_Init(GPIOA, &gpio);
```

在 PWM、DMA、低功耗唤醒、精确时序等场景，LL 可以显著降低开销，但需要更仔细地读 Reference Manual。

## 裸寄存器的价值

即使项目主要用 HAL，也要能看懂：

```c
GPIOA->MODER &= ~(3UL << (5 * 2));
GPIOA->MODER |=  (1UL << (5 * 2));
GPIOA->BSRR = (1UL << 5);
```

调试时如果 HAL 行为不符合预期，直接看寄存器能快速判断是配置错、时钟没开还是引脚被复用。

## 推荐策略

1. 原型阶段用 HAL 快速打通。
2. 用逻辑分析仪和 GDB 验证 HAL 的真实行为。
3. 对时序敏感或高频路径，局部替换为 LL。
4. 启动、时钟、低功耗等关键路径，读懂寄存器配置。
5. 用接口层隔离厂商 API，避免业务代码到处依赖 HAL。

## 常见坑

- 以为用 HAL 就不需要读手册。
- 在中断里调用可能阻塞的 HAL 函数。
- HAL 初始化后忘记使能外设时钟。
- 混用 HAL 和 LL 修改同一个外设，状态不一致。
- 直接操作寄存器但忽略内存屏障和保留位。

## 动手实验

1. 用 HAL、LL、寄存器三种方式分别点亮同一颗 LED。
2. 比较反汇编代码大小和指令数。
3. 用调试器观察 `MODER`、`ODR`、`BSRR` 的变化。
4. 把 HAL 的 UART 发送改成 LL 实现，测量吞吐差异。
5. 为业务层设计一个不依赖 HAL 的 `gpio_port_t` 接口。

## 检查清单

- [ ] 能解释 HAL、LL、寄存器各自的取舍。
- [ ] 能用三种方式操作同一个 GPIO。
- [ ] 能用调试器查看外设寄存器。
- [ ] 知道哪些场景应该局部下探到底层。
- [ ] 业务层不会到处散落厂商 API。

