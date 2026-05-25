# 医疗照顾者的客户端系统设计与实现

面向医疗照顾者的护理辅助系统，当前处于 React 前端 + FastAPI 后端 + Docker PostgreSQL 真实联调阶段。

## 目录

- `client/`：Vite + React + TypeScript 客户端壳、前台页面、共享组件与路由
- `admin/`：后台管理前端模块，挂载在客户端的 `/admin/*` 路由下
- `server/`：FastAPI + SQLAlchemy 2.x + Alembic 后端

当前已接入真实后端的主模块：

- Auth / Users / Home / Patients / Records / Tasks / Trends / Profile / AI Assistant
- Knowledge：分类、文章列表、搜索、详情、相关推荐、浏览、点赞、收藏
- Community：帖子、评论、点赞、收藏、举报、相关推荐、作者帖子
- Admin：独立管理员登录、Dashboard、用户状态、社区审核、知识内容、AI 日志
- Care Workbench：`/api/care/workbench` 聚合患者、记录、待办任务

## 前端启动

```powershell
cd client
pnpm install
pnpm dev --host 127.0.0.1
```

前端地址：

- http://127.0.0.1:5173/
- 局域网访问时使用当前机器 IP，例如 http://192.168.3.179:5173/

前端默认会请求同一 host 的 `8000` 端口作为后端；也可以在 `client/.env.local` 覆盖：

```env
VITE_API_BASE_URL=http://192.168.3.179:8000
```

## 后端启动

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端地址：

- API: http://127.0.0.1:8000
- FastAPI Docs: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health

`/health` 会返回 Redis 状态，例如 `redis: ok` 或 `redis: unavailable`。

## Docker 全套启动

仓库根目录的 `docker-compose.yml` 已经包含完整运行环境：

- `postgres`：PostgreSQL 16，容器名 `caregiver_postgres`
- `redis`：Redis 7，容器名 `caregiver_redis`
- `server`：FastAPI 后端，容器名 `caregiver_server`
- `client`：Nginx 托管的 React 前端，容器名 `caregiver_client`

首次启动：

```powershell
docker compose up -d --build
```

启动后访问：

- 客户端：http://127.0.0.1:5173/
- 后台：http://127.0.0.1:5173/admin/login
- 后端直连：http://127.0.0.1:8001
- Health：http://127.0.0.1:8001/health 或 http://127.0.0.1:5173/api/health

局域网访问时把 `127.0.0.1` 换成当前机器 IP，例如：

- 客户端：`http://192.168.3.192:5173/`
- 后台：`http://192.168.3.192:5173/admin/login`

Docker 版前端默认使用同源 `/api` 反向代理，所以局域网访问不需要额外改前端配置。如果部署到独立后端地址，可以在根目录 `.env` 中设置：

```env
VITE_API_BASE_URL=__RELATIVE__
```

可先复制占位配置：

```powershell
Copy-Item .env.docker.example .env
```

`.env` 只放本机真实配置，不要提交。QQ 邮箱授权码、DeepSeek key、内容审核 key 都放这里。

常用命令：

```powershell
docker compose ps
docker compose logs -f server
docker compose logs -f client
docker compose down
```

如果需要清库并重新生成演示数据：

```powershell
docker compose down -v
docker compose up -d --build
```

也可以不删除数据库卷，只强制重建演示数据：

```powershell
docker compose run --rm -e RESET_DEMO_DATA_ON_START=true server true
docker compose up -d
```

后端容器启动时会自动执行：

- `python -m alembic upgrade head`
- 首次启动默认执行 `python scripts/reset_demo_data.py`

默认演示账号：

- 客户端：`caregiver@example.com` / `password123`
- 后台：`admin@example.com` / `admin123`

## Redis 用途

Redis 当前用于邮箱验证码缓存、验证码发送限流、验证码错误锁定、登录失败锁定、AI 调用限流，以及 Admin Dashboard / Care Workbench / Knowledge Categories 的短缓存。验证码仍会写入数据库作为 fallback，所以 Redis 不可用时不会让注册主流程直接失败；限流和缓存会退化为不生效，业务接口继续查数据库。

查看健康状态：

```powershell
curl http://127.0.0.1:5173/api/health
```

`/health` 会返回 `redis: ok` 或 `redis: unavailable`。

当前 Redis 规则：

- 验证码发送：同一邮箱 60 秒 1 次，同一 IP 每分钟最多 10 次。
- 验证码校验：同一邮箱错误 5 次后锁定 10 分钟，注册成功后清理验证码和错误计数。
- 登录：同一邮箱连续密码错误 5 次后锁定 10 分钟，同一 IP 每分钟最多 20 次登录请求。
- AI：单用户每分钟最多 10 次，每天最多 200 次；超限时不会调用 DeepSeek，也不会写 AI 日志。
- 短缓存：`/api/admin/dashboard/summary` 缓存 60 秒，`/api/care/workbench` 按用户缓存 30 秒，`/api/knowledge/categories` 缓存 600 秒。

相关写操作会清理缓存：患者、护理记录、任务会清理 Care Workbench；知识文章创建/更新/上下架会清理 Knowledge Categories 和 Admin Dashboard；发帖、审核帖子、创建评论、审核评论、创建 AI 日志、创建用户会清理 Admin Dashboard。部分统计即使漏掉失效点，也有短 TTL 兜底。

## QQ 邮箱 SMTP

本地开发推荐保留：

```env
EMAIL_PROVIDER=console
EMAIL_DEBUG_CODE=true
```

这样 `POST /api/auth/email/send-code` 会返回 `debugCode`，smoke test 不依赖真实邮箱。

真实发送 QQ 邮箱验证码时，在本地 `server/.env` 中配置：

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

`SMTP_PASSWORD` 是 QQ 邮箱里生成的 SMTP 授权码，不是 QQ 登录密码。不要提交 `server/.env`，也不要把邮箱授权码、DeepSeek key 写入 README、测试脚本或前端环境变量。

## Alembic

```powershell
cd server
alembic upgrade head
```

新增迁移时：

```powershell
cd server
alembic revision --autogenerate -m "message"
```

## Seed 数据

```powershell
cd server
python scripts/seed.py
```

Seed 账号：

- 邮箱：`caregiver@example.com`
- 密码：`password123`

Admin seed 账号：

- 邮箱：`admin@example.com`
- 密码：`admin123`

Seed 还会写入知识分类、知识文章、社区帖子和评论，用于可演示联调。

## 前端切真实后端

默认前端可回退到 Apifox Mock。切真实后端时，在 `client/.env.local` 写入：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

修改后需要重启 `pnpm dev`。

## AI 与 DeepSeek

前端仍然只调用后端统一接口 `POST /api/ai/assistant`，不会接触 DeepSeek，也不能出现 DeepSeek API key。

后端支持 DeepSeek provider + 规则型 fallback：

- `DEEPSEEK_API_KEY` 为空时自动走 fallback。
- `AI_USE_REAL_MODEL=false` 时强制走 fallback。
- `DEEPSEEK_MODEL` 可在 `server/.env` 中调整。
- DeepSeek 不可用、超时、返回非严格 JSON 或结构校验失败时自动 fallback。
- AI 生成的 record/task 只作为草稿返回，必须在前端确认页核对后才会保存。

真实 key 只能放在 `server/.env`，不要提交到代码、README、测试脚本或前端环境变量。

## API Smoke Test

后端启动、迁移和 seed 完成后运行：

```powershell
cd server
python scripts/api_smoke_test.py
```

也可以指定后端地址：

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
python scripts/api_smoke_test.py
```

Smoke test 默认按本地开发模式验证验证码链路：`EMAIL_PROVIDER=console` 且 `EMAIL_DEBUG_CODE=true`，不会依赖真实 QQ 邮箱。Redis 可用时会强校验验证码缓存、注册后清理和同邮箱连续发送 cooldown；Redis 不可用时会打印提示并跳过 Redis 强断言。

当前 smoke test 范围：

- 用户登录、患者、记录、趋势、任务完成、AI qa/record/task draft
- Auth 验证码注册链路，Redis 可用时会校验验证码缓存、注册后清理和发送 cooldown
- Knowledge 列表、详情、浏览、点赞、收藏
- Community 发帖、列表、详情、评论、点赞、收藏、举报
- Admin 登录、Dashboard、用户列表、帖子审核、知识文章列表、AI 日志列表
- Care Workbench 聚合接口

## 新增模块 API 概览

Community：

- `GET /api/community/posts`
- `GET /api/community/posts/{id}`
- `POST /api/community/posts`
- `GET /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/like`
- `POST /api/community/posts/{id}/bookmark`
- `DELETE /api/community/posts/{id}/bookmark`
- `POST /api/community/posts/{id}/report`

Admin：

- `POST /api/admin/auth/login`
- `GET /api/admin/dashboard/summary`
- `GET /api/admin/users`
- `PUT /api/admin/users/{id}/status`
- `GET /api/admin/reviews/posts`
- `PUT /api/admin/reviews/posts/{id}`
- `GET /api/admin/reviews/comments`
- `PUT /api/admin/reviews/comments/{id}`
- `GET /api/admin/knowledge/articles`
- `POST /api/admin/knowledge/articles`
- `PUT /api/admin/knowledge/articles/{id}`
- `PUT /api/admin/knowledge/articles/{id}/status`
- `GET /api/admin/prompts`
- `PUT /api/admin/prompts/{id}`
- `GET /api/admin/ai-logs`

Care：

- `GET /api/care/workbench`

`/admin/prompts` 现在是真实 Prompt 管理页：可读取和保存后端 `prompt_templates` 表中的 AI 助手系统 Prompt。启用状态下 DeepSeek provider 会读取该模板；停用或模板为空时自动回退到内置安全 Prompt。

## 客户端和后台使用

前台客户端：

- 登录：`/login`
- 注册：`/register`
- 找回密码：`/forgot-password`，输入邮箱、验证码和新密码即可重置。
- 知识视频：后台创建 `articleType=video` 且填写 `videoUrl` 后，前台 `/knowledge/{id}` 会展示原生视频播放器。

后台管理：

- 后台登录：`/admin/login`
- 仪表盘：`/admin/dashboard`
- 用户管理：`/admin/users`
- 内容审核：`/admin/reviews`
- 知识内容：`/admin/content`，可创建图文或视频知识，视频知识需要填写可直接访问的视频 URL。
- Prompt 管理：`/admin/prompts`，保存后影响真实 DeepSeek 调用；本地未配置 DeepSeek key 时仍走 fallback。
- AI 日志：`/admin/ai-logs`
