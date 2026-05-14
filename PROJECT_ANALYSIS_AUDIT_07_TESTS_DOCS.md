# 第七轮审计：测试脚本、README、API 文档与运行验证

> 本文件是项目代码库审计的第七轮补充文件，重点核对自动化 smoke test、README、后端 README、OpenAPI 草稿、依赖文件和 Docker 配置，为后续 `PROJECT_ANALYSIS.md` 中的系统测试、运行环境和部署说明章节提供依据。

## 1. 本轮读取范围

本轮已读取并确认以下文件：

| 文件 | 类型 | 审计目标 |
| --- | --- | --- |
| `server/scripts/api_smoke_test.py` | 测试脚本 | 确认自动化接口冒烟测试覆盖范围 |
| `README.md` | 根文档 | 确认项目说明、启动方式、Redis、SMTP、AI、API 概览是否与代码一致 |
| `server/README.md` | 后端文档 | 确认后端运行、环境变量、Docker、Seed、Smoke Test 说明 |
| `api.yaml` | OpenAPI 草稿 | 与真实 route/schema 对照，判断是否过时 |
| `client/package.json` | 前端依赖 | 确认前端技术栈和构建脚本 |
| `server/requirements.txt` | 后端依赖 | 确认 FastAPI、SQLAlchemy、Redis、httpx 等依赖 |
| `docker-compose.yml` | 基础设施 | 确认 PostgreSQL 和 Redis 容器配置 |

## 2. API Smoke Test 审计

### 2.1 测试入口与默认配置

`server/scripts/api_smoke_test.py` 默认配置为：

| 项 | 默认值 |
| --- | --- |
| `BASE_URL` | `http://127.0.0.1:8000` |
| `REDIS_URL` | `redis://127.0.0.1:6379/0` |
| 普通用户 | `caregiver@example.com / password123` |
| 管理员 | `admin@example.com / admin123` |

脚本使用 `httpx` 直接请求真实后端接口，并通过 `unwrap()` 统一解析 `{ success, data }` 包装。

### 2.2 Smoke Test 覆盖范围

当前 smoke test 覆盖面较广，不只是简单 health check。已确认包括：

| 测试范围 | 覆盖内容 |
| --- | --- |
| Health | `/health`，检查返回对象并包含 Redis 状态 |
| Auth 注册验证码 | 发送验证码、读取 debugCode、Redis 可用时检查 `email_code:{email}` 缓存、注册成功、注册后清理 Redis code |
| Auth 限流 | Redis 可用时，同邮箱连续发送验证码第二次应返回 429 |
| 登录 | 使用 seed 用户登录并校验 token |
| 当前用户 | `GET /api/users/me` |
| 患者 | 创建患者、按 keyword 分页查询患者 |
| 护理记录 | 创建血压记录、按 patientId/recordType 查询记录 |
| 趋势 | 查询收缩压趋势并确认包含新写入指标 |
| 任务 | 创建任务、按 patientId/status/repeatRule 查询、完成任务并确认 `completed` |
| Knowledge | 分类、文章列表、详情、相关推荐、浏览、点赞、收藏、取消收藏 |
| Community | 发帖、列表、详情、评论、点赞、收藏、取消收藏、举报、相关推荐、作者帖子 |
| Care Workbench | `/api/care/workbench` 聚合接口 |
| AI QA | AI 问答返回 `qa` 且无 draftPayload |
| AI Record Draft | AI 生成护理记录草稿，校验血压拆成收缩压/舒张压两个字段 |
| AI Task Draft | AI 生成任务草稿，校验 taskType/repeatRule/priority/remindOffsetMinutes |
| Admin | 管理员登录、me、Dashboard、用户列表、待审核帖子、审核帖子、知识文章列表、AI 日志列表 |

### 2.3 Smoke Test 的价值

该脚本可作为论文“系统测试”章节中的**接口冒烟测试**依据。它覆盖了从认证、患者、护理记录、任务、趋势、AI、知识、社区到后台审核的主链路。

论文中可以写：

> 系统编写了基于 httpx 的后端接口冒烟测试脚本，对登录、患者管理、护理记录、护理任务、趋势查询、AI 草稿生成、知识学习、社区互动和后台管理等关键接口进行端到端验证。

### 2.4 Smoke Test 的边界

该脚本不是完整 E2E 测试，也不是浏览器 UI 自动化测试。它主要测试后端 API 和部分业务状态，不覆盖：

1. 前端真实点击路径。
2. 页面样式和响应式布局。
3. 所有错误边界。
4. 浏览器语音输入。
5. DeepSeek 真实模型质量。
6. 邮件 SMTP 真实发送，因为默认依赖 console/debugCode。
7. 图片/文件上传类能力。

论文中应写为“接口冒烟测试”或“接口级集成测试”，不要写成“完整端到端自动化测试”。

## 3. README 审计

### 3.1 根 README 准确内容

根 `README.md` 基本准确描述了当前工程结构：

| 目录 | README 描述 | 代码审计结论 |
| --- | --- | --- |
| `client/` | Vite + React + TypeScript 客户端 | 与代码一致 |
| `admin/` | 后台管理前端模块，挂载在 `/admin/*` | 与 Vite alias 和路由一致 |
| `server/` | FastAPI + SQLAlchemy + Alembic 后端 | 与代码一致 |

README 对 Redis、QQ SMTP、DeepSeek、Seed、Smoke Test 的说明总体和前几轮代码审计一致。

### 3.2 README 中需要修正或谨慎的点

#### 3.2.1 `api.yaml` 与 README 主模块不一致

README 已经描述完整模块，包括 Knowledge、Community、Admin、Care Workbench、AI，但 `api.yaml` 仍是“First-batch non-AI APIs”的早期草稿，只覆盖 auth/home/patients/records/tasks/trend series。正式交付时应更新 `api.yaml`，或在 README 中注明它是旧版草稿。

#### 3.2.2 Admin 评论审核接口需要再次确认

README 和 `server/README.md` 都列出了：

```text
GET /api/admin/reviews/comments
PUT /api/admin/reviews/comments/{id}
```

但第 4 轮 route 审计中没有确认到这两个 route；第 3 轮后台前端也主要是帖子审核页面。因此正式文档和论文中应谨慎写“帖子审核”为主，评论审核不要写成已完整实现，除非后续再次确认 route 和页面均存在。

#### 3.2.3 “前端默认可回退到 Apifox Mock”需要再核查

README 中写到“默认前端可回退到 Apifox Mock”。但第 2 轮前端审计发现 `env.ts` 默认指向同 host 的 8000 端口，并支持 `VITE_API_BASE_URL` 覆盖。是否仍存在 Apifox Mock 回退逻辑需要进一步读 `env.ts` 的最新完整内容确认。若没有，应删除或改写为“可通过环境变量切换 Mock/真实后端”。

#### 3.2.4 DeepSeek model 名称需要与实际可用性核查

README 中写 `DEEPSEEK_MODEL=deepseek-v4-flash`。这是配置项描述，代码层面不会验证模型名是否真实可用。论文中不应强调具体模型版本能力，只写“通过配置指定 DeepSeek 模型”。

## 4. server/README 审计

`server/README.md` 比根 README 更偏后端，说明了：

1. 环境准备。
2. `.env` 配置。
3. PostgreSQL / Redis 启动。
4. Redis 限流和缓存规则。
5. QQ SMTP 配置。
6. Alembic 迁移。
7. Seed 数据。
8. Knowledge / Community / Admin / Care / AI API。
9. Smoke Test 覆盖范围。

总体可作为论文“系统运行与测试说明”的参考，但同样存在 Admin 评论审核接口需要再次确认的问题。

## 5. api.yaml 审计

### 5.1 api.yaml 当前状态

`api.yaml` 文件头部明确写着：

```text
First-batch non-AI APIs for frontend mock and contract alignment.
Covers auth, home, patients, care-records, tasks, and trend series.
```

这说明它本身是早期 Mock/契约文件，不是当前完整后端 API 文档。

### 5.2 api.yaml 已覆盖内容

已覆盖：

- Auth send-code/register/login/users/me
- Home summary
- Patients list/create/detail/update/dashboard
- Care Records list/create/detail/update
- Tasks list/create/detail/update/complete
- Trend series

### 5.3 api.yaml 明显过时或不一致内容

| 问题 | api.yaml 表述 | 当前代码事实 |
| --- | --- | --- |
| 注册字段 | `emailVerificationCode`、`confirmPassword` | 后端 Schema 是 `code` 和 `password`；`confirmPassword` 只在前端表单层 |
| 趋势时间参数 | `startDate`、`endDate` | 后端 route/service 使用 `startAt`、`endAt` |
| Auth response | schema 顶层 `token` / `refreshToken` | 实际后端统一 `{ success, data }` 包装，token 在 data 中 |
| AI | 未覆盖 | 当前已有 `/api/ai/assistant` 和 `/api/ai/assistant/stream` |
| Knowledge | 未覆盖 | 当前已完整实现知识分类/文章/互动 |
| Community | 未覆盖 | 当前已实现帖子/评论/互动/举报 |
| Admin | 未覆盖 | 当前已实现管理员登录、用户、审核、内容、Prompt、AI 日志 |
| Care Workbench | 未覆盖 | 当前已实现 `/api/care/workbench` |
| Profile | 只包含 `/api/users/me` | 当前已有 stats、notification-settings、preferences、avatar |
| Trend Analysis | 未覆盖 | 当前有 `/api/patients/{id}/metrics/trend-analysis` |

### 5.4 对 api.yaml 的结论

`api.yaml` 不应直接作为论文最终接口表依据。正式论文和交付文档应优先基于：

1. FastAPI 自动生成的 `/openapi.json`。
2. 当前 route 和 schema 代码。
3. 已通过 smoke test 的接口。

建议后续让 Codex 执行一次：

```powershell
cd server
uvicorn app.main:app --reload
```

然后导出：

```powershell
curl http://127.0.0.1:8000/openapi.json -o openapi.current.json
```

再从 `openapi.current.json` 生成新的 `api.yaml`。

## 6. 依赖与运行环境审计

### 6.1 前端依赖

`client/package.json` 显示前端主要技术栈为：

| 类型 | 依赖 |
| --- | --- |
| 构建工具 | Vite 6.3.5 |
| UI 框架 | React 18 peer dependency |
| 路由 | react-router 7.13.0 |
| 图表 | recharts 2.15.2 |
| 图标 | lucide-react |
| UI 组件 | Radix UI、MUI |
| 状态/表单相关 | react-hook-form 等 |
| 反馈提示 | sonner |
| 样式 | tailwindcss 4.1.12、tailwind-merge |

构建脚本：

```bash
pnpm dev
pnpm build
```

论文中可写为：前端采用 Vite + React + TypeScript 构建，结合 React Router、Recharts 和组件库实现页面交互与图表展示。

### 6.2 后端依赖

`server/requirements.txt` 显示后端主要依赖：

| 类型 | 依赖 |
| --- | --- |
| Web 框架 | FastAPI 0.115.6、uvicorn |
| 数据库 ORM | SQLAlchemy 2.0.36 |
| 数据库驱动 | psycopg[binary] |
| 迁移 | alembic |
| 配置 | pydantic-settings |
| JWT | python-jose |
| 密码哈希 | passlib[bcrypt]、bcrypt |
| 邮箱校验 | email-validator |
| HTTP 调用 | httpx |
| Redis | redis |

论文中可写为：后端采用 FastAPI + SQLAlchemy 2.x + Alembic + PostgreSQL，Redis 用于缓存和限流，httpx 用于外部 AI/API 调用。

### 6.3 Docker Compose

`docker-compose.yml` 包含两个服务：

| 服务 | 镜像 | 容器名 | 端口 | 持久化 |
| --- | --- | --- | --- | --- |
| PostgreSQL | `postgres:16` | `caregiver_postgres` | `5432:5432` | `caregiver_postgres_data` |
| Redis | `redis:7-alpine` | `caregiver_redis` | `6379:6379` | `caregiver_redis_data` |

两个服务均配置 healthcheck，并加入同一个 `caregiver` bridge network。

论文中可写：系统开发环境通过 Docker Compose 管理 PostgreSQL 和 Redis，保证数据库与缓存环境可复现。

## 7. 可写入论文的测试章节内容

建议“系统测试”章节分为以下几类：

### 7.1 接口冒烟测试

基于 `server/scripts/api_smoke_test.py`，说明测试覆盖：

1. 认证与验证码。
2. 患者增查。
3. 护理记录写入与趋势查询。
4. 护理任务创建、查询、完成。
5. AI 问答和结构化草稿。
6. 知识学习浏览、点赞、收藏。
7. 社区发帖、评论、互动、举报。
8. 后台登录、审核、知识文章、AI 日志。
9. 照护工作台聚合接口。

### 7.2 Redis 相关测试

可写：

- Redis 可用时校验验证码写入与注册后清理。
- Redis 可用时校验同邮箱验证码发送冷却。
- `/health` 返回 Redis 状态。

### 7.3 AI 草稿测试

可写：

- QA 不返回 draftPayload。
- 护理记录草稿返回 `draftType=record`。
- 血压草稿拆分为 `bloodPressureSystolic` 和 `bloodPressureDiastolic`。
- 任务草稿返回 `draftType=task`，包含任务类型、重复规则、优先级和提醒偏移。

### 7.4 后台管理测试

可写：

- 管理员登录。
- Dashboard summary。
- 用户列表。
- 待审核帖子列表。
- 帖子审核通过。
- 知识文章列表。
- AI 日志列表。

### 7.5 测试边界

应明确说明：

- 当前 smoke test 是接口级测试，不覆盖所有前端页面点击流程。
- 不验证真实 QQ SMTP 发信，因为默认使用 console/debugCode。
- 不验证 DeepSeek 真实模型输出质量。
- 不覆盖完整安全测试和压力测试。

## 8. 需要修正或后续补齐的文档问题

### 8.1 更新 api.yaml

当前 `api.yaml` 明显停留在第一批非 AI API 阶段。建议直接从 FastAPI `/openapi.json` 重新导出，再转换成 YAML。

### 8.2 复核 Admin 评论审核接口

README 中列出评论审核接口，但前端和 route 粗读未确认。需要：

1. 再次搜索 `reviews/comments`。
2. 若真实存在，补充前端页面或审计记录。
3. 若不存在，从 README 中删除或标注为预留。

### 8.3 复核 Alembic 迁移链完整性

第 6 轮发现当前成功读取到的迁移只覆盖 `0001` 和 `0002`，但 ORM 已有 Admin、Community、Prompt 等更多表。应在本地执行全新数据库验证：

```powershell
alembic upgrade head
python scripts/seed.py
python scripts/api_smoke_test.py
```

如果全新数据库失败，需要补迁移文件。

### 8.4 复核 Apifox Mock 回退描述

README 中提到前端可回退 Apifox Mock，但前端统一请求层此前审计更像默认请求真实 8000。需要重新读取 `env.ts` 最新代码确认，并修正文档。

## 9. 对正式 `PROJECT_ANALYSIS.md` 的修订建议

正式文档中建议增加：

1. “系统运行环境”：React/Vite、FastAPI、PostgreSQL、Redis、Docker Compose。
2. “接口测试设计”：以 smoke test 脚本为依据。
3. “测试用例表”：按模块列出登录、患者、记录、任务、趋势、AI、知识、社区、后台。
4. “测试结果说明”：写明 `smoke test passed` 是接口级验证，不代表完整 UI E2E。
5. “API 文档说明”：不要引用当前 `api.yaml` 为最终接口契约，应说明最终以 FastAPI OpenAPI 为准。

## 10. 下一轮计划：正式 PROJECT_ANALYSIS.md 重构

前七轮已经完成从结构、前台、后台、后端 route、service、模型、测试和文档的分层审计。下一轮可以开始正式重构 `PROJECT_ANALYSIS.md`。

建议重构章节：

1. 项目概述。
2. 需求分析。
3. 总体架构设计。
4. 前端模块设计。
5. 后端模块设计。
6. 数据库设计。
7. AI 辅助与安全确认机制。
8. Redis、SMTP 与缓存限流设计。
9. 后台管理设计。
10. 系统测试与运行环境。
11. 已实现功能与边界。
12. 后续优化方向。
