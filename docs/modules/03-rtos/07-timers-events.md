---
title: 3.7 软件定时器与事件驱动
description: 用定时器和事件组组织非阻塞的业务节奏
---

# 3.7 软件定时器与事件驱动

> 本节目标：理解 FreeRTOS 软件定时器服务任务，能设计周期任务、超时和事件聚合逻辑。

## 软件定时器是什么

软件定时器基于 RTOS tick，由定时器服务任务统一管理。它适合：

- 周期性采样。
- 延迟动作。
- 超时检测。
- 状态机超时。

它不保证硬实时精度，精度受 tick 周期和服务任务优先级影响。

## 创建周期定时器

```c
TimerHandle_t sample_timer;

static void sample_timer_cb(TimerHandle_t timer)
{
    (void)timer;
    BaseType_t woken = pdFALSE;
    vTaskNotifyGiveFromISR(sensor_task, &woken);
    portYIELD_FROM_ISR(woken);
}

void timers_init(void)
{
    sample_timer = xTimerCreate(
        "sample",
        pdMS_TO_TICKS(100),
        pdTRUE,
        NULL,
        sample_timer_cb);

    xTimerStart(sample_timer, 0);
}
```

定时器回调运行在定时器服务任务上下文，不是中断上下文，但仍应短小，不要阻塞。

## 单次定时器

```c
TimerHandle_t timeout_timer = xTimerCreate(
    "timeout",
    pdMS_TO_TICKS(5000),
    pdFALSE,
    NULL,
    timeout_cb);

xTimerStart(timeout_timer, 0);
/* 事件到达后取消超时 */
xTimerStop(timeout_timer, 0);
```

单次定时器常用于“等待响应，超时则重试”。

## 定时器服务任务

FreeRTOS 会创建 Timer Service Task。它的优先级和栈在配置中设置，必须足够处理所有回调。不要在回调里做重活，否则其他定时器会被延迟。

## 事件组做状态聚合

```c
#define EV_SENSOR_OK BIT0
#define EV_NET_OK    BIT1
#define EV_TIME_OK   BIT2

EventBits_t bits = xEventGroupWaitBits(
    system_events,
    EV_SENSOR_OK | EV_NET_OK | EV_TIME_OK,
    pdFALSE,
    pdTRUE,
    pdMS_TO_TICKS(10000));
```

适合“所有子系统就绪才进入运行态”的启动流程。

## 命令分发器

用队列接收命令，任务根据命令执行动作：

```c
typedef enum {
    CMD_START = 1,
    CMD_STOP,
    CMD_SET_INTERVAL,
    CMD_FACTORY_RESET
} command_id_t;

typedef struct {
    command_id_t id;
    union {
        uint32_t interval_ms;
    } args;
} command_t;
```

命令队列把外部输入（串口、按键、MQTT）统一成内部事件，避免每个来源都直接修改业务状态。

## 设计建议

- 周期任务优先用 `vTaskDelayUntil`，需要统一管理时用软件定时器。
- 软定时器回调只投递事件，不执行长任务。
- 超时和重试逻辑显式建模，不要依赖无数个 `vTaskDelay`。
- 事件组位定义集中管理，避免冲突。

## 常见坑

- 认为软件定时器是硬实时。
- 回调里调用阻塞 API。
- 定时器服务任务栈太小。
- 定时器启动失败没有检查返回值。
- 事件位被多个模块重复定义。

## 动手实验

1. 用软件定时器每 100 ms 触发一次采样。
2. 实现 5 秒无响应超时，超时后重试。
3. 用事件组等待三个子系统就绪。
4. 把按键、串口、MQTT 命令统一进命令队列。
5. 调整定时器服务任务优先级，观察抖动。

## 检查清单

- [ ] 知道软件定时器运行在哪个上下文。
- [ ] 能创建周期和单次定时器。
- [ ] 回调只做短小工作。
- [ ] 能用事件组等待多个条件。
- [ ] 外部输入统一进入命令队列。

