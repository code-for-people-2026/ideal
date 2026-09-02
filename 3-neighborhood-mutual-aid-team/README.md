# 近邻互助组 · Neighborhood Mutual Aid Team

> 状态：上一阶段产品基线，完整保留；当前暂停扩展。

近邻互助组探索已有邻里关系如何沉淀为可信、可持续的互助网络。2026-09-02，当前业务范围进一步收缩到 [1 近邻闲置](../1-neighborhood-exchange/README.md)；本目录不是废弃区，而是后续扩大范围时必须回看的产品基线。

`Mutual Aid Team` 是“互助组”的固定英文名。这里指相互帮助的邻居，不是内部运营项目组，也不使用 `Mutual Aid Group`。

## 从哪里开始

- [双原型入口](./index.html)
- [当前产品决议](./product-decisions/近邻互助组-MVP原型设计决议.md)
- [当前 MVP User Stories](./user-stories/近邻互助组-MVP.md)
- [双轨原型理论与边界](./product-decisions/双轨原型-理论基础与边界研究.md)
- [领域词汇与边界](./CONTEXT.md)
- [整个产品演进蓝图](../PRODUCT-EVOLUTION.md)

## 目录结构

```text
3-neighborhood-mutual-aid-team/
├── README.md
├── CONTEXT.md
├── index.html
├── prototype-customer/
├── prototype-implementation/
├── product-decisions/
├── user-stories/
├── research/
├── brand-exploration/
├── history/
└── archive/
```

## 四类资料分别回答什么

| 位置 | 回答的问题 | 主要读者 | 是否是当前开发需求 |
|---|---|---|---|
| `prototype-customer/` | 客户能否迅速理解、信任并走完高光路径？ | 潜在客户、产品、研究人员 | 否，作为历史基线 |
| `prototype-implementation/` | 当时 Story 的角色、状态、权限和行为怎样表现？ | 产品、设计、工程、测试 | 否，作为行为参考 |
| `product-decisions/` | 当时为什么这样设计，发生冲突时以什么为准？ | 全团队 | 是该阶段上游依据 |
| `user-stories/` | 谁在什么前提下完成什么目标，怎样验收？ | 产品、工程、测试 | 是该阶段行为需求 |

## 阶段内权威层级

解释 3 阶段时，出现冲突依次采用：

1. 法律、安全、隐私要求和已经公开的政策承诺。
2. [当前产品决议](./product-decisions/近邻互助组-MVP原型设计决议.md)与本目录的[领域词汇](./CONTEXT.md)。
3. [当前 MVP User Stories](./user-stories/近邻互助组-MVP.md)及验收条件。
4. 实施对照原型中的交互表现。
5. 客户体验原型中的交互表现。
6. 口头说明。

这套层级只解释 3，不会自动覆盖当前 1 的范围。原型不是生产代码，也不能替代新的技术设计、接口契约和自动化验收。

## 重新启动的条件

只有当近邻闲置已经证明邻里流转能够持续发生，而且用户明确提出超出物品流转的互助需求，才重新评估 3。重启时应先写新决议，说明哪些旧结论继续成立、哪些需要作废。

## 本地查看

在仓库根目录先生成与 gh-pages 相同的无数字路由产物，再启动静态文件服务：

```bash
bash .github/scripts/build-pages-site.sh /tmp/ideal-pages-preview
python3 -m http.server 4173 --directory /tmp/ideal-pages-preview
```

然后打开：

```text
http://127.0.0.1:4173/neighborhood-mutual-aid-team/
```
