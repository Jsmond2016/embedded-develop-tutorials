---
title: 课程总览
description: 按学习阶段浏览全部课程章节
---

# 课程总览

全部课程按「转型认知 → C 基础 → MCU → RTOS → IoT → Linux → 工程化 → 求职」组织，共 8 个部分、68 节。可以按顺序学，也可以按目标岗位跳读。

::: tip 怎么用这份总览
- 第一次学习：从第 0 部分开始顺序推进，每节先跑通实验再看扩展内容。
- 查漏补缺：直接进入对应部分，先读每节开头的「本节目标」。
- 准备面试：优先第 1、2、3、4 部分，再用第 7 部分做表达训练。
:::

## 学习进度

| 部分 | 建议周期 | 阶段产出 |
| --- | ---: | --- |
| [0. 转型认知与环境](#part-0) | 1 周 | 点亮第一颗 LED，跑通编译、烧录、串口与 GDB 调试闭环 |
| [1. C 与底层思维](#part-1) | 4 周 | 完成主机端 C 工具库，建立内存与边界意识 |
| [2. MCU 与外设](#part-2) | 5 周 | 完成裸机环境监测节点，掌握 GPIO、中断、定时器、DMA 与总线 |
| [3. FreeRTOS](#part-3) | 4 周 | 完成多任务环境监测仪，能定位栈溢出与优先级反转 |
| [4. 通信协议与 IoT](#part-4) | 3 周 | 打通 MCU、网关、MQTT 与 Web 仪表盘全链路 |
| [5. 嵌入式 Linux 入门](#part-5) | 3 周 | 完成交叉编译、设备树与 Linux 边缘网关服务 |
| [6. 工程化与量产](#part-6) | 2 周 | 补齐测试、CI、OTA、可靠性与安全交付能力 |
| [7. 求职与面试](#part-7) | 1 周 | 产出简历、作品集与可复述的排障案例 |

## 第 0 部分：转型认知与环境 {#part-0}

> 建议周期 1 周，共 7 节。阶段产出：点亮第一颗 LED，跑通编译、烧录、串口与 GDB 调试闭环。

- [0.1 嵌入式岗位地图](/modules/00-orientation/01-role-map) — 理解嵌入式岗位分工，找到从前端转型的最短路径
- [0.2 前端工程师的优势、短板和补齐路径](/modules/00-orientation/02-frontend-gap) — 把 Web 工程经验迁移到嵌入式，同时避开常见思维陷阱
- [0.3 学习路线、硬件清单与实验安全](/modules/00-orientation/03-roadmap-hardware) — 用最低成本搭起可复现的嵌入式实验环境
- [0.4 工具链安装与环境配置](/modules/00-orientation/04-toolchain) — 在 macOS 上搭建 STM32 编译、烧录和调试工具链
- [0.5 第一个固件：点灯、串口与调试](/modules/00-orientation/05-first-firmware) — 从创建工程到单步调试，建立最小可观测闭环
- [0.6 如何阅读数据手册、原理图与错误码](/modules/00-orientation/06-datasheet-schematic) — 建立从硬件文档到驱动代码的阅读路径
- [0.7 建立代码仓库、实验记录与排障日志](/modules/00-orientation/07-repo-log) — 用工程化习惯管理固件学习与项目证据

## 第 1 部分：C 与底层思维 {#part-1}

> 建议周期 4 周，共 10 节。阶段产出：完成主机端 C 工具库，建立内存与边界意识。

- [1.1 C 的编译模型](/modules/01-c-foundation/01-compile-model) — 从源代码到 ELF，理解预处理、编译、汇编和链接
- [1.2 类型、作用域与生命周期](/modules/01-c-foundation/02-types-scope) — 用固定宽度类型、存储类和边界规则写出可预测的 C 代码
- [1.3 指针、数组、函数指针与回调](/modules/01-c-foundation/03-pointers-callbacks) — 用指针和回调建立硬件驱动与业务逻辑之间的边界
- [1.4 内存布局](/modules/01-c-foundation/04-memory-layout) — 理解 Flash、SRAM、栈、堆和链接脚本如何决定固件行为
- [1.5 对齐、填充与大小端](/modules/01-c-foundation/05-alignment-endian) — 理解结构体布局和协议字节序，避免跨平台数据错误
- [1.6 位运算、寄存器与 volatile](/modules/01-c-foundation/06-bit-register) — 读懂寄存器定义，安全地置位、清位和等待状态
- [1.7 状态机、环形缓冲区与命令解析器](/modules/01-c-foundation/07-state-machine-ring-buffer) — 用三个基础结构解决非阻塞业务、串口收包和命令处理
- [1.8 防御式 C](/modules/01-c-foundation/08-defensive-c) — 用错误码、边界检查、断言和日志构建可恢复的固件
- [1.9 可重入、原子性与竞态](/modules/01-c-foundation/09-reentrancy-race) — 识别中断与任务共享数据的风险，正确使用临界区
- [1.10 主机端测试](/modules/01-c-foundation/10-host-testing) — 在没有开发板的情况下验证 C 模块，建立嵌入式测试底座

## 第 2 部分：MCU 与外设 {#part-2}

> 建议周期 5 周，共 11 节。阶段产出：完成裸机环境监测节点，掌握 GPIO、中断、定时器、DMA 与总线。

- [2.1 电学最小集](/modules/02-mcu/01-electricity) — 掌握电压、电流、电阻、上拉下拉和 GPIO 驱动约束
- [2.2 LED 限流与按键消抖](/modules/02-mcu/02-led-button) — 从 GPIO 输出到可靠的按键事件检测
- [2.3 读原理图与数据手册](/modules/02-mcu/03-schematic-datasheet) — 从板级连接追踪到 MCU 复用功能和寄存器配置
- [2.4 Cortex-M 架构](/modules/02-mcu/04-cortex-m) — 理解寄存器、异常、中断、栈和内存映射
- [2.5 链接脚本、启动流程与 Map 文件](/modules/02-mcu/05-linker-startup) — 理解从上电到 main 之间发生了什么
- [2.6 GPIO、EXTI 与 NVIC](/modules/02-mcu/06-gpio-exti-nvic) — 从轮询到中断，理解外部中断的完整链路
- [2.7 定时器、PWM 与输入捕获](/modules/02-mcu/07-timer-pwm) — 用硬件定时器实现精确延时、波形输出和频率测量
- [2.8 ADC、DMA 与采样](/modules/02-mcu/08-adc-dma) — 把模拟信号稳定、连续地搬进内存
- [2.9 UART、I2C 与 SPI](/modules/02-mcu/09-uart-i2c-spi) — 掌握三种最常用板级总线的时序、错误和驱动方式
- [2.10 看门狗、RTC 与低功耗](/modules/02-mcu/10-watchdog-rtc-lowpower) — 让设备在异常后恢复，并让电池设备活得更久
- [2.11 HAL、LL 与裸寄存器](/modules/02-mcu/11-hal-ll-register) — 在开发效率、可移植性和可控性之间做取舍

## 第 3 部分：FreeRTOS {#part-3}

> 建议周期 4 周，共 10 节。阶段产出：完成多任务环境监测仪，能定位栈溢出与优先级反转。

- [3.1 为什么需要 RTOS](/modules/03-rtos/01-why-rtos) — 从超级循环到多任务，判断何时值得引入 RTOS
- [3.2 任务、调度器与优先级](/modules/03-rtos/02-task-scheduler) — 理解 FreeRTOS 任务状态、时间片和优先级抢占
- [3.3 队列、信号量与互斥量](/modules/03-rtos/03-queue-sync) — 用正确的同步原语表达任务之间的数据流和资源所有权
- [3.4 中断与任务通信](/modules/03-rtos/04-isr-communication) — 用 FromISR API 把硬件事件安全地交给任务
- [3.5 栈、堆与静态分配](/modules/03-rtos/05-stack-heap) — 给每个任务留够栈，又不要把 RAM 用穿
- [3.6 优先级反转、死锁与饥饿](/modules/03-rtos/06-priority-inversion) — 识别多任务系统中最隐蔽的时序问题
- [3.7 软件定时器与事件驱动](/modules/03-rtos/07-timers-events) — 用定时器和事件组组织非阻塞的业务节奏
- [3.8 故障处理与现场保护](/modules/03-rtos/08-fault-handling) — 从 HardFault、栈溢出和看门狗复位中留下可分析的证据
- [3.9 资源与性能预算](/modules/03-rtos/09-resource-budget) — 用数据证明系统还有余量，而不是等现场死机
- [3.10 架构设计模式](/modules/03-rtos/10-design-patterns) — 用稳定模式组织采集、处理、通信和显示

## 第 4 部分：通信协议与 IoT {#part-4}

> 建议周期 3 周，共 9 节。阶段产出：打通 MCU、网关、MQTT 与 Web 仪表盘全链路。

- [4.1 串行通信与网络通信](/modules/04-iot/01-serial-vs-network) — 从 UART 到 TCP，理解可靠性和消息边界
- [4.2 帧设计、校验与可靠性](/modules/04-iot/02-framing-protocol) — 设计能被解析、重试和恢复的嵌入式协议
- [4.3 Modbus RTU](/modules/04-iot/03-modbus) — 读懂工业现场最常见的串行协议
- [4.4 CAN 与 CAN FD 基础](/modules/04-iot/04-can) — 理解差分总线、仲裁、帧格式和验收滤波
- [4.5 Wi-Fi、BLE 与配网](/modules/04-iot/05-wifi-ble) — 让设备安全接入网络，并设计可用的首次配置体验
- [4.6 MQTT、TLS 与 QoS](/modules/04-iot/06-mqtt-tls) — 设计可靠的设备上报和云端控制通道
- [4.7 边缘网关设计](/modules/04-iot/07-edge-gateway) — 把现场设备可靠地接到云端，并处理离线、缓存和协议转换
- [4.8 设备安全](/modules/04-iot/08-security) — 从威胁模型到安全启动、密钥存储和固件升级
- [4.9 设备可观测性](/modules/04-iot/09-observability) — 让现场问题可发现、可定位、可恢复

## 第 5 部分：嵌入式 Linux 入门 {#part-5}

> 建议周期 3 周，共 8 节。阶段产出：完成交叉编译、设备树与 Linux 边缘网关服务。

- [5.1 MCU 与嵌入式 Linux 的差异](/modules/05-linux/01-mcu-vs-linux) — 判断什么时候用裸机/RTOS，什么时候需要 Linux
- [5.2 交叉编译与 sysroot](/modules/05-linux/02-cross-compile) — 在 Mac/Linux 上构建 ARM Linux 程序
- [5.3 启动流程](/modules/05-linux/03-boot-flow) — 从 SoC 上电到 systemd 启动完成
- [5.4 设备树与用户空间接口](/modules/05-linux/04-device-tree) — 用设备树描述硬件，并在用户空间访问 GPIO、I2C 和 SPI
- [5.5 Buildroot 与 systemd](/modules/05-linux/05-buildroot-systemd) — 构建可复现的根文件系统并管理设备服务
- [5.6 Linux 内核模块入门](/modules/05-linux/06-kernel-module) — 从 Hello World 到字符设备和 platform driver
- [5.7 Linux 调试工具](/modules/05-linux/07-debug-tools) — 从内核日志到进程、系统调用和性能热点
- [5.8 部署、只读根文件系统与 OTA](/modules/05-linux/08-deploy-ota) — 让 Linux 设备可安全升级、断电恢复和回滚

## 第 6 部分：工程化与量产 {#part-6}

> 建议周期 2 周，共 7 节。阶段产出：补齐测试、CI、OTA、可靠性与安全交付能力。

- [6.1 需求、软硬件接口与架构](/modules/06-engineering/01-requirements-architecture) — 从一句需求变成可测试的固件设计
- [6.2 版本管理、可复现构建与 CI](/modules/06-engineering/02-version-ci) — 让每个固件版本都能追溯、重建和验证
- [6.3 测试策略与故障注入](/modules/06-engineering/03-testing) — 用分层测试证明固件在异常场景下仍然可用
- [6.4 OTA 与回滚](/modules/06-engineering/04-ota) — 让固件升级在断电、断网和失败时仍可恢复
- [6.5 可靠性与失效分析](/modules/06-engineering/05-reliability) — 从掉电、复位、Flash 磨损和环境影响设计可恢复系统
- [6.6 安全与合规基础](/modules/06-engineering/06-security-compliance) — 把安全要求和认证约束前置到设计中
- [6.7 文档、BOM 与生产交付](/modules/06-engineering/07-docs-production) — 让硬件、固件、测试和生产团队能协同交付

## 第 7 部分：求职与面试 {#part-7}

> 建议周期 1 周，共 6 节。阶段产出：产出简历、作品集与可复述的排障案例。

- [7.1 简历改造](/modules/07-career/01-resume) — 把前端经验翻译成嵌入式岗位能理解的价值
- [7.2 作品集建设](/modules/07-career/02-portfolio) — 用三个项目证明你能做嵌入式，而不是只上过课
- [7.3 嵌入式面试题库](/modules/07-career/03-interview-bank) — 覆盖 C、内存、中断、RTOS、通信和 Linux 的高频问题
- [7.4 模拟排障面试](/modules/07-career/04-debug-interview) — 用结构化方法回答“设备不工作”类问题
- [7.5 入职 30/60/90 天计划](/modules/07-career/05-onboarding) — 从转岗新人到能独立交付，前三个月怎么过
- [7.6 岗位选择与投递策略](/modules/07-career/06-job-search) — 用现实路径完成从前端到嵌入式的第一次转岗

## 配套项目

课程章节与项目交叉推进，建议每学完一个部分就沉淀一版项目代码：

- [P1 主机端 C 工具库](/projects/01-host-c-toolkit)
- [P2 裸机环境监测节点](/projects/02-sensor-node)
- [P3 FreeRTOS 环境监测仪](/projects/03-rtos-monitor)
- [P4 IoT 网关与 Web 仪表盘](/projects/04-iot-gateway)
- [P5 综合项目：低功耗环境监测终端](/projects/05-capstone)
