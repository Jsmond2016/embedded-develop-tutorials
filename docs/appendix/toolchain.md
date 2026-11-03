---
title: 工具链速查
description: STM32 与嵌入式 Linux 常用命令
---

# 工具链速查

## STM32

```bash
arm-none-eabi-gcc --version
arm-none-eabi-size firmware.elf
arm-none-eabi-nm --size-sort --print-size firmware.elf | tail -30
arm-none-eabi-objdump -h firmware.elf
arm-none-eabi-objdump -d firmware.elf > firmware.asm
arm-none-eabi-gdb firmware.elf
```

## OpenOCD

```bash
openocd -f board/st_nucleo_f4.cfg
openocd -f board/st_nucleo_f4.cfg \
  -c "program build/app.elf verify reset exit"
```

GDB 连接：

```bash
arm-none-eabi-gdb build/app.elf
(gdb) target remote :3333
(gdb) monitor reset halt
(gdb) load
(gdb) continue
```

## 串口

```bash
ls /dev/tty.*
screen /dev/tty.usbmodem* 115200
# 退出 screen: Ctrl-A 然后 K，再按 Y
```

## CMake

```bash
cmake -S . -B build -G Ninja
cmake --build build
ctest --test-dir build --output-on-failure
```

## 主机端测试

```bash
gcc -std=c11 -Wall -Wextra -Werror -g \
  -fsanitize=address,undefined \
  tests/test_main.c src/*.c -o test_main
./test_main
```

## 嵌入式 Linux

```bash
file app
readelf -h app
readelf -d app | grep NEEDED
aarch64-linux-gnu-gcc --version
scp app pi@raspberrypi.local:/tmp/
ssh pi@raspberrypi.local
```

## Linux 诊断

```bash
dmesg -T | tail -100
journalctl -u app -f
systemctl status app
ps aux
top -H
strace -f -p <pid>
lsof -p <pid>
ss -lntp
```

## 硬件接口

```bash
i2cdetect -y 1
i2cget -y 1 0x38 0x00
gpiodetect
gpioinfo
gpioget gpiochip0 17
gpioset gpiochip0 17=1
```

## Git

```bash
git status
git diff
git add <file>
git commit -m "fix: 修复串口接收越界"
git log --oneline --graph --decorate -20
```

## 文档站

```bash
pnpm install
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

