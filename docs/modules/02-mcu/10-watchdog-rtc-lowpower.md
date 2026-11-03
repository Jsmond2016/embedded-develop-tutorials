---
title: 2.10 看门狗、RTC 与低功耗
description: 让设备在异常后恢复，并让电池设备活得更久
---

# 2.10 看门狗、RTC 与低功耗

> 本节目标：理解独立看门狗、窗口看门狗、复位原因、RTC 和低功耗模式，能设计“出错可恢复、平时省电”的设备。

## 看门狗解决什么问题

看门狗是一个倒计时器。软件必须在超时前“喂狗”，否则硬件复位系统。它适合处理：

- 程序跑飞或死循环。
- 任务阻塞导致主循环停滞。
- 某个关键任务没有按周期运行。

看门狗不是万能的：如果喂狗逻辑本身在中断里无条件执行，系统卡死也可能继续喂狗，失去保护意义。

## 独立看门狗 IWDG

```c
IWDG_HandleTypeDef hiwdg = {0};
hiwdg.Instance = IWDG;
hiwdg.Init.Prescaler = IWDG_PRESCALER_64;
hiwdg.Init.Reload = 1250;
HAL_IWDG_Init(&hiwdg);

/* 在确认关键任务都健康后喂狗 */
HAL_IWDG_Refresh(&hiwdg);
```

超时时间由 LSI 时钟、预分频和重装值决定。LSI 精度较差，量产时要留足余量。

## 窗口看门狗 WWDG

窗口看门狗要求喂狗发生在指定时间窗口内：太早喂也会复位。它适合检测“任务运行过快或时序异常”，但配置更复杂。

## 复位原因

启动时读取复位标志：

```c
if (__HAL_RCC_GET_FLAG(RCC_FLAG_IWDGRST)) {
    log_event(EVENT_WATCHDOG_RESET);
    __HAL_RCC_CLEAR_RESET_FLAGS();
}
```

不要每次启动都清空所有标志，先把原因写入非易失存储，便于现场分析。

## 喂狗策略

- 只在主循环或健康检查任务中喂狗。
- 多个关键任务通过事件组/标志汇报心跳。
- 任一关键任务超时，停止喂狗，让系统复位。
- 记录复位次数，连续复位时进入安全模式或降级模式。

## RTC

RTC 是低功耗实时时钟，通常由独立时钟源和备份电池供电。用途：

- 记录绝对时间。
- 定时唤醒。
- 周期性采集。
- 日志时间戳。

```c
RTC_TimeTypeDef time;
RTC_DateTypeDef date;
HAL_RTC_GetTime(&hrtc, &time, RTC_FORMAT_BIN);
HAL_RTC_GetDate(&hrtc, &date, RTC_FORMAT_BIN);
```

注意先读时间再读日期，某些 STM32 系列要求这个顺序以解锁影子寄存器。

## 低功耗模式

| 模式 | CPU | 外设 | 唤醒 | 典型用途 |
| --- | --- | --- | --- | --- |
| Sleep | 停 | 运行 | 任意中断 | 短暂空闲 |
| Stop | 停 | 大部分停 | EXTI/RTC | 周期采集 |
| Standby | 停 | 几乎全停 | 复位/唤醒脚/RTC | 超低功耗待机 |

进入 Stop 前要保存状态、关闭不必要外设、配置唤醒源；唤醒后要重新初始化时钟和外设。

```c
HAL_SuspendTick();
HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);
SystemClock_Config();
HAL_ResumeTick();
```

## 功耗预算

```text
平均电流 = Σ(工作电流 × 工作时间 + 休眠电流 × 休眠时间) / 总周期
```

例如每 60 秒唤醒 1 秒采集，工作 20 mA，休眠 20 µA：

```text
平均电流 ≈ (20 mA × 1 s + 0.02 mA × 59 s) / 60 s ≈ 0.353 mA
```

电池寿命还要考虑转换效率、传感器功耗、无线发射峰值和温度。

## 常见坑

- 在中断里无条件喂狗。
- 只看典型超时，忽略 LSI 偏差。
- Stop 唤醒后没有重新配置时钟。
- 调试器连接时低功耗行为异常。
- RTC 备份域未使能，断电后时间丢失。
- 只测休眠电流，不测无线发射峰值。

## 动手实验

1. 配置 IWDG，在主循环故意死循环，观察复位。
2. 记录复位原因并通过串口输出。
3. 用 RTC 每秒唤醒一次，测量平均电流。
4. 比较 Sleep、Stop、Standby 的唤醒时间和功耗。
5. 设计一个“连续 3 次看门狗复位进入安全模式”的策略。

## 检查清单

- [ ] 知道 IWDG 和 WWDG 的区别。
- [ ] 喂狗前确认关键任务健康。
- [ ] 能读取并记录复位原因。
- [ ] 能配置 RTC 和低功耗唤醒。
- [ ] 能估算平均电流和电池寿命。

