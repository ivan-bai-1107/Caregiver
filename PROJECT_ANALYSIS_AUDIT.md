# 项目代码库审计记录

> 本文件用于从粗到细审计当前仓库代码，并为后续完善 `PROJECT_ANALYSIS.md` 提供依据。审计过程采用“先结构、后模块、再细节”的方式推进，避免仅凭记忆或部分文件编写论文分析文档。

## 0. 审计原则

1. 以当前 `main` 分支真实代码为准。
2. 每一轮只记录已经读取和确认过的范围。
3. 已实现、预留、降级和后续扩展必须分开表述。
4. 不把 README 或旧分析文档中的描述直接当作事实，必须结合代码验证。
5. 论文中可写入的内容，应以实际代码结构、接口、模型、服务和脚本为依据。

## 1. 第一轮：仓库总体结构粗读

### 1.1 本轮读取范围

已读取并确认以下文件：

| 文件 | 作用 |
| --- | --- |
| `README.md` | 项目运行说明、模块概览、环境变量、Docker、Redis、SMTP、Smoke Test 说明 |
| `docker-compose.yml` | PostgreSQL 与 Redis 本地容器编排 |
| `client/package.json` | 前台客户端依赖与构建脚本 |
| `client/vite.config.ts` | Vite 配置、React/Tailwind 插件、路径别名 |
| `client/src/app/routes.tsx` | 前台与后台路由总表 |
| `server/app/main.py` | FastAPI 应用入口、CORS、异常处理、静态资源、路由挂载、健康检查 |

### 1.2 仓库目录边界确认

当前项目采用前后端分离结构，主要目录如下：

| 路径 | 类型 | 是否正式代码 | 作用 | 是否应写入论文 |
| --- | --- | --- | --- | --- |
| `client/` | 前台客户端 | 是 | Vite + React + TypeScript 客户端，包含前台页面、共享组件、路由、业务模块 | 是 |
| `admin/` | 后台管理端源码 | 是 | 后台页面、服务、状态和模型，通过客户端 Vite alias `@admin` 接入 | 是 |
| `server/` | 后端服务 | 是 | FastAPI、SQLAlchemy、Alembic、Redis、SMTP、AI、业务 API | 是 |
| `docker-compose.yml` | 本地基础设施配置 | 是 | PostgreSQL 16 和 Redis 7-alpine 容器编排 | 是 |
| `api.yaml` | API 描述 | 是/文档 | 接口契约描述，后续需与真实路由核对 | 可写入接口设计参考 |
| `PROJECT_ANALYSIS.md` | 原分析文档 | 文档 | 早期项目分析，需要按代码审计结果修订 | 作为待修订对象 |
| `PROJECT_ANALYSIS_REVISED.md` | 已生成修订初稿 | 文档 | 基于核心文件生成的初稿，不是最终逐文件审计版 | 可作为中间稿 |
| `PROJECT_ANALYSIS_AUDIT.md` | 当前审计记录 | 文档 | 记录逐轮审计结果，为最终文档提供依据 | 是 |

### 1.3 前端架构粗读结论

`client/package.json` 显示客户端采用 Vite + React + TypeScript 方向，主要依赖包括 React Router、Recharts、lucide-react、Radix UI、MUI、sonner 等。构建脚本主要是：

```bash
pnpm dev
pnpm build
```

`client/vite.config.ts` 中确认了以下 alias：

| alias | 指向 | 说明 |
| --- | --- | --- |
| `@` | `client/src` | 前台客户端主源码目录 |
| `@admin` | `admin/src/admin` | 后台管理端源码目录 |

这说明后台管理端虽然独立放在 `admin/` 目录，但通过客户端 Vite 配置整合进同一个前端构建与路由体系。

### 1.4 路由结构粗读结论

`client/src/app/routes.tsx` 显示当前前端主要路由包括：

#### 前台路由

| 路径 | 页面/模块 |
| --- | --- |
| `/login` | 登录页 |
| `/register` | 注册页 |
| `/forgot-password` | 找回密码页 |
| `/` | 首页 |
| `/care` | 照护工作台 |
| `/patients`、`/patients/new`、`/patients/:id`、`/patients/:id/edit` | 患者管理 |
| `/records`、`/records/new` | 护理记录 |
| `/tasks`、`/tasks/new` | 护理任务 |
| `/health-trend/:patientId` | 健康趋势 |
| `/ai-assistant`、`/ai-confirm` | AI 助手与确认页 |
| `/knowledge`、`/knowledge/:id` | 知识学习 |
| `/community`、`/community/new`、`/community/:id` | 社区交流 |
| `/profile`、`/profile/:section` | 个人中心 |

#### 后台路由

| 路径 | 页面/模块 |
| --- | --- |
| `/admin/login` | 管理员登录 |
| `/admin/dashboard` | 后台仪表盘 |
| `/admin/users` | 用户管理 |
| `/admin/reviews` | 内容审核 |
| `/admin/content` | 知识内容管理 |
| `/admin/prompts` | Prompt 管理 |
| `/admin/ai-logs` | AI 日志 |

### 1.5 后端入口粗读结论

`server/app/main.py` 显示后端应用使用 FastAPI，已实现：

1. `/uploads` 静态资源挂载。
2. CORS 中间件。
3. `HTTPException` 统一包装为 `{ success: false, message }`。
4. `RequestValidationError` 统一包装为 `{ success: false, message, errors }`。
5. `/health` 健康检查，返回 `status` 和 `redis` 状态。
6. 路由挂载包括：`auth`、`admin`、`users`、`home`、`care`、`community`、`knowledge`、`patients`、`records`、`tasks`、`trends`、`ai`。

这说明当前后端模块已经比较完整，下一轮应细读每个 route、schema、service、model 是否与前端页面和论文描述一致。

### 1.6 Docker 基础设施确认

`docker-compose.yml` 中包含：

| 服务 | 镜像 | 端口 | 说明 |
| --- | --- | --- | --- |
| `postgres` | `postgres:16` | `5432:5432` | 本地 PostgreSQL 数据库，数据库名 `caregiver_system` |
| `redis` | `redis:7-alpine` | `6379:6379` | 本地 Redis，开启 AOF 持久化 |

这部分可写入论文“运行环境与部署说明”或“系统实现环境”。

### 1.7 第一轮发现的问题与注意点

1. `README.md` 中对 Redis、SMTP、Prompt、RAG、趋势分析等能力描述较完整，但后续仍需逐模块读取代码验证，不应直接全部写入论文正文。
2. 当前路由中仍有少量页面来自 `client/src/app/pages`，例如登录、注册、患者列表、患者表单、记录列表、趋势、AI 页面等；并非所有前台页面都已完全迁移到 `features/pages`。
3. 后台源码通过 `@admin` alias 接入，论文中应说明后台管理端与前台共享构建环境，但逻辑上属于独立管理端。
4. `PROJECT_ANALYSIS_REVISED.md` 目前是基于核心文件生成的中间稿，不是最终逐文件审计版。

## 2. 下一轮计划：前台客户端粗读

下一轮读取范围：

| 范围 | 目标 |
| --- | --- |
| `client/src/app` | 应用入口、布局、路由、旧页面遗留情况 |
| `client/src/shared` | API client、认证工具、UI、布局、主题 |
| `client/src/entities` | 患者、记录、任务、AI、趋势等领域模型 |
| `client/src/features/auth` | 登录注册、找回密码、认证状态 |
| `client/src/features/home` | 首页聚合数据与状态 |
| `client/src/features/patients` | 患者详情与模型 |
| `client/src/features/records` | 记录表单、动态指标、记录服务 |
| `client/src/features/tasks` | 任务列表和表单 |
| `client/src/features/trends` | 趋势查询、时间范围、图表数据 |
| `client/src/features/ai` | AI service、草稿、确认流 |
| `client/src/features/knowledge` | 知识列表、详情、点赞收藏 |
| `client/src/features/community` | 社区列表、详情、发帖、评论互动 |
| `client/src/features/profile` | 个人中心、通知、偏好、静态说明页 |
| `client/src/features/care` | 照护工作台 |

下一轮输出目标：形成“前台客户端模块审计表”，标明每个页面是否真实接 API、是否有降级功能、是否适合写入论文。