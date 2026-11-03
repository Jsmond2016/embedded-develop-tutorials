import { defineConfig } from 'vitepress'
import taskLists from 'markdown-it-task-lists'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    lang: 'zh-CN',
    title: '从像素到引脚',
    description: '面向前端工程师的嵌入式开发转型实战教程',
    cleanUrls: true,
    lastUpdated: true,
    ignoreDeadLinks: true,
    head: [
      ['meta', { name: 'theme-color', content: '#0f766e' }],
      ['meta', { name: 'author', content: 'Embedded Leap' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:title', content: '从像素到引脚' }],
      ['meta', { property: 'og:description', content: '前端工程师的嵌入式转型实战教程' }]
    ],
    markdown: {
      lineNumbers: true,
      theme: { light: 'github-light', dark: 'github-dark' },
      config: (md) => {
        md.use(taskLists)
      }
    },
    vite: {
      optimizeDeps: {
        include: ['mermaid', 'dayjs']
      }
    },
    themeConfig: {
      nav: [
        {
          text: '学习路线',
          items: [
            { text: '学习路线', link: '/guide/roadmap' },
            { text: '完整大纲', link: '/guide/outline' },
            { text: '学习方法', link: '/guide/study-method' }
          ]
        },
        {
          text: '课程内容',
          items: [
            { text: '课程总览', link: '/modules/' },
            { text: '第 0 部分 · 转型认知', link: '/modules/00-orientation/01-role-map' },
            { text: '第 1 部分 · C 与底层思维', link: '/modules/01-c-foundation/01-compile-model' },
            { text: '第 2 部分 · MCU 与外设', link: '/modules/02-mcu/01-electricity' },
            { text: '第 3 部分 · FreeRTOS', link: '/modules/03-rtos/01-why-rtos' },
            { text: '第 4 部分 · 通信协议与 IoT', link: '/modules/04-iot/01-serial-vs-network' },
            { text: '第 5 部分 · 嵌入式 Linux', link: '/modules/05-linux/01-mcu-vs-linux' },
            { text: '第 6 部分 · 工程化与量产', link: '/modules/06-engineering/01-requirements-architecture' },
            { text: '第 7 部分 · 求职与面试', link: '/modules/07-career/01-resume' }
          ]
        },
        { text: '项目实战', link: '/projects/' },
        { text: '面试题库', link: '/appendix/interview' },
        {
          text: '附录',
          items: [
            { text: '工具链速查', link: '/appendix/toolchain' },
            { text: '硬件清单', link: '/appendix/hardware' },
            { text: '排障手册', link: '/appendix/troubleshooting' },
            { text: '术语表', link: '/appendix/glossary' },
            { text: '参考资料', link: '/appendix/references' }
          ]
        }
      ],
      sidebar: {
        '/guide/': [
          {
            text: '开始之前',
            items: [
              { text: '学习路线', link: '/guide/roadmap' },
              { text: '完整大纲', link: '/guide/outline' },
              { text: '学习方法', link: '/guide/study-method' }
            ]
          },
          {
            text: '课程内容',
            items: [
              { text: '课程总览', link: '/modules/' },
              { text: '第 0 部分 · 转型认知', link: '/modules/00-orientation/01-role-map' },
              { text: '第 1 部分 · C 与底层思维', link: '/modules/01-c-foundation/01-compile-model' },
              { text: '第 2 部分 · MCU 与外设', link: '/modules/02-mcu/01-electricity' },
              { text: '第 3 部分 · FreeRTOS', link: '/modules/03-rtos/01-why-rtos' },
              { text: '第 4 部分 · 通信协议与 IoT', link: '/modules/04-iot/01-serial-vs-network' },
              { text: '第 5 部分 · 嵌入式 Linux', link: '/modules/05-linux/01-mcu-vs-linux' },
              { text: '第 6 部分 · 工程化与量产', link: '/modules/06-engineering/01-requirements-architecture' },
              { text: '第 7 部分 · 求职与面试', link: '/modules/07-career/01-resume' }
            ]
          }
        ],
        '/modules/': [
          {
            text: '课程导航',
            items: [
              { text: '课程总览', link: '/modules/' },
              { text: '完整大纲', link: '/guide/outline' },
              { text: '学习路线', link: '/guide/roadmap' }
            ]
          },
          {
            text: '第 0 部分 · 转型认知',
            collapsed: false,
            items: [
              { text: '0.1 嵌入式岗位地图', link: '/modules/00-orientation/01-role-map' },
              { text: '0.2 前端能力迁移', link: '/modules/00-orientation/02-frontend-gap' },
              { text: '0.3 路线、硬件与安全', link: '/modules/00-orientation/03-roadmap-hardware' },
              { text: '0.4 工具链搭建', link: '/modules/00-orientation/04-toolchain' },
              { text: '0.5 第一个固件', link: '/modules/00-orientation/05-first-firmware' },
              { text: '0.6 数据手册与原理图', link: '/modules/00-orientation/06-datasheet-schematic' },
              { text: '0.7 仓库与排障日志', link: '/modules/00-orientation/07-repo-log' }
            ]
          },
          {
            text: '第 1 部分 · C 与底层思维',
            collapsed: true,
            items: [
              { text: '1.1 编译模型', link: '/modules/01-c-foundation/01-compile-model' },
              { text: '1.2 类型与生命周期', link: '/modules/01-c-foundation/02-types-scope' },
              { text: '1.3 指针与回调', link: '/modules/01-c-foundation/03-pointers-callbacks' },
              { text: '1.4 内存布局', link: '/modules/01-c-foundation/04-memory-layout' },
              { text: '1.5 对齐、填充与大小端', link: '/modules/01-c-foundation/05-alignment-endian' },
              { text: '1.6 位运算与寄存器', link: '/modules/01-c-foundation/06-bit-register' },
              { text: '1.7 状态机与环形缓冲区', link: '/modules/01-c-foundation/07-state-machine-ring-buffer' },
              { text: '1.8 防御式 C', link: '/modules/01-c-foundation/08-defensive-c' },
              { text: '1.9 可重入与竞态', link: '/modules/01-c-foundation/09-reentrancy-race' },
              { text: '1.10 主机端测试', link: '/modules/01-c-foundation/10-host-testing' }
            ]
          },
          {
            text: '第 2 部分 · MCU 与外设',
            collapsed: true,
            items: [
              { text: '2.1 电学最小集', link: '/modules/02-mcu/01-electricity' },
              { text: '2.2 LED 与按键', link: '/modules/02-mcu/02-led-button' },
              { text: '2.3 原理图与数据手册', link: '/modules/02-mcu/03-schematic-datasheet' },
              { text: '2.4 Cortex-M 架构', link: '/modules/02-mcu/04-cortex-m' },
              { text: '2.5 链接脚本与启动流程', link: '/modules/02-mcu/05-linker-startup' },
              { text: '2.6 GPIO、EXTI 与 NVIC', link: '/modules/02-mcu/06-gpio-exti-nvic' },
              { text: '2.7 定时器与 PWM', link: '/modules/02-mcu/07-timer-pwm' },
              { text: '2.8 ADC 与 DMA', link: '/modules/02-mcu/08-adc-dma' },
              { text: '2.9 UART、I2C 与 SPI', link: '/modules/02-mcu/09-uart-i2c-spi' },
              { text: '2.10 看门狗、RTC 与低功耗', link: '/modules/02-mcu/10-watchdog-rtc-lowpower' },
              { text: '2.11 HAL、LL 与寄存器', link: '/modules/02-mcu/11-hal-ll-register' }
            ]
          },
          {
            text: '第 3 部分 · FreeRTOS',
            collapsed: true,
            items: [
              { text: '3.1 为什么需要 RTOS', link: '/modules/03-rtos/01-why-rtos' },
              { text: '3.2 任务与调度器', link: '/modules/03-rtos/02-task-scheduler' },
              { text: '3.3 队列与同步', link: '/modules/03-rtos/03-queue-sync' },
              { text: '3.4 中断与任务通信', link: '/modules/03-rtos/04-isr-communication' },
              { text: '3.5 栈、堆与静态分配', link: '/modules/03-rtos/05-stack-heap' },
              { text: '3.6 优先级反转与死锁', link: '/modules/03-rtos/06-priority-inversion' },
              { text: '3.7 软件定时器与事件', link: '/modules/03-rtos/07-timers-events' },
              { text: '3.8 故障处理', link: '/modules/03-rtos/08-fault-handling' },
              { text: '3.9 资源与性能预算', link: '/modules/03-rtos/09-resource-budget' },
              { text: '3.10 架构设计模式', link: '/modules/03-rtos/10-design-patterns' }
            ]
          },
          {
            text: '第 4 部分 · 通信与 IoT',
            collapsed: true,
            items: [
              { text: '4.1 串行与网络通信', link: '/modules/04-iot/01-serial-vs-network' },
              { text: '4.2 帧设计与可靠性', link: '/modules/04-iot/02-framing-protocol' },
              { text: '4.3 Modbus RTU', link: '/modules/04-iot/03-modbus' },
              { text: '4.4 CAN 与 CAN FD', link: '/modules/04-iot/04-can' },
              { text: '4.5 Wi-Fi 与 BLE', link: '/modules/04-iot/05-wifi-ble' },
              { text: '4.6 MQTT 与 TLS', link: '/modules/04-iot/06-mqtt-tls' },
              { text: '4.7 边缘网关', link: '/modules/04-iot/07-edge-gateway' },
              { text: '4.8 设备安全', link: '/modules/04-iot/08-security' },
              { text: '4.9 可观测性', link: '/modules/04-iot/09-observability' }
            ]
          },
          {
            text: '第 5 部分 · 嵌入式 Linux',
            collapsed: true,
            items: [
              { text: '5.1 MCU 与 Linux 的差异', link: '/modules/05-linux/01-mcu-vs-linux' },
              { text: '5.2 交叉编译', link: '/modules/05-linux/02-cross-compile' },
              { text: '5.3 启动流程', link: '/modules/05-linux/03-boot-flow' },
              { text: '5.4 设备树与用户空间', link: '/modules/05-linux/04-device-tree' },
              { text: '5.5 Buildroot 与 systemd', link: '/modules/05-linux/05-buildroot-systemd' },
              { text: '5.6 内核模块入门', link: '/modules/05-linux/06-kernel-module' },
              { text: '5.7 Linux 调试工具', link: '/modules/05-linux/07-debug-tools' },
              { text: '5.8 部署与 OTA', link: '/modules/05-linux/08-deploy-ota' }
            ]
          },
          {
            text: '第 6 部分 · 工程化与量产',
            collapsed: true,
            items: [
              { text: '6.1 需求与架构', link: '/modules/06-engineering/01-requirements-architecture' },
              { text: '6.2 版本管理与 CI', link: '/modules/06-engineering/02-version-ci' },
              { text: '6.3 测试策略', link: '/modules/06-engineering/03-testing' },
              { text: '6.4 OTA 与回滚', link: '/modules/06-engineering/04-ota' },
              { text: '6.5 可靠性与失效分析', link: '/modules/06-engineering/05-reliability' },
              { text: '6.6 安全与合规', link: '/modules/06-engineering/06-security-compliance' },
              { text: '6.7 文档与生产交付', link: '/modules/06-engineering/07-docs-production' }
            ]
          },
          {
            text: '第 7 部分 · 求职与面试',
            collapsed: true,
            items: [
              { text: '7.1 简历改造', link: '/modules/07-career/01-resume' },
              { text: '7.2 作品集', link: '/modules/07-career/02-portfolio' },
              { text: '7.3 面试题库', link: '/modules/07-career/03-interview-bank' },
              { text: '7.4 排障面试', link: '/modules/07-career/04-debug-interview' },
              { text: '7.5 入职 30/60/90 天', link: '/modules/07-career/05-onboarding' },
              { text: '7.6 岗位选择与投递', link: '/modules/07-career/06-job-search' }
            ]
          }
        ],
        '/projects/': [
          {
            text: '项目实战',
            items: [
              { text: '项目总览', link: '/projects/' },
              { text: 'P1 主机端 C 工具库', link: '/projects/01-host-c-toolkit' },
              { text: 'P2 裸机环境监测节点', link: '/projects/02-sensor-node' },
              { text: 'P3 FreeRTOS 监测仪', link: '/projects/03-rtos-monitor' },
              { text: 'P4 IoT 网关', link: '/projects/04-iot-gateway' },
              { text: 'P5 综合项目', link: '/projects/05-capstone' }
            ]
          }
        ],
        '/appendix/': [
          {
            text: '附录',
            items: [
              { text: '工具链速查', link: '/appendix/toolchain' },
              { text: '硬件清单', link: '/appendix/hardware' },
              { text: '排障手册', link: '/appendix/troubleshooting' },
              { text: '术语表', link: '/appendix/glossary' },
              { text: '面试题库', link: '/appendix/interview' },
              { text: '参考资料', link: '/appendix/references' }
            ]
          }
        ]
      },
      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
            modal: {
              noResultsText: '没有找到结果',
              resetButtonTitle: '清除查询条件',
              footer: {
                selectText: '选择',
                navigateText: '切换',
                closeText: '关闭'
              }
            }
          }
        }
      },
      outline: { level: [2, 3], label: '本页目录' },
      docFooter: { prev: '上一篇', next: '下一篇' },
      lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },
      footer: {
        message: '基于 VitePress 构建 · 面向前端工程师的嵌入式转型课程',
        copyright: 'Copyright © 2026 Pixels to Pins'
      }
    },
    mermaid: {
      theme: 'neutral'
    },
    mermaidPlugin: {
      class: 'mermaid'
    }
  })
)
