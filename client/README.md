# Client

Vite + React 客户端工程，包含前台页面、共享布局、路由和业务模块。后台页面源码放在顶层 `admin/`，通过 `@admin/*` 别名挂载到本应用的 `/admin/*` 路由。

## 启动

```powershell
cd client
pnpm install
pnpm dev --host 0.0.0.0
```

局域网访问示例：

- 客户端和后台入口：http://192.168.3.179:5173/
- 后台登录页：http://192.168.3.179:5173/admin/login

默认 API 地址会使用当前页面 host 的 `8000` 端口。需要手动覆盖时，在本地 `client/.env.local` 写入：

```env
VITE_API_BASE_URL=http://192.168.3.179:8000
```
