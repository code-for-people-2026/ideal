import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = {
  runnable: await readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
  pageMap: await readFile(new URL("../page-map.html", import.meta.url), "utf8"),
};
const customerPrototype = await readFile(new URL("../../prototype-customer/src/App.jsx", import.meta.url), "utf8");

test("运行原型和页面地图使用同一套唯一命名的全局导航", () => {
  const labels = ["项目入口", "运行原型", "页面地图", "客户原型"];

  for (const [name, source] of Object.entries(pages)) {
    for (const label of labels) {
      assert.match(source, new RegExp(label), `${name} 缺少 ${label}`);
    }
    assert.doesNotMatch(source, /项目目录/, `${name} 不应再使用项目目录这一重复名称`);
    assert.doesNotMatch(source, /engineering-model\.html|>实现说明</, `${name} 暂不公开实现说明`);
  }

  assert.match(pages.runnable, /className="active">运行原型/);
  assert.match(pages.runnable, /params\.get\("demo"\) === "ready" \? createInitialState\(\) : createNewUserState\(\)/, "运行原型默认应进入新用户状态");
  assert.match(pages.pageMap, /class="active" aria-current="page">页面地图/);
});

test("排好菜的可见产品文案不混入 Kith Inn 人物和业务设定", () => {
  const kithSpecificCopy = /桃子|供餐|订单|配送|支付|对账|入住|退房|房态|住客|民宿|客栈/;

  for (const [name, source] of Object.entries({ customer: customerPrototype, ...pages })) {
    assert.doesNotMatch(source, kithSpecificCopy, `${name} 混入了另一项目的具体设定`);
  }

  assert.match(pages.runnable, /我家的排好菜/);
  assert.match(pages.pageMap, /我家的排好菜/);
});

test("页面地图把已落地的首次准备标为已实现", () => {
  const onboardingTitles = ["欢迎使用排好菜", "家里怎么吃饭", "每餐怎么搭配", "挑出家里常吃的菜", "还想补充什么菜", "准备完成"];

  for (const title of onboardingTitles) {
    assert.doesNotMatch(pages.pageMap, new RegExp(`title: "${title}"[^\\n]*planned: true`), `${title} 已在运行原型落地，不应继续标成计划中`);
  }

  assert.match(pages.pageMap, /state: "核心旅程", result: "完成：默认餐型与菜品池已就绪/);
});

test("首次挑菜只通过左右滑动做出选择", () => {
  assert.match(pages.runnable, /onPointerDown=/);
  assert.match(pages.runnable, /onPointerMove=/);
  assert.match(pages.runnable, /向左滑加入/);
  assert.match(pages.runnable, /向右滑不要/);
  assert.match(pages.runnable, /decide\(dragXRef\.current < 0\)/);
  assert.match(pages.runnable, /setLeaving\(selected \? "left" : "right"\)/);
  assert.match(pages.runnable, /setDragX\(selected \? -430 : 430\)/);
  assert.doesNotMatch(pages.runnable, /向左滑不要|向右滑加入/);
  assert.doesNotMatch(pages.runnable, /dish-pick-assist/);
  assert.doesNotMatch(pages.runnable, /aria-label="略过这道菜"/);
  assert.doesNotMatch(pages.runnable, /aria-label="把这道菜加入菜品库"/);
  assert.match(pages.pageMap, /左右滑动，挑出家里会吃的菜/);
  assert.match(pages.pageMap, /向左滑加入菜品库，向右滑不要/);
});

test("历史页按周展示完整只读菜单，不再使用折叠卡片", () => {
  assert.match(pages.runnable, /type: "HISTORY_WEEK_MOVE"/);
  assert.match(pages.runnable, /<ReadonlyMenuTable menu=\{plan\.data\} weekIndex=\{historyWeekIndex\}/);
  assert.match(pages.runnable, /aria-label="只读菜单表格"/);
  assert.match(pages.runnable, />只读</);
  assert.match(pages.runnable, /复制这周到下周/);
  assert.match(pages.runnable, /className="history-action-dock"/);
  assert.match(pages.runnable, /above-action-dock/);
  assert.match(pages.runnable, /key=\{state\.toastVersion\}/);
  assert.match(pages.runnable, /window\.setTimeout\(\(\) => dispatch\(\{ type: "DISMISS_TOAST" \}\), 2100\)/);
  assert.doesNotMatch(pages.runnable, /history-summary|history-trigger|history-detail|点击卡片展开/);
});

test("菜品库使用用户确认结果并提供可用的添加菜入口", () => {
  assert.match(pages.runnable, /paihaocai\.prototype\.dish-pool\.v1/);
  assert.match(pages.runnable, /window\.localStorage\.setItem/);
  assert.doesNotMatch(pages.runnable, /这里只显示首次准备选中的菜和后来添加的菜/);
  assert.match(pages.runnable, /OPEN_ADD_DISH/);
  assert.match(pages.runnable, /添加到菜品库/);
  assert.match(pages.runnable, /菜名/);
  assert.match(pages.runnable, /主要材料/);
  assert.match(pages.runnable, /自己填写一道菜/);
  assert.match(pages.runnable, /看图片继续挑/);
  assert.match(pages.runnable, /CHOOSE_ADD_DISH_MODE/);
  assert.match(pages.runnable, /ADD_RECOMMENDED_DISH/);
  assert.match(pages.runnable, /我选得差不多了，返回菜品库/);
  assert.match(pages.runnable, /document\.body\.style\.overflow = "hidden"/);
  assert.match(pages.runnable, /library-screen \$\{state\.addingDish \|\| detail \? "sheet-open"/);
});

test("运行原型把工程说明留在手机外，并减少重复解释", () => {
  for (const copy of ["工程原型 · 本地演示数据", "工程原型说明", "生成后可以逐道修改，再确认保存", "菜单数据会跨页保留"]) {
    assert.doesNotMatch(pages.runnable, new RegExp(copy));
  }
  assert.doesNotMatch(pages.runnable, /本周规则|软规则提醒|左右滑动查看每天安排/);
  assert.match(pages.runnable, /菜单可能有重复/);
  assert.match(pages.runnable, /dish\.kind === "custom" \? "待补充" : kindLabels\[dish\.kind\]/);
});

test("我的页面提供完整且可点击的产品、隐私与数据入口", () => {
  for (const label of ["关于排好菜", "联系与反馈", "用户协议", "隐私政策", "个人信息收集清单", "第三方共享清单", "个人信息与数据管理"]) {
    assert.match(pages.runnable, new RegExp(label));
  }
  assert.match(pages.runnable, /OPEN_PROFILE_PANEL/);
  assert.match(pages.runnable, /CLOSE_PROFILE_PANEL/);
  assert.match(pages.runnable, /当前版本未接入统计、广告或其他第三方服务/);
  assert.doesNotMatch(pages.runnable, /原型信息|上线前需正式确认/);
});

test("首次准备完成前会检查菜品池，并给出补充或接受重复的选择", () => {
  assert.match(pages.runnable, /需要先补充菜品/);
  assert.match(pages.runnable, /菜品较少，菜单会有重复/);
  assert.match(pages.runnable, /接受重复，去排菜单/);
  assert.match(pages.runnable, /继续补充菜品/);
  assert.match(pages.runnable, /调整每餐结构/);
  assert.match(pages.runnable, /dishPoolReadiness\(state\)/);
  assert.match(pages.pageMap, /预计会有重复/);
  assert.match(pages.pageMap, /用户可以继续补充菜品，也可以接受重复/);
  assert.doesNotMatch(pages.pageMap, /38 道已确认/);
});
