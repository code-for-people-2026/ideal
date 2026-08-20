import { useEffect, useMemo, useState } from "react";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DotsHorizontalIcon,
  LockClosedIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";

const steps = ["generate", "menu", "swap", "overview", "saved"];

const stepCopy = {
  generate: {
    label: "生成菜单",
    kicker: "核心任务 · 01",
    title: "五天十餐，\n先把这一周排顺。",
    lead: "不用每天临时想下一顿吃什么。排好菜把周一到周五的午饭和晚饭一次放进同一张周菜单，再留给你慢慢调整。",
    action: "生成五天十餐",
    proofs: [
      [CalendarIcon, "工作日午饭和晚饭一次生成，共十个餐次"],
      [ArchiveIcon, "只从自己的菜品库里组合，不凭空塞陌生菜"],
      [MagicWandIcon, "餐标、主料避重和近期重复规则自动检查"],
    ],
  },
  menu: {
    label: "修改菜单",
    kicker: "查看结果 · 02",
    title: "午饭晚饭放一起，\n三天对照着更好改。",
    lead: "每一天是一列，午饭和晚饭上下分开；首屏可以同时比较三天。先看荤菜分布，再切到全部菜品，不合适的那一道直接点出来。",
    action: "挑一道试着换",
    proofs: [
      [CalendarIcon, "同一张表横向查看周一到周五"],
      [MixerHorizontalIcon, "荤菜和全部菜品可以随时切换"],
      [CheckIcon, "只修改选中的一道，不重排整周"],
    ],
  },
  swap: {
    label: "替换一道",
    kicker: "单点调整 · 03",
    title: "只换这一道，\n不用推翻一整周。",
    lead: "排好菜先给出同类候选，并说明近期是否用过。你选中的结果会立刻回到这一周菜单里，其余九个餐次保持不变。",
    action: "保存这次替换",
    proofs: [
      [MixerHorizontalIcon, "候选菜保持同一餐标位置"],
      [ClockIcon, "近期用过的菜会明确提示"],
      [LockClosedIcon, "其他餐次锁住，不跟着重新生成"],
    ],
  },
  overview: {
    label: "菜单总览",
    kicker: "确认结果 · 04",
    title: "十顿饭确认完，\n一周吃什么一眼看清。",
    lead: "确认页只展示最终结果：五天、十个餐次、每餐五道菜。家里可以按天查看，临时变化仍然回到对应餐次单独调整。",
    action: "确认并保存本周菜单",
    proofs: [
      [CalendarIcon, "周一到周五午晚餐使用同一份最终数据"],
      [LockClosedIcon, "确认结果只读，避免误触换菜"],
      [ReloadIcon, "需要变化时仍可回到具体餐次修改"],
    ],
  },
  saved: {
    label: "保存菜单",
    kicker: "长期价值 · 05",
    title: "这周保存好，\n下次不用再从空白开始。",
    lead: "本周菜单进入历史记录。下次可以复制上一周，再根据季节、库存或临时安排换几道，比重新排一遍更省心。",
    action: "重新体验一遍",
    proofs: [
      [CheckIcon, "五天十餐已经保存到本周历史"],
      [ArchiveIcon, "以后可以复制整周再做少量调整"],
      [CalendarIcon, "菜品库、历史和本周菜单保持关联"],
    ],
  },
};

const weekRanges = [
  { range: "8月31日—9月4日", detail: "上一周" },
  { range: "9月7日—9月11日", detail: "周一至周五 · 午饭和晚饭" },
  { range: "9月14日—9月18日", detail: "下一周" },
];

const weekMenu = [
  {
    day: "周一", date: "9/7",
    lunch: [["土豆烧牛肉", "meat"], ["白切鸡", "meat"], ["蒜蓉菜心", "veg"], ["清炒西兰花", "veg"], ["冬瓜虾皮汤", "soup"]],
    dinner: [["梅菜扣肉", "meat"], ["清蒸鲈鱼", "meat"], ["荷塘小炒", "veg"], ["手撕包菜", "veg"], ["玉米排骨汤", "soup"]],
  },
  {
    day: "周二", date: "9/8",
    lunch: [["红烧排骨", "meat"], ["番茄炒蛋", "meat"], ["清炒油麦菜", "veg"], ["香菇青菜", "veg"], ["海带豆腐汤", "soup"]],
    dinner: [["红烧牛腩", "meat"], ["冬菇蒸肉饼", "meat"], ["蒜蓉时蔬", "veg"], ["清炒芦笋", "veg"], ["番茄蛋汤", "soup"]],
  },
  {
    day: "周三", date: "9/9",
    lunch: [["香菇滑鸡", "meat"], ["萝卜炖肉", "meat"], ["清炒菠菜", "veg"], ["酸辣土豆丝", "veg"], ["菌菇汤", "soup"]],
    dinner: [["糖醋排骨", "meat"], ["芹菜炒肉", "meat"], ["蚝油生菜", "veg"], ["家常茄子", "veg"], ["紫菜蛋花汤", "soup"]],
  },
  {
    day: "周四", date: "9/10",
    lunch: [["啤酒鸭", "meat"], ["豆角炒肉", "meat"], ["蒜蓉空心菜", "veg"], ["清炒藕片", "veg"], ["萝卜汤", "soup"]],
    dinner: [["清炖狮子头", "meat"], ["豉汁蒸鱼", "meat"], ["小炒杏鲍菇", "veg"], ["上汤娃娃菜", "veg"], ["丝瓜蛋汤", "soup"]],
  },
  {
    day: "周五", date: "9/11",
    lunch: [["板栗烧鸡", "meat"], ["木须肉", "meat"], ["清炒小白菜", "veg"], ["麻婆豆腐", "veg"], ["莲藕排骨汤", "soup"]],
    dinner: [["土豆焖鸭", "meat"], ["红烧带鱼", "meat"], ["蒜蓉西兰花", "veg"], ["干煸四季豆", "veg"], ["冬瓜肉丸汤", "soup"]],
  },
];

const candidates = {
  meat: ["萝卜焖牛腩", "香菇蒸鸡", "豉汁排骨", "姜葱蒸鱼"],
  veg: ["白灼生菜", "蒜蓉油麦菜", "清炒藕片", "上汤娃娃菜"],
  soup: ["玉米胡萝卜汤", "山药排骨汤", "丝瓜豆腐汤", "紫菜蛋花汤"],
};

const mealLabels = { lunch: "午饭", dinner: "晚饭" };
const kindLabels = { meat: "荤菜", veg: "素菜", soup: "汤" };

function initialStep() {
  const step = new URL(window.location.href).searchParams.get("step");
  return steps.includes(step) ? step : "generate";
}

function dishKey(selection) {
  return `${selection.dayIndex}-${selection.meal}-${selection.dishIndex}`;
}

function StatusBar() {
  return (
    <div className="status-bar" aria-label="手机状态栏">
      <strong>9:41</strong>
      <img src={`${import.meta.env.BASE_URL}assets/status/ios-status-icons.svg`} alt="" />
    </div>
  );
}

function PhoneFrame({ step, detailOpen = false, onBack, children }) {
  const titles = { generate: "本周菜单", menu: "修改菜单", swap: "替换菜品", overview: "本周菜单总览", saved: "菜单历史" };
  return (
    <div className="device-stage">
      <div className="device-canvas">
        <div className="device-screen">
          <StatusBar />
          <header className="app-bar">
            <button className="icon-button" type="button" onClick={onBack} aria-label="返回上一步" disabled={step === "generate"}><ChevronLeftIcon /></button>
            <strong>{step === "saved" && detailOpen ? "本周菜单总览" : titles[step]}</strong>
            <div className="capsule-button" aria-hidden="true"><DotsHorizontalIcon /></div>
          </header>
          {children}
        </div>
        <img className="device-bezel" src={`${import.meta.env.BASE_URL}assets/iphone/Bezel.png`} alt="" />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon = ArrowRightIcon }) {
  return <button className="primary-button" type="button" onClick={onClick}><span>{children}</span><Icon /></button>;
}

function GenerateScreen({ weekIndex, setWeekIndex, onNext }) {
  const week = weekRanges[weekIndex];
  return (
    <div className="mobile-page generate-screen">
      <div className="week-toolbar">
        <button type="button" aria-label="上一周" disabled={weekIndex === 0} onClick={() => setWeekIndex((value) => Math.max(0, value - 1))}><ChevronLeftIcon /></button>
        <div><strong>{week.range}</strong><span>{week.detail}</span></div>
        <button type="button" aria-label="下一周" disabled={weekIndex === weekRanges.length - 1} onClick={() => setWeekIndex((value) => Math.min(weekRanges.length - 1, value + 1))}><ChevronRightIcon /></button>
      </div>
      <section className="plan-state"><strong>本周还没有菜单</strong><span>10 餐待安排</span></section>
      <section className="menu-rule"><b>按家里的常用方式排</b><p>工作日午晚餐一次生成 · 每餐 2 荤 2 素 1 汤 · 同一主料尽量错开</p></section>
      <section className="generation-ready"><span>准备就绪</span><h2>一次排好五天午晚餐</h2><p>生成后十个餐次按日期放在同一张表里；点菜名就可以单独替换。</p></section>
      <div className="generate-proof"><MagicWandIcon /><div><strong>这一版只使用已确认菜品</strong><p>菜品库里没有的菜不会自动加入菜单。</p></div></div>
      <div className="mobile-action-area"><PrimaryButton onClick={onNext} icon={MagicWandIcon}>生成本周菜单</PrimaryButton></div>
    </div>
  );
}

function currentDish(menu, selection, overrides) {
  const base = menu[selection.dayIndex][selection.meal][selection.dishIndex];
  return [overrides[dishKey(selection)] || base[0], base[1]];
}

function MenuScreen({ menu, selection, setSelection, overrides, showAll, setShowAll, onSwap, onConfirm }) {
  const visibleIndexes = showAll ? [0, 1, 2, 3, 4] : [0, 1];
  const selected = currentDish(menu, selection, overrides);
  return (
    <div className="mobile-page menu-screen">
      <section className="weekly-menu-board">
        <header className="menu-board-head"><strong>9月7日—11日菜单</strong><div><span>筛选</span><button type="button" className={!showAll ? "active" : ""} aria-pressed={!showAll} onClick={() => setShowAll(false)}>荤菜</button><button type="button" className={showAll ? "active" : ""} aria-pressed={showAll} onClick={() => setShowAll(true)}>全部</button></div></header>
        <div className="weekly-menu-grid" style={{ "--dish-count": visibleIndexes.length }}>
          <div className="meal-axis" aria-hidden="true"><span></span><b>午饭</b><b>晚饭</b></div>
          <div className="day-carousel" aria-label="周一至周五午饭和晚饭菜单，左右滑动查看更多日期">
            {menu.map((day, dayIndex) => (
              <section className="day-column" key={day.day}>
                <header><strong>{day.day}</strong><small>{day.date}</small></header>
                {Object.keys(mealLabels).map((meal) => (
                  <div className="meal-cells" key={meal}>
                    {visibleIndexes.map((dishIndex) => {
                      const itemSelection = { dayIndex, meal, dishIndex };
                      const dish = currentDish(menu, itemSelection, overrides);
                      const active = dishKey(itemSelection) === dishKey(selection);
                      return <button key={dishIndex} type="button" className={`${dish[1]} ${active ? "active" : ""}`} aria-pressed={active} onClick={() => setSelection(itemSelection)}>{dish[0]}</button>;
                    })}
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
        <div className="selected-dish"><div><small>当前选择 · {menu[selection.dayIndex].day}{mealLabels[selection.meal]} · {kindLabels[selected[1]]}</small><strong>{selected[0]}</strong><span>同类替换，不改变其他餐次</span></div><button type="button" onClick={onSwap}>换这道</button></div>
      </section>
      <div className="mobile-action-area compact-action"><PrimaryButton onClick={onConfirm} icon={CheckIcon}>确认十餐菜单</PrimaryButton></div>
    </div>
  );
}

function SwapScreen({ menu, selection, overrides, setOverrides, choice, setChoice, onNext }) {
  const selected = currentDish(menu, selection, overrides);
  const options = candidates[selected[1]];
  const save = () => {
    setOverrides((current) => ({ ...current, [dishKey(selection)]: options[choice] }));
    onNext();
  };
  return (
    <div className="mobile-page swap-screen">
      <div className="swap-heading"><span>只调整这一道</span><h2>{menu[selection.dayIndex].day}{mealLabels[selection.meal]} · {selected[0]}</h2><p>保持餐标位置不变，其他九个餐次也不会重新生成。</p></div>
      <div className="locked-week"><LockClosedIcon /><span>整周其余菜单已锁住</span></div>
      <div className="candidate-list">
        {options.map((name, index) => {
          const active = choice === index;
          return <button key={name} type="button" className={active ? "selected" : ""} aria-pressed={active} onClick={() => setChoice(index)}><span className="swap-radio">{active ? <CheckIcon /> : null}</span><span><strong>{name}</strong><small>{index === 0 ? "上周没有用过 · 主料不重复" : index === 1 ? "两周前用过 · 同类候选" : "近期使用频率较低"}</small></span></button>;
        })}
      </div>
      <div className="swap-note"><MagicWandIcon /><p><strong>替换后仍会自动检查</strong><span>主料、近期重复和每餐结构会重新校验一次。</span></p></div>
      <div className="mobile-action-area"><PrimaryButton onClick={save} icon={CheckIcon}>保存这次替换</PrimaryButton></div>
    </div>
  );
}

function MenuDetailList({ menu, overrides }) {
  return (
    <div className="overview-list">
      {menu.flatMap((day, dayIndex) => Object.keys(mealLabels).map((meal) => {
        const dishes = day[meal].map((_, dishIndex) => currentDish(menu, { dayIndex, meal, dishIndex }, overrides)[0]);
        return <section key={`${day.day}-${meal}`}><header><strong>{day.day} · {mealLabels[meal]}</strong><span>{day.date}</span></header><p>{dishes.join("、")}</p></section>;
      }))}
    </div>
  );
}

function OverviewScreen({ menu, overrides, onNext }) {
  return (
    <div className="mobile-page overview-screen">
      <section className="overview-status"><span>本周菜单已确认</span><strong>5 天 · 10 餐</strong><p>周一至周五午饭和晚饭，下面是最终安排。</p></section>
      <MenuDetailList menu={menu} overrides={overrides} />
      <div className="mobile-action-area compact-action"><PrimaryButton onClick={onNext} icon={CheckIcon}>确认并保存本周菜单</PrimaryButton></div>
    </div>
  );
}

function SavedScreen({ menu, overrides, detailOpen, onViewDetail, onRestart }) {
  const firstDish = currentDish(menu, { dayIndex: 0, meal: "lunch", dishIndex: 0 }, overrides)[0];
  if (detailOpen) {
    return (
      <div className="mobile-page saved-detail-screen">
        <section className="overview-status"><span>本周菜单 · 已保存</span><strong>5 天 · 10 餐</strong><p>周一至周五午饭和晚饭，下面是保存后的完整安排。</p></section>
        <MenuDetailList menu={menu} overrides={overrides} />
      </div>
    );
  }
  return (
    <div className="mobile-page saved-screen">
      <section className="saved-hero"><span><CheckIcon /></span><p>9月7日—9月11日</p><h2>本周菜单已保存</h2><small>5 天 · 10 餐 · 50 道菜</small></section>
      <button className="history-card history-card-button" type="button" onClick={onViewDetail}>
        <header><div><span>本周</span><strong>9月7日—9月11日</strong></div><b>已保存</b></header>
        <p>{firstDish}、白切鸡、蒜蓉菜心、冬瓜虾皮汤……</p>
        <div className="history-card-foot"><div className="history-meta"><span>10 餐</span><span>50 道菜</span><span>可复制</span></div><strong>查看完整菜单 <ChevronRightIcon /></strong></div>
      </button>
      <section className="next-week-card"><ArchiveIcon /><div><strong>下周可以复制这一周</strong><p>保留合适的部分，再换掉几道菜。</p></div><ChevronRightIcon /></section>
      <div className="mobile-action-area"><PrimaryButton onClick={onRestart} icon={ReloadIcon}>重新体验</PrimaryButton></div>
    </div>
  );
}

export function App() {
  const [step, setStep] = useState(initialStep);
  const [weekIndex, setWeekIndex] = useState(1);
  const [selection, setSelection] = useState({ dayIndex: 0, meal: "lunch", dishIndex: 0 });
  const [overrides, setOverrides] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [choice, setChoice] = useState(0);
  const [savedDetailOpen, setSavedDetailOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => setStep(initialStep());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const go = (nextStep) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", nextStep);
    window.history.pushState({}, "", url);
    setStep(nextStep);
    if (nextStep !== "saved") setSavedDetailOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepIndex = steps.indexOf(step);
  const goNext = () => go(steps[Math.min(stepIndex + 1, steps.length - 1)]);
  const goPrevious = () => go(steps[Math.max(stepIndex - 1, 0)]);
  const restart = () => { setOverrides({}); setChoice(0); setShowAll(false); setSavedDetailOpen(false); go("generate"); };
  const story = stepCopy[step];
  const phoneScreen = useMemo(() => ({
    generate: <GenerateScreen weekIndex={weekIndex} setWeekIndex={setWeekIndex} onNext={() => go("menu")} />,
    menu: <MenuScreen menu={weekMenu} selection={selection} setSelection={setSelection} overrides={overrides} showAll={showAll} setShowAll={setShowAll} onSwap={() => go("swap")} onConfirm={() => go("overview")} />,
    swap: <SwapScreen menu={weekMenu} selection={selection} overrides={overrides} setOverrides={setOverrides} choice={choice} setChoice={setChoice} onNext={() => go("overview")} />,
    overview: <OverviewScreen menu={weekMenu} overrides={overrides} onNext={() => go("saved")} />,
    saved: <SavedScreen menu={weekMenu} overrides={overrides} detailOpen={savedDetailOpen} onViewDetail={() => setSavedDetailOpen(true)} onRestart={restart} />,
  })[step], [step, weekIndex, selection, overrides, showAll, choice, savedDetailOpen]);

  const phoneBack = step === "saved" && savedDetailOpen ? () => setSavedDetailOpen(false) : goPrevious;

  return (
    <>
      <a className="prototype-home-link" href="../../" aria-label="返回全部原型入口"><ArrowLeftIcon />全部原型</a>
      <a className="audience-switch" href="../prototype-implementation/">切到实施对照原型 <ArrowRightIcon /></a>
      <main className="prototype-page">
        <header className="topbar"><div className="brand"><span className="brand-icon"><CalendarIcon /></span><span>排好菜</span></div><div className="prototype-note">客户体验原型 · 不接真实数据</div></header>
        <div className="showcase-layout">
          <section className="story-panel">
            <div className="step-kicker">{story.kicker}</div>
            <h1>{story.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="lead">{story.lead}</p>
            <div className="proof-list">{story.proofs.map(([Icon, text]) => <div className="proof-item" key={text}><span><Icon /></span><p>{text}</p></div>)}</div>
            <button className="story-action" type="button" onClick={step === "saved" ? restart : goNext}>{story.action}<ArrowRightIcon /></button>
          </section>
          <section className="visual-panel" aria-label="排好菜手机交互演示"><PhoneFrame step={step} detailOpen={savedDetailOpen} onBack={phoneBack}>{phoneScreen}</PhoneFrame></section>
        </div>
        <nav className="showcase-nav" aria-label="客户原型步骤切换">
          <button type="button" onClick={goPrevious} disabled={stepIndex === 0} aria-label="上一步"><ArrowLeftIcon /></button>
          <div><strong>{stepIndex + 1} / {steps.length} · {story.label}</strong><span>{steps.map((item) => <i key={item} className={item === step ? "active" : ""}></i>)}</span></div>
          <button type="button" onClick={step === "saved" ? restart : goNext} aria-label={step === "saved" ? "重新体验" : "下一步"}>{step === "saved" ? <ReloadIcon /> : <ArrowRightIcon />}</button>
        </nav>
      </main>
    </>
  );
}
