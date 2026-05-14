# Backend

FastAPI 后端服务，提供 Auth、Users/Profile、Home、Patients、Care Records、Tasks、Trends、Profile、AI Assistant、Knowledge、Community、Admin、Care Workbench 主业务接口。

## 环境准备

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 环境变量

复制 `.env.example` 为 `.env`，并确认 PostgreSQL 连接：

```env
DATABASE_URL=postgresql+psycopg://caregiver:caregiver123@127.0.0.1:5432/caregiver_system

REDIS_URL=redis://127.0.0.1:6379/0
REDIS_ENABLED=true
EMAIL_CODE_TTL_SECONDS=600

JWT_SECRET_KEY=please-change-this-for-local-development

EMAIL_PROVIDER=console
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USE_SSL=true
SMTP_USE_STARTTLS=false
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=
EMAIL_FROM_NAME=Caregiver 护理助手
EMAIL_DEBUG_CODE=true
EMAIL_SEND_TIMEOUT_SECONDS=10

AI_PROVIDER=deepseek
AI_USE_REAL_MODEL=true
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

## Docker PostgreSQL

```powershell
docker run --name caregiver_postgres `
  -e POSTGRES_USER=caregiver `
  -e POSTGRES_PASSWORD=caregiver123 `
  -e POSTGRES_DB=caregiver_system `
  -p 5432:5432 `
  -d postgres:16
```

## Docker Redis

Redis 当前用于邮箱验证码缓存、验证码发送限流、验证码错误锁定、登录失败锁定、AI 调用限流，以及聚合接口短缓存。验证码仍会写入数据库作为 fallback，因此 Redis 宕机不会让注册链路直接失败；限流和缓存会退化为不生效，业务接口继续查数据库。

单独创建 Redis：

```powershell
docker run --name caregiver_redis `
  -p 6379:6379 `
  -v caregiver_redis_data:/data `
  -d redis:7-alpine redis-server --appendonly yes
```

或使用仓库根目录的 Compose 文件：

```powershell
docker compose up -d redis
```

同时创建 PostgreSQL 和 Redis：

```powershell
docker compose up -d
```

检查 Redis：

```powershell
docker exec caregiver_redis redis-cli ping
```

也可以通过后端健康检查查看：

```powershell
curl http://127.0.0.1:8000/health
```

`/health` 会附带 `redis: ok` 或 `redis: unavailable`。

Redis 规则：

- 验证码发送：同一邮箱 60 秒内只能发送一次，同一 IP 每分钟最多 10 次。
- 验证码校验：同一邮箱验证码错误最多 5 次，超过后锁定 10 分钟；注册成功后清理 `email_code`、错误计数和锁定状态。
- 登录：同一邮箱连续密码错误 5 次后锁定 10 分钟，同一 IP 每分钟最多 20 次登录请求；用户不存在和密码错误返回统一错误。
- AI：`POST /api/ai/assistant` 单用户每分钟最多 10 次、每天最多 200 次；超限返回 429，不调用 DeepSeek，也不写 AI 日志。
- 聚合缓存：`GET /api/admin/dashboard/summary` 缓存 60 秒，`GET /api/care/workbench` 按用户缓存 30 秒，`GET /api/knowledge/categories` 缓存 600 秒。

缓存失效：

- Care Workbench：创建/更新患者、创建/更新护理记录、创建/更新/完成任务后清理当前用户缓存。
- Knowledge Categories：创建/更新/上下架知识文章后清理。
- Admin Dashboard：发帖、审核帖子、创建评论、审核评论、创建知识文章、修改知识文章状态、创建 AI 日志、创建用户后清理；患者、记录、任务写入也会额外清理，保证统计更及时。短 TTL 仍作为兜底。

## Email / QQ SMTP

本地开发推荐：

```env
EMAIL_PROVIDER=console
EMAIL_DEBUG_CODE=true
```

此模式会在后端控制台打印验证码，并允许 `POST /api/auth/email/send-code` 返回 `debugCode`，便于 smoke test 和本地联调。

真实发送 QQ 邮箱验证码时，在本地 `backend/.env` 配置：

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USE_SSL=true
SMTP_USE_STARTTLS=false
SMTP_USERNAME=你的QQ邮箱或Foxmail邮箱
SMTP_PASSWORD=
EMAIL_FROM=你的发件邮箱
EMAIL_FROM_NAME=Caregiver 护理助手
EMAIL_DEBUG_CODE=false
EMAIL_SEND_TIMEOUT_SECONDS=10
```

`SMTP_PASSWORD` 是 QQ 邮箱 SMTP 授权码，不是 QQ 密码。不要提交 `backend/.env`，不要把邮箱授权码或 DeepSeek key 写入 README、测试脚本、前端环境变量或代码。

## 数据库迁移

```powershell
cd backend
alembic upgrade head
```

生成新迁移：

```powershell
cd backend
alembic revision --autogenerate -m "message"
```

## Seed

```powershell
cd backend
python scripts/seed.py
```

Seed 账号：

- 邮箱：`caregiver@example.com`
- 密码：`password123`

Admin seed 账号：

- 邮箱：`admin@example.com`
- 密码：`admin123`

Seed 数据还包括：

- 知识分类：慢病管理、饮食护理、康复训练、常见症状处理
- 知识文章：高血压、糖尿病、营养、压疮预防、康复训练、发热观察等演示内容
- 社区帖子：经验分享、工具分享、待审核问题
- 社区评论：已通过评论和待审核评论

## 启动服务

```powershell
cd backend
uvicorn app.main:app --reload
```

常用地址：

- API Base URL: http://127.0.0.1:8000
- FastAPI Docs: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json
- Health Check: http://127.0.0.1:8000/health

`/health` 会附带 Redis 状态：`redis: ok` 或 `redis: unavailable`。

## Knowledge API

- `GET /api/knowledge/categories`
- `GET /api/knowledge/articles?q=&categoryId=&page=&pageSize=`
- `GET /api/knowledge/articles/{id}`
- `GET /api/knowledge/articles/{id}/related`
- `POST /api/knowledge/articles/{id}/view`
- `POST /api/knowledge/articles/{id}/like`
- `POST /api/knowledge/articles/{id}/bookmark`
- `DELETE /api/knowledge/articles/{id}/bookmark`

## Community API

- `GET /api/community/posts?q=&tag=&page=&pageSize=`
- `GET /api/community/posts/{id}`
- `POST /api/community/posts`
- `GET /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/like`
- `POST /api/community/posts/{id}/bookmark`
- `DELETE /api/community/posts/{id}/bookmark`
- `POST /api/community/posts/{id}/report`
- `GET /api/community/posts/{id}/related`
- `GET /api/community/users/{authorId}/posts`

社区状态统一为：

- `pending`
- `passed`
- `rejected`

## Admin API

- `POST /api/admin/auth/login`
- `GET /api/admin/me`
- `GET /api/admin/dashboard/summary`
- `GET /api/admin/users?page=&pageSize=&keyword=`
- `GET /api/admin/users/{id}`
- `PUT /api/admin/users/{id}/status`
- `GET /api/admin/reviews/posts?status=&page=&pageSize=`
- `PUT /api/admin/reviews/posts/{id}`
- `GET /api/admin/reviews/comments?status=&page=&pageSize=`
- `PUT /api/admin/reviews/comments/{id}`
- `GET /api/admin/knowledge/articles?page=&pageSize=&status=`
- `POST /api/admin/knowledge/articles`
- `PUT /api/admin/knowledge/articles/{id}`
- `PUT /api/admin/knowledge/articles/{id}/status`
- `GET /api/admin/prompts`
- `PUT /api/admin/prompts/{id}`
- `GET /api/admin/ai-logs?page=&pageSize=&intent=`
- `GET /api/admin/ai-logs/{id}`

后台登录独立于前台用户登录。Prompt 管理页现在读取 `prompt_templates` 表，可保存 AI 助手系统 Prompt。启用时 DeepSeek provider 会使用该模板；停用或内容为空时回退到内置安全 Prompt。

知识文章支持 `articleType=video` 与 `videoUrl`。后台内容管理填写可直接访问的视频 URL 后，前台知识详情页会使用原生 `<video>` 播放器展示。

## Care Workbench API

- `GET /api/care/workbench`

返回照护工作台聚合数据：summary、patients、recentRecords、upcomingTasks。

## AI Provider

`POST /api/ai/assistant` 对前端保持统一接口，前端不直接接触 DeepSeek，也不保存任何 DeepSeek key。

配置真实 DeepSeek：

```env
AI_PROVIDER=deepseek
AI_USE_REAL_MODEL=true
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

注意：

- 不要提交 `backend/.env`，真实 API key 只能放本地环境变量。
- `DEEPSEEK_API_KEY` 为空时会自动走规则型 fallback。
- `AI_USE_REAL_MODEL=false` 时会强制走 fallback，适合自动化 smoke test。
- DeepSeek 调用失败、超时、返回非 JSON 或结构校验失败时，会自动 fallback，不会让前端直接 500。
- AI 生成护理记录或任务只返回草稿，必须由用户在确认页核对后再保存。

## API Smoke Test

```powershell
cd backend
python scripts/api_smoke_test.py
```

指定测试地址：

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
python scripts/api_smoke_test.py
```

通过时会输出：

```text
smoke test passed
```

Smoke test 覆盖：

- 主闭环：登录、患者、护理记录、指标趋势、任务创建与完成
- Auth：验证码发送与注册，默认使用 `EMAIL_PROVIDER=console` / `EMAIL_DEBUG_CODE=true`，不依赖真实 QQ 邮箱；Redis 可用时校验验证码缓存、注册后清理和发送 cooldown
- AI fallback：QA、record draft、task draft
- Knowledge：分类、列表、详情、相关推荐、浏览、点赞、收藏和取消收藏
- Community：发帖、列表、详情、评论、点赞、收藏、举报
- Admin：登录、Dashboard、用户列表、待审核帖子、审核帖子、知识文章列表、AI 日志列表
- Care：workbench 聚合接口
