# Design QA — 排好菜页面画板与工程模型入口

## Comparison target

- Source visual truth: `design-qa-screenshots/implementation-code-artboards.png` (`1280 × 720`, 1×)，用户确认的上一版六页面画板。
- Rendered implementation: `design-qa-screenshots/implementation-code-artboards-restored.png` (`1280 × 720`, CSS viewport `1280 × 720`, device density 1×)。
- Full-view comparison evidence: `design-qa-screenshots/comparison-restored-artboards.jpg` (`2560 × 720`)，左侧为上一版，右侧为恢复结果。
- Focused implementation evidence: `design-qa-screenshots/implementation-edit-focus.png`，修改菜单画板 82% 聚焦；该画板 DOM 与交互代码未改变。
- State: “全部画板”39%；另外检查“菜单主流程”49% 和单画板 82%。
- Normalization: source and implementation are both `1280 × 720 @1×`; no resampling was needed before the side-by-side comparison.

本轮目标是恢复页面流程图作为默认主画布。架构、接口、动态流程与验收内容移到独立 `engineering-model.html`，只通过右上角“工程实现模型”进入。

## Findings

- No actionable P0/P1/P2 differences remain.
- P3: 工具栏比视觉基准多一个“工程实现模型”按钮；这是有意增加的辅助入口，不改变画板面积、缩放比例或主流程层级。

## Required fidelity surfaces

- Fonts and typography: 标题、画板标签、页面标题、辅助文字和按钮字重、字号、行高均与上一版一致；新增入口沿用既有 `.toolbar-link` 样式。
- Spacing and layout rhythm: 六个画板的位置、宽高、流程连线、说明卡、画布边界、工具栏、缩放控件、圆角与阴影保持不变。1280 × 720 下文档无滚动溢出。
- Colors and visual tokens: 暖白背景、砖红主按钮、深绿成功态和浅金范围卡完全沿用既有令牌；新增入口使用中性次级按钮样式。
- Image quality and asset fidelity: 主画布仍由可检索 HTML/CSS 页面画板构成，没有把页面重新变成截图或占位图片；没有栅格裁切、压缩或素材替代问题。
- Copy and content: 页面流程、手机页面内容、六个画板名称和连接关系未改。工程说明不再占据主画布，只增加明确的辅助入口。

## Interaction and browser checks

- “全部画板 / 菜单主流程 / 辅助页面”定位正常；主流程聚焦为 49%。
- 点击“修改菜单”画板聚焦为 82%；“适配”恢复为 39%。
- 拖动画布会更新 transform；缩放和主流程按钮保持可用。
- “工程实现模型”链接为 `./engineering-model.html`；目标页面包含四个工程视图，并可通过“页面画板”返回主图。
- 主画布与工程模型页面控制台均无 warning / error。

## Comparison history

1. Earlier P1: 整合时把工程文档四视图直接替换了六页面主画板，导致用户看到文字说明而不是页面流程图。
2. Fix: 恢复上一版 `index.html` 页面画板，把四视图工程内容迁移到 `engineering-model.html`，并增加一个次级入口。
3. Post-fix evidence: `comparison-restored-artboards.jpg` 显示主画布与上一版一致，唯一可见差异是右上角辅助入口；没有剩余 P0/P1/P2 问题。

## Implementation checklist

- [x] 六个页面画板与流程连线恢复为默认主图。
- [x] 生成、修改、确认保存、历史、菜品库和“我的”内容保持不变。
- [x] 工程模型作为辅助页面保留，没有丢失三个工作包成果。
- [x] 画布定位、单画板聚焦、拖动、缩放和适配均正常。
- [x] 1280 × 720 渲染、控制台与溢出检查通过。

final result: passed

---

# Design QA — 工程页面导航统一

## Comparison target

- Source visual truth: `design-audit-screenshots/nav-consistency/05-three-headers.png`（修订前，三个页面的全局导航和局部筛选混排）。
- Rendered implementation: `design-audit-screenshots/nav-consistency/06-running-unified.png`、`07-page-map-unified.png`、`08-engineering-unified.png`（约 `1280 × 720`，1×）。
- State: 运行原型、页面地图和实现说明各自处于默认页；页面地图为“全部”，实现说明为“实现总览”。

## Findings

- No actionable P0/P1/P2 differences remain.
- 三个工程页面的第一层导航位置、顺序和文案已统一；当前页只改变选中态，不再改变导航结构。
- 页面地图的五个功能线筛选、实现说明的四个工程视图均下移到独立二级工具栏，不再挤占全局导航中心位置。

## Naming and destination checks

- `项目入口` 只指向排好菜项目选择页。
- `运行原型` 只指向可点击的 React 工程原型。
- `页面地图` 只指向四条手机功能线画布。
- `实现说明` 只指向工程实现画布。
- `客户原型` 只指向客户体验原型。
- 已移除与“项目入口”同目的地的“项目目录”称呼，并增加静态导航契约测试防止回归。

## Browser and build checks

- 浏览器 DOM 核对通过：三个页面均出现同一套五个名称，且只有当前页面使用选中态。
- 页面地图和实现说明的二级筛选保持居中，左右信息块对齐；画布初始缩放重新避让两层工具栏。
- `npm test`、`npm run build:pages`、仓库 Pages 构建与 `git diff --check` 通过。

final result: passed

---

# Design QA — 顶部功能筛选与操作按钮对齐

## Comparison target

- Source visual truth: `design-audit-screenshots/02-toolbar-detail.png` (`1280 × 96`, 1×)，修改前的顶部工具栏截图。
- Rendered implementation: `design-audit-screenshots/03-toolbar-aligned-detail.png` (`1280 × 96`, CSS viewport `1280 × 720`, 1×)。
- Full comparison evidence: `design-audit-screenshots/04-toolbar-before-after.jpg` (`2560 × 96`)；左侧为修改前，右侧为修改后。
- Focused region: 顶部工具栏本身就是本轮唯一目标区域，不需要额外页面级对照。
- State: “全部”选中；另检查“排菜单”切换后的 `aria-pressed`。

## Findings

- No actionable P0/P1/P2 differences remain.
- P3: 左侧品牌仍是两行文字块，高度 `32.59px`；它与控制组按中心线对齐，而不是强行拉伸成按钮高度，这是有意的内容差异。

## Required fidelity surfaces

- Fonts and typography: 字号、字重和字体栈未改；只调整控件盒模型，没有产生换行或截断。
- Spacing and layout rhythm: 中间分段控件和右侧操作按钮均为 `40px` 高、`10px` 圆角，顶部位置均为 `y=25px`，中心线均为 `y=45px`；内部标签统一为 `32px` 高。
- Colors and visual tokens: 选中态使用既有浅绿 `rgb(231, 243, 236)` 和单层内描边，移除白色浮层与绿色双层光圈。
- Image quality and asset fidelity: 本轮没有新增或替换图片资产。
- Copy and content: 标签与链接文案未改变。

## Interaction checks

- 五个筛选项高度与中心线一致；“排菜单”可正常切换为 `aria-pressed=true`。
- “项目入口 / 实现说明 / 运行原型”链接保持不变。
- 浏览器控制台无 warning / error。
- 页面构建、完整 Pages 构建和 `git diff --check` 通过。

## Comparison history

1. Earlier P2: 中间分段控件高 `46px`，右侧按钮高 `38px`；虽然中心线同为 `45px`，但上下边缘错开，选中项的白底、描边和阴影进一步放大了视觉不齐。
2. Fix: 两组统一为 `40px` 高、`10px` 圆角；标签使用 `32px` 内层高度；选中态改为浅绿底与单层内描边。
3. Post-fix evidence: `04-toolbar-before-after.jpg` 显示两组控件上下边缘已对齐，没有剩余 P0/P1/P2 问题。

final result: passed

---

# Design QA — 四功能手机页面地图

## Comparison target

- Source visual truth: `design-qa-screenshots/implementation-runnable-viewport.png` (`884 × 777`, 1×)，可运行工程原型的真实 iPhone、手机页面和产品视觉令牌。
- Secondary source: `design-qa-screenshots/implementation-code-artboards-restored.png` (`1280 × 720`, 1×)，此前确认的暖灰画布、白色画板和页面流程展示方式。
- Rendered implementation: `design-qa-screenshots/implementation-mobile-lanes-all-final.png` (`1280 × 720`, CSS viewport `1280 × 720`, 1×)。
- Focused phone evidence: `design-qa-screenshots/implementation-mobile-lanes-phone-final.png` (`1280 × 720`)，P03 单手机 70% 聚焦。
- Full-view comparison: `design-qa-screenshots/comparison-mobile-page-map.jpg` (`1600 × 800`)；左侧为可运行手机基准，右侧为排菜单手机任务线。
- State: “全部”23%；排菜单/菜品库 48%；历史/我的 50%；单手机 70%。
- Normalization: 比较图只做等比包含和居中，没有拉伸、裁切或用截图替代手机页面。

## Findings

- No actionable P0/P1/P2 differences remain.
- P3: 全部视图用于看手机轮廓和四条线，不承担文字阅读；点击泳道或单手机进入 48%–70% 阅读层。

## Required fidelity surfaces

- Fonts and typography: 手机内使用运行原型的系统中文字体、真实字号和标题/正文/辅助信息层级，不再用 5–8px 文档缩略字充当页面。
- Spacing and layout rhythm: 14 个节点均由 `511 × 968` iPhone 素材和 `393 × 852` 内容屏构成；状态栏、标题栏、滚动内容区和 72px 底部导航保持一致。
- Colors and visual tokens: 复用米白、砖红、深绿和浅金；计划中状态仅在手机外用虚线和标签表达，不另造产品页面风格。
- Image quality and asset fidelity: Bezel 与 iOS 状态图标来自项目真实资产；手机页面仍为可交互 HTML/CSS，不是截图或占位图片。
- Copy and content: 手机内部只使用用户语言；`WeekPlan`、`Dish`、`HouseholdRule` 等工程对象只出现在画布外的交接箭头。

## Functional boundary checks

- 排菜单 4 屏：选周生成、五天十餐、自动换/去菜品库手选、确认保存。
- 菜品库 4 屏：搜索筛选、菜品详情、手选一道、计划中的菜品维护；选择结果交回排菜单。
- 历史 3 屏：按周列表、完整十餐只读详情、复制到下周；复制结果以新草稿交回排菜单。
- 我的 3 屏：规则摘要、规则编辑、保存结果，均明确标为计划中目标态。
- 未把运行原型尚未保证的数据语义标成“已实现”；普通节点统一标“工程目标”。

## Interaction and browser checks

- 14 个手机节点按 4/4/3/3 分布；4 个计划中节点；无审计卡、verdict 或横向文档卡。
- 四个泳道筛选均正确更新 `aria-pressed`；单手机聚焦为 70%，其余 13 台手机自动弱化。
- P02 横向区域为 `341 → 613px`，可查看周一至周五。
- P04 内容区为 `670 → 836px`，H02 为 `670 → 809px`；两页均包含 10 餐并可纵向滚动。
- P03“去菜品库手选”会聚焦菜品库；周切换、生成、历史展开和规则选项均产生可见状态变化。
- 三个辅助链接正确；页面运行日志无 warning / error。

## Comparison history

1. Earlier P0: 四条功能线使用横向任务卡和审计面板，缺少完整手机形态，点击后仍是文档缩略图。
2. First fix: 改为 14 个 iPhone 画板，但仍存在“已实现”虚报、手机内开发术语、五天十餐不完整和 58% 聚焦不足。
3. Final fix: 改用工程目标/计划中状态，清理手机内部术语，补齐五天与十餐滚动内容，增加手选交接，并把单手机聚焦提高到 70%。
4. Post-fix evidence: 全览和单手机截图均未发现剩余 P0/P1/P2 问题。

## Implementation checklist

- [x] 所有流程节点均为完整 iPhone 手机页面。
- [x] 四条线分别覆盖 4/4/3/3 个目标页面。
- [x] 计划能力仍以完整虚线手机页呈现。
- [x] 手机内没有开发审计或领域模型文案。
- [x] 五天、十餐、手选交接和目标状态完整。
- [x] 聚焦、缩放、拖动、滚动、筛选和页面状态交互通过。
- [x] 本地测试、页面构建、仓库 Pages 构建、diff check 和控制台检查通过。

final result: passed

---

# Design QA — 可运行工程原型

## Comparison target

- Source visual truth: `../prototype-customer/design-qa-screenshots/01-generate.png` (`1265 × 712`, 1×)，已确认的排好菜客户原型视觉系统。
- Rendered implementation: `design-qa-screenshots/implementation-runnable-viewport.png` (`884 × 777`, CSS viewport `884 × 777`, 1×)。
- Full-page evidence: `design-qa-screenshots/implementation-runnable-prototype.png` (`884 × 1367`)，包含运行原型和响应式下移的工程状态面板。
- Full-view comparison: `design-qa-screenshots/comparison-customer-runnable.jpg` (`1600 × 840`)；两侧分别等比包含在 `780 × 800` 比较单元中。
- Focused phone comparison: `design-qa-screenshots/comparison-phone-detail.jpg` (`980 × 700`)，对照手机主界面、色彩、卡片节奏和字体层级。
- State: 本周待生成；四个底部导航可见；工程原型使用初始 Mock 数据。
- Normalization: 原始画面尺寸不同，对比图仅等比缩放，没有拉伸或非等比变形。

本轮不复制客户原型的左侧讲解流程，而是复用其手机界面和视觉令牌，将默认页改为面向开发人员的可自由探索小程序。

## Findings

- No actionable P0/P1/P2 differences remain.
- P3: `884px` 宽视口下，工程状态面板移到手机下方，首屏不同时显示状态日志；这是为保证手机和交互可读性的有意响应式取舍。

## Required fidelity surfaces

- Fonts and typography: 沿用客户原型的系统中文字体栈、粗标题、小尺寸辅助文字和手机内容层级；未发现意外换行、裁切或字重漂移。
- Spacing and layout rhythm: 手机框、状态栏、周切换、规则卡、主按钮和底部导航保持稳定间距；黏性主按钮已上移 `72px`，不再被底部导航遮挡。
- Colors and visual tokens: 米白页面、砖红主操作、深绿成功态、浅绿信息卡和浅金规则提示均与客户原型一致，对比度和前后景平衡正常。
- Image quality and asset fidelity: 直接复用已有 iPhone 边框与 iOS 状态图标资产；应用内图标来自 Radix Icons，没有用文字符号、占位图或自制 SVG 代替。
- Copy and content: 运行原型文案只解释可操作状态、Mock 边界和工程用途；没有把用户反馈或任务指令直接写进产品界面。

## Interaction and browser checks

- 上一周、下一周和本周状态切换通过。
- 生成 → 选菜 → 自动换菜 → 确认 → 保存 → 历史展开通过。
- 历史复制到下周 → 从菜品库搜索并手选替换菜 → 返回编辑页通过。
- “排菜单 / 菜品库 / 历史 / 我的”四个底部导航均可点击，菜品库搜索和筛选正常。
- “页面地图”和“实现说明”辅助入口可访问，页面地图内容未丢失。
- 生产构建、顶层 Pages 构建和状态模型自检通过；运行原型控制台无 warning / error。

## Comparison history

1. Earlier P0: 确认与换菜页的黏性主按钮位于手机底部导航后方，真实点击无法触发保存。
2. Fix: 黏性操作区的底部偏移改为 `72px`，固定在底部导航上方。
3. Post-fix evidence: 完整浏览器链路从生成一直执行到保存和历史复制；`WeekPlan` 从 `empty` 正常变为 `draft` / `saved`，无剩余 P0/P1/P2 问题。

## Implementation checklist

- [x] 可运行手机界面作为工程原型默认入口。
- [x] 周切换、生成、换菜、手选、确认和保存共享同一份 `WeekPlan`。
- [x] 菜品库、历史和“我的”可从底部导航自由进入。
- [x] 页面地图和实现说明作为辅助视图保留。
- [x] 项目入口和 GitHub Pages 构建已识别新的 React 工程原型。

final result: passed
