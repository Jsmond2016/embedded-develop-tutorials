---
title: 5.5 Buildroot 与 systemd
description: 构建可复现的根文件系统并管理设备服务
---

# 5.5 Buildroot 与 systemd

> 本节目标：用 Buildroot 生成最小根文件系统，编写 systemd 服务，并理解只读根文件系统和可写数据分区。

## Buildroot 是什么

Buildroot 用配置和 Makefile 构建：

- 交叉工具链。
- Bootloader。
- Linux 内核。
- 根文件系统。
- 应用程序和库。

优点：简单、产物小、可复现。Yocto 更灵活但学习曲线更陡。

## 基本流程

```bash
make menuconfig
make
```

关键配置：

```text
Target options -> Target Architecture -> AArch64
Toolchain -> External toolchain / Buildroot toolchain
System configuration -> Root filesystem overlay
System configuration -> Init system -> systemd
Target packages -> Networking applications -> mosquitto
```

产物在 `output/images/`：

```text
Image
rootfs.ext4
rootfs.tar
```

## 根文件系统覆盖层

```text
board/myboard/rootfs-overlay/
├── etc/systemd/system/app.service
├── etc/app/config.json
└── usr/bin/app
```

在 `menuconfig` 配置 overlay 路径，Buildroot 会把它复制进 rootfs。

## systemd 服务

```ini
[Unit]
Description=Embedded gateway service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/app
Restart=on-failure
RestartSec=3
WorkingDirectory=/data
User=app
Environment=APP_CONFIG=/etc/app/config.json

[Install]
WantedBy=multi-user.target
```

启用：

```bash
systemctl enable app.service
systemctl start app.service
systemctl status app.service
journalctl -u app.service -f
```

## 只读根文件系统

产品设备推荐：

```text
/        只读 rootfs
/data    可写数据分区
/tmp     tmpfs
/var/log  tmpfs 或受控日志分区
```

好处：断电不易损坏系统，升级可整镜像替换。应用不能把配置、数据库和日志写到 `/usr` 或 `/etc`。

## 升级策略

- A/B 双分区：新镜像写入备用分区，验证后切换。
- 单分区 + overlay：简单但恢复能力弱。
- 配置和数据单独分区，升级不覆盖。
- 启动失败自动回滚。

## 常见坑

- 把运行时数据写进只读 rootfs。
- 服务没有 `Restart`，崩溃后不恢复。
- 依赖网络但没配置 `network-online.target`。
- journald 无限制增长，写满存储。
- Buildroot 配置没有版本化，无法复现。

## 动手实验

1. 用 Buildroot 构建树莓派镜像。
2. 添加一个自定义应用和 systemd 服务。
3. 把 rootfs 改为只读，数据写入 `/data`。
4. 用 `journalctl` 查看服务日志。
5. 模拟应用崩溃，验证自动重启。

## 检查清单

- [ ] 能用 Buildroot 构建可启动镜像。
- [ ] 能把应用和服务放入 rootfs overlay。
- [ ] 会编写 systemd unit 并设置重启策略。
- [ ] 理解只读 rootfs + 可写数据分区。
- [ ] 知道 A/B 升级和回滚的基本流程。

