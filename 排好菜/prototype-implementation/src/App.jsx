import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Cross2Icon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  MinusIcon,
  PersonIcon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  createInitialState,
  createNewUserState,
  currentMealPattern,
  dishPoolStats,
  kindLabels,
  library,
  mealPatterns,
  mealLabels,
  onboardingSteps,
  planStats,
  reducer,
  selectedDish,
  starterDishChoices,
  starterDishTargets,
  tabs,
  visibleLibrary,
  weekRange,
  weekdayLabels,
  weeks,
} from "./model.js";

const tabMeta = {
  schedule: { label: "排菜单", icon: CalendarIcon },
  library: { label: "菜品库", icon: ArchiveIcon },
  history: { label: "历史", icon: ClockIcon },
  profile: { label: "我的", icon: PersonIcon },
};

const screenTitles = {
  home: "本周菜单",
  edit: "修改菜单",
  swap: "替换菜品",
  review: "确认菜单",
};

function getInitialState() {
  const params = new URL(window.location.href).searchParams;
  const state = params.get("demo") === "ready" ? createInitialState() : createNewUserState();
  const tab = params.get("tab");
  const screen = params.get("screen");
  const weekParam = params.get("week");
  const onboarding = Number(params.get("onboarding"));
  const week = Number(weekParam);
  if (tabs.includes(tab)) state.activeTab = tab;
  if (["home", "edit", "swap", "review"].includes(screen)) state.screen = screen;
  if (weekParam !== null && Number.isInteger(week) && week >= 0 && week < weeks.length) state.weekIndex = week;
  if (state.demoMode === "new" && Number.isInteger(onboarding) && onboarding >= 0 && onboarding < onboardingSteps.length) state.onboardingStep = onboarding;
  if (!state.menus[state.weekIndex]?.data && state.screen !== "home") state.screen = "home";
  return state;
}

function StatusBar() {
  return (
    <div className="status-bar" aria-label="手机状态栏">
      <strong>9:41</strong>
      <img src={`${import.meta.env.BASE_URL}assets/status/ios-status-icons.svg`} alt="" />
    </div>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="device-stage">
      <div className="device-canvas">
        <div className="device-screen" data-phone-screen>
          <StatusBar />
          {children}
        </div>
        <img className="device-bezel" src={`${import.meta.env.BASE_URL}assets/iphone/Bezel.png`} alt="" />
      </div>
    </div>
  );
}

function AppHeader({ state, dispatch }) {
  let title = tabMeta[state.activeTab].label;
  let showBack = false;
  if (state.activeTab === "schedule") {
    title = screenTitles[state.screen];
    showBack = state.screen !== "home";
  }
  if (state.activeTab === "library" && state.pickingFromLibrary) {
    title = "手选替换菜";
    showBack = true;
  }

  const goBack = () => {
    if (state.activeTab === "library" && state.pickingFromLibrary) dispatch({ type: "BACK_TO_EDIT" });
    else if (state.screen === "swap" || state.screen === "review") dispatch({ type: "BACK_TO_EDIT" });
    else dispatch({ type: "OPEN_WEEK", weekIndex: state.weekIndex });
  };

  return (
    <header className="app-bar">
      {showBack ? <button className="icon-button" type="button" onClick={goBack} aria-label="返回"><ChevronLeftIcon /></button> : <span />}
      <strong>{title}</strong>
      <span className="prototype-badge">演示</span>
    </header>
  );
}

function BottomNavigation({ state, dispatch }) {
  return (
    <nav className="bottom-navigation" aria-label="小程序主导航">
      {tabs.map((tab) => {
        const Icon = tabMeta[tab].icon;
        return (
          <button key={tab} type="button" className={state.activeTab === tab ? "active" : ""} aria-current={state.activeTab === tab ? "page" : undefined} onClick={() => dispatch({ type: "NAV_TAB", tab })}>
            <Icon /><span>{tabMeta[tab].label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function PrimaryButton({ children, onClick, icon: Icon = ChevronRightIcon, disabled = false, tone = "red" }) {
  return <button className={`primary-button ${tone}`} type="button" onClick={onClick} disabled={disabled}><span>{children}</span><Icon /></button>;
}

const onboardingTitles = ["欢迎使用排好菜", "家里怎么吃饭", "每餐怎么搭配", "挑出家里常吃的菜", "还想补充什么菜", "第一次准备完成"];
const patternMaximums = { meat: 3, veg: 3, soup: 2 };

function weekdaySummary(indexes) {
  const key = indexes.join(",");
  if (key === "0,1,2,3,4") return "周一至周五";
  if (key === "0,1,2,3,4,5,6") return "周一至周日";
  return indexes.map((index) => weekdayLabels[index]).join("、");
}

function ChoiceRow({ values, selected, onSelect, multiple = false }) {
  return <div className="onboarding-choices">{values.map(([value, label]) => { const active = multiple ? selected.includes(value) : selected === value; return <button key={value} type="button" className={active ? "active" : ""} aria-pressed={active} onClick={() => onSelect(value)}>{active && <CheckIcon />}{label}</button>; })}</div>;
}

function PeopleCountField({ value, onChange }) {
  const custom = value > 6;
  return <div className="people-count-control"><div className="people-quick-options">{[1, 2, 3, 4, 5, 6].map((count) => <button key={count} type="button" className={value === count ? "active" : ""} aria-pressed={value === count} onClick={() => onChange(count)}>{count} 人</button>)}<button type="button" className={custom ? "active custom" : "custom"} aria-pressed={custom} onClick={() => onChange(custom ? value : 7)}>自定义</button></div>{custom && <label className="people-custom-input"><span>具体人数</span><input type="number" inputMode="numeric" min="1" max="20" step="1" value={value} aria-label="家庭人数" onChange={(event) => onChange(event.target.value)} /><b>人</b><small>最多 20 人</small></label>}</div>;
}

function WeekdayPicker({ selected, onToggle }) {
  return <div className="weekday-picker">{weekdayLabels.map((label, index) => { const active = selected.includes(index); return <button key={label} type="button" className={active ? "active" : ""} aria-label={label} aria-pressed={active} onClick={() => onToggle(index)}><strong>{label.slice(1)}</strong></button>; })}<small>已选 {selected.length} 天 · {weekdaySummary(selected)}</small></div>;
}

function OnboardingHeader({ state, dispatch }) {
  return <header className="app-bar onboarding-app-bar">{state.onboardingStep > 0 ? <button className="icon-button" type="button" onClick={() => dispatch({ type: "ONBOARDING_BACK" })} aria-label="返回上一步"><ChevronLeftIcon /></button> : <span />}<strong>{onboardingTitles[state.onboardingStep]}</strong><span className="prototype-badge">{state.onboardingStep + 1}/{onboardingSteps.length}</span></header>;
}

function HouseholdStep({ state, dispatch }) {
  return <><section className="onboarding-form-card"><header><strong>通常几个人吃饭</strong><small>单选 · 最多 20 人</small></header><PeopleCountField value={state.household.people} onChange={(value) => dispatch({ type: "SET_HOUSEHOLD_PEOPLE", value })} /></section><section className="onboarding-form-card"><header><strong>需要安排哪些餐次</strong><small>可多选</small></header><ChoiceRow values={[["lunch", "午饭"], ["dinner", "晚饭"]]} selected={state.household.meals} multiple onSelect={(value) => dispatch({ type: "TOGGLE_HOUSEHOLD_MEAL", value })} /></section><section className="onboarding-form-card"><header><strong>一周哪些天需要排菜</strong><small>至少选 1 天</small></header><WeekdayPicker selected={state.household.dayIndexes} onToggle={(value) => dispatch({ type: "TOGGLE_HOUSEHOLD_DAY", value })} /></section><div className="page-action"><PrimaryButton tone="green" onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>下一步：选择每餐结构</PrimaryButton></div></>;
}

function PatternStep({ state, dispatch }) {
  const pattern = currentMealPattern(state);
  const dailyMeals = state.household.meals.length;
  const perMeal = pattern.meat + pattern.veg + pattern.soup;
  return <><section className="onboarding-lead"><span>默认餐型</span><h2>选一个最常用的搭配</h2><p>以后某一餐仍可以单独调整，不会被固定死。</p></section><div className="pattern-list">{[...Object.entries(mealPatterns), ["custom", { label: "自定义搭配" }]].map(([value, item]) => <button key={value} type="button" className={state.mealPattern === value ? "active" : ""} aria-pressed={state.mealPattern === value} onClick={() => dispatch({ type: "SET_MEAL_PATTERN", value })}><span>{state.mealPattern === value ? <CheckIcon /> : null}</span><strong>{item.label}</strong><small>{value === "custom" ? "自己设置荤菜、素菜和汤羹数量" : "常用家庭组合"}</small></button>)}</div>{state.mealPattern === "custom" && <section className="custom-pattern"><header><strong>每餐数量</strong><small>荤素 0—3，汤羹 0—2</small></header>{[["meat", "荤菜"], ["veg", "素菜"], ["soup", "汤羹"]].map(([kind, label]) => <div key={kind}><span>{label}</span><button type="button" aria-label={`减少${label}`} disabled={state.customPattern[kind] === 0} onClick={() => dispatch({ type: "ADJUST_CUSTOM_PATTERN", kind, delta: -1 })}><MinusIcon /></button><b>{state.customPattern[kind]}</b><button type="button" aria-label={`增加${label}`} disabled={state.customPattern[kind] === patternMaximums[kind]} onClick={() => dispatch({ type: "ADJUST_CUSTOM_PATTERN", kind, delta: 1 })}><PlusIcon /></button></div>)}</section>}<div className="meal-summary"><span>按当前设置</span><strong>每餐 {perMeal} 道 · 每天 {perMeal * dailyMeals} 道</strong><small>{state.household.dayIndexes.length} 天共 {perMeal * dailyMeals * state.household.dayIndexes.length} 道菜</small></div><div className="page-action"><PrimaryButton tone="green" disabled={perMeal === 0} onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>下一步：建立菜品池</PrimaryButton></div></>;
}

function StarterStep({ state, dispatch }) {
  const dish = library.find((item) => item.id === starterDishChoices[state.starterDishIndex]);
  const completed = state.starterDishDecisions.length;
  const selected = state.starterDishIds.length;
  const selectedStats = state.starterDishIds.reduce((stats, id) => {
    const item = library.find((candidate) => candidate.id === id);
    if (item) stats[item.kind] += 1;
    return stats;
  }, { meat: 0, veg: 0, soup: 0 });
  const ready = Object.keys(starterDishTargets).every((kind) => selectedStats[kind] >= starterDishTargets[kind]);
  const finishButton = <button className="dish-picker-complete" type="button" disabled={selected === 0} onClick={() => dispatch({ type: "FINISH_STARTER_DISH_PICK" })}><span><strong>我选得差不多了</strong><small>{ready ? "分类已经比较均衡，可以进入下一步" : "也可以先用这些，之后再继续补充"}</small></span><ChevronRightIcon /></button>;
  if (!dish) return <><section className="dish-pick-finished"><small>这一批推荐已经看完</small><h2>你挑了 {selected} 道常吃菜</h2><p>不用把所有菜一次想齐，现在结束或者再看一遍都可以。</p><div>{Object.entries(kindLabels).map(([kind, label]) => <span key={kind}><b>{selectedStats[kind]}</b>{label}</span>)}</div></section><button className="review-dishes-button" type="button" onClick={() => dispatch({ type: "REVIEW_STARTER_DISHES" })}>再看一遍推荐菜</button>{finishButton}</>;
  return <><section className="dish-pick-heading"><div><small>{kindLabels[dish.kind]} · 快速挑选</small><strong>已看 {completed} 道</strong></div><span><i style={{ width: `${(completed / starterDishChoices.length) * 100}%` }} /></span><p>推荐池共有 {starterDishChoices.length} 道示例菜，觉得差不多时可以随时结束。</p></section><article className="dish-pick-card"><img src={dish.image} alt={`${dish.name}，主要材料${dish.ingredients.join("、")}`} /><div><span>{kindLabels[dish.kind]}</span><h2>{dish.name}</h2><p>主要材料 · {dish.ingredients.join("、")}</p></div></article><div className="dish-pick-actions"><button type="button" onClick={() => dispatch({ type: "CHOOSE_STARTER_DISH", selected: false })}>暂时不要</button><button type="button" onClick={() => dispatch({ type: "CHOOSE_STARTER_DISH", selected: true })}><CheckIcon />加入菜品库</button></div><footer className="dish-pick-footer"><button type="button" disabled={completed === 0} onClick={() => dispatch({ type: "UNDO_STARTER_DISH" })}>撤销上一步</button><span>已选 <b>{selected}</b> 道 · 荤 {selectedStats.meat} / 素 {selectedStats.veg} / 汤 {selectedStats.soup}</span></footer>{finishButton}</>;
}

function DishPoolStep({ state, dispatch }) {
  const [draft, setDraft] = useState("");
  const selectedDishes = state.starterDishIds.map((id) => library.find((item) => item.id === id)).filter(Boolean);
  const addDish = () => {
    if (!draft.trim()) return;
    dispatch({ type: "ADD_CUSTOM_STARTER_DISH", value: draft });
    setDraft("");
  };
  return <><section className="supplement-hero"><small>已经挑选 {selectedDishes.length} 道</small><h2>还有家里常吃的菜吗？</h2><p>写下菜名就可以先加入，材料和分类以后再补充。</p><div className="selected-dish-preview">{selectedDishes.length > 0 ? selectedDishes.map((dish) => <span key={dish.id}><img src={dish.image} alt="" /><b>{dish.name}</b></span>) : <em>这一轮还没有选择，后面也可以在菜品库添加。</em>}</div></section><form className="supplement-form" onSubmit={(event) => { event.preventDefault(); addDish(); }}><label><MagnifyingGlassIcon /><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="例如：番茄炒蛋" aria-label="补充一道家常菜" /></label><button type="submit" disabled={!draft.trim()}>加入</button></form>{state.customStarterDishes.length > 0 && <div className="custom-dish-chips">{state.customStarterDishes.map((name) => <span key={name}>{name}<button type="button" aria-label={`移除${name}`} onClick={() => dispatch({ type: "REMOVE_CUSTOM_STARTER_DISH", value: name })}><Cross2Icon /></button></span>)}</div>}<section className="onboarding-note"><ArchiveIcon /><div><strong>之后还可以继续补充</strong><p>首次准备只需要建立一个起点，不必现在想齐家里所有菜。</p></div></section><div className="page-action"><PrimaryButton tone="green" onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>{state.customStarterDishes.length > 0 ? "确认补充并继续" : "暂时没有，继续"}</PrimaryButton></div></>;
}

function ReadyStep({ state, dispatch }) {
  const pattern = currentMealPattern(state);
  const stats = dishPoolStats(state);
  return <><section className="onboarding-ready"><CheckIcon /><small>首次准备完成</small><h2>现在可以排第一周菜单了</h2><p>接下来生成的菜单，会按照刚才确认的家庭习惯和菜品池组合。</p></section><section className="ready-summary"><div><span>家庭餐次</span><strong>{state.household.people} 人 · {state.household.meals.map((meal) => mealLabels[meal]).join("和")}</strong></div><div><span>排菜日期</span><strong>{weekdaySummary(state.household.dayIndexes)}</strong></div><div><span>每餐结构</span><strong>{pattern.meat} 荤 {pattern.veg} 素 {pattern.soup} 汤</strong></div><div><span>菜品池</span><strong>{stats.total} 道已确认菜品</strong></div></section><div className="page-action"><PrimaryButton icon={MagicWandIcon} onClick={() => dispatch({ type: "COMPLETE_ONBOARDING" })}>去排第一周菜单</PrimaryButton></div></>;
}

function OnboardingFlow({ state, dispatch }) {
  const content = [<section className="onboarding-welcome" key="welcome"><div className="welcome-mark"><CalendarIcon /></div><small>家庭菜单助手</small><h1>先花一分钟，<br />告诉我们家里怎么吃。</h1><p>准备好餐次、每餐结构和常用菜，以后每周就能直接生成菜单。</p><div className="welcome-steps"><span><b>1</b>设置家庭餐次</span><span><b>2</b>选择每餐结构</span><span><b>3</b>确认常用菜品</span></div><PrimaryButton tone="green" icon={ChevronRightIcon} onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>开始准备</PrimaryButton></section>, <HouseholdStep key="household" state={state} dispatch={dispatch} />, <PatternStep key="pattern" state={state} dispatch={dispatch} />, <StarterStep key="starter" state={state} dispatch={dispatch} />, <DishPoolStep key="pool" state={state} dispatch={dispatch} />, <ReadyStep key="ready" state={state} dispatch={dispatch} />];
  return <><OnboardingHeader state={state} dispatch={dispatch} /><div className={`mobile-page onboarding-page step-${state.onboardingStep}`}>{content[state.onboardingStep]}</div>{state.toast && <button className="toast" type="button" onClick={() => dispatch({ type: "DISMISS_TOAST" })}><CheckIcon />{state.toast}</button>}</>;
}

function WeekToolbar({ state, dispatch }) {
  const week = weeks[state.weekIndex];
  const dayLabel = weekdaySummary(state.household.dayIndexes);
  return (
    <div className="week-toolbar">
      <button type="button" aria-label="上一周" disabled={state.weekIndex === 0} onClick={() => dispatch({ type: "WEEK_MOVE", delta: -1 })}><ChevronLeftIcon /></button>
      <div><strong>{weekRange(state.weekIndex, state.household.dayIndexes)}</strong><span>{week.short} · {dayLabel}</span></div>
      <button type="button" aria-label="下一周" disabled={state.weekIndex === weeks.length - 1} onClick={() => dispatch({ type: "WEEK_MOVE", delta: 1 })}><ChevronRightIcon /></button>
    </div>
  );
}

function ScheduleHome({ state, dispatch }) {
  const weekState = state.menus[state.weekIndex];
  const pool = dishPoolStats(state);
  const stats = planStats(state);
  const pattern = currentMealPattern(state);
  const isEmpty = weekState.status === "empty";
  const isSaved = weekState.status === "saved";
  return (
    <div className="mobile-page schedule-home">
      <WeekToolbar state={state} dispatch={dispatch} />
      <section className={`plan-state ${isSaved ? "saved" : ""}`}>
        <div><small>{isEmpty ? "本周还没有菜单" : isSaved ? "这一周已经安排好" : "菜单正在调整"}</small><strong>{isEmpty ? `${stats.mealCount} 餐待安排` : `${stats.days} 天 · ${stats.mealCount} 餐 · ${stats.dishCount} 道菜`}</strong></div>
        <span>{isEmpty ? "待生成" : isSaved ? "已保存" : "草稿"}</span>
      </section>
      <section className="rule-card"><span>默认排菜规则</span><h2>{stats.days} 天 {stats.mealCount} 餐，一次排好</h2><p>每餐 {pattern.meat} 荤 {pattern.veg} 素 {pattern.soup} 汤，只使用已确认菜品，同一主料尽量错开。</p><div><b>{stats.days} 天</b><b>{stats.mealCount} 餐</b><b>{stats.dishCount} 道菜</b></div></section>
      <section className="ready-card"><MagicWandIcon /><div><strong>{isEmpty ? "菜品池已就绪" : "菜单数据会跨页保留"}</strong><p>{isEmpty ? `${pool.total} 道已确认菜品，规则校验无遗漏。` : "换菜、保存和历史复制会共享同一份菜单。"}</p></div></section>
      {isEmpty ? (
        <div className="page-action"><PrimaryButton onClick={() => dispatch({ type: "GENERATE_START" })} icon={MagicWandIcon} disabled={state.generating}>{state.generating ? "正在组合本周菜单…" : "生成本周菜单"}</PrimaryButton><small>生成后可以逐道修改，再确认保存。</small></div>
      ) : (
        <div className="page-action"><PrimaryButton onClick={() => dispatch({ type: "EDIT_MENU" })} icon={MixerHorizontalIcon}>{isSaved ? "查看并调整这一周" : "继续调整菜单"}</PrimaryButton>{isSaved && <button className="secondary-action" type="button" onClick={() => dispatch({ type: "NAV_TAB", tab: "history" })}>去历史查看保存结果</button>}</div>
      )}
    </div>
  );
}

function getDish(menu, selection) {
  const [name, kind] = menu[selection.dayIndex][selection.meal][selection.dishIndex];
  return { name, kind };
}

function MenuEditor({ state, dispatch }) {
  const menu = state.menus[state.weekIndex].data;
  const stats = planStats(state, menu);
  const pattern = currentMealPattern(state);
  const visibleIndexes = Array.from({ length: state.viewKind === "all" ? stats.perMeal : pattern.meat }, (_, index) => index);
  const selected = selectedDish(state);
  const carouselDrag = useRef({ active: false, moved: false, pointerId: null, startX: 0, scrollLeft: 0 });

  const startCarouselDrag = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    carouselDrag.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCarouselDrag = (event) => {
    const drag = carouselDrag.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    event.currentTarget.classList.add("dragging");
    event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  };

  const finishCarouselDrag = (event) => {
    const drag = carouselDrag.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;
    event.currentTarget.classList.remove("dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const suppressDraggedDishClick = (event) => {
    if (!carouselDrag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    carouselDrag.current.moved = false;
  };

  return (
    <div className="mobile-page menu-editor">
      <section className="menu-board">
        <header className="menu-board-head"><div><small>{weekRange(state.weekIndex, menu.map((day) => day.dayIndex))}</small><strong>{stats.days} 天 {stats.mealCount} 餐菜单</strong></div><div className="segmented"><button type="button" className={state.viewKind === "meat" ? "active" : ""} onClick={() => dispatch({ type: "SET_VIEW_KIND", value: "meat" })}>荤菜</button><button type="button" className={state.viewKind === "all" ? "active" : ""} onClick={() => dispatch({ type: "SET_VIEW_KIND", value: "all" })}>全部</button></div></header>
        <div className="menu-grid" style={{ "--dish-count": visibleIndexes.length, "--meal-count": state.household.meals.length }}>
          <div className="meal-axis" aria-hidden="true"><span />{state.household.meals.map((meal) => <b key={meal}>{mealLabels[meal]}</b>)}</div>
          <div
            className="day-carousel"
            aria-label={`左右滑动查看${weekdaySummary(menu.map((day) => day.dayIndex))}`}
            onClickCapture={suppressDraggedDishClick}
            onPointerCancel={finishCarouselDrag}
            onPointerDown={startCarouselDrag}
            onPointerMove={moveCarouselDrag}
            onPointerUp={finishCarouselDrag}
          >
            {menu.map((day, dayIndex) => <section className="day-column" key={day.day}><header><strong>{day.day}</strong><small>{weeks[state.weekIndex].dates[day.dayIndex ?? dayIndex]}</small></header>{state.household.meals.map((meal) => <div className="meal-cells" key={meal}>{visibleIndexes.map((dishIndex) => { const selection = { dayIndex, meal, dishIndex }; const dish = getDish(menu, selection); const active = JSON.stringify(selection) === JSON.stringify(state.selection); return <button key={dishIndex} type="button" className={`${dish.kind} ${active ? "active" : ""}`} aria-pressed={active} onClick={() => dispatch({ type: "SELECT_DISH", selection })}>{dish.name}</button>; })}</div>)}</section>)}
          </div>
        </div>
      </section>
      <section className="selection-card"><div><small>当前选择 · {menu[state.selection.dayIndex].day}{mealLabels[state.selection.meal]} · {kindLabels[selected.kind]}</small><strong>{selected.name}</strong><p>只替换这一道，其他餐次保持不变。</p></div><div><button type="button" onClick={() => dispatch({ type: "OPEN_SWAP", mode: "smart" })}>换一道</button><button type="button" onClick={() => dispatch({ type: "OPEN_LIBRARY_PICK" })}>自己选</button></div></section>
      <div className="soft-warning"><ClockIcon /><span><strong>软规则提醒</strong>系统已标出 1 条可选优化项，可以保留，也可以选中后替换。</span></div>
      <div className="page-action sticky"><PrimaryButton onClick={() => dispatch({ type: "CONFIRM_MENU" })} icon={CheckIcon}>确认 {stats.mealCount} 餐菜单</PrimaryButton></div>
    </div>
  );
}

function SwapScreen({ state, dispatch }) {
  const current = selectedDish(state);
  const stats = planStats(state);
  const candidates = library.filter((dish) => dish.kind === current.kind && dish.name !== current.name).slice(0, 4);
  const chosen = candidates.some((dish) => dish.id === state.candidateId) ? state.candidateId : candidates[0]?.id;
  useEffect(() => {
    if (chosen && chosen !== state.candidateId) dispatch({ type: "SELECT_CANDIDATE", id: chosen });
  }, [chosen, dispatch, state.candidateId]);
  return (
    <div className="mobile-page swap-screen">
      <div className="swap-heading"><span>只换这一道</span><h2>{current.name}</h2><p>优先从同类菜中挑选，同时避开本周已使用的主料。</p></div>
      <div className="locked-week"><CheckIcon />其他 {stats.dishCount - 1} 道菜保持不变</div>
      <div className="candidate-list">{candidates.map((dish) => <button key={dish.id} type="button" className={state.candidateId === dish.id ? "selected" : ""} onClick={() => dispatch({ type: "SELECT_CANDIDATE", id: dish.id })}><span className="radio">{state.candidateId === dish.id && <CheckIcon />}</span><span><strong>{dish.name}</strong><small>{kindLabels[dish.kind]} · 近 8 周 {dish.uses} 次 · {dish.note}</small></span></button>)}</div>
      <button className="browse-library" type="button" onClick={() => dispatch({ type: "OPEN_LIBRARY_PICK" })}><ArchiveIcon /><span><strong>在菜品库里自己选</strong><small>可按荤菜、素菜和汤羹筛选</small></span><ChevronRightIcon /></button>
      <div className="page-action sticky"><PrimaryButton onClick={() => dispatch({ type: "APPLY_CANDIDATE" })} icon={CheckIcon} disabled={!chosen}>保存这次替换</PrimaryButton></div>
    </div>
  );
}

function MealList({ menu, weekIndex, meals }) {
  return <div className="meal-list">{menu.flatMap((day, dayIndex) => meals.map((meal) => <article key={`${day.day}-${meal}`}><header><strong>{day.day} · {mealLabels[meal]}</strong><time>{weeks[weekIndex].dates[day.dayIndex ?? dayIndex]}</time></header><p>{day[meal].map((dish) => dish[0]).join("、")}</p></article>))}</div>;
}

function ReviewScreen({ state, dispatch }) {
  const menu = state.menus[state.weekIndex].data;
  const stats = planStats(state, menu);
  return <div className="mobile-page review-screen"><section className="review-hero"><small>{weekRange(state.weekIndex, menu.map((day) => day.dayIndex))}</small><strong>{stats.days} 天 {stats.mealCount} 餐，准备保存</strong><p>共 {stats.dishCount} 道菜，已保留 1 条软规则提醒。</p></section><MealList menu={menu} weekIndex={state.weekIndex} meals={state.household.meals} /><div className="page-action sticky"><PrimaryButton tone="green" onClick={() => dispatch({ type: "SAVE_MENU" })} icon={CheckIcon}>保存本周菜单</PrimaryButton></div></div>;
}

function ScheduleScreen({ state, dispatch }) {
  if (state.screen === "edit") return <MenuEditor state={state} dispatch={dispatch} />;
  if (state.screen === "swap") return <SwapScreen state={state} dispatch={dispatch} />;
  if (state.screen === "review") return <ReviewScreen state={state} dispatch={dispatch} />;
  return <ScheduleHome state={state} dispatch={dispatch} />;
}

function LibraryScreen({ state, dispatch }) {
  const dishes = visibleLibrary(state);
  const detail = library.find((dish) => dish.id === state.libraryDetailId);
  const stats = dishPoolStats(state);
  return (
    <div className="mobile-page library-screen">
      {state.pickingFromLibrary && <div className="picking-banner"><MixerHorizontalIcon /><span><strong>手选一道{kindLabels[selectedDish(state)?.kind]}</strong><small>选中后直接回到菜单，其他菜不变。</small></span></div>}
      <section className="library-summary"><small>已确认菜品</small><strong>{stats.total} 道</strong><p>生成和换菜只会使用这个菜品池。</p><div><span><b>{stats.meat}</b>荤菜</span><span><b>{stats.veg}</b>素菜</span><span><b>{stats.soup}</b>汤羹</span></div></section>
      <label className="search-field"><MagnifyingGlassIcon /><input value={state.libraryQuery} onChange={(event) => dispatch({ type: "SET_LIBRARY_QUERY", value: event.target.value })} placeholder="搜索菜名或主料" /></label>
      <div className="filter-row">{[["all", "全部"], ["meat", "荤菜"], ["veg", "素菜"], ["soup", "汤羹"]].map(([value, label]) => <button key={value} type="button" className={state.libraryFilter === value ? "active" : ""} onClick={() => dispatch({ type: "SET_LIBRARY_FILTER", value })}>{label}</button>)}</div>
      <div className="dish-list">{dishes.map((dish) => <button key={dish.id} type="button" onClick={() => dispatch({ type: state.pickingFromLibrary ? "PICK_LIBRARY_DISH" : "OPEN_LIBRARY_DETAIL", id: dish.id })}><span className={`kind-dot ${dish.kind}`} /><span><strong>{dish.name}</strong><small>{kindLabels[dish.kind]} · 主料 {dish.main} · 近 8 周 {dish.uses} 次</small></span><ChevronRightIcon /></button>)}</div>
      {dishes.length === 0 && <div className="empty-result"><ArchiveIcon /><strong>没有找到匹配菜品</strong><button type="button" onClick={() => { dispatch({ type: "SET_LIBRARY_QUERY", value: "" }); dispatch({ type: "SET_LIBRARY_FILTER", value: "all" }); }}>清空筛选</button></div>}
      {detail && <div className="sheet-backdrop" onClick={() => dispatch({ type: "CLOSE_LIBRARY_DETAIL" })}><section className="detail-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" type="button" onClick={() => dispatch({ type: "CLOSE_LIBRARY_DETAIL" })} aria-label="关闭"><Cross2Icon /></button><span>{kindLabels[detail.kind]} · 主料 {detail.main}</span><h2>{detail.name}</h2><p>{detail.note}。近 8 周共安排 {detail.uses} 次，生成时会与本周主料一起校验。</p><button type="button" onClick={() => dispatch({ type: "CLOSE_LIBRARY_DETAIL" })}>知道了</button></section></div>}
    </div>
  );
}

function HistoryScreen({ state, dispatch }) {
  const savedWeeks = weeks.map((week, weekIndex) => ({ ...week, weekIndex, plan: state.menus[weekIndex] })).filter((item) => item.plan.status === "saved").reverse();
  const stats = planStats(state);
  return (
    <div className="mobile-page history-screen">
      <section className="history-summary"><small>已保存菜单</small><strong>{savedWeeks.length} 周 · {savedWeeks.length * stats.mealCount} 餐</strong><p>可展开查看完整菜单，也可复制到下一周再调整。</p></section>
      <div className="history-heading"><strong>按周查看</strong><span>点击卡片展开</span></div>
      <div className="history-list">{savedWeeks.map(({ short, weekIndex, plan }) => { const open = state.expandedHistory === weekIndex; const menuStats = planStats(state, plan.data); return <article className={open ? "open" : ""} key={weekIndex}><button className="history-trigger" type="button" onClick={() => dispatch({ type: "TOGGLE_HISTORY", weekIndex })}><span><small>{short}已保存</small><strong>{weekRange(weekIndex, plan.data.map((day) => day.dayIndex ?? 0))}</strong><p>{menuStats.mealCount} 餐 · {menuStats.dishCount} 道菜</p></span><ChevronDownIcon /></button>{open && <div className="history-detail"><MealList menu={plan.data} weekIndex={weekIndex} meals={state.household.meals} /><div className="history-actions"><button type="button" onClick={() => dispatch({ type: "OPEN_WEEK", weekIndex })}>打开这周菜单</button><button type="button" onClick={() => dispatch({ type: "ASK_COPY", weekIndex })}>复制到下周</button></div></div>}</article>; })}</div>
      {savedWeeks.length === 0 && <div className="empty-result"><ClockIcon /><strong>还没有保存过菜单</strong><button type="button" onClick={() => dispatch({ type: "NAV_TAB", tab: "schedule" })}>去生成本周菜单</button></div>}
    </div>
  );
}

function ProfileScreen({ state }) {
  const pattern = currentMealPattern(state);
  const stats = dishPoolStats(state);
  return (
    <div className="mobile-page profile-screen">
      <section className="profile-card"><span><CalendarIcon /></span><div><small>家庭菜单工作台</small><strong>我家的排好菜</strong><p>工程原型 · 本地演示数据</p></div></section>
      <div className="section-title"><strong>默认排菜规则</strong><span>生成时自动应用</span></div>
      <section className="rule-list"><div><span>排菜周期</span><strong>{weekdaySummary(state.household.dayIndexes)}</strong></div><div><span>餐次</span><strong>{state.household.meals.map((meal) => mealLabels[meal]).join("和")}</strong></div><div><span>每餐结构</span><strong>{pattern.meat} 荤 {pattern.veg} 素 {pattern.soup} 汤</strong></div><div><span>避重规则</span><strong>近 5 天主料尽量不重复</strong></div><div><span>菜品来源</span><strong>{stats.total} 道已确认菜品</strong></div></section>
      <section className="scope-note"><strong>第一阶段原型边界</strong><p>支持生成、逐道换菜、手选、保存、菜品库筛选和历史复用。不包含登录、云同步和采购清单。</p></section>
    </div>
  );
}

function PhoneApp({ state, dispatch }) {
  return (
    <PhoneFrame>
      {state.demoMode === "new" ? <OnboardingFlow state={state} dispatch={dispatch} /> : <><AppHeader state={state} dispatch={dispatch} />
        {state.activeTab === "schedule" && <ScheduleScreen state={state} dispatch={dispatch} />}
        {state.activeTab === "library" && <LibraryScreen state={state} dispatch={dispatch} />}
        {state.activeTab === "history" && <HistoryScreen state={state} dispatch={dispatch} />}
        {state.activeTab === "profile" && <ProfileScreen state={state} />}
        <BottomNavigation state={state} dispatch={dispatch} />
        {state.copyPrompt && <div className="dialog-backdrop"><section className="copy-dialog"><ArchiveIcon /><h2>复制整周菜单？</h2><p>{weekRange(state.copyPrompt.source, state.household.dayIndexes)} 将复制到 {weekRange(state.copyPrompt.target, state.household.dayIndexes)}，然后进入调整页。</p><div><button type="button" onClick={() => dispatch({ type: "CANCEL_COPY" })}>取消</button><button type="button" onClick={() => dispatch({ type: "CONFIRM_COPY" })}>确认复制</button></div></section></div>}
        {state.toast && <button className="toast" type="button" onClick={() => dispatch({ type: "DISMISS_TOAST" })}><CheckIcon />{state.toast}</button>}</>}
    </PhoneFrame>
  );
}

function DemoControls({ state, dispatch }) {
  const isNewUser = state.demoMode === "new";
  return <section className="demo-state-box"><div><small>演示状态</small><strong>{isNewUser ? `新用户 · ${onboardingSteps[state.onboardingStep]}` : "已完成首次准备"}</strong></div><p>只改变本地 Mock，不属于手机里的产品界面。</p><div><button type="button" onClick={() => dispatch({ type: "RESET_TO_NEW_USER" })}><ReloadIcon />重置为新用户</button><button type="button" onClick={() => dispatch({ type: "SKIP_ONBOARDING" })} disabled={!isNewUser}>跳过首次准备</button></div></section>;
}

function DevInspector({ state }) {
  const lifecycle = state.menus[state.weekIndex].status;
  const dish = selectedDish(state);
  const isNewUser = state.demoMode === "new";
  return (
    <aside className="dev-inspector">
      <header><div><span>Live state</span><h2>当前工程状态</h2></div><i className={isNewUser ? "new-user" : ""} /> </header>
      <dl><div><dt>当前入口</dt><dd>{isNewUser ? "首次准备" : tabMeta[state.activeTab].label}</dd></div><div><dt>演示周</dt><dd>{weeks[state.weekIndex].short} · {weekRange(state.weekIndex, state.household.dayIndexes)}</dd></div><div><dt>菜单状态</dt><dd><code>{lifecycle}</code></dd></div><div><dt>当前选菜</dt><dd>{dish?.name || "尚未生成"}</dd></div></dl>
      <section><strong>最近操作</strong><ol>{state.log.map((item, index) => <li key={`${item}-${index}`}><span>{index + 1}</span>{item}</li>)}</ol></section>
      <div className="mock-boundary"><strong>本地 Mock 边界</strong><p>这一版只演示界面和状态联动，不请求真实后端；刷新会按网址中的演示步骤恢复。</p></div>
    </aside>
  );
}

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    if (!state.generating) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "GENERATE_DONE" }), 620);
    return () => window.clearTimeout(timer);
  }, [state.generating]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", state.activeTab);
    url.searchParams.set("screen", state.screen);
    url.searchParams.set("week", String(state.weekIndex));
    url.searchParams.set("demo", state.demoMode);
    if (state.demoMode === "new") url.searchParams.set("onboarding", String(state.onboardingStep));
    else url.searchParams.delete("onboarding");
    window.history.replaceState({}, "", url);
  }, [state.activeTab, state.demoMode, state.onboardingStep, state.screen, state.weekIndex]);

  const progress = useMemo(() => {
    if (state.demoMode === "new") return `首次准备 · ${onboardingSteps[state.onboardingStep]}`;
    const status = state.menus[state.weekIndex].status;
    if (state.activeTab !== "schedule") return tabMeta[state.activeTab].label;
    if (status === "empty") return "待生成";
    if (state.screen === "review") return "待保存";
    return status === "saved" ? "已保存" : "调整中";
  }, [state]);

  return (
    <>
      <div className="mobile-prototype-toolbar" role="navigation" aria-label="手机原型工具栏">
        <a href="../" aria-label="退出原型，返回排好菜项目入口"><ArrowLeftIcon />退出原型</a>
        <span>排好菜</span>
      </div>
      <header className="workspace-toolbar">
        <a className="back-link" href="../"><ArrowLeftIcon />项目入口</a>
        <nav aria-label="工程原型视图"><span className="active">运行原型</span><a href="./page-map.html">页面地图</a></nav>
        <a className="customer-link" href="../prototype-customer/?step=generate">客户原型<ChevronRightIcon /></a>
      </header>
      <main className="engineering-workspace">
        <section className="workspace-intro"><span>Executable prototype · V0.2</span><h1>从第一次打开，<br />把完整旅程走一遍。</h1><p>这里是团队的可运行实现参照。首次准备、四个底部入口、周切换、换菜、保存和历史复用共享同一份演示数据。</p><div className="progress-card"><small>当前演示</small><strong>{state.demoMode === "new" ? progress : `${weeks[state.weekIndex].short} · ${progress}`}</strong><span>{state.demoMode === "new" ? "可在下方重置或跳过，验证首次准备的不同状态。" : state.activeTab === "schedule" ? "可从上一周菜单复制，或直接生成本周。" : `正在查看${tabMeta[state.activeTab].label}。`}</span></div><DemoControls state={state} dispatch={dispatch} /><div className="scope-pills"><span>本地 Mock</span><span>{state.household.dayIndexes.length} 天 × {state.household.meals.length} 个餐次</span><span>{currentMealPattern(state).meat} 荤 {currentMealPattern(state).veg} 素 {currentMealPattern(state).soup} 汤</span></div></section>
        <section className="phone-zone" aria-label="可运行的排好菜小程序工程原型"><PhoneApp state={state} dispatch={dispatch} /></section>
        <DevInspector state={state} />
      </main>
    </>
  );
}
