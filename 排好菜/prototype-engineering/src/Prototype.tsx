import { useMemo, useState, type CSSProperties } from "react";
import {
  ArchiveIcon,
  CalendarIcon,
  CheckCircledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DotsHorizontalIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, MobileScroll } from "./mobile";

type DishKind = "meat" | "veg" | "soup";
type MealKey = "lunch" | "dinner";
type Screen = "generate" | "edit" | "overview";
type PrimaryTab = "menu" | "library" | "history" | "profile";
type Dish = { name: string; kind: DishKind };
type DayMenu = { day: string; date: string; lunch: Dish[]; dinner: Dish[] };
type LibraryDish = Dish & { lastUsed: string; uses: number };

const WEEK_MENU: DayMenu[] = [
  {
    day: "周一",
    date: "9月7日",
    lunch: [
      { name: "土豆烧牛肉", kind: "meat" }, { name: "白切鸡", kind: "meat" },
      { name: "蒜蓉菜心", kind: "veg" }, { name: "清炒西兰花", kind: "veg" },
      { name: "冬瓜虾皮汤", kind: "soup" },
    ],
    dinner: [
      { name: "梅菜扣肉", kind: "meat" }, { name: "清蒸鲈鱼", kind: "meat" },
      { name: "荷塘小炒", kind: "veg" }, { name: "手撕包菜", kind: "veg" },
      { name: "玉米排骨汤", kind: "soup" },
    ],
  },
  {
    day: "周二",
    date: "9月8日",
    lunch: [
      { name: "红烧排骨", kind: "meat" }, { name: "番茄炒蛋", kind: "meat" },
      { name: "清炒油麦菜", kind: "veg" }, { name: "香菇青菜", kind: "veg" },
      { name: "海带豆腐汤", kind: "soup" },
    ],
    dinner: [
      { name: "红烧牛腩", kind: "meat" }, { name: "清蒸鲈鱼", kind: "meat" },
      { name: "蒜蓉时蔬", kind: "veg" }, { name: "手撕包菜", kind: "veg" },
      { name: "番茄蛋汤", kind: "soup" },
    ],
  },
  {
    day: "周三",
    date: "9月9日",
    lunch: [
      { name: "香菇滑鸡", kind: "meat" }, { name: "萝卜炖肉", kind: "meat" },
      { name: "清炒菠菜", kind: "veg" }, { name: "酸辣土豆丝", kind: "veg" },
      { name: "菌菇汤", kind: "soup" },
    ],
    dinner: [
      { name: "糖醋排骨", kind: "meat" }, { name: "芹菜炒肉", kind: "meat" },
      { name: "蚝油生菜", kind: "veg" }, { name: "家常茄子", kind: "veg" },
      { name: "紫菜蛋花汤", kind: "soup" },
    ],
  },
  {
    day: "周四",
    date: "9月10日",
    lunch: [
      { name: "啤酒鸭", kind: "meat" }, { name: "豆角炒肉", kind: "meat" },
      { name: "蒜蓉空心菜", kind: "veg" }, { name: "清炒藕片", kind: "veg" },
      { name: "萝卜汤", kind: "soup" },
    ],
    dinner: [
      { name: "清炖狮子头", kind: "meat" }, { name: "豉汁蒸鱼", kind: "meat" },
      { name: "小炒杏鲍菇", kind: "veg" }, { name: "上汤娃娃菜", kind: "veg" },
      { name: "丝瓜蛋汤", kind: "soup" },
    ],
  },
  {
    day: "周五",
    date: "9月11日",
    lunch: [
      { name: "板栗烧鸡", kind: "meat" }, { name: "木须肉", kind: "meat" },
      { name: "清炒小白菜", kind: "veg" }, { name: "麻婆豆腐", kind: "veg" },
      { name: "莲藕排骨汤", kind: "soup" },
    ],
    dinner: [
      { name: "土豆焖鸭", kind: "meat" }, { name: "红烧带鱼", kind: "meat" },
      { name: "蒜蓉西兰花", kind: "veg" }, { name: "干煸四季豆", kind: "veg" },
      { name: "冬瓜肉丸汤", kind: "soup" },
    ],
  },
];

const CANDIDATES: Record<DishKind, string[]> = {
  meat: ["萝卜焖牛腩", "香菇蒸鸡", "豉汁排骨", "家常豆腐煲", "姜葱蒸鱼"],
  veg: ["白灼生菜", "蒜蓉油麦菜", "清炒藕片", "香菇青菜", "上汤娃娃菜"],
  soup: ["玉米胡萝卜汤", "山药排骨汤", "丝瓜豆腐汤", "菌菇汤", "紫菜蛋花汤"],
};

const KIND_LABEL: Record<DishKind, string> = { meat: "荤菜", veg: "素菜", soup: "汤" };
const MEALS: { key: MealKey; label: string }[] = [
  { key: "lunch", label: "午饭" },
  { key: "dinner", label: "晚饭" },
];

const LIBRARY_DISHES: LibraryDish[] = [
  { name: "土豆烧牛肉", kind: "meat", lastUsed: "本周一", uses: 8 },
  { name: "红烧排骨", kind: "meat", lastUsed: "本周二", uses: 7 },
  { name: "香菇滑鸡", kind: "meat", lastUsed: "本周三", uses: 6 },
  { name: "白切鸡", kind: "meat", lastUsed: "本周一", uses: 5 },
  { name: "清炒西兰花", kind: "veg", lastUsed: "上周五", uses: 9 },
  { name: "蒜蓉菜心", kind: "veg", lastUsed: "本周一", uses: 8 },
  { name: "上汤娃娃菜", kind: "veg", lastUsed: "上周四", uses: 6 },
  { name: "荷塘小炒", kind: "veg", lastUsed: "本周一", uses: 5 },
  { name: "玉米排骨汤", kind: "soup", lastUsed: "本周一", uses: 7 },
  { name: "紫菜蛋花汤", kind: "soup", lastUsed: "本周三", uses: 6 },
  { name: "菌菇汤", kind: "soup", lastUsed: "本周三", uses: 5 },
  { name: "海带豆腐汤", kind: "soup", lastUsed: "本周二", uses: 4 },
];

const HISTORY_PLANS = [
  { id: "current", week: "9月7日—9月11日", status: "本周已保存", meals: "10 餐 · 50 道菜", sample: "土豆烧牛肉、白切鸡、蒜蓉菜心、冬瓜虾皮汤" },
  { id: "previous", week: "8月31日—9月4日", status: "已完成", meals: "10 餐 · 50 道菜", sample: "萝卜焖牛腩、清蒸鲈鱼、香菇青菜、玉米排骨汤" },
  { id: "older", week: "8月24日—8月28日", status: "已完成", meals: "10 餐 · 50 道菜", sample: "梅菜扣肉、香菇蒸鸡、清炒藕片、紫菜蛋花汤" },
];

function dishKey(dayIndex: number, meal: MealKey, dishIndex: number) {
  return `${dayIndex}-${meal}-${dishIndex}`;
}

function initialScreen(): Screen {
  const step = new URLSearchParams(window.location.search).get("step");
  return step === "edit" || step === "overview" ? step : "generate";
}

function initialTab(): PrimaryTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return tab === "library" || tab === "history" || tab === "profile" ? tab : "menu";
}

function savedOverrides() {
  try {
    return JSON.parse(window.sessionStorage.getItem("paihaocai-overrides") ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function Header({ tab, screen, onBack }: { tab: PrimaryTab; screen: Screen; onBack: () => void }) {
  const title = tab === "library" ? "菜品库" : tab === "history" ? "菜单历史" : tab === "profile" ? "我的" : screen === "generate" ? "本周菜单" : screen === "edit" ? "修改菜单" : "本周菜单总览";
  const canGoBack = tab === "menu" && screen !== "generate";
  return (
    <header className="app-header">
      <div className="header-side">
        {!canGoBack ? <span className="header-placeholder" /> : (
          <button className="icon-button" type="button" aria-label="返回上一步" onClick={onBack}>
            <ChevronLeftIcon />
          </button>
        )}
      </div>
      <strong>{title}</strong>
      <button className="mini-capsule" type="button" aria-label="更多选项"><DotsHorizontalIcon /></button>
    </header>
  );
}

function BottomNav({ active, onNavigate }: { active: PrimaryTab; onNavigate: (tab: PrimaryTab) => void }) {
  const items: { id: PrimaryTab; label: string; icon: typeof CalendarIcon }[] = [
    { id: "menu", label: "排菜单", icon: CalendarIcon },
    { id: "library", label: "菜品库", icon: ArchiveIcon },
    { id: "history", label: "历史", icon: ClockIcon },
    { id: "profile", label: "我的", icon: PersonIcon },
  ];
  return (
    <nav className="bottom-nav" aria-label="排好菜主导航">
      {items.map(({ id, label, icon: Icon }) => (
        <button className={active === id ? "active" : ""} type="button" key={id} onClick={() => onNavigate(id)} aria-current={active === id ? "page" : undefined}>
          <Icon /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function WeekToolbar() {
  return (
    <div className="week-toolbar">
      <button type="button" aria-label="上一周"><ChevronLeftIcon /></button>
      <div><strong>9月7日—9月11日</strong><span>周一至周五 · 午餐和晚餐</span></div>
      <button type="button" aria-label="下一周"><ChevronRightIcon /></button>
    </div>
  );
}

export default function Prototype() {
  const activeTab = initialTab();
  const screen = initialScreen();
  const [filter, setFilter] = useState<"meat" | "all">("meat");
  const [libraryFilter, setLibraryFilter] = useState<DishKind | "all">("all");
  const [openHistoryId, setOpenHistoryId] = useState("current");
  const [selectedKey, setSelectedKey] = useState("0-lunch-0");
  const [overrides, setOverrides] = useState<Record<string, string>>(savedOverrides);
  const [manualOpen, setManualOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [swapNote, setSwapNote] = useState("系统会优先避开本周已用主料");

  const [selectedDayIndex, selectedMeal, selectedDishIndex] = selectedKey.split("-") as [string, MealKey, string];
  const baseDish = WEEK_MENU[Number(selectedDayIndex)][selectedMeal][Number(selectedDishIndex)];
  const selectedDish = { ...baseDish, name: overrides[selectedKey] ?? baseDish.name };
  const visibleIndexes = filter === "meat" ? [0, 1] : [0, 1, 2, 3, 4];

  const resolvedMenu = useMemo(() => WEEK_MENU.map((day, dayIndex) => ({
    ...day,
    lunch: day.lunch.map((dish, dishIndex) => ({ ...dish, name: overrides[dishKey(dayIndex, "lunch", dishIndex)] ?? dish.name })),
    dinner: day.dinner.map((dish, dishIndex) => ({ ...dish, name: overrides[dishKey(dayIndex, "dinner", dishIndex)] ?? dish.name })),
  })), [overrides]);

  const navigate = (next: Screen) => {
    if (next === "generate") window.sessionStorage.removeItem("paihaocai-overrides");
    else window.sessionStorage.setItem("paihaocai-overrides", JSON.stringify(overrides));
    const url = new URL(window.location.href);
    url.searchParams.set("step", next);
    window.location.assign(url);
  };
  const goBack = () => navigate(screen === "overview" ? "edit" : "generate");
  const chooseDish = (dayIndex: number, meal: MealKey, dishIndex: number) => {
    setSelectedKey(dishKey(dayIndex, meal, dishIndex));
    setSwapNote("系统会优先避开本周已用主料");
  };
  const replaceDish = (name: string, source: "smart" | "manual") => {
    setOverrides((current) => ({ ...current, [selectedKey]: name }));
    setSwapNote(source === "smart" ? "已智能换菜，并重新检查近期重复" : "已按你的选择换菜");
    setManualOpen(false);
  };
  const smartSwap = () => {
    const choices = CANDIDATES[selectedDish.kind];
    const currentIndex = choices.indexOf(selectedDish.name);
    replaceDish(choices[(currentIndex + 1) % choices.length], "smart");
  };
  const navigateTab = (next: PrimaryTab) => {
    const url = new URL(window.location.href);
    if (next === "menu") {
      url.searchParams.delete("tab");
      url.searchParams.set("step", "generate");
    } else {
      url.searchParams.set("tab", next);
      url.searchParams.delete("step");
    }
    window.location.assign(url);
  };
  const visibleLibraryDishes = libraryFilter === "all" ? LIBRARY_DISHES : LIBRARY_DISHES.filter((dish) => dish.kind === libraryFilter);

  return (
    <div className="pai-app" data-screen={screen} data-tab={activeTab}>
      <Header tab={activeTab} screen={screen} onBack={goBack} />
      <MobileScroll key={`${activeTab}-${screen}`} className="pai-scroll">
        <main className="screen-content" aria-live="polite">
          {activeTab === "menu" && screen === "generate" && (
            <section className="generate-screen" data-testid="generate-screen">
              <WeekToolbar />
              <div className="plan-state"><div><span>本周还没有菜单</span><strong>10 餐待安排</strong></div><b>准备中</b></div>
              <section className="rule-card">
                <span className="section-kicker">默认排菜规则</span>
                <h2>五天十餐，一次排好</h2>
                <p>每餐 2 荤 2 素 1 汤，只使用已确认的菜品，并尽量避开近期重复。</p>
                <div className="rule-pills"><span>5 天</span><span>10 餐</span><span>50 道菜</span></div>
              </section>
              <section className="ready-card">
                <div className="ready-icon"><MagicWandIcon /></div>
                <div><strong>菜品池已就绪</strong><p>共 86 道常做菜，规则检查无阻塞项。</p></div>
              </section>
              <button className="primary-button" type="button" onClick={() => navigate("edit")}>
                生成本周菜单 <ChevronRightIcon />
              </button>
              <p className="button-hint">生成后仍可逐道修改，再确认保存。</p>
            </section>
          )}

          {activeTab === "menu" && screen === "edit" && (
            <section className="edit-screen" data-testid="edit-screen">
              <div className="menu-title-row">
                <div><span>9月7日—11日</span><strong>五天十餐菜单</strong></div>
                <div className="filter-wrap"><MixerHorizontalIcon /><button className={filter === "meat" ? "active" : ""} onClick={() => setFilter("meat")} type="button">荤菜</button><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button">全部</button></div>
              </div>
              <p className="swipe-hint">首屏比较三天，左右滑动查看更多日期</p>
              <div className="menu-grid">
                <div className="meal-axis" aria-hidden="true">
                  <span className="axis-head" />
                  <span style={{ "--dish-rows": visibleIndexes.length } as CSSProperties}>午饭</span>
                  <span style={{ "--dish-rows": visibleIndexes.length } as CSSProperties}>晚饭</span>
                </div>
                <Carousel ariaLabel="本周菜单，左右滑动查看更多日期" className="day-carousel" contentClassName="day-carousel-track">
                  {resolvedMenu.map((day, dayIndex) => (
                    <article className="day-card" key={day.day}>
                      <header><strong>{day.day}</strong><small>{day.date}</small></header>
                      {MEALS.map(({ key: meal }) => (
                        <div className="meal-dishes" key={meal}>
                          {visibleIndexes.map((dishIndex) => {
                            const dish = day[meal][dishIndex];
                            const key = dishKey(dayIndex, meal, dishIndex);
                            return (
                              <button
                                type="button"
                                className={`dish-button ${dish.kind} ${selectedKey === key ? "selected" : ""}`}
                                key={key}
                                onClick={() => chooseDish(dayIndex, meal, dishIndex)}
                                aria-pressed={selectedKey === key}
                              >{dish.name}</button>
                            );
                          })}
                        </div>
                      ))}
                    </article>
                  ))}
                </Carousel>
              </div>
              <section className="selected-dish-card">
                <div className="selected-copy">
                  <span>当前选择 · {WEEK_MENU[Number(selectedDayIndex)].day}{selectedMeal === "lunch" ? "午饭" : "晚饭"} · {KIND_LABEL[selectedDish.kind]}</span>
                  <strong>{selectedDish.name}</strong>
                  <small>{swapNote}</small>
                </div>
                <div className="swap-actions">
                  <button type="button" onClick={smartSwap}><MagicWandIcon />换一道</button>
                  <button type="button" onClick={() => setManualOpen(true)}>自己挑</button>
                </div>
              </section>
              <div className="soft-warning"><span>软规则提醒</span><p>清蒸鲈鱼本周出现 2 次。可以保留，也可以点菜名替换。</p></div>
              <button className="primary-button" type="button" onClick={() => navigate("overview")}>
                确认十餐菜单 <CheckCircledIcon />
              </button>
            </section>
          )}

          {activeTab === "menu" && screen === "overview" && (
            <section className="overview-screen" data-testid="overview-screen">
              <WeekToolbar />
              <section className="confirmed-card">
                <CheckCircledIcon />
                <div><span>本周菜单已确认</span><strong>5 天 · 10 餐</strong><p>每餐 2 荤 2 素 1 汤，下面是最终安排。</p></div>
              </section>
              <div className="overview-list">
                {resolvedMenu.flatMap((day) => MEALS.map(({ key, label }) => (
                  <article className="overview-meal" key={`${day.day}-${key}`}>
                    <header><strong>{day.day} · {label}</strong><span>{day.date}</span></header>
                    <p>{day[key].map((dish) => dish.name).join("、")}</p>
                  </article>
                )))}
              </div>
              <button className={`primary-button ${saved ? "saved" : ""}`} type="button" onClick={() => setSaved(true)}>
                {saved ? <><CheckCircledIcon /> 已保存本周菜单</> : <>保存本周菜单 <ChevronRightIcon /></>}
              </button>
              {saved && <p className="success-note">菜单已进入历史记录，后续可复制到下一周。</p>}
            </section>
          )}

          {activeTab === "library" && (
            <section className="library-screen" data-testid="library-screen">
              <section className="library-summary">
                <div><span>已确认菜品</span><strong>86 道</strong><p>生成菜单只会从这里选菜。</p></div>
                <CheckCircledIcon />
              </section>
              <div className="library-counts" aria-label="菜品分类统计"><span><b>38</b>荤菜</span><span><b>32</b>素菜</span><span><b>16</b>汤羹</span></div>
              <div className="section-heading"><div><span>常做菜</span><strong>菜品池</strong></div><small>按分类查看</small></div>
              <div className="library-filters" aria-label="筛选菜品库">
                {(["all", "meat", "veg", "soup"] as const).map((kind) => (
                  <button className={libraryFilter === kind ? "active" : ""} type="button" key={kind} onClick={() => setLibraryFilter(kind)} aria-pressed={libraryFilter === kind}>
                    {kind === "all" ? "全部" : KIND_LABEL[kind]}
                  </button>
                ))}
              </div>
              <div className="library-grid">
                {visibleLibraryDishes.map((dish) => (
                  <article className={`library-dish ${dish.kind}`} key={dish.name}>
                    <div className="library-dish-head"><span>{KIND_LABEL[dish.kind]}</span><b>近 8 周 {dish.uses} 次</b></div>
                    <strong>{dish.name}</strong><small>最近使用：{dish.lastUsed}</small>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === "history" && (
            <section className="history-screen" data-testid="history-screen">
              <section className="history-summary"><ClockIcon /><div><span>已保存菜单</span><strong>3 周 · 30 餐</strong><p>可回看过去的搭配，避免近期重复。</p></div></section>
              <div className="section-heading"><div><span>最近记录</span><strong>按周查看</strong></div><small>点击展开菜单摘要</small></div>
              <div className="history-list">
                {HISTORY_PLANS.map((plan) => {
                  const open = openHistoryId === plan.id;
                  return (
                    <article className={`history-card ${open ? "open" : ""}`} key={plan.id}>
                      <button type="button" onClick={() => setOpenHistoryId(open ? "" : plan.id)} aria-expanded={open}>
                        <span><small>{plan.status}</small><strong>{plan.week}</strong><b>{plan.meals}</b></span>
                        <ChevronRightIcon />
                      </button>
                      {open && <div className="history-detail"><span>首餐示例</span><p>{plan.sample}</p><small>菜单已确认，可作为下一周排菜参考。</small></div>}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === "profile" && (
            <section className="profile-screen" data-testid="profile-screen">
              <section className="profile-card"><div className="profile-mark"><PersonIcon /></div><div><span>排好菜</span><strong>桃子的菜单工作台</strong><p>工程原型 · 本地演示数据</p></div></section>
              <div className="section-heading"><div><span>当前设置</span><strong>默认排菜规则</strong></div><small>生成时自动应用</small></div>
              <section className="settings-card">
                <div><span>排菜周期</span><strong>周一至周五 · 午饭和晚饭</strong></div>
                <div><span>每餐结构</span><strong>2 荤 2 素 1 汤</strong></div>
                <div><span>避重规则</span><strong>近期 5 天主料尽量不重复</strong></div>
                <div><span>菜品来源</span><strong>仅使用 86 道已确认菜品</strong></div>
              </section>
              <section className="prototype-note"><MagicWandIcon /><div><strong>这版原型演示什么</strong><p>生成、逐道换菜、确认保存、菜品库筛选和历史回看；暂不连接账号、云端数据和真实通知。</p></div></section>
            </section>
          )}
        </main>
      </MobileScroll>
      <BottomNav active={activeTab} onNavigate={navigateTab} />

      <BottomSheet open={activeTab === "menu" && manualOpen} onOpenChange={setManualOpen} title={`替换「${selectedDish.name}」`} description={`只显示${KIND_LABEL[selectedDish.kind]}候选，选择后会重新检查规则。`}>
        <div className="candidate-list">
          {CANDIDATES[selectedDish.kind].filter((name) => name !== selectedDish.name).map((name) => (
            <button type="button" key={name} onClick={() => replaceDish(name, "manual")}>
              <span><strong>{name}</strong><small>{KIND_LABEL[selectedDish.kind]} · 近期未使用</small></span>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
