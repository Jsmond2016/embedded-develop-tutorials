---
title: 3.3 队列、信号量与互斥量
description: 用正确的同步原语表达任务之间的数据流和资源所有权
---

# 3.3 队列、信号量与互斥量

> 本节目标：区分“传数据”“发事件”“保护资源”三类需求，选择正确的 FreeRTOS 同步机制。

## 队列：传递数据

队列按值复制数据，适合生产者和消费者之间传递样本、命令、日志。

```c
QueueHandle_t sample_queue;

void app_init(void)
{
    sample_queue = xQueueCreate(16, sizeof(sensor_sample_t));
}

void producer(void *arg)
{
    sensor_sample_t sample = { .temperature_x10 = 235, .humidity_x10 = 512 };
    if (xQueueSend(sample_queue, &sample, pdMS_TO_TICKS(100)) != pdPASS) {
        /* 队列满：记录丢弃或降级 */
    }
}

void consumer(void *arg)
{
    sensor_sample_t sample;
    if (xQueueReceive(sample_queue, &sample, portMAX_DELAY) == pdPASS) {
        process_sample(&sample);
    }
}
```

队列适合传递小结构体。不要传指向局部变量的指针，也不要在队列中传大块数据，优先传指针 + 所有权明确的缓冲区。

## 二值信号量：发事件

二值信号量表示“某件事发生了”，不携带数据。

```c
SemaphoreHandle_t data_ready;
data_ready = xSemaphoreCreateBinary();

/* 生产者 */
xSemaphoreGive(data_ready);

/* 消费者 */
if (xSemaphoreTake(data_ready, pdMS_TO_TICKS(1000)) == pdTRUE) {
    read_data();
}
```

如果事件会累积，用计数信号量；如果只需要唤醒任务一次，用任务通知更轻量。

## 互斥量：保护资源

互斥量表达“同一时间只允许一个任务访问资源”，并支持优先级继承。

```c
SemaphoreHandle_t i2c_mutex;
i2c_mutex = xSemaphoreCreateMutex();

if (xSemaphoreTake(i2c_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    i2c_write_reg(0x10, value);
    xSemaphoreGive(i2c_mutex);
} else {
    log_error(ERR_BUSY);
}
```

临界区适合保护几行内存操作；互斥量适合保护可能阻塞的共享外设或长操作。

## 事件组：等待多个条件

```c
EventGroupHandle_t events;
events = xEventGroupCreate();

#define EV_SENSOR_READY BIT0
#define EV_NET_READY    BIT1

xEventGroupSetBits(events, EV_SENSOR_READY);

EventBits_t bits = xEventGroupWaitBits(
    events,
    EV_SENSOR_READY | EV_NET_READY,
    pdFALSE,
    pdTRUE,
    pdMS_TO_TICKS(5000));
```

`pdTRUE` 表示等待所有位都置起。事件组适合启动条件、状态同步和多事件聚合。

## 任务通知：最轻量

```c
xTaskNotifyGive(worker_task);

ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
```

任务通知直接绑定目标任务，速度快、内存小，但表达能力有限，适合一对一的事件通知。

## 如何选择

| 需求 | 首选 |
| --- | --- |
| 传递数据 | 队列 |
| 一对一事件 | 任务通知 |
| 多任务事件/条件组合 | 事件组 |
| 保护共享外设 | 互斥量 |
| 计数资源 | 计数信号量 |
| 极短内存操作 | 临界区 |

## 常见坑

- 用二值信号量传数据，导致数据覆盖。
- 队列里传局部变量地址。
- 互斥量在中断中使用。
- 获取互斥量后提前 return，忘记释放。
- 用 `portMAX_DELAY` 等待所有操作，导致系统无法降级。

## 动手实验

1. 用队列实现采样任务到显示任务的数据流。
2. 用二值信号量通知日志刷新。
3. 用互斥量保护共享 I2C 总线，制造两个任务竞争。
4. 用事件组等待“传感器就绪 + 网络就绪”。
5. 把一对一通知改成任务通知，比较 RAM 和时间开销。

## 检查清单

- [ ] 能区分队列、信号量、互斥量和事件组。
- [ ] 知道队列按值复制，不能传悬空指针。
- [ ] 互斥量只在任务中使用。
- [ ] 获取资源后所有路径都能释放。
- [ ] 等待操作都有合理超时。

