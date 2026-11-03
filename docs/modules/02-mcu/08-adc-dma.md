---
title: 2.8 ADC、DMA 与采样
description: 把模拟信号稳定、连续地搬进内存
---

# 2.8 ADC、DMA 与采样

> 本节目标：理解 ADC 的参考电压、分辨率、采样时间和噪声，能用 DMA 做连续采样并设计简单的数字滤波。

## ADC 的基本公式

12 位 ADC、参考电压 3.3 V：

```text
voltage = raw / 4095 × 3.3 V
```

| raw | 电压 |
| ---: | ---: |
| 0 | 0 V |
| 2048 | 约 1.65 V |
| 4095 | 3.3 V |

实际精度受参考电压、采样时间、输入阻抗、噪声和校准影响。不要假设“12 位”就等于 12 位有效精度。

## 采样时间

采样时间太短，采样电容来不及充到输入电压，读数会偏低或不稳定。高阻抗信号源需要更长采样时间，必要时加运放缓冲。

```c
ADC_ChannelConfTypeDef ch = {0};
ch.Channel = ADC_CHANNEL_0;
ch.Rank = 1;
ch.SamplingTime = ADC_SAMPLETIME_84CYCLES;
ch.Offset = 0;
HAL_ADC_ConfigChannel(&hadc1, &ch);
```

## DMA 连续采样

```c
#define ADC_BUFFER_SIZE 256

static uint16_t adc_buffer[ADC_BUFFER_SIZE];

HAL_ADC_Start_DMA(&hadc1, (uint32_t *)adc_buffer, ADC_BUFFER_SIZE);
```

DMA 在后台把每次转换结果写入数组，CPU 不需要逐次读取。常见模式：

- **Normal**：采完一轮停止，适合单次采集。
- **Circular**：循环覆盖，适合连续监测。

循环模式下，半传输（HT）和传输完成（TC）回调可以形成双缓冲：

```c
void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc)
{
    process_samples(adc_buffer, ADC_BUFFER_SIZE / 2);
}

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc)
{
    process_samples(&adc_buffer[ADC_BUFFER_SIZE / 2], ADC_BUFFER_SIZE / 2);
}
```

处理时要注意 DMA 正在写另一半缓冲区，不能越界读取。

## 数字滤波

### 滑动平均

```c
static uint32_t window_sum;
static uint16_t window[16];
static size_t index;
static size_t count;

uint16_t moving_average(uint16_t sample)
{
    window_sum -= window[index];
    window[index] = sample;
    window_sum += sample;
    index = (index + 1U) % 16U;
    if (count < 16U) count++;
    return (uint16_t)(window_sum / count);
}
```

滑动平均简单，但会引入延迟，不适合快速变化信号。

### 中值滤波

取最近 N 个样本的中位数，能抑制尖峰噪声。N 通常取 3、5、7，计算量比平均大。

### 一阶低通

```c
filtered = filtered + alpha * (sample - filtered);
```

`alpha` 越小越平滑，但响应越慢。定点实现时用整数移位代替浮点。

## 采样率与混叠

采样率必须至少是信号最高频率的两倍（奈奎斯特）。工程上通常更高，并在 ADC 前做模拟低通滤波。否则高频噪声会混叠成低频假信号。

## 常见坑

- 参考电压不稳，读数随负载变化。
- 采样时间太短，高阻抗信号读数偏低。
- DMA 缓冲区被 CPU 和 DMA 同时写。
- 在 DMA 回调里做耗时处理，导致下一次传输开始前没处理完。
- 忽略 ADC 校准和内部通道。
- 把原始值直接当电压使用。

## 动手实验

1. 用 ADC 读取电位器，串口打印原始值和电压。
2. 改用 DMA 循环采样，比较 CPU 占用。
3. 给信号叠加噪声，比较平均、中值、低通三种滤波。
4. 修改采样时间，观察高阻抗信号的变化。
5. 用逻辑分析仪观察 ADC 触发和 DMA 传输节奏。

## 检查清单

- [ ] 能根据参考电压和分辨率换算电压。
- [ ] 知道采样时间与信号源阻抗的关系。
- [ ] 能配置 ADC + DMA 循环采样。
- [ ] 能实现至少一种数字滤波。
- [ ] 理解双缓冲和 DMA 写入边界。

