# 健康生活管理系统

一个基于 Nuxt 4 的现代化健康管理 Web 应用，帮助用户全面追踪和管理个人健康数据。

## ✨ 技术栈

- **前端框架**: Nuxt 4 + Vue 3 + TypeScript
- **UI 组件库**: Nuxt UI (基于 Tailwind CSS)
- **状态管理**: Nuxt Composables (useState + useCookie)
- **图表库**: ECharts
- **Markdown 渲染**: Marked + DOMPurify
- **包管理器**: pnpm
- **代码规范**: ESLint + Prettier

## 🎯 核心功能

### 📊 数据概览仪表板

- 实时健康数据统计汇总
- 动态可视化图表展示（体重趋势、卡路里平衡）
- 快速记录入口（懒加载对话框）
- 健康目标进度监控

### ⚖️ 身体数据管理

- 体重、身高、BMI 记录与追踪
- 历史数据图表展示
- 数据分页与时间筛选
- 目标设置与进度监控

### 🍽️ 饮食管理

- 每日饮食记录（早餐、午餐、晚餐、加餐）
- 卡路里摄入自动统计
- 饮食历史查询与分析
- 三餐管理功能

### 🏃 运动管理

- 多种运动类型记录
- 卡路里消耗自动计算
- 运动时长追踪
- 历史数据分析

### 💬 AI 健康咨询

- 实时流式对话（SSE）
- 智能健康建议
- Markdown 格式化回复
- 聊天历史持久化
- 上下文记忆功能

### 👤 个人中心

- 用户信息管理
- 头像上传与预览
- 健康目标设置
- 数据统计展示

## 📁 项目结构

```
health-management/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css              # 全局样式
│   ├── components/
│   │   ├── AIChatPalette.vue         # AI 助手快捷入口
│   │   ├── CaloriesChart.client.vue  # 卡路里图表（客户端）
│   │   ├── WeightChart.client.vue    # 体重图表（客户端）
│   │   ├── DatePicker.vue            # 日期选择器（对年月选择器的封装）
│   │   ├── YearMonthSelect.vue       # 年月选择器
│   │   ├── QuickBodyDataDialog.vue   # 快速记录体重
│   │   ├── QuickDietDialog.vue       # 快速记录饮食
│   │   └── QuickExerciseDialog.vue   # 快速记录运动
│   ├── composables/
│   │   ├── useAuth.ts                # 认证状态管理
│   │   └── useECharts.ts             # ECharts 配置
│   ├── layouts/
│   │   ├── blank.vue                 # 空白布局（登录页）
│   │   └── default.vue               # 默认布局（导航栏）
│   ├── middleware/
│   │   └── auth.ts                   # 认证中间件
│   ├── pages/
│   │   ├── index.vue                 # 首页（预渲染）
│   │   ├── login.vue                 # 登录/注册（预渲染）
│   │   ├── dashboard.vue             # 数据概览（CSR）
│   │   ├── body-data.vue             # 身体数据（CSR）
│   │   ├── diet.vue                  # 饮食管理（CSR）
│   │   ├── exercise.vue              # 运动管理（CSR）
│   │   ├── chat.vue                  # AI 咨询（CSR）
│   │   └── profile.vue               # 个人中心（CSR）
│   ├── types/
│   │   └── index.ts                  # TypeScript 类型定义
│   ├── utils/
│   │   ├── dateUtils.ts              # 日期工具函数
│   │   ├── metricUtils.ts            # 指标计算工具
│   │   └── sse.ts                    # SSE 流式请求
│   ├── app.config.ts                 # 应用配置
│   ├── app.vue                       # 根组件
│   ├── error.vue                     # 错误页面
│   └── spa-loading-template.html     # SPA 加载模板
├── public/                           # 静态资源
├── nuxt.config.ts                    # Nuxt 配置
├── tsconfig.json                     # TypeScript 配置
├── eslint.config.mjs                 # ESLint 配置
├── package.json                      # 项目依赖
└── pnpm-lock.yaml                    # 依赖锁定文件
```

## 🚀 快速开始

### 环境要求

- Node.js >= 22.0.0
- pnpm >= 10.0.0

### 安装依赖

```bash
pnpm install
```

### 开发环境启动

参考 `.env.example` 配置相关环境变量，接着输入如下命令：

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 代码检查与格式化

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# Prettier 检查
pnpm format

# Prettier 格式化代码
pnpm format:fix

# TypeScript 类型检查
pnpm typecheck
```

## 🏗️ 架构特性

### 混合渲染策略

采用 Nuxt 4 推荐的混合渲染模式，针对不同页面使用最佳渲染策略：

- **预渲染** (`prerender: true`): 公开页面（首页、登录页）
  - SEO 优化
  - 快速首屏加载
  - 静态 HTML，可部署到 CDN

- **客户端渲染** (`ssr: false`): 后台管理页面
  - 无服务器负载
  - 无水合开销
  - 更流畅的交互体验
  - 适合高度交互的应用

### 状态管理

遵循 Nuxt 4 最佳实践，使用原生 Composables：

- `useState`: SSR 友好的状态管理
- `useCookie`: 自动同步的 Cookie 管理
- `readonly()`: 保护状态不被外部修改
- 完整的 TypeScript 类型支持

### 性能优化

- **懒加载**: 组件、对话框按需加载
- **水合延迟**: 图表组件使用 `hydrate-on-visible`
- **代码分割**: 按路由自动分割代码
- **预渲染**: 公开页面静态化
- **客户端专用组件**: `.client.vue` 后缀组件

### 类型安全

- 全面使用 TypeScript 开发
- 完整的类型定义和编译时检查
- API 响应类型化
- 组件 Props 类型安全

### 代码规范

- ESLint + Prettier
- 统一的代码风格
- 自动格式化

## 🔌 API 配置

### 开发环境代理

项目支持通过环境变量配置 API 代理：

```bash
# .env 或命令行
ENABLE_API_PROXY=true
API_TARGET=http://localhost:8080
```

配置详见 `nuxt.config.ts`:

```typescript
vite: {
  server: {
    proxy: process.env.ENABLE_API_PROXY === 'true'
      ? {
          '/api': {
            target: process.env.API_TARGET || 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      : undefined
  }
}
```

### 生产环境

生产环境中，前端静态文件通过 Nginx 等 Web 服务器代理到后端 API。

## 🎨 UI 设计

- 基于 Nuxt UI 组件库
- 一致的视觉风格

## 🔒 认证机制

- JWT Token 认证
- Token 存储在 HttpOnly Cookie（推荐）
- 自动刷新机制
- 路由守卫保护
- 登录状态持久化
