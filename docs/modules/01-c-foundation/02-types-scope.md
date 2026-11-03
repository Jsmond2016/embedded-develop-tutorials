---
title: 1.2 类型、作用域与生命周期
description: 用固定宽度类型、存储类和边界规则写出可预测的 C 代码
---

# 1.2 类型、作用域与生命周期

> 本节目标：掌握 C 的类型系统、作用域、存储期和整数规则，避免“看起来能跑”的隐式转换与生命周期错误。

## 固定宽度类型

嵌入式代码应优先使用 `<stdint.h>` 中的固定宽度类型：

```c
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

uint8_t  status;
int16_t  temperature_x10;
uint32_t tick_ms;
size_t   length;
bool     ready;
```

`int` 的宽度依赖平台，不适合描述协议字段或硬件寄存器。涉及二进制格式时，使用 `uint8_t`、`uint16_t`、`uint32_t`，并明确字节序。

## 作用域与存储期

| 写法 | 作用域 | 生命周期 | 常见用途 |
| --- | --- | --- | --- |
| 局部变量 | 函数/块内 | 自动，函数返回即失效 | 临时计算 |
| `static` 局部变量 | 函数内 | 整个程序运行期 | 保留状态，但不可重入 |
| 全局变量 | 整个编译单元/链接范围 | 程序运行期 | 谨慎使用 |
| `static` 全局变量 | 当前编译单元 | 程序运行期 | 模块私有状态 |
| `extern` 声明 | 引用其他文件定义 | 由定义决定 | 跨模块共享 |

## 示例：模块私有状态

```c
/* sensor.c */
#include "sensor.h"

static uint32_t s_last_sample_ms;
static sensor_state_t s_state = SENSOR_IDLE;

void sensor_tick(uint32_t now_ms)
{
    if ((now_ms - s_last_sample_ms) < SENSOR_PERIOD_MS) {
        return;
    }
    s_last_sample_ms = now_ms;
    s_state = SENSOR_SAMPLING;
}
```

`static` 让状态只属于当前模块，避免命名冲突和外部随意修改。代价是模块不再天然可重入；如果多个任务共享它，必须加锁或改成显式上下文对象。

## `const` 与指针组合

```c
const uint8_t *p1;        /* 指向的数据不可改，指针可改 */
uint8_t * const p2;       /* 指针不可改，数据可改 */
const uint8_t * const p3; /* 两者都不可改 */
```

驱动接口应该尽量使用 `const` 表达只读意图，例如：

```c
int uart_write(const uint8_t *data, size_t length);
```

## 整数提升与溢出

```c
uint8_t a = 200;
uint8_t b = 100;
uint16_t sum = a + b;      /* 结果通常是 int，再赋值给 uint16_t */

uint32_t now = 0xFFFFFFFFU;
uint32_t later = now + 10U; /* 无符号回绕，结果为 9 */
```

无符号回绕在计时场景中是可利用特性，但有符号溢出是未定义行为。不要依赖编译器“碰巧”产生某个结果。

推荐写法：

```c
if (value > UINT16_MAX - delta) {
    return ERR_OVERFLOW;
}
```

## 枚举与状态

```c
typedef enum {
    DEVICE_IDLE = 0,
    DEVICE_CONNECTING,
    DEVICE_ONLINE,
    DEVICE_ERROR
} device_state_t;
```

不要把枚举直接当协议字节发送，除非你明确固定了底层类型并处理了编译器差异。协议字段应使用固定宽度整数，并写显式的序列化函数。

## 生命周期错误

```c
int *bad_pointer(void)
{
    int local = 42;
    return &local;          /* 返回后栈帧失效 */
}

char *bad_string(void)
{
    char buffer[16] = "hello";
    return buffer;          /* 同样悬空 */
}
```

嵌入式里还常见“缓冲区在中断和任务之间共享，但生命周期没有约定”的问题。谁分配、谁释放、谁拥有，必须在接口注释中写清楚。

## 动手实验

1. 用 `sizeof` 打印 `int`、`long`、指针和结构体大小。
2. 写一个函数，把 `uint32_t` 毫秒计数器回绕前后的差值算对。
3. 把模块状态从全局变量改成显式上下文结构体，比较可测试性。
4. 用 `-Wconversion -Wsign-conversion` 编译，观察隐式转换警告。

## 检查清单

- [ ] 协议和寄存器字段使用固定宽度类型。
- [ ] 能区分作用域、存储期和链接属性。
- [ ] 知道 `static` 局部变量为什么不可重入。
- [ ] 能解释无符号回绕与有符号溢出的区别。
- [ ] 不会返回局部变量的地址。

