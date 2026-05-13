# 医疗照顾者的客户端系统设计与实现

面向医疗照顾者的护理辅助系统，当前处于 React 前端 + FastAPI 后端 + Docker PostgreSQL 真实联调阶段。

## 目录

- `App/`：Vite + React + TypeScript 前端
- `backend/`：FastAPI + SQLAlchemy 2.x + Alembic 后端

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

## 前端切真实后端

默认前端可回退到 Apifox Mock。切真实后端时，在 `App/.env.local` 写入：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

修改后需要重启 `pnpm dev`。

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
