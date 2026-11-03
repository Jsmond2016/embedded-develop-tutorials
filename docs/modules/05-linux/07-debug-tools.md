---
title: 5.7 Linux 调试工具
description: 从内核日志到进程、系统调用和性能热点
---

# 5.7 Linux 调试工具

> 本节目标：掌握嵌入式 Linux 上最常用的诊断命令和工具，形成从现象到根因的排查路径。

## 先分层定位

```text
硬件/驱动 -> 内核 -> 系统服务 -> 应用 -> 网络
```

不要一上来就改代码。先确认问题在哪一层。

## 内核日志

```bash
dmesg -T | tail -100
dmesg -w
journalctl -k -b
```

关注：

- 驱动 probe 失败。
- I2C/SPI 超时。
- OOM、hung task、watchdog。
- 存储 I/O 错误。
- USB/网络设备枚举。

## 服务日志

```bash
systemctl status app
journalctl -u app -f
journalctl -b -p err
```

检查服务依赖、权限、工作目录和重启次数。

## 进程与系统调用

```bash
ps aux
top -H
pidstat -p <pid> 1
strace -f -p <pid>
strace -T -e trace=openat,read,write ./app
```

`strace` 能看出程序在等什么、访问了哪个文件、哪个 ioctl 失败。

## 文件与端口

```bash
lsof -p <pid>
ss -lntp
netstat -anp
```

常见问题：配置文件路径错、端口被占、权限不足。

## 性能分析

```bash
perf top
perf record -g ./app
perf report
```

内核函数追踪：

```bash
trace-cmd record -p function_graph -g app
trace-cmd report
```

或用 ftrace：

```bash
echo function > /sys/kernel/debug/tracing/current_tracer
cat /sys/kernel/debug/tracing/trace
```

## 硬件接口调试

```bash
i2cdetect -y 1
i2cget -y 1 0x38 0x00
gpiodetect
gpioinfo
spi-config -d /dev/spidev0.0
```

网络：

```bash
ip addr
ip route
ping -c 3 8.8.8.8
tcpdump -i eth0 -nn port 1883
```

## GDB

目标板上运行 `gdbserver`：

```bash
gdbserver :2345 /usr/bin/app
```

主机上：

```bash
gdb-multiarch /path/to/app
(gdb) target remote <board-ip>:2345
(gdb) break main
(gdb) continue
```

需要匹配的调试符号和架构。

## 常见排查路径

| 现象 | 优先检查 |
| --- | --- |
| 服务起不来 | `systemctl status`、`journalctl`、权限、路径 |
| CPU 100% | `top -H`、`perf top`、忙等/死循环 |
| 内存增长 | `ps`、`smem`、泄漏、缓存 |
| I/O 卡顿 | `iostat`、`dmesg`、存储错误 |
| 网络不通 | `ip`、路由、DNS、`tcpdump` |
| 设备节点缺失 | 驱动 probe、设备树、`dmesg` |

## 检查清单

- [ ] 能用 `dmesg`/`journalctl` 看内核和服务日志。
- [ ] 能用 `strace` 定位系统调用失败。
- [ ] 能用 `perf`/`ftrace` 找性能热点。
- [ ] 能用 i2c-tools/libgpiod 验证硬件接口。
- [ ] 能按层定位问题，而不是盲目改代码。

