# Backend

FastAPI 后端服务，提供 Auth、Users/Profile、Home、Patients、Care Records、Tasks、Trends、AI Assistant 主业务接口。

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
