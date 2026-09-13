# 微信群订单对账

这是已上线的 Next.js 对账工具，独立部署在 Vercel，数据库为 Neon。正式域名为 [duizhang.codex.codeforpeople.cn](https://duizhang.codex.codeforpeople.cn/)，三个群使用 `/taozi/`、`/jingjing/`、`/yuma/`。访问需要各群专属链接，完整凭证由站点持有人单独分发。

源码维护在本目录。该工具独立于街坊味展示原型和现有 P0：只整理经授权读取的微信接龙及付款证据，提供人工收款确认，不发起微信支付。

## 功能与数据

- 按北京时间展示日期和最近成功同步时间；今天位于日期栏最左侧。带凭证首次进入且今天没有订单时，选择最近有订单的日期。
- 展示客户昵称、商品分量、金额及群内付款证据。人工确认写入 Neon，支持跨设备读取、撤销和并发版本检查。
- 各群凭证独立存入当前浏览器 localStorage，验证后由 HttpOnly Cookie 建立会话；订单接口校验所属群。
- `ledger_days` 保存每日订单快照，`ledger_confirmations` 保存人工确认及对应订单依据，`ledger_imports` 记录导入批次，`ledger_sync_status` 单独保存成功同步时间。

## 开发与验证

使用 Node.js 22.23 或更新版本，在本目录执行：

```sh
npm ci
npm run dev
npm run build
node --experimental-strip-types --test scripts/browser-session.test.mjs
```

环境变量由 `.env.production.local` 或 Vercel 环境提供：

| 变量 | 用途 |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL 连接 |
| `SESSION_SECRET` | 会话签名密钥 |
| `LEDGER_KEY_HASHES` | 以三个群 slug 为键、SHA-256 凭证摘要为值的 JSON |

新数据库执行 `npm run db:init`。`scripts/verify-db.mjs` 是显式运行的数据库集成检查，会创建并清理独立测试 schema；日常前端验证不需要运行它。

## Vercel 部署

复用现有 `duizhang` 项目，避免重新创建项目或数据库。在本目录执行 `vercel link --project duizhang`，然后 `vercel --prod`。若在 Vercel 连接本 GitHub 仓库，Root Directory 设置为 `3.1-kith-inn/order-ledger`，框架为 Next.js。

代码迁移保留现有自定义域名、Neon 数据库和专属凭证。运行时配置、微信原始消息、订单导出与访问链接不进入 Git；`.gitignore` 和 `.vercelignore` 分别约束提交和部署边界。

## 本机定时同步

复制 [同步配置模板](./sync.config.example.json) 为本机 `sync.config.json`，填写现有账号、群和命令路径，运行时数据使用仓库外的私有目录。也可通过 `ORDER_LEDGER_CONFIG` 指定配置文件。

每天北京时间凌晨 1 点由本机 Codex 定时任务按 [同步步骤](./SYNC.md) 执行。电脑和 Codex 需要可运行，微信消息需已同步。只有完成采集、分析和云端核验才更新成功同步时间；没有新增订单也记录本次成功检查。

## GitHub Pages 撤下

旧 `/kith-inn/order-ledger/{taozi,jingjing,yuma}/` 静态部署已由 Vercel 版本替代。旧静态入口、加密快照及生成脚本从当前源码移除；本目录存在 `vercel.json`，Pages 构建明确跳过这类独立应用，并检查产物中不存在旧入口。其他产品的 Pages 发布保持原有流程。
