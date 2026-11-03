---
title: 3.8 故障处理与现场保护
description: 从 HardFault、栈溢出和看门狗复位中留下可分析的证据
---

# 3.8 故障处理与现场保护

> 本节目标：建立“发现异常 → 保存现场 → 安全恢复 → 事后分析”的故障处理闭环。

## 固件最常见的事故

- 空指针/野指针访问。
- 数组越界、栈溢出。
- 非法内存地址或未对齐访问。
- 中断优先级配置错误。
- 任务死锁或长期饥饿。
- 通信超时导致状态机卡死。
- Flash 写入期间掉电。

## HardFault 现场

发生异常时，硬件把部分寄存器压入栈。处理函数需要判断使用的是 MSP 还是 PSP，然后读取栈帧：

```c
typedef struct {
    uint32_t r0;
    uint32_t r1;
    uint32_t r2;
    uint32_t r3;
    uint32_t r12;
    uint32_t lr;
    uint32_t pc;
    uint32_t xpsr;
} exception_frame_t;
```

关键信息：

- `pc`：出错指令地址。
- `lr`：返回地址。
- `xpsr`：状态标志。
- `SCB->CFSR`：配置/使用/总线/MemManage 错误状态。
- `SCB->HFSR`：HardFault 状态。
- `SCB->MMFAR/BFAR`：内存/总线错误地址（有效时）。

建议在故障处理中把上述信息写入 RAM 保留区或 Flash 日志，然后触发受控复位。

## 不要只打印一行

```c
void HardFault_Handler(void)
{
    fault_capture_t capture = {0};
    capture.cfsr = SCB->CFSR;
    capture.hfsr = SCB->HFSR;
    capture.mmfar = SCB->MMFAR;
    capture.bfar = SCB->BFAR;
    capture.sp = __get_MSP();
    fault_log_save(&capture);
    NVIC_SystemReset();
}
```

实际读取异常栈帧需要汇编或 naked 函数，因为 C 编译器可能修改栈指针。可以先保存 MSP/PSP 和关键寄存器，再在安全上下文中解析。

## 栈溢出

启用：

```c
#define configCHECK_FOR_STACK_OVERFLOW 2
```

实现钩子记录任务名和栈高水位。任务栈溢出可能表现为随机变量被改、HardFault、看门狗复位，必须优先排查。

## 看门狗与故障恢复

- 关键任务定期汇报心跳。
- 健康检查任务确认所有心跳正常后再喂狗。
- 连续复位计数，超过阈值进入安全模式。
- 记录复位原因和上次故障码。

## 故障注入

主动制造故障，验证系统能否发现和恢复：

- 空指针解引用。
- 任务栈减半。
- I2C 断线。
- 队列满。
- 通信对端不响应。
- 写入 Flash 时断电。

## 常见坑

- HardFault 处理函数里调用 `printf`，再次触发异常。
- 故障现场只存在 RAM，复位后丢失。
- 看门狗在中断里无条件喂。
- 只处理正常路径，不测试错误恢复。
- 复位后不记录原因，问题无法复现。

## 检查清单

- [ ] 能读取 CFSR/HFSR/MMFAR/BFAR。
- [ ] 能判断异常栈使用 MSP 还是 PSP。
- [ ] 故障现场能持久化到非易失存储。
- [ ] 看门狗由健康检查驱动，而不是无条件喂。
- [ ] 已做至少三种故障注入实验。

