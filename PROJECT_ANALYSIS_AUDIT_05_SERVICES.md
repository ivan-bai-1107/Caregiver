# 第五轮审计：后端 Service 与核心机制细读

> 本文件是项目代码库审计的第五轮补充文件，重点验证 Redis、SMTP、AI、Prompt、RAG、趋势分析、护理记录双层写入、内容审核和缓存失效等工程机制是否真实落在 service 层。后续正式整理 `PROJECT_ANALYSIS.md` 时，需要将本文件与前几轮审计结果合并。

## 1. 本轮读取范围

本轮读取并确认以下文件：

| 文件 | 模块 | 审计目标 |
| --- | --- | --- |
| `server/app/services/auth_service.py` | 认证服务 | 验证码、注册、登录、密码重置、Redis 限流、错误锁定 |
| `server/app/services/email_service.py` | 邮件服务 | QQ SMTP / console 验证码发送实现 |
| `server/app/core/config.py` | 配置中心 | 数据库、JWT、Redis、SMTP、DeepSeek、内容审核、CORS 配置 |
| `server/app/core/redis.py` | Redis 工具 | Redis 连接、字符串缓存、计数、JSON 缓存、pattern 删除、fallback |
| `server/app/services/cache_service.py` | 缓存服务 | 缓存 key 与缓存失效函数 |
| `server/app/services/ai_service.py` | AI 助手服务 | 意图识别、DeepSeek、Prompt、RAG、fallback、输出校验、AI 日志 |
| `server/app/services/deepseek_service.py` | DeepSeek 调用 | DeepSeek chat/completions 请求、JSON 解析、系统 Prompt |
| `server/app/services/prompt_service.py` | Prompt 服务 | 默认 Prompt、Prompt 初始化、后台编辑、AI/趋势调用读取 |
| `server/app/services/rag_service.py` | RAG 检索 | 知识库关键词检索、片段构造、sources 标注 |
| `server/app/services/trend_service.py` | 趋势服务 | 指标趋势查询、趋势分析、DeepSeek/fallback、趋势缓存 |
| `server/app/services/record_service.py` | 护理记录服务 | `care_records + care_metrics` 双层写入、更新、缓存失效 |
| `server/app/services/community_service.py` | 社区服务 | 发帖、评论、内容审核、点赞、收藏、举报、审核状态 |
| `server/app/services/admin_service.py` | 后台管理服务 | Dashboard 统计、用户管理、帖子审核、知识管理、Prompt、AI 日志 |
| `server/app/services/content_moderation_service.py` | 内容审核 | 本地关键词审核、外部审核 API、异常处理 |

## 2. 认证、邮箱与限流机制

### 2.1 邮箱验证码链路

`auth_service.py` 中已经实现邮箱验证码的完整链路：

1. 生成 6 位验证码。
2. 写入 `email_verification_codes` 数据库表。
3. 写入 Redis：`email_code:{email}`。
4. 注册或重置密码时优先检查 Redis，再检查数据库兜底记录。
5. 验证成功后标记验证码已使用，并清理 Redis code、错误计数和锁定状态。

相关 key：

| Redis key | 作用 |
| --- | --- |
| `email_code:{email}` | 缓存邮箱验证码 |
| `email_code_cooldown:{email}` | 邮箱发送冷却 |
| `email_code_fail:{email}` | 验证码错误次数计数 |
| `email_code_lock:{email}` | 验证码错误锁定 |
| `rate:send_code:ip:{ip}` | 发送验证码 IP 频率限制 |

### 2.2 验证码发送限流

已确认规则：

| 规则 | 实现 |
| --- | --- |
| 同一邮箱 60 秒冷却 | `EMAIL_CODE_COOLDOWN_SECONDS = 60` |
| 同一 IP 每分钟最多 10 次 | `SEND_CODE_IP_MAX_PER_MINUTE = 10` |
| 验证码错误最多 5 次 | `EMAIL_CODE_MAX_FAILURES = 5` |
| 错误锁定 10 分钟 | `EMAIL_CODE_LOCK_SECONDS = 600` |

因此论文中可以写：系统使用 Redis 实现邮箱验证码缓存、发送冷却、IP 频率限制和错误锁定。

### 2.3 登录失败限流

已确认规则：

| 规则 | 实现 |
| --- | --- |
| 同一 IP 每分钟最多 20 次登录请求 | `LOGIN_IP_MAX_PER_MINUTE = 20` |
| 同一邮箱登录失败 5 次锁定 | `LOGIN_MAX_FAILURES = 5` |
| 锁定时间 10 分钟 | `LOGIN_LOCK_SECONDS = 600` |

登录成功后会清理 `login_fail:{email}` 和 `login_lock:{email}`。

### 2.4 QQ 邮箱 SMTP / Console 双模式

`email_service.py` 已实现 `send_verification_code_email(to_email, code)`：

| 模式 | 行为 |
| --- | --- |
| `EMAIL_PROVIDER=console` | 本地打印验证码或打印请求日志 |
| `EMAIL_PROVIDER=smtp` | 使用 SMTP_SSL 或 STARTTLS 发送真实邮件 |

SMTP 配置来自 `config.py`，包括：

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USE_SSL`
- `SMTP_USE_STARTTLS`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`
- `EMAIL_DEBUG_CODE`
- `EMAIL_SEND_TIMEOUT_SECONDS`

`SMTP_PASSWORD` 使用 `SecretStr`，不会以普通字符串形式暴露在配置对象中。SMTP 失败会抛出 `EmailSendError`，route 层返回友好错误。

### 2.5 论文表述建议

可以写：

> 系统验证码模块采用数据库和 Redis 双存储策略。Redis 用于验证码缓存、发送频率控制和错误锁定，数据库用于兜底校验与审计。邮件发送支持 console 本地调试和 QQ SMTP 真实发送两种模式。

不要写：

> 系统已经实现短信验证码。

当前实现是邮箱验证码，不是短信。

## 3. 配置中心与 Redis 工具

### 3.1 配置中心

`config.py` 使用 `pydantic-settings` 读取 `.env`，包括：

| 配置类型 | 内容 |
| --- | --- |
| 数据库 | `DATABASE_URL` |
| JWT | `JWT_SECRET_KEY`、算法、access/refresh 过期时间 |
| DeepSeek | provider、baseURL、model、API key |
| Redis | `REDIS_URL`、`REDIS_ENABLED` |
| 邮箱 | provider、SMTP、debugCode、超时 |
| 内容审核 | 是否启用、baseURL、path、API key、超时 |
| CORS | 本地开发端口和局域网正则 |

### 3.2 Redis helper

`redis.py` 已封装：

| 函数 | 作用 |
| --- | --- |
| `redis_is_available` | 检查 Redis 是否可用 |
| `redis_get` / `redis_setex` / `redis_delete` | 基础字符串缓存 |
| `redis_incr` / `redis_expire` / `redis_ttl` / `redis_get_int` | 计数限流 |
| `redis_set_json` / `redis_get_json` | JSON 缓存 |
| `redis_delete_pattern` | pattern 扫描删除 |

实现特点：Redis 未启用、连接失败或操作异常时安全返回 `None`、`False` 或 `0`，不会直接打断主业务。

### 3.3 缓存 key 与失效函数

`cache_service.py` 定义：

| 缓存 | key |
| --- | --- |
| 后台 Dashboard | `cache:admin:dashboard_summary` |
| 知识分类 | `cache:knowledge:categories` |
| 照护工作台 | `cache:care:workbench:{userId}` |
| 趋势分析 | `cache:trend:analysis:{userId}:{patientId}:*` |
| 趋势数据 | `cache:trend:data:{userId}:{patientId}:*` |

并提供对应失效函数，如 `invalidate_admin_dashboard_cache`、`invalidate_care_workbench_cache`、`invalidate_knowledge_categories_cache`、`invalidate_trend_analysis_cache`。

## 4. AI 助手、DeepSeek、Prompt 与 RAG

### 4.1 AI 服务总体流程

`ai_service.py` 中 `handle_assistant_message` 是 AI 主入口，流程为：

1. 生成或复用 conversationId。
2. 查询当前用户的患者列表。
3. 调用 `retrieve_knowledge_context` 从知识库检索上下文。
4. 判断是否使用 DeepSeek。
5. 若 DeepSeek 可用，则构造 Prompt 并调用模型。
6. 若 DeepSeek 失败、未配置 key 或返回结构不合规，则 fallback 到规则生成。
7. 写入 `ai_assistant_logs`。
8. 清理后台 Dashboard 缓存。

### 4.2 支持的 AI 意图

已确认支持：

| intent | 说明 |
| --- | --- |
| `qa` | 护理问答 |
| `care_record` | 护理记录草稿 |
| `care_task` | 护理任务草稿 |
| `form_prefill` | 预留意图；当前严格校验中不允许返回 draft |

### 4.3 结构化输出校验

DeepSeek 返回结果会经过 `ProviderAiResponse`、`RecordDraftPayload`、`TaskDraftPayload` 等 Pydantic 模型校验。校验点包括：

1. `care_record` 必须对应 `draftType=record`。
2. `care_task` 必须对应 `draftType=task`。
3. `qa` 和 `form_prefill` 不能返回草稿。
4. 血压字段必须拆为 `bloodPressureSystolic` 和 `bloodPressureDiastolic`。
5. 任务类型、重复规则、优先级均受枚举约束。
6. 如果 patientId 不存在，会尝试用 patientName 匹配；无法匹配时 patientId 为空。

这可以作为论文中的重要安全设计：AI 不直接写库，且结构化草稿必须经过后端校验和前端人工确认。

### 4.4 DeepSeek 调用方式

`deepseek_service.py` 使用 `httpx` 调用：

```text
{DEEPSEEK_BASE_URL}/chat/completions
```

请求包含：

- model
- system prompt
- user prompt
- temperature
- `response_format: { type: "json_object" }`

返回内容必须是严格 JSON，否则抛出 `DeepSeekServiceError` 并由上层 fallback。

### 4.5 Prompt 模板管理是否真实参与 AI

`prompt_service.py` 定义默认 Prompt 模板，并提供：

- `get_active_ai_system_prompt`
- `get_active_ai_intent_prompt`
- `get_active_rag_policy_prompt`
- `get_active_trend_analysis_prompt`

`ai_service.py` 调用前三者构造 AI assistant Prompt；`trend_service.py` 调用趋势分析 Prompt。因此后台 Prompt 管理不是纯展示，而是会影响 AI 助手与趋势分析。

### 4.6 RAG 检索实现

`rag_service.py` 实现的是轻量级关键词检索：

1. 从用户输入中抽取中文医学/护理关键词和通用 token。
2. 查询 `published` 状态的知识文章。
3. 按标题、摘要、正文命中情况打分。
4. 截取片段作为知识库上下文。
5. 将文章标题作为 sources。

这不是向量数据库 RAG，不应写成 embedding 检索或语义向量检索。论文中建议表述为：

> 系统实现了基于关键词匹配的轻量级知识检索增强，用于为 AI 回答提供知识片段和来源。

不要写：

> 系统实现了基于向量数据库的 RAG。

## 5. 趋势分析机制

`trend_service.py` 包含两类能力：

### 5.1 指标趋势数据

`get_metric_trend` 从 `care_records` join `care_metrics` 查询指定患者、指定指标、指定时间范围的数值数据。支持：

- `metricType`
- `startAt`
- `endAt`

结果会缓存到 Redis：

```text
cache:trend:data:{userId}:{patientId}:{digest}
```

TTL 为 10 分钟。

### 5.2 趋势分析

`get_trend_analysis` 会：

1. 构建趋势分析数据。
2. 先生成 fallback 分析。
3. 如果 DeepSeek 可用，则调用 DeepSeek 生成结构化趋势分析 JSON。
4. 如果 DeepSeek 失败，则使用 fallback。
5. 结果缓存 24 小时。

趋势分析输出包括：

- summary
- riskLevel
- highlights
- suggestions
- riskNote
- generatedBy

论文可写为：

> 趋势分析模块基于结构化指标时间序列，结合规则 fallback 和 DeepSeek 结构化输出生成护理观察建议。

必须注意：这不是医学诊断。

## 6. 护理记录双层写入机制

`record_service.py` 已确认：

1. `CareRecord` 表示一次护理事件。
2. `CareMetric` 表示该事件下的结构化指标。
3. `create_record` 创建一条 `CareRecord`，并将 payload 中的 metrics 转成多条 `CareMetric`。
4. `update_record` 会清空旧 metrics 并写入新 metrics。
5. 数值型指标使用 Decimal 保存到 `value_numeric`；非数值内容保存到 `value_text`。
6. 血压展示时通过 `bloodPressureSystolic` 和 `bloodPressureDiastolic` 两个 metric 拼接显示。

写入或更新后会失效：

- care workbench 缓存
- admin dashboard 缓存
- trend analysis/data 缓存

这确认了论文中的核心设计亮点：`care_records + care_metrics` 双层模型真实存在。

## 7. 社区与内容审核机制

### 7.1 社区服务

`community_service.py` 已确认：

| 能力 | 实现情况 |
| --- | --- |
| 帖子列表 | 只展示 `passed` 状态 |
| 发帖 | 新帖子状态为 `pending` |
| 帖子详情 | 只允许查看 `passed` 帖子，并增加 viewCount |
| 评论列表 | 只展示 `passed` 评论 |
| 发表评论 | 通过内容审核后直接置为 `passed` |
| 点赞 | 支持单向点赞，不重复增加 |
| 收藏 | 支持收藏与取消收藏 |
| 举报 | 写入 report 并增加 reportCount |
| 相关推荐 | 按相同 tag 查询 passed 帖子 |
| 作者帖子 | 按作者查询 passed 帖子 |

### 7.2 内容审核

`content_moderation_service.py` 包含两层审核：

1. 本地关键词拦截：如博彩、赌博、代开、发票、广告推广。
2. 外部内容审核 API：若配置了 API key，则调用外部服务。

如果内容审核服务异常，评论提交会返回服务不可用。若内容被判定违规，则返回“内容包含敏感信息，请修改后再提交”。

### 7.3 谨慎表述

1. 发帖本身当前是 `pending` 状态，但本轮未看到发帖内容先调用外部审核；审核主要依赖后台人工审核。
2. 评论会经过内容审核，审核通过后直接 `passed`。
3. 社区没有确认取消点赞、关注作者、评论回复、评论点赞。

## 8. 后台管理 Service 机制

`admin_service.py` 已确认：

| 能力 | 实现情况 |
| --- | --- |
| 管理员登录 | 校验 `admin_users`，状态必须 active，返回 JWT |
| Dashboard | 统计用户、患者、记录、任务、待审核帖子、待审核评论、知识文章、AI 日志 |
| 用户管理 | 列表、详情、状态更新 |
| 帖子审核 | 列表、通过/拒绝、拒绝原因 |
| 知识管理 | 分类、文章列表、创建、编辑、状态切换 |
| Prompt 管理 | 调用 prompt_service 列表与更新 |
| AI 日志 | 列表、详情，包含用户、消息、意图、回答、草稿、sources、riskNote |

缓存失效：

- 新用户注册会清 dashboard cache。
- AI log 写入会清 dashboard cache。
- 知识文章创建/更新/状态切换会清 knowledge categories 和 dashboard cache。
- 帖子审核会清 dashboard cache。

注意点：Dashboard 中有 pendingCommentCount，但本轮 route 和前端确认的审核页主要是帖子审核；评论后台审核能力不应夸大。

## 9. 可写入论文的技术亮点

本轮确认以下内容可以作为论文“系统实现”或“详细设计”的重点：

1. **Redis 增强认证安全**：验证码缓存、发送冷却、错误锁定、登录失败锁定和 IP 频控。
2. **QQ SMTP / Console 双模式邮箱验证码**：便于本地测试和真实演示环境切换。
3. **AI 结构化输出校验**：DeepSeek 输出必须满足后端 Pydantic 模型约束，不合规则 fallback。
4. **AI 人工确认保存机制**：AI 草稿不直接入库，必须前端确认后走业务 API。
5. **Prompt 模板真实参与 AI 调用**：后台 Prompt 编辑会影响 AI assistant 和趋势分析。
6. **轻量级 RAG**：基于知识库文章的关键词检索和片段引用。
7. **趋势分析双路径**：DeepSeek 结构化分析 + fallback 规则分析。
8. **护理记录双层模型**：护理事件和指标分表，数值指标和文本指标分开保存。
9. **缓存失效机制**：业务写操作后主动清理工作台、Dashboard、趋势等缓存。
10. **社区内容审核**：评论内容结合本地关键词和外部审核 API，帖子采用 pending 状态进入后台审核。

## 10. 谨慎表述或后续扩展内容

1. RAG 不是向量数据库，不要写 embedding、向量检索或语义搜索。
2. AI stream 是后端切分最终回答，不是 DeepSeek 原生 token stream。
3. logout 没有 token blacklist，不要写服务端强制注销 JWT。
4. 头像接口是资料字段更新，不是 multipart 图片文件上传。
5. 社区没有关注作者、评论回复、评论点赞，取消点赞也未在 route 层确认。
6. 发帖主要进入 pending 由后台审核，评论才是自动内容审核后 passed。
7. 趋势分析是护理辅助，不构成医疗诊断。
8. Prompt 管理已经真实参与部分 AI 调用，但不要写成支持复杂 Prompt 版本灰度、A/B 测试或多环境发布。
9. 内容审核外部 API 只有在配置 API key 时启用，否则只做本地关键词兜底。
10. 任务提醒目前主要是任务字段和前端展示，未在本轮看到后台定时推送或消息队列。

## 11. 对 `PROJECT_ANALYSIS.md` 的修订建议

正式整理时，建议把以下内容写进论文：

### 11.1 系统实现章节应增加

- Redis 认证限流设计。
- SMTP / console 双模式邮件服务。
- AI 输出校验与 fallback。
- Prompt 模板管理参与 AI 调用。
- 轻量级知识检索增强。
- 趋势分析 DeepSeek/fallback 双路径。
- 护理记录双层模型与缓存失效。

### 11.2 数据库设计章节应强调

- `care_records` 与 `care_metrics` 分表。
- `ai_assistant_logs` 用于 AI 审计。
- `prompt_templates` 用于后台 Prompt 管理。
- `community_posts` 与 `community_comments` 均有状态字段。

### 11.3 测试章节应补充

- Redis 不可用时的 fallback 预期。
- console 邮箱模式下的验证码测试。
- DeepSeek 无 key 或失败时 fallback 测试。
- AI 草稿确认保存测试。
- 社区敏感词评论拦截测试。
- 趋势分析缓存和失效测试。

## 12. 下一轮计划：数据库模型与迁移细读

下一轮读取范围：

| 范围 | 目标 |
| --- | --- |
| `server/app/models/*.py` | 确认所有 ORM 表、字段、关系、枚举状态 |
| `server/app/schemas/*.py` | 确认请求/响应 DTO 与前后端字段契约 |
| `server/alembic/versions/*.py` | 确认数据库迁移历史和最终表结构 |
| `server/scripts/seed.py` | 确认演示数据、默认账号、Prompt、知识、社区样例 |

下一轮输出目标：形成“数据库模型与 Schema 审计表”，为论文数据库设计和接口字段表提供准确依据。
