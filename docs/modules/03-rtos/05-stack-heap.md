---
title: 3.5 栈、堆与静态分配
description: 给每个任务留够栈，又不要把 RAM 用穿
---

# 3.5 栈、堆与静态分配

> 本节目标：理解任务栈的组成、测量栈高水位、选择堆方案，并优先使用静态分配提升确定性。

## 任务栈里有什么

- 函数调用帧和返回地址。
- 局部变量。
- 保存的寄存器上下文。
- 中断嵌套时的异常栈帧（使用 MSP 或任务 PSP，取决于配置）。
- 浮点上下文（启用 FPU 且任务使用浮点时）。

栈溢出不一定立刻崩溃，可能悄悄覆盖相邻任务的控制块或缓冲区。

## 设置栈大小

```c
xTaskCreate(sensor_task, "sensor", 512, NULL, 3, NULL);
```

FreeRTOS 通常以 word 为单位，512 words = 2048 bytes（32 位 MCU）。但还要考虑：

- 编译器优化等级。
- 最深调用链。
- 局部大数组。
- `printf`/浮点格式化。
- 中断嵌套。

不要凭感觉给 128 或 256 words，尤其任务里调用了库函数时。

## 栈高水位

```c
void monitor_task(void *arg)
{
    for (;;) {
        UBaseType_t high_water = uxTaskGetStackHighWaterMark(NULL);
        log_stack("monitor", high_water);
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
```

返回值是“历史最小剩余栈空间”（单位 word）。接近 0 表示危险。建议至少保留 20–30% 余量，并在最坏场景下重新测量。

## 栈溢出检测

在 `FreeRTOSConfig.h` 中启用：

```c
#define configCHECK_FOR_STACK_OVERFLOW 2
```

实现钩子：

```c
void vApplicationStackOverflowHook(TaskHandle_t task, char *name)
{
    (void)task;
    log_fatal("stack overflow: %s", name);
    taskDISABLE_INTERRUPTS();
    for (;;) {
        /* 等待看门狗复位，或进入安全模式 */
    }
}
```

检测不是万能的，方法 2 只能发现部分越界模式。生产环境仍要结合栈填充、MPU 和看门狗。

## FreeRTOS 堆方案

| 方案 | 特点 | 适用 |
| --- | --- | --- |
| heap_1 | 只分配不释放 | 启动后对象固定 |
| heap_2 | 可释放，碎片风险 | 旧项目/学习 |
| heap_3 | 包装标准 malloc | 需要 libc 堆 |
| heap_4 | 合并相邻空闲块 | 通用动态分配 |
| heap_5 | 多内存区域 | 外部 RAM |

实时系统优先使用 heap_1 或静态分配。动态创建/删除任务、队列会增加碎片和不可预测延迟。

## 静态分配

```c
StaticTask_t task_buffer;
StackType_t task_stack[512];

xTaskCreateStatic(
    sensor_task,
    "sensor",
    512,
    NULL,
    3,
    task_stack,
    &task_buffer);
```

静态分配在编译期确定内存，链接器能给出准确占用，也不会因为运行时碎片失败。

## 常见坑

- 任务里定义大数组，栈瞬间溢出。
- 只看平均栈使用，不看最坏路径。
- 使用 `printf` 但没给库函数预留栈。
- 动态删除/创建任务造成碎片。
- 栈高水位在调试版测量，发布版优化后重新评估。

## 动手实验

1. 给任务逐渐减小栈，找到崩溃边界。
2. 打印每个任务的栈高水位，找出最危险的任务。
3. 改用静态创建，比较 Map 文件占用。
4. 在任务中调用 `snprintf`/浮点格式化，观察栈增长。
5. 启用栈溢出钩子，故意制造溢出并记录任务名。

## 检查清单

- [ ] 知道任务栈的单位和组成。
- [ ] 能读取并解释栈高水位。
- [ ] 启用栈溢出检测和钩子。
- [ ] 知道 heap_1–heap_5 的差异。
- [ ] 关键任务优先使用静态分配。

