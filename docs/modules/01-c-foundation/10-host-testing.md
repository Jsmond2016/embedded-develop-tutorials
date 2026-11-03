---
title: 1.10 主机端测试
description: 在没有开发板的情况下验证 C 模块，建立嵌入式测试底座
---

# 1.10 主机端测试

> 本节目标：把与硬件无关的逻辑拿到 Mac/Linux 上编译测试，缩短反馈回路，并为后续项目建立可回归的测试习惯。

## 为什么要主机端测试

在目标板上测试需要烧录、接线、观察串口，反馈慢且难以覆盖所有边界。状态机、协议解析、环形缓冲区、错误码等纯逻辑模块，完全可以在主机上以毫秒级速度测试。

测试金字塔：

```text
        少量 HIL / 硬件联调
      集成测试（协议、任务）
    大量主机端单元测试（纯 C 逻辑）
```

## 一个最小测试框架

不引入依赖也能开始：

```c
#include <stdio.h>
#include <stdlib.h>

#define CHECK(expr) do { \
    if (!(expr)) { \
        fprintf(stderr, "FAIL %s:%d: %s\n", __FILE__, __LINE__, #expr); \
        exit(1); \
    } \
} while (0)

static void test_ring_buffer_push_pop(void)
{
    uint8_t storage[4];
    ring_buffer_t rb;
    ring_buffer_init(&rb, storage, sizeof(storage));

    CHECK(rb_push(&rb, 0x11));
    CHECK(rb_push(&rb, 0x22));

    uint8_t value = 0;
    CHECK(rb_pop(&rb, &value));
    CHECK(value == 0x11);
    CHECK(rb_pop(&rb, &value));
    CHECK(value == 0x22);
    CHECK(!rb_pop(&rb, &value));
}

int main(void)
{
    test_ring_buffer_push_pop();
    puts("all tests passed");
    return 0;
}
```

规模变大后可以切换到 Unity、CMock、Check 或 Criterion。选一个团队能维护的即可，不要为了工具而工具。

## Fake 掉硬件

业务层依赖接口，测试时注入假实现：

```c
typedef struct {
    int call_count;
    int fail_after;
} fake_uart_t;

static int fake_uart_write(const uint8_t *data, size_t len, void *ctx)
{
    fake_uart_t *fake = ctx;
    (void)data;
    (void)len;
    if (fake->fail_after >= 0 && fake->call_count >= fake->fail_after) {
        return ERR_IO;
    }
    fake->call_count++;
    return OK;
}
```

这样不用真实串口，也能测试超时、重试和错误传播。

## 编译与 Sanitizer

```bash
gcc -std=c11 -Wall -Wextra -Werror -g \
  -fsanitize=address,undefined \
  tests/test_ring_buffer.c ring_buffer.c -o test_rb

./test_rb
```

ASan/UBSan 能发现越界、悬空指针、未定义行为。主机端测试不能证明目标板一定正确，但能提前消灭大量低级错误。

## CMake 测试入口

```cmake
enable_testing()

add_executable(test_ring_buffer
    tests/test_ring_buffer.c
    src/ring_buffer.c
)
target_include_directories(test_ring_buffer PRIVATE include)
target_compile_options(test_ring_buffer PRIVATE -Wall -Wextra -Werror)

add_test(NAME ring_buffer COMMAND test_ring_buffer)
```

运行：

```bash
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

## 测试用例设计

- 正常路径：输入有效，输出符合预期。
- 边界条件：空、满、最大长度、最小长度。
- 错误路径：空指针、超时、校验失败、资源不足。
- 回绕与重启：计数器回绕、缓冲区索引回绕。
- 随机/模糊输入：解析器收到任意字节流不崩溃。

## 常见坑

- 只在 `-O0` 下测试，发布版 `-O2` 才暴露问题。
- 测试依赖真实时间，导致慢且不稳定。
- 只测正常路径，不测错误码。
- 测试和实现共享同一个错误假设。
- 把硬件初始化写进纯逻辑模块，导致无法在主机运行。

## 动手实验

为第 1.7 节的环形缓冲区和命令解析器补齐测试：

1. 空缓冲区读取。
2. 满缓冲区写入。
3. 索引回绕。
4. 分片输入。
5. 错误帧头、超长帧、CRC 错误。
6. 在 ASan/UBSan 下运行全部测试。

## 检查清单

- [ ] 纯逻辑模块可以在主机编译和运行。
- [ ] 测试覆盖正常、边界和错误路径。
- [ ] 硬件依赖通过接口 fake 掉。
- [ ] 使用 ASan/UBSan 检查内存问题。
- [ ] 每次修复 bug 都新增回归测试。

