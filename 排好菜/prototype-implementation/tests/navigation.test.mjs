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
