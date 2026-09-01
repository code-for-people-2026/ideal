# Next.js 静态导出到 GitHub Pages 的承载边界

> 研究日期：2026-09-01  
> 对应决策票：[验证 Next.js 静态导出与 GitHub Pages 承载边界](https://github.com/code-for-people-2026/ideal/issues/96)

## 结论

统一站点可以采用 Next.js App Router，并以纯静态产物部署到当前根级自定义域名 `https://ideal.codeforpeople.cn/`。为了让 `/kith-inn/` 这类目录式规范路由既能从首页导航到达，也能被直接访问和刷新，构建配置需要明确采用：

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

这里的三个选项不是同一等级的选择：

- `output: 'export'` 是部署到纯静态 Pages 的基础；`next build` 会生成包含 HTML、CSS 与 JavaScript 的 `out/`。[Next.js：Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- `trailingSlash: true` 是本项目目录式 URL 的承载约束。它会把 `/about` 的默认输出 `/about.html` 改成 `/about/index.html`。[Next.js：trailingSlash](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash)
- `images.unoptimized: true` 是无需额外图片服务时的稳妥默认值。静态导出没有运行时 Image Optimization API；如需保留优化，必须另接自定义 loader，而不能使用默认 loader。[Next.js：Export with Image Optimization API](https://nextjs.org/docs/messages/export-image-api)

本项目的规范路由是固定清单，建议为每一条路由建立显式 `app/.../page.tsx`，不引入没有必要的动态段。动态段只有在构建期通过 `generateStaticParams()` 枚举全部参数时才能静态导出；`dynamicParams: true` 或缺少 `generateStaticParams()` 的动态路由不受支持。[Next.js：Static Exports — Unsupported Features](https://nextjs.org/docs/app/guides/static-exports#unsupported-features) [Next.js：generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

## 为什么目录式路由可以直达和刷新

Next.js 静态导出会为每个路由生成 HTML；在 `trailingSlash: true` 下，`/weekly-meal-planner/customer-prototype/` 对应的物理文件是：

```text
out/
└── weekly-meal-planner/
    └── customer-prototype/
        └── index.html
```

GitHub Pages 发布静态文件，并保持 artifact 的目录结构；它不提供项目可配置的服务器 rewrite 规则。[GitHub：Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) Next.js 官方部署说明也明确指出：默认的 `route.html` 输出需要静态主机添加 rewrite，而启用 `trailingSlash` 后可以省去该 rewrite。[Next.js：Static Exports — Deploying](https://nextjs.org/docs/app/guides/static-exports#deploying)

因此，对本项目而言：

- 每个首页 CTA 的目标都必须是构建清单中的真实静态路由，推荐用 `next/link`；静态导出支持客户端路由跳转和预取。[Next.js：Static Exports — Client Components](https://nextjs.org/docs/app/guides/static-exports#client-components)
- 直接访问与刷新不依赖客户端兜底，而是依赖对应的 `index.html` 已存在。
- 不能采用“只输出一个根 `index.html`，未知路径全部回退到 SPA”的设计，因为 GitHub Pages 没有可配置 rewrite，Next.js 静态导出也不支持 `rewrites`。
- 查询字符串与 hash 不改变静态文件匹配；它们可以继续作为同一页面的客户端状态输入，但不能用来要求服务器生成不同响应。

## App Router 的运行边界

Server Components 可以使用，但会在 `next build` 时执行并固化为静态 HTML 和客户端导航 payload；它们不能依赖每次请求才出现的数据。[Next.js：Static Exports — Server Components](https://nextjs.org/docs/app/guides/static-exports#server-components)

以下能力不能进入迁移架构，因为它们需要请求时的 Next.js/Node.js 运行时：

- 依赖请求的 Route Handlers；
- cookies、headers、Proxy/Middleware；
- rewrites、redirects 与自定义响应 headers；
- ISR、Draft Mode、Server Actions；
- 默认 loader 的图片优化；
- 未在构建期完整枚举的动态路由；
- Intercepting Routes。

完整清单见 [Next.js 静态导出的 Unsupported Features](https://nextjs.org/docs/app/guides/static-exports#unsupported-features)。本地图已经把 SSR、后端与 Server Actions 排除在范围外，研究结果与该边界一致；同时也意味着“不保留中文旧路由”的决定不能靠 Next.js `redirects` 实现，旧 URL 会自然进入 404。

### 浏览器 API 与查询参数

Client Component 仍会在构建期预渲染。`window`、`document`、`localStorage`、`navigator` 等对象不能在模块顶层或初次渲染时直接读取，应放在 `useEffect`、用户事件回调或其他只在浏览器执行的接缝中。[Next.js：Static Exports — Browser APIs](https://nextjs.org/docs/app/guides/static-exports#browser-apis)

这会直接影响现有 React 原型中读取 URL、写 history 或持久化状态的代码：

- 交互模块需要标成 Client Component，但不等于整个页面都要成为 Client Component；可以把浏览器状态收敛在最小交互子树。
- 初始 HTML 必须有确定的、不会造成 hydration mismatch 的状态；依赖 `localStorage` 或 viewport 的修正留到 hydration 后。
- 如使用 App Router 的 `useSearchParams()` 读取 `?step=...` 等状态，调用它的 Client Component 必须放进 `Suspense` 边界，否则生产静态构建会失败。[Next.js：useSearchParams — Static Rendering](https://nextjs.org/docs/app/api-reference/functions/use-search-params#static-rendering)
- 不应在 Server Component page 中读取 `searchParams` prop；它需要请求时数据，会让页面进入动态渲染。纯客户端筛选或步骤状态应使用 `useSearchParams` 或事件回调中的 `URLSearchParams`。[Next.js：Layouts and Pages — Rendering with search params](https://nextjs.org/docs/app/getting-started/layouts-and-pages#rendering-with-search-params)

## 静态资产与图片

`public/avatars/me.png` 会以 `/avatars/me.png` 暴露；`public` 下的路径以站点根路径 `/` 为基准。[Next.js：public Folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) 对当前五个项目，应按项目 slug 划分资源命名空间，例如 `public/kith-inn/...`，避免原型合并后发生同名覆盖，并且只迁移网站运行所需资产。

当前自定义域名把站点直接挂在 hostname 根路径，因此正式部署不应设置 `/ideal` `basePath`，也不需要 `assetPrefix`。`basePath` 只用于把应用部署到某个域名的子路径，而且会在构建时内联到客户端 bundle。[Next.js：basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) GitHub 官方 `configure-pages` action 会输出当前 Pages 的 `base_path`；其示例中自定义域名的 base path 是空字符串。[GitHub：configure-pages action](https://github.com/actions/configure-pages/blob/main/action.yml)

若未来放弃自定义域名，改为 `https://code-for-people-2026.github.io/ideal/`，才需要在该构建中使用 `/ideal`。这属于未来部署环境变化，不应污染当前规范 URL。

对于图片有三种可行路径：

1. 普通 `<img>` 指向 `public` 中的原文件；
2. `next/image` 配合全局 `images.unoptimized: true`；
3. `next/image` 配合外部自定义 loader。

第 1 或第 2 种最符合“技术迁移、不改变视觉”的目标；第 3 种会引入新的运行依赖和 URL 行为。`public` 资产默认不能被 Next.js 安全地长期缓存（文档给出的默认值为 `Cache-Control: public, max-age=0`），需要内容哈希缓存时应使用静态 import/构建资产，而不是假设可以在 Pages 上配置响应头。[Next.js：public Folder — Caching](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder#caching)

## 404 行为

`next build` 的静态导出会生成根级 `out/404.html`。[Next.js：Static Exports — Deploying](https://nextjs.org/docs/app/guides/static-exports#deploying) GitHub Pages 会把发布源根目录的 `404.html` 用作自定义 404 页面。[GitHub：Creating a custom 404 page](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site)

迁移实现应提供 `app/not-found.tsx`，让导出的 404 视觉与站点壳层一致并提供返回首页入口。需要特别验收两类情况：

- 一个存在的规范路由直接打开和刷新都返回页面；
- 一个不存在的路由以及已下线中文/`.html` 路由返回站点 404，而不是空白页或旧内容。

Pages 在找不到文件后才使用 `404.html`，不会先启动 Next.js 客户端路由。因此，404 页面不能弥补遗漏的静态 route 文件。

## CNAME、`.nojekyll` 与发布源

截至研究时，仓库 Pages API 返回的现状是：`build_type: legacy`，发布源为 `gh-pages:/`，自定义域名为 `ideal.codeforpeople.cn`，HTTPS 已启用。现有 workflow 把构建产物提交到 `gh-pages`，构建脚本同时复制 `CNAME` 并创建 `.nojekyll`。

这两个文件是否需要，取决于发布方式：

| 发布方式 | `CNAME` | `.nojekyll` |
| --- | --- | --- |
| 从 `gh-pages` 分支发布 | 必须保留在发布源根目录，用来保存自定义域名 | 必须保留，避免默认 Jekyll 流程处理静态生成器产物，尤其是 `_next/` |
| 自定义 GitHub Actions 直接部署 Pages artifact | 被 GitHub 忽略，不需要；域名保存在仓库 Pages 设置 | 不需要；artifact 是已构建好的静态站点，不进入分支 Jekyll 构建 |

GitHub 官方明确说明：分支发布时，自定义域名保存在根级 `CNAME`；使用自定义 Actions workflow 时不会创建 `CNAME`，已有文件也会被忽略。[GitHub：Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) GitHub 也把 `.nojekyll` 描述为“不采用推荐的自定义 Actions 构建、仍从分支发布”时关闭默认 Jekyll 的方式。[GitHub：Creating a GitHub Pages site — Static site generators](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#static-site-generators)

因此推荐在原子切换时把 Pages 发布源一并切换为 **GitHub Actions**，直接部署 `out/` artifact；自定义域名继续由 Settings → Pages 管理，不把 `CNAME` 或 `.nojekyll` 当作 Next.js 产物契约。如果实施阶段决定暂时沿用 `gh-pages` 分支，则这两个文件必须继续生成，不能只复制 `out/`。

## 推荐的 GitHub Actions 形态

GitHub 与 Next.js 的官方样例均采用两阶段 `build` → `deploy`：

1. checkout、安装 Node 与依赖；
2. `actions/configure-pages` 读取 Pages 元数据；
3. 执行 `next build`，产出 `out/`；
4. `actions/upload-pages-artifact` 上传 `out/`；
5. `actions/deploy-pages` 在依赖 build 的 deploy job 中发布。

deploy job 至少需要 `pages: write` 与 `id-token: write`，并使用 `github-pages` environment；artifact 顶层必须含 `index.html`。[GitHub：Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) [GitHub：Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) 可直接以 [Next.js 官方 GitHub Pages 模板](https://github.com/nextjs/deploy-github-pages) 为实施基线。

这会替代当前“给 workflow `contents: write`、清空并强推 `gh-pages` 内容”的部署方式。切换后源码分支无需存放构建产物，Pages 部署有独立 environment 与 artifact 记录，也更符合用户要求的完整验证后原子切换。

### 构建缓存

缓存只优化 CI 时间，不是运行时能力，也不是部署输入：

- 包管理器缓存可通过 `actions/setup-node` 的 npm cache 支持；仍然每次运行 `npm ci`。
- Next.js 官方 Pages 模板另外缓存 `.next/cache`，完整 key 包含 runner OS、lockfile hash 与源文件 hash，restore key 降级到 OS + lockfile。[Next.js 官方 GitHub Pages 模板](https://github.com/nextjs/deploy-github-pages/blob/main/.github/workflows/deploy.yml)
- GitHub cache miss 后会正常执行 job，并在成功后保存新缓存；缓存内容不可原地修改，key 变化会形成新条目。[GitHub：Dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- 每次部署必须重新运行 `next build` 并只上传新生成的 `out/`；不能缓存并直接部署旧 `out/`。验收流程也必须能在冷缓存下成功。

## 对迁移规格的硬性输入

后续 `/to-spec` 与页面/组件拆分 review 应明确写入以下约束：

1. `output: 'export'`、`trailingSlash: true`，正式自定义域名构建无 `basePath`/`assetPrefix`。
2. 所有规范 URL 都是构建期已知的显式静态 route；每条 route 在 `out/` 中都有对应目录 `index.html`。
3. 浏览器 API 和查询参数状态收敛到 Client Component 接缝；`useSearchParams` 必须配 `Suspense`，初始渲染必须确定。
4. 不使用任何需要请求时服务器的 Next.js 能力，不以 rewrite/redirect/SPA fallback 补路由。
5. 静态资产采用项目 slug 命名空间；图片使用原图或 `unoptimized`，不依赖默认图片优化服务。
6. 根级 `404.html` 必须生成并验收；未迁移旧 URL 明确进入 404。
7. 推荐切换为官方 Pages artifact workflow；若保留分支发布，则 `CNAME` 与 `.nojekyll` 仍是硬要求。
8. CI 缓存只覆盖依赖与 `.next/cache`，部署 artifact 永远是本次构建的新 `out/`。

## 尚需在其他决策票中确认的事项

本研究没有发现新的平台级阻塞问题。以下内容属于地图中已有工作的输入，而不是新的研究票：

- 页面公开契约盘点需列出哪些现有交互读取 URL/query、history、localStorage、viewport 或其他浏览器 API。
- 页面与模块拆分方案需指出 Client/Server Component 边界与每个 `Suspense` 边界。
- 部署验收需实际检查 `out/` route manifest、冷构建、直达/刷新、404、自定义域名与首页 CTA。

