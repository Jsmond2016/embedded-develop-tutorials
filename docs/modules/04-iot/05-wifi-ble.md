---
title: 4.5 Wi-Fi、BLE 与配网
description: 让设备安全接入网络，并设计可用的首次配置体验
---

# 4.5 Wi-Fi、BLE 与配网

> 本节目标：理解 ESP32 的 Wi-Fi/BLE 角色、配网流程、功耗和常见故障，能把联网模块集成进产品。

## 两种常见集成方式

- **MCU + AT 模组**：STM32 通过 UART 发 AT 命令，模组负责 Wi-Fi/TCP/MQTT。开发快，控制力弱。
- **ESP32 直接开发**：使用 ESP-IDF，Wi-Fi、BLE、MQTT 都在同一颗芯片。集成度高，需要学习新框架。

本课程主线用 STM32 学底层，再用 ESP32 学联网，避免把两者混在一起增加调试难度。

## Wi-Fi Station 模式

设备作为 STA 连接路由器：

```c
wifi_config_t config = {
    .sta = {
        .ssid = CONFIG_WIFI_SSID,
        .password = CONFIG_WIFI_PASSWORD,
        .threshold.authmode = WIFI_AUTH_WPA2_PSK,
    },
};

ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &config));
ESP_ERROR_CHECK(esp_wifi_start());
ESP_ERROR_CHECK(esp_wifi_connect());
```

连接结果通过事件回调获得：

```c
static void wifi_event_handler(void *arg, esp_event_base_t base,
                               int32_t id, void *data)
{
    if (base == WIFI_EVENT && id == WIFI_EVENT_STA_DISCONNECTED) {
        schedule_reconnect();
    }
    if (base == IP_EVENT && id == IP_EVENT_STA_GOT_IP) {
        network_ready();
    }
}
```

不要在事件回调里长时间阻塞，重连交给状态机或任务。

## 配网

产品不能要求用户改代码填 SSID。常见方案：

- SoftAP：设备开热点，手机连接后提交 Wi-Fi 信息。
- BLE：手机通过 GATT 写入 Wi-Fi 凭据。
- SmartConfig：手机广播编码后的凭据。
- 二维码：设备摄像头或手机扫码。

配网流程要处理：

- 超时退出。
- 凭据校验失败。
- 连接失败重试。
- 配网期间的状态提示。
- 恢复出厂设置。

## BLE GATT

BLE 常用 GATT 服务/特征值模型：

```text
Device Info Service
  └── Manufacturer Name (read)
Provisioning Service
  ├── SSID (write)
  ├── Password (write)
  └── Status (read/notify)
```

注意：

- 密码不要长期明文存储。
- 写入需要长度和格式校验。
- 状态用 notify 告知手机。
- 配网完成后关闭广播，降低功耗和攻击面。

## 功耗

Wi-Fi 的峰值电流可能达到数百 mA，平均功耗取决于：

- 连接间隔/心跳。
- 发射功率。
- 省电模式（modem sleep、light sleep、deep sleep）。
- 重连频率。

电池设备要测量峰值和平均值，并确保电源和电容能支撑峰值电流。

## 常见问题

- SSID/密码错误或路由器只支持 5 GHz。
- 认证方式不匹配。
- 天线布局差，信号弱导致频繁重连。
- DNS/时间未同步，TLS 握手失败。
- 配网后没有保存凭据。
- BLE 连接后未关闭广播。

## 动手实验

1. 用 ESP32 连接手机热点，打印 IP。
2. 实现断线重连状态机，记录重连次数。
3. 用 BLE 写入 SSID/密码并配网。
4. 测量 Wi-Fi 连接、发送、休眠时的电流。
5. 模拟路由器重启，观察设备恢复时间。

## 检查清单

- [ ] 能区分 STA、AP、BLE GATT 的角色。
- [ ] 配网流程有超时、校验和恢复出厂。
- [ ] Wi-Fi 断线由状态机处理，不在回调里阻塞。
- [ ] 知道 Wi-Fi 峰值电流对电源的影响。
- [ ] 配网完成后关闭不必要的广播和服务。

