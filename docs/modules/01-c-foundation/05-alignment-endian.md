---
title: 1.5 对齐、填充与大小端
description: 理解结构体布局和协议字节序，避免跨平台数据错误
---

# 1.5 对齐、填充与大小端

> 本节目标：能预测结构体大小和字段偏移，理解大小端差异，并写出不依赖编译器布局的协议序列化代码。

## 对齐规则

CPU 通常要求变量地址是其对齐边界的整数倍。例如 32 位整数通常要求 4 字节对齐。编译器会在结构体字段之间插入填充字节。

```c
#include <stdint.h>
#include <stddef.h>

typedef struct {
    uint8_t  type;
    uint32_t value;
    uint16_t crc;
} packet_t;
```

在常见的 32 位 ARM 上，布局可能是：

```text
offset 0: type
offset 1: padding
offset 2: padding
offset 3: padding
offset 4: value
offset 8: crc
offset 10: padding
offset 12: 结构体大小
```

`sizeof(packet_t)` 很可能是 12，而不是 7。字段顺序会影响大小。

## 验证布局

```c
#include <stddef.h>

_Static_assert(offsetof(packet_t, type) == 0, "type offset");
_Static_assert(offsetof(packet_t, value) == 4, "value offset");
_Static_assert(offsetof(packet_t, crc) == 8, "crc offset");
_Static_assert(sizeof(packet_t) == 12, "packet size");
```

`_Static_assert` 在编译期检查，比运行时 `assert` 更适合验证 ABI 和协议布局。

## 重新排列字段

```c
typedef struct {
    uint32_t value;
    uint16_t crc;
    uint8_t  type;
} packed_better_t;
```

按对齐从大到小排列，可能把大小从 12 降到 8。代价是逻辑顺序变化，必须评估可读性。

## `packed` 的风险

```c
typedef struct __attribute__((packed)) {
    uint8_t  type;
    uint32_t value;
} wire_packet_t;
```

`packed` 可以消除填充，但可能产生非对齐访问。在某些架构上，非对齐访问会变慢、触发异常或需要编译器生成额外的字节访问代码。不要为了“省几个字节”随意给所有结构体加 `packed`。

## 大小端

以 `0x12345678` 为例：

```text
大端：12 34 56 78
小端：78 56 34 12
```

ARM Cortex-M 常见配置是小端，但网络协议通常使用大端。跨设备通信时，必须明确线上字节序。

## 显式序列化

不要直接把结构体指针强转成字节流发送：

```c
send(&packet, sizeof(packet)); /* 依赖填充、对齐和字节序 */
```

推荐逐字段序列化：

```c
static void put_u16_be(uint8_t *out, uint16_t value)
{
    out[0] = (uint8_t)(value >> 8);
    out[1] = (uint8_t)(value & 0xFFU);
}

static void put_u32_be(uint8_t *out, uint32_t value)
{
    out[0] = (uint8_t)(value >> 24);
    out[1] = (uint8_t)(value >> 16);
    out[2] = (uint8_t)(value >> 8);
    out[3] = (uint8_t)(value & 0xFFU);
}

uint8_t frame[7];
frame[0] = packet.type;
put_u32_be(&frame[1], packet.value);
put_u16_be(&frame[5], packet.crc);
```

这样无论编译器如何填充、MCU 使用什么字节序，线上格式都稳定。

## 常见坑

- 假设 `sizeof(struct)` 等于字段大小之和。
- 用 `memcmp` 比较含填充字节的结构体。
- 直接把结构体写入 Flash 或通过串口发送。
- 在协议中混用主机字节序和网络字节序。
- 对非对齐指针做 `uint32_t *` 解引用。

## 动手实验

1. 打印 `packet_t` 的 `sizeof` 和每个字段偏移。
2. 调整字段顺序，观察大小变化。
3. 用 `packed` 版本比较大小和访问方式。
4. 写一个 `put_u32_be` 和一个 `get_u32_be`，用测试验证边界值。
5. 在 x86 主机和 ARM 目标上分别运行字节序检测。

## 检查清单

- [ ] 能解释结构体填充产生的原因。
- [ ] 会用 `offsetof` 和 `_Static_assert` 固定布局。
- [ ] 知道 `packed` 可能带来的性能和异常风险。
- [ ] 能区分主机字节序和网络字节序。
- [ ] 协议数据使用显式序列化而不是结构体强转。

