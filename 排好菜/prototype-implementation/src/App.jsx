import { useEffect, useMemo, useReducer } from "react";
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
  PersonIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  createInitialState,
  kindLabels,
  library,
  mealLabels,
  reducer,
  selectedDish,
  tabs,
  visibleLibrary,
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
  const state = createInitialState();
  const params = new URL(window.location.href).searchParams;
  const tab = params.get("tab");
  const screen = params.get("screen");
  const weekParam = params.get("week");
  const week = Number(weekParam);
  if (tabs.includes(tab)) state.activeTab = tab;
  if (["home", "edit", "swap", "review"].includes(screen)) state.screen = screen;
  if (weekParam !== null && Number.isInteger(week) && week >= 0 && week < weeks.length) state.weekIndex = week;
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

function WeekToolbar({ state, dispatch }) {
  const week = weeks[state.weekIndex];
  return (
    <div className="week-toolbar">
      <button type="button" aria-label="上一周" disabled={state.weekIndex === 0} onClick={() => dispatch({ type: "WEEK_MOVE", delta: -1 })}><ChevronLeftIcon /></button>
      <div><strong>{week.range}</strong><span>{week.short} · 周一至周五</span></div>
      <button type="button" aria-label="下一周" disabled={state.weekIndex === weeks.length - 1} onClick={() => dispatch({ type: "WEEK_MOVE", delta: 1 })}><ChevronRightIcon /></button>
    </div>
  );
}

function ScheduleHome({ state, dispatch }) {
  const weekState = state.menus[state.weekIndex];
  const isEmpty = weekState.status === "empty";
  const isSaved = weekState.status === "saved";
  return (
    <div className="mobile-page schedule-home">
      <WeekToolbar state={state} dispatch={dispatch} />
      <section className={`plan-state ${isSaved ? "saved" : ""}`}>
        <div><small>{isEmpty ? "本周还没有菜单" : isSaved ? "这一周已经安排好" : "菜单正在调整"}</small><strong>{isEmpty ? "10 餐待安排" : "5 天 · 10 餐 · 50 道菜"}</strong></div>
        <span>{isEmpty ? "待生成" : isSaved ? "已保存" : "草稿"}</span>
      </section>
      <section className="rule-card"><span>默认排菜规则</span><h2>五天十餐，一次排好</h2><p>每餐 2 荤 2 素 1 汤，只使用已确认菜品，同一主料尽量错开。</p><div><b>5 天</b><b>10 餐</b><b>50 道菜</b></div></section>
      <section className="ready-card"><MagicWandIcon /><div><strong>{isEmpty ? "菜品池已就绪" : "菜单数据会跨页保留"}</strong><p>{isEmpty ? "86 道已确认菜品，规则校验无遗漏。" : "换菜、保存和历史复制会共享同一份菜单。"}</p></div></section>
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
  const visibleIndexes = state.viewKind === "all" ? [0, 1, 2, 3, 4] : [0, 1];
  const selected = selectedDish(state);
  return (
    <div className="mobile-page menu-editor">
      <section className="menu-board">
        <header className="menu-board-head"><div><small>{weeks[state.weekIndex].range}</small><strong>五天十餐菜单</strong></div><div className="segmented"><button type="button" className={state.viewKind === "meat" ? "active" : ""} onClick={() => dispatch({ type: "SET_VIEW_KIND", value: "meat" })}>荤菜</button><button type="button" className={state.viewKind === "all" ? "active" : ""} onClick={() => dispatch({ type: "SET_VIEW_KIND", value: "all" })}>全部</button></div></header>
        <div className="menu-grid" style={{ "--dish-count": visibleIndexes.length }}>
          <div className="meal-axis" aria-hidden="true"><span /><b>午饭</b><b>晚饭</b></div>
          <div className="day-carousel" aria-label="左右滑动查看周一至周五">
            {menu.map((day, dayIndex) => <section className="day-column" key={day.day}><header><strong>{day.day}</strong><small>{weeks[state.weekIndex].dates[dayIndex]}</small></header>{Object.keys(mealLabels).map((meal) => <div className="meal-cells" key={meal}>{visibleIndexes.map((dishIndex) => { const selection = { dayIndex, meal, dishIndex }; const dish = getDish(menu, selection); const active = JSON.stringify(selection) === JSON.stringify(state.selection); return <button key={dishIndex} type="button" className={`${dish.kind} ${active ? "active" : ""}`} aria-pressed={active} onClick={() => dispatch({ type: "SELECT_DISH", selection })}>{dish.name}</button>; })}</div>)}</section>)}
          </div>
        </div>
      </section>
      <section className="selection-card"><div><small>当前选择 · {menu[state.selection.dayIndex].day}{mealLabels[state.selection.meal]} · {kindLabels[selected.kind]}</small><strong>{selected.name}</strong><p>只替换这一道，其他餐次保持不变。</p></div><div><button type="button" onClick={() => dispatch({ type: "OPEN_SWAP", mode: "smart" })}>换一道</button><button type="button" onClick={() => dispatch({ type: "OPEN_LIBRARY_PICK" })}>自己选</button></div></section>
      <div className="soft-warning"><ClockIcon /><span><strong>软规则提醒</strong>清蒸鲈鱼本周出现 2 次，可以保留，也可以选中后替换。</span></div>
      <div className="page-action sticky"><PrimaryButton onClick={() => dispatch({ type: "CONFIRM_MENU" })} icon={CheckIcon}>确认十餐菜单</PrimaryButton></div>
    </div>
  );
}

function SwapScreen({ state, dispatch }) {
  const current = selectedDish(state);
  const candidates = library.filter((dish) => dish.kind === current.kind && dish.name !== current.name).slice(0, 4);
  const chosen = candidates.some((dish) => dish.id === state.candidateId) ? state.candidateId : candidates[0]?.id;
  useEffect(() => {
    if (chosen && chosen !== state.candidateId) dispatch({ type: "SELECT_CANDIDATE", id: chosen });
  }, [chosen, dispatch, state.candidateId]);
  return (
    <div className="mobile-page swap-screen">
      <div className="swap-heading"><span>只换这一道</span><h2>{current.name}</h2><p>优先从同类菜中挑选，同时避开本周已使用的主料。</p></div>
      <div className="locked-week"><CheckIcon />其他 49 道菜保持不变</div>
      <div className="candidate-list">{candidates.map((dish) => <button key={dish.id} type="button" className={state.candidateId === dish.id ? "selected" : ""} onClick={() => dispatch({ type: "SELECT_CANDIDATE", id: dish.id })}><span className="radio">{state.candidateId === dish.id && <CheckIcon />}</span><span><strong>{dish.name}</strong><small>{kindLabels[dish.kind]} · 近 8 周 {dish.uses} 次 · {dish.note}</small></span></button>)}</div>
      <button className="browse-library" type="button" onClick={() => dispatch({ type: "OPEN_LIBRARY_PICK" })}><ArchiveIcon /><span><strong>在菜品库里自己选</strong><small>可按荤菜、素菜和汤羹筛选</small></span><ChevronRightIcon /></button>
      <div className="page-action sticky"><PrimaryButton onClick={() => dispatch({ type: "APPLY_CANDIDATE" })} icon={CheckIcon} disabled={!chosen}>保存这次替换</PrimaryButton></div>
    </div>
  );
}

function MealList({ menu, weekIndex }) {
  return <div className="meal-list">{menu.flatMap((day, dayIndex) => Object.keys(mealLabels).map((meal) => <article key={`${day.day}-${meal}`}><header><strong>{day.day} · {mealLabels[meal]}</strong><time>{weeks[weekIndex].dates[dayIndex]}</time></header><p>{day[meal].map((dish) => dish[0]).join("、")}</p></article>))}</div>;
}

function ReviewScreen({ state, dispatch }) {
  const menu = state.menus[state.weekIndex].data;
  return <div className="mobile-page review-screen"><section className="review-hero"><small>{weeks[state.weekIndex].range}</small><strong>五天十餐，准备保存</strong><p>共 50 道菜，已保留 1 条软规则提醒。</p></section><MealList menu={menu} weekIndex={state.weekIndex} /><div className="page-action sticky"><PrimaryButton tone="green" onClick={() => dispatch({ type: "SAVE_MENU" })} icon={CheckIcon}>保存本周菜单</PrimaryButton></div></div>;
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
  return (
    <div className="mobile-page library-screen">
      {state.pickingFromLibrary && <div className="picking-banner"><MixerHorizontalIcon /><span><strong>手选一道{kindLabels[selectedDish(state)?.kind]}</strong><small>选中后直接回到菜单，其他菜不变。</small></span></div>}
      <section className="library-summary"><small>已确认菜品</small><strong>86 道</strong><p>生成和换菜只会使用这个菜品池。</p><div><span><b>38</b>荤菜</span><span><b>32</b>素菜</span><span><b>16</b>汤羹</span></div></section>
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
  return (
    <div className="mobile-page history-screen">
      <section className="history-summary"><small>已保存菜单</small><strong>{savedWeeks.length} 周 · {savedWeeks.length * 10} 餐</strong><p>可展开查看完整菜单，也可复制到下一周再调整。</p></section>
      <div className="history-heading"><strong>按周查看</strong><span>点击卡片展开</span></div>
      <div className="history-list">{savedWeeks.map(({ range, short, weekIndex, plan }) => { const open = state.expandedHistory === weekIndex; return <article className={open ? "open" : ""} key={weekIndex}><button className="history-trigger" type="button" onClick={() => dispatch({ type: "TOGGLE_HISTORY", weekIndex })}><span><small>{short}已保存</small><strong>{range}</strong><p>10 餐 · 50 道菜</p></span><ChevronDownIcon /></button>{open && <div className="history-detail"><MealList menu={plan.data} weekIndex={weekIndex} /><div className="history-actions"><button type="button" onClick={() => dispatch({ type: "OPEN_WEEK", weekIndex })}>打开这周菜单</button><button type="button" onClick={() => dispatch({ type: "ASK_COPY", weekIndex })}>复制到下周</button></div></div>}</article>; })}</div>
      {savedWeeks.length === 0 && <div className="empty-result"><ClockIcon /><strong>还没有保存过菜单</strong><button type="button" onClick={() => dispatch({ type: "NAV_TAB", tab: "schedule" })}>去生成本周菜单</button></div>}
    </div>
  );
}

function ProfileScreen({ dispatch }) {
  return (
    <div className="mobile-page profile-screen">
      <section className="profile-card"><span><CalendarIcon /></span><div><small>家庭菜单工作台</small><strong>桃子家的排好菜</strong><p>工程原型 · 本地演示数据</p></div></section>
      <div className="section-title"><strong>默认排菜规则</strong><span>生成时自动应用</span></div>
      <section className="rule-list"><div><span>排菜周期</span><strong>周一至周五</strong></div><div><span>餐次</span><strong>午饭和晚饭</strong></div><div><span>每餐结构</span><strong>2 荤 2 素 1 汤</strong></div><div><span>避重规则</span><strong>近 5 天主料尽量不重复</strong></div><div><span>菜品来源</span><strong>86 道已确认菜品</strong></div></section>
      <section className="scope-note"><strong>第一阶段原型边界</strong><p>支持生成、逐道换菜、手选、保存、菜品库筛选和历史复用。不包含登录、云同步和采购清单。</p></section>
      <button className="reset-button" type="button" onClick={() => dispatch({ type: "RESET" })}><ReloadIcon />重置全部演示数据</button>
    </div>
  );
}

function PhoneApp({ state, dispatch }) {
  return (
    <PhoneFrame>
      <AppHeader state={state} dispatch={dispatch} />
      {state.activeTab === "schedule" && <ScheduleScreen state={state} dispatch={dispatch} />}
      {state.activeTab === "library" && <LibraryScreen state={state} dispatch={dispatch} />}
      {state.activeTab === "history" && <HistoryScreen state={state} dispatch={dispatch} />}
      {state.activeTab === "profile" && <ProfileScreen dispatch={dispatch} />}
      <BottomNavigation state={state} dispatch={dispatch} />
      {state.copyPrompt && <div className="dialog-backdrop"><section className="copy-dialog"><ArchiveIcon /><h2>复制整周菜单？</h2><p>{weeks[state.copyPrompt.source].range} 将复制到 {weeks[state.copyPrompt.target].range}，然后进入调整页。</p><div><button type="button" onClick={() => dispatch({ type: "CANCEL_COPY" })}>取消</button><button type="button" onClick={() => dispatch({ type: "CONFIRM_COPY" })}>确认复制</button></div></section></div>}
      {state.toast && <button className="toast" type="button" onClick={() => dispatch({ type: "DISMISS_TOAST" })}><CheckIcon />{state.toast}</button>}
    </PhoneFrame>
  );
}

function DevInspector({ state, dispatch }) {
  const lifecycle = state.menus[state.weekIndex].status;
  const dish = selectedDish(state);
  return (
    <aside className="dev-inspector">
      <header><div><span>Live state</span><h2>当前工程状态</h2></div><i /> </header>
      <dl><div><dt>当前入口</dt><dd>{tabMeta[state.activeTab].label}</dd></div><div><dt>演示周</dt><dd>{weeks[state.weekIndex].short} · {weeks[state.weekIndex].range}</dd></div><div><dt>WeekPlan</dt><dd><code>{lifecycle}</code></dd></div><div><dt>当前选菜</dt><dd>{dish?.name || "尚未生成"}</dd></div></dl>
      <section><strong>最近操作</strong><ol>{state.log.map((item, index) => <li key={`${item}-${index}`}><span>{index + 1}</span>{item}</li>)}</ol></section>
      <div className="mock-boundary"><strong>本地 Mock 边界</strong><p>这一版只演示界面和状态联动，不请求真实后端，刷新即恢复初始数据。</p></div>
      <button className="inspector-reset" type="button" onClick={() => dispatch({ type: "RESET" })}><ReloadIcon />重置演示</button>
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
    window.history.replaceState({}, "", url);
  }, [state.activeTab, state.screen, state.weekIndex]);

  const progress = useMemo(() => {
    const status = state.menus[state.weekIndex].status;
    if (state.activeTab !== "schedule") return tabMeta[state.activeTab].label;
    if (status === "empty") return "待生成";
    if (state.screen === "review") return "待保存";
    return status === "saved" ? "已保存" : "调整中";
  }, [state]);

  return (
    <>
      <header className="workspace-toolbar">
        <a className="back-link" href="../"><ArrowLeftIcon />项目入口</a>
        <nav aria-label="工程原型视图"><span className="active">运行原型</span><a href="./page-map.html">页面地图</a><a href="./engineering-model.html">实现说明</a></nav>
        <a className="customer-link" href="../prototype-customer/?step=generate">客户原型<ChevronRightIcon /></a>
      </header>
      <main className="engineering-workspace">
        <section className="workspace-intro"><span>Executable prototype · V0.1</span><h1>不看说明，<br />直接把菜单走一遍。</h1><p>这里是团队的可运行实现参照。四个底部入口、周切换、换菜、保存和历史复用共享同一份演示数据。</p><div className="progress-card"><small>当前演示</small><strong>{weeks[state.weekIndex].short} · {progress}</strong><span>{state.activeTab === "schedule" ? "可从上一周菜单复制，或直接生成本周。" : `正在查看${tabMeta[state.activeTab].label}。`}</span></div><div className="scope-pills"><span>本地 Mock</span><span>5 天 × 2 餐</span><span>2 荤 2 素 1 汤</span></div></section>
        <section className="phone-zone" aria-label="可运行的排好菜小程序工程原型"><PhoneApp state={state} dispatch={dispatch} /></section>
        <DevInspector state={state} dispatch={dispatch} />
      </main>
    </>
  );
}
