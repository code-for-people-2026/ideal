import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Cross2Icon,
  EnvelopeClosedIcon,
  FileTextIcon,
  IdCardIcon,
  InfoCircledIcon,
  ListBulletIcon,
  LockClosedIcon,
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
  dishPoolReadiness,
  dishPoolStats,
  kindLabels,
  library,
  mealPatterns,
  mealLabels,
  onboardingSteps,
  planStats,
  reducer,
  restorePrototypeData,
  selectedDish,
  serializePrototypeData,
  starterDishChoices,
  tabs,
  userLibrary,
  usableLibrary,
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

const PROTOTYPE_PROFILE_KEY = "paihaocai.prototype.dish-pool.v1";

function restoreDishPool(state) {
  try {
    // ponytail: `demo=new` is an explicit fresh-start boundary; do not mix a
    // returning user's persisted dish pool into an in-progress first-use flow.
    if (state.demoMode === "new") return state;
    const saved = JSON.parse(window.localStorage.getItem(PROTOTYPE_PROFILE_KEY));
    return restorePrototypeData(state, saved);
  } catch {
    return state;
  }
}

function getInitialState() {
  const params = new URL(window.location.href).searchParams;
  const state = restoreDishPool(params.get("demo") === "ready" ? createInitialState() : createNewUserState());
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
      <span />
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
  return <><section className="onboarding-form-card"><header><strong>通常几个人吃饭</strong><small>最多 20 人</small></header><PeopleCountField value={state.household.people} onChange={(value) => dispatch({ type: "SET_HOUSEHOLD_PEOPLE", value })} /></section><section className="onboarding-form-card"><header><strong>需要安排哪些餐次</strong></header><ChoiceRow values={[["lunch", "午饭"], ["dinner", "晚饭"]]} selected={state.household.meals} multiple onSelect={(value) => dispatch({ type: "TOGGLE_HOUSEHOLD_MEAL", value })} /></section><section className="onboarding-form-card"><header><strong>一周哪些天需要排菜</strong></header><WeekdayPicker selected={state.household.dayIndexes} onToggle={(value) => dispatch({ type: "TOGGLE_HOUSEHOLD_DAY", value })} /></section><div className="page-action"><PrimaryButton tone="green" onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>下一步：选择每餐结构</PrimaryButton></div></>;
}

function PatternStep({ state, dispatch }) {
  const pattern = currentMealPattern(state);
  const dailyMeals = state.household.meals.length;
  const perMeal = pattern.meat + pattern.veg + pattern.soup;
  return <><section className="onboarding-lead"><h2>选一个最常用的搭配</h2><p>以后仍可以单独调整某一餐。</p></section><div className="pattern-list">{[...Object.entries(mealPatterns), ["custom", { label: "自定义搭配" }]].map(([value, item]) => <button key={value} type="button" className={state.mealPattern === value ? "active" : ""} aria-pressed={state.mealPattern === value} onClick={() => dispatch({ type: "SET_MEAL_PATTERN", value })}><span>{state.mealPattern === value ? <CheckIcon /> : null}</span><strong>{item.label}</strong>{value === "custom" && <small>自己设置每餐数量</small>}</button>)}</div>{state.mealPattern === "custom" && <section className="custom-pattern"><header><strong>每餐数量</strong><small>荤素 0—3，汤羹 0—2</small></header>{[["meat", "荤菜"], ["veg", "素菜"], ["soup", "汤羹"]].map(([kind, label]) => <div key={kind}><span>{label}</span><button type="button" aria-label={`减少${label}`} disabled={state.customPattern[kind] === 0} onClick={() => dispatch({ type: "ADJUST_CUSTOM_PATTERN", kind, delta: -1 })}><MinusIcon /></button><b>{state.customPattern[kind]}</b><button type="button" aria-label={`增加${label}`} disabled={state.customPattern[kind] === patternMaximums[kind]} onClick={() => dispatch({ type: "ADJUST_CUSTOM_PATTERN", kind, delta: 1 })}><PlusIcon /></button></div>)}</section>}<div className="meal-summary"><strong>每天 {perMeal * dailyMeals} 道 · 每周 {perMeal * dailyMeals * state.household.dayIndexes.length} 道</strong></div><div className="page-action"><PrimaryButton tone="green" disabled={perMeal === 0} onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>下一步：建立菜品池</PrimaryButton></div></>;
}

const starterSwipeThreshold = 76;

function SwipeDishCard({ dish, nextDish, onDecision }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(null);
  const pointerRef = useRef(null);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const decisionTimerRef = useRef(null);

  useEffect(() => {
    setDragX(0);
    dragXRef.current = 0;
    setDragging(false);
    setLeaving(null);
  }, [dish.id]);

  useEffect(() => () => {
    window.clearTimeout(decisionTimerRef.current);
    decisionTimerRef.current = null;
  }, []);

  const decide = (selected) => {
    if (decisionTimerRef.current) return;
    setDragging(false);
    setLeaving(selected ? "left" : "right");
    dragXRef.current = selected ? -430 : 430;
    setDragX(selected ? -430 : 430);
    decisionTimerRef.current = window.setTimeout(() => {
      decisionTimerRef.current = null;
      onDecision(selected);
    }, 180);
  };

  const release = (event) => {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(dragXRef.current) >= starterSwipeThreshold) decide(dragXRef.current < 0);
    else {
      dragXRef.current = 0;
      setDragX(0);
    }
  };

  return <>
    <div className="dish-swipe-guide" aria-hidden="true"><span><ChevronLeftIcon />向左滑加入</span><b>按住图片滑动</b><span>向右滑不要<ChevronRightIcon /></span></div>
    <div className="dish-swipe-deck">
      {nextDish && <article className="dish-pick-card next" aria-hidden="true"><img src={nextDish.image} alt="" /><div><span>{kindLabels[nextDish.kind]}</span><h2>{nextDish.name}</h2></div></article>}
      <article
        className={`dish-pick-card current ${dragging ? "dragging" : ""} ${leaving ? `leaving-${leaving}` : ""}`}
        draggable="true"
        style={{ "--swipe-x": `${dragX}px`, "--swipe-rotate": `${dragX / 24}deg` }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          pointerRef.current = event.pointerId;
          startXRef.current = event.clientX - dragXRef.current;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (pointerRef.current !== event.pointerId) return;
          const nextDragX = Math.max(-150, Math.min(150, event.clientX - startXRef.current));
          dragXRef.current = nextDragX;
          setDragX(nextDragX);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onDragStart={(event) => {
          startXRef.current = event.clientX - dragXRef.current;
          setDragging(true);
        }}
        onDrag={(event) => {
          if (!event.clientX) return;
          const nextDragX = Math.max(-150, Math.min(150, event.clientX - startXRef.current));
          dragXRef.current = nextDragX;
          setDragX(nextDragX);
        }}
        onDragEnd={(event) => {
          setDragging(false);
          if (event.clientX) dragXRef.current = Math.max(-150, Math.min(150, event.clientX - startXRef.current));
          if (Math.abs(dragXRef.current) >= starterSwipeThreshold) decide(dragXRef.current < 0);
          else {
            dragXRef.current = 0;
            setDragX(0);
          }
        }}
      >
        <img draggable="false" src={dish.image} alt={`${dish.name}，主要材料${dish.ingredients.join("、")}`} />
        <span className={`swipe-stamp accept ${dragX < -18 ? "visible" : ""}`}>加入菜品库</span>
        <span className={`swipe-stamp reject ${dragX > 18 ? "visible" : ""}`}>暂时不要</span>
        <div><span>{kindLabels[dish.kind]}</span><h2>{dish.name}</h2><p>主要材料 · {dish.ingredients.join("、")}</p></div>
      </article>
    </div>
  </>;
}

function StarterStep({ state, dispatch }) {
  const dish = library.find((item) => item.id === starterDishChoices[state.starterDishIndex]);
  const nextDish = library.find((item) => item.id === starterDishChoices[state.starterDishIndex + 1]);
  const completed = state.starterDishDecisions.length;
  const selected = state.starterDishIds.length;
  const selectedStats = state.starterDishIds.reduce((stats, id) => {
    const item = library.find((candidate) => candidate.id === id);
    if (item) stats[item.kind] += 1;
    return stats;
  }, { meat: 0, veg: 0, soup: 0 });
  const readiness = dishPoolReadiness(state);
  const finishCopy = readiness.level === "ready" ? "分类已经比较均衡，可以进入下一步" : readiness.canGenerate ? "已经可以排菜，菜少时可能会重复" : "也可以先用这些，下一步继续补充";
  const finishButton = <button className="dish-picker-complete" type="button" disabled={selected === 0} onClick={() => dispatch({ type: "FINISH_STARTER_DISH_PICK" })}><span><strong>我选得差不多了</strong><small>{finishCopy}</small></span><ChevronRightIcon /></button>;
  if (!dish) return <><section className="dish-pick-finished"><small>这一批推荐已经看完</small><h2>你挑了 {selected} 道常吃菜</h2><p>不用把所有菜一次想齐，现在结束或者再看一遍都可以。</p><div>{Object.entries(kindLabels).map(([kind, label]) => <span key={kind}><b>{selectedStats[kind]}</b>{label}</span>)}</div></section><button className="review-dishes-button" type="button" onClick={() => dispatch({ type: "REVIEW_STARTER_DISHES" })}>再看一遍推荐菜</button>{finishButton}</>;
  return <><section className="dish-pick-heading"><div><small>{kindLabels[dish.kind]} · 快速挑选</small><strong>已看 {completed} 道</strong></div><span><i style={{ width: `${(completed / starterDishChoices.length) * 100}%` }} /></span></section><SwipeDishCard dish={dish} nextDish={nextDish} onDecision={(selectedDishDecision) => dispatch({ type: "CHOOSE_STARTER_DISH", selected: selectedDishDecision })} /><footer className="dish-pick-footer"><button type="button" disabled={completed === 0} onClick={() => dispatch({ type: "UNDO_STARTER_DISH" })}>撤销上一步</button><span>已选 <b>{selected}</b> 道 · 荤 {selectedStats.meat} / 素 {selectedStats.veg} / 汤 {selectedStats.soup}</span></footer>{finishButton}</>;
}

function DishPoolStep({ state, dispatch }) {
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState("meat");
  const selectedDishes = state.starterDishIds.map((id) => library.find((item) => item.id === id)).filter(Boolean);
  const addedDishes = state.manualDishes || [];
  const duplicate = userLibrary(state).some((dish) => dish.name.trim().toLocaleLowerCase("zh-CN") === draft.trim().toLocaleLowerCase("zh-CN"));
  const addDish = () => {
    if (!draft.trim() || duplicate) return;
    dispatch({ type: "ADD_ONBOARDING_DISH", dish: { id: `onboarding-${Date.now()}`, name: draft, kind: draftKind } });
    setDraft("");
  };
  return <><section className="supplement-hero"><small>已经挑选 {selectedDishes.length} 道</small><h2>还有家里常吃的菜吗？</h2><p>写下菜名并选好分类，它会直接加入菜品库。</p><div className="selected-dish-preview">{selectedDishes.length > 0 ? selectedDishes.map((dish) => <span key={dish.id}><img src={dish.image} alt="" /><b>{dish.name}</b></span>) : <em>还没有选择菜品。</em>}</div></section><form className="supplement-form" onSubmit={(event) => { event.preventDefault(); addDish(); }}><label><MagnifyingGlassIcon /><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="例如：番茄炒蛋" aria-label="补充一道家常菜" /></label><button type="submit" disabled={!draft.trim() || duplicate}>加入</button><fieldset><legend>这道菜属于</legend><div>{Object.entries(kindLabels).map(([value, label]) => <button key={value} type="button" className={draftKind === value ? "active" : ""} aria-pressed={draftKind === value} onClick={() => setDraftKind(value)}>{label}</button>)}</div></fieldset>{duplicate && <small>菜品库里已经有这道菜了</small>}</form>{addedDishes.length > 0 && <div className="custom-dish-chips">{addedDishes.map((dish) => <span key={dish.id}>{dish.name} · {kindLabels[dish.kind]}<button type="button" aria-label={`移除${dish.name}`} onClick={() => dispatch({ type: "REMOVE_MANUAL_DISH", id: dish.id })}><Cross2Icon /></button></span>)}</div>}<div className="page-action"><PrimaryButton tone="green" onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>{addedDishes.length > 0 ? "确认补充并继续" : "暂时没有，继续"}</PrimaryButton></div></>;
}

function ReadyStep({ state, dispatch }) {
  const pattern = currentMealPattern(state);
  const stats = dishPoolStats(state);
  const readiness = dishPoolReadiness(state);
  const requiredKinds = Object.keys(kindLabels).filter((kind) => pattern[kind] > 0);
  const hero = readiness.level === "blocked"
    ? { small: "菜品池暂时不足", title: "还不能生成完整菜单", body: "至少有一个分类无法填满每餐，补充后再开始会更稳妥。", Icon: Cross2Icon }
    : readiness.level === "warning"
      ? { small: "首次准备完成", title: "可以排菜，但会有重复", body: "现有菜品能填满每餐；补充不同主料后，午饭和晚饭更容易错开。", Icon: InfoCircledIcon }
      : { small: "首次准备完成", title: "现在可以排第一周菜单了", body: "菜品数量和主料种类比较均衡，生成时会优先错开重复。", Icon: CheckIcon };
  const warningCopy = readiness.level === "blocked"
    ? requiredKinds.filter((kind) => readiness.missing[kind] > 0).map((kind) => `还需 ${readiness.missing[kind]} 道${kindLabels[kind]}`).join("，")
    : readiness.level === "warning"
      ? requiredKinds.filter((kind) => readiness.diversityGap[kind] > 0).map((kind) => `建议再补 ${readiness.diversityGap[kind]} 种${kindLabels[kind]}主料`).join("，")
      : "达到减少同日重复的建议数量";
  const HeroIcon = hero.Icon;
  return (
    <>
      <section className={`onboarding-ready ${readiness.level}`}><HeroIcon /><small>{hero.small}</small><h2>{hero.title}</h2><p>{hero.body}</p></section>
      {readiness.level !== "ready" && <section className={`pool-readiness compact ${readiness.level}`}><strong>{readiness.level === "blocked" ? "需要先补充菜品" : "菜品较少，菜单会有重复"}</strong><span>{warningCopy}</span>{stats.custom > 0 && <small>{stats.custom} 道待分类菜暂不参与生成。</small>}</section>}
      <section className="ready-summary compact"><div><span>家庭安排</span><strong>{state.household.people} 人 · {state.household.meals.map((meal) => mealLabels[meal]).join("和")} · {weekdaySummary(state.household.dayIndexes)}</strong></div><div><span>菜单基础</span><strong>{pattern.meat} 荤 {pattern.veg} 素 {pattern.soup} 汤 · {usableLibrary(state).length} 道可用</strong></div></section>
      {readiness.level === "blocked" ? <div className="page-action ready-actions"><PrimaryButton tone="green" icon={ArchiveIcon} onClick={() => dispatch({ type: "CONTINUE_STARTER_DISH_PICK" })}>继续补充菜品</PrimaryButton><button className="secondary-action" type="button" onClick={() => dispatch({ type: "EDIT_MEAL_PATTERN" })}>调整每餐结构</button></div> : readiness.level === "warning" ? <div className="page-action ready-actions"><PrimaryButton icon={MagicWandIcon} onClick={() => dispatch({ type: "COMPLETE_ONBOARDING" })}>接受重复，去排菜单</PrimaryButton><button className="secondary-action" type="button" onClick={() => dispatch({ type: "CONTINUE_STARTER_DISH_PICK" })}>继续补充菜品</button></div> : <div className="page-action"><PrimaryButton icon={MagicWandIcon} onClick={() => dispatch({ type: "COMPLETE_ONBOARDING" })}>去排第一周菜单</PrimaryButton></div>}
    </>
  );
}

function OnboardingFlow({ state, dispatch }) {
  const content = [<section className="onboarding-welcome" key="welcome"><div className="welcome-mark"><CalendarIcon /></div><small>家庭菜单助手</small><h1>先花一分钟，<br />告诉我们家里怎么吃。</h1><p>准备好餐次、每餐结构和常用菜，以后每周就能直接生成菜单。</p><div className="welcome-steps"><span><b>1</b>设置家庭餐次</span><span><b>2</b>选择每餐结构</span><span><b>3</b>确认常用菜品</span></div><PrimaryButton tone="green" icon={ChevronRightIcon} onClick={() => dispatch({ type: "ONBOARDING_NEXT" })}>开始准备</PrimaryButton></section>, <HouseholdStep key="household" state={state} dispatch={dispatch} />, <PatternStep key="pattern" state={state} dispatch={dispatch} />, <StarterStep key="starter" state={state} dispatch={dispatch} />, <DishPoolStep key="pool" state={state} dispatch={dispatch} />, <ReadyStep key="ready" state={state} dispatch={dispatch} />];
  return <><OnboardingHeader state={state} dispatch={dispatch} /><div className={`mobile-page onboarding-page step-${state.onboardingStep}`}>{content[state.onboardingStep]}</div>{state.toast && <button className="toast" type="button" onClick={() => dispatch({ type: "DISMISS_TOAST" })}><CheckIcon />{state.toast}</button>}</>;
}

function WeekToolbar({ state, dispatch, weekIndex = state.weekIndex, dayIndexes = state.household.dayIndexes, subtitle, onMove, canMoveBack = weekIndex > 0, canMoveForward = weekIndex < weeks.length - 1 }) {
  const week = weeks[weekIndex];
  const dayLabel = weekdaySummary(dayIndexes);
  const move = onMove || ((delta) => dispatch({ type: "WEEK_MOVE", delta }));
  return (
    <div className="week-toolbar">
      <button type="button" aria-label="上一周" disabled={!canMoveBack} onClick={() => move(-1)}><ChevronLeftIcon /></button>
      <div><strong>{weekRange(weekIndex, dayIndexes)}</strong><span>{subtitle || `${week.short} · ${dayLabel}`}</span></div>
      <button type="button" aria-label="下一周" disabled={!canMoveForward} onClick={() => move(1)}><ChevronRightIcon /></button>
    </div>
  );
}

function ScheduleHome({ state, dispatch }) {
  const weekState = state.menus[state.weekIndex];
  const usableDishCount = usableLibrary(state).length;
  const poolReadiness = dishPoolReadiness(state);
  const stats = planStats(state);
  const pattern = currentMealPattern(state);
  const isEmpty = weekState.status === "empty";
  const isSaved = weekState.status === "saved";
  return (
    <div className="mobile-page schedule-home">
      <WeekToolbar state={state} dispatch={dispatch} />
      <section className={`plan-state ${isSaved ? "saved" : ""}`}>
        <div><strong>{isEmpty ? `${stats.mealCount} 餐待安排` : `${stats.days} 天 · ${stats.mealCount} 餐 · ${stats.dishCount} 道菜`}</strong></div>
        <span>{isEmpty ? "待生成" : isSaved ? "已保存" : "草稿"}</span>
      </section>
      <section className="rule-card"><h2>{stats.days} 天 {stats.mealCount} 餐，一次排好</h2><p>{state.household.meals.map((meal) => mealLabels[meal]).join("和")} · 每餐 {pattern.meat} 荤 {pattern.veg} 素 {pattern.soup} 汤</p></section>
      {isEmpty && poolReadiness.level !== "ready" && <section className={`ready-card ${poolReadiness.level}`}><MagicWandIcon /><strong>{poolReadiness.level === "blocked" ? "菜品不足，需要先补充" : `${usableDishCount} 道菜可用，菜单可能有重复`}</strong></section>}
      {isEmpty ? (
        <div className="page-action"><PrimaryButton onClick={() => dispatch({ type: "GENERATE_START" })} icon={MagicWandIcon} disabled={state.generating}>{state.generating ? "正在组合本周菜单…" : "生成本周菜单"}</PrimaryButton></div>
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

function useCarouselDrag() {
  const dragState = useRef({ active: false, moved: false, pointerId: null, startX: 0, scrollLeft: 0 });
  const onPointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragState.current = { active: true, moved: false, pointerId: event.pointerId, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    const drag = dragState.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    event.currentTarget.classList.add("dragging");
    event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  };
  const finish = (event) => {
    const drag = dragState.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;
    event.currentTarget.classList.remove("dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onClickCapture = (event) => {
    if (!dragState.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    dragState.current.moved = false;
  };
  return { onClickCapture, onPointerCancel: finish, onPointerDown, onPointerMove, onPointerUp: finish };
}

function MenuEditor({ state, dispatch }) {
  const menu = state.menus[state.weekIndex].data;
  const stats = planStats(state, menu);
  const pattern = currentMealPattern(state);
  const visibleIndexes = Array.from({ length: state.viewKind === "all" ? stats.perMeal : pattern.meat }, (_, index) => index);
  const selected = selectedDish(state);
  const carouselDrag = useCarouselDrag();

  return (
    <div className="mobile-page menu-editor">
      <div className="menu-editor-scroll"><section className="menu-board">
        <header className="menu-board-head"><div><small>{weekRange(state.weekIndex, menu.map((day) => day.dayIndex))}</small><strong>{stats.days} 天 {stats.mealCount} 餐菜单</strong></div><div className="segmented"><button type="button" className={state.viewKind === "meat" ? "active" : ""} onClick={() => dispatch({ type: "SET_VIEW_KIND", value: "meat" })}>荤菜</button><button type="button" className={state.viewKind === "all" ? "active" : ""} onClick={() => dispatch({ type: "SET_VIEW_KIND", value: "all" })}>全部</button></div></header>
        <div className="menu-grid" style={{ "--dish-count": visibleIndexes.length, "--meal-count": state.household.meals.length }}>
          <div className="meal-axis" aria-hidden="true"><span />{state.household.meals.map((meal) => <b key={meal}>{mealLabels[meal]}</b>)}</div>
          <div
            className="day-carousel"
            aria-label={`左右滑动查看${weekdaySummary(menu.map((day) => day.dayIndex))}`}
            {...carouselDrag}
          >
            {menu.map((day, dayIndex) => <section className="day-column" key={day.day}><header><strong>{day.day}</strong><small>{weeks[state.weekIndex].dates[day.dayIndex ?? dayIndex]}</small></header>{state.household.meals.map((meal) => <div className="meal-cells" key={meal}>{visibleIndexes.map((dishIndex) => { const selection = { dayIndex, meal, dishIndex }; const dish = getDish(menu, selection); const active = JSON.stringify(selection) === JSON.stringify(state.selection); return <button key={dishIndex} type="button" className={`${dish.kind} ${active ? "active" : ""}`} aria-pressed={active} onClick={() => dispatch({ type: "SELECT_DISH", selection })}>{dish.name}</button>; })}</div>)}</section>)}
          </div>
        </div>
      </section>
      <section className="selection-card"><div><small>{menu[state.selection.dayIndex].day}{mealLabels[state.selection.meal]} · {kindLabels[selected.kind]}</small><strong>{selected.name}</strong></div><div><button type="button" onClick={() => dispatch({ type: "OPEN_SWAP", mode: "smart" })}>换一道</button><button type="button" onClick={() => dispatch({ type: "OPEN_LIBRARY_PICK" })}>自己选</button></div></section>
      </div>
      <div className="menu-editor-action-dock"><PrimaryButton onClick={() => dispatch({ type: "CONFIRM_MENU" })} icon={CheckIcon}>确认 {stats.mealCount} 餐菜单</PrimaryButton></div>
    </div>
  );
}

function SwapScreen({ state, dispatch }) {
  const current = selectedDish(state);
  const stats = planStats(state);
  const candidates = usableLibrary(state).filter((dish) => dish.kind === current.kind && dish.name !== current.name).slice(0, 4);
  const chosen = candidates.some((dish) => dish.id === state.candidateId) ? state.candidateId : candidates[0]?.id;
  useEffect(() => {
    if (chosen && chosen !== state.candidateId) dispatch({ type: "SELECT_CANDIDATE", id: chosen });
  }, [chosen, dispatch, state.candidateId]);
  return (
    <div className="mobile-page swap-screen">
      <div className="swap-content-scroll"><div className="swap-heading"><span>只换这一道</span><h2>{current.name}</h2><p>优先从同类菜中挑选，同时避开本周已使用的主料。</p></div>
      <div className="locked-week"><CheckIcon />其他 {stats.dishCount - 1} 道菜保持不变</div>
      <div className="candidate-list">{candidates.map((dish) => <button key={dish.id} type="button" className={state.candidateId === dish.id ? "selected" : ""} onClick={() => dispatch({ type: "SELECT_CANDIDATE", id: dish.id })}><span className="radio">{state.candidateId === dish.id && <CheckIcon />}</span><span><strong>{dish.name}</strong><small>{dish.note}</small></span></button>)}</div>
      <button className="browse-library" type="button" onClick={() => dispatch({ type: "OPEN_LIBRARY_PICK" })}><ArchiveIcon /><span><strong>在菜品库里自己选</strong></span><ChevronRightIcon /></button></div>
      <div className="swap-action-dock"><PrimaryButton onClick={() => dispatch({ type: "APPLY_CANDIDATE" })} icon={CheckIcon} disabled={!chosen}>保存这次替换</PrimaryButton></div>
    </div>
  );
}

function ReadonlyMenuTable({ menu, weekIndex, meals }) {
  const stats = { days: menu.length, mealCount: menu.length * meals.length };
  const dishCount = Math.max(...menu.flatMap((day) => meals.map((meal) => day[meal].length)));
  const carouselDrag = useCarouselDrag();
  return (
    <section className="menu-board history-menu-board" aria-label="只读菜单表格">
      <header className="menu-board-head history-menu-head"><strong>菜单明细</strong><span>{stats.days} 天 · {stats.mealCount} 餐</span></header>
      <div className="menu-grid" style={{ "--dish-count": dishCount, "--meal-count": meals.length }}>
        <div className="meal-axis" aria-hidden="true"><span />{meals.map((meal) => <b key={meal}>{mealLabels[meal]}</b>)}</div>
        <div className="day-carousel" aria-label={`左右滑动查看${weekdaySummary(menu.map((day) => day.dayIndex))}`} {...carouselDrag}>
          {menu.map((day, dayIndex) => <section className="day-column" key={day.day}><header><strong>{day.day}</strong><small>{weeks[weekIndex].dates[day.dayIndex ?? dayIndex]}</small></header>{meals.map((meal) => <div className="meal-cells readonly" key={meal}>{day[meal].map(([name, kind], dishIndex) => <span className={kind} key={`${name}-${dishIndex}`}>{name}</span>)}</div>)}</section>)}
        </div>
      </div>
    </section>
  );
}

function ReviewScreen({ state, dispatch }) {
  const menu = state.menus[state.weekIndex].data;
  return <div className="mobile-page review-screen"><div className="review-table-scroll"><section className="review-hero"><small>{weekRange(state.weekIndex, menu.map((day) => day.dayIndex))}</small><strong>确认后保存本周菜单</strong></section><ReadonlyMenuTable menu={menu} weekIndex={state.weekIndex} meals={state.household.meals} /></div><div className="review-action-dock"><PrimaryButton tone="green" onClick={() => dispatch({ type: "SAVE_MENU" })} icon={CheckIcon}>保存本周菜单</PrimaryButton></div></div>;
}

function ScheduleScreen({ state, dispatch }) {
  if (state.screen === "edit") return <MenuEditor state={state} dispatch={dispatch} />;
  if (state.screen === "swap") return <SwapScreen state={state} dispatch={dispatch} />;
  if (state.screen === "review") return <ReviewScreen state={state} dispatch={dispatch} />;
  return <ScheduleHome state={state} dispatch={dispatch} />;
}

function ManualDishForm({ state, dispatch }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("meat");
  const [main, setMain] = useState("");
  const duplicate = userLibrary(state).some((dish) => dish.name.toLowerCase() === name.trim().toLowerCase());
  const save = (event) => {
    event.preventDefault();
    if (!name.trim() || duplicate) return;
    dispatch({ type: "ADD_MANUAL_DISH", dish: { id: `manual-${Date.now()}`, name, kind, main } });
  };
  return (
    <><div className="add-dish-subhead"><button type="button" onClick={() => dispatch({ type: "OPEN_ADD_DISH" })}><ChevronLeftIcon />换一种方式</button><span>自己填写</span></div><span>添加到菜品库</span><h2>新建一道菜</h2><form onSubmit={save}><label><strong>菜名</strong><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：西红柿炒鸡蛋" autoFocus /></label><fieldset><legend>分类</legend><div>{Object.entries(kindLabels).map(([value, label]) => <button key={value} type="button" className={kind === value ? "active" : ""} aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}</div></fieldset><label><strong>主要材料</strong><input value={main} onChange={(event) => setMain(event.target.value)} placeholder="选填，例如：鸡蛋、西红柿" /></label>{duplicate && <small>菜品库里已经有这道菜了</small>}<button className="add-dish-submit" type="submit" disabled={!name.trim() || duplicate}><PlusIcon />添加到菜品库</button></form></>
  );
}

function AddDishChooser({ dispatch }) {
  return <><span>补充菜品</span><h2>想怎么添加？</h2><div className="add-dish-methods"><button type="button" onClick={() => dispatch({ type: "CHOOSE_ADD_DISH_MODE", mode: "manual" })}><i><PlusIcon /></i><span><strong>自己填写一道菜</strong><small>填写菜名、分类和主要材料</small></span><ChevronRightIcon /></button><button type="button" onClick={() => dispatch({ type: "CHOOSE_ADD_DISH_MODE", mode: "recommend" })}><i><MagicWandIcon /></i><span><strong>看图片继续挑</strong><small>向左滑加入，向右滑不要</small></span><ChevronRightIcon /></button></div></>;
}

function RecommendedDishPicker({ state, dispatch }) {
  const candidateIdsRef = useRef(library.filter((dish) => dish.image && dish.ingredients?.length && !userLibrary(state).some((item) => item.id === dish.id || item.name === dish.name)).map((dish) => dish.id));
  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(0);
  const dish = library.find((item) => item.id === candidateIdsRef.current[index]);
  const nextDish = library.find((item) => item.id === candidateIdsRef.current[index + 1]);
  const decide = (selected) => {
    if (selected && dish) {
      dispatch({ type: "ADD_RECOMMENDED_DISH", id: dish.id });
      setAdded((value) => value + 1);
    }
    setIndex((value) => value + 1);
  };
  if (!dish) return <><div className="add-dish-subhead"><button type="button" onClick={() => dispatch({ type: "OPEN_ADD_DISH" })}><ChevronLeftIcon />换一种方式</button><span>图片挑选</span></div><section className="recommend-finished"><CheckIcon /><h2>这批推荐已经看完</h2><p>本次加入 {added} 道菜，之后随时可以再来补充。</p><button type="button" onClick={() => dispatch({ type: "CLOSE_ADD_DISH" })}>返回菜品库</button></section></>;
  return <><div className="add-dish-subhead"><button type="button" onClick={() => dispatch({ type: "OPEN_ADD_DISH" })}><ChevronLeftIcon />换一种方式</button><span>{index + 1}/{candidateIdsRef.current.length}</span></div><div className="recommend-picker-copy"><span>继续挑家里常吃的菜</span><strong>已加入 {added} 道</strong></div><SwipeDishCard dish={dish} nextDish={nextDish} onDecision={decide} /><button className="recommend-picker-done" type="button" onClick={() => dispatch({ type: "CLOSE_ADD_DISH" })}>我选得差不多了，返回菜品库</button></>;
}

function AddDishSheet({ state, dispatch }) {
  const mode = state.addDishMode || "choose";
  return <div className="sheet-backdrop add-dish-backdrop" onClick={() => dispatch({ type: "CLOSE_ADD_DISH" })} onWheel={(event) => event.preventDefault()}><section className={`detail-sheet add-dish-sheet mode-${mode}`} role="dialog" aria-modal="true" aria-label="添加菜" onClick={(event) => event.stopPropagation()}><button className="sheet-close" type="button" onClick={() => dispatch({ type: "CLOSE_ADD_DISH" })} aria-label="关闭添加菜"><Cross2Icon /></button>{mode === "manual" ? <ManualDishForm state={state} dispatch={dispatch} /> : mode === "recommend" ? <RecommendedDishPicker state={state} dispatch={dispatch} /> : <AddDishChooser dispatch={dispatch} />}</section></div>;
}

function LibraryScreen({ state, dispatch }) {
  const dishes = visibleLibrary(state);
  const detail = userLibrary(state).find((dish) => dish.id === state.libraryDetailId);
  const stats = dishPoolStats(state);
  return (
    <div className={`mobile-page library-screen ${state.addingDish || detail ? "sheet-open" : ""}`}>
      {state.pickingFromLibrary && <div className="picking-banner"><MixerHorizontalIcon /><span><strong>手选一道{kindLabels[selectedDish(state)?.kind]}</strong><small>选中后直接回到菜单，其他菜不变。</small></span></div>}
      <section className="library-summary compact"><div><strong>{stats.total} 道菜</strong><span>荤 {stats.meat} · 素 {stats.veg} · 汤 {stats.soup}{stats.custom > 0 ? ` · 待分类 ${stats.custom}` : ""}</span></div></section>
      <div className="library-tool-row"><label className="search-field"><MagnifyingGlassIcon /><input value={state.libraryQuery} onChange={(event) => dispatch({ type: "SET_LIBRARY_QUERY", value: event.target.value })} placeholder="搜索菜名或主料" /></label><button className="add-dish-button" type="button" onClick={() => dispatch({ type: "OPEN_ADD_DISH" })}><PlusIcon />添加菜</button></div>
      <div className="filter-row">{[["all", "全部"], ["meat", "荤菜"], ["veg", "素菜"], ["soup", "汤羹"]].map(([value, label]) => <button key={value} type="button" className={state.libraryFilter === value ? "active" : ""} onClick={() => dispatch({ type: "SET_LIBRARY_FILTER", value })}>{label}</button>)}</div>
      <div className="dish-list">{dishes.map((dish) => <button key={dish.id} type="button" disabled={state.pickingFromLibrary && dish.kind === "custom"} onClick={() => dispatch({ type: state.pickingFromLibrary ? "PICK_LIBRARY_DISH" : "OPEN_LIBRARY_DETAIL", id: dish.id })}><span className={`kind-dot ${dish.kind}`} /><span><strong>{dish.name}</strong><small>{dish.kind === "custom" ? "待补充" : kindLabels[dish.kind]}</small></span><ChevronRightIcon /></button>)}</div>
      {dishes.length === 0 && <div className="empty-result"><ArchiveIcon /><strong>没有找到匹配菜品</strong><button type="button" onClick={() => { dispatch({ type: "SET_LIBRARY_QUERY", value: "" }); dispatch({ type: "SET_LIBRARY_FILTER", value: "all" }); }}>清空筛选</button></div>}
      {detail && <div className="sheet-backdrop" onClick={() => dispatch({ type: "CLOSE_LIBRARY_DETAIL" })}><section className="detail-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" type="button" onClick={() => dispatch({ type: "CLOSE_LIBRARY_DETAIL" })} aria-label="关闭"><Cross2Icon /></button><span>{detail.kind === "custom" ? "自家菜 · 待分类" : `${kindLabels[detail.kind]} · 主料 ${detail.main}`}</span><h2>{detail.name}</h2><p>{detail.kind === "custom" ? "选好分类后，这道菜就能参与生成和换菜。" : `${detail.note}。近 8 周共安排 ${detail.uses} 次，生成时会与本周主料一起校验。`}</p>{detail.kind === "custom" ? <div className="detail-classify">{Object.entries(kindLabels).map(([kind, label]) => <button key={kind} type="button" onClick={() => dispatch({ type: "CLASSIFY_CUSTOM_DISH", name: detail.name, kind })}>设为{label}</button>)}</div> : <button type="button" onClick={() => dispatch({ type: "CLOSE_LIBRARY_DETAIL" })}>知道了</button>}</section></div>}
      {state.addingDish && <AddDishSheet state={state} dispatch={dispatch} />}
    </div>
  );
}

function HistoryScreen({ state, dispatch }) {
  const savedWeekIndexes = weeks.map((_, weekIndex) => weekIndex).filter((weekIndex) => state.menus[weekIndex].status === "saved");
  const historyWeekIndex = savedWeekIndexes.includes(state.historyWeekIndex) ? state.historyWeekIndex : savedWeekIndexes.at(-1);
  const savedPosition = savedWeekIndexes.indexOf(historyWeekIndex);
  const plan = state.menus[historyWeekIndex];
  if (!plan?.data) return <div className="mobile-page history-screen"><div className="empty-result"><ClockIcon /><strong>还没有保存过菜单</strong><button type="button" onClick={() => dispatch({ type: "NAV_TAB", tab: "schedule" })}>去生成本周菜单</button></div></div>;
  const dayIndexes = plan.data.map((day) => day.dayIndex ?? 0);
  return (
    <div className="mobile-page history-screen">
      <WeekToolbar
        state={state}
        dispatch={dispatch}
        weekIndex={historyWeekIndex}
        dayIndexes={dayIndexes}
        subtitle={`${weeks[historyWeekIndex].short} · 已保存`}
        onMove={(delta) => dispatch({ type: "HISTORY_WEEK_MOVE", delta })}
        canMoveBack={savedPosition > 0}
        canMoveForward={savedPosition < savedWeekIndexes.length - 1}
      />
      <div className="history-table-scroll"><ReadonlyMenuTable menu={plan.data} weekIndex={historyWeekIndex} meals={state.household.meals} /></div>
      {historyWeekIndex < weeks.length - 1 && <div className="history-action-dock"><PrimaryButton tone="green" icon={ArchiveIcon} onClick={() => dispatch({ type: "ASK_COPY", weekIndex: historyWeekIndex })}>复制这周到下周</PrimaryButton></div>}
    </div>
  );
}

const profilePanelContent = {
  about: {
    label: "产品信息",
    title: "关于排好菜",
    intro: "排好菜是一款面向家庭做饭安排的菜单工具，帮助用户建立自己的菜品池，再完成一周菜单的生成、调整、保存与复用。",
    facts: [["当前版本", "0.2"]],
  },
  contact: {
    label: "服务与支持",
    title: "联系与反馈",
    intro: "问题反馈和个人信息相关请求将在这里统一处理。",
    bullets: ["提交产品使用问题", "提交隐私与数据请求"],
  },
  terms: {
    label: "协议说明",
    title: "用户协议",
    intro: "用户协议说明产品与用户之间的服务约定。",
    bullets: ["服务范围、使用规则与用户责任", "内容与知识产权说明", "服务变更、暂停与终止", "免责边界与争议解决方式"],
  },
  privacy: {
    label: "隐私说明",
    title: "隐私政策",
    intro: "隐私政策说明个人信息的处理方式和用户权利。",
    bullets: ["谁在处理信息，以及如何联系", "处理目的、方式、信息类型与保存期限", "是否委托处理、共享或跨境提供", "查询、更正、删除和撤回同意的路径"],
  },
  collection: {
    label: "数据清单",
    title: "个人信息收集清单",
    intro: "使用排好菜时，会用到以下家庭菜单数据。",
    facts: [["家庭用餐设置", "人数、餐次、日期与每餐结构"], ["菜品偏好", "选中的菜品与添加的菜名"], ["菜单记录", "生成、调整和保存的菜单"]],
    note: "这些数据保存在当前浏览器，不会上传手机号、头像、位置、通讯录或相册内容。",
  },
  sharing: {
    label: "第三方服务",
    title: "第三方共享清单",
    intro: "当前版本未接入统计、广告或其他第三方服务。",
    facts: [["第三方 SDK", "无"], ["对外共享", "无"], ["跨境提供", "无"]],
  },
  data: {
    label: "数据与权利",
    title: "个人信息与数据管理",
    intro: "家庭设置、菜品池和菜单记录保存在当前浏览器。",
    bullets: ["查询和复制个人信息", "更正或补充不准确的信息", "删除数据或撤回同意", "了解数据删除和保留规则"],
  },
};

function ProfileDetailSheet({ panel, dispatch }) {
  const content = profilePanelContent[panel];
  if (!content) return null;
  return (
    <div className="sheet-backdrop profile-sheet-backdrop" onClick={() => dispatch({ type: "CLOSE_PROFILE_PANEL" })} onWheel={(event) => event.preventDefault()}>
      <section className="detail-sheet profile-detail-sheet" role="dialog" aria-modal="true" aria-label={content.title} onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" type="button" onClick={() => dispatch({ type: "CLOSE_PROFILE_PANEL" })} aria-label={`关闭${content.title}`}><Cross2Icon /></button>
        <span>{content.label}</span>
        <h2>{content.title}</h2>
        <p>{content.intro}</p>
        {content.facts && <dl>{content.facts.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl>}
        {content.bullets && <ul>{content.bullets.map((item) => <li key={item}><CheckIcon />{item}</li>)}</ul>}
        {content.note && <aside><InfoCircledIcon /><p>{content.note}</p></aside>}
        <button type="button" onClick={() => dispatch({ type: "CLOSE_PROFILE_PANEL" })}>知道了</button>
      </section>
    </div>
  );
}

function ProfileLink({ icon: Icon, title, onClick }) {
  return <button type="button" onClick={onClick}><i><Icon /></i><span><strong>{title}</strong></span><ChevronRightIcon /></button>;
}

function ProfileScreen({ state, dispatch }) {
  const pattern = currentMealPattern(state);
  const stats = dishPoolStats(state);
  const open = (panel) => dispatch({ type: "OPEN_PROFILE_PANEL", panel });
  return (
    <div className={`mobile-page profile-screen ${state.profilePanel ? "sheet-open" : ""}`}>
      <section className="profile-card"><span><CalendarIcon /></span><div><small>家庭菜单</small><strong>我家的排好菜</strong></div></section>
      <div className="section-title"><strong>默认排菜规则</strong></div>
      <section className="rule-list"><div><span>家庭安排</span><strong>{weekdaySummary(state.household.dayIndexes)} · {state.household.meals.map((meal) => mealLabels[meal]).join("和")}</strong></div><div><span>每餐结构</span><strong>{pattern.meat} 荤 {pattern.veg} 素 {pattern.soup} 汤</strong></div><div><span>菜品库</span><strong>{stats.total} 道菜</strong></div></section>
      <div className="section-title"><strong>产品与支持</strong></div>
      <section className="profile-link-list"><ProfileLink icon={InfoCircledIcon} title="关于排好菜" onClick={() => open("about")} /><ProfileLink icon={EnvelopeClosedIcon} title="联系与反馈" onClick={() => open("contact")} /></section>
      <div className="section-title"><strong>隐私与协议</strong></div>
      <section className="profile-link-list"><ProfileLink icon={FileTextIcon} title="用户协议" onClick={() => open("terms")} /><ProfileLink icon={LockClosedIcon} title="隐私政策" onClick={() => open("privacy")} /><ProfileLink icon={ListBulletIcon} title="个人信息收集清单" onClick={() => open("collection")} /><ProfileLink icon={IdCardIcon} title="第三方共享清单" onClick={() => open("sharing")} /><ProfileLink icon={PersonIcon} title="个人信息与数据管理" onClick={() => open("data")} /></section>
      {state.profilePanel && <ProfileDetailSheet panel={state.profilePanel} dispatch={dispatch} />}
    </div>
  );
}

function PhoneApp({ state, dispatch }) {
  const historyPlan = state.menus[state.historyWeekIndex];
  const raiseToast = state.activeTab === "history" && historyPlan?.data && state.historyWeekIndex < weeks.length - 1;
  return (
    <PhoneFrame>
      {state.demoMode === "new" ? <OnboardingFlow state={state} dispatch={dispatch} /> : <><AppHeader state={state} dispatch={dispatch} />
        {state.activeTab === "schedule" && <ScheduleScreen state={state} dispatch={dispatch} />}
        {state.activeTab === "library" && <LibraryScreen state={state} dispatch={dispatch} />}
        {state.activeTab === "history" && <HistoryScreen state={state} dispatch={dispatch} />}
        {state.activeTab === "profile" && <ProfileScreen state={state} dispatch={dispatch} />}
        <BottomNavigation state={state} dispatch={dispatch} />
        {state.copyPrompt && <div className="dialog-backdrop"><section className="copy-dialog"><ArchiveIcon /><h2>复制整周菜单？</h2><p>{weekRange(state.copyPrompt.source, state.household.dayIndexes)} 将复制到 {weekRange(state.copyPrompt.target, state.household.dayIndexes)}，然后进入调整页。</p><div><button type="button" onClick={() => dispatch({ type: "CANCEL_COPY" })}>取消</button><button type="button" onClick={() => dispatch({ type: "CONFIRM_COPY" })}>确认复制</button></div></section></div>}
        {state.toast && <button key={state.toastVersion} className={`toast ${raiseToast ? "above-action-dock" : ""}`} type="button" onClick={() => dispatch({ type: "DISMISS_TOAST" })}><CheckIcon />{state.toast}</button>}</>}
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
      <div className="mock-boundary"><strong>本地 Mock 边界</strong><p>这一版只演示界面和状态联动，不请求真实后端；已完成用户刷新后会恢复家庭设置、菜品池和菜单记录。</p></div>
    </aside>
  );
}

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    if (state.demoMode === "new") return;
    try {
      window.localStorage.setItem(PROTOTYPE_PROFILE_KEY, JSON.stringify(serializePrototypeData(state)));
    } catch {
      // ponytail: persistence is best-effort in the local prototype; in-memory behavior remains fully usable.
    }
  }, [state.customPattern, state.customStarterDishes, state.demoMode, state.historyWeekIndex, state.household, state.manualDishes, state.mealPattern, state.menus, state.starterDishIds, state.weekIndex]);

  useEffect(() => {
    const locked = state.addingDish || Boolean(state.libraryDetailId) || Boolean(state.copyPrompt) || Boolean(state.profilePanel);
    if (!locked) return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [state.addingDish, state.copyPrompt, state.libraryDetailId, state.profilePanel]);

  useEffect(() => {
    if (!state.generating) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "GENERATE_DONE" }), 620);
    return () => window.clearTimeout(timer);
  }, [state.generating]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "DISMISS_TOAST" }), 2100);
    return () => window.clearTimeout(timer);
  }, [state.toast, state.toastVersion]);

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
