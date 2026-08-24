# 排好菜工程实现模型：验收与证据

> 状态：验收规范草案，所有工程门禁当前均为 `NOT_RUN`。现有原型只能证明产品语义和 Mock 交互，不证明生成器、Repository、真实持久化或并发控制已经实现。

## 1. 验收结论规则

每个门禁只有三种结果：

- `PASS`：指定环境、数据集、样本量和断言全部达到阈值，并有可复查的原始证据。
- `FAIL`：至少一个必需断言不成立；不能用平均值或人工截图掩盖失败样本。
- `NOT_RUN`：尚未执行、环境不符合、只拿到 Mock 而门禁要求真实后端，或证据缺字段。`NOT_RUN` 不能解释为通过。

发布候选必须满足：所有 P0/P1 用例通过、硬规则和结构指标为 100%、保存一致性用例通过；软规则可以产生告警，但告警必须被正确返回和展示。

## 2. 本轮最高风险假设

### GATE-01（最高风险）：完整生成与硬规则可以同时成立

**假设**：在 86 道左右的家庭已确认菜品池中，生成器能稳定生成周一至周五的午饭和晚饭；结果恰好是 10 餐、50 个槽位、每餐 2 荤 2 素菜 1 汤，并且没有任何硬规则违规。近期重复或主料避重不能完全满足时，系统仍能返回完整菜单和可定位的软规则告警。

**通过标准**：

1. 使用固定的 `valid-pool` 和固定历史，对 `seed=0..999` 共 1,000 次生成全部成功。
2. 1,000 个被接受结果的结构完整率和硬规则满足率均为 100%；任何一次残缺、未确认菜品引用或硬规则违规都判失败。
3. `soft-warning-pool` 至少触发约定的近期重复/主料告警；结果仍完整，`softViolations` 包含 `ruleId`、`severity=SOFT`、`code` 和 `scope`。
4. `scarce-pool` 不返回半成品，稳定返回 `INSUFFICIENT_CONFIRMED_DISHES` 及按类别的需求/可用数量。
5. 在约定基准设备与 86 道规模数据上，领域生成核心 p95 不超过 300 ms；本地适配器端到端从点击到可编辑菜单渲染 p95 不超过 1,000 ms。

**不通过标准**：任一被接受结果违反硬规则；用缺槽位或未确认菜品“凑出”菜单；把软规则当硬错误阻断；菜品不足时返回可保存的半成品；或性能样本/环境不完整却宣称通过。

### GATE-02：局部调整不会重排整周

**假设**：`swapDish` 和 `selectDish` 共享同一套不可变替换与整周校验逻辑，且只改变目标 `mealId + position`。

**通过标准**：成功替换后，目标 `mealId + position` 的 `dishId` 符合 `expectedKind` 且来自当前 `CONFIRMED` 菜品；其余 49 个位置、周和餐次标识完全不变，`WeekPlan.version` 只增加 1。候选违反硬规则或 `expectedVersion` 过期时，Repository 中原计划保持不变。

**不通过标准**：任何非目标位置变化；手选绕过规则；UI 先显示成功而领域层随后回滚；失败替换仍增加 version。

### GATE-03：保存失败、重试和冲突不会造成数据丢失或静默覆盖

**假设**：Repository 的条件写入、`PlanningUnitOfWork`、版本令牌和 `commandId` 重放语义足以保证活动计划、历史快照与 UI 状态一致。

**通过标准**：正常保存原子地产生 `SAVED WeekPlan` 和一个 `SavedPlan`；提交前失败两者都不变化；提交结果未知后重放同一 `commandId`，最终只有一条快照；版本冲突不覆盖最新版本并要求重新加载。只有 `PlanningUnitOfWork` 返回成功后 UI 才显示已保存。

**不通过标准**：假成功、重复历史、失败后确认态计划丢失、冲突时最后写入者静默获胜，或活动计划与 `SavedPlan` 的菜单快照不一致。

### GATE-04：历史复制产生新的活动计划而不是篡改历史

**假设**：复制保留源 `SavedPlan` 的 50 个菜品安排，但建立新的活动 `WeekPlan` 身份并按当前菜品库与规则重验。

**通过标准**：源 `SavedPlan` 不变；新对象是 `EDITING / version 1 WeekPlan`，创建新计划/餐次 ID，平移日期，`source = { type: COPIED, savedPlanId }`；目标周已有活动计划或历史时不覆盖；当前硬规则不满足时不插入新活动计划。

**不通过标准**：修改源历史、沿用源版本、未经用户确认便进入历史、覆盖目标周，或跳过当前菜品可用性/规则检查。

## 3. 可复用测试夹具

夹具名称是契约的一部分；领域、适配器和端到端测试应复用相同语义，避免各层自行编造样例。

| 夹具 | 最小内容 | 用途 |
| --- | --- | --- |
| `valid-pool` | 60 道 `CONFIRMED` 菜品：24 `MEAT`、24 `VEGETABLE`、12 `SOUP`；ID、类型和主料键有效 | 成功生成、换菜、保存、复制 |
| `prototype-scale-pool` | 86 道 `CONFIRMED` 菜品，类型分布记录在证据中 | 接近当前原型规模的性能与回归 |
| `scarce-pool` | 只有 1 道可用荤菜，其他类别充足 | 验证每餐需要 2 道不同荤菜时的不足诊断 |
| `soft-warning-pool` | 结构候选充足，但历史窗口内主料/菜品重复不可完全避免 | 验证软规则不阻断且告警可定位 |
| `inactive-source-plan` | 一个已保存源计划，其中至少一个 `dishId` 在当前菜品快照中已不再是“已确认” | 复制后的硬规则复验 |
| `rule-conflict` | 测试专用规则集，餐次总位置数与分类数量之和矛盾 | 验证规则配置校验与 `HARD_RULE_VIOLATION`；不暴露给终端用户 |
| `storage-precommit-failure` | 写入前明确失败 | 保存失败不留记录 |
| `storage-postcommit-timeout` | 首次写入已提交，但调用方收到超时 | 同一 `commandId` 重放只得到原结果和一条记录 |
| `version-conflict` | 客户端 `expectedVersion=v7`，存储中已是内容不同的 `v8` | 冲突读取与恢复 |

固定目标周建议使用 `2026-09-07` 至 `2026-09-11`；执行报告必须记录时区、日期归一化方式、`catalogVersion`、`ruleSetVersion` 和 seed。

## 4. 最小验收矩阵

### 4.1 生成

| ID | 优先级 | 前置/输入 | 操作 | 必须观察到的输出与数据状态 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `GEN-01` | P0 | `valid-pool`、目标周无活动计划/历史、固定规则 | `generatePlan` 一次 | UI `EMPTY → GENERATING → EDITING`；返回并插入 `version 1` 计划；10 餐/50 位置、2/2/1、50 个 `ChangedPosition`、硬违规 0 | 领域断言 JSON + Repository 读回 + E2E trace |
| `GEN-02` | P0 | `valid-pool`、固定历史 | 对 seed 0..999 生成 | 1,000 次接受结果结构完整率 100%、硬规则满足率 100%；相同 seed、`catalogVersion` 和 `ruleSetVersion` 得到相同菜品安排 | 聚合 JSON + 失败样本列表 |
| `GEN-03` | P0 | `scarce-pool` | `generatePlan` | 返回 `INSUFFICIENT_CONFIRMED_DISHES` 和分类数量；UI 回到 `EMPTY`；没有活动计划或半成品 | 领域结果 + Repository 无记录断言 + UI trace |
| `GEN-04` | P0 | `rule-conflict` | `generatePlan` | 返回 `HARD_RULE_VIOLATION` 与结构化 `violations`；候选不插入 | 调用 spy + 领域结果 |
| `GEN-05` | P1 | `soft-warning-pool` | `generatePlan` | 返回完整 `EDITING` 计划；`softViolations` 可定位且不阻止调整、确认和保存 | 规则结果 + E2E 断言 |
| `GEN-06` | P1 | `prototype-scale-pool`、约定基准环境 | 连续运行 200 次，预热 20 次不计入 | 报告 p50/p95/max；领域核心 p95 ≤ 300 ms，本地 E2E p95 ≤ 1,000 ms | benchmark JSON + 环境清单 |

### 4.2 换一道与手选

| ID | 优先级 | 前置/输入 | 操作 | 必须观察到的输出与数据状态 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `SWP-01` | P0 | 有效 `EDITING`，选择周一午饭荤菜位置 | 点击“换一道”，调用 `swapDish` | 自动选择排名最高的硬规则有效候选；仅目标 `dishId` 变化；其他 49 位置不变；version +1；硬违规 0 | before/after canonical diff |
| `SWP-02` | P0 | 有效 `EDITING` | `listDishCandidates` 后以选中 ID 调 `selectDish` | 列表只含同类 `CONFIRMED` 菜；查询不增版；选择成功只改一处并增版 1 | 调用 trace + diff |
| `SWP-03` | P0 | 候选会造成硬规则违规 | `selectDish` | 返回 `HARD_RULE_VIOLATION`；Repository 中原计划和 version 均不变 | 深比较断言 + UI 断言 |
| `SWP-04` | P1 | 当前位置没有其他合格菜 | `swapDish` | 返回 `NO_REPLACEMENT_AVAILABLE`；允许返回/手选；不更新计划 | 领域结果 + E2E trace |
| `SWP-05` | P1 | UI 持有旧 `expectedVersion` | 提交换菜或手选 | 返回 `VERSION_CONFLICT.currentVersion`；加载当前计划，不覆盖较新改动 | 并发领域测试 |
| `SWP-06` | P1 | 替换只触发软规则 | 换菜或手选 | 替换成功、version +1，`softViolations.scope` 指向相关位置，用户可保留 | 规则结果 + UI 断言 |

### 4.3 确认保存

| ID | 优先级 | 前置/输入 | 操作 | 必须观察到的输出与数据状态 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `SAV-01` | P0 | 完整 `EDITING version N` | `confirmPlan` 后 `savePlan` | `EDITING vN → CONFIRMED vN+1 → SAVED vN+2`；`SavedPlan v1.sourcePlanVersion=N+2`；二者菜单快照一致，历史恰有一条 | UoW round-trip + E2E trace |
| `SAV-02` | P0 | `CONFIRMED` + `storage-precommit-failure` | `savePlan` | 活动计划仍为原 `CONFIRMED`，没有 `SavedPlan`；UI 不显示“已保存”，输入与 commandId 可重放 | adapter fault test + UI 断言 |
| `SAV-03` | P0 | `storage-postcommit-timeout` | 保存失败后用同一 `commandId` 重放 | 返回首次 `SavePlanOutput`；历史只有一条；活动计划版本不额外递增 | adapter contract log |
| `SAV-04` | P0 | `version-conflict` | 条件保存 | 返回 `VERSION_CONFLICT.currentVersion=v8`；最新计划未被覆盖；UI 重新加载并按最新 `EDITING/CONFIRMED/SAVED` 状态路由 | 双客户端/适配器测试 + E2E trace |
| `SAV-05` | P0 | 缺位置或硬规则违规的 `EDITING` 计划 | `confirmPlan` | 返回 `HARD_RULE_VIOLATION`；保持 `EDITING` 和原 version；无写调用 | spy + 领域结果 |
| `SAV-06` | P1 | 软告警存在、硬违规为零 | 用户直接确认并保存 | 保存成功；最终 `softViolations` 保留在 `SavedPlan.ruleEvaluation`，不要求持久化“已读/接受”状态 | 领域结果 + trace |

### 4.4 从历史复制

| ID | 优先级 | 前置/输入 | 操作 | 必须观察到的输出与数据状态 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `CPY-01` | P0 | 有效 `SavedPlan` 源、空目标周 | `copyPlan` 到下一周 | 插入新 `EDITING / version 1 WeekPlan`；50 个菜品安排保持；日期和 plan/meal ID 重建；`source.type=COPIED`；源快照不变；随后可执行 `SWP-01/02` | source/copy canonical diff + Repository 读回 + E2E trace |
| `CPY-02` | P0 | `savedPlanId` 不存在 | `copyPlan` | 返回 `NOT_FOUND`；不创建活动计划或历史 | 领域结果 |
| `CPY-03` | P0 | 目标周已有活动计划或历史 | `copyPlan` | 返回 `PLAN_ALREADY_EXISTS` / `TARGET_WEEK_ALREADY_SAVED`；既有数据不变；提供打开/换周，不覆盖 | Repository 断言 + UI 断言 |
| `CPY-04` | P0 | `inactive-source-plan` | `copyPlan` | 返回含 `DISH_NOT_CONFIRMED` 的 `HARD_RULE_VIOLATION`；不插入活动计划 | 规则结果 + Repository 无写断言 |
| `CPY-05` | P1 | 复制后只触发近期重复软规则 | `copyPlan` | 得到完整 `EDITING` 计划和 `softViolations`；允许继续换菜/手选 | 领域结果 + E2E trace |

## 5. 测试分层

### 5.1 单元测试：纯函数和边界值

目标是毫秒级、无 I/O、失败能定位到规则或转换函数。

| 测试对象 | 最小用例 | 核心断言 |
| --- | --- | --- |
| 餐次/整周结构校验 | 空周、9 餐、10 餐、重复 `(date, slot)`、重复 position、分类数量错误 | 只有唯一的 10 餐/50 位置和 2/2/1 结构通过 |
| `RuleEngine` 单条规则 | 菜品状态、类别匹配、同餐重复、周内重复、近 5 日主料重复 | `severity/code/scope` 稳定；规则函数不修改输入 |
| `WeekPlan` 单位置替换 | position 0/4、相同菜、类型不符、未确认菜 | 成功只改一处；失败输入深度不变；version 只在成功命令后增加 |
| `SavedPlan → WeekPlan` 复制 | 跨月/跨年周、日期平移、ID 重建 | 新计划为 `EDITING/version 1`；`source.savedPlanId` 正确；源快照不变 |
| 错误映射 | 每个领域/适配器错误 | 稳定 `code/details/retryable`；不把内部异常或敏感内容传给 UI |

### 5.2 领域测试：跨组件不变量

使用真实 `PlanGenerator`、`RuleEngine`、`CandidateRanker` 和 `PlanningApplication`，出站端口可用内存实现；不要 Mock 掉被验收的领域逻辑。

- 执行 `GEN-01..05`，包含 seed 0..999 的属性式循环；每个被接受结果都调用同一个 `assertCompleteWeekPlan`。
- 执行 `SWP-01..06`；使用 canonical before/after 映射证明只改变目标 `mealId + position`。
- 执行复制后再换菜的组合路径，证明复制得到的 `EDITING` 计划与生成计划共享后续入口。
- 注入规则集冲突、`catalogVersion` 变化和过期 `expectedVersion`，验证失败原子性。
- 对输入对象做冻结或深度快照，防止生成器、规则引擎通过原地修改制造隐式状态。

最小可执行断言（用项目最终测试框架等价表达）：

```text
for seed in 0..999:
  repositories.resetTo(validPool, fixedHistory)
  result = await application.generatePlan({
    commandId: "generate-" + seed,
    weekStart: "2026-09-07",
    seed: String(seed)
  })
  assert result.ok
  assertCompleteWeekPlan(result.data.plan)
  assert result.data.plan.ruleEvaluation.hardViolations is empty

before = canonicalPositions(plan)
result = await application.selectDish({
  commandId: "select-1",
  planId: plan.id,
  expectedVersion: plan.version,
  mealId,
  position,
  dishId
})
after = canonicalPositions(result.data.plan)
assert changedKeys(before, after) == [(mealId, position)]
assert result.data.plan.version == plan.version + 1
assert result.data.changedPositions.length == 1
```

### 5.3 适配器契约测试：同一套规范跑两遍

`DishCatalogPort`、`WeekPlanRepository`、`SavedPlanRepository` 与 `PlanningUnitOfWork` 的契约套件必须能对本地 Mock 适配器和未来真实后端适配器使用同一组断言；只替换启动/清理夹具。

必测行为：

1. 序列化往返、日期/枚举/空值规范化和未知字段策略。
2. 目标周唯一性、`expectedVersion` 条件写入和版本单调变化。
3. 在适配器之上运行应用重放集成用例：相同 `commandId + input` 返回原结果；相同 `commandId` 配不同输入返回 `INVALID_INPUT`。
4. 提交前失败、提交后响应丢失、读超时和重试。
5. 历史按 `weekStart` 降序并只返回不可变 `SavedPlan`；V0.1 不要求分页。
6. `DishCatalogPort.listConfirmed` 只返回 `CONFIRMED` 菜品，并带稳定的 `catalogVersion`。

本地 Mock 通过只代表端口行为的模拟实现正确；真实适配器必须再次通过，且需保留服务端日志/数据库查询或等价持久化证据。

### 5.4 端到端测试：用户动作到持久化结果

至少覆盖以下独立场景，使用稳定的 `data-testid`/语义角色和确定性数据装载，不依赖视觉坐标：

1. 生成 → 查看 10 餐 → 换一道 → 确认 → 保存 → 历史详情。
2. 生成 → 手选 → 保留软告警 → 保存。
3. 菜品不足 → 原状态保留 → 更新夹具 → 重试成功。
4. 保存失败 → 不显示成功 → 同一 `commandId` 重放 → 历史只有一条。
5. 两个客户端/页面产生版本冲突 → 不覆盖 → 加载最新计划并按其状态路由。
6. 历史复制到下一周 → 继续换菜 → 保存为新记录；源历史不变。

Mock E2E 是每次提交的快速门禁；接入真实后端后，上述 1、4、5、6 至少在候选环境各跑一次。截图用于辅助定位，DOM/网络响应/Repository 读回断言才是通过依据。

## 6. 指标、阈值和证据格式

| 指标 | 计算方式 | 通过阈值 | 必需证据 |
| --- | --- | --- | --- |
| 生成领域时延 | 同环境预热 20 次后运行 200 次，计 `PlanGenerator` 开始到 `RuleEngine` 完整求值结束，不含端口 I/O、持久化和渲染 | `prototype-scale-pool` p95 ≤ 300 ms | p50/p95/max、每次样本、设备/CPU、运行时、commit、seed |
| 本地端到端生成时延 | 用户点击到 50 个位置可交互，含本地适配器和渲染 | p95 ≤ 1,000 ms | 浏览器 trace、样本数组、设备与构建信息 |
| 真实后端生成时延 | 点击到可交互，含网络/真实适配器 | 候选阶段建议 p95 ≤ 2,000 ms；产品确认前保持 `NOT_RUN` | 前端 trace + 服务端关联 ID；Mock 数字不可替代 |
| 结构完整性 | `完整计划数 / 被接受计划数` | 100%；1,000 seeds | 每次结构断言结果和失败样本（应为空） |
| 硬规则满足率 | `hardViolations 为空的被接受计划 / 被接受计划` | 100%；任何一次违规即失败 | `ruleSetVersion`、`RuleEvaluation`、seed |
| 软规则告警契约 | 命中夹具时，预期告警是否返回、定位并可展示 | 指定夹具 100% 返回预期 `ruleId/severity=SOFT/code/scope`；不得阻断 | 规则结果 + UI 断言；无需追求告警数为 0 |
| 局部替换完整性 | 成功替换后非目标位置不变的比例 | 100% | canonical position diff |
| 持久化往返一致性 | 保存输入与读回对象移除服务端字段后深度相等 | 100% | 请求/响应摘要、读回记录、canonical diff |
| 命令幂等一致性 | 结果未知后同一 `commandId` 重放产生的快照数 | 每个保存命令恰好 1 个 `SavedPlan` | command 关联日志、存储查询、最终版本 |
| 版本冲突安全 | 冲突用例中最新计划未被覆盖且客户端加载 `currentVersion` | 100% | 双客户端 trace、冲突响应、最终存储快照 |
| 复制一致性 | 菜品安排保留且新计划/餐次身份、日期、`source` 正确 | 100% | source/copy canonical diff、源对象复查 |

建议证据目录（实现后由测试生成，当前不存在即不能引用为已验证）：

```text
prototype-implementation/evidence/
  acceptance-summary.json
  generation-benchmark.json
  domain-invariants.json
  adapter-contract-mock.json
  adapter-contract-real.json
  e2e-mock/
  e2e-real/
```

`acceptance-summary.json` 至少包含：commit、构建 ID、环境、数据夹具版本、门禁 ID、结果、样本量、失败用例、原始证据相对路径和生成时间。手工编辑的总结不能替代原始测试输出。

## 7. Mock 证据与真实后端证据的边界

| 声明 | 本地 Mock 能否证明 | 真实后端是否必需 | 判定边界 |
| --- | --- | --- | --- |
| 生成结果结构、规则分类、局部替换和复制纯逻辑 | 能，前提是使用真实领域代码而不是写死结果 | 否 | 领域测试是主证据 |
| UI 加载、错误、告警、重试和冲突分支可操作 | 能 | 候选阶段仍需抽样 | Mock 证明前端编排，不证明故障真的来自网络/数据库 |
| Repository 端口契约 | 只能证明 Mock 实现 | 是 | 同一契约套件在真实适配器通过后才成立 |
| 数据跨刷新/进程/设备持久存在 | 不能 | 是 | 需要真实存储读回与环境重启证据 |
| 事务、命令幂等、目标周唯一约束 | 只能模拟 | 是 | 需要提交后超时、重复请求和最终存储查询 |
| 多客户端版本冲突不会静默覆盖 | 只能验证 UI/应用策略 | 是 | 需要两个真实客户端或等价并发请求与最终记录 |
| 真实网络下 p95 时延、超时率和错误率 | 不能 | 是 | Mock benchmark 只能作为本地回归基线 |
| 登录、鉴权、云同步 | 本轮不验收 | 若进入未来范围则必需 | 当前不得因 Mock 登录态而宣称具备 |

禁止的证据替代：

- 用现有原型截图证明 Repository 已保存；
- 用写死的 50 道菜证明生成算法满足规则；
- 用内存 Map 的命令重放测试证明数据库事务已配置；
- 用单客户端顺序请求证明版本冲突安全；
- 用平均时延掩盖 p95 或失败样本。

## 8. 当前证据盘点

### 已验证（产品原型与静态工程模型层）

| 结论 | 现有证据 | 能证明到哪里 |
| --- | --- | --- |
| 产品目标是周一至周五午晚餐，共 10 餐 | `../../prototype-customer/README.md`、`../index.html` | 术语与页面范围 |
| 默认结构是每餐 2 荤 2 素 1 汤，只使用已确认菜品 | `../../prototype-customer/src/App.jsx`、`../index.html` | 原型文案和示例数据，不是领域校验 |
| 客户原型可演示生成、单道替换、确认、保存后查看详情 | `../../prototype-customer/design-qa.md` | 本地 React 状态的交互高光路径 |
| 实施画布表达“换一道/自己选”、软规则可保留和历史可复制 | `../index.html` | 静态产品设计意图；手选和复制没有工程实现证据 |
| V0.1 对象、状态、错误和应用接口已有统一目标契约 | `./contracts.md`、`./architecture.md` | 可用于实现和测试对齐；不证明代码已实现 |
| 当前没有真实数据、登录、后端接口或云端历史 | `../../README.md`、`../../prototype-customer/README.md` | 明确当前证据边界 |

### 仍未知

- 86 道实际菜品的类型分布、主料标签质量和历史数据是否足以稳定满足默认规则。
- `PlanGenerator` 和 `CandidateRanker` 的策略、同分排序以及 seed 重放是否按契约实现。
- 本地活动计划是否跨页面刷新恢复，以及最终采用哪种本地存储适配器。
- 基准设备、真实网络目标和 2,000 ms 候选阈值是否得到产品确认。
- 本地及未来真实存储是否实际强制目标周唯一、版本比较、`commandId` 重放和原子 `savePlanAndSnapshot`。
- 多标签页冲突提示的最终交互文案和重新加载体验；V0.1 契约明确不自动合并或强制覆盖。
- 真实适配器、真实后端、可观测性和证据目录尚未实现，所有工程门禁仍是 `NOT_RUN`。

## 9. 已验证 / 仍未知 / 下一步决策模板

每轮实现或评审复制以下模板，不允许只写“测试通过”：

```markdown
## 验收快照：<版本或构建 ID>

- 日期/负责人：
- commit / 构建：
- 环境：<Mock | 候选后端 | 生产等价>
- 数据夹具：<名称、版本、规模>
- 规则/菜品快照：<ruleSetVersion / catalogVersion>

### 已验证

| 声明 | 门禁/用例 | 结果 | 原始证据 | 适用边界 |
| --- | --- | --- | --- | --- |
| <可证伪的具体声明> | <GATE/CASE ID> | PASS | <相对路径> | <Mock/真实、设备、样本量> |

### 仍未知

| 问题 | 风险 | 缺少的证据 | 所有者 | 截止日期 |
| --- | --- | --- | --- | --- |
| <尚不能回答的问题> | <用户/数据/交付影响> | <实验或真实后端证据> | <角色> | <日期> |

### 下一步决策

- 决策问题：
- 可选项：
- 推荐项与理由：
- 放行门槛：<需要新增通过的 GATE/CASE>
- 决策人/日期：
- 若延期：<保持 NOT_RUN 的范围及保护措施>

### 总结

- 本轮结论：<PASS | FAIL | NOT_RUN>
- 可以进入的下一阶段：
- 明确不能宣称的能力：
```

## 10. 进入下一阶段前的最小清单

- [ ] `contracts.md` 的对象、状态、错误码与 `flows.md` 一致；如有差异，先统一术语再写测试。
- [ ] `GEN-01..06`、`SWP-01..06`、`SAV-01..06`、`CPY-01..05` 都有自动化用例或明确的暂缓决策。
- [ ] 所有 P0 用例通过；硬规则满足率与结构完整性均为 100%。
- [ ] Mock 与真实适配器证据分别标注，没有混用。
- [ ] 保存失败、提交结果未知和版本冲突都经过故障注入，不只测试成功路径。
- [ ] benchmark 报告包含原始样本、p95、环境和数据版本。
- [ ] 当前原型仍被标记为示例数据，没有把手选、复制或云端持久化写成已实现。
