import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState, createNewUserState, currentMealPattern, dishPoolStats, planStats, reducer, starterDishChoices, weekRange } from "../src/model.js";

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
  assert.equal(dishPoolStats(state).total, 38);
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
