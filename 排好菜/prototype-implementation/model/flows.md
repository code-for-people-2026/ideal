# 排好菜工程实现模型：动态流程

> 状态：待实现的工程约定，不是现有能力声明。现有客户原型只用本地示例数据演示高光路径；本文件描述后续实现应满足的调用、状态和失败语义。对象、状态、错误码和函数签名遵循 [contracts.md](./contracts.md)。

## 1. 共同约定

### 1.1 产品事实

- 目标周为周一至周五，共 10 个餐次；每餐固定 2 道荤菜、2 道素菜、1 道汤，共 50 个菜品槽位。
- 生成和换菜只能引用菜品库中的“已确认菜品”。
- 每餐结构、槽位完整、菜品可用性属于硬规则；近期使用、同一主料避重属于软规则，命中时给出告警，但不静默阻止用户继续。
- 换一道和手选只允许改变当前 `mealId + position`；其余 49 个位置保持不变。
- 保存成功后才形成历史 `SavedPlan`。进入确认页只代表活动 `WeekPlan` 已持久化为 `CONFIRMED`，不代表已经保存到历史。
- 第一阶段不包含登录、云同步、采购清单和菜品维护；出站端口先由本地 Mock 适配器实现，未来真实后端必须复用相同应用与错误契约。

### 1.2 参与组件

| 组件 | 职责 | 不负责 |
| --- | --- | --- |
| 小程序 UI / `PlanStore` | 收集用户输入、展示加载/编辑/只读/告警/错误，持有应用接口返回的最新 `WeekPlan` | 不自行生成菜单，不直接改领域对象 |
| `PlanningApplication` | 统一应用入口；编排用例、Repository、生成器与规则引擎；返回 `AppResult` | 不直接读写浏览器存储或拼接后端 URL |
| `PlanGenerator` | 根据目标周、固定餐次模板、候选菜和历史生成候选 `WeekPlan` | 不保存数据，不降级硬规则 |
| `CandidateRanker` | 为自动换菜和手选候选排序并解释预计软规则 | 不绕过最终整周校验 |
| `RuleEngine` | 对整周或一次替换返回硬规则违规和软规则告警 | 不修改 `WeekPlan`，不决定 UI 文案布局 |
| `DishCatalogPort` | 按 ID/类型返回 `CONFIRMED` 菜品和 `catalogVersion` | 不把 `DRAFT`/`DISABLED` 菜品伪装成候选 |
| `WeekPlanRepository` | 按周/ID读取活动计划；插入或按 `expectedVersion` 更新 | 不保存不可变历史快照 |
| `SavedPlanRepository` | 按周/ID读取和列出不可变 `SavedPlan` | 不修改历史快照 |
| `PlanningUnitOfWork` | 原子地把活动计划置为 `SAVED` 并创建 `SavedPlan` | 不承载生成或规则策略 |
| 本地/未来服务端适配器 | 实现端口的序列化、唯一约束、版本比较和原子提交 | 不改变跨层成功/错误语义 |

### 1.3 数据状态与并发标识

领域状态只使用 `WeekPlanStatus`：

| 状态 | 含义 | 允许的后继 |
| --- | --- | --- |
| `EDITING` | 生成或复制得到的活动计划；允许 `swapDish` / `selectDish` | 新版本 `EDITING`、`CONFIRMED` |
| `CONFIRMED` | 已通过完整硬规则校验的只读总览；尚未产生历史快照 | `EDITING`（`reopenPlan`）、`SAVED` |
| `SAVED` | 来源活动计划终态；同一事务已创建不可变 `SavedPlan` | 无；`SavedPlan` 可复制成另一周的 `EDITING` |

`EMPTY`、`GENERATING`、`SAVING`、`ERROR` 仅是 `PlanStore` 的页面状态，不得写入 `WeekPlan.status`。UI 的“准备保存”对应领域 `CONFIRMED`，不是一个额外领域状态。

- `WeekPlan.version` 是聚合版本：创建为 1，每次成功的换菜、手选、确认、重开或保存命令加 1；所有现有计划命令提交 `expectedVersion`。
- `commandId` 标识一次用户命令，也是未来远端幂等键。同一 ID 与相同输入重放应返回原结果；同一 ID 携带不同输入返回 `INVALID_INPUT`。
- `catalogVersion` 与 `ruleSetVersion` 分别标识菜品库和规则集，不得与聚合 `version` 混用。
- 失败返回 `AppError` 的稳定 `code`、结构化 `details`/`violations` 和 `retryable`，不得只返回展示文案。

本文件涉及的契约错误集合：

| 错误码 | 关键详情 | 是否可直接重试 |
| --- | --- | --- |
| `INSUFFICIENT_CONFIRMED_DISHES` | 按类型的需求/可用数量、`catalogVersion` | V0.1 流程内不能补菜；数据更新后重新发起 |
| `HARD_RULE_VIOLATION` | `violations` 中的 `ruleId`、`code`、`scope` | 修复输入/规则/菜品后重新发起 |
| `NO_REPLACEMENT_AVAILABLE` | `mealId`、`position`、已应用过滤条件 | 保留原菜单；可转手选后返回 |
| `VERSION_CONFLICT` | `expectedVersion`、`currentVersion` | 重新加载最新计划；禁止自动覆盖 |
| `PLAN_ALREADY_EXISTS` / `TARGET_WEEK_ALREADY_SAVED` | `weekStart`、既有记录标识 | 打开既有记录或换周，不覆盖 |
| `NOT_FOUND` / `INVALID_STATE` | 请求对象标识、当前状态 | 刷新列表/计划并重新选择 |
| `CATALOG_CHANGED` | 命令读取的版本与当前 `catalogVersion` | 重载菜品库和计划后再决定 |
| `STORAGE_FAILURE` | `operation`、受控诊断信息，不含底层异常文本 | 保留页面和输入；通常可重放同一 `commandId` |

## 2. 生成本周菜单

**输入**：`GeneratePlanInput { commandId, weekStart, seed? }`；`weekStart` 必须是周一。
**输出**：成功时返回 `PlanMutationResult`，其中计划为 `EDITING / version 1`、`changedPositions` 恰好 50 项、`source.type = GENERATED` 并回传实际 seed；失败时不写入活动计划。
**不变量**：目标周既没有活动 `WeekPlan` 也没有 `SavedPlan`；结果包含 10 个唯一餐次和 50 个完整位置；所有 `DishSnapshot` 来自同一 `catalogVersion` 的已确认菜品；`hardViolations` 为空。

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant WPR as WeekPlanRepository
    participant SPR as SavedPlanRepository
    participant CAT as DishCatalogPort
    participant GEN as PlanGenerator
    participant RULE as RuleEngine
    participant ADP as 本地或服务端适配器

    U->>UI: 选择目标周并点击“生成本周菜单”
    Note over UI: 输入 commandId、weekStart、seed 可选
    UI->>UI: 页面 EMPTY → GENERATING
    UI->>APP: generatePlan(input)
    APP->>WPR: getByWeekStart(weekStart)
    WPR->>ADP: 读取活动计划唯一索引
    ADP-->>WPR: active plan 或 null
    APP->>SPR: getByWeekStart(weekStart)
    SPR->>ADP: 读取历史唯一索引
    ADP-->>SPR: saved plan 或 null
    alt 已有活动计划或历史快照
        APP-->>UI: AppError(PLAN_ALREADY_EXISTS 或 TARGET_WEEK_ALREADY_SAVED)
        UI->>UI: 状态恢复；提供“打开既有计划/换一周”
    else 目标周为空
        APP->>CAT: getCatalogVersion() + listConfirmed()
        CAT->>ADP: 读取 Mock/真实菜品快照
        ADP-->>CAT: CONFIRMED dishes + catalogVersion
        APP->>SPR: listNewestFirst()
        SPR->>ADP: 读取近期 SavedPlan
        ADP-->>SPR: immutable history snapshots
        APP->>GEN: generate(weekStart, dishes, history, seed)
        GEN-->>APP: complete candidate 或 generation failure
        alt 生成器报告菜品不足
            APP-->>UI: AppError(INSUFFICIENT_CONFIRMED_DISHES, counts)
            UI->>UI: GENERATING → EMPTY；不展示半成品
        else 得到完整候选
            APP->>RULE: evaluateWeek(candidate, ruleSetVersion)
            RULE-->>APP: RuleEvaluation(hardViolations, softViolations)
            alt 存在硬规则违规
                APP-->>UI: AppError(HARD_RULE_VIOLATION, violations)
                UI->>UI: GENERATING → EMPTY；显示 code 与 scope
            else 硬规则为零
                APP->>APP: 建立 EDITING / version 1 计划
                APP->>WPR: insert(plan)
                WPR->>ADP: 以 id 和 weekStart 唯一约束原子插入
                ADP-->>WPR: committed
                APP-->>UI: AppResult.ok(PlanMutationResult)
                UI->>UI: GENERATING → EDITING
                UI-->>U: 展示 5 天 10 餐；同时展示软规则告警
            end
        end
    end
```

失败处理：任何端口读取或插入失败归一为 `STORAGE_FAILURE`；唯一键竞争归一为 `PLAN_ALREADY_EXISTS` / `TARGET_WEEK_ALREADY_SAVED`。UI 回到 `EMPTY` 并允许按错误语义重试，不能把未提交或残缺候选放进编辑态。

## 3. 换一道与手选

**共同输入**：`planId`、`expectedVersion`、`mealId`、`position` 和 `commandId`；计划必须处于 `EDITING`。
**换一道**：`swapDish` 直接选择排名最高且硬规则有效的同类菜；不要求用户再确认候选。
**手选**：先用 `listDishCandidates` 展示候选，再把用户选定的 `dishId` 交给 `selectDish`。
**输出**：成功时 `changedPositions` 恰好 1 项、`WeekPlan.version + 1`、完整规则结果刷新；失败不更新 Repository。

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant WPR as WeekPlanRepository
    participant CAT as DishCatalogPort
    participant RANK as CandidateRanker
    participant RULE as RuleEngine
    participant ADP as 本地或服务端适配器

    U->>UI: 选中 mealId + position
    alt 点击“换一道”
        UI->>APP: swapDish(input + seed 可选)
        APP->>WPR: getById(planId)
        WPR->>ADP: read active plan
        ADP-->>WPR: current plan
        WPR-->>APP: WeekPlan
        APP->>APP: 校验 EDITING 且 version == expectedVersion
        APP->>CAT: getCatalogVersion() + listConfirmed(expectedKind)
        CAT-->>APP: candidates + catalogVersion
        APP->>RANK: rank(plan, mealId, position, candidates, seed)
        RANK-->>APP: ranked eligible candidates
        alt 没有合格候选
            APP-->>UI: AppError(NO_REPLACEMENT_AVAILABLE)
            UI-->>U: 原 EDITING 计划不变；可返回或查看手选候选
        else 有候选
            APP->>APP: 在不可变副本中替换排名第一的菜
            APP->>RULE: evaluateWeek(candidatePlan, ruleSetVersion)
            RULE-->>APP: RuleEvaluation
            alt 出现硬规则违规
                APP-->>UI: AppError(HARD_RULE_VIOLATION, violations)
            else 硬规则为零
                APP->>WPR: update(version + 1, expectedVersion)
                WPR->>ADP: compare-and-write
                alt 条件写入冲突
                    ADP-->>WPR: conflict(currentVersion)
                    WPR-->>APP: version conflict
                    APP-->>UI: AppError(VERSION_CONFLICT, currentVersion)
                    UI->>UI: 重新加载最新计划，不应用候选
                else 写入成功
                    ADP-->>WPR: committed
                    WPR-->>APP: success
                    APP-->>UI: AppResult.ok(plan, one ChangedPosition)
                    UI-->>U: 目标菜更新；其余 49 个位置不变；软提醒可见
                end
            end
        end
    else 点击“自己选”
        UI->>APP: listDishCandidates(planId, expectedVersion, mealId, position)
        APP->>WPR: getById(planId)
        WPR-->>APP: current EDITING plan
        APP->>CAT: listConfirmed(expectedKind)
        CAT-->>APP: same-kind confirmed dishes + catalogVersion
        APP->>RANK: rank and project soft violations
        RANK-->>APP: CandidateDish list
        APP-->>UI: AppResult.ok(candidates)
        UI-->>U: 展示 rank、reasonCodes 和预计软提醒
        U->>UI: 选择 candidateDishId
        UI->>APP: selectDish(input + dishId)
        APP->>WPR: getById(planId)
        WPR-->>APP: current plan
        APP->>CAT: getById(candidateDishId)
        CAT-->>APP: Dish 或 null + current catalogVersion
        APP->>APP: 校验 EDITING、expectedVersion、CONFIRMED 与类型匹配
        APP->>RULE: evaluateWeek(candidatePlan, ruleSetVersion)
        RULE-->>APP: RuleEvaluation
        alt 版本/菜品库已变化或硬规则失败
            APP-->>UI: AppError(VERSION_CONFLICT / CATALOG_CHANGED / HARD_RULE_VIOLATION)
            UI->>UI: 保留应用返回前的计划，按错误重新加载
        else 校验通过
            APP->>WPR: update(version + 1, expectedVersion)
            WPR->>ADP: compare-and-write
            ADP-->>WPR: committed
            APP-->>UI: AppResult.ok(plan, one ChangedPosition)
            UI-->>U: 只更新目标位置并展示新的软提醒
        end
    end
```

实现检查点：`swapDish` 与 `selectDish` 可以有不同入站命令，但必须共享“不可变替换 → 完整规则求值 → 版本条件写入”的领域路径。候选查询不增版；成功替换才增版。客户端不得先局部改画面再异步补校验。

## 4. 确认与保存

**输入**：先提交 `ConfirmPlanInput`，再对返回的 `CONFIRMED` 版本提交 `SavePlanInput`；两个用户命令使用各自的 `commandId`。
**输出**：确认成功返回 `CONFIRMED / version + 1` 且 `changedPositions=[]`；保存成功返回 `SAVED WeekPlan` 和独立的不可变 `SavedPlan`。
**提交边界**：保存通过 `PlanningUnitOfWork` 在同一原子提交中更新活动计划并插入历史快照。只有该事务成功返回后，UI 才能显示“本周菜单已保存”。

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant WPR as WeekPlanRepository
    participant CAT as DishCatalogPort
    participant RULE as RuleEngine
    participant UOW as PlanningUnitOfWork
    participant ADP as 本地或服务端适配器

    U->>UI: 点击“确认十餐菜单”
    UI->>APP: confirmPlan(commandId, planId, expectedVersion)
    APP->>WPR: getById(planId)
    WPR-->>APP: EDITING plan
    APP->>CAT: getCatalogVersion() + 校验当前 Dish 状态
    CAT-->>APP: current catalog snapshot
    APP->>RULE: evaluateWeek(plan, ruleSetVersion)
    RULE-->>APP: RuleEvaluation
    alt 存在硬规则违规或结构不完整
        APP-->>UI: AppError(HARD_RULE_VIOLATION, violations)
        UI->>UI: 保持 EDITING，按 RuleViolation.scope 定位
    else 硬规则为零
        APP->>WPR: update(CONFIRMED, version + 1, expectedVersion)
        WPR->>ADP: compare-and-write
        ADP-->>WPR: committed
        APP-->>UI: AppResult.ok(CONFIRMED plan, changedPositions=[])
        UI-->>U: 展示只读的 10 餐总览和 softViolations
    end

    U->>UI: 点击“保存本周菜单”
    UI->>UI: 页面状态 → SAVING，禁用重复提交
    UI->>APP: savePlan(commandId, planId, expectedVersion)
    APP->>WPR: getById(planId)
    WPR-->>APP: current plan
    APP->>CAT: 读取当前 catalogVersion 与菜品状态
    CAT-->>APP: catalog snapshot
    APP->>RULE: evaluateWeek(current CONFIRMED plan, ruleSetVersion)
    RULE-->>APP: RuleEvaluation
    alt 状态错误、菜品库变化或硬规则复验失败
        APP-->>UI: AppError(INVALID_STATE / CATALOG_CHANGED / HARD_RULE_VIOLATION)
        UI->>UI: 离开 SAVING；重新加载活动计划
    else 复验通过
        APP->>APP: 构造 SAVED plan(version + 1) 与 SavedPlan(version 1)
        APP->>UOW: savePlanAndSnapshot(plan, expectedVersion, snapshot)
        UOW->>ADP: 原子条件更新活动计划 + 插入历史
        alt 写入成功
            ADP-->>UOW: both committed
            UOW-->>APP: success
            APP-->>UI: AppResult.ok(SavePlanOutput)
            UI->>UI: 页面状态 → SAVED；使用返回的 plan 与 savedPlan
            UI-->>U: 显示保存成功并允许查看历史详情
        else 存储不可用或结果未知
            ADP-->>UOW: transaction error/timeout
            UOW-->>APP: storage failure
            APP-->>UI: AppError(STORAGE_FAILURE, retryable=true)
            UI->>UI: 离开 SAVING；保留 CONFIRMED 页面和同一 commandId
            UI-->>U: 显示保存失败和重试入口，不显示成功
        else 条件写入版本不匹配
            ADP-->>UOW: conflict(currentVersion)
            UOW-->>APP: version conflict
            APP-->>UI: AppError(VERSION_CONFLICT, currentVersion)
            UI->>UI: 离开 SAVING；保留提交前视图，随后加载最新计划
            UI-->>U: 进入版本冲突恢复流程
        end
    end
```

若用户在只读总览点击“返回调整”，UI 调用 `reopenPlan`，把 `CONFIRMED → EDITING` 并增版，`changedPositions=[]`；重新修改后必须再次 `confirmPlan`，不能沿用旧确认版本直接保存。

## 5. 从历史复制后继续调整

**输入**：`CopyPlanInput { commandId, savedPlanId, targetWeekStart }`；复制源是不变的 `SavedPlan`，目标周必须同时没有活动计划和保存快照。
**输出**：插入新的 `EDITING / version 1 WeekPlan`；保留 50 个菜品快照和位置，平移日期，创建新计划/餐次 ID，`source = { type: COPIED, savedPlanId }`，`changedPositions` 为 50 项。
**重新校验**：复制按当前 `catalogVersion` 和 `ruleSetVersion` 复验；源快照当时合法不代表当前仍可复制。

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant WPR as WeekPlanRepository
    participant SPR as SavedPlanRepository
    participant CAT as DishCatalogPort
    participant RULE as RuleEngine
    participant ADP as 本地或服务端适配器

    U->>UI: 在历史中选择已保存周并点击“复制”
    UI->>UI: 收集 savedPlanId 和 targetWeekStart
    UI->>APP: copyPlan(input)
    APP->>SPR: getById(savedPlanId)
    SPR->>ADP: read immutable snapshot
    ADP-->>SPR: SavedPlan 或 null
    SPR-->>APP: source result
    alt 源不存在
        APP-->>UI: AppError(NOT_FOUND)
        UI-->>U: 保持历史页，要求重新选择
    else 源有效
        APP->>WPR: getByWeekStart(targetWeekStart)
        WPR->>ADP: read active week index
        ADP-->>WPR: active plan 或 null
        APP->>SPR: getByWeekStart(targetWeekStart)
        SPR->>ADP: read saved week index
        ADP-->>SPR: saved plan 或 null
        alt 目标周已有活动计划或历史
            APP-->>UI: AppError(PLAN_ALREADY_EXISTS / TARGET_WEEK_ALREADY_SAVED)
            UI-->>U: 提供打开既有计划或更换目标周，不覆盖
        else 目标周为空
            APP->>CAT: getCatalogVersion() + 按 ID 读取当前菜品
            CAT-->>APP: current dishes + catalogVersion
            APP->>APP: cloneAsEditingPlan(source, targetWeekStart)
            Note over APP: 平移日期；新 plan/meal ID；version=1；source.savedPlanId=source.id
            APP->>RULE: evaluateWeek(copiedPlan, ruleSetVersion)
            RULE-->>APP: RuleEvaluation
            alt 菜品已失效或出现硬规则违规
                APP-->>UI: AppError(HARD_RULE_VIOLATION, violations)
                UI-->>U: 不创建活动计划；提示改为生成新菜单或核对 Mock 数据
            else 硬规则为零
                APP->>WPR: insert(EDITING version 1 plan)
                WPR->>ADP: unique insert by id and weekStart
                ADP-->>WPR: committed
                APP-->>UI: AppResult.ok(plan, 50 ChangedPositions)
                UI->>UI: 进入 EDITING 页面状态
                UI-->>U: 展示复制结果和新告警；可继续换一道或手选
            end
        end
    end
```

复制会创建一个持久化的活动 `WeekPlan`，但不会创建历史 `SavedPlan`；只有后续 `confirmPlan → savePlan` 成功后才进入历史列表。复制源始终不变。

## 6. 菜品不足：诊断、保留状态与重试

菜品不足是当前 `catalogVersion` 的已确认菜品无法满足硬结构最低要求，不等于“软规则无法做到理想避重”。软规则无法满足时仍返回完整计划；只有硬结构无法组成时才返回 `INSUFFICIENT_CONFIRMED_DISHES`。V0.1 菜品库只读，流程内没有“补菜”动作。

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant CAT as DishCatalogPort
    participant GEN as PlanGenerator
    participant RULE as RuleEngine
    participant DATA as V0.1 外部菜品数据发布流程

    U->>UI: 发起 generatePlan
    UI->>APP: GeneratePlanInput + 调用前页面状态
    APP->>CAT: getCatalogVersion() + listConfirmed()
    CAT-->>APP: dishes + catalogVersion
    APP->>GEN: preflight(required structure, eligible dishes)
    GEN-->>APP: shortage(requiredByCategory, availableByCategory)
    alt 硬结构无法组成
        APP-->>UI: AppError(INSUFFICIENT_CONFIRMED_DISHES, counts, catalogVersion)
        UI->>UI: 恢复 EMPTY；没有 WeekPlan 写入
        UI-->>U: 显示缺少的类别与数量
        Note over UI,DATA: 用户只能返回；补充/启用菜品不在 V0.1 UI 范围
        DATA->>CAT: 后续发布新的 Mock/真实菜品快照
        U->>UI: 应用加载新 catalogVersion 后重新发起
        UI->>APP: 新 commandId 的 GeneratePlanInput
        APP->>CAT: listConfirmed()
        CAT-->>APP: newer catalog snapshot
        APP->>GEN: generate with newer snapshot
        GEN-->>APP: complete candidate
        APP-->>UI: 继续正常生成/持久化流程
    else 仅软规则无法满足
        APP->>GEN: 允许生成完整结构
        GEN-->>APP: complete candidate
        APP->>RULE: evaluateWeek(candidate, ruleSetVersion)
        RULE-->>APP: hardViolations=[] + softViolations
        APP-->>UI: AppResult.ok(plan with softViolations)
        UI-->>U: 展示完整结果和可保留的软告警
    end
```

## 7. 硬规则冲突：阻断与修复后恢复

硬规则冲突包括规则配置自身矛盾、复制/替换后出现不可接受的位置，或生成器返回未通过完整复验的候选。当前规则为只读，终端用户不能在“我的”页把硬规则降级。

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant DOMAIN as PlanGenerator / WeekPlan
    participant RULE as RuleEngine
    participant REPO as WeekPlanRepository / UnitOfWork

    U->>UI: 发起生成、替换、复制或保存
    UI->>APP: command(commandId, expectedVersion when required)
    APP->>RULE: validateRuleSet(ruleSetVersion)
    alt 规则集自身冲突
        RULE-->>APP: invalid rule set
        APP-->>UI: AppError(HARD_RULE_VIOLATION, violations)
        UI->>UI: 保留调用前页面和最新已提交计划
        UI-->>U: 显示暂时无法完成；不提供“忽略硬规则”
    else 规则集可执行
        RULE-->>APP: valid
        APP->>DOMAIN: execute command on immutable candidate
        DOMAIN-->>APP: candidate WeekPlan
        APP->>RULE: evaluateWeek(candidate, ruleSetVersion)
        alt 候选违反硬规则
            RULE-->>APP: hardViolations(ruleId, code, scope)
            APP-->>UI: AppError(HARD_RULE_VIOLATION, violations)
            UI->>UI: 不接纳 candidate；保留原 EDITING/CONFIRMED/EMPTY 状态
        else 复验通过
            RULE-->>APP: no hard violations + softViolations
            APP->>REPO: 仅此分支执行 insert/update/UoW
            REPO-->>APP: committed
            APP-->>UI: AppResult.ok(result)
        end
    end
    Note over APP,RULE: 配置缺陷需发布新 ruleSetVersion；候选错误则返回编辑页重新选择
```

失败必须留下可诊断证据：`requestId`、`ruleSetVersion`、`RuleViolation.ruleId/code/scope` 和命令类型。不得为了“总能生成”而自动把硬规则降级为软规则。

## 8. 存储失败：结果未知与幂等恢复

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant UOW as PlanningUnitOfWork
    participant ADP as 本地或服务端适配器

    U->>UI: 保存已确认菜单
    UI->>UI: 生成并固定 commandId；页面状态 → SAVING
    UI->>APP: savePlan(commandId, planId, expectedVersion)
    APP->>UOW: savePlanAndSnapshot(plan, expectedVersion, snapshot)
    UOW->>ADP: begin transaction + compare-and-write + insert
    alt 明确未提交
        ADP-->>UOW: failure(commit=false)
        UOW-->>APP: storage failure
        APP-->>UI: AppError(STORAGE_FAILURE, retryable=true)
        UI->>UI: 返回 CONFIRMED 视图；保留相同 commandId
    else 超时，提交结果未知
        ADP--xUOW: timeout(commit=unknown)
        UOW-->>APP: outcome unknown
        APP-->>UI: AppError(STORAGE_FAILURE, retryable=true)
        UI->>UI: 返回 CONFIRMED 视图；不得新建 commandId
    end
    UI-->>U: 显示“未确认保存成功”，允许重试
    U->>UI: 点击重试
    UI->>APP: 重放相同 SavePlanInput 和 commandId
    APP->>APP: 按 commandId 解析既有命令结果
    alt 首次其实已经提交
        APP-->>UI: 返回原 AppResult.ok(SavePlanOutput)
    else 首次未提交
        APP->>UOW: savePlanAndSnapshot(plan, expectedVersion, snapshot)
        UOW->>ADP: commit both records once
        ADP-->>UOW: committed
        UOW-->>APP: SAVED WeekPlan + SavedPlan
        APP-->>UI: AppResult.ok(SavePlanOutput)
    end
    UI->>UI: 页面状态 → SAVED；历史中只有一条 SavedPlan
    UI-->>U: 显示保存成功
```

Mock 适配器可以注入“提交前失败”和“提交后超时”验证 UI 与幂等契约，但只有真实后端的事务/幂等证据才能证明跨进程持久化安全。

## 9. 版本冲突：读取最新版本，不静默覆盖

```mermaid
sequenceDiagram
    autonumber
    actor U as 家庭菜单规划者
    participant UI as 小程序 UI / PlanStore
    participant APP as PlanningApplication
    participant WPR as WeekPlanRepository
    participant UOW as PlanningUnitOfWork
    participant ADP as 本地或服务端适配器

    U->>UI: 对本地 version 3 的 CONFIRMED 计划点击保存
    UI->>APP: savePlan(new commandId, expectedVersion=3)
    APP->>UOW: savePlanAndSnapshot(..., expectedVersion=3)
    UOW->>ADP: compare-and-write
    ADP-->>UOW: conflict(currentVersion=4)
    UOW-->>APP: version conflict
    APP-->>UI: AppError(VERSION_CONFLICT, currentVersion=4)
    UI->>UI: 禁止显示成功或自动覆盖；暂存调用前视图用于说明
    UI->>APP: getWeekPlan(planId)
    APP->>WPR: getById(planId)
    WPR->>ADP: read latest active plan
    ADP-->>WPR: version 4 WeekPlan
    WPR-->>APP: latest plan
    APP-->>UI: AppResult.ok(latest)
    alt latest.status = EDITING
        UI-->>U: 展示最新编辑计划；需要时重新执行选择、确认
    else latest.status = CONFIRMED
        UI-->>U: 展示最新只读总览；用户可再次保存
    else latest.status = SAVED
        UI-->>U: 跳转到对应历史详情，视为已有成功结果
    end
```

V0.1 不提供自动合并、强制覆盖或隐藏的“复制当前冲突对象”命令。若冲突来自结果未知的同一命令，客户端应先重放同一个 `commandId`；同一命令成功过时应返回原结果，而不是制造版本冲突。

## 10. 可观测性与流程关联

每个应用入口至少记录以下非敏感字段，供验收证据关联：

- `requestId`、操作名、开始/结束时间、结果码和耗时；
- `commandId`、`weekStart`、`planId` / `savedPlanId`（如有）、`expectedVersion` / 返回 `version`；
- `catalogVersion`、`ruleSetVersion`、确定性测试用 `seed`；
- 硬规则违规数、软规则告警数；
- 保存重放次数、`VERSION_CONFLICT.currentVersion` 和最终结果。

不得记录完整家庭偏好、未脱敏的存储错误或其他与本轮菜单验收无关的个人数据。
