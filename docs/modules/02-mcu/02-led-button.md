---
title: 2.2 LED 限流与按键消抖
description: 从 GPIO 输出到可靠的按键事件检测
---

# 2.2 LED 限流与按键消抖

> 本节目标：完成 LED 和按键的可靠输入输出，理解高有效/低有效、机械抖动和非阻塞消抖。

## LED 连接方式

高有效接法：

```text
GPIO ── 330Ω ── LED ── GND
```

GPIO 输出高电平点亮。

低有效接法：

```text
3V3 ── LED ── 330Ω ── GPIO
```

GPIO 输出低电平点亮。很多开发板的板载 LED 是低有效，写代码前必须看原理图。

```c
/* 低有效 LED：0 亮，1 灭 */
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_RESET);
```

## 按键连接

```text
3V3 ── 10kΩ ── GPIO ── 按键 ── GND
```

未按下为高，按下为低。软件中要明确“按下”对应 0 还是 1，不要在不同模块里混用。

## 机械抖动

按键按下和松开时，触点会在几毫秒内多次通断。直接读 GPIO 可能一次按下产生多个事件。

常见消抖方式：

- 软件定时采样：连续 N 次一致才确认。
- 状态机 + 时间去抖：记录最近一次变化时间。
- 硬件 RC 滤波：成本低但响应变慢。
- 专用消抖芯片：成本高，适合复杂按键。

## 非阻塞消抖

```c
typedef struct {
    bool     stable_pressed;
    bool     last_raw_pressed;
    uint32_t last_change_ms;
    uint32_t debounce_ms;
} button_t;

static bool button_update(button_t *btn, bool raw_pressed, uint32_t now_ms)
{
    if (raw_pressed != btn->last_raw_pressed) {
        btn->last_raw_pressed = raw_pressed;
        btn->last_change_ms = now_ms;
        return false;
    }

    if ((now_ms - btn->last_change_ms) >= btn->debounce_ms &&
        raw_pressed != btn->stable_pressed) {
        btn->stable_pressed = raw_pressed;
        return true; /* 产生一次稳定状态变化事件 */
    }
    return false;
}
```

这个函数不阻塞，可以在主循环或定时任务里以 5–10 ms 周期调用。

## 短按与长按

消抖只解决“电平是否稳定”，业务还需要识别短按、长按和双击：

```c
typedef enum {
    BTN_EVENT_NONE = 0,
    BTN_EVENT_PRESS,
    BTN_EVENT_RELEASE,
    BTN_EVENT_LONG_PRESS
} button_event_t;

typedef struct {
    button_t state;
    uint32_t press_start_ms;
    bool long_reported;
} button_fsm_t;
```

按下时记录时间，达到长按阈值且未上报则产生长按事件；松开时根据持续时间产生短按或释放事件。所有逻辑仍然用时间差，不用 `HAL_Delay()`。

## 中断方式

按键可以配置为下降沿/上升沿中断，但不要在中断里直接做长时间消抖或业务处理。推荐：

1. 中断中记录时间戳或置事件标志。
2. 任务中读取标志，按时间窗口确认状态。
3. 业务层消费“按下/松开/长按”事件。

## 常见坑

- 低有效 LED 用高电平点亮，误以为灯坏了。
- 按键没有上拉/下拉，悬空读数随机。
- 在中断里 `HAL_Delay()` 消抖。
- 只在按下沿消抖，松开沿产生多次事件。
- 把“电平”当“事件”，重复触发业务。

## 动手实验

1. 分别实现高有效和低有效 LED 驱动，用宏隔离差异。
2. 用 10 ms 周期采样按键，记录原始值和消抖后的值。
3. 实现短按切换 LED、长按 2 秒复位配置。
4. 用逻辑分析仪观察按键抖动，测量实际抖动时间。

## 检查清单

- [ ] 能根据原理图判断 LED 高有效还是低有效。
- [ ] 按键默认电平明确，消抖不阻塞。
- [ ] 短按、长按和释放事件区分清楚。
- [ ] 中断只做最小事件记录。
- [ ] 已用仪器观察真实按键抖动。

