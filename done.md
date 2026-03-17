# Done（已完成内容记录）

本文档用于记录本项目从启动到当前为止已经实现/落地的功能与关键改动，便于后续继续开发与验收回溯。

## 1. 项目基础信息（截至当前）

- **项目名称**：履迹（Proofile）
- **目标**：项目卡片管理（CRUD）→ AI 简历生成 → 能力雷达图（见 `ai/project.md`）
- **技术栈**：
  - Next.js App Router + React + TypeScript（严格模式）
  - TailwindCSS（样式仅使用 Tailwind 类）
  - Supabase（PostgreSQL + Auth）
  - ECharts（雷达图）
  - DeepSeek API（通过 OpenAI SDK 兼容方式）

## 2. 已实现功能清单（按迭代顺序）

### 2.1 登录系统（邮箱 Magic Link）

- **页面**：`/login`
  - 邮箱输入框 + 发送 magic link（`supabase.auth.signInWithOtp`）
  - 发送中禁用按钮，成功/错误提示
  - 已登录时自动跳转 `/dashboard`
  - **代码**：`src/app/login/page.tsx`

- **页面**：`/dashboard`
  - 读取 session，未登录跳转 `/login`
  - 显示当前邮箱，登出功能
  - 清理 magic link 回跳的 hash
  - 入口按钮：进入项目列表、生成简历
  - **代码**：`src/app/dashboard/page.tsx`

- **Supabase 客户端**：开启 `detectSessionInUrl/persistSession/autoRefreshToken`
  - **代码**：`src/lib/supabase.ts`

### 2.2 项目列表页

- **页面**：`/projects`
  - 路由保护，从 Supabase `public.projects` 读取当前用户项目（倒序）
  - 展示字段：`title / role / skills / date`
  - 删除功能（带二次确认，成功后本地即时移除）
  - 编辑按钮链接到 `/projects/[id]/edit`
  - **代码**：`src/app/projects/page.tsx`

- **组件**：`ProjectCard` — 纯 UI 展示 + 调用 `onDelete(id)`
  - **代码**：`src/components/ProjectCard.tsx`

### 2.3 新建项目

- **页面**：`/projects/new`
  - 表单字段：`title, role, description, skills, result, date`
  - 提交前 upsert `profiles`（避免外键失败），插入成功后跳转 `/projects`
  - **代码**：`src/app/projects/new/page.tsx`

- **组件**：`ProjectForm` — 可复用表单 UI，含 skills 预览、错误展示、loading
  - `parseSkills()`：逗号/中文逗号/换行拆分 + 去重
  - **代码**：`src/components/ProjectForm.tsx`

### 2.4 编辑项目

- **页面**：`/projects/[id]/edit`
  - 路由保护，从 Supabase 加载项目数据
  - 复用 `ProjectForm` 组件，保存后跳转 `/projects`
  - 项目不存在或无权限时展示提示
  - **代码**：`src/app/projects/[id]/edit/page.tsx`

### 2.5 AI 简历生成

- **API 路由**：`/api/generate-resume`（POST）
  - 从 Authorization Bearer token 验证用户
  - 读取当前用户所有项目，构建 prompt
  - 调用 DeepSeek API（OpenAI SDK 兼容），返回简历文本
  - **代码**：`src/app/api/generate-resume/route.ts`

- **页面**：`/resume`
  - 路由保护，点击"生成简历"调用 API
  - 展示生成结果，支持打印/保存为 PDF
  - **代码**：`src/app/resume/page.tsx`

### 2.6 能力雷达图

- **工具函数**：`src/lib/radar.ts`
  - `calcRadarScores(projects)` — 根据项目数据计算 5 个维度评分（0-100）
  - 维度：技术能力（skills 数量）、团队协作、创新能力、科研能力（关键词匹配）、表达能力（字数）

- **组件**：`RadarChart` — ECharts 雷达图，动态 import 避免 SSR，ResizeObserver 自适应
  - **代码**：`src/components/RadarChart.tsx`

- **页面**：`/dashboard` 集成雷达图
  - 加载用户项目后计算评分，展示雷达图 + 各维度数值
  - 无项目时展示引导提示
  - **代码**：`src/app/dashboard/page.tsx`

## 3. 数据库（Supabase）落地情况

- **表**：`public.profiles`（id, email, created_at）、`public.projects`（id, user_id, title/role/description/skills/result/date/created_at）
- **RLS**：profiles / projects 均开启，限制为当前用户
- **触发器**：Auth 用户创建时自动同步到 `public.profiles`
- **代码**：`database/schema.sql`

## 4. 环境变量

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL（默认 https://api.deepseek.com）
DEEPSEEK_MODEL（默认 deepseek-chat）
```

## 5. 当前已知的后续工作（未实现）

- UI 美化与端到端测试
- 演示视频 + 终审 PPT
