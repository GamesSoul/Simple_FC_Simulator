# Simple_FC_Simulator

一个基于 jsnes 库构建的现代化 FC/NES 模拟器前端演示项目。

## 功能特性

### 核心功能
- ✅ **NES 游戏导入** - 支持 .nes 格式文件导入和加载
- ✅ **游戏控制** - 开始、暂停、重置游戏
- ✅ **全屏模式** - 支持全屏游戏体验

### 显示效果
- ✅ **CRT 滤镜效果** - 复古电视效果：
  - 扫描线效果
  - RGB 色差
  - 噪点/胶片颗粒
  - 图像扭曲
  - 图像模糊
  - 边缘遮罩
- ✅ **电视模式** - 支持彩色和黑白电视模式切换
- ✅ **FPS 监控** - 实时显示帧率和帧时间（游戏运行时显示）
- ✅ **暂停遮罩** - 游戏暂停时显示暂停提示

### 输入控制
- ✅ **键位映射** - 支持 Player 1 和 Player 2 键位自定义
- ✅ **连续按键** - 支持 A 和 B 键连续按键
- ✅ **防重复点击** - 开始/暂停按钮有防止重复点击机制
- ✅ **游戏手柄状态** - 显示已连接的游戏手柄设备

### 其他特性
- ✅ **技术栈清晰** - 明确标注使用 jsnes 实现核心模拟功能
- ✅ **美观的 UI** - 现代化的用户界面设计

## 技术栈

- **核心模拟器**: [jsnes](https://github.com/bfirsh/jsnes)
- **前端框架**: React + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图标**: Font Awesome

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. 点击「导入游戏」按钮选择 .nes 文件
2. 文件导入成功后点击「开始」按钮运行游戏
3. 使用键盘或游戏手柄控制游戏
4. 在系统设置中可以自定义键位和画面特效

## 项目结构

```
红vs白/
├── src/
│   ├── components/       # UI 组件
│   │   ├── ControlBar.tsx          # 控制栏
│   │   ├── Header.tsx              # 页面头部
│   │   ├── PerformanceMonitor.tsx  # FPS 监控
│   │   └── SettingsModal.tsx       # 系统设置
│   ├── context/          # 状态管理
│   │   └── EmulatorContext.tsx
│   ├── pages/            # 页面
│   │   └── EmulatorJsPage.tsx
│   └── types/            # 类型定义
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 许可证

MIT License
