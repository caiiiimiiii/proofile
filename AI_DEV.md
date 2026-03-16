# AI 开发指南（给 Gemini 看的）

## 项目背景
- 项目名称：履迹（Proofile）
- 技术栈：Next.js App Router, TypeScript, TailwindCSS, Supabase, DeepSeek API, ECharts
- 核心功能：项目卡片管理 + AI 简历生成 + 能力雷达图

## 开发规则
1. 所有页面放在 `src/app/` 下，使用 App Router 约定。
2. 组件放在 `src/components/`，每个组件一个文件。
3. API 路由放在 `src/app/api/` 下。
4. 数据库操作统一使用 `src/lib/supabase.ts` 导出的 `supabase` 客户端。
5. 样式必须使用 Tailwind 类，不要写自定义 CSS。
6. 提交信息格式：`类型: 描述`（如 `feat: add login page`）。
7. 开发前必须阅读 `ai/` 文件夹下的文档，理解项目目标和当前任务。

## 当前开发阶段
（从 `ai/tasks.md` 读取最新任务）