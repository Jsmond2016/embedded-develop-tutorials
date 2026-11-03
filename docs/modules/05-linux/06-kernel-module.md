---
title: 5.6 Linux 内核模块入门
description: 从 Hello World 到字符设备和 platform driver
---

# 5.6 Linux 内核模块入门

> 本节目标：理解内核空间与用户空间边界，能编译加载最小模块，并知道字符设备、platform driver 和并发保护的基本结构。

## 内核模块是什么

内核模块是可在运行时加载的代码，运行在内核空间，拥有最高权限。一个错误可能导致内核 panic，因此必须谨慎处理内存、并发和用户输入。

## 最小模块

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>

static int __init hello_init(void)
{
    pr_info("hello: module loaded\n");
    return 0;
}

static void __exit hello_exit(void)
{
    pr_info("hello: module unloaded\n");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Pixels to Pins");
MODULE_DESCRIPTION("Minimal hello module");
```

Makefile：

```make
obj-m += hello.o

KDIR ?= /lib/modules/$(shell uname -r)/build

all:
	make -C $(KDIR) M=$(PWD) modules

clean:
	make -C $(KDIR) M=$(PWD) clean
```

```bash
make
sudo insmod hello.ko
dmesg | tail
sudo rmmod hello
```

交叉编译时 `KDIR` 指向目标板内核源码/构建目录。

## 字符设备

用户空间通过 `/dev/mydev` 读写。内核侧实现 `file_operations`：

```c
#include <linux/fs.h>
#include <linux/uaccess.h>

static char message[] = "hello from kernel\n";
static int major;

static ssize_t my_read(struct file *file, char __user *buf,
                       size_t len, loff_t *offset)
{
    if (*offset >= sizeof(message)) {
        return 0;
    }
    size_t remaining = sizeof(message) - *offset;
    size_t count = min(len, remaining);
    if (copy_to_user(buf, message + *offset, count) != 0) {
        return -EFAULT;
    }
    *offset += count;
    return count;
}

static const struct file_operations fops = {
    .owner = THIS_MODULE,
    .read = my_read,
};

static int __init mydev_init(void)
{
    major = register_chrdev(0, "mydev", &fops);
    if (major < 0) return major;
    pr_info("mydev: major=%d\n", major);
    return 0;
}

static void __exit mydev_exit(void)
{
    unregister_chrdev(major, "mydev");
}
```

创建设备节点：

```bash
sudo mknod /dev/mydev c <major> 0
sudo chmod 666 /dev/mydev
cat /dev/mydev
```

## platform driver

现代内核驱动通常通过设备树匹配 platform device：

```c
static int my_probe(struct platform_device *pdev)
{
    struct resource *res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    void __iomem *base = devm_ioremap_resource(&pdev->dev, res);
    if (IS_ERR(base)) return PTR_ERR(base);

    dev_info(&pdev->dev, "probe\n");
    return 0;
}

static const struct of_device_id my_of_match[] = {
    { .compatible = "vendor,mydev" },
    { }
};
MODULE_DEVICE_TABLE(of, my_of_match);

static struct platform_driver my_driver = {
    .probe = my_probe,
    .driver = {
        .name = "mydev",
        .of_match_table = my_of_match,
    },
};
module_platform_driver(my_driver);
```

设备树中对应节点：

```text
mydev@40000000 {
    compatible = "vendor,mydev";
    reg = <0x40000000 0x1000>;
};
```

## 并发与内存

- 用户数据必须用 `copy_from_user`/`copy_to_user`。
- 共享数据需要 mutex/spinlock/atomic。
- 中断上下文不能睡眠。
- 使用 `devm_*` 管理资源，减少错误路径泄漏。
- 不要在内核里调用用户空间库函数。

## 常见坑

- 直接解引用用户空间指针。
- 在中断里调用可能睡眠的函数。
- 没有处理 `copy_to_user` 失败。
- 模块卸载时资源未释放。
- 设备树 `compatible` 与驱动不匹配。
- 编译内核模块的内核版本与目标板不一致。

## 动手实验

1. 编译、加载、卸载 hello 模块，查看 `dmesg`。
2. 实现字符设备读写和 `cat` 测试。
3. 用设备树节点匹配一个 platform driver。
4. 故意传入非法用户指针，验证错误处理。
5. 用 `rmmod` 检查资源释放。

## 检查清单

- [ ] 知道内核模块与用户空间程序的边界。
- [ ] 能编译、加载、卸载模块。
- [ ] 能实现最小字符设备。
- [ ] 能通过设备树匹配 platform driver。
- [ ] 所有用户数据复制和并发访问都有保护。
