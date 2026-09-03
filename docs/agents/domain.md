# 领域文档

工程类 Skill 探索代码库时，应按以下方式使用本仓库的领域文档。

## 探索前先阅读

- 仓库根目录的 **`CONTEXT.md`**；或者
- 如果根目录存在 **`CONTEXT-MAP.md`**，先由它找到各个上下文的 `CONTEXT.md`，再阅读与当前主题有关的文件。
- **`docs/adr/`**：阅读与将要修改的领域有关的 ADR。在多上下文仓库中，还要检查 `src/<context>/docs/adr/` 中仅适用于该上下文的决策。

如果上述文件不存在，**静默继续**。不要把缺失本身当作问题，也不要提前建议创建空文件。只有当术语或决策真正得到确认时，才由 `/domain-modeling` Skill（通常经 `/grill-with-docs` 或 `/improve-codebase-architecture` 进入）按需创建。

## 文件结构

单上下文仓库（多数仓库）：

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

多上下文仓库（根目录存在 `CONTEXT-MAP.md`）：

```text
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← 全局决策
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                 ← 上下文内决策
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## 使用词汇表中的术语

在 Issue 标题、重构建议、假设或测试名称中提到领域概念时，使用 `CONTEXT.md` 定义的术语。不要漂移到词汇表已明确排除的同义表达。

如果所需概念尚未出现在词汇表中，这是一个信号：要么你正在创造项目并不使用的说法（应重新考虑），要么领域模型确实有缺口（交给 `/domain-modeling` 处理）。

## 标明 ADR 冲突

如果输出与现有 ADR 冲突，必须明确指出，不能默默覆盖：

> _与 ADR-0007（订单使用事件溯源）冲突——但值得重新讨论，因为……_
