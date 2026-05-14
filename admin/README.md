# Admin

后台管理前端模块源码目录。

当前后台仍由 `client` 里的 Vite 应用统一构建和启动，路由入口是 `/admin/*`。这样可以保持前后台 token 隔离、共享 `apiClient`、共享基础 UI 与构建链路，同时让后台业务代码从 `client/src/features` 中独立出来。

常用入口：

- 登录：`/admin/login`
- 仪表盘：`/admin/dashboard`
- 用户管理：`/admin/users`
- 内容审核：`/admin/reviews`
- 知识内容：`/admin/content`
- Prompt 管理：`/admin/prompts`
- AI 日志：`/admin/ai-logs`
