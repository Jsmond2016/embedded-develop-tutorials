---
title: 1.3 指针、数组、函数指针与回调
description: 用指针和回调建立硬件驱动与业务逻辑之间的边界
---

# 1.3 指针、数组、函数指针与回调

> 本节目标：理解地址、指针算术、数组退化和函数指针，能设计带上下文的回调接口。

## 指针是什么

指针保存地址。嵌入式里地址可能指向 SRAM 变量、Flash 常量、外设寄存器或 DMA 缓冲区。

```c
uint32_t value = 42;
uint32_t *p = &value;

*p = 100;              /* 修改 value */
uint32_t x = *p;       /* 读取 value */
```

指针的类型决定解引用时读取多少字节，也决定指针算术的步长。

## 数组与指针

```c
uint8_t buffer[8] = {0};
uint8_t *p = buffer;       /* 数组名退化为首元素地址 */

p[0] = 1;
*(p + 1) = 2;
size_t n = sizeof(buffer); /* 8，仅对数组名成立 */
size_t m = sizeof(p);      /* 指针大小，通常是 4 或 8 */
```

函数参数里的数组会退化成指针，所以必须同时传长度：

```c
int checksum(const uint8_t *data, size_t length);
```

## 指针边界

```c
int copy_payload(uint8_t *dst, size_t dst_len,
                 const uint8_t *src, size_t src_len)
{
    if (dst == NULL || src == NULL) return ERR_NULL;
    if (dst_len < src_len) return ERR_NO_SPACE;

    for (size_t i = 0; i < src_len; ++i) {
        dst[i] = src[i];
    }
    return OK;
}
```

嵌入式驱动必须在入口验证空指针和长度，不能假设调用者永远正确。

## 函数指针

```c
typedef int (*write_fn_t)(const uint8_t *data, size_t len, void *ctx);

typedef struct {
    write_fn_t write;
    void *ctx;
} transport_t;

static int transport_send(const transport_t *t,
                          const uint8_t *data, size_t len)
{
    if (t == NULL || t->write == NULL) return ERR_INVALID;
    return t->write(data, len, t->ctx);
}
```

这样业务层不依赖 UART、SPI 或 TCP 的具体实现，测试时可以传入假实现。

## 带上下文的回调

```c
typedef struct {
    int16_t temperature_x10;
    uint16_t humidity_x10;
} sensor_sample_t;

typedef void (*sample_cb_t)(const sensor_sample_t *sample, void *user);

typedef struct {
    sample_cb_t on_sample;
    void *user;
} sensor_listener_t;

static void sensor_emit(const sensor_listener_t *listener,
                        const sensor_sample_t *sample)
{
    if (listener->on_sample != NULL) {
        listener->on_sample(sample, listener->user);
    }
}
```

`user` 指针让回调可以携带任务句柄、队列句柄或设备对象。没有上下文参数的回调，在多个实例并存时会非常难用。

## 回调的使用边界

- 回调要短小，不要在中断回调里做阻塞 I/O。
- 明确回调运行在中断上下文还是任务上下文。
- 不要在回调中销毁回调自身所在的对象。
- 对可能为空的回调做保护。
- 共享数据的所有权和生命周期要写进接口文档。

## 常见坑

- 指针未初始化就使用。
- 数组越界后写坏相邻变量。
- 把栈上的缓冲区地址保存到全局或队列，函数返回后悬空。
- 函数指针签名不一致，强转后调用导致栈错乱。
- 在中断里调用非可重入函数。

## 动手实验

实现一个 `transport_t` 抽象层，提供两个实现：

1. `uart_transport`：把数据写入内存缓冲区，模拟串口。
2. `fake_transport`：记录调用次数，测试时使用。

业务层只依赖 `transport_send`，不直接调用 UART。用主机端测试验证发送失败时错误码能正确透传。

## 检查清单

- [ ] 能解释数组名退化后 `sizeof` 的变化。
- [ ] 能在接口中同时传递指针和长度。
- [ ] 能写出带 `void *user` 上下文的回调。
- [ ] 知道回调运行在中断还是任务上下文。
- [ ] 能通过函数指针把驱动与业务解耦。

