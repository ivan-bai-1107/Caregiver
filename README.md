# Caregiver

面向医疗照顾者的护理辅助系统，包含护理端、后台管理端和后端 API。项目支持患者管理、护理记录、任务提醒、健康趋势、知识库、社区互动、AI 助手以及后台内容审核等功能。

## 功能特性

- 用户注册、登录、个人资料管理
- 患者信息、护理记录、待办任务和健康趋势管理
- 知识库文章浏览、搜索、点赞和收藏
- 社区帖子、评论、收藏、点赞和举报
- AI 护理助手与调用日志记录
- 后台管理：用户状态、社区审核、知识内容和仪表盘
- Docker Compose 一键启动 PostgreSQL、Redis、后端和前端

## 技术栈

- 前端：Vite、React、TypeScript、Material UI、Radix UI、Tailwind CSS
- 后端：FastAPI、SQLAlchemy、Alembic、Pydantic
- 数据库与缓存：PostgreSQL、Redis
- 部署：Docker、Docker Compose、Nginx

## 项目结构

```text
Caregiver/
├── admin/                 # 后台管理前端源码
├── client/                # 护理端前端源码
├── server/                # FastAPI 后端服务
├── api.yaml               # API 描述文件
├── docker-compose.yml     # Docker Compose 配置
└── README.md
```

## 快速开始

### 使用 Docker 启动

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

启动后访问：

- 护理端：http://127.0.0.1:5173/
- 后台管理：http://127.0.0.1:5173/admin/login
- 后端接口：http://127.0.0.1:8001
- 接口文档：http://127.0.0.1:8001/docs
- 健康检查：http://127.0.0.1:8001/health

常用命令：

```powershell
docker compose ps
docker compose logs -f server
docker compose logs -f client
docker compose down
```

如需清空数据库卷并重新初始化演示数据：

```powershell
docker compose down -v
docker compose up -d --build
```

### 本地开发

启动后端：

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

启动前端：

```powershell
cd client
pnpm install
pnpm dev --host 127.0.0.1
```

本地开发访问：

- 前端：http://127.0.0.1:5173/
- 后端：http://127.0.0.1:8000
- API 文档：http://127.0.0.1:8000/docs

## 环境变量

Docker 运行可参考根目录 `.env.docker.example`，后端本地运行可参考 `server/.env.example`。

常用配置包括：

- `DATABASE_URL`：PostgreSQL 连接地址
- `REDIS_URL`：Redis 连接地址
- `SECRET_KEY`：JWT 签名密钥
- `EMAIL_PROVIDER`：邮件发送方式，开发环境可使用 `console`
- `VITE_API_BASE_URL`：前端请求后端的基础地址

请不要提交真实的 `.env`、邮箱授权码、API Key 或其他敏感信息。

## 数据迁移与初始化

执行数据库迁移：

```powershell
cd server
alembic upgrade head
```

生成新的迁移文件：

```powershell
cd server
alembic revision --autogenerate -m "message"
```

写入演示数据：

```powershell
cd server
python scripts/seed.py
```

默认演示账号：

- 护理端：`caregiver@example.com` / `password123`
- 后台管理：`admin@example.com` / `admin123`

## 开发说明

- Docker 版前端默认通过同源 `/api` 反向代理访问后端。
- 局域网访问时，将 `127.0.0.1` 替换为当前机器 IP。
- Redis 用于验证码缓存、登录失败锁定、AI 调用限流和部分短缓存；Redis 不可用时，核心业务接口会尽量退化到数据库查询。

## 许可证

本项目基于 MIT License 开源，详情请查看 [LICENSE](LICENSE)。
