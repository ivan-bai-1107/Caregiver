# Backend

FastAPI 后端服务，提供 Auth、Users/Profile、Home、Patients、Care Records、Tasks、Trends、Profile、AI Assistant、Knowledge 主业务接口。

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

Seed 数据还包括：

- 知识分类：慢病管理、饮食护理、康复训练、常见症状处理
- 知识文章：高血压、糖尿病、营养、压疮预防、康复训练、发热观察等演示内容

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

## Knowledge API

- `GET /api/knowledge/categories`
- `GET /api/knowledge/articles?q=&categoryId=&page=&pageSize=`
- `GET /api/knowledge/articles/{id}`
- `GET /api/knowledge/articles/{id}/related`
- `POST /api/knowledge/articles/{id}/view`
- `POST /api/knowledge/articles/{id}/like`
- `POST /api/knowledge/articles/{id}/bookmark`
- `DELETE /api/knowledge/articles/{id}/bookmark`

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

Smoke test 覆盖主闭环、AI fallback，以及 Knowledge 分类、列表、详情、相关推荐、浏览、点赞、收藏和取消收藏。
