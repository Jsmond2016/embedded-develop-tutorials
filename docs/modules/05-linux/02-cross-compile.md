---
title: 5.2 交叉编译与 sysroot
description: 在 Mac/Linux 上构建 ARM Linux 程序
---

# 5.2 交叉编译与 sysroot

> 本节目标：理解 host 与 target、工具链前缀、sysroot、动态链接和部署依赖，能独立交叉编译一个可运行程序。

## host 与 target

- host：你编译代码的机器，例如 macOS x86_64/arm64。
- target：程序最终运行的机器，例如 Raspberry Pi 的 aarch64 Linux。

本机 GCC 生成的是 host 程序，不能在 ARM 板上运行。交叉编译器通常带前缀：

```text
aarch64-linux-gnu-gcc
arm-linux-gnueabihf-gcc
```

## 安装工具链

```bash
brew install aarch64-unknown-linux-gnu
# 或使用 Linaro/厂商 SDK
```

也可以使用 Buildroot/Yocto 生成的 SDK，里面包含匹配的编译器、sysroot 和库。

## 编译一个最小程序

```c
#include <stdio.h>

int main(void)
{
    puts("hello arm linux");
    return 0;
}
```

```bash
aarch64-linux-gnu-gcc -Wall -Wextra -O2 hello.c -o hello
file hello
readelf -h hello
```

`file` 应显示 `ARM aarch64` 或对应架构，而不是 `Mach-O`/`x86-64`。

## sysroot

sysroot 是目标系统的头文件和库集合：

```text
sysroot/
├── usr/include
├── usr/lib
└── lib
```

编译时使用：

```bash
aarch64-linux-gnu-gcc --sysroot=/path/to/sysroot hello.c -o hello
```

如果没有正确的 sysroot，可能编译能过但运行时找不到库，或者链接到 host 的库。

## CMake 工具链文件

```cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)

set(CMAKE_C_COMPILER aarch64-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER aarch64-linux-gnu-g++)

set(CMAKE_SYSROOT /path/to/sysroot)
set(CMAKE_FIND_ROOT_PATH /path/to/sysroot)
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
```

```bash
cmake -S . -B build-arm -DCMAKE_TOOLCHAIN_FILE=cmake/aarch64.cmake
cmake --build build-arm
```

## 动态链接

```bash
file hello
readelf -d hello | grep NEEDED
```

目标板必须存在对应库，或者使用静态链接：

```bash
aarch64-linux-gnu-gcc -static hello.c -o hello-static
```

静态链接部署简单，但体积大、libc 行为可能不同，也不利于安全更新。

## 部署与验证

```bash
scp hello pi@raspberrypi.local:/tmp/
ssh pi@raspberrypi.local 'chmod +x /tmp/hello && /tmp/hello'
```

如果报 `No such file or directory`，不一定是文件不存在，可能是动态加载器路径不匹配：

```bash
readelf -l hello | grep interpreter
```

## 常见坑

- 用错工具链架构（armhf vs aarch64）。
- sysroot 与目标系统版本不一致。
- 目标板缺少动态库。
- 在 host 上运行 `./hello`，误以为程序坏了。
- 忘记 `strip` 或调试符号导致体积过大。
- 混用不同版本的 libc。

## 动手实验

1. 交叉编译 hello，用 `file`/`readelf` 验证架构。
2. 在树莓派上运行，检查动态库依赖。
3. 改成静态链接，比较体积。
4. 用 CMake 工具链文件构建一个多文件项目。
5. 故意删除目标板上的一个库，观察加载错误。

## 检查清单

- [ ] 能区分 host 和 target。
- [ ] 知道工具链前缀和 sysroot 的作用。
- [ ] 能用 `file`/`readelf` 检查目标架构和依赖。
- [ ] 能部署并验证程序。
- [ ] 理解静态链接和动态链接的取舍。

