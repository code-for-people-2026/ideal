export const tabs = ["schedule", "library", "history", "profile"];

export const weeks = [
  { id: "2026-08-31", range: "8月31日—9月4日", short: "上周", dates: ["8/31", "9/1", "9/2", "9/3", "9/4"] },
  { id: "2026-09-07", range: "9月7日—9月11日", short: "本周", dates: ["9/7", "9/8", "9/9", "9/10", "9/11"] },
  { id: "2026-09-14", range: "9月14日—9月18日", short: "下周", dates: ["9/14", "9/15", "9/16", "9/17", "9/18"] },
];

export const mealLabels = { lunch: "午饭", dinner: "晚饭" };
export const kindLabels = { meat: "荤菜", veg: "素菜", soup: "汤羹" };

export const library = [
  { id: "beef-potato", name: "土豆烧牛肉", kind: "meat", main: "牛肉", uses: 3, note: "适合午饭，牛肉软烂下饭" },
  { id: "pork-ribs", name: "红烧排骨", kind: "meat", main: "猪排", uses: 7, note: "家里的常做菜" },
  { id: "chicken-mushroom", name: "香菇滑鸡", kind: "meat", main: "鸡肉", uses: 6, note: "蒸制，适合工作日" },
  { id: "white-chicken", name: "白切鸡", kind: "meat", main: "鸡肉", uses: 5, note: "夏季常用菜" },
  { id: "beef-radish", name: "萝卜焖牛腩", kind: "meat", main: "牛肉", uses: 2, note: "与牛肉菜自动避重" },
  { id: "fish-ginger", name: "姜葱蒸鱼", kind: "meat", main: "鱼", uses: 4, note: "清淡的鱼类候选" },
  { id: "broccoli", name: "清炒西兰花", kind: "veg", main: "西兰花", uses: 9, note: "适合搭配红烧菜" },
  { id: "choy-sum", name: "蒜蓉菜心", kind: "veg", main: "菜心", uses: 3, note: "十分钟快手菜" },
  { id: "lettuce", name: "白灼生菜", kind: "veg", main: "生菜", uses: 4, note: "快手青菜" },
  { id: "baby-cabbage", name: "上汤娃娃菜", kind: "veg", main: "娃娃菜", uses: 5, note: "适合晚饭" },
  { id: "corn-soup", name: "玉米排骨汤", kind: "soup", main: "玉米", uses: 4, note: "鲜甜家常汤" },
  { id: "wintermelon-soup", name: "冬瓜虾皮汤", kind: "soup", main: "冬瓜", uses: 6, note: "清淡快手汤" },
  { id: "tofu-soup", name: "丝瓜豆腐汤", kind: "soup", main: "丝瓜", uses: 3, note: "素汤候选" },
  { id: "seaweed-soup", name: "紫菜蛋花汤", kind: "soup", main: "紫菜", uses: 8, note: "快手家常汤" },
];

const baseMeals = [
  {
    day: "周一",
    lunch: [["土豆烧牛肉", "meat"], ["白切鸡", "meat"], ["蒜蓉菜心", "veg"], ["清炒西兰花", "veg"], ["冬瓜虾皮汤", "soup"]],
    dinner: [["梅菜扣肉", "meat"], ["清蒸鲈鱼", "meat"], ["荷塘小炒", "veg"], ["手撕包菜", "veg"], ["玉米排骨汤", "soup"]],
  },
  {
    day: "周二",
    lunch: [["红烧排骨", "meat"], ["番茄炒蛋", "meat"], ["清炒油麦菜", "veg"], ["香菇青菜", "veg"], ["海带豆腐汤", "soup"]],
    dinner: [["红烧牛腩", "meat"], ["冬菇蒸肉饼", "meat"], ["蒜蓉时蔬", "veg"], ["清炒芦笋", "veg"], ["番茄蛋汤", "soup"]],
  },
  {
    day: "周三",
    lunch: [["香菇滑鸡", "meat"], ["萝卜炖肉", "meat"], ["清炒菠菜", "veg"], ["酸辣土豆丝", "veg"], ["菌菇汤", "soup"]],
    dinner: [["糖醋排骨", "meat"], ["芹菜炒肉", "meat"], ["蚝油生菜", "veg"], ["家常茄子", "veg"], ["紫菜蛋花汤", "soup"]],
  },
  {
    day: "周四",
    lunch: [["啤酒鸭", "meat"], ["豆角炒肉", "meat"], ["蒜蓉空心菜", "veg"], ["清炒藕片", "veg"], ["萝卜汤", "soup"]],
    dinner: [["清炖狮子头", "meat"], ["豉汁蒸鱼", "meat"], ["小炒杏鲍菇", "veg"], ["上汤娃娃菜", "veg"], ["丝瓜蛋汤", "soup"]],
  },
  {
    day: "周五",
    lunch: [["板栗烧鸡", "meat"], ["木须肉", "meat"], ["清炒小白菜", "veg"], ["麻婆豆腐", "veg"], ["莲藕排骨汤", "soup"]],
    dinner: [["土豆焖鸭", "meat"], ["红烧带鱼", "meat"], ["蒜蓉西兰花", "veg"], ["干煸四季豆", "veg"], ["冬瓜肉丸汤", "soup"]],
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createMenu(weekIndex = 1) {
  const menu = clone(baseMeals);
  if (weekIndex === 0) {
    menu[0].lunch[0][0] = "番茄炖牛腩";
    menu[2].dinner[1][0] = "香菇蒸鸡";
  }
  return menu;
}

export function createInitialState() {
  return {
    activeTab: "schedule",
    screen: "home",
    weekIndex: 1,
    menus: {
      0: { status: "saved", data: createMenu(0) },
      1: { status: "empty", data: null },
      2: { status: "empty", data: null },
    },
    selection: { dayIndex: 0, meal: "lunch", dishIndex: 0 },
    viewKind: "meat",
    swapMode: "smart",
    candidateId: "beef-radish",
    libraryFilter: "all",
    libraryQuery: "",
    libraryDetailId: null,
    pickingFromLibrary: false,
    expandedHistory: 0,
    generating: false,
    copyPrompt: null,
    toast: null,
    log: ["演示数据已载入"],
  };
}

function withLog(state, message) {
  return { ...state, toast: message, log: [message, ...state.log].slice(0, 6) };
}

function replaceSelectedDish(state, dish) {
  const week = state.menus[state.weekIndex];
  if (!week?.data) return state;
  const data = clone(week.data);
  const { dayIndex, meal, dishIndex } = state.selection;
  data[dayIndex][meal][dishIndex] = [dish.name, dish.kind];
  return {
    ...state,
    menus: { ...state.menus, [state.weekIndex]: { status: "draft", data } },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "NAV_TAB":
      return withLog({ ...state, activeTab: action.tab, screen: action.tab === "schedule" ? "home" : state.screen, libraryDetailId: null, pickingFromLibrary: false }, `打开${{ schedule: "排菜单", library: "菜品库", history: "历史", profile: "我的" }[action.tab]}`);
    case "WEEK_MOVE": {
      const weekIndex = Math.max(0, Math.min(weeks.length - 1, state.weekIndex + action.delta));
      if (weekIndex === state.weekIndex) return state;
      return withLog({ ...state, weekIndex, screen: "home", activeTab: "schedule" }, `切换到${weeks[weekIndex].short}`);
    }
    case "OPEN_WEEK":
      return withLog({ ...state, weekIndex: action.weekIndex, activeTab: "schedule", screen: state.menus[action.weekIndex]?.status === "empty" ? "home" : "edit" }, `查看${weeks[action.weekIndex].range}菜单`);
    case "GENERATE_START":
      return withLog({ ...state, generating: true }, `正在为${weeks[state.weekIndex].range}生成菜单`);
    case "GENERATE_DONE":
      return withLog({ ...state, generating: false, screen: "edit", menus: { ...state.menus, [state.weekIndex]: { status: "draft", data: createMenu(state.weekIndex) } } }, "已生成 5 天 10 餐");
    case "EDIT_MENU":
      return withLog({ ...state, activeTab: "schedule", screen: "edit" }, "进入菜单调整");
    case "SELECT_DISH":
      return { ...state, selection: action.selection, toast: null };
    case "SET_VIEW_KIND":
      return { ...state, viewKind: action.value, toast: null };
    case "OPEN_SWAP":
      return withLog({ ...state, screen: "swap", swapMode: action.mode || "smart" }, action.mode === "manual" ? "打开手选菜品" : "查看同类换菜候选");
    case "SELECT_CANDIDATE":
      return { ...state, candidateId: action.id, toast: null };
    case "APPLY_CANDIDATE": {
      const dish = library.find((item) => item.id === state.candidateId);
      if (!dish) return state;
      return withLog({ ...replaceSelectedDish(state, dish), screen: "edit" }, `已换成「${dish.name}」`);
    }
    case "OPEN_LIBRARY_PICK":
      return withLog({ ...state, activeTab: "library", pickingFromLibrary: true, libraryDetailId: null }, "从菜品库手选替换菜");
    case "SET_LIBRARY_FILTER":
      return { ...state, libraryFilter: action.value, toast: null };
    case "SET_LIBRARY_QUERY":
      return { ...state, libraryQuery: action.value, toast: null };
    case "OPEN_LIBRARY_DETAIL":
      return { ...state, libraryDetailId: action.id, toast: null };
    case "CLOSE_LIBRARY_DETAIL":
      return { ...state, libraryDetailId: null };
    case "PICK_LIBRARY_DISH": {
      const dish = library.find((item) => item.id === action.id);
      if (!dish) return state;
      return withLog({ ...replaceSelectedDish(state, dish), activeTab: "schedule", screen: "edit", pickingFromLibrary: false, libraryDetailId: null }, `已手选「${dish.name}」`);
    }
    case "CONFIRM_MENU":
      return withLog({ ...state, screen: "review" }, "菜单已进入确认状态");
    case "SAVE_MENU":
      return withLog({ ...state, menus: { ...state.menus, [state.weekIndex]: { ...state.menus[state.weekIndex], status: "saved" } }, activeTab: "history", screen: "home", expandedHistory: state.weekIndex }, "本周菜单已保存");
    case "TOGGLE_HISTORY":
      return { ...state, expandedHistory: state.expandedHistory === action.weekIndex ? null : action.weekIndex, toast: null };
    case "ASK_COPY": {
      const target = Math.min(action.weekIndex + 1, weeks.length - 1);
      if (target === action.weekIndex) return withLog(state, "当前已是演示的最后一周");
      return { ...state, copyPrompt: { source: action.weekIndex, target }, toast: null };
    }
    case "CANCEL_COPY":
      return { ...state, copyPrompt: null };
    case "CONFIRM_COPY": {
      const prompt = state.copyPrompt;
      if (!prompt) return state;
      const sourceMenu = state.menus[prompt.source]?.data;
      if (!sourceMenu) return { ...state, copyPrompt: null };
      return withLog({ ...state, menus: { ...state.menus, [prompt.target]: { status: "draft", data: clone(sourceMenu) } }, weekIndex: prompt.target, activeTab: "schedule", screen: "edit", copyPrompt: null }, `已复制到${weeks[prompt.target].range}`);
    }
    case "BACK_TO_EDIT":
      return { ...state, activeTab: "schedule", screen: "edit", toast: null };
    case "DISMISS_TOAST":
      return { ...state, toast: null };
    case "RESET":
      return withLog(createInitialState(), "演示数据已重置");
    default:
      return state;
  }
}

export function selectedDish(state) {
  const menu = state.menus[state.weekIndex]?.data;
  if (!menu) return null;
  const { dayIndex, meal, dishIndex } = state.selection;
  const [name, kind] = menu[dayIndex][meal][dishIndex];
  return { name, kind };
}

export function visibleLibrary(state) {
  const query = state.libraryQuery.trim().toLowerCase();
  return library.filter((dish) => (state.libraryFilter === "all" || dish.kind === state.libraryFilter) && (!query || dish.name.toLowerCase().includes(query) || dish.main.toLowerCase().includes(query)));
}
