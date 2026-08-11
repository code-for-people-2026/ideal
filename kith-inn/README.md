# Kith Inn · 街坊味产品资料

本目录是 Kith Inn 的唯一权威维护目录，同时作为整站 `/kith-inn/` 子页面的内容源。这里把“给客户看最终价值”和“给工程团队理解完整实现”分开维护。

- [双原型入口](./index.html)
- [客户体验原型](./prototype-customer/)
- [实施对照原型总蓝图](./prototype-implementation/)
- [PRD](./prd.md)
- [产品决策](./product-decisions.md)
- [User Stories](./user-stories.md)
- [领域词汇](./CONTEXT.md)

## 双轨原型

| 位置 | 主要读者 | 回答的问题 | 内容密度 |
|---|---|---|---|
| `prototype-customer/` | 潜在客户、合作方、产品演示对象 | 街坊味最终把哪些麻烦变简单？ | 只保留 4 个结果页面 |
| `prototype-implementation/` | 产品、设计、工程、测试 | 桃子端和顾客端分别怎样完成完整闭环？ | 保留两套角色原型和全部过程状态 |

## 权威层级

发生冲突时依次采用：

1. 法律、安全、隐私要求。
2. `product-decisions.md` 与 `CONTEXT.md`。
3. `user-stories.md` 及验收条件。
4. 实施对照原型中的交互表现。
5. 客户体验原型中的演示表现。

原型不接真实数据，也不替代接口契约、数据模型或自动化验收。

## 本地查看

在 `code for people` 目录运行静态服务器后打开：

```text
http://127.0.0.1:4173/ideal/kith-inn/
```
