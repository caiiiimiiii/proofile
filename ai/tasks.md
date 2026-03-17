# 开发任务

## 阶段一：项目骨架（第1-2天）
- [x] 初始化 Next.js + Tailwind
- [x] 集成 Supabase（客户端和服务器端）
- [x] 创建数据库表（users, projects）

## 阶段二：核心功能开发（第1-7天）

### 第1天：登录系统
- [x] 登录页面（/login）
  - 邮箱登录（Supabase Auth）
  - 登录成功后跳转 /dashboard
- [x] 登出功能
- [x] 保护路由（未登录用户重定向到 /login）

### 第2天：项目列表页
- [x] 创建 /projects 页面
- [x] 从 Supabase 读取当前用户项目
- [x] 项目卡片组件（展示 title, role, skills, date）
- [x] 编辑/删除按钮（先做 UI，功能后续）

### 第3天：新建项目
- [x] 新建项目页面 /projects/new
- [x] 表单字段：title, role, description, skills, result, date
- [x] 提交后存入 projects 表

### 第4天：编辑/删除项目
- [x] 编辑项目页面 /projects/[id]/edit
- [x] 删除项目功能（带确认弹窗）

### 第5天：AI 简历生成
- [x] 创建 API 路由 /api/generate-resume
- [x] 调用 DeepSeek 生成简历
- [x] 简历展示页面 /resume

### 第6天：能力雷达图
- [ ] 雷达图组件（ECharts）
- [ ] 根据项目数据生成维度评分
- [ ] 在仪表盘展示

### 第7天：UI 优化与联调
- [ ] 美化所有页面
- [ ] 修复 Bug
- [ ] 准备演示 demo

## 阶段三：能力雷达图（第6天）
- [ ] 集成 ECharts
- [ ] 根据项目生成能力维度数据

## 阶段四：UI 优化与测试（第7天）
- [ ] 美化界面
- [ ] 端到端测试

## 阶段五：演示准备
- [ ] 制作演示视频
- [ ] 准备终审 PPT
