# Proofile

![版本](https://img.shields.io/badge/version-0.1.0-blue)
![框架](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=nextdotjs)
![代码规范](https://img.shields.io/badge/lint-ESLint-4B32C3?logo=eslint)
![样式](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)

当前仓库未检测到 CI、测试覆盖率配置和许可证文件，因此未生成对应的构建状态、覆盖率和许可证徽章。

## 简短描述

一个帮助学生记录项目经历、沉淀能力凭证，并基于项目卡片自动生成投递版简历的 Web 应用。

## 在线体验

- 线上访问地址：`https://proofile-gold.vercel.app/`
- 建议使用桌面端浏览器访问，以获得更完整的项目录入、资料维护与简历导出体验。

## 项目介绍

Proofile 是一个面向学生成长与求职场景的数字化能力档案平台。项目围绕“项目经历如何被长期积累、结构化整理、可信展示、快速转化为投递材料”这一核心问题展开，将原本零散、临时、碎片化的经历记录，转化为可持续更新的项目卡片、能力图谱与投递版简历。

与传统只在求职前集中“赶制简历”的方式不同，Proofile 强调在日常学习、竞赛、科研、实习和项目实践过程中持续沉淀内容，让用户在需要展示自己时，已经拥有一套结构清晰、可验证、可复用的成长档案。

## 目标群体

- 高校本科生、研究生，尤其是正处于实习、求职、保研、竞赛和科研申报阶段的学生。
- 缺少系统化项目整理习惯，希望把经历沉淀为长期资产的学生用户。
- 需要快速输出简历、项目证明材料、能力展示页面的校园群体。
- 后续也可扩展至就业指导老师、辅导员、创新创业项目导师等教育场景使用者。

## 项目意义

- 降低简历制作门槛：帮助学生把“做过的事”快速整理成“可投递、可表达、可比较”的简历内容。
- 提升成长记录质量：通过结构化项目卡片和能力图谱，让学生的成长轨迹更连续、更清晰，而不是只停留在临时回忆。
- 强化能力可视化表达：将抽象能力转化为更容易理解和展示的内容，辅助求职、答辩、面试和项目申报。
- 支持教育数字化与创新创业场景：该项目不仅是求职工具，也可作为学生成长档案、项目成果展示和能力认证探索的数字底座。
- 具备创赛延展性：后续可进一步拓展为校园创新创业、就业服务、成长档案管理等多场景平台，具有明确的产品深化空间。

## 核心特性

- 项目卡片管理：支持创建、编辑、删除项目条目，沉淀结构化项目素材。
- 密码登录认证：基于 Supabase Auth 的邮箱密码登录，自动维护会话状态。
- 简历资料维护：独立资料页维护姓名、联系方式、教育背景和手动奖项补充。
- AI 简历生成：调用兼容 OpenAI SDK 的 DeepSeek 接口，将项目卡片自动提炼为结构化简历。
- A4 投递版简历：将结构化简历渲染为可打印、可导出 PDF 的投递版模板。
- 能力雷达图：基于项目内容自动计算技术能力、团队协作、创新能力、科研能力和表达能力评分。

## 技术栈与运行要求

| 类别 | 说明 |
| --- | --- |
| 语言 | TypeScript |
| 运行时 | Node.js（仓库未显式锁定版本，建议使用与 Next.js 16 兼容的 LTS 版本） |
| 前端框架 | Next.js 16.1.6（App Router） |
| UI | React 19.2.3 |
| 样式 | Tailwind CSS 4 + `@tailwindcss/postcss` |
| 数据库 | Supabase PostgreSQL |
| 认证 | Supabase Auth |
| 图表 | ECharts 6 |
| AI 调用 | OpenAI SDK 6.x，后端接入 DeepSeek 兼容接口 |
| 代码检查 | ESLint 9 + `eslint-config-next` |

## 快速开始 / 安装

1. 克隆仓库并安装依赖。

```bash
git clone https://github.com/caiiiimiiii/proofile.git
cd proofile
npm install
```

2. 配置环境变量。
   Windows 下可以手动复制 `.env.example` 为 `.env.local`，然后补充完整变量。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

3. 初始化数据库。
   如果是全新 Supabase 项目，执行 `database/schema.sql`。
   如果已有旧版数据库结构，执行 `database/profile_resume_migration.sql` 做增量迁移。

4. 启动开发服务器。

```bash
npm run dev
```

5. 打开浏览器访问。

```text
http://127.0.0.1:3000
```

如仅需体验已部署版本，也可以直接访问：

```text
https://proofile-gold.vercel.app/
```

6. 生产构建与本地预览。

```bash
npm run build
npm run start
```

## 配置

虽然仓库中的 `.env.example` 只列出了公开 Supabase 变量，但代码实际还会读取 DeepSeek 相关服务端变量。完整变量如下：

| 变量名 | 必填 | 用途 | 来源 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL，前后端都会用到 | `.env.example`、`src/lib/supabase.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 匿名公钥，用于前端鉴权和数据库访问 | `.env.example`、`src/lib/supabase.ts` |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek / 兼容 OpenAI 接口的服务端调用密钥 | `src/app/api/generate-resume/route.ts` |
| `DEEPSEEK_BASE_URL` | 否 | DeepSeek 兼容接口地址，默认 `https://api.deepseek.com` | `src/app/api/generate-resume/route.ts` |
| `DEEPSEEK_MODEL` | 否 | 调用的模型名称，默认 `deepseek-chat` | `src/app/api/generate-resume/route.ts` |

示例配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
DEEPSEEK_API_KEY=sk-xxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

## 使用方式

推荐的浏览器使用流程如下：

1. 访问 `/login`，使用已存在的 Supabase Auth 账号进行邮箱密码登录。
2. 进入 `/projects` 管理项目卡片，录入项目名称、角色、描述、技能和结果。
3. 进入 `/profile` 填写基础信息、教育背景和手动补充奖项。
4. 进入 `/resume` 点击“生成简历”，系统会基于项目卡片与个人资料生成 A4 投递版简历。
5. 使用浏览器打印功能导出 PDF。

如果只是想快速查看线上效果，可以直接打开：

```text
https://proofile-gold.vercel.app/
```

常用页面：

- `/login`：登录页
- `/dashboard`：仪表盘与工作台入口
- `/projects`：项目列表
- `/projects/new`：新建项目
- `/profile`：简历基础资料维护
- `/resume`：AI 简历生成与导出页

如果需要直接测试简历生成接口，可以调用：

```bash
curl -X POST http://127.0.0.1:3000/api/generate-resume \
  -H "Authorization: Bearer <access_token>"
```

成功响应示例：

```json
{
  "resume": {
    "profile": {
      "name": "张三",
      "targetRole": "前端开发工程师",
      "age": "24岁",
      "location": "浙江杭州",
      "phone": "13800000000",
      "email": "you@example.com",
      "photoUrl": ""
    },
    "summary": "具备项目梳理、前端实现与 AI 内容生成能力，能够将复杂经历整理为适合投递和展示的职业材料。",
    "education": [
      {
        "date": "2021.09-2025.06",
        "school": "某某大学",
        "major": "计算机科学与技术",
        "degree": "本科",
        "coursework": ["数据结构", "操作系统"]
      }
    ],
    "projects": [
      {
        "title": "高校科研协作档案系统",
        "role": "前端开发 / 项目负责人",
        "date": "2025.03 - 2025.06",
        "bullets": ["负责项目核心模块的设计与实现。", "推动项目能力画像与简历输出闭环。"],
        "skills": ["React", "Next.js", "Supabase"],
        "category": "project"
      }
    ],
    "skills": ["React", "Next.js", "Supabase"],
    "awards": ["从项目中提炼出的亮点"],
    "manualAwards": ["CET-6"]
  }
}
```

## 开发指南

本项目当前没有独立的 `CONTRIBUTING.md`，但仓库内已有开发约束和工作记录，建议先阅读：

- `ai/coding_rules.md`
- `ai/tasks.md`
- `ai/project.md`
- `ai/product.md`
- `ai/architecture.md`

常用开发命令：

```bash
npm run dev
npm run lint
npm run build
```

当前仓库未提供自动化测试脚本，因此至少建议在提交前执行：

```bash
npm run lint
npm run build
```

提交信息规范来自 `ai/coding_rules.md`，格式为：

```text
类型: 简短描述
```

示例：

```text
feat: 添加项目卡片
fix: 修复简历生成接口
docs: 更新 README
```

## API 参考

### `POST /api/generate-resume`

用途：
基于当前登录用户的项目卡片、个人资料、教育信息和手动奖项，生成结构化投递版简历。

认证：
必须在请求头中传入 `Authorization: Bearer <access_token>`。

请求体：
无需请求体。

成功返回：
`200 OK`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `resume.profile` | object | 姓名、邮箱、电话、所在地、年龄、求职意向、照片链接 |
| `resume.summary` | string | 模型生成的自我评价 |
| `resume.education` | array | 教育背景数组 |
| `resume.projects` | array | 项目与实习条目数组，使用 `category` 区分 |
| `resume.skills` | array | 技能/证书列表 |
| `resume.awards` | array | 从项目卡片自动提炼出的奖项/亮点 |
| `resume.manualAwards` | array | 用户在资料页手动补充的奖项 |

错误场景：

- `401`：缺少或无效的 Bearer Token
- `400`：当前用户没有项目卡片，无法生成简历
- `500`：Supabase 环境变量缺失、数据库读取失败或 AI 调用异常

额外说明：
如果模型返回的 JSON 结构不合法，服务端会回退到基于项目卡片的兜底简历结构，而不是直接返回空结果。

## 项目结构

- `src/app/`：Next.js App Router 页面与 API 路由。
- `src/app/login/`：登录页面，当前为邮箱密码登录。
- `src/app/dashboard/`：仪表盘页面，展示工作台入口和能力雷达图。
- `src/app/projects/`：项目列表、新建和编辑页面。
- `src/app/profile/`：简历基础资料维护页面。
- `src/app/resume/`：A4 投递版简历预览、生成与 PDF 导出页面。
- `src/app/api/generate-resume/route.ts`：结构化简历生成接口。
- `src/components/`：可复用 UI 组件，包括项目表单、资料表单、项目卡片、雷达图组件。
- `src/lib/supabase.ts`：Supabase 客户端初始化。
- `src/lib/radar.ts`：能力雷达图评分逻辑。
- `src/lib/resume.ts`：结构化简历数据模型、解析与兜底逻辑。
- `database/schema.sql`：完整数据库结构初始化脚本。
- `database/profile_resume_migration.sql`：旧库升级到资料/简历结构的增量迁移脚本。
- `public/`：静态资源。
- `ai/`：产品、架构、任务、提示词和开发约束文档。
- `简历模板.html`：本地参考用的简历模板样例文件，不参与运行时逻辑。

## 贡献方式

当前仓库没有单独的贡献文档，建议按以下流程协作：

1. 先阅读 `ai/` 目录下的产品与架构说明。
2. 在独立分支上开发功能或修复问题。
3. 完成后至少执行 `npm run lint` 和 `npm run build`。
4. 使用 `类型: 简短描述` 规范提交。
5. 通过 Pull Request 提交并进行代码评审。

## 许可证

当前仓库未检测到 `LICENSE` / `LICENSE.md` 文件，也没有在包管理元数据中声明许可证信息。  
这意味着该项目默认不应被视为已明确开源授权；如果计划公开分发或接受外部贡献，建议补充正式许可证文件。

## 致谢

本项目主要依赖以下开源工具与服务：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [ECharts](https://echarts.apache.org/)
- [OpenAI Node SDK](https://github.com/openai/openai-node)
- DeepSeek 兼容接口

## 常见问题

### 为什么新邮箱无法直接登录？

当前代码只实现了邮箱密码登录，没有公开注册流程。只有已经存在于 Supabase Auth 中的用户，才能使用密码登录。

### 为什么保存资料或项目时提示表不存在或权限问题？

请先在 Supabase 中执行 `database/schema.sql`（全新项目）或 `database/profile_resume_migration.sql`（旧项目升级），并确认 RLS 策略已生效。

### 为什么点击“生成简历”会失败？

最常见的原因有三个：

1. 当前账号还没有创建任何项目卡片。
2. `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL` 或 `DEEPSEEK_MODEL` 配置不正确。
3. Supabase 鉴权会话失效，导致接口拿不到有效的 `Authorization Bearer token`。
