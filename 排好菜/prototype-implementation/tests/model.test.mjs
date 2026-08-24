import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState, reducer } from "../src/model.js";

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
