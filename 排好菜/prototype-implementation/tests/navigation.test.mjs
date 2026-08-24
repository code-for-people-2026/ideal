import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = {
  runnable: await readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
  pageMap: await readFile(new URL("../page-map.html", import.meta.url), "utf8"),
  implementation: await readFile(new URL("../engineering-model.html", import.meta.url), "utf8"),
};

test("三个工程页面使用同一套唯一命名的全局导航", () => {
  const labels = ["项目入口", "运行原型", "页面地图", "实现说明", "客户原型"];

  for (const [name, source] of Object.entries(pages)) {
    for (const label of labels) {
      assert.match(source, new RegExp(label), `${name} 缺少 ${label}`);
    }
    assert.doesNotMatch(source, /项目目录/, `${name} 不应再使用项目目录这一重复名称`);
  }

  assert.match(pages.runnable, /className="active">运行原型/);
  assert.match(pages.pageMap, /class="active" aria-current="page">页面地图/);
  assert.match(pages.implementation, /class="active" aria-current="page">实现说明/);
});
