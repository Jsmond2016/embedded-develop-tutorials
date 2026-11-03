---
title: 2.7 定时器、PWM 与输入捕获
description: 用硬件定时器实现精确延时、波形输出和频率测量
---

# 2.7 定时器、PWM 与输入捕获

> 本节目标：理解定时器的时基、预分频、自动重装和比较通道，能生成 PWM 并测量外部信号。

## 定时器在做什么

定时器本质上是一个按固定频率递增/递减的计数器。核心参数：

- **时钟源**：内部 APB 时钟或外部时钟。
- **Prescaler**：预分频，降低计数频率。
- **ARR**：自动重装值，决定计数周期。
- **CCR**：比较值，决定 PWM 占空比或捕获时刻。

计数频率：

```text
f_cnt = f_timer / (PSC + 1)
```

更新频率（PWM 频率）：

```text
f_pwm = f_cnt / (ARR + 1)
```

## 生成 1 kHz PWM

假设定时器时钟 84 MHz，目标 1 kHz：

```text
PSC = 83      -> f_cnt = 1 MHz
ARR = 999     -> f_pwm = 1 kHz
```

```c
htim3.Instance = TIM3;
htim3.Init.Prescaler = 83;
htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
htim3.Init.Period = 999;
htim3.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
HAL_TIM_PWM_Init(&htim3);

TIM_OC_InitTypeDef oc = {0};
oc.OCMode = TIM_OCMODE_PWM1;
oc.Pulse = 500; /* 50% */
oc.OCPolarity = TIM_OCPOLARITY_HIGH;
oc.OCFastMode = TIM_OCFAST_DISABLE;
HAL_TIM_PWM_ConfigChannel(&htim3, &oc, TIM_CHANNEL_1);
HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
```

运行时调整占空比：

```c
__HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, 250); /* 25% */
```

## PWM 的应用

- LED 调光：频率足够高，避免可见闪烁。
- 电机调速：需要配合驱动器和死区控制。
- 蜂鸣器：固定频率方波。
- DAC 模拟：PWM + 低通滤波。
- 舵机：50 Hz、脉宽 0.5–2.5 ms。

不同负载对频率和占空比要求不同。LED 可能用 1 kHz，电机可能用 20 kHz 以上以减少噪声。

## 输入捕获

输入捕获在指定边沿记录计数器值，可用于：

- 测量脉冲宽度。
- 测量频率。
- 解码编码器。
- 读取红外遥控信号。

```c
void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Channel == HAL_TIM_ACTIVE_CHANNEL_1) {
        uint32_t capture = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_1);
        /* 保存 capture，计算相邻边沿时间差 */
    }
}
```

捕获中断中只保存时间戳，计算和业务处理放到任务中。

## 定时器中断

```c
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance == TIM6) {
        /* 只做计数或置标志 */
        systick_10ms_flag = true;
    }
}
```

定时器中断适合做稳定的时基，不适合执行长任务。高频定时器中断会显著增加 CPU 负载。

## 常见坑

- 忘记使能定时器时钟。
- 预分频和 ARR 计算错误，频率偏差。
- PWM 通道没有启动，或引脚没有配置为复用功能。
- 在更新中断里频繁修改 ARR，导致周期抖动。
- 输入捕获没有处理计数器回绕。
- 高频中断里做浮点运算或日志输出。

## 动手实验

1. 生成 1 kHz、50% 占空比 PWM，用逻辑分析仪测量。
2. 把占空比从 0% 扫到 100%，观察 LED 亮度。
3. 用输入捕获测量另一个定时器输出的频率。
4. 计算并验证 1 Hz 定时中断的 PSC/ARR。
5. 把定时器中断频率提高 10 倍，观察 CPU 负载变化。

## 检查清单

- [ ] 能根据时钟计算 PSC 和 ARR。
- [ ] 能生成并动态调整 PWM。
- [ ] 知道 PWM 频率与负载的关系。
- [ ] 能用输入捕获测量频率/脉宽。
- [ ] 定时器中断只做短小、确定性的工作。

