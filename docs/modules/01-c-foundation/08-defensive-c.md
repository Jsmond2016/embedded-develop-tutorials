---
title: 1.8 防御式 C
description: 用错误码、边界检查、断言和日志构建可恢复的固件
---

# 1.8 防御式 C

> 本节目标：把“正常路径能跑”升级为“异常路径可发现、可隔离、可恢复”。嵌入式设备不能靠用户刷新页面解决问题。

## 统一错误码

```c
typedef enum {
    OK = 0,
    ERR_INVALID_ARG = -1,
    ERR_NULL_PTR = -2,
    ERR_NO_SPACE = -3,
    ERR_TIMEOUT = -4,
    ERR_BUS = -5,
    ERR_CHECKSUM = -6,
    ERR_STATE = -7,
    ERR_IO = -8
} err_t;
```

错误码要能区分“调用参数错”“资源不足”“通信超时”“总线故障”和“状态不允许”。只有一个 `-1`，现场无法判断该换传感器还是改代码。

## 入口校验

```c
err_t sensor_read(sensor_t *sensor, sensor_sample_t *out)
{
    if (sensor == NULL || out == NULL) {
        return ERR_NULL_PTR;
    }
    if (!sensor->initialized) {
        return ERR_STATE;
    }
    if (sensor->read == NULL) {
        return ERR_INVALID_ARG;
    }
    return sensor->read(sensor->ctx, out);
}
```

公共接口的防御性检查不是“不信任同事”，而是防止错误在更远的层被放大。

## 边界与溢出

```c
static bool add_size(size_t a, size_t b, size_t *out)
{
    if (out == NULL) return false;
    if (a > SIZE_MAX - b) return false;
    *out = a + b;
    return true;
}
```

常见危险点：

- `length - 1` 在 `length == 0` 时下溢。
- `malloc(count * size)` 乘法溢出。
- 有符号整数做数组索引。
- 把 `size_t` 和 `int` 混用。

## 断言与运行时错误

`assert` 适合捕获“程序员不应该犯”的内部不变量；用户输入、通信数据和硬件异常必须走运行时错误处理。

```c
#include <assert.h>

static void ring_buffer_init(ring_buffer_t *rb, uint8_t *data, size_t capacity)
{
    assert(rb != NULL);
    assert(data != NULL);
    assert(capacity > 0U);
    rb->data = data;
    rb->capacity = capacity;
    rb->head = 0;
    rb->tail = 0;
}
```

发布版本可能关闭 `assert`，因此不能用断言替代错误返回。

## 日志要可观测

```c
#define LOG_ERROR(fmt, ...) \
    log_printf(LOG_LEVEL_ERROR, "%s:%d " fmt "\r\n", __FILE__, __LINE__, ##__VA_ARGS__)
```

日志至少包含：时间、模块、错误码、关键上下文。不要在高频中断里直接打印；把日志写入环形缓冲区，由低优先级任务输出。

## 失败安全

发生错误时要明确策略：

- 可重试：超时、临时总线忙。
- 降级：传感器失效时使用上次有效值，并标记数据质量。
- 隔离：关闭故障通道，保持其他功能运行。
- 复位：不可恢复状态触发看门狗或安全重启。
- 保留现场：记录复位原因、错误码和栈信息。

## 常见坑

- 所有错误都返回 `-1`。
- 检查了指针却忘了检查长度。
- 用 `assert` 处理外部输入。
- 在中断里格式化日志。
- 出错后静默继续，导致数据看起来正常但实际错误。

## 动手实验

为环形缓冲区补全防御式接口：

1. 空指针返回 `ERR_NULL_PTR`。
2. 容量为 0 返回 `ERR_INVALID_ARG`。
3. 满时返回 `ERR_NO_SPACE`，不覆盖旧数据。
4. 记录一次溢出次数。
5. 写测试覆盖每个错误路径。

## 检查清单

- [ ] 错误码能区分参数、状态、资源和通信错误。
- [ ] 公共接口检查空指针、长度和状态。
- [ ] 会写溢出安全的加法/乘法检查。
- [ ] 日志包含时间、模块和上下文。
- [ ] 每种错误都有重试、降级、隔离或复位策略。

