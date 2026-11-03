---
title: 完整课程大纲
description: 从 Web 到硬件的嵌入式转型课程总纲
---

# 完整课程大纲

::: tip 想看逐节内容？
本页是课程设计总纲；按章节学习请进入 [课程总览](/modules/)，那里可以直接跳到任意一节。
:::

## 课程定位

课程名：**从 Web 到硬件：前端工程师的嵌入式转型实战**。

目标岗位包括 MCU 固件工程师、RTOS 应用工程师、IoT/边缘网关工程师，以及嵌入式 Linux 应用与驱动入门岗位。

默认主线：

> STM32 裸机 → FreeRTOS → ESP32 联网 → 嵌入式 Linux 入门 → 综合项目

课程不追求“会接一百种传感器”，而是让读者掌握 C、内存、启动流程、GPIO、中断、定时器、DMA、UART、I2C、SPI、FreeRTOS、通信协议、OTA、嵌入式 Linux 和工程化交付。

## 设计原则

- 岗位能力倒推，不按芯片手册目录堆知识点。
- 一条主线，两个扩展：STM32 + FreeRTOS 是核心，ESP32 负责联网，Linux 作为进阶。
- 每章都有可验证产出：代码、实验现象、测量数据、故障复现和面试题。
- 重视故障演练：HardFault、栈溢出、I2C 锁死、看门狗复位和竞态条件。
- 复用前端优势：事件循环、异步、调试、工程化、HTTP/MQTT 与 Web 可视化。
- 不回避底层：Arduino 可以作为玩具，但不作为主线。

## 前端经验迁移表

| 前端经验 | 嵌入式对应能力 | 迁移重点 |
| --- | --- | --- |
| JavaScript 事件循环 | 超级循环、RTOS 调度 | 非阻塞、任务切换和延迟 |
| Promise/async | 中断 + 队列 + 状态机 | 事件驱动与异步拆分 |
| DOM 事件 | GPIO 中断、定时器事件 | 事件源、回调、去抖 |
| REST/WebSocket | UART、Modbus、MQTT | 帧格式、校验、超时、重试 |
| npm/pnpm | CMake、交叉工具链 | 依赖、构建、产物管理 |
| Chrome DevTools | GDB、OpenOCD、逻辑分析仪 | 断点、寄存器、时序观测 |
| TypeScript 类型 | C 类型、静态分析 | 边界检查与类型安全 |
| Jest/Vitest | Unity/CMock | 主机端单元测试 |
| React 组件化 | HAL/驱动/业务分层 | 抽象边界与可移植性 |

## 学习路线

| 阶段 | 周期 | 核心内容 | 阶段产出 |
| --- | ---: | --- | --- |
| 0. 认知与环境 | 1 周 | 岗位地图、工具链、第一个固件 | 点灯 + 串口输出 + GDB 调试 |
| 1. C 与底层思维 | 4 周 | 编译链接、指针、内存、状态机、测试 | 主机端 C 工具库 |
| 2. MCU 与外设 | 5 周 | GPIO、中断、定时器、ADC、DMA、通信接口 | 裸机环境监测节点 |
| 3. RTOS | 4 周 | FreeRTOS 任务、同步、通信、故障处理 | 多任务监测仪 |
| 4. 通信与 IoT | 3 周 | 串口协议、MQTT、TLS、OTA、网关 | MCU + 网关 + Web 仪表盘 |
| 5. 嵌入式 Linux | 3 周 | 交叉编译、启动流程、设备树、驱动入门 | Linux 边缘网关服务 |
| 6. 工程化与量产 | 2 周 | 测试、CI、OTA、可靠性、安全 | 可交付的产品原型 |
| 7. 求职与复盘 | 1 周 | 简历、作品集、面试、模拟排障 | 求职材料 + 面试题库 |

## 详细大纲

### 第 0 部分：转型认知与环境搭建

- [0.1 嵌入式岗位地图](/modules/00-orientation/01-role-map)
- [0.2 前端工程师的优势、短板和补齐路径](/modules/00-orientation/02-frontend-gap)
- [0.3 学习路线、硬件清单与实验安全](/modules/00-orientation/03-roadmap-hardware)
- [0.4 工具链安装与环境配置](/modules/00-orientation/04-toolchain)
- [0.5 第一个固件：点灯、串口与调试](/modules/00-orientation/05-first-firmware)
- [0.6 如何阅读数据手册、原理图与错误码](/modules/00-orientation/06-datasheet-schematic)
- [0.7 建立代码仓库、实验记录与排障日志](/modules/00-orientation/07-repo-log)

### 第 1 部分：C 语言与底层思维

- [1.1 C 的编译模型](/modules/01-c-foundation/01-compile-model)
- [1.2 类型、作用域与生命周期](/modules/01-c-foundation/02-types-scope)
- [1.3 指针、数组、函数指针与回调](/modules/01-c-foundation/03-pointers-callbacks)
- [1.4 内存布局](/modules/01-c-foundation/04-memory-layout)
- [1.5 对齐、填充与大小端](/modules/01-c-foundation/05-alignment-endian)
- [1.6 位运算、寄存器与 volatile](/modules/01-c-foundation/06-bit-register)
- [1.7 状态机、环形缓冲区与命令解析器](/modules/01-c-foundation/07-state-machine-ring-buffer)
- [1.8 防御式 C](/modules/01-c-foundation/08-defensive-c)
- [1.9 可重入、原子性与竞态](/modules/01-c-foundation/09-reentrancy-race)
- [1.10 主机端测试](/modules/01-c-foundation/10-host-testing)

### 第 2 部分：MCU 原理与外设

- [2.1 电学最小集](/modules/02-mcu/01-electricity)
- [2.2 LED 限流与按键消抖](/modules/02-mcu/02-led-button)
- [2.3 读原理图与数据手册](/modules/02-mcu/03-schematic-datasheet)
- [2.4 Cortex-M 架构](/modules/02-mcu/04-cortex-m)
- [2.5 链接脚本、启动流程与 Map 文件](/modules/02-mcu/05-linker-startup)
- [2.6 GPIO、EXTI 与 NVIC](/modules/02-mcu/06-gpio-exti-nvic)
- [2.7 定时器、PWM 与输入捕获](/modules/02-mcu/07-timer-pwm)
- [2.8 ADC、DMA 与采样](/modules/02-mcu/08-adc-dma)
- [2.9 UART、I2C 与 SPI](/modules/02-mcu/09-uart-i2c-spi)
- [2.10 看门狗、RTC 与低功耗](/modules/02-mcu/10-watchdog-rtc-lowpower)
- [2.11 HAL、LL 与裸寄存器](/modules/02-mcu/11-hal-ll-register)

### 第 3 部分：FreeRTOS 与系统设计

- [3.1 为什么需要 RTOS](/modules/03-rtos/01-why-rtos)
- [3.2 任务、调度器与优先级](/modules/03-rtos/02-task-scheduler)
- [3.3 队列、信号量与互斥量](/modules/03-rtos/03-queue-sync)
- [3.4 中断与任务通信](/modules/03-rtos/04-isr-communication)
- [3.5 栈、堆与静态分配](/modules/03-rtos/05-stack-heap)
- [3.6 优先级反转、死锁与饥饿](/modules/03-rtos/06-priority-inversion)
- [3.7 软件定时器与事件驱动](/modules/03-rtos/07-timers-events)
- [3.8 故障处理与现场保护](/modules/03-rtos/08-fault-handling)
- [3.9 资源与性能预算](/modules/03-rtos/09-resource-budget)
- [3.10 架构设计模式](/modules/03-rtos/10-design-patterns)

### 第 4 部分：通信协议与 IoT

- [4.1 串行通信与网络通信](/modules/04-iot/01-serial-vs-network)
- [4.2 帧设计、校验与可靠性](/modules/04-iot/02-framing-protocol)
- [4.3 Modbus RTU](/modules/04-iot/03-modbus)
- [4.4 CAN 与 CAN FD 基础](/modules/04-iot/04-can)
- [4.5 Wi-Fi、BLE 与配网](/modules/04-iot/05-wifi-ble)
- [4.6 MQTT、TLS 与 QoS](/modules/04-iot/06-mqtt-tls)
- [4.7 边缘网关设计](/modules/04-iot/07-edge-gateway)
- [4.8 设备安全](/modules/04-iot/08-security)
- [4.9 设备可观测性](/modules/04-iot/09-observability)

### 第 5 部分：嵌入式 Linux 入门

- [5.1 MCU 与嵌入式 Linux 的差异](/modules/05-linux/01-mcu-vs-linux)
- [5.2 交叉编译与 sysroot](/modules/05-linux/02-cross-compile)
- [5.3 启动流程](/modules/05-linux/03-boot-flow)
- [5.4 设备树与用户空间接口](/modules/05-linux/04-device-tree)
- [5.5 Buildroot 与 systemd](/modules/05-linux/05-buildroot-systemd)
- [5.6 Linux 内核模块入门](/modules/05-linux/06-kernel-module)
- [5.7 Linux 调试工具](/modules/05-linux/07-debug-tools)
- [5.8 部署、只读根文件系统与 OTA](/modules/05-linux/08-deploy-ota)

### 第 6 部分：工程化与产品交付

- [6.1 需求、软硬件接口与架构](/modules/06-engineering/01-requirements-architecture)
- [6.2 版本管理、可复现构建与 CI](/modules/06-engineering/02-version-ci)
- [6.3 测试策略与故障注入](/modules/06-engineering/03-testing)
- [6.4 OTA 与回滚](/modules/06-engineering/04-ota)
- [6.5 可靠性与失效分析](/modules/06-engineering/05-reliability)
- [6.6 安全与合规基础](/modules/06-engineering/06-security-compliance)
- [6.7 文档、BOM 与生产交付](/modules/06-engineering/07-docs-production)

### 第 7 部分：求职与面试

- [7.1 简历改造](/modules/07-career/01-resume)
- [7.2 作品集建设](/modules/07-career/02-portfolio)
- [7.3 嵌入式面试题库](/modules/07-career/03-interview-bank)
- [7.4 模拟排障面试](/modules/07-career/04-debug-interview)
- [7.5 入职 30/60/90 天计划](/modules/07-career/05-onboarding)
- [7.6 岗位选择与投递策略](/modules/07-career/06-job-search)

## 实战项目

- [P1 主机端 C 工具库](/projects/01-host-c-toolkit)
- [P2 裸机环境监测节点](/projects/02-sensor-node)
- [P3 FreeRTOS 环境监测仪](/projects/03-rtos-monitor)
- [P4 IoT 网关与 Web 仪表盘](/projects/04-iot-gateway)
- [P5 综合项目：低功耗环境监测终端](/projects/05-capstone)

## 验收标准

- `pnpm docs:build` 可以正常构建。
- 本地搜索可用，导航覆盖全部章节。
- 每章有学习目标、原理、代码、实验、排障和检查清单。
- 所有实验使用低压直流，附安全提示。
- 代码示例与文档分离，便于测试和复用。

