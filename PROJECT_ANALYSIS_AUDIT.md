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

## 2. 第二轮：前台客户端粗读

### 2.1 本轮读取范围

本轮重点读取了 `client/src` 中的前台路由、共享请求层、认证存储、以及主要业务模块的 service/state/page 文件。已读取并确认：

| 文件 | 作用 |
| --- | --- |
| `client/src/app/routes.tsx` | 前台与后台路由总表 |
| `client/src/shared/lib/apiClient.ts` | 前端统一 API client，封装 baseURL、query、token、统一响应解析和错误处理 |
| `client/src/shared/constants/env.ts` | 前端 API baseURL 配置，默认指向当前 hostname 的 8000 端口 |
| `client/src/shared/lib/auth.ts` | 普通用户 token、refreshToken、currentUser 的 localStorage/sessionStorage 存储工具 |
| `client/src/features/auth/services/auth.service.ts` | 登录、注册、发送验证码、重置密码、获取当前用户、退出登录 |
| `client/src/features/auth/state/useRegisterFormState.ts` | 注册表单状态、验证码发送倒计时、表单校验与提交 |
| `client/src/app/pages/RegisterPage.tsx` | 注册页 UI 与交互 |
| `client/src/features/home/pages/HomePage.tsx` | 首页聚合视图、刷新、任务完成、患者入口 |
| `client/src/features/home/services/home.service.ts` | 首页数据 API 映射 `/api/home/summary` |
| `client/src/app/pages/PatientListPage.tsx` | 患者列表页 |
| `client/src/features/patients/services/patient.service.ts` | 患者列表、详情、表单、患者 dashboard 服务 |
| `client/src/app/pages/RecordListPage.tsx` | 护理记录列表页 |
| `client/src/features/records/services/record.service.ts` | 护理记录列表、详情、创建、更新服务 |
| `client/src/features/tasks/pages/TaskListPage.tsx` | 护理任务列表页 |
| `client/src/features/tasks/services/task.service.ts` | 护理任务列表、详情、创建、更新、完成服务 |
| `client/src/features/trends/services/trend.service.ts` | 趋势 series 和趋势分析 API 服务 |
| `client/src/features/trends/state/useHealthTrendState.ts` | 趋势页状态、week/month/custom 范围计算、趋势分析加载 |
| `client/src/app/pages/AIAssistantPage.tsx` | AI 助手聊天页、流式输出、语音输入、AI 草稿确认入口 |
| `client/src/features/ai/services/assistant.service.ts` | AI 普通请求、流式请求、AI 草稿 sessionStorage 存取 |
| `client/src/features/knowledge/services/knowledge.service.ts` | 知识分类、列表、详情、浏览、点赞、收藏、相关推荐 API |
| `client/src/features/knowledge/pages/KnowledgeDetailPage.tsx` | 知识详情页、视频播放/缺省提示、分享、点赞、相关文章 |
| `client/src/features/community/services/community.service.ts` | 社区列表、详情、发帖、评论、点赞、收藏、举报、相关帖子 API |
| `client/src/features/profile/services/profile.service.ts` | 用户资料、头像、统计、通知设置、偏好设置服务 |
| `client/src/features/care/services/care.service.ts` | 照护工作台 API 和任务完成复用 |
| `client/src/features/care/pages/CareWorkflowPage.tsx` | 照护工作台页面，患者/记录/任务聚合展示 |

### 2.2 共享请求层结论

`apiClient.ts` 是前端请求统一入口。它负责：

1. 使用 `env.apiBaseUrl` 拼接 API URL。
2. 自动读取普通用户 token 并写入 `Authorization: Bearer ...`。
3. 支持 query 参数过滤空值。
4. 统一解析后端 `{ success, data, message }` 包装。
5. 后端返回 `success: false` 或 HTTP 非 2xx 时抛出 `ApiError`。

这部分可写入论文“前后端交互设计”与“前端 API 封装”。

### 2.3 环境变量与认证存储结论

`env.ts` 默认将前端请求指向当前 hostname 的 `8000` 端口，也支持通过 `VITE_API_BASE_URL` 覆盖。`auth.ts` 将普通用户 token、refreshToken 和当前用户信息封装为 localStorage/sessionStorage 双模式存储；登录时的“记住我”会决定 token 持久化位置。

论文中可表述为：系统前端通过统一 API client 和 token 存储工具实现认证态请求；普通用户 token 与后台管理员 token 后续需在后台审计中单独确认。

### 2.4 前台模块审计表

| 模块 | 页面/入口 | 前端实现状态 | 主要 API | 论文表述建议 |
| --- | --- | --- | --- | --- |
| Auth | `/login`、`/register`、`/forgot-password` | 登录、注册、发送验证码、重置密码均通过 service 调用后端；注册页有表单校验和 60 秒倒计时 | `/api/auth/email/send-code`、`/api/auth/register`、`/api/auth/login`、`/api/auth/password/reset`、`/api/users/me` | 可写为“邮箱验证码注册 + 邮箱密码登录 + 记住我”。需在后端轮次确认 QQ SMTP、限流和 reset API 是否完整实现 |
| Home | `/` | 首页使用 `useHomePageState` 读取聚合数据，支持刷新、任务完成、患者跳转 | `/api/home/summary`、任务完成接口 | 可写为“首页工作概览与快捷入口”，不要夸大为独立 BI 仪表盘 |
| Patients | `/patients`、`/patients/new`、`/patients/:id`、`/patients/:id/edit` | 列表页仍位于 `app/pages`，但使用 `usePatientListState` 和 service；患者 service 覆盖列表、详情、新增、更新、dashboard | `/api/patients`、`/api/patients/{id}`、`/api/patients/{id}/dashboard` | 可写为“患者基础档案管理”。患者字段应保持 MVP，不宜写复杂病历档案系统 |
| Records | `/records`、`/records/new` | 列表页仍位于 `app/pages`，但 service 已有列表、详情、创建、更新；列表卡片当前主要展示摘要，没有单独详情路由 | `/api/care-records`、`/api/care-records/{id}` | 可写为“护理记录列表与新增”。若论文写“记录详情/编辑”，需后续确认页面入口是否完整 |
| Tasks | `/tasks`、`/tasks/new` | 任务列表和表单已在 `features/tasks/pages`，支持筛选、创建、完成；service 覆盖列表、详情、创建、更新、完成 | `/api/tasks`、`/api/tasks/{id}`、`/api/tasks/{id}/complete` | 可写为“护理任务管理与状态跟踪” |
| Trends | `/health-trend/:patientId` | state 已支持 week/month/custom 范围计算，血压双指标组合，单指标 series，以及趋势分析加载 | `/api/patients/{id}/metrics/trend`、`/api/patients/{id}/metrics/trend-analysis` | 可写为“基于结构化指标的趋势图与辅助分析”。AI 分析应表述为护理参考，不是医学诊断 |
| AI | `/ai-assistant`、`/ai-confirm` | AI 助手支持流式输出、快捷 prompt、语音输入、草稿预览和确认入口；AI 草稿暂存在 sessionStorage | `/api/ai/assistant`、`/api/ai/assistant/stream`、记录/任务保存接口 | 可写为“AI 草稿生成 + 人工确认保存”。不宜写为 AI 直接写库或完整长期会话系统 |
| Knowledge | `/knowledge`、`/knowledge/:id` | 知识 service 覆盖分类、列表、详情、浏览、点赞、取消点赞、收藏、取消收藏、相关推荐；详情页支持视频 URL 播放或缺省提示，分享使用浏览器 share/复制能力 | `/api/knowledge/categories`、`/api/knowledge/articles` 等 | 可写为“知识学习与互动”。视频能力应写为“支持配置视频 URL”，不要写成完整视频平台 |
| Community | `/community`、`/community/new`、`/community/:id` | 社区 service 覆盖列表、详情、发帖、评论、点赞、收藏、取消收藏、举报、相关推荐、作者帖子 | `/api/community/posts`、comments、like、bookmark、report | 可写为“社区发帖、评论与审核前置”。关注、评论回复等未在本轮看到，不应写成已完成 |
| Profile | `/profile`、`/profile/:section` | service 覆盖资料、头像、统计、通知设置、偏好设置；静态说明页后续需读页面确认 | `/api/users/me`、avatar、stats、notification-settings、preferences | 可写为“个人资料与偏好设置”。导出/删除数据若仅为文案，不能写成已实现 |
| Care | `/care` | 工作台使用独立 `/api/care/workbench` 聚合接口；页面支持患者、记录、任务 tab、搜索、刷新和任务完成 | `/api/care/workbench`、任务完成接口 | 可写为“照护工作台聚合入口”。记录卡目前主要展示摘要，是否有记录详情入口需后续细读或产品验收 |

### 2.5 本轮确认的实现亮点

1. **统一 API client**：前端所有主业务请求集中到 `apiClient`，统一处理 token、响应包装和错误抛出。
2. **普通用户认证存储双模式**：`rememberMe` 决定 token 存在 localStorage 还是 sessionStorage。
3. **护理记录动态指标方向明确**：record service 会将护理记录草稿转换为 metrics 后提交，符合 `care_records + care_metrics` 双层模型。
4. **趋势模块已具备时间范围和分析接口接入**：前端不仅请求 series，还会请求 trend-analysis。
5. **AI 确认流边界清晰**：AI 助手只生成草稿，草稿保存在 sessionStorage，用户到确认页后再保存到记录或任务接口。
6. **知识、社区、工作台已经摆脱纯静态数据**：对应 service 已覆盖主要交互接口。

### 2.6 本轮发现的问题与谨慎表述点

1. 前台并非所有页面都在 `features/pages` 中，仍存在 `client/src/app/pages` 页面；论文中应写“以 feature 模块组织为主”，不要写成完全 feature 化。
2. 护理记录 service 有 `getCareRecord` 和 `updateCareRecord`，但当前路由只看到 `/records` 与 `/records/new`，没有看到 `/records/:id`。若论文写记录详情/编辑，需要后续补充或谨慎表述为“接口层支持”。
3. AI 草稿通过 sessionStorage 暂存，而不是后端长期会话草稿；论文中应写“前端临时草稿确认机制”，不要写成完整 AI 会话管理系统。
4. AIAssistant 支持浏览器语音识别，但依赖浏览器安全上下文和 SpeechRecognition；论文中可作为“语音输入辅助”，但应避免写成稳定跨端语音识别服务。
5. Knowledge 详情页已经支持 HTML5 video URL，但如果没有配置 videoUrl，会展示缺省提示；论文中可写“支持视频知识 URL 播放”，不要夸大为完整视频平台。
6. Community 本轮确认了发帖、评论、点赞、收藏、举报，但未确认关注、评论回复、评论点赞等高级社交能力；论文中应作为后续扩展。
7. Profile service 有头像上传接口，但还需后续读后端 users 路由确认文件保存方式和大小限制。

## 3. 下一轮计划：后台管理端粗读

下一轮读取范围：

| 范围 | 目标 |
| --- | --- |
| `admin/src/admin/model.ts` | 后台 DTO、状态枚举、表单草稿定义 |
| `admin/src/admin/services/admin.service.ts` | 后台 API 封装、admin token 存储、请求鉴权方式 |
| `admin/src/admin/state/*` | Dashboard、用户、审核、内容、Prompt、AI 日志状态逻辑 |
| `admin/src/admin/pages/AdminLoginPage.tsx` | 管理员登录 |
| `admin/src/admin/pages/AdminDashboardPage.tsx` | 后台统计与快捷入口 |
| `admin/src/admin/pages/AdminUsersPage.tsx` | 用户管理 |
| `admin/src/admin/pages/AdminReviewsPage.tsx` | 社区审核 |
| `admin/src/admin/pages/AdminContentPage.tsx` | 知识内容管理 |
| `admin/src/admin/pages/AdminPromptPage.tsx` | Prompt 管理实现还是预留 |
| `admin/src/admin/pages/AdminAILogPage.tsx` | AI 日志查询和详情 |
| `client/src/app/components/AdminLayout.tsx` | 后台布局与是否有前端鉴权守卫 |

下一轮输出目标：形成“后台管理端模块审计表”，确认后台页面是否真实接 API，是否存在预留/降级功能，是否适合写入论文后台管理章节。