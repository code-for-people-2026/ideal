# 牛马互助平台 · 产品资料

本目录把“给客户验证价值”和“给工程团队理解实现”分开维护。第一次进入请从下面的入口开始：

- [双原型入口](./index.html)
- [当前产品决议](./product-decisions/近邻互助组-MVP原型设计决议.md)
- [当前 MVP User Stories](./user-stories/近邻互助组-MVP.md)
- [双轨原型理论与边界](./product-decisions/双轨原型-理论基础与边界研究.md)

## 目录结构

```text
牛马互助平台/
├── README.md
├── index.html
├── prototype-customer/
│   ├── README.md
│   ├── index.html
│   └── 测试说明.md
├── prototype-implementation/
│   ├── README.md
│   └── index.html
├── product-decisions/
│   ├── README.md
│   ├── 近邻互助组-MVP原型设计决议.md
│   ├── 双轨原型-理论基础与边界研究.md
│   ├── 平台MVP-咨询转介闭环草案.md
│   └── 地理服务场MVP-产品草案.md
└── user-stories/
    ├── README.md
    └── 近邻互助组-MVP.md
```

## 四类资料分别回答什么

| 位置 | 回答的问题 | 主要读者 | 是否是开发需求 |
|---|---|---|---|
| `prototype-customer/` | 客户能否迅速理解、信任并走完高光路径？ | 潜在客户、产品、研究人员 | 否 |
| `prototype-implementation/` | 当前 Story 的角色、状态、权限和行为怎样表现？ | 产品、设计、工程、测试 | 仅作行为参考 |
| `product-decisions/` | 产品为什么这样设计，发生冲突时以什么为准？ | 全团队 | 是上游决策依据 |
| `user-stories/` | 谁在什么前提下完成什么目标，怎样验收？ | 产品、工程、测试 | 是当前 MVP 行为需求 |

## 权威层级

出现冲突时依次采用：

1. 法律、安全、隐私要求和已经公开的政策承诺。
2. [当前产品决议](./product-decisions/近邻互助组-MVP原型设计决议.md)与仓库根目录的[领域词汇](../CONTEXT.md)。
3. [当前 MVP User Stories](./user-stories/近邻互助组-MVP.md)及验收条件。
4. 实施对照原型中的交互表现。
5. 客户体验原型中的交互表现。
6. 口头说明。

原型不是生产代码。客户原型中可以点击的内容不会自动成为开发范围；实施对照原型也不能替代技术设计、接口契约和自动化验收。

## 维护规则

- 客户研究产生的结论先记录为产品决策，再同步 User Story 和实施对照原型。
- 新功能先获得稳定 Story ID，再进入实施对照原型。
- 产品承诺、角色责任、证据等级和数据边界变化时，两份原型必须同步。
- 历史方案保留“草案 / 相邻方案”状态，不与当前 MVP 决议并列为权威需求。
- 两份原型只使用合成数据，不连接生产数据库、真实微信用户或生产密钥。

## 本地查看

在仓库根目录运行：

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/牛马互助平台/
```
