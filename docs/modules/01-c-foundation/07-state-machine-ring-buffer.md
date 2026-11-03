---
title: 1.7 状态机、环形缓冲区与命令解析器
description: 用三个基础结构解决非阻塞业务、串口收包和命令处理
---

# 1.7 状态机、环形缓冲区与命令解析器

> 本节目标：掌握嵌入式最常用的三种数据结构，把“阻塞式流程”改造成可测试的事件驱动代码。

## 状态机

状态机把业务拆成“当前状态 + 事件 + 动作 + 下一状态”。它适合连接管理、按键处理、协议解析、设备启动流程。

```c
typedef enum {
    LINK_IDLE = 0,
    LINK_CONNECTING,
    LINK_ONLINE,
    LINK_BACKOFF,
    LINK_ERROR
} link_state_t;

typedef enum {
    EV_CONNECT = 0,
    EV_CONNECTED,
    EV_TIMEOUT,
    EV_DISCONNECTED,
    EV_RETRY
} link_event_t;

typedef struct {
    link_state_t state;
    uint32_t retry_count;
} link_ctx_t;

static void link_handle(link_ctx_t *ctx, link_event_t event)
{
    switch (ctx->state) {
    case LINK_IDLE:
        if (event == EV_CONNECT) {
            ctx->state = LINK_CONNECTING;
        }
        break;
    case LINK_CONNECTING:
        if (event == EV_CONNECTED) {
            ctx->state = LINK_ONLINE;
            ctx->retry_count = 0;
        } else if (event == EV_TIMEOUT || event == EV_DISCONNECTED) {
            ctx->state = LINK_BACKOFF;
            ctx->retry_count++;
        }
        break;
    case LINK_ONLINE:
        if (event == EV_DISCONNECTED) {
            ctx->state = LINK_BACKOFF;
        }
        break;
    case LINK_BACKOFF:
        if (event == EV_RETRY) {
            ctx->state = LINK_CONNECTING;
        }
        break;
    default:
        ctx->state = LINK_ERROR;
        break;
    }
}
```

### 表驱动状态机

当状态和事件很多时，用转换表比嵌套 `switch` 更清晰：

```c
typedef struct {
    link_state_t from;
    link_event_t event;
    link_state_t to;
} transition_t;

static const transition_t k_transitions[] = {
    { LINK_IDLE,       EV_CONNECT,      LINK_CONNECTING },
    { LINK_CONNECTING, EV_CONNECTED,    LINK_ONLINE },
    { LINK_CONNECTING, EV_TIMEOUT,      LINK_BACKOFF },
    { LINK_ONLINE,     EV_DISCONNECTED, LINK_BACKOFF },
    { LINK_BACKOFF,    EV_RETRY,        LINK_CONNECTING },
};
```

转换表可以直接写单元测试：给定状态和事件，断言下一状态。

## 环形缓冲区

环形缓冲区用于串口接收、日志队列、音频采样等“生产者写入、消费者读取”场景。

```c
typedef struct {
    uint8_t *data;
    size_t   capacity;
    size_t   head;
    size_t   tail;
} ring_buffer_t;

static size_t rb_count(const ring_buffer_t *rb)
{
    return rb->head - rb->tail;
}

static bool rb_push(ring_buffer_t *rb, uint8_t byte)
{
    if (rb_count(rb) >= rb->capacity) {
        return false;
    }
    rb->data[rb->head % rb->capacity] = byte;
    rb->head++;
    return true;
}

static bool rb_pop(ring_buffer_t *rb, uint8_t *byte)
{
    if (rb_count(rb) == 0U) {
        return false;
    }
    *byte = rb->data[rb->tail % rb->capacity];
    rb->tail++;
    return true;
}
```

这里用无符号计数器的自然回绕计算数量。注意：这只是单生产者/单消费者的主机端版本；中断与任务共享时还需要处理内存屏障、索引原子性和临界区。

## 命令解析器

假设串口命令格式为：

```text
AA 55 | LEN | CMD | PAYLOAD... | CRC8
```

解析器不要假设一次 `read` 就能收到完整帧。正确做法是把字节逐个喂给状态机：

```c
typedef enum {
    WAIT_HEAD_1,
    WAIT_HEAD_2,
    WAIT_LEN,
    WAIT_CMD,
    WAIT_PAYLOAD,
    WAIT_CRC
} parser_state_t;
```

每个字节推进一次状态，收到完整帧后再校验 CRC、分发命令。这样无论串口一次收到 1 字节还是 100 字节，解析器都能工作。

## 设计要点

- 业务状态机不要直接调用阻塞式延时。
- 环形缓冲区容量必须是 2 的幂时，可以用位与替代取模，但要明确限制。
- 解析器要限制最大长度，避免恶意或异常数据撑爆缓冲区。
- CRC 校验失败要丢弃整帧并重新同步帧头。
- 所有“等待”都要有超时。

## 动手实验

1. 为状态机写主机端测试，覆盖正常连接、超时和断线重连。
2. 为环形缓冲区测试空、满、回绕和批量读写。
3. 实现命令解析器，输入被拆成任意长度的片段，输出同样的命令。
4. 注入错误帧头、超长长度和错误 CRC，确认解析器能恢复。

## 检查清单

- [ ] 能把阻塞流程改写成状态机。
- [ ] 能解释环形缓冲区的 head/tail 语义。
- [ ] 解析器不依赖单次读取完整帧。
- [ ] 所有缓冲区都有容量上限。
- [ ] 测试覆盖正常、边界和错误输入。

