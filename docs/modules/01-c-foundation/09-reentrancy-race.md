---
title: 1.9 可重入、原子性与竞态
description: 识别中断与任务共享数据的风险，正确使用临界区
---

# 1.9 可重入、原子性与竞态

> 本节目标：理解“单核也会并发”，能识别中断、任务和主循环之间的共享数据问题，并用最小临界区保护它。

## 并发从哪里来

即使 MCU 只有一个核，也存在并发：

- 主循环和中断服务程序。
- 多个 RTOS 任务。
- DMA 和外设在后台修改内存。
- 编译器和 CPU 的指令重排。

只要两段代码访问同一份可变数据，且至少一方会写，就可能产生竞态。

## 可重入函数

可重入函数可以被多个执行流同时调用而不互相破坏。它通常满足：

- 不使用静态/全局可变状态。
- 不返回指向静态缓冲区的指针。
- 不调用不可重入的库函数。
- 所有状态通过参数或显式上下文传递。

```c
/* 不可重入：共享静态缓冲区 */
char *format_value(int value)
{
    static char buffer[16];
    snprintf(buffer, sizeof(buffer), "%d", value);
    return buffer;
}

/* 可重入：调用者提供缓冲区 */
int format_value_r(int value, char *out, size_t out_len)
{
    if (out == NULL || out_len == 0U) return ERR_INVALID_ARG;
    int n = snprintf(out, out_len, "%d", value);
    return (n < 0 || (size_t)n >= out_len) ? ERR_NO_SPACE : OK;
}
```

`malloc`、`printf`、某些 HAL 函数都可能不可重入或带内部锁。在中断里调用前必须确认。

## 临界区

CMSIS 提供了保存和恢复中断状态的接口：

```c
uint32_t primask = __get_PRIMASK();
__disable_irq();

/* 只放必须原子完成的几行代码 */
shared_counter++;

__set_PRIMASK(primask);
```

临界区要尽量短。进入前保存状态，退出时恢复，而不是无条件开中断，否则会破坏嵌套调用。

在 FreeRTOS 任务中使用 `taskENTER_CRITICAL()` / `taskEXIT_CRITICAL()`；在中断中使用对应的 `FromISR` 接口。

## `volatile` 不是锁

```c
volatile uint32_t event_flags;

/* 下面两步之间仍可能被中断打断 */
if (event_flags & FLAG_RX) {
    event_flags &= ~FLAG_RX;
}
```

`volatile` 只防止编译器缓存变量，不提供原子性、内存屏障或互斥。

## 单生产者单消费者队列

中断写、任务读的环形缓冲区可以做到无锁，但需要满足严格条件：

- 只有一个生产者、一个消费者。
- head 只由生产者修改，tail 只由消费者修改。
- 索引读写使用原子操作或平台保证。
- 生产者和消费者之间需要内存屏障，确保数据先写入再发布索引。

```c
/* 伪代码：生产者在写入 data 后发布 head */
rb->data[rb->head % rb->capacity] = byte;
atomic_store_release(&rb->head, rb->head + 1);

/* 消费者读取 head 后读取 data */
size_t head = atomic_load_acquire(&rb->head);
```

如果不确定内存模型，优先使用 RTOS 队列或临界区，不要凭感觉写“无锁”。

## 常见竞态

- 主循环读一个 32 位变量，中断在读取中途更新它。
- 两个任务都做 `counter++`。
- 任务释放了缓冲区，DMA 还在写。
- 中断修改链表，任务同时遍历。
- 共享状态没有明确所有权。

## 动手实验

1. 写一个中断和主循环共享的计数器，不加保护，观察丢计数。
2. 用临界区修复，测量临界区长度。
3. 把不可重入的格式化函数改成调用者提供缓冲区。
4. 用 RTOS 队列替代共享缓冲区，比较代码复杂度。
5. 在代码审查中找出所有 `volatile` 变量，判断是否真的需要锁。

## 检查清单

- [ ] 能识别共享可变数据的读写者。
- [ ] 知道 `volatile` 不能替代原子操作。
- [ ] 临界区只保护必要的几行代码。
- [ ] 中断和任务使用正确的同步 API。
- [ ] 共享缓冲区的所有权和生命周期写清楚。

