# 天气应用

一个使用 React、TypeScript、Vite 和 Tailwind CSS 构建的现代化天气应用。

![技术栈](https://img.shields.io/badge/React-19-blue) ![技术栈](https://img.shields.io/badge/TypeScript-5.0-blue) ![技术栈](https://img.shields.io/badge/Vite-6.0-purple) ![技术栈](https://img.shields.io/badge/Tailwind_CSS-v4-cyan)

## 功能特性

- **实时天气** - 显示当前城市的温度、湿度、风速、气压等详细天气信息
- **天气预报** - 查看未来几天的天气趋势
- **城市搜索** - 支持全球城市搜索，快速切换不同地区
- **收藏城市** - 添加常用城市到收藏夹，方便快速查看
- **数据可视化** - 使用图表展示温度变化和降水概率
- **主题切换** - 支持浅色/深色模式切换
- **GPS 定位** - 自动获取当前位置的天气信息
- **本地缓存** - 智能缓存机制，减少 API 调用

## 技术栈

- **React 19** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具
- **Tailwind CSS v4** - 原子化 CSS 框架
- **Zustand** - 轻量级状态管理
- **Recharts** - 数据可视化图表库
- **Lucide React** - 图标库

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置 API 密钥

1. 前往 [OpenWeatherMap](https://home.openweathermap.org/api_keys) 注册并获取免费 API 密钥
2. 复制 `.env.example` 文件为 `.env`
3. 在 `.env` 文件中填入你的 API 密钥：

```env
VITE_OPENWEATHERMAP_API_KEY=your_api_key_here
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # React 组件
│   ├── chart/          # 图表组件（温度图、降水图）
│   ├── common/         # 通用 UI 组件（按钮、卡片、加载动画）
│   ├── layout/         # 布局组件（头部、侧边栏）
│   └── weather/        # 天气相关组件（当前天气、预报列表、天气图标）
├── hooks/              # 自定义 React Hooks（业务逻辑层）
├── pages/              # 页面组件
├── services/           # API 和服务层
│   ├── api/           # OpenWeatherMap API 客户端
│   └── weatherCache.ts # 本地存储缓存服务
├── stores/             # Zustand 状态管理
└── utils/              # 工具函数
```

## 设计特点

本应用采用 **拟态风格（Neumorphism）** 设计语言：

- 柔和的阴影效果营造立体感
- 浅色/深色模式自适应
- 流畅的主题过渡动画
- 根据天气状况动态变化的背景色

## API 说明

本项目使用 [OpenWeatherMap API](https://openweathermap.org/api) 获取天气数据：

- 地理编码 API - 城市搜索和坐标转换
- 当前天气 API - 实时天气数据
- 5天预报 API - 天气预报数据

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License
