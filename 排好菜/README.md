# 排好菜 · 产品原型

一个与 `街坊味/` 平级的独立家庭菜单产品。目前有两套不同用途的原型：

- `prototype-customer/`：面向家庭菜单规划者的客户体验原型，验证“五天十餐生成—对照查看—单道替换—确认保存”。
- `prototype-engineering/`：早期领导评审工程原型，保留五天十餐、固定餐标等实现探索，仅作工程参考。

客户原型沿用 Kith 用户原型的展示结构和菜单交互方式，主要通过人物、价值表达和产品边界区分两个项目。旧菜单小程序代码只作为工程参考，不是客户原型的产品依据。

## 预览

合并部署配置后，可通过 [ideal.codeforpeople.cn/排好菜/](https://ideal.codeforpeople.cn/%E6%8E%92%E5%A5%BD%E8%8F%9C/) 查看在线原型。

```bash
cd prototype-customer
npm ci
npm run dev

# 或查看早期工程原型
cd prototype-engineering
npm ci
npm run dev
```

## 目录

- `index.html`：与其他项目一致的客户版/工程版选择入口。
- `prototype-customer/`：可交互的客户体验原型。
- `prototype-engineering/`：早期移动端工程原型。
- `docs/review/`：Kith 参考图、最终页面截图与设计检查记录。

本目录是评审原型，不包含真实数据、登录、后端接口、菜品维护和订单功能。
