# Issue 跟踪器：GitHub

本仓库的 Issue 和 PRD 使用 GitHub Issues 管理。所有操作使用 `gh` CLI。

## 约定

- **创建 Issue**：`gh issue create --title "..." --body "..."`。多行正文使用 heredoc。
- **读取 Issue**：`gh issue view <number> --comments`，同时获取标签，并按需使用 `jq` 过滤评论。
- **列出 Issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，并根据需要添加 `--label` 和 `--state` 筛选条件。
- **评论 Issue**：`gh issue comment <number> --body "..."`。
- **添加/移除标签**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`。
- **关闭 Issue**：`gh issue close <number> --comment "..."`。

通过 `git remote -v` 推断当前仓库；在克隆目录中运行时，`gh` 会自动完成这一步。

## 将 Pull Request 用作分诊入口

**PRs as a request surface: no.**

这表示本仓库不把 PR 当作需求入口。如果未来将外部 PR 视为功能需求，将上述固定配置行的 `no` 改为 `yes`；`/triage` 会读取该配置。

如果改为 `yes`，PR 使用与 Issue 相同的标签和状态，操作改用对应的 `gh pr` 命令：

- **读取 PR**：用 `gh pr view <number> --comments` 读取说明与评论，用 `gh pr diff <number>` 读取差异。
- **列出待分诊的外部 PR**：运行 `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`，只保留 `authorAssociation` 为 `CONTRIBUTOR`、`FIRST_TIME_CONTRIBUTOR` 或 `NONE` 的项，排除 `OWNER`、`MEMBER` 和 `COLLABORATOR`。
- **评论/标记/关闭**：使用 `gh pr comment`、`gh pr edit --add-label` / `--remove-label` 和 `gh pr close`。

GitHub 的 Issue 和 PR 共用同一组编号，因此单独的 `#42` 可能指任意一种。先用 `gh pr view 42` 尝试读取 PR，失败后再用 `gh issue view 42`。

## 当 Skill 要求“发布到 Issue 跟踪器”

创建一个 GitHub Issue。

## 当 Skill 要求“获取相关 Ticket”

运行 `gh issue view <number> --comments`。

## Wayfinding 操作

以下操作供 `/wayfinder` 使用。**地图**是一个独立 Issue，其子 Issue 是需要处理的 Ticket。

- **地图**：一个带有 `wayfinder:map` 标签的 Issue，正文包含备注、已得决策和未知区域。使用 `gh issue create --label wayfinder:map` 创建。
- **子 Ticket**：作为 GitHub 子 Issue 关联到地图（通过 `gh api` 调用子 Issue 端点）。如果仓库没有启用子 Issue，则将子 Ticket 加入地图正文的任务列表，并在子 Ticket 顶部写入 `Part of #<map>`。标签为 `wayfinder:<type>`，其中 `<type>` 可为 `research`、`prototype`、`grilling` 或 `task`。Ticket 被领取后，分配给当前驱动开发的人。
- **阻塞关系**：使用 GitHub 原生 Issue 依赖，作为界面可见的权威表达。运行 `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 添加依赖，其中 `<blocker-db-id>` 是阻塞 Issue 的数字**数据库 ID**（通过 `gh api repos/<owner>/<repo>/issues/<n> --jq .id` 获得），不是 `#number` 或 `node_id`。GitHub 在 `issue_dependencies_summary.blocked_by` 中返回仍处于打开状态的阻塞项数。如果不支持依赖，在子 Ticket 顶部改用 `Blocked by: #<n>, #<n>`。所有阻塞 Issue 关闭后，Ticket 才解除阻塞。
- **前沿查询**：列出地图中未关闭的子 Issue（通过 `gh issue list --state open`，并限定在地图的子 Issue 或任务列表范围内），排除仍有打开阻塞项（`issue_dependencies_summary.blocked_by > 0` 或 `Blocked by` 行中仍有打开的 Issue）以及已有受让人的项，按地图顺序取第一个。
- **领取**：运行 `gh issue edit <n> --add-assignee @me`，这是当前 Session 的第一次写操作。
- **解决**：运行 `gh issue comment <n> --body "<answer>"`，然后运行 `gh issue close <n>`，最后把上下文指针（gist 和链接）追加到地图的“已得决策”中。
