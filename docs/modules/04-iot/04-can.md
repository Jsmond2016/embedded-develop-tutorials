---
title: 4.4 CAN 与 CAN FD 基础
description: 理解差分总线、仲裁、帧格式和验收滤波
---

# 4.4 CAN 与 CAN FD 基础

> 本节目标：掌握 CAN 的物理层约束、报文仲裁、标准/扩展帧和基本发送接收，能读懂汽车与工业设备的总线数据。

## CAN 的特点

- 差分总线，抗干扰能力强。
- 多主仲裁，不需要单独主机轮询。
- 报文按 ID 优先级仲裁，而不是按节点地址。
- 硬件自动重发、错误计数和总线关闭。
- 常用于汽车、电机、电池管理、工业控制。

## 物理层

```text
CAN_H ── 120Ω ── CAN_H ── 节点 ── ... ── 120Ω ── CAN_H
CAN_L ────────── CAN_L ── 节点 ── ... ────────── CAN_L
```

- 总线两端各一个 120 Ω 终端电阻。
- 节点应短距离分支，避免星型拓扑。
- CAN 收发器负责把 MCU 的 TX/RX 转成差分信号。
- 共地、屏蔽、隔离在强干扰场景很重要。

## 仲裁

多个节点同时发送时，ID 数值越小优先级越高。节点逐位仲裁，发送显性位（0）的节点获胜，发送隐性位（1）的节点退出并等待重发。

因此：

- 高优先级报文使用更小的 ID。
- 低优先级大流量报文不能长期占满总线。
- ID 设计要结合业务优先级。

## 帧格式

标准帧使用 11 位 ID，扩展帧使用 29 位 ID。数据帧主要字段：

```text
SOF | ID | RTR | IDE | DLC | DATA(0..8) | CRC | ACK | EOF
```

CAN FD 支持更长数据（最多 64 字节）和更高比特率的数据段，但需要收发器和 MCU 都支持。

## HAL 发送示例

```c
CAN_TxHeaderTypeDef tx = {0};
uint8_t data[8] = {0x01, 0x02, 0x03, 0x04};
uint32_t mailbox;

tx.StdId = 0x123;
tx.IDE = CAN_ID_STD;
tx.RTR = CAN_RTR_DATA;
tx.DLC = 4;

if (HAL_CAN_AddTxMessage(&hcan1, &tx, data, &mailbox) != HAL_OK) {
    /* 发送邮箱满或总线错误 */
}
```

## 接收与滤波

CAN 控制器通常有验收滤波器，只把关心的 ID 放入 FIFO，减少 CPU 负担。

```c
CAN_FilterTypeDef filter = {0};
filter.FilterBank = 0;
filter.FilterMode = CAN_FILTERMODE_IDMASK;
filter.FilterScale = CAN_FILTERSCALE_32BIT;
filter.FilterIdHigh = 0x123 << 5;
filter.FilterMaskIdHigh = 0x7FF << 5;
filter.FilterFIFOAssignment = CAN_RX_FIFO0;
filter.FilterActivation = ENABLE;
HAL_CAN_ConfigFilter(&hcan1, &filter);
```

接收中断中读取报文并投递到队列：

```c
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan)
{
    CAN_RxHeaderTypeDef rx;
    uint8_t data[8];
    if (HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &rx, data) == HAL_OK) {
        can_frame_t frame = { .id = rx.StdId, .dlc = rx.DLC };
        memcpy(frame.data, data, rx.DLC);
        xQueueSendFromISR(can_rx_queue, &frame, NULL);
    }
}
```

## 错误状态

- 主动错误、被动错误、总线关闭。
- 发送失败可能因为仲裁丢失、ACK 错误、位错误。
- 总线关闭后需要恢复流程。
- 错误计数器要暴露到日志和指标。

## 常见坑

- 终端电阻缺失或两端都装成 60 Ω。
- 波特率不一致。
- ID 设计没有优先级。
- 发送邮箱满时丢帧不记录。
- 在接收中断里做协议解析和日志。
- 忽略 CAN FD 的收发器兼容性。

## 动手实验

1. 用两个 CAN 节点互相发送标准帧。
2. 改变 ID，观察仲裁优先级。
3. 拔掉终端电阻，观察错误帧和通信失败。
4. 配置验收滤波，只接收指定 ID。
5. 用 CAN 分析仪抓包，解码周期报文。

## 检查清单

- [ ] 知道 CAN 差分总线和终端电阻要求。
- [ ] 能解释 ID 仲裁机制。
- [ ] 能配置标准帧发送和验收滤波。
- [ ] 能处理发送邮箱满和总线错误。
- [ ] 接收中断只做最小数据搬运。

