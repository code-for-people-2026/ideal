export const tabs = ["schedule", "library", "history", "profile"];

export const weeks = [
  { id: "2026-08-31", range: "8月31日—9月4日", short: "上周", dates: ["8/31", "9/1", "9/2", "9/3", "9/4", "9/5", "9/6"] },
  { id: "2026-09-07", range: "9月7日—9月11日", short: "本周", dates: ["9/7", "9/8", "9/9", "9/10", "9/11", "9/12", "9/13"] },
  { id: "2026-09-14", range: "9月14日—9月18日", short: "下周", dates: ["9/14", "9/15", "9/16", "9/17", "9/18", "9/19", "9/20"] },
];

export const mealLabels = { lunch: "午饭", dinner: "晚饭" };
export const kindLabels = { meat: "荤菜", veg: "素菜", soup: "汤羹" };
export const weekdayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export const onboardingSteps = ["欢迎", "家庭设置", "每餐结构", "挑选常吃菜", "补充菜品", "准备完成"];

export const mealPatterns = {
  "2-2-1": { label: "2 荤 2 素 1 汤", meat: 2, veg: 2, soup: 1 },
  "2-1-1": { label: "2 荤 1 素 1 汤", meat: 2, veg: 1, soup: 1 },
  "1-2-1": { label: "1 荤 2 素 1 汤", meat: 1, veg: 2, soup: 1 },
};

export const library = [
  { id: "beef-potato", name: "土豆烧牛肉", kind: "meat", main: "牛肉", ingredients: ["牛肉", "土豆"], image: "./assets/dishes/potato-beef.jpg", uses: 3, note: "适合午饭，牛肉软烂下饭" },
  { id: "pork-ribs", name: "红烧排骨", kind: "meat", main: "猪排", ingredients: ["猪排", "冰糖", "酱油"], image: "./assets/dishes/braised-ribs.jpg", uses: 7, note: "家里的常做菜" },
  { id: "chicken-mushroom", name: "香菇滑鸡", kind: "meat", main: "鸡肉", ingredients: ["鸡肉", "香菇"], image: "./assets/dishes/shiitake-chicken.jpg", uses: 6, note: "蒸制，适合工作日" },
  { id: "white-chicken", name: "白切鸡", kind: "meat", main: "鸡肉", uses: 5, note: "夏季常用菜" },
  { id: "beef-radish", name: "萝卜焖牛腩", kind: "meat", main: "牛肉", uses: 2, note: "与牛肉菜自动避重" },
  { id: "fish-ginger", name: "姜葱蒸鱼", kind: "meat", main: "鱼", uses: 4, note: "清淡的鱼类候选" },
  { id: "broccoli", name: "清炒西兰花", kind: "veg", main: "西兰花", ingredients: ["西兰花", "蒜"], image: "./assets/dishes/broccoli.jpg", uses: 9, note: "适合搭配红烧菜" },
  { id: "choy-sum", name: "蒜蓉菜心", kind: "veg", main: "菜心", ingredients: ["菜心", "蒜"], image: "./assets/dishes/garlic-choy-sum.jpg", uses: 3, note: "十分钟快手菜" },
  { id: "lettuce", name: "白灼生菜", kind: "veg", main: "生菜", uses: 4, note: "快手青菜" },
  { id: "baby-cabbage", name: "上汤娃娃菜", kind: "veg", main: "娃娃菜", uses: 5, note: "适合晚饭" },
  { id: "corn-soup", name: "玉米排骨汤", kind: "soup", main: "玉米", ingredients: ["排骨", "玉米", "胡萝卜"], image: "./assets/dishes/corn-rib-soup.jpg", uses: 4, note: "鲜甜家常汤" },
  { id: "wintermelon-soup", name: "冬瓜虾皮汤", kind: "soup", main: "冬瓜", uses: 6, note: "清淡快手汤" },
  { id: "tofu-soup", name: "丝瓜豆腐汤", kind: "soup", main: "丝瓜", uses: 3, note: "素汤候选" },
  { id: "seaweed-soup", name: "紫菜蛋花汤", kind: "soup", main: "紫菜", uses: 8, note: "快手家常汤" },
  { id: "tomato-beef-brisket", name: "番茄炖牛腩", kind: "meat", main: "牛肉", ingredients: ["牛腩", "番茄"], image: "./assets/dishes/tomato-beef-brisket.jpg", uses: 4, note: "酸甜开胃，适合晚饭" },
  { id: "cola-chicken-wings", name: "可乐鸡翅", kind: "meat", main: "鸡肉", ingredients: ["鸡翅", "可乐", "酱油"], image: "./assets/dishes/cola-chicken-wings.jpg", uses: 5, note: "孩子也容易接受" },
  { id: "pepper-pork-shreds", name: "青椒肉丝", kind: "meat", main: "猪肉", ingredients: ["猪里脊", "青椒"], image: "./assets/dishes/pepper-pork-shreds.jpg", uses: 6, note: "工作日快手菜" },
  { id: "steamed-sea-bass", name: "清蒸鲈鱼", kind: "meat", main: "鲈鱼", ingredients: ["鲈鱼", "姜", "葱"], image: "./assets/dishes/steamed-sea-bass.jpg", uses: 4, note: "清淡的鱼类选择" },
  { id: "twice-cooked-pork", name: "回锅肉", kind: "meat", main: "猪肉", ingredients: ["五花肉", "青椒", "蒜苗"], image: "./assets/dishes/twice-cooked-pork.jpg", uses: 3, note: "偏香辣的下饭菜" },
  { id: "tomato-eggs", name: "番茄炒蛋", kind: "meat", main: "鸡蛋", ingredients: ["番茄", "鸡蛋"], image: "./assets/dishes/tomato-eggs.jpg", uses: 9, note: "全家常做的快手菜" },
  { id: "yuxiang-eggplant", name: "鱼香茄子", kind: "veg", main: "茄子", ingredients: ["茄子", "辣椒", "蒜"], image: "./assets/dishes/yuxiang-eggplant.jpg", uses: 4, note: "口味稍浓的素菜" },
  { id: "hand-torn-cabbage", name: "手撕包菜", kind: "veg", main: "包菜", ingredients: ["包菜", "干辣椒"], image: "./assets/dishes/hand-torn-cabbage.jpg", uses: 7, note: "十分钟快炒" },
  { id: "dry-fried-green-beans", name: "干煸四季豆", kind: "veg", main: "四季豆", ingredients: ["四季豆", "蒜"], image: "./assets/dishes/dry-fried-green-beans.jpg", uses: 5, note: "适合搭配清淡荤菜" },
  { id: "vinegar-potato-shreds", name: "醋溜土豆丝", kind: "veg", main: "土豆", ingredients: ["土豆", "青椒", "米醋"], image: "./assets/dishes/vinegar-potato-shreds.jpg", uses: 8, note: "酸爽快手菜" },
  { id: "seaweed-egg-soup", name: "紫菜蛋花汤", kind: "soup", main: "紫菜", ingredients: ["紫菜", "鸡蛋", "葱"], image: "./assets/dishes/seaweed-egg-soup.jpg", uses: 8, note: "十分钟就能完成" },
  { id: "winter-melon-meatball-soup", name: "冬瓜丸子汤", kind: "soup", main: "冬瓜", ingredients: ["冬瓜", "猪肉丸"], image: "./assets/dishes/winter-melon-meatball-soup.jpg", uses: 5, note: "清淡家常汤" },
];

export const starterDishChoices = [
  "beef-potato", "broccoli", "cola-chicken-wings", "choy-sum", "seaweed-egg-soup", "pork-ribs",
  "tomato-eggs", "chicken-mushroom", "yuxiang-eggplant", "corn-soup", "pepper-pork-shreds", "hand-torn-cabbage",
  "steamed-sea-bass", "dry-fried-green-beans", "winter-melon-meatball-soup", "twice-cooked-pork", "vinegar-potato-shreds", "tomato-beef-brisket",
];

export const starterDishTargets = { meat: 5, veg: 4, soup: 2 };

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
  {
    day: "周六",
    lunch: [["清蒸鲈鱼", "meat"], ["农家小炒肉", "meat"], ["香菇青菜", "veg"], ["凉拌黄瓜", "veg"], ["番茄蛋汤", "soup"]],
    dinner: [["萝卜焖牛腩", "meat"], ["葱油鸡", "meat"], ["清炒芥蓝", "veg"], ["家常豆腐", "veg"], ["菌菇汤", "soup"]],
  },
  {
    day: "周日",
    lunch: [["糖醋里脊", "meat"], ["姜葱蒸鱼", "meat"], ["蒜蓉生菜", "veg"], ["清炒山药", "veg"], ["玉米排骨汤", "soup"]],
    dinner: [["香菇炖鸡", "meat"], ["芹菜炒肉", "meat"], ["上汤娃娃菜", "veg"], ["酸辣土豆丝", "veg"], ["紫菜蛋花汤", "soup"]],
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fitMealToPattern(dishes, pattern) {
  return Object.keys(kindLabels).flatMap((kind) => {
    const current = dishes.filter((dish) => dish[1] === kind);
    const fillers = library.filter((dish) => dish.kind === kind && !current.some(([name]) => name === dish.name)).map((dish) => [dish.name, dish.kind]);
    return [...current, ...fillers].slice(0, pattern[kind]);
  });
}

export function createMenu(weekIndex = 1, household = { days: 5 }, pattern = mealPatterns["2-2-1"]) {
  const dayIndexes = household.dayIndexes || Array.from({ length: household.days }, (_, index) => index);
  const menu = clone(baseMeals).map((day, dayIndex) => ({
    ...day,
    dayIndex,
    lunch: fitMealToPattern(day.lunch, pattern),
    dinner: fitMealToPattern(day.dinner, pattern),
  })).filter((day) => dayIndexes.includes(day.dayIndex));
  if (weekIndex === 0) {
    const monday = menu.find((day) => day.dayIndex === 0);
    const wednesday = menu.find((day) => day.dayIndex === 2);
    if (monday?.lunch[0]) monday.lunch[0][0] = "番茄炖牛腩";
    if (wednesday?.dinner[1]) wednesday.dinner[1][0] = "香菇蒸鸡";
  }
  return menu;
}

export function createInitialState() {
  return {
    demoMode: "ready",
    onboardingStep: 0,
    household: { people: 4, meals: ["lunch", "dinner"], days: 5, dayIndexes: [0, 1, 2, 3, 4] },
    mealPattern: "2-2-1",
    customPattern: { meat: 2, veg: 2, soup: 1 },
    starterPoolBase: { meat: 18, veg: 14, soup: 6 },
    starterDishIds: [],
    starterDishIndex: 0,
    starterDishDecisions: [],
    customStarterDishes: [],
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

export function createNewUserState() {
  const state = createInitialState();
  return {
    ...state,
    demoMode: "new",
    onboardingStep: 0,
    starterPoolBase: { meat: 0, veg: 0, soup: 0 },
    starterDishIds: [],
    starterDishIndex: 0,
    starterDishDecisions: [],
    customStarterDishes: [],
    menus: {
      0: { status: "empty", data: null },
      1: { status: "empty", data: null },
      2: { status: "empty", data: null },
    },
    log: ["已切换为新用户状态"],
  };
}

export function currentMealPattern(state) {
  return state.mealPattern === "custom" ? state.customPattern : mealPatterns[state.mealPattern];
}

export function planStats(state, menu = state.menus[state.weekIndex]?.data) {
  const pattern = currentMealPattern(state);
  const days = menu?.length || state.household.dayIndexes.length;
  const meals = state.household.meals.length;
  const perMeal = pattern.meat + pattern.veg + pattern.soup;
  return { days, meals, mealCount: days * meals, perMeal, dishCount: days * meals * perMeal };
}

export function weekRange(weekIndex, days = 5) {
  const dates = weeks[weekIndex].dates;
  const indexes = Array.isArray(days) ? days : Array.from({ length: days }, (_, index) => index);
  const [startMonth, startDay] = dates[Math.min(...indexes)].split("/");
  const [endMonth, endDay] = dates[Math.max(...indexes)].split("/");
  return `${startMonth}月${startDay}日—${startMonth === endMonth ? `${endDay}日` : `${endMonth}月${endDay}日`}`;
}

export function dishPoolStats(state) {
  const stats = { ...(state.starterPoolBase || { meat: 0, veg: 0, soup: 0 }) };
  state.starterDishIds.forEach((id) => {
    const dish = library.find((item) => item.id === id);
    if (dish) stats[dish.kind] += 1;
  });
  return { ...stats, total: stats.meat + stats.veg + stats.soup + state.customStarterDishes.length };
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
    case "RESET_TO_NEW_USER":
      return createNewUserState();
    case "SKIP_ONBOARDING":
      return withLog(createInitialState(), "已跳过首次准备，载入默认家庭数据");
    case "ONBOARDING_NEXT":
      return { ...state, onboardingStep: Math.min(onboardingSteps.length - 1, state.onboardingStep + 1), toast: null, log: [`完成${onboardingSteps[state.onboardingStep]}`, ...state.log].slice(0, 6) };
    case "ONBOARDING_BACK": {
      if (state.onboardingStep === 4) {
        return {
          ...state,
          onboardingStep: 3,
          starterDishIndex: Math.min(state.starterDishIndex, starterDishChoices.length - 1),
          toast: null,
        };
      }
      return { ...state, onboardingStep: Math.max(0, state.onboardingStep - 1), toast: null };
    }
    case "SET_HOUSEHOLD_PEOPLE":
      if (!Number.isFinite(Number(action.value))) return state;
      return { ...state, household: { ...state.household, people: Math.max(1, Math.min(20, Math.round(Number(action.value)))) }, toast: null };
    case "TOGGLE_HOUSEHOLD_MEAL": {
      const selected = state.household.meals.includes(action.value);
      if (selected && state.household.meals.length === 1) return state;
      const meals = selected ? state.household.meals.filter((meal) => meal !== action.value) : [...state.household.meals, action.value];
      return { ...state, household: { ...state.household, meals }, toast: null };
    }
    case "TOGGLE_HOUSEHOLD_DAY": {
      const selected = state.household.dayIndexes.includes(action.value);
      if (selected && state.household.dayIndexes.length === 1) return state;
      const dayIndexes = (selected ? state.household.dayIndexes.filter((day) => day !== action.value) : [...state.household.dayIndexes, action.value]).sort((a, b) => a - b);
      return { ...state, household: { ...state.household, days: dayIndexes.length, dayIndexes }, toast: null };
    }
    case "SET_HOUSEHOLD_DAYS":
      return { ...state, household: { ...state.household, days: action.value, dayIndexes: Array.from({ length: action.value }, (_, index) => index) }, toast: null };
    case "SET_MEAL_PATTERN":
      return { ...state, mealPattern: action.value, toast: null };
    case "ADJUST_CUSTOM_PATTERN":
      return { ...state, customPattern: { ...state.customPattern, [action.kind]: Math.max(0, Math.min(action.kind === "soup" ? 2 : 3, state.customPattern[action.kind] + action.delta)) }, toast: null };
    case "CHOOSE_STARTER_DISH": {
      const id = starterDishChoices[state.starterDishIndex];
      if (!id) return state;
      const starterDishIds = action.selected ? [...state.starterDishIds.filter((item) => item !== id), id] : state.starterDishIds.filter((item) => item !== id);
      const starterDishDecisions = [...state.starterDishDecisions.filter((item) => item.id !== id), { id, selected: action.selected }];
      return {
        ...state,
        starterDishIds,
        starterDishDecisions,
        starterDishIndex: Math.min(starterDishChoices.length, state.starterDishIndex + 1),
        toast: null,
      };
    }
    case "UNDO_STARTER_DISH": {
      const previous = state.starterDishDecisions[state.starterDishDecisions.length - 1];
      if (!previous) return state;
      return {
        ...state,
        starterDishIndex: Math.max(0, starterDishChoices.indexOf(previous.id)),
        starterDishDecisions: state.starterDishDecisions.slice(0, -1),
        starterDishIds: previous.selected ? state.starterDishIds.filter((id) => id !== previous.id) : state.starterDishIds,
        toast: null,
      };
    }
    case "REVIEW_STARTER_DISHES":
      return { ...state, starterDishIndex: 0, toast: null };
    case "FINISH_STARTER_DISH_PICK":
      if (state.starterDishIds.length === 0) return state;
      return { ...state, onboardingStep: 4, toast: null, log: [`已挑选 ${state.starterDishIds.length} 道常吃菜`, ...state.log].slice(0, 6) };
    case "ADD_CUSTOM_STARTER_DISH": {
      const value = String(action.value || "").trim();
      if (!value || state.customStarterDishes.includes(value)) return state;
      return { ...state, customStarterDishes: [...state.customStarterDishes, value].slice(0, 8), toast: null };
    }
    case "REMOVE_CUSTOM_STARTER_DISH":
      return { ...state, customStarterDishes: state.customStarterDishes.filter((item) => item !== action.value), toast: null };
    case "COMPLETE_ONBOARDING":
      return withLog({ ...state, demoMode: "ready", onboardingStep: 0, activeTab: "schedule", screen: "home", weekIndex: 1 }, "首次准备完成，可以排第一周菜单");
    case "NAV_TAB":
      return withLog({ ...state, activeTab: action.tab, screen: action.tab === "schedule" ? "home" : state.screen, libraryDetailId: null, pickingFromLibrary: false }, `打开${{ schedule: "排菜单", library: "菜品库", history: "历史", profile: "我的" }[action.tab]}`);
    case "WEEK_MOVE": {
      const weekIndex = Math.max(0, Math.min(weeks.length - 1, state.weekIndex + action.delta));
      if (weekIndex === state.weekIndex) return state;
      return withLog({ ...state, weekIndex, screen: "home", activeTab: "schedule" }, `切换到${weeks[weekIndex].short}`);
    }
    case "OPEN_WEEK":
      return withLog({ ...state, weekIndex: action.weekIndex, activeTab: "schedule", screen: state.menus[action.weekIndex]?.status === "empty" ? "home" : "edit" }, `查看${weekRange(action.weekIndex, state.household.dayIndexes)}菜单`);
    case "GENERATE_START":
      return withLog({ ...state, generating: true }, `正在为${weekRange(state.weekIndex, state.household.dayIndexes)}生成菜单`);
    case "GENERATE_DONE":
      return withLog({ ...state, generating: false, screen: "edit", viewKind: currentMealPattern(state).meat > 0 ? "meat" : "all", selection: { dayIndex: 0, meal: state.household.meals[0], dishIndex: 0 }, menus: { ...state.menus, [state.weekIndex]: { status: "draft", data: createMenu(state.weekIndex, state.household, currentMealPattern(state)) } } }, `已生成 ${planStats(state).days} 天 ${planStats(state).mealCount} 餐`);
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
      return withLog({ ...state, menus: { ...state.menus, [prompt.target]: { status: "draft", data: clone(sourceMenu) } }, weekIndex: prompt.target, activeTab: "schedule", screen: "edit", copyPrompt: null }, `已复制到${weekRange(prompt.target, state.household.dayIndexes)}`);
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
