# 第四轮审计：后端 API 粗读

> 本文件是 `PROJECT_ANALYSIS_AUDIT.md` 的第四轮补充文件。由于主审计文件内容已经较长，本轮先以独立文件记录，后续在整理正式 `PROJECT_ANALYSIS.md` 时统一合并。

## 1. 本轮读取范围

本轮重点读取 `server/app/api/routes` 下的后端路由文件，确认前端已调用接口是否真实存在，以及各模块的权限、Redis、SMTP、AI、缓存等工程机制入口。

| 文件 | 模块 | 主要作用 |
| --- | --- | --- |
| `server/app/api/routes/auth.py` | Auth | 邮箱验证码、注册、登录、密码重置、退出登录 |
| `server/app/api/routes/users.py` | Users/Profile | 当前用户、资料更新、头像、统计、通知设置、偏好设置 |
| `server/app/api/routes/home.py` | Home | 首页 summary 聚合接口 |
| `server/app/api/routes/patients.py` | Patients | 患者列表、新增、详情、更新、患者 dashboard |
| `server/app/api/routes/records.py` | Records | 护理记录列表、新增、详情、更新 |
| `server/app/api/routes/tasks.py` | Tasks | 护理任务列表、新增、详情、更新、完成 |
| `server/app/api/routes/trends.py` | Trends | 指标趋势 series 与趋势分析 |
| `server/app/api/routes/ai.py` | AI | AI assistant 普通接口、SSE 流式接口、调用限流 |
| `server/app/api/routes/knowledge.py` | Knowledge | 知识分类、文章列表、详情、浏览、点赞、收藏、相关推荐 |
| `server/app/api/routes/community.py` | Community | 社区发帖、列表、详情、评论、点赞、收藏、举报、相关推荐 |
| `server/app/api/routes/admin.py` | Admin | 后台登录、Dashboard、用户、审核、知识管理、Prompt、AI 日志 |
| `server/app/api/routes/care.py` | Care | 照护工作台聚合接口 |

## 2. 后端路由总体结论

当前后端路由与前台、后台 service 的匹配度较高，主业务接口已经基本齐全。后端 API 以 FastAPI Router 模块化组织，业务模块包括认证、用户、首页、患者、护理记录、护理任务、趋势、AI、知识、社区、后台和照护工作台。

主要特点：

1. 大部分业务接口都通过 `get_current_user` 或 `get_current_admin` 做身份依赖。
2. 普通用户接口与后台管理员接口分离。
3. 后端统一使用 `success_response(...)` 包装成功响应。
4. AI、知识分类、后台 Dashboard、照护工作台已经出现 Redis 限流或缓存逻辑。
5. 邮箱验证码接口已经有 SMTP 发送入口和 debugCode 控制逻辑。

## 3. 后端 API 模块审计表

| 模块 | 已确认 API | 权限依赖 | 特殊机制 | 论文表述建议 |
| --- | --- | --- | --- | --- |
| Auth | `/api/auth/email/send-code`、`/api/auth/register`、`/api/auth/login`、`/api/auth/password/reset`、`/api/auth/logout` | send-code/register/login/reset 不依赖当前用户；logout 当前无 token 黑名单 | send-code 调用发送频控、生成验证码、SMTP/console 邮件发送；login 调用 IP 登录频控 | 可写“邮箱验证码注册、邮箱密码登录、密码重置、SMTP/console 双模式验证码”。logout 只可写为前端清理/后端返回成功，不宜写成服务端强制 token 失效 |
| Users | `/api/users/me`、`PUT /api/users/me`、`PUT /api/users/me/avatar`、stats、notification-settings、preferences | `get_current_user` | 用户资料、统计、通知和偏好设置均需登录 | 可写“个人资料、头像 URL、用户统计、通知设置、偏好设置”。头像更像 URL 更新，不宜写成完整图片上传存储，除非后续确认 service 支持文件上传 |
| Home | `/api/home/summary` | `get_current_user` | 首页聚合 service | 可写“首页工作概览聚合接口” |
| Patients | `GET/POST /api/patients`、`GET/PUT /api/patients/{id}`、`GET /api/patients/{id}/dashboard` | `get_current_user` | 支持 keyword、page、pageSize 查询 | 可写“患者基础档案 CRUD 与患者中心 dashboard” |
| Records | `GET/POST /api/care-records`、`GET/PUT /api/care-records/{id}` | `get_current_user` | 支持 patientId、recordType、分页；新增/更新由 service 处理 metrics | 可写“护理记录列表、新增、详情和更新接口均存在”。前端未见独立详情路由时，论文页面描述要谨慎 |
| Tasks | `GET/POST /api/tasks`、`GET/PUT /api/tasks/{id}`、`POST /api/tasks/{id}/complete` | `get_current_user` | 支持 patientId、status、repeatRule、分页 | 可写“护理任务 CRUD 与完成状态流转” |
| Trends | `GET /api/patients/{id}/metrics/trend`、`GET /api/patients/{id}/metrics/trend-analysis` | `get_current_user` | 支持 metricType、startAt、endAt | 可写“指标趋势查询与趋势分析接口”。趋势分析是辅助解释，不应写成医学诊断 |
| AI | `POST /api/ai/assistant`、`POST /api/ai/assistant/stream` | `get_current_user` | Redis 计数限流：每分钟 10 次、每天 200 次；stream 返回 SSE | 可写“AI 普通接口、流式输出和调用限流”。流式接口是后端将最终回答切块 SSE 输出，不等同于模型原生实时 token stream |
| Knowledge | categories、articles、detail、related、view、like/delete like、bookmark/delete bookmark | `get_current_user` | 分类接口使用 Redis JSON 缓存 600 秒 | 可写“知识分类、文章学习、浏览、点赞、收藏和相关推荐” |
| Community | posts、detail、comments、like、bookmark/delete、report、related、author posts | `get_current_user` | 发帖、评论、举报等由 service 处理审核/状态逻辑 | 可写“社区发帖、评论、点赞、收藏、举报与相关推荐”。当前 route 未见取消点赞接口、关注接口和评论回复接口 |
| Admin | login、me、dashboard、users、review posts、knowledge articles、prompts、ai-logs | `get_current_admin`，login 除外 | Dashboard 使用 Redis JSON 缓存 60 秒；其他接口由后台 service 处理 | 可写“后台管理端支持用户、审核、知识、Prompt、AI 日志和 Dashboard”。评论审核 route 未见，前端也主要是帖子审核 |
| Care | `/api/care/workbench` | `get_current_user` | 按 userId 使用 Redis JSON 缓存 30 秒 | 可写“照护工作台聚合接口与短缓存” |

## 4. 前后端契约对齐结论

### 4.1 已基本对齐的接口

| 前端模块 | 后端对应 | 对齐情况 |
| --- | --- | --- |
| Auth 登录/注册/重置 | `auth.py` | 基本对齐 |
| Profile | `users.py` | 基本对齐 |
| Home | `home.py` | 基本对齐 |
| Patients | `patients.py` | 基本对齐 |
| Records | `records.py` | service 与后端对齐；页面层未见记录详情路由 |
| Tasks | `tasks.py` | 基本对齐 |
| Trends | `trends.py` | 基本对齐，支持时间范围和趋势分析 |
| AI | `ai.py` | 基本对齐，普通接口与流式接口均存在 |
| Knowledge | `knowledge.py` | 基本对齐 |
| Community | `community.py` | 主线对齐；取消点赞、关注、评论回复不在当前 route 中 |
| Admin | `admin.py` | 主线对齐；后台评论审核和高级用户管理不应夸大 |
| Care | `care.py` | 基本对齐 |

### 4.2 可以写入论文的后端能力

1. **模块化 REST API**：后端按业务模块拆分 Router。
2. **统一认证依赖**：普通用户接口使用 `get_current_user`，后台接口使用 `get_current_admin`。
3. **邮箱验证码链路**：send-code 包含频控检查、验证码生成、冷却标记和 SMTP/console 发送入口。
4. **Redis 限流**：AI 接口有分钟级和日级调用限流。
5. **Redis 短缓存**：知识分类、后台统计、照护工作台使用 Redis JSON 缓存。
6. **护理记录双层模型接口支撑**：records route 与 record service 支持记录和 metrics 的写入/更新。
7. **趋势分析接口**：trend-analysis 独立于 series 接口存在。
8. **AI 流式响应接口**：`/api/ai/assistant/stream` 返回 `text/event-stream`。
9. **后台管理接口**：管理员登录、用户状态、社区帖子审核、知识文章、Prompt、AI 日志均有后端 route。

## 5. 本轮发现的问题与谨慎表述点

1. **logout 不是服务端 token 黑名单机制**：`/api/auth/logout` 当前只返回成功响应，未在 route 中看到 token blacklist。因此论文可写“退出登录接口与前端清理登录态”，不要写“服务端强制注销 JWT”。
2. **头像接口更像 avatar URL 更新**：`PUT /api/users/me/avatar` 接收 schema payload，而不是文件上传 route；论文不要写成完整头像文件上传系统，除非后续细读 service 后确认有文件处理。
3. **社区未见取消点赞接口**：community route 有 `POST /posts/{id}/like`，但未见 `DELETE /like`。如果前端表现为单向点赞，应在论文中避免写“支持取消点赞”。
4. **社区未见关注作者、评论回复、评论点赞接口**：这些应作为后续扩展。
5. **后台审核 route 当前只确认帖子审核**：`/api/admin/reviews/posts` 存在，但未见 `/reviews/comments` route。虽然 Dashboard 有 pendingCommentCount 字段，论文仍应以代码为准写“帖子审核”为主。
6. **后台用户详情 route 存在但前端未充分使用**：后端有 `GET /api/admin/users/{user_id}`，但上一轮前端用户页未见详情弹窗。论文可写“接口支持详情查询”，页面实现部分应写“用户列表与状态管理”。
7. **AI stream 是后端切分最终回答**：route 中先调用 `handle_assistant_message` 得到完整 response，再按 chunk 输出 SSE。因此它是“前端流式展示接口”，不是严格意义上的模型原生流式 token 透传。
8. **知识分类、Dashboard、工作台有缓存，但缓存失效逻辑需下一轮读 service**：本轮只确认 route 层读写缓存，缓存失效点需在 services/cache_service 或各业务 service 里继续确认。

## 6. 下一轮计划：后端 Service 与核心机制细读

下一轮读取范围：

| 范围 | 目标 |
| --- | --- |
| `server/app/services/auth_service.py` | 验证码、注册、登录、密码重置、Redis 限流和错误锁定 |
| `server/app/services/email_service.py` | QQ SMTP / console 发送实现 |
| `server/app/core/config.py` | 数据库、JWT、Redis、SMTP、DeepSeek、审核等配置 |
| `server/app/core/redis.py` | Redis helper 的真实能力与 fallback 行为 |
| `server/app/services/cache_service.py` | 缓存 key 与缓存失效逻辑 |
| `server/app/services/ai_service.py` | AI 意图识别、DeepSeek、Prompt、RAG、fallback、日志写入 |
| `server/app/services/prompt_service.py` | Prompt 模板是否真正参与 AI 调用 |
| `server/app/services/rag_service.py` | RAG 检索来源和用途 |
| `server/app/services/trend_service.py` | 趋势 series 和 trend-analysis 的实际计算逻辑 |
| `server/app/services/record_service.py` | care_record + care_metric 双层写入逻辑 |
| `server/app/services/community_service.py` | 发帖、评论、审核状态、内容审核、举报逻辑 |
| `server/app/services/admin_service.py` | Dashboard 统计、后台管理、Prompt 和 AI log 查询逻辑 |

下一轮输出目标：形成“核心业务服务与工程机制审计表”，确认论文中的技术亮点能否成立，尤其是 Redis、SMTP、AI、Prompt、RAG、趋势分析、内容审核和缓存失效。