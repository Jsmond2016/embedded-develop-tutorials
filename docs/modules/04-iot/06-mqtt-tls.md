---
title: 4.6 MQTT、TLS 与 QoS
description: 设计可靠的设备上报和云端控制通道
---

# 4.6 MQTT、TLS 与 QoS

> 本节目标：理解 MQTT 的发布/订阅模型、QoS、遗嘱消息、保留消息和 TLS 接入，能设计设备主题结构。

## MQTT 是什么

MQTT 是轻量级发布/订阅协议，设备通过 TCP/TLS 连接 Broker，向主题发布消息或订阅主题。

```text
设备 A ── publish sensor/room1/temp ──> Broker
Web    <── subscribe sensor/+/temp ──── Broker
```

优势：

- 设备和应用解耦。
- 主题支持通配符。
- 适合低带宽、不稳定网络。
- 支持 QoS、遗嘱和保留消息。

## 主题设计

推荐按层级组织：

```text
devices/{device_id}/telemetry
devices/{device_id}/status
devices/{device_id}/command
devices/{device_id}/command/ack
devices/{device_id}/ota
```

设备 ID 使用不可猜测的唯一标识，不要直接使用 MAC 地址作为安全凭据。

## QoS

| QoS | 语义 | 代价 |
| --- | --- | --- |
| 0 | 最多一次，可能丢 | 最低开销 |
| 1 | 至少一次，可能重复 | 需要去重 |
| 2 | 恰好一次 | 握手多、开销大 |

设备遥测常用 QoS 0 或 1；命令和 OTA 根据重要性选择 1/2，并做业务幂等和确认。

## 保留消息与遗嘱

- **Retained**：Broker 保存最后一条消息，新订阅者立即收到。适合设备状态快照。
- **LWT（Last Will）**：设备异常断开时 Broker 发布遗嘱。适合标记离线。

```text
status topic: devices/dev001/status
LWT payload: {"online":false,"reason":"connection_lost"}
```

## 保活与重连

- Keepalive 让 Broker 检测死连接。
- 设备要用心跳和业务超时检测半开连接。
- 断线后指数退避重连，避免雪崩。
- 重连后重新订阅命令主题。
- 离线期间缓存遥测，重连后批量补传。

## TLS

```text
设备 ── TCP ── TLS 握手 ── MQTT CONNECT
```

TLS 需要：

- 服务器证书校验。
- 设备信任的 CA。
- 正确的系统时间（证书有效期）。
- 足够的 RAM/Flash 和计算能力。
- 安全存储客户端证书/私钥。

不要关闭证书校验来“先跑通”，这会让中间人攻击变得容易。

## 设备端发布伪代码

```c
payload_t payload = {
    .temperature_x10 = 235,
    .humidity_x10 = 512,
    .timestamp = now_seconds(),
};

char json[128];
int len = snprintf(json, sizeof(json),
                   "{\"t\":%d,\"h\":%u,\"ts\":%lu}",
                   payload.temperature_x10,
                   payload.humidity_x10,
                   (unsigned long)payload.timestamp);

if (len > 0 && len < (int)sizeof(json)) {
    mqtt_publish("devices/dev001/telemetry", json, (size_t)len, QOS1);
}
```

## 常见坑

- 主题拼写错误，订阅端收不到。
- QoS 1 导致重复消息，业务没有去重。
- 设备断网后无限缓存，Flash 写穿。
- TLS 证书过期或时间不同步。
- 重连风暴拖垮 Broker。
- 命令没有 ACK，云端不知道是否执行。

## 动手实验

1. 用 Mosquitto 或 EMQX 搭建本地 Broker。
2. 设备发布遥测，Web 端订阅并显示。
3. 测试 QoS 0/1/2 的丢包和重复行为。
4. 配置 LWT，拔掉设备电源观察离线状态。
5. 启用 TLS，验证证书校验和错误日志。

## 检查清单

- [ ] 能设计清晰的设备主题结构。
- [ ] 知道 QoS 0/1/2 的语义和代价。
- [ ] 能使用 LWT 和 Retained 状态。
- [ ] 重连有退避和重新订阅。
- [ ] TLS 不关闭证书校验。

