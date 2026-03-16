# 编码规范

- 使用 TypeScript，严格模式
- React 组件使用函数组件 + 箭头函数
- 样式使用 Tailwind 类，避免自定义 CSS
- API 路由放在 `src/app/api` 下（App Router）
- 数据库操作统一放在 `src/lib/supabase.ts` 中
- 提交信息格式：`类型: 简短描述`（如 `feat: 添加项目卡片`）