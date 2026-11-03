---
title: 5.4 设备树与用户空间接口
description: 用设备树描述硬件，并在用户空间访问 GPIO、I2C 和 SPI
---

# 5.4 设备树与用户空间接口

> 本节目标：理解设备树如何描述硬件，能修改节点、匹配驱动，并使用 libgpiod/i2c-dev 操作外设。

## 设备树解决什么问题

同一颗 SoC 可以焊在不同板子上，外设连接不同。设备树把“板级硬件信息”从内核代码中分离出来：

```text
SoC dtsi + board dts + overlay -> DTB -> Kernel
```

内核驱动通过 `compatible` 匹配设备树节点，再读取 `reg`、`interrupts`、`gpios` 等属性。

## 一个 I2C 传感器节点

```text
&i2c1 {
    status = "okay";
    clock-frequency = <100000>;

    aht20: sensor@38 {
        compatible = "vendor,aht20";
        reg = <0x38>;
        vdd-supply = <&vcc_3v3>;
    };
};
```

- `&i2c1`：引用 SoC 的 I2C1 控制器。
- `status = "okay"`：启用控制器。
- `reg = <0x38>`：I2C 从地址。
- `compatible`：驱动匹配字符串。
- `vdd-supply`：电源调节器引用。

## GPIO 节点

```text
leds {
    compatible = "gpio-leds";

    led_status: led-status {
        label = "status";
        gpios = <&gpio1 5 GPIO_ACTIVE_HIGH>;
        linux,default-trigger = "heartbeat";
    };
};
```

驱动会解析 `gpios` 属性，用户空间可以通过 LED class 控制亮度。

## 设备树 overlay

不必修改基础 DTB，可以加载 overlay 增加节点：

```text
/dts-v1/;
/plugin/;

&i2c1 {
    status = "okay";
};
```

树莓派的 `config.txt` 支持 `dtoverlay=`，适合实验和产品变体。

## 用户空间访问 GPIO

旧接口 `/sys/class/gpio` 已逐步弃用，推荐 `libgpiod`：

```bash
gpiodetect
gpioinfo
gpioget gpiochip0 17
gpioset gpiochip0 17=1
```

C 代码：

```c
#include <gpiod.h>

struct gpiod_chip *chip = gpiod_chip_open_by_name("gpiochip0");
struct gpiod_line *line = gpiod_chip_get_line(chip, 17);
gpiod_line_request_output(line, "app", 0);
gpiod_line_set_value(line, 1);
```

## I2C 用户空间

加载 `i2c-dev` 后会出现 `/dev/i2c-1`。使用 `i2c-tools` 扫描和读写：

```bash
i2cdetect -y 1
i2cget -y 1 0x38 0x00
i2cset -y 1 0x38 0x00 0x01
```

C 代码使用 `ioctl(I2C_RDWR)` 或 `smbus` 接口。用户空间驱动适合原型和简单设备，复杂/高频设备仍应写内核驱动。

## 常见问题

- `compatible` 与驱动不匹配，probe 不执行。
- `status` 没有设为 `okay`。
- 引脚被其他功能占用。
- 设备树地址/中断号写错。
- 修改 DTB 后没有重启或加载 overlay。
- 用户空间权限不足，无法访问 `/dev/i2c-*` 或 gpiochip。

## 动手实验

1. 在树莓派上启用 I2C，运行 `i2cdetect`。
2. 写一个设备树 overlay，声明一个 GPIO LED。
3. 用 `libgpiod` 控制 LED。
4. 用 `i2c-tools` 读取传感器寄存器。
5. 查看 `/sys/firmware/devicetree` 确认节点已加载。

## 检查清单

- [ ] 知道设备树由 SoC dtsi、板级 dts 和 overlay 组成。
- [ ] 能读懂 `compatible`、`reg`、`status`、`gpios`。
- [ ] 能修改并加载 overlay。
- [ ] 会用 libgpiod 和 i2c-tools。
- [ ] 知道用户空间驱动与内核驱动的适用边界。
