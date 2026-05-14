# 第六轮审计：数据库模型、Schema、迁移与种子数据细读

> 本文件是项目代码库审计的第六轮补充文件，重点核对 ORM 模型、Pydantic Schema、Alembic 迁移和 seed 数据，为后续 `PROJECT_ANALYSIS.md` 中的数据库设计、接口字段设计、ER 关系和测试数据说明提供依据。

## 1. 本轮读取范围

本轮已读取并确认以下文件：

| 文件 | 类型 | 审计目标 |
| --- | --- | --- |
| `server/app/models/__init__.py` | ORM 聚合 | 确认当前后端导入的全部模型 |
| `server/app/models/user.py` | ORM | 普通用户与邮箱验证码表 |
| `server/app/models/user_settings.py` | ORM | 用户通知设置与偏好设置 |
| `server/app/models/patient.py` | ORM | 患者基础信息表 |
| `server/app/models/care_record.py` | ORM | 护理记录事件表 |
| `server/app/models/care_metric.py` | ORM | 护理指标表 |
| `server/app/models/care_task.py` | ORM | 护理任务表 |
| `server/app/models/knowledge.py` | ORM | 知识分类、文章、点赞、收藏表 |
| `server/app/models/community.py` | ORM | 社区帖子、评论、点赞、收藏、举报表 |
| `server/app/models/ai_log.py` | ORM | AI 助手日志表 |
| `server/app/models/admin.py` | ORM | 后台管理员与 Prompt 模板表 |
| `server/app/schemas/base.py` | Schema | camelCase 转换与分页结构 |
| `server/app/schemas/auth.py` | Schema | 认证、注册、登录、重置密码 DTO |
| `server/app/schemas/user.py` | Schema | 用户资料、头像、统计、通知、偏好 DTO |
| `server/app/schemas/patient.py` | Schema | 患者基础信息与患者 dashboard DTO |
| `server/app/schemas/care_record.py` | Schema | 护理记录与指标 DTO |
| `server/app/schemas/care_task.py` | Schema | 护理任务 DTO |
| `server/app/schemas/trend.py` | Schema | 趋势 series 与分析 DTO |
| `server/app/schemas/ai.py` | Schema | AI 助手请求与响应 DTO |
| `server/app/schemas/knowledge.py` | Schema | 知识分类、文章、互动状态 DTO |
| `server/app/schemas/community.py` | Schema | 社区帖子、评论、举报、审核状态 DTO |
| `server/app/schemas/admin.py` | Schema | 后台登录、统计、用户、审核、知识、Prompt、AI 日志 DTO |
| `server/alembic/versions/20260513_0001_initial_schema.py` | Migration | 初始核心表迁移 |
| `server/alembic/versions/20260513_0002_knowledge_module.py` | Migration | 知识模块迁移 |
| `server/alembic/env.py` | Migration | Alembic target metadata |
| `server/scripts/seed.py` | Seed | 演示用户、管理员、患者、护理记录、任务、知识、社区数据 |

## 2. ORM 模型总体结论

`server/app/models/__init__.py` 当前聚合导入的模型包括：

| 类名 | 对应表 | 模块 |
| --- | --- | --- |
| `User` | `users` | 普通用户 |
| `EmailVerificationCode` | `email_verification_codes` | 邮箱验证码 |
| `UserNotificationSetting` | `user_notification_settings` | 用户通知设置 |
| `UserPreference` | `user_preferences` | 用户偏好设置 |
| `Patient` | `patients` | 患者 |
| `CareRecord` | `care_records` | 护理记录事件 |
| `CareMetric` | `care_metrics` | 护理指标 |
| `CareTask` | `care_tasks` | 护理任务 |
| `KnowledgeCategory` | `knowledge_categories` | 知识分类 |
| `KnowledgeArticle` | `knowledge_articles` | 知识文章 |
| `UserKnowledgeLike` | `user_knowledge_likes` | 知识点赞 |
| `UserKnowledgeBookmark` | `user_knowledge_bookmarks` | 知识收藏 |
| `CommunityPost` | `community_posts` | 社区帖子 |
| `CommunityComment` | `community_comments` | 社区评论 |
| `CommunityPostLike` | `community_post_likes` | 帖子点赞 |
| `CommunityPostBookmark` | `community_post_bookmarks` | 帖子收藏 |
| `CommunityPostReport` | `community_post_reports` | 帖子举报 |
| `AiAssistantLog` | `ai_assistant_logs` | AI 日志 |
| `AdminUser` | `admin_users` | 后台管理员 |
| `PromptTemplate` | `prompt_templates` | Prompt 模板 |

这说明当前 ORM 层已经覆盖普通用户端、后台管理端、AI、知识和社区的主要数据对象。

## 3. 核心表结构审计

### 3.1 用户与认证相关表

#### `users`

| 字段 | 说明 |
| --- | --- |
| `id` | 主键，前缀 `usr` |
| `username` | 用户名 |
| `email` | 邮箱，唯一且有索引 |
| `password_hash` | 密码哈希 |
| `avatar_url` | 头像 URL 或头像数据路径 |
| `status` | 用户状态，默认 `active` |
| `created_at` / `updated_at` | 创建与更新时间 |

`User` 与患者、设置、AI 日志、知识互动、社区内容均建立关系。

#### `email_verification_codes`

| 字段 | 说明 |
| --- | --- |
| `id` | 主键 |
| `email` | 邮箱，有索引 |
| `code` | 验证码 |
| `expires_at` | 过期时间 |
| `used_at` | 使用时间 |
| `created_at` | 创建时间 |

该表用于验证码数据库兜底，Redis 用于快速读取、冷却和锁定。

#### `user_notification_settings`

字段包括：

- `task_reminder_enabled`
- `health_alert_enabled`
- `system_notification_enabled`

用于个人中心通知设置。

#### `user_preferences`

字段包括：

- `theme`
- `language`

用于个人中心偏好设置。

### 3.2 患者与护理数据表

#### `patients`

患者表保持 MVP 字段边界：

| 字段 | 说明 |
| --- | --- |
| `id` | 患者 ID |
| `user_id` | 所属用户 |
| `name` | 患者姓名 |
| `age` | 年龄 |
| `gender` | 性别，仅允许 `男`、`女`、`其他` |
| `profile_note` | 护理说明 |
| `created_at` / `updated_at` | 创建与更新时间 |

论文中应强调：患者表没有扩展成复杂医疗病历表，正式护理过程数据放在护理记录和护理指标中。

#### `care_records`

代表一次护理事件：

| 字段 | 说明 |
| --- | --- |
| `id` | 记录 ID |
| `patient_id` | 所属患者 |
| `record_type` | 记录类型 |
| `occurred_at` | 发生时间 |
| `notes` | 备注 |
| `source` | 来源：`manual` 或 `ai` |
| `created_at` / `updated_at` | 创建与更新时间 |

`record_type` 约束为：

```text
blood_pressure, temperature, blood_sugar, heart_rate, medication, diet, other
```

#### `care_metrics`

代表护理事件下的结构化指标：

| 字段 | 说明 |
| --- | --- |
| `id` | 指标 ID |
| `care_record_id` | 所属护理记录 |
| `metric_key` | 指标 key，如 `bloodPressureSystolic` |
| `value_numeric` | 数值型值 |
| `value_text` | 文本型值 |
| `unit` | 单位 |
| `created_at` | 创建时间 |

论文重点：血压不是一个字符串，而是收缩压和舒张压两个指标：

- `bloodPressureSystolic`
- `bloodPressureDiastolic`

### 3.3 护理任务表

#### `care_tasks`

| 字段 | 说明 |
| --- | --- |
| `id` | 任务 ID |
| `patient_id` | 所属患者 |
| `title` | 任务标题 |
| `description` | 任务描述 |
| `task_type` | 任务类型 |
| `remind_time` | 提醒时间 |
| `repeat_rule` | 重复规则 |
| `priority` | 优先级 |
| `remind_offset_minutes` | 提前提醒分钟数 |
| `status` | 任务状态 |
| `created_at` / `updated_at` | 创建与更新时间 |

枚举约束：

| 字段 | 可选值 |
| --- | --- |
| `task_type` | `blood_pressure`、`blood_sugar`、`medication`、`diet`、`rehab`、`appointment`、`nutrition`、`other` |
| `repeat_rule` | `once`、`daily`、`weekly`、`monthly` |
| `priority` | `low`、`normal`、`high` |
| `status` | `pending`、`completed`、`scheduled` |

注意：论文可写任务提醒字段，但不要写成后台定时推送系统；本轮只确认数据库字段和状态流。

### 3.4 知识模块表

#### `knowledge_categories`

字段包括：

- `id`
- `name`
- `slug`
- `description`
- `sort_order`
- `created_at`
- `updated_at`

#### `knowledge_articles`

字段包括：

- `category_id`
- `title`
- `summary`
- `content`
- `article_type`
- `author_name`
- `author_title`
- `source`
- `video_url`
- `read_time_minutes`
- `cover_color`
- `status`
- `view_count`
- `like_count`
- `published_at`

其中：

| 字段 | 可选值 |
| --- | --- |
| `article_type` | `article`、`video` |
| `status` | `published`、`draft`、`archived` |

#### 知识互动表

| 表 | 作用 | 唯一约束 |
| --- | --- | --- |
| `user_knowledge_likes` | 用户点赞知识文章 | `user_id + article_id` |
| `user_knowledge_bookmarks` | 用户收藏知识文章 | `user_id + article_id` |

### 3.5 社区模块表

#### `community_posts`

字段包括：

- `author_id`
- `title`
- `content`
- `tag`
- `status`
- `review_reason`
- `view_count`
- `like_count`
- `comment_count`
- `report_count`

状态约束：

```text
pending, passed, rejected
```

#### `community_comments`

字段包括：

- `post_id`
- `author_id`
- `content`
- `status`
- `review_reason`
- `created_at`
- `updated_at`

同样使用 `pending/passed/rejected` 状态约束。

#### 社区互动表

| 表 | 作用 | 约束 |
| --- | --- | --- |
| `community_post_likes` | 帖子点赞 | `user_id + post_id` 唯一 |
| `community_post_bookmarks` | 帖子收藏 | `user_id + post_id` 唯一 |
| `community_post_reports` | 帖子举报 | 无唯一约束，允许多次举报记录 |

### 3.6 AI 与后台管理表

#### `ai_assistant_logs`

字段包括：

| 字段 | 说明 |
| --- | --- |
| `user_id` | 调用用户 |
| `message` | 用户输入 |
| `intent` | AI 意图 |
| `answer_text` | AI 回复 |
| `draft_type` | 草稿类型：record/task/null |
| `draft_payload` | JSONB 草稿数据 |
| `sources` | JSONB 来源列表 |
| `risk_note` | 风险提示 |
| `created_at` | 创建时间 |

此表是后台 AI 日志审计的基础。

#### `admin_users`

字段包括：

- `username`
- `email`
- `password_hash`
- `status`
- `created_at`
- `updated_at`

状态约束为：

```text
active, disabled
```

#### `prompt_templates`

字段包括：

- `key`
- `name`
- `description`
- `content`
- `status`
- `is_system`
- `created_at`
- `updated_at`

状态约束为：

```text
active, disabled
```

该表用于后台 Prompt 管理，并被 AI 服务和趋势分析服务读取。

## 4. Schema 设计审计

### 4.1 camelCase 转换

`schemas/base.py` 定义 `CamelModel`，通过 alias generator 将 snake_case 字段转换为 camelCase。这解释了为什么后端 ORM 使用 snake_case，而前端收到的是 camelCase。

分页结构统一为：

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

论文中可写：系统在后端 Schema 层统一处理前后端命名差异。

### 4.2 Auth Schema

认证 DTO 包括：

| DTO | 字段 |
| --- | --- |
| `SendEmailCodeRequest` | email |
| `RegisterRequest` | username、email、code、password |
| `ResetPasswordRequest` | email、code、password |
| `LoginRequest` | email、password |
| `TokenResponse` | token、refreshToken |

注意：Schema 中没有 `confirmPassword`，密码二次确认是在前端表单层做的。

### 4.3 Patient Schema

患者创建/更新字段为：

- name
- age
- gender
- profileNote

Dashboard DTO 额外包含：

- conditionSummary
- overview
- recentRecords
- upcomingTasks
- trendPreview

这说明患者正式表字段与页面展示派生数据是分离的。

### 4.4 CareRecord Schema

护理记录创建/更新包含：

- patientId
- recordType
- occurredAt
- notes
- source
- metrics

其中 `metrics` 是 `CareMetricIn[]`，每个 metric 包含：

- key
- value
- unit

### 4.5 CareTask Schema

护理任务创建/更新包含：

- patientId
- title
- description
- taskType
- remindTime
- repeatRule
- priority
- remindOffsetMinutes
- status

### 4.6 Trend Schema

趋势 DTO 包括：

- `TrendSeries`: patientId、metricType、points
- `TrendAnalysis`: summary、riskLevel、highlights、suggestions、riskNote、generatedBy

### 4.7 AI Schema

AI 助手响应包括：

- conversationId
- intent
- answerText
- draftType
- draftPayload
- sources
- riskNote
- generatedBy

`intent` 支持：

```text
qa, care_record, care_task, form_prefill
```

### 4.8 Knowledge Schema

知识文章支持：

- article/video 类型
- videoUrl
- isLiked
- isBookmarked
- viewCount
- likeCount

### 4.9 Community Schema

社区统一审核状态：

```text
pending, passed, rejected
```

帖子输出包含 author、互动计数和用户动作状态。

### 4.10 Admin Schema

后台 DTO 覆盖：

- admin login/me/token
- dashboard summary
- user out/status update
- review update
- knowledge article create/update/status
- prompt template update/out
- AI log out

## 5. Alembic 迁移审计

### 5.1 已成功读取到的迁移

本轮成功读取到：

| 文件 | revision | 内容 |
| --- | --- | --- |
| `20260513_0001_initial_schema.py` | `20260513_0001` | users、email_verification_codes、patients、user settings、care_records、care_tasks、care_metrics、ai_assistant_logs |
| `20260513_0002_knowledge_module.py` | `20260513_0002` | knowledge_categories、knowledge_articles、user_knowledge_likes、user_knowledge_bookmarks |

### 5.2 重要风险：迁移文件与当前 ORM 可能不完全同步

当前 ORM 模型已经包含：

- `admin_users`
- `prompt_templates`
- `community_posts`
- `community_comments`
- `community_post_likes`
- `community_post_bookmarks`
- `community_post_reports`
- `users.avatar_url`
- `knowledge_articles.video_url`

但本轮成功读取到的 `0001` 和 `0002` 迁移文件中，没有覆盖这些后续表和字段。

这说明需要进一步核查：

1. Alembic versions 目录中是否还有当前工具未成功定位的后续迁移文件。
2. 当前开发数据库是否通过其他方式创建了后续表。
3. `alembic upgrade head` 在全新数据库上是否能完整创建当前 ORM 所需全部表。

在正式论文或交付说明中，不能只基于 `models` 写数据库完整性，还需要确认迁移链是否完整。

### 5.3 论文表述建议

在数据库设计章节可以基于 ORM 表结构描述完整设计；但在部署/迁移章节，应谨慎写：

> 数据库表结构由 SQLAlchemy ORM 定义，并通过 Alembic 迁移管理。实际交付前需确认迁移文件覆盖全部当前 ORM 模型。

如果后续确认迁移完整，再改成：

> 数据库表结构由 Alembic 迁移完整管理。

## 6. Seed 数据审计

`server/scripts/seed.py` 已确认创建以下演示数据：

### 6.1 默认账号

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| 普通用户 | `caregiver@example.com` | `password123` |
| 管理员 | `admin@example.com` | `admin123` |

### 6.2 默认患者

| 患者 | 年龄 | 性别 | 说明 |
| --- | --- | --- | --- |
| 张明 | 68 | 男 | 高血压长期管理，每日记录血压 |
| 李芳 | 72 | 女 | 术后康复期，关注饮食、活动量和夜间休息 |

### 6.3 默认护理数据

seed 为“张明”生成 3 条血压记录，每条包含：

- `bloodPressureSystolic`
- `bloodPressureDiastolic`

这与双层护理记录模型一致。

### 6.4 默认任务

seed 为“张明”生成一个每日测量血压任务：

- taskType: `blood_pressure`
- repeatRule: `daily`
- priority: `normal`
- status: `pending`

### 6.5 默认知识库

seed 创建四个知识分类：

| 分类 | slug |
| --- | --- |
| 慢病管理 | `chronic` |
| 饮食护理 | `diet` |
| 康复训练 | `rehab` |
| 常见症状处理 | `symptoms` |

并创建多篇知识文章，包括高血压、糖尿病、老年饮食、预防压疮、脑卒中康复、发热护理等内容。其中脑卒中康复文章类型为 `video`，但 seed 中未设置真实 `video_url`。

### 6.6 默认社区内容

seed 创建社区帖子：

| 标题 | 状态 |
| --- | --- |
| 分享一个测血压的小技巧 | `passed` |
| 老年糖尿病患者的饮食记录表格 | `passed` |
| 照顾卧床老人时如何预防压疮？ | `pending` |

还创建两条评论，其中一条 `passed`，一条 `pending`。

## 7. 可写入论文的数据库设计重点

1. **患者基础档案与护理过程数据分离**：患者表只保存基础信息，护理过程数据进入记录与指标表。
2. **护理记录双层模型**：`care_records` 保存事件，`care_metrics` 保存指标。
3. **数值与文本分离存储**：指标值可进入 `value_numeric` 或 `value_text`。
4. **血压双指标设计**：收缩压与舒张压分开保存，便于趋势分析。
5. **社区审核状态统一**：帖子和评论共用 `pending/passed/rejected` 状态。
6. **AI 日志 JSONB**：草稿和 sources 使用 JSONB 保存，便于后台审计。
7. **Prompt 模板表**：支持后台维护 AI 提示词。
8. **知识互动唯一约束**：点赞和收藏通过 `user_id + article_id` 唯一约束防止重复。
9. **社区互动唯一约束**：帖子点赞和收藏通过 `user_id + post_id` 唯一约束防止重复。
10. **普通用户与管理员分表**：`users` 与 `admin_users` 分开建模。

## 8. 谨慎表述点

1. `confirmPassword` 只在前端表单中存在，后端注册 Schema 不接收该字段。
2. 头像接口 Schema 为 `imageData`，具体存储需结合 users route/service 表述，不宜直接写 multipart 文件上传。
3. Knowledge seed 中 video 文章没有真实 videoUrl，因此演示数据层面不要写“已有可播放视频内容”。
4. 社区评论表支持 `pending/passed/rejected`，但前端/后端 route 目前主要确认帖子审核，评论审核是否完整需要额外确认。
5. Alembic 迁移文件与当前 ORM 模型存在可能不同步风险，正式交付前需核查迁移链完整性。

## 9. 对正式 `PROJECT_ANALYSIS.md` 的修订建议

正式数据库设计章节建议分为：

1. 用户认证表设计。
2. 患者基础档案表设计。
3. 护理记录与指标表设计。
4. 护理任务表设计。
5. 知识学习表设计。
6. 社区交流表设计。
7. AI 日志与 Prompt 表设计。
8. 后台管理员表设计。

正式接口设计章节建议强调：

1. 后端 Schema 通过 `CamelModel` 自动输出 camelCase。
2. 分页统一返回 `items/page/pageSize/total`。
3. 护理记录使用 `metrics[]` 传递动态指标。
4. AI 使用 `intent/draftType/draftPayload` 表达结构化草稿。
5. 审核状态统一为 `pending/passed/rejected`。

## 10. 下一轮计划：测试脚本、README、API 文档与运行验证审计

下一轮读取范围：

| 范围 | 目标 |
| --- | --- |
| `server/scripts/api_smoke_test.py` | 确认自动化接口测试覆盖范围 |
| `README.md` | 对照已读代码确认运行说明是否准确 |
| `server/README.md` 或相关文档 | 后端运行、环境变量、SMTP、Redis、DeepSeek 说明 |
| `api.yaml` | 与真实 route 对比，确认 API 契约是否过时 |
| `client/package.json`、`server/requirements.txt` | 确认构建和运行依赖 |
| `docker-compose.yml` | 与 README 和配置保持一致性 |

下一轮输出目标：形成“测试与文档审计表”，为论文系统测试章节和最终 `PROJECT_ANALYSIS.md` 收口做准备。
