# 医疗照顾者的客户端系统设计与实现

面向医疗照顾者的护理辅助系统，当前处于 React 前端 + FastAPI 后端 + Docker PostgreSQL 真实联调阶段。

## 目录

- `App/`：Vite + React + TypeScript 前端
- `backend/`：FastAPI + SQLAlchemy 2.x + Alembic 后端

当前已接入真实后端的主模块：

- Auth / Users / Home / Patients / Records / Tasks / Trends / Profile / AI Assistant
- Knowledge：分类、文章列表、搜索、详情、相关推荐、浏览、点赞、收藏

## 前端启动

```powershell
cd App
pnpm install
pnpm dev --host 127.0.0.1
```

前端地址：

- http://127.0.0.1:5173/

## 后端启动

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端地址：

- API: http://127.0.0.1:8000
- FastAPI Docs: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health

## Docker PostgreSQL

本地 `.env` 中配置：

```env
DATABASE_URL=postgresql+psycopg://caregiver:caregiver123@127.0.0.1:5432/caregiver_system
JWT_SECRET_KEY=please-change-this-for-local-development
AI_PROVIDER=deepseek
AI_USE_REAL_MODEL=true
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

如需创建本地 PostgreSQL 容器：

```powershell
docker run --name caregiver_postgres `
  -e POSTGRES_USER=caregiver `
  -e POSTGRES_PASSWORD=caregiver123 `
  -e POSTGRES_DB=caregiver_system `
  -p 5432:5432 `
  -d postgres:16
```

## Alembic

```powershell
cd backend
alembic upgrade head
```

新增迁移时：

```powershell
cd backend
alembic revision --autogenerate -m "message"
```

## Seed 数据

```powershell
cd backend
python scripts/seed.py
```

Seed 账号：

- 邮箱：`caregiver@example.com`
- 密码：`password123`

Seed 还会写入知识分类和知识文章，用于 Knowledge 模块演示。

## 前端切真实后端

默认前端可回退到 Apifox Mock。切真实后端时，在 `App/.env.local` 写入：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

修改后需要重启 `pnpm dev`。

## AI 与 DeepSeek

前端仍然只调用后端统一接口 `POST /api/ai/assistant`，不会接触 DeepSeek，也不能出现 DeepSeek API key。

后端支持 DeepSeek provider + 规则型 fallback：

- `DEEPSEEK_API_KEY` 为空时自动走 fallback。
- `AI_USE_REAL_MODEL=false` 时强制走 fallback。
- `DEEPSEEK_MODEL` 可在 `backend/.env` 中调整。
- DeepSeek 不可用、超时、返回非严格 JSON 或结构校验失败时自动 fallback。
- AI 生成的 record/task 只作为草稿返回，必须在前端确认页核对后才会保存。

真实 key 只能放在 `backend/.env`，不要提交到代码、README、测试脚本或前端环境变量。

## API Smoke Test

后端启动、迁移和 seed 完成后运行：

```powershell
cd backend
python scripts/api_smoke_test.py
```

也可以指定后端地址：

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
python scripts/api_smoke_test.py
```

Smoke test 覆盖主闭环、AI fallback 场景，以及 Knowledge 分类 / 列表 / 详情 / 点赞 / 收藏。
