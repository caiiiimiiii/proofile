# 系统架构

- 前端：Next.js (App Router)
- 样式：TailwindCSS
- 数据库：Supabase (PostgreSQL)
- 认证：Supabase Auth
- AI：DeepSeek API (兼容 OpenAI SDK)
- 图表：ECharts

## 数据流
用户登录 → 创建项目 → 项目存入 Supabase → 前端请求 AI API → 生成简历 → 展示