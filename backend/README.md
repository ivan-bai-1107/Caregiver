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

Redis 当前用于邮箱验证码短期缓存，TTL 默认 600 秒。验证码仍会写入数据库作为 fallback，因此 Redis 宕机不会让注册链路直接失败。

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
- `GET /api/admin/ai-logs?page=&pageSize=&intent=`
- `GET /api/admin/ai-logs/{id}`

后台登录独立于前台用户登录。Prompt 管理页当前为预留模块，不提供假编辑能力。

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
- Auth：验证码发送与注册，Redis 可用时校验验证码缓存和注册后清理
- AI fallback：QA、record draft、task draft
- Knowledge：分类、列表、详情、相关推荐、浏览、点赞、收藏和取消收藏
- Community：发帖、列表、详情、评论、点赞、收藏、举报
- Admin：登录、Dashboard、用户列表、待审核帖子、审核帖子、知识文章列表、AI 日志列表
- Care：workbench 聚合接口
