---
title: 2.9 UART、I2C 与 SPI
description: 掌握三种最常用板级总线的时序、错误和驱动方式
---

# 2.9 UART、I2C 与 SPI

> 本节目标：能根据场景选择总线，读懂时序图，使用轮询、中断和 DMA 完成可靠通信。

## 三种总线对比

| 特性 | UART | I2C | SPI |
| --- | --- | --- | --- |
| 线数 | TX、RX、GND | SCL、SDA、GND | SCK、MOSI、MISO、CS、GND |
| 拓扑 | 点对点 | 多从机共享总线 | 多从机，独立片选 |
| 时钟 | 异步，双方约定波特率 | 主机提供 SCL | 主机提供 SCK |
| 速率 | 低到中 | 低到中 | 高 |
| 典型距离 | 板内/短距离 | 板内 | 板内 |
| 常见设备 | 调试口、GPS、模块 | 传感器、EEPROM | Flash、屏幕、ADC |

## UART

帧格式通常为：起始位 + 数据位 + 可选校验位 + 停止位。

```text
空闲高 ── 起始(0) ── D0 D1 D2 D3 D4 D5 D6 D7 ── 停止(1)
```

### 阻塞发送

```c
const uint8_t msg[] = "hello\r\n";
HAL_UART_Transmit(&huart2, (uint8_t *)msg, sizeof(msg) - 1U, 100U);
```

适合启动日志和低频调试输出，不适合在主循环里长时间阻塞。

### 中断接收

```c
static uint8_t rx_byte;

HAL_UART_Receive_IT(&huart2, &rx_byte, 1);

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    ring_buffer_push(&uart_rx_rb, rx_byte);
    HAL_UART_Receive_IT(huart, &rx_byte, 1);
}
```

中断接收要尽快把字节放入缓冲区，解析放到任务中。

### DMA 接收

固定长度协议可以用 `HAL_UART_Receive_DMA`。变长协议常用“空闲线检测 + DMA”：

1. DMA 持续写入接收缓冲区。
2. 总线空闲时触发 IDLE 中断。
3. 计算本次接收长度，提交给解析器。

### 常见错误

- 波特率不一致。
- TX/RX 接反。
- 电平不兼容（RS-232、TTL、RS-485）。
- 接收缓冲区溢出。
- 帧错误、噪声错误未处理。

## I2C

I2C 使用开漏线和上拉电阻，典型速率 100 kHz、400 kHz、1 MHz。

一次写操作：

```text
START -> 地址+W -> ACK -> 寄存器地址 -> ACK -> 数据 -> ACK -> STOP
```

一次读操作通常需要重复起始：

```text
START -> 地址+W -> ACK -> 寄存器地址 -> ACK
      -> 重复 START -> 地址+R -> ACK -> 数据 -> NACK -> STOP
```

```c
uint8_t cmd[3] = {0xAC, 0x33, 0x00};
HAL_I2C_Master_Transmit(&hi2c1, AHT20_ADDR << 1, cmd, sizeof(cmd), 100);
HAL_Delay(80);

uint8_t raw[6];
HAL_I2C_Master_Receive(&hi2c1, AHT20_ADDR << 1, raw, sizeof(raw), 100);
```

HAL 的地址参数通常需要左移一位，具体以库版本为准。

### I2C 常见问题

- 没有上拉或上拉过大，上升沿太慢。
- 地址是 7 位还是 8 位混淆。
- 从设备时钟拉伸导致超时。
- 总线被某个从设备拉低，需要发送 9 个时钟脉冲恢复。
- 多主竞争导致仲裁丢失。

总线恢复伪代码：

```c
/* 将 SCL 配为开漏输出，手动发送 9 个时钟，再发送 STOP */
```

## SPI

SPI 是全双工、主机提供时钟的总线。关键参数：

- **CPOL**：时钟空闲电平。
- **CPHA**：在第一个还是第二个边沿采样。
- **LSB/MSB**：位序。
- **CS**：片选，低有效最常见。

```c
uint8_t tx[2] = {0x9F, 0x00};
uint8_t rx[2] = {0};

HAL_GPIO_WritePin(FLASH_CS_GPIO_Port, FLASH_CS_Pin, GPIO_PIN_RESET);
HAL_SPI_TransmitReceive(&hspi1, tx, rx, sizeof(tx), 100);
HAL_GPIO_WritePin(FLASH_CS_GPIO_Port, FLASH_CS_Pin, GPIO_PIN_SET);
```

### SPI 常见问题

- CPOL/CPHA 不匹配，读回全 0 或全 1。
- CS 没有拉低或释放时机错误。
- 多从机共享 MISO 时没有正确片选。
- 时钟太快，超过从设备上限。
- 线太长导致信号完整性问题。

## 选型建议

- 调试日志、模块通信：UART。
- 多个低速传感器、线少：I2C。
- 高吞吐、屏幕、Flash：SPI。
- 长距离、抗干扰：RS-485/CAN，而不是 TTL UART。

## 动手实验

1. 用 UART 接收任意长度命令，验证环形缓冲区。
2. 用 I2C 读取 AHT20，逻辑分析仪解码地址和数据。
3. 用 SPI 读取 Flash ID，比较不同 CPOL/CPHA 的结果。
4. 人为断开 SDA，观察 I2C 总线锁死并实现恢复。
5. 把轮询 UART 改成 DMA + IDLE，比较 CPU 占用。

## 检查清单

- [ ] 能根据距离、速率和线数选择总线。
- [ ] 能读懂 UART/I2C/SPI 的基本时序。
- [ ] 能处理超时、校验、总线锁死和缓冲区溢出。
- [ ] 知道 HAL 地址参数和片选时序的常见陷阱。
- [ ] 会用逻辑分析仪验证协议。

