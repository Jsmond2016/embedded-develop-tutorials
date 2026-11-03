---
title: 6.2 版本管理、可复现构建与 CI
description: 让每个固件版本都能追溯、重建和验证
---

# 6.2 版本管理、可复现构建与 CI

> 本节目标：建立固件版本、构建环境、产物和发布记录的完整链路。

## 版本号

推荐语义化版本：

```text
MAJOR.MINOR.PATCH
2.3.1
```

- MAJOR：不兼容的协议/硬件变化。
- MINOR：向后兼容的新功能。
- PATCH：修复。

固件还应记录：

- Git commit。
- 构建时间。
- 工具链版本。
- 配置/设备树版本。
- 硬件版本。

```c
const firmware_info_t g_fw_info = {
    .version = "2.3.1",
    .git_commit = GIT_COMMIT,
    .build_time = __DATE__ " " __TIME__,
    .hardware_rev = "REV_B",
};
```

## 可复现构建

构建结果应可重复：

- 固定工具链版本。
- 固定依赖版本/锁文件。
- 使用容器或 SDK。
- 不依赖个人电脑路径。
- 构建脚本入库。
- 记录产物哈希。

```dockerfile
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y \
    gcc-arm-none-eabi cmake ninja-build git
WORKDIR /work
```

## CI 流水线

```text
checkout -> lint -> host tests -> cross build -> size check -> package -> sign -> publish
```

GitHub Actions 示例：

```yaml
name: firmware
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - run: cmake -S . -B build -G Ninja
      - run: cmake --build build
      - run: ctest --test-dir build --output-on-failure
      - uses: actions/upload-artifact@v4
        with:
          name: firmware
          path: build/*.elf
```

## 产物管理

每个发布包包含：

- `.elf`（调试）。
- `.hex`/`.bin`（烧录）。
- `.map`（体积分析）。
- 签名文件。
- 版本说明和校验和。
- 测试报告。

不要只保留一个 `firmware_final_v2.bin`。

## 发布说明

```markdown
## 2.3.1

### 修复
- 修复 I2C 总线锁死后无法恢复的问题。

### 风险
- 需要配套 Bootloader 1.4.0 以上。

### 验证
- HIL 测试通过，断电 100 次无变砖。
```

## 常见坑

- 版本号只写在 README，固件里查不到。
- 构建依赖开发者本机环境。
- CI 只编译不测试。
- 产物没有签名和哈希。
- 发布说明缺少兼容性信息。

## 检查清单

- [ ] 固件内能读到版本、commit 和构建时间。
- [ ] 构建环境固定且可复现。
- [ ] CI 至少包含编译和主机测试。
- [ ] 发布包包含 ELF/BIN/MAP/签名。
- [ ] 每次发布有变更和风险说明。

