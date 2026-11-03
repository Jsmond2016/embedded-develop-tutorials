---
title: 2.4 Cortex-M 架构
description: 理解寄存器、异常、中断、栈和内存映射
---

# 2.4 Cortex-M 架构

> 本节目标：建立 Cortex-M 的执行模型，能看懂启动文件、异常向量、栈指针和 NVIC 配置。

## 核心寄存器

| 寄存器 | 作用 |
| --- | --- |
| `R0–R12` | 通用寄存器 |
| `R13 / SP` | 栈指针，MSP 或 PSP |
| `R14 / LR` | 链接寄存器，保存返回地址 |
| `R15 / PC` | 程序计数器 |
| `xPSR` | 状态寄存器，包含条件标志和异常状态 |

Cortex-M 使用 Thumb/Thumb-2 指令集，指令地址通常要求半字对齐，函数指针最低位可能用于表示 Thumb 状态。

## 两种模式

- **Thread mode**：普通应用代码。
- **Handler mode**：异常/中断服务程序。

Thread mode 可以使用 MSP 或 PSP；Handler mode 总是使用 MSP。RTOS 常把任务栈放在 PSP，把中断栈放在 MSP，从而实现任务切换。

## 异常与中断

异常包括复位、NMI、HardFault、SysTick、外设中断等。异常发生时硬件会自动：

1. 保存部分寄存器现场（异常栈帧）。
2. 从向量表取出处理函数地址。
3. 切换到 Handler mode。
4. 执行 ISR。
5. 返回时恢复现场。

异常栈帧通常包含 `R0–R3、R12、LR、PC、xPSR`。如果栈指针无效，异常处理本身也会失败。

## NVIC

Nested Vectored Interrupt Controller 负责中断使能、优先级、挂起和嵌套。

```c
NVIC_SetPriority(USART2_IRQn, 5);
NVIC_EnableIRQ(USART2_IRQn);
```

数值越小，优先级越高（具体取决于优先级分组）。高优先级中断可以打断低优先级 ISR。中断优先级设计要与实时性需求匹配，不能所有中断都给最高优先级。

## SysTick

SysTick 是内核自带的下行计数器，常用作系统节拍：

```c
void SysTick_Handler(void)
{
    HAL_IncTick();
}
```

RTOS 也常用 SysTick 作为任务调度时基。注意 HAL 时基和 RTOS 时基可能冲突，工程中要明确使用哪个 tick。

## 内存映射

Cortex-M 的地址空间大致分为：

```text
0x0000_0000  代码/启动区（可重映射）
0x2000_0000  SRAM
0x4000_0000  外设
0x6000_0000  外部 RAM/设备
0xE000_0000  内核私有外设（NVIC、SysTick、SCB）
```

调试时查看地址，能快速判断程序是在访问 Flash、SRAM 还是外设寄存器。

## 常见异常

- **HardFault**：无法分类的严重错误，常见于空指针、非法地址、栈溢出、未对齐访问。
- **MemManage**：内存保护违规（需启用 MPU）。
- **BusFault**：总线访问错误。
- **UsageFault**：非法指令、除零等。

生产固件应在 HardFault 中保存现场，至少记录 PC、LR、栈指针和错误状态寄存器，再安全复位。

## CMSIS 常用操作

```c
uint32_t msp = __get_MSP();
uint32_t psp = __get_PSP();
__disable_irq();
__enable_irq();

SCB->VTOR = (uint32_t)vector_table;
```

这些操作直接影响系统状态，必须理解副作用，不要在业务代码里随意开关中断。

## 前端类比

浏览器的调用栈由运行时管理，异常会冒泡到 `window.onerror`。MCU 的异常是硬件级跳转，栈帧、向量表和优先级都由你配置。理解这层差异，才能看懂 RTOS 和 Bootloader。

## 检查清单

- [ ] 能说出 SP、LR、PC 和 xPSR 的作用。
- [ ] 能解释 Thread mode 与 Handler mode。
- [ ] 知道异常发生时硬件保存哪些寄存器。
- [ ] 会配置 NVIC 优先级并使能中断。
- [ ] 能在 HardFault 中保存基本现场。
- [ ] 能根据地址判断访问区域。

