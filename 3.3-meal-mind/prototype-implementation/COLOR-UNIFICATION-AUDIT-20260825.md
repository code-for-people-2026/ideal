# 新用户准备与日常使用配色统一验收

日期：2026-08-25

## 统一规则

- 深绿：已选择、已确认、可继续的稳定状态。
- 砖红：生成菜单、进入第一周排菜等主任务动作。
- 暖黄：数量汇总、规则提醒等辅助信息。
- 暖白：页面底色和普通内容卡片。
- 页面地图：首次准备使用深绿；其他旅程保留各自的功能线强调色。

## 验收结果

1. 家庭设置：人数输入、餐次和星期选择已统一为深绿体系；星期只保留单个中文字符。通过。
2. 每餐结构：预设与自定义选中态使用深绿，数量汇总使用暖黄。通过。
3. 菜品池：确认菜品使用浅绿卡片与深绿勾选，主操作使用深绿。通过。
4. 准备完成：完成信息使用深绿，进入排菜的主动作使用砖红，与日常排菜页一致。通过。
5. 页面地图：首次准备功能线同步使用深绿；手机内容仍为静态展示。通过。

## 截图

- `design-audit-screenshots/color-unification-20260825/04-after-household.png`
- `design-audit-screenshots/color-unification-20260825/05-after-pattern.png`
- `design-audit-screenshots/color-unification-20260825/06-after-pool.png`
- `design-audit-screenshots/color-unification-20260825/07-after-ready.png`
- `design-audit-screenshots/color-unification-20260825/08-after-page-map.png`

## 自动检查

- `npm test`：6 项通过。
- `npm run build:pages`：通过。
- `git diff --check`：通过。
