---
title: 2.6 GPIO、EXTI 与 NVIC
description: 从轮询到中断，理解外部中断的完整链路
---

# 2.6 GPIO、EXTI 与 NVIC

> 本节目标：掌握 GPIO 输入输出配置、外部中断触发链路、NVIC 优先级和中断服务程序的最小职责。

## GPIO 的四种常见配置

| 模式 | 用途 | 注意 |
| --- | --- | --- |
| 输入浮空 | 外部已有明确驱动 | 悬空时读数不定 |
| 输入上拉/下拉 | 按键、开关 | 确认默认电平 |
| 推挽输出 | LED、数字信号 | 不能与其他输出硬碰 |
| 开漏输出 | I2C、共享总线 | 需要外部上拉 |

## HAL 配置示例

```c
GPIO_InitTypeDef gpio = {0};

__HAL_RCC_GPIOA_CLK_ENABLE();
__HAL_RCC_GPIOC_CLK_ENABLE();

gpio.Pin = GPIO_PIN_5;
gpio.Mode = GPIO_MODE_OUTPUT_PP;
gpio.Pull = GPIO_NOPULL;
gpio.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOA, &gpio);

gpio.Pin = GPIO_PIN_13;
gpio.Mode = GPIO_MODE_IT_FALLING;
gpio.Pull = GPIO_PULLUP;
HAL_GPIO_Init(GPIOC, &gpio);

HAL_NVIC_SetPriority(EXTI15_10_IRQn, 5, 0);
HAL_NVIC_EnableIRQ(EXTI15_10_IRQn);
```

## 外部中断链路

```mermaid
flowchart LR
  A[GPIO 电平变化] --> B[EXTI 边沿检测]
  B --> C[NVIC 挂起中断]
  C --> D[CPU 跳转 ISR]
  D --> E[清除挂起/标志]
  E --> F[投递事件或队列]
```

任何一个环节配置错误，中断都不会按预期触发。

## 中断服务程序

```c
void EXTI15_10_IRQHandler(void)
{
    HAL_GPIO_EXTI_IRQHandler(BTN_Pin);
}

void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    if (GPIO_Pin == BTN_Pin) {
        BaseType_t higher_priority_task_woken = pdFALSE;
        uint32_t now = HAL_GetTick();
        xQueueSendFromISR(button_event_queue, &now, &higher_priority_task_woken);
        portYIELD_FROM_ISR(higher_priority_task_woken);
    }
}
```

中断里只做三件事：确认来源、清除标志、投递事件。消抖、业务判断、日志和通信都放到任务里。

## 优先级设计

优先级不是“越高中断越重要”，而是“越需要确定性响应的事件越高”。经验规则：

- 安全相关、硬件错误：高优先级。
- 高速通信、DMA 完成：中高优先级。
- 按键、显示刷新：低优先级。
- 业务处理：放到任务，不占中断。

优先级相同的 ISR 不能互相抢占，但会按挂起顺序执行。高优先级 ISR 运行时间过长，会阻塞低优先级中断。

## 常见坑

- 忘记清除 EXTI 挂起标志，ISR 反复进入。
- 按键中断里做 20 ms 延时消抖。
- 在 ISR 中调用 `HAL_Delay()` 或阻塞式 I2C。
- 共享变量没有临界区保护。
- 优先级设置与 RTOS 的 `configMAX_SYSCALL_INTERRUPT_PRIORITY` 冲突。

## 动手实验

1. 用轮询实现按键计数，再用 EXTI 实现同样功能。
2. 在示波器/逻辑分析仪上观察按键抖动和中断触发次数。
3. 把消抖放到任务中，比较中断负载。
4. 故意在 ISR 里加 5 ms 延时，观察其他中断延迟。

## 检查清单

- [ ] 能根据需求选择输入/输出、上拉/下拉、推挽/开漏。
- [ ] 能配置 EXTI 触发边沿和 NVIC 优先级。
- [ ] ISR 只做最小工作并正确清标志。
- [ ] 中断与任务通信用队列或通知。
- [ ] 能解释中断优先级对系统实时性的影响。

