# 从 Web 到硬件：前端工程师的嵌入式转型实战

一份面向前端工程师的嵌入式开发教程，使用 VitePress 构建，配套完整课程大纲、模块教程、项目实战、排障手册和面试题库。

## 课程定位

- 读者：有 7 年前端经验、希望转岗嵌入式的工程师。
- 主线：STM32 裸机 → FreeRTOS → ESP32 联网 → 嵌入式 Linux → 综合项目。
- 目标：形成可运行、可测试、可展示、可面试的嵌入式能力，而不是停留在点灯和例程。

## 技术栈

- VitePress 1.6
- Vue 3
- pnpm 10
- Mermaid 架构图/时序图
- Viewer.js 图片灯箱（点击放大、缩放、旋转、翻转）
- 阿里云/淘宝 npm 镜像：`https://registry.npmmirror.com`

## 本地运行

```bash
pnpm install
pnpm docs:dev
```

生产构建：

```bash
pnpm docs:build
pnpm docs:preview
```

## 目录

```text
docs/
├── guide/          学习路线、完整大纲、学习方法
├── modules/        8 个课程模块，共 60+ 小节
├── projects/       5 个递进式实战项目
├── appendix/       工具链、硬件、排障、术语、面试、资料
└── .vitepress/     站点配置与主题
```

## 课程模块

1. 转型认知与环境搭建
2. C 语言与底层思维
3. MCU 原理与外设
4. FreeRTOS 与系统设计
5. 通信协议与 IoT
6. 嵌入式 Linux 入门
7. 工程化与产品交付
8. 求职与面试

## 推荐硬件

- `NUCLEO-F411RE`（预算替代：`STM32F103C8T6 + ST-Link V2`）
- `ESP32-S3`
- `Raspberry Pi 4B/5` 或 `QEMU`
- 面包板、杜邦线、LED、按键、电阻、USB-TTL、万用表
- I2C OLED、AHT20/BME280、逻辑分析仪

> 安全提示：课程只进行低压直流实验，不接触市电和高压电路。

## 提交规范

课程内容按小节逐步完成，使用中文 Conventional Commits：

```text
docs: 完成 C 编译模型教程
docs: 完成 FreeRTOS 队列与同步教程
docs: 完成 IoT 网关与 Web 仪表盘项目
```

