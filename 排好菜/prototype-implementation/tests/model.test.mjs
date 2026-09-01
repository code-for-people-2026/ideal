import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState, createNewUserState, currentMealPattern, dishPoolReadiness, dishPoolStats, planStats, reducer, restorePrototypeData, serializePrototypeData, starterDishChoices, usableLibrary, userLibrary, visibleLibrary, weekRange } from "../src/model.js";

test("生成、换菜、保存和历史复制共享同一份 WeekPlan", () => {
  let state = createInitialState();
  state = reducer(state, { type: "GENERATE_DONE" });
  assert.equal(state.menus[1].status, "draft");

  state = reducer(state, { type: "SELECT_CANDIDATE", id: "beef-radish" });
  state = reducer(state, { type: "APPLY_CANDIDATE" });
  assert.equal(state.menus[1].data[0].lunch[0][0], "萝卜焖牛腩");

  state = reducer(state, { type: "SAVE_MENU" });
  assert.equal(state.menus[1].status, "saved");
  assert.equal(state.activeTab, "history");

  state = reducer(state, { type: "ASK_COPY", weekIndex: 1 });
  state = reducer(state, { type: "CONFIRM_COPY" });
  assert.equal(state.weekIndex, 2);
  assert.equal(state.menus[2].status, "draft");
  assert.equal(state.menus[2].data[0].lunch[0][0], "萝卜焖牛腩");
});

test("历史页只在已保存周之间切换，不改变排菜单当前周", () => {
  let state = createInitialState();
  assert.equal(state.historyWeekIndex, 1);
  assert.equal(state.menus[0].status, "saved");
  assert.equal(state.menus[1].status, "saved");

  state = reducer(state, { type: "GENERATE_DONE" });
  state = reducer(state, { type: "SAVE_MENU" });
  assert.equal(state.historyWeekIndex, 1);

  state = reducer(state, { type: "HISTORY_WEEK_MOVE", delta: -1 });
  assert.equal(state.historyWeekIndex, 0);
  assert.equal(state.weekIndex, 1);
  assert.equal(state.activeTab, "history");

  state = reducer(state, { type: "HISTORY_WEEK_MOVE", delta: 1 });
  assert.equal(state.historyWeekIndex, 1);
  assert.equal(state.weekIndex, 1);
});

test("工程演示可重置、完成或跳过首次准备", () => {
  let state = reducer(createInitialState(), { type: "RESET_TO_NEW_USER" });
  assert.equal(state.demoMode, "new");
  assert.equal(state.onboardingStep, 0);
  assert.equal(state.menus[0].status, "empty");

  state = reducer(state, { type: "ONBOARDING_NEXT" });
  state = reducer(state, { type: "SET_HOUSEHOLD_PEOPLE", value: 0 });
  assert.equal(state.household.people, 1);
  state = reducer(state, { type: "SET_HOUSEHOLD_PEOPLE", value: 30 });
  assert.equal(state.household.people, 20);
  state = reducer(state, { type: "SET_HOUSEHOLD_PEOPLE", value: 3 });
  state = reducer(state, { type: "ONBOARDING_NEXT" });
  state = reducer(state, { type: "SET_MEAL_PATTERN", value: "custom" });
  state = reducer(state, { type: "ADJUST_CUSTOM_PATTERN", kind: "veg", delta: -1 });
  assert.deepEqual(currentMealPattern(state), { meat: 2, veg: 1, soup: 1 });

  state = reducer(state, { type: "COMPLETE_ONBOARDING" });
  assert.equal(state.demoMode, "ready");
  assert.equal(state.household.people, 3);

  state = reducer(state, { type: "RESET_TO_NEW_USER" });
  state = reducer(state, { type: "SKIP_ONBOARDING" });
  assert.equal(state.demoMode, "ready");
  assert.equal(state.household.people, 4);
  assert.equal(dishPoolStats(state).total, 10);
});

test("首次准备按菜品池完整度区分阻断、重复提醒和数量充足", () => {
  let blocked = { ...createNewUserState(), starterDishIds: ["beef-potato"], onboardingStep: 5 };
  assert.equal(dishPoolReadiness(blocked).level, "blocked");
  blocked = reducer(blocked, { type: "GENERATE_START" });
  assert.equal(blocked.generating, false);
  assert.match(blocked.toast, /菜品池还不足/);

  const warning = { ...createNewUserState(), starterDishIds: ["beef-potato", "pork-ribs", "broccoli", "choy-sum", "corn-soup"], onboardingStep: 5 };
  assert.equal(dishPoolReadiness(warning).level, "warning");
  assert.equal(dishPoolReadiness(warning).canGenerate, true);

  let ready = { ...createNewUserState(), starterDishIds: ["beef-potato", "pork-ribs", "chicken-mushroom", "fish-ginger", "broccoli", "choy-sum", "lettuce", "baby-cabbage", "corn-soup", "wintermelon-soup"], onboardingStep: 5 };
  assert.equal(dishPoolReadiness(ready).level, "ready");
  ready = reducer(ready, { type: "COMPLETE_ONBOARDING" });
  ready = reducer(ready, { type: "GENERATE_DONE" });
  ready.menus[1].data.forEach((day) => {
    const lunch = new Set(day.lunch.map(([name]) => name));
    const dinner = new Set(day.dinner.map(([name]) => name));
    assert.equal([...lunch].some((name) => dinner.has(name)), false);
  });
});

test("菜品库只显示已确认菜品，并支持添加自家菜", () => {
  let state = createInitialState();
  assert.equal(dishPoolStats(state).total, 10);
  assert.equal(userLibrary(state).length, 10);

  state = reducer(state, { type: "OPEN_ADD_DISH" });
  assert.equal(state.addingDish, true);
  assert.equal(state.addDishMode, "choose");
  state = reducer(state, { type: "CHOOSE_ADD_DISH_MODE", mode: "manual" });
  assert.equal(state.addDishMode, "manual");
  state = reducer(state, { type: "ADD_MANUAL_DISH", dish: { id: "manual-test", name: "芹菜炒香干", kind: "veg", main: "芹菜、香干" } });
  assert.equal(state.addingDish, false);
  assert.equal(state.addDishMode, null);
  assert.equal(dishPoolStats(state).total, 11);
  assert.equal(dishPoolStats(state).veg, 4);
  assert.equal(userLibrary(state).at(-1).name, "芹菜炒香干");
  assert.equal(usableLibrary(state).at(-1).id, "manual-test");

  state = reducer(state, { type: "ADD_MANUAL_DISH", dish: { id: "duplicate", name: "芹菜炒香干", kind: "veg", main: "香干" } });
  assert.equal(userLibrary(state).filter((dish) => dish.name === "芹菜炒香干").length, 1);

  state = reducer(state, { type: "OPEN_ADD_DISH" });
  state = reducer(state, { type: "CHOOSE_ADD_DISH_MODE", mode: "recommend" });
  state = reducer(state, { type: "ADD_RECOMMENDED_DISH", id: "tomato-beef-brisket" });
  assert.equal(state.addDishMode, "recommend");
  assert.equal(dishPoolStats(state).total, 12);
  assert.ok(userLibrary(state).some((dish) => dish.id === "tomato-beef-brisket"));
  const beforeDuplicateName = state.starterDishIds.length;
  state = reducer(state, { type: "ADD_RECOMMENDED_DISH", id: "seaweed-soup" });
  assert.equal(state.starterDishIds.length, beforeDuplicateName);
  state = reducer(state, { type: "CLOSE_ADD_DISH" });
  assert.equal(state.addDishMode, null);
});

test("我的页面的信息面板可打开、关闭，并在切换主导航时收起", () => {
  let state = createInitialState();
  state = reducer(state, { type: "OPEN_PROFILE_PANEL", panel: "privacy" });
  assert.equal(state.profilePanel, "privacy");
  state = reducer(state, { type: "CLOSE_PROFILE_PANEL" });
  assert.equal(state.profilePanel, null);

  state = reducer(state, { type: "OPEN_PROFILE_PANEL", panel: "unknown" });
  assert.equal(state.profilePanel, null);
  state = reducer(state, { type: "OPEN_PROFILE_PANEL", panel: "collection" });
  state = reducer(state, { type: "NAV_TAB", tab: "schedule" });
  assert.equal(state.profilePanel, null);
});

test("首次菜品池支持较大推荐池、自主结束、撤销和补充自家菜", () => {
  let state = createNewUserState();
  state = { ...state, onboardingStep: 3 };

  assert.equal(starterDishChoices.length, 18);
  assert.equal(dishPoolStats(state).total, 0);

  state = reducer(state, { type: "CHOOSE_STARTER_DISH", selected: true });
  assert.deepEqual(state.starterDishIds, ["beef-potato"]);
  assert.equal(state.starterDishIndex, 1);

  state = reducer(state, { type: "CHOOSE_STARTER_DISH", selected: false });
  assert.equal(state.starterDishIndex, 2);
  state = reducer(state, { type: "UNDO_STARTER_DISH" });
  assert.equal(state.starterDishIndex, 1);

  state = reducer(state, { type: "FINISH_STARTER_DISH_PICK" });
  assert.equal(state.onboardingStep, 4);
  assert.equal(dishPoolStats(state).total, 1);

  state = reducer(state, { type: "ONBOARDING_BACK" });
  assert.equal(state.onboardingStep, 3);

  let exhausted = { ...createNewUserState(), onboardingStep: 3 };
  for (let index = 0; index < starterDishChoices.length; index += 1) exhausted = reducer(exhausted, { type: "CHOOSE_STARTER_DISH", selected: false });
  assert.equal(exhausted.onboardingStep, 3);
  assert.equal(exhausted.starterDishIndex, starterDishChoices.length);

  state = reducer(state, { type: "ADD_CUSTOM_STARTER_DISH", value: "番茄炒蛋" });
  state = reducer(state, { type: "ADD_CUSTOM_STARTER_DISH", value: "番茄炒蛋" });
  assert.deepEqual(state.customStarterDishes, ["番茄炒蛋"]);
  state = reducer(state, { type: "REMOVE_CUSTOM_STARTER_DISH", value: "番茄炒蛋" });
  assert.deepEqual(state.customStarterDishes, []);
});

test("首次补充菜必须带分类、会参与生成，并拦截所有来源的重名", () => {
  let state = { ...createNewUserState(), onboardingStep: 4, starterDishIds: ["beef-potato"] };
  state = reducer(state, { type: "ADD_ONBOARDING_DISH", dish: { id: "duplicate", name: "土豆烧牛肉", kind: "meat" } });
  assert.equal(state.manualDishes.length, 0);

  state = reducer(state, { type: "ADD_ONBOARDING_DISH", dish: { id: "home-tofu", name: "家里的烧豆腐", kind: "veg" } });
  assert.equal(state.manualDishes.length, 1);
  assert.equal(usableLibrary(state).at(-1).name, "家里的烧豆腐");
  assert.equal(dishPoolStats(state).veg, 1);

  state = reducer(state, { type: "ADD_CUSTOM_STARTER_DISH", value: "待分类汤" });
  assert.equal(dishPoolStats(state).total, 3);
  assert.equal(usableLibrary(state).length, 2);
  state = reducer(state, { type: "CLASSIFY_CUSTOM_DISH", name: "待分类汤", kind: "soup" });
  assert.deepEqual(state.customStarterDishes, []);
  assert.equal(usableLibrary(state).length, 3);
  assert.equal(dishPoolStats(state).soup, 1);
});

test("首次挑菜已选数量永远不会超过已看数量", () => {
  let state = { ...createNewUserState(), onboardingStep: 3 };
  for (let index = 0; index < 8; index += 1) {
    state = reducer(state, { type: "CHOOSE_STARTER_DISH", selected: index % 3 !== 0 });
  }

  assert.equal(state.starterDishDecisions.length, 8);
  assert.equal(state.starterDishIds.length, 5);
  assert.ok(state.starterDishIds.length <= state.starterDishDecisions.length);
});

test("首次挑选结果是菜品库、生成和换菜共用的唯一菜品池", () => {
  let state = { ...createNewUserState(), onboardingStep: 3 };
  for (let index = 0; index < 5; index += 1) state = reducer(state, { type: "CHOOSE_STARTER_DISH", selected: true });
  state = reducer(state, { type: "ADD_ONBOARDING_DISH", dish: { id: "home-tofu", name: "家里的烧豆腐", kind: "veg" } });

  assert.deepEqual(userLibrary(state).map((dish) => dish.name), ["土豆烧牛肉", "清炒西兰花", "可乐鸡翅", "蒜蓉菜心", "紫菜蛋花汤", "家里的烧豆腐"]);
  assert.equal(usableLibrary(state).length, 6);
  assert.equal(visibleLibrary(state).length, 6);

  state = reducer(state, { type: "COMPLETE_ONBOARDING" });
  state = reducer(state, { type: "GENERATE_DONE" });
  const generatedNames = state.menus[1].data.flatMap((day) => state.household.meals.flatMap((meal) => day[meal].map(([name]) => name)));
  const usableNames = new Set(usableLibrary(state).map((dish) => dish.name));
  assert.ok(generatedNames.every((name) => usableNames.has(name)));
});

test("家庭设置、菜品池和菜单记录可完整保存并恢复", () => {
  let state = createInitialState();
  state = reducer(state, { type: "SET_HOUSEHOLD_PEOPLE", value: 3 });
  state = reducer(state, { type: "TOGGLE_HOUSEHOLD_DAY", value: 1 });
  state = reducer(state, { type: "SET_MEAL_PATTERN", value: "custom" });
  state = reducer(state, { type: "ADJUST_CUSTOM_PATTERN", kind: "veg", delta: -1 });
  state = reducer(state, { type: "ADD_MANUAL_DISH", dish: { id: "home-tofu", name: "家里的烧豆腐", kind: "veg", main: "豆腐" } });
  state = reducer(state, { type: "GENERATE_DONE" });
  state = reducer(state, { type: "SAVE_MENU" });

  const saved = serializePrototypeData(state);
  const restored = restorePrototypeData(createInitialState(), saved);
  assert.equal(saved.version, 2);
  assert.equal(restored.household.people, 3);
  assert.deepEqual(restored.household.dayIndexes, [0, 2, 3, 4]);
  assert.equal(restored.mealPattern, "custom");
  assert.deepEqual(restored.customPattern, { meat: 2, veg: 1, soup: 1 });
  assert.ok(restored.manualDishes.some((dish) => dish.id === "home-tofu"));
  assert.equal(restored.menus[1].status, "saved");
  assert.deepEqual(restored.menus[1].data, state.menus[1].data);
  assert.equal(restored.historyWeekIndex, 1);
});

test("旧版和异常本地数据会被兼容、限幅和去重", () => {
  const legacy = restorePrototypeData(createInitialState(), {
    version: 1,
    starterDishIds: ["seaweed-soup", "seaweed-egg-soup", "missing"],
    customStarterDishes: ["紫菜蛋花汤", "自家蒸菜"],
    manualDishes: [{ id: "manual-1", name: "自家蒸菜", kind: "veg", main: "青菜" }],
  });
  assert.equal(legacy.starterDishIds.length, 1);
  assert.deepEqual(legacy.customStarterDishes, []);
  assert.equal(legacy.manualDishes.length, 1);

  const restored = restorePrototypeData(createInitialState(), {
    version: 2,
    household: { people: 99, meals: ["invalid"], dayIndexes: [-1, 9] },
    mealPattern: "invalid",
    customPattern: { meat: 9, veg: -2, soup: 1 },
    starterDishIds: ["beef-potato", "beef-potato"],
    manualDishes: [{ id: "duplicate", name: "土豆烧牛肉", kind: "meat" }, { id: "bad", name: "坏数据", kind: "unknown" }],
    customStarterDishes: ["土豆烧牛肉", "待分类菜", "待分类菜"],
    menus: { 0: { status: "saved", data: [{ dayIndex: 99, lunch: [], dinner: [] }] } },
    weekIndex: 99,
    historyWeekIndex: 99,
  });
  assert.equal(restored.household.people, 20);
  assert.deepEqual(restored.household.meals, ["lunch", "dinner"]);
  assert.deepEqual(restored.household.dayIndexes, [0, 1, 2, 3, 4]);
  assert.equal(restored.mealPattern, "2-2-1");
  assert.deepEqual(restored.customPattern, { meat: 3, veg: 0, soup: 1 });
  assert.deepEqual(restored.starterDishIds, ["beef-potato"]);
  assert.deepEqual(restored.customStarterDishes, ["待分类菜"]);
  assert.equal(restored.manualDishes.length, 0);
  assert.equal(restored.weekIndex, 1);
});

test("首次设置会决定实际生成的天数、餐次和每餐结构", () => {
  let state = reducer(createInitialState(), { type: "RESET_TO_NEW_USER" });
  state = reducer(state, { type: "TOGGLE_HOUSEHOLD_MEAL", value: "lunch" });
  state = reducer(state, { type: "SET_HOUSEHOLD_DAYS", value: 7 });
  state = reducer(state, { type: "SET_MEAL_PATTERN", value: "2-1-1" });
  state = reducer(state, { type: "COMPLETE_ONBOARDING" });
  state = reducer(state, { type: "GENERATE_DONE" });

  assert.equal(state.menus[1].data.length, 7);
  assert.equal(state.menus[1].data[0].dinner.length, 4);
  assert.equal(state.selection.meal, "dinner");
  assert.deepEqual(planStats(state), { days: 7, meals: 1, mealCount: 7, perMeal: 4, dishCount: 28 });
  assert.equal(weekRange(1, 7), "9月7日—13日");
});

test("可以选不连续的排菜日期，且生成结果保留真实星期", () => {
  let state = reducer(createInitialState(), { type: "RESET_TO_NEW_USER" });
  state = reducer(state, { type: "TOGGLE_HOUSEHOLD_DAY", value: 1 });
  state = reducer(state, { type: "TOGGLE_HOUSEHOLD_DAY", value: 3 });
  state = reducer(state, { type: "COMPLETE_ONBOARDING" });
  state = reducer(state, { type: "GENERATE_DONE" });

  assert.deepEqual(state.household.dayIndexes, [0, 2, 4]);
  assert.deepEqual(state.menus[1].data.map((day) => day.day), ["周一", "周三", "周五"]);
  assert.deepEqual(state.menus[1].data.map((day) => day.dayIndex), [0, 2, 4]);
  assert.equal(weekRange(1, state.household.dayIndexes), "9月7日—11日");
  assert.deepEqual(planStats(state), { days: 3, meals: 2, mealCount: 6, perMeal: 5, dishCount: 30 });
});

test("自定义餐型有明确上下限，并按数量生成菜品", () => {
  let state = reducer(createInitialState(), { type: "RESET_TO_NEW_USER" });
  state = reducer(state, { type: "SET_MEAL_PATTERN", value: "custom" });
  for (let index = 0; index < 5; index += 1) state = reducer(state, { type: "ADJUST_CUSTOM_PATTERN", kind: "meat", delta: 1 });
  for (let index = 0; index < 5; index += 1) state = reducer(state, { type: "ADJUST_CUSTOM_PATTERN", kind: "soup", delta: 1 });
  assert.deepEqual(currentMealPattern(state), { meat: 3, veg: 2, soup: 2 });

  state = reducer(state, { type: "COMPLETE_ONBOARDING" });
  state = reducer(state, { type: "GENERATE_DONE" });
  assert.equal(state.menus[1].data[0].lunch.length, 7);
  assert.equal(planStats(state).perMeal, 7);
});
