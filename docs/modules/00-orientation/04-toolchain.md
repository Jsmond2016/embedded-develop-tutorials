---
title: 0.4 工具链安装与环境配置
description: 在 macOS 上搭建 STM32 编译、烧录和调试工具链
---

# 0.4 工具链安装与环境配置

> 本节目标：完成一套可复现的 STM32 开发环境，能编译、烧录、单步调试，并能用命令行验证版本。

## 工具链由什么组成

```mermaid
flowchart LR
  A[源代码] --> B[arm-none-eabi-gcc]
  B --> C[ELF / HEX / BIN]
  C --> D[OpenOCD / ST-Link]
  D --> E[目标板]
  E --> F[GDB Server]
  F --> G[VS Code / GDB]
```

- **交叉编译器**：在 macOS 上生成 ARM Cortex-M 机器码。
- **构建系统**：Make 或 CMake + Ninja。
- **调试探针**：ST-Link、J-Link 或 DAPLink。
- **调试服务器**：OpenOCD 或 pyOCD。
- **调试器前端**：GDB，通常由 VS Code 调用。
- **烧录工具**：STM32CubeProgrammer 或 OpenOCD。

## macOS 安装

```bash
brew install arm-none-eabi-gcc cmake ninja openocd stlink
brew install --cask stm32cubeprogrammer
brew install --cask visual-studio-code
```

如果使用 NUCLEO 板载 ST-Link，通常不需要额外购买调试器。检查连接：

```bash
system_profiler SPUSBDataType | grep -i -A 5 st-link
```

## VS Code 扩展

- `C/C++`：代码跳转、类型提示、调试集成。
- `CMake Tools`：配置、构建和选择工具链。
- `Cortex-Debug`：连接 OpenOCD/pyOCD，进行 MCU 调试。
- `EditorConfig for VS Code`：统一缩进和换行。

建议在项目 `.vscode/settings.json` 中固定格式化规则，例如 4 空格缩进、UTF-8、保存时去除行尾空格。团队项目不要把个人绝对路径提交到仓库。

## 验证安装

```bash
arm-none-eabi-gcc --version
arm-none-eabi-gdb --version
cmake --version
ninja --version
openocd --version
st-info --version
```

再编译一个最小 C 文件：

```bash
arm-none-eabi-gcc -mcpu=cortex-m4 -mthumb -c main.c -o main.o
arm-none-eabi-size main.o
```

能生成 `.o` 并看到 text/data/bss 大小，说明交叉编译链路可用。

## 工程目录建议

```text
firmware/
├── app/              # 业务与状态机
├── bsp/              # 板级引脚、时钟、外设初始化
├── drivers/          # 传感器与通信驱动
├── platform/         # MCU/RTOS 适配层
├── tests/            # 主机端单元测试
├── cmake/            # 工具链与链接脚本
├── third_party/      # HAL、CMSIS、FreeRTOS
└── CMakeLists.txt
```

前端项目常见的 `src/components` 思维可以保留，但嵌入式更强调“硬件依赖边界”：业务层尽量不直接调用 HAL，驱动层通过接口暴露能力，平台层负责具体芯片。

## 文档站点的 pnpm 环境

本教程文档使用 VitePress + pnpm，已在项目根目录配置：

```ini
registry=https://registry.npmmirror.com
```

```bash
pnpm install
pnpm docs:dev
pnpm docs:build
```

学习嵌入式时不要把文档站的 Node 环境与固件工具链混为一谈：Node 只负责构建教程网站，固件仍然由 ARM GCC 编译。

## 常见问题

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| `command not found: arm-none-eabi-gcc` | PATH 未生效 | 重开终端，检查 `brew --prefix` |
| OpenOCD 找不到 ST-Link | USB 被占用或驱动问题 | 拔插、换线、关闭其他调试会话 |
| 能编译但不能烧录 | 目标电压、复位线或探针配置错误 | 检查 `openocd.cfg` 与板载跳线 |
| GDB 连不上 | OpenOCD 未启动或端口不对 | 先启动 OpenOCD，再连接 3333 端口 |
| 程序运行但串口乱码 | 波特率或时钟配置不一致 | 对齐 115200、8N1 和系统时钟 |

## 检查清单

- [ ] `arm-none-eabi-gcc`、CMake、Ninja、OpenOCD 均可输出版本。
- [ ] 系统能识别 ST-Link。
- [ ] VS Code 已安装 C/C++、CMake Tools 和 Cortex-Debug。
- [ ] 能编译一个最小 ARM 目标文件。
- [ ] 文档站可通过 `pnpm docs:dev` 启动。

