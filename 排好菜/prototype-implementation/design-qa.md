# Design QA — 周菜单鼠标拖动

## 对照证据

- Source visual truth：`design-audit-screenshots/menu-drag-20260826/05-customer-after-scroll.png`（客户原型 `?step=menu`，`1265 × 1059 @1×`），菜单已横向查看到周三—周五，并选中周四午饭“啤酒鸭”。
- Rendered implementation：`design-audit-screenshots/menu-drag-20260826/02-after-drag.png`（运行原型本周修改页，`884 × 781 @1×`），同样查看周三—周五并选中“啤酒鸭”。
- Full-view comparison：`design-audit-screenshots/menu-drag-20260826/06-full-view-comparison.png`（`1624 × 731`），左侧客户原型、右侧运行原型。
- Focused comparison：`design-audit-screenshots/menu-drag-20260826/07-menu-region-comparison.png`（`920 × 480`），只比较两版周菜单横向滚动后的内容区。
- 归一化：两版均为应用内浏览器默认视口、device density `1×`；聚焦对照把两张截图中的菜单区域等宽缩放到 `448px`，仅用于检查列数、餐次轴、选中态和内容对应关系。
- State：5 天 × 午晚饭、荤菜视图、横向终点 `scrollLeft = 217.5`、周四午饭“啤酒鸭”被选中。

## 结论与发现

- 未发现需要继续处理的 P0 / P1 / P2 问题。
- 运行原型的周菜单现在同时支持手机左右滑动、触控板横向滚动和桌面鼠标按住拖动；从周一—周三可以直接拖到周三—周五。
- 拖动结束不会误触菜品，随后单击“啤酒鸭”仍会正确更新下方当前选择。
- P3：客户原型本身仍只依赖浏览器原生横向滚动；运行原型额外支持鼠标拖动，属于面向工程演示环境的输入兼容，不改变手机产品行为。

## 五项视觉验收

- 字体与层级：本轮没有更改字号、字重、行高或菜名层级；两版星期、日期、餐次和菜名层级一致。
- 间距与版式：仍保持首屏三天、午晚饭两行和固定餐次轴；拖动后周三—周五完整对齐，没有裁切或列宽漂移。
- 色彩与令牌：复用原有米白、深绿、红色菜品边线和浅绿选中态，没有新增可见颜色。
- 图片质量：本轮没有新增或替换图片资产；iPhone 外框和状态栏继续使用项目已有资源。
- 文案与内容：沿用“左右滑动查看周一至周五”的可访问名称，没有新增教学文案或把工程操作提示混入手机产品界面。

## 交互与工程检查

- 修复前复现：鼠标从菜单右侧拖向左侧后，`scrollLeft` 仍为 `0`。
- 修复后验证：相同拖动路径后，`scrollLeft` 从 `0` 变为 `217.5`，周四、周五进入可视区域。
- 点击保护：拖动过程不改变原选菜；拖动后单击“啤酒鸭”，当前选择更新为“周四午饭 · 荤菜”。
- 手机边界：触控继续交给原生横向滚动，鼠标拖动只在 `pointerType = mouse` 时接管。
- 控制台 warning / error：0。
- `npm test`：7/7；`npm run build:pages` 和 `git diff --check` 通过。

## 对照迭代记录

1. Earlier P1：周菜单虽然具备横向滚动结构，但桌面浏览器无法用鼠标直接拖动，工程师只能依赖触控板或横向滚轮，后两天看起来不可达。
2. Fix：在既有 `.day-carousel` 上增加鼠标 Pointer Events 拖动、5px 移动阈值、拖动后的点击抑制和抓取光标；不改变 DOM、列宽或手机触控滚动。
3. Post-fix evidence：浏览器实测 `scrollLeft = 217.5`，截图显示周三—周五与客户原型对齐，菜品单击仍正常。

final result: passed

---

# Design QA — 扩展推荐池与用户自主结束

## 对照证据

- Source visual truth：`design-audit-screenshots/dish-count-20260826/01-six-dish-limit.png`（`884 × 781 @1×`），原流程顶部写明 `1/6`，处理完固定六道后自动进入下一步。
- Rendered implementation：`design-qa-screenshots/expanded-picker-20260826/00-picker-start.png`（`884 × 781 @1×`），同一新用户、同一首张土豆烧牛肉、同一应用内浏览器视口。
- Full-view comparison：`design-qa-screenshots/expanded-picker-20260826/comparison-six-vs-expanded.png`（`1768 × 781`），左侧原方案、右侧修改后方案。
- Focused comparison：`design-qa-screenshots/expanded-picker-20260826/comparison-phone-focus.png`（`680 × 650`），只比较两版手机内容区。
- 交互状态：`design-qa-screenshots/expanded-picker-20260826/02-picker-selected-full.png` 展示连续挑选 5 道后的分类计数与自主结束入口；`03-supplement-after-finish.png` 展示用户主动结束后进入补充菜品。
- 页面地图：`design-qa-screenshots/expanded-picker-20260826/04-page-map-o04.png`，同一自主挑菜节点的静态故事帧。
- 归一化：原方案和实现均为 CSS viewport `884 × 781`、device density `1×`；全景对照未缩放，聚焦对照从两张原图的相同手机区域等尺寸裁切。

## 结论与发现

- 未发现需要继续处理的 P0 / P1 / P2 问题。
- 固定六道已改为 18 道真实图片推荐池；挑完任意一道后，用户即可通过“我选得差不多了”主动进入下一步。
- 选菜不会因为到达固定数量自动结束；看完全部推荐后也停留在当前步骤，用户可以结束或再看一遍。
- P3：18 道是工程原型用来验证连续推荐与退出机制的内容规模，正式菜品内容仍可继续扩展或分批加载。

## 五项视觉验收

- 字体与层级：沿用既有系统中文字体、菜名、主料、辅助说明和主操作层级；新增自主结束入口没有抢过当前菜品的视觉主位。
- 间距与版式：照片卡、两项判断、撤销、分类计数和结束入口均在手机首屏完整可见，没有裁切或横向溢出。
- 色彩与令牌：新增入口只复用米白、深绿、浅绿和现有边框色；禁用态与可用态清晰区分。
- 图片质量：新增 12 张图片与原 6 张均为独立 `640 × 640` JPEG；主体、桌面、器皿、光线和裁切方向一致，无重复照片、占位图、文字或水印。
- 文案与内容：去掉固定 `1/6` 的完成暗示，改为“已看 / 已选 / 荤素汤分类计数”；结束按钮明确由用户决定。

## 交互与工程检查

- 已验证：加入 → 跳过 → 撤销 → 连续加入 4 道 → 主动结束 → 进入补充菜品。
- 主动结束前状态：已选 5 道，荤 2 / 素 2 / 汤 1；下一步正确显示 5 张缩略图。
- 模型测试覆盖：18 道推荐池不会自动跳步、用户主动结束、返回继续挑、看完全部推荐和补充自家菜。
- 页面地图 O04 聚焦正常，手机内部按钮数为 0，保持纯静态展示。
- 运行原型与页面地图控制台 warning / error：0。
- `npm test`：7/7；`npm run build:pages` 和 `git diff --check` 通过。

## 对照迭代记录

1. Earlier P1：固定 `1/6` 把工程验证样本错误表达成产品完成条件，并在第六道后由系统自动结束。
2. Fix：扩充到 18 道真实菜品卡；新增始终可见的自主结束入口；取消固定数量自动跳步；加入分类计数、全部看完和重新查看状态。
3. Post-fix evidence：同状态手机聚焦对照显示原卡片体系保持不变，只增加用户控制；交互截图证明在第 5 道即可主动进入补充步骤。

final result: passed

---

# Design QA — 可运行首次准备与工程演示状态

## 对照目标

- 流程基准：`design-qa-screenshots/page-map-full-static-onboarding-20260825.png`，页面地图既定的 O01—O06 首次准备叙事。
- 可运行首屏：`design-qa-screenshots/runnable-onboarding-welcome-20260825.png`（`884 × 781 @1×`）。
- 家庭设置：`design-qa-screenshots/runnable-onboarding-household-20260825.png`（`884 × 781 @1×`）。
- 家庭人数修订：`design-qa-screenshots/runnable-onboarding-household-input-20260825.png`（`884 × 781 @1×`），由固定的 2 / 4 / 6 人改为可输入 1—20 人的数字步进器。
- 自定义餐型：`design-qa-screenshots/runnable-onboarding-custom-pattern-20260825.png`（`884 × 781 @1×`）。
- 完成摘要：`design-qa-screenshots/runnable-onboarding-ready-20260825.png`（`884 × 781 @1×`）。
- 设置生效：`design-qa-screenshots/runnable-configured-menu-20260825.png`（`884 × 781 @1×`），7 天、仅晚饭、每餐 2 荤 1 素 1 汤的真实生成结果。

## 结论

- 未发现需要继续处理的 P0 / P1 / P2 问题。
- 手机外新增“演示状态”盒，工程师可随时重置为新用户或跳过首次准备；控制项没有混入手机产品界面。
- 手机内新增 6 步真实交互流程：欢迎、家庭设置、每餐结构、推荐菜品、确认菜品池、准备完成。
- 完成首次准备后，人数、餐次、天数、自定义餐型和菜品池数量会进入“我的”、菜品库和实际菜单生成；跳过则载入默认家庭数据。

## 重点验收面

- 视觉一致性：沿用运行原型的 iPhone 框、米白背景、深绿主操作、蓝灰选择态和现有字号层级，没有复制页面地图截图。
- 状态真实性：家庭设置、餐型步进器和菜品勾选都会改变最终摘要；示例验证 `2 荤 1 素 1 汤` 会得到每餐 4 道、5 天 40 道。
- 工程边界：演示状态盒明确标注只影响本地 Mock；刷新按网址恢复当前演示模式和首次准备步骤。
- 可达性：所有选择都有按钮语义和 `aria-pressed`；返回、增减数量及主要操作均有可读名称。

## 自动化与浏览器检查

- “重置为新用户”会清空三周菜单并进入第 1/6 步。
- O01 → O06 全路径通过，38 道菜品池可逐道增删，最终摘要与设置一致。
- “去排第一周菜单”会回到可生成的本周首页，并继续使用确认后的菜品池。
- 非默认设置也已走通：7 天、仅晚饭、2 荤 1 素 1 汤会生成 7 天 7 餐、共 28 道菜；菜单中不会混入午饭。
- “跳过首次准备”会直接回到默认的 4 人、午晚饭、5 天、2 荤 2 素 1 汤、38 道菜品状态。
- `npm test`、`npm run build`、`npm run build:pages`、Pages 完整构建和 `git diff --check` 通过。

final result: passed

---

# Design QA — 仅保留运行原型与页面地图

## 对照目标

- 调整前：`design-qa-screenshots/page-map-full-static-custom-meal-20260825.png`（`884 × 781 @1×`），O03 每餐结构节点、70% 单手机聚焦，顶部包含“运行原型 / 页面地图 / 实现说明”。
- 调整后：`design-qa-screenshots/page-map-two-view-navigation-20260825.png`（`884 × 781 @1×`），同一节点、同一聚焦比例，顶部只保留“运行原型 / 页面地图”。
- 运行原型：`design-qa-screenshots/runnable-two-view-navigation-20260825.png`（`884 × 781 @1×`）。
- 项目入口：`design-qa-screenshots/project-entry-two-view-copy-20260825.png`（`884 × 781 @1×`）。
- 归一化：页面地图前后截图使用同一应用内浏览器视口、设备密度、节点和画布状态，没有裁切或拉伸。

## 结论

- 未发现需要继续处理的 P0 / P1 / P2 问题。
- 公开工程原型只保留“运行原型”和“页面地图”；实现说明不再出现在导航、项目入口文案或 Pages 构建产物中。
- `engineering-model.html` 源文件作为未公开草稿保留，不参与当前部署。

## 重点验收面

- 字体与层级：两项导航沿用原字号、字重和选中态，没有重命名或新增层级。
- 间距与版式：分段控件宽度随三项缩为两项后仍保持居中；运行原型和页面地图的左右页头关系不变。
- 色彩与令牌：继续使用原有米白背景、浅绿选中态和黑色客户原型按钮。
- 图片与素材：本轮没有新增、替换或裁切图片资产。
- 文案与内容：项目入口只描述“可运行小程序 + 静态页面地图”，不再暗示存在公开实现说明。

## 导航与构建检查

- 运行原型导航：`运行原型 / 页面地图`；实现说明链接数：0。
- 页面地图导航：`运行原型 / 页面地图`；实现说明链接数：0。
- 项目入口正文包含“页面地图”，不包含“实现说明”。
- Vite 构建产物只有 `index.html` 和 `page-map.html`，不再生成 `engineering-model.html`。
- `npm test`、`npm run build:pages`、Pages 完整构建和 `git diff --check` 通过。

## 修改记录

1. Earlier P1：实现说明与运行原型、页面地图并列，容易把技术方案和验收计划误认为高保真原型的一部分。
2. Fix：移除两个公开页面和项目入口中的实现说明入口，同时从 Vite 多页面构建中撤下；源文件保留为本地草稿。
3. Post-fix evidence：同状态页面地图前后对照只发生导航项收缩，手机画布与产品内容没有视觉漂移；运行原型与项目入口文案同步通过。

final result: passed

---

# Design QA — 全静态页面地图与自定义餐型

## 对照目标

- 视觉基准：`design-qa-screenshots/page-map-static-onboarding-20260825.png`（`884 × 781 @1×`），此前确认的家庭设置手机、画布、设备框和产品视觉令牌。
- 同状态实现：`design-qa-screenshots/page-map-full-static-onboarding-20260825.png`（`884 × 781 @1×`），同一 O02 家庭设置节点、70% 单手机聚焦。
- 新增内容：`design-qa-screenshots/page-map-full-static-custom-meal-20260825.png`（`884 × 781 @1×`），O03 每餐结构节点、70% 单手机聚焦。
- 归一化：所有截图使用同一应用内浏览器视口、设备密度和画布视觉体系，没有裁切、拉伸或密度转换。

## 结论

- 未发现需要继续处理的 P0 / P1 / P2 问题。
- 页面地图中的手机内容已全部变为静态故事帧；点击手机内视觉控件只会按画布规则聚焦当前手机，不会推进、返回、切换、输入或提交。
- 每餐结构从三个固定预设扩展为“三个常用预设 + 自定义搭配”，首次准备和家庭规则修改两处保持一致。

## 重点验收面

- 字体与层级：沿用现有系统中文字体、标题、辅助文字和选中态层级；“自定义搭配”与三个预设使用同一标签规格，没有异常换行。
- 间距与版式：O03 四个选项在同一行完整展示；Q02 新增每餐结构后，计划中提示、四组设置、保存状态和底部导航仍完整可见。
- 色彩与令牌：保留米白、深绿、蓝灰选中态和计划中砖红虚线，没有新增配色或强调层级。
- 图片与素材：继续使用项目内真实 iPhone Bezel 和状态栏素材，没有新增或替换图片资产。
- 文案与内容：三个预设负责快速理解常用结构，“自定义搭配”明确说明产品不被三个固定组合限制；手机内容仍保持中文用户语言。

## 静态边界与浏览器检查

- `.phone-node button`：0；`.phone-node input`：0；静态视觉控件：165。
- “自定义搭配”出现 2 次，分别位于首次准备和规则修改。
- 点击 O01 的“开始准备”视觉控件后，焦点仍为 O01，没有推进到 O02。
- 画布顶部旅程筛选与缩放控件保持可用；手机画板仍可点击聚焦。
- `npm test`、`npm run build:pages`、Pages 完整构建和 `git diff --check` 通过。

## 修改记录

1. Earlier P1：页面地图虽然把部分选项改成静态，但手机内的下一步、返回、导航、搜索、筛选和提交仍会真实改变状态，页面地图与运行原型职责没有彻底分开。
2. Earlier P2：每餐结构只展示三个固定组合，无法表达家庭可以设置其他搭配。
3. Fix：统一把所有手机内控件渲染为静态视觉元素，删除手机业务交互；保留画布级查看能力，并在两处餐型设置中增加“自定义搭配”。
4. Post-fix evidence：同状态 O02 视觉与基准一致；O03 和 Q02 均完整呈现四个餐型入口；自动化检查未发现手机内按钮或输入框。

final result: passed

---

# Design QA — 静态状态与全中文画布

## 对照目标

- 调整前：`design-qa-screenshots/page-map-e2e-onboarding-20260825.png`（`884 × 781 @1×`），首次准备节点中的家庭人数、餐次、天数等状态仍呈现为可切换控件，步骤和连接器混有英文编号及领域名。
- 调整后：`design-qa-screenshots/page-map-static-onboarding-20260825.png`（`884 × 781 @1×`），同一首次准备旅程、同一家庭设置节点、70% 单手机聚焦。
- 归一化：两张截图使用同一应用内浏览器视口、同一画布视觉体系；没有裁切、拉伸或密度转换。

## 结论

- 未发现需要继续处理的 P0 / P1 / P2 问题。
- 核心旅程中的人数、餐次、天数、餐型、菜品池和候选菜统一展示为既定故事状态，不再承担临时选择行为。
- 流程推进、返回、跨入口跳转、旅程筛选、手机聚焦、拖动和缩放仍然可用。
- 画布渲染结果中没有可见英文；步骤、箭头、状态和结果全部使用中文。

## 重点验收面

- 交互语义：`O02 / O03 / O05 / Q02 / W03 / W04` 的状态选项均为静态标签或卡片；需要展示另一状态时，应新增流程节点，而不是在同一张手机内切换。
- 视觉表达：静态选中态仍保留颜色差异，用于说明“这一帧当前是什么状态”，但不再使用按钮语义、点击事件或手型光标。
- 中文一致性：手机外的步骤标识改为“步骤 01”等中文形式；连接器只保留“先说清家里怎么吃”“人数餐次决定排多少”等中文用户语言。
- 叙事连续性：`O01 → O02 → O03 → O04 → O05 → O06 → W01` 仍可通过主要操作前进，静态状态不会阻断首次准备闭环。

## 自动化与浏览器检查

- O02 家庭设置选项按钮数：0；O03 餐型选项按钮数：0；Q02 规则选项按钮数：0。
- O05 菜品池候选按钮数：0；W03 / W04 换菜候选按钮数：0。
- 可见英文扫描结果：0 项。
- 页面控制台 warning / error：0 项。
- `npm test`、`npm run build:pages`、Pages 完整构建和 `git diff --check` 通过。

## 修改记录

1. Earlier P2：核心旅程中的故事状态被做成可切换按钮，但切换结果不会贯穿后续节点，造成“可以改、实际没改变”的错误暗示。
2. Earlier P2：步骤标题和连接器混有 `Household`、`MealSchedule` 等英文技术词，与中文客户旅程表达不一致。
3. Fix：把核心旅程状态控件改为静态标签与卡片，并把所有画布可见技术标识改成中文；只保留真正推动旅程的按钮。
4. Post-fix evidence：同视口聚焦截图显示 O02 仍能清楚表达“4 人、午晚饭、5 天”的既定状态，左右连接器为全中文；自动化扫描未发现剩余英文或伪选择按钮。

final result: passed

---

# Design QA — 首次准备旅程与只读菜单总览

> 历史检查记录：其中关于选项可切换的结论已被上一节“静态状态与全中文画布”取代。

## Comparison target

- Source visual truth: `design-qa-screenshots/page-map-e2e-all-before-20260825.jpg`、`design-qa-screenshots/page-map-e2e-weekly-before-20260825.jpg`（均为 `884 × 781 @1×`），本轮修改前已确认的画布、手机框、产品令牌和周菜单泳道。
- Rendered implementation: `design-qa-screenshots/page-map-e2e-all-20260825.png`、`design-qa-screenshots/page-map-e2e-weekly-lane-20260825.png`（均为 CSS viewport `884 × 781`、1×）。
- Focused evidence: `design-qa-screenshots/page-map-e2e-onboarding-20260825.png`、`design-qa-screenshots/page-map-e2e-weekly-readonly-20260825.png`，分别检查首次准备前三步与 W02 只读菜单总览。
- State: “全部”10%；“首次准备 / 本周排菜”46%；W02 单手机70%。
- Normalization: 修改前与修改后使用同一浏览器视口、同一页面地图视觉体系和同一泳道聚焦状态；未做裁切、拉伸或密度转换。

## Findings

- No actionable P0/P1/P2 differences remain.
- P3: “全部”视图因新增一条完整旅程从12%降为10%，该视图只负责展示整体结构；点击泳道后仍为46%，手机文字和交互保持可读。

## Required fidelity surfaces

- Fonts and typography: 延续系统中文字体、节点编号、手机标题、正文和辅助文字层级；新增首次准备文案没有溢出、截断或异常换行。
- Spacing and layout rhythm: 五条泳道统一左对齐；新增泳道沿用 `511 × 968` 手机框、100px连接器、1120px泳道高度和既有圆角阴影。顶部六项筛选在884px视口完整显示。
- Colors and visual tokens: 新流程只使用既有米白、深绿、浅金和计划中砖红虚线，没有引入新的产品配色。
- Image quality and asset fidelity: 继续复用真实 iPhone Bezel 与 iOS 状态图标；没有新增截图式手机页、占位图、自制SVG或伪图标。
- Copy and content: 首次准备明确区分“家庭餐次 / 每餐结构 / 菜品池”；W02明确标为“只读对照”，菜单格不再伪装成可修改按钮。

## Interaction and browser checks

- 首次准备主路径通过：`O01 → O02 → O03 → O04 → O05 → O06 → W01`。
- 家庭人数单选会更新 `aria-pressed`；餐型切换会把摘要从“每天10道 / 一周50道”更新为“每天8道 / 一周40道”。
- 菜品确认支持逐道加入或移除，计数与菜品池充足提醒同步更新。
- W02周菜单格共有10个只读 `.dish-cell`，其中按钮数为0；“当前查看：荤菜”没有按钮语义；只有“换这道”进入 `W03`。
- 顶部“全部 / 首次准备 / 本周排菜 / 复用上周 / 规则变更 / 补充验证”筛选、拖动、缩放、适配和手机聚焦保持可用。
- 浏览器控制台无 warning / error。

## Comparison history

1. Earlier P1: 页面地图从已具备菜品池的本周菜单开始，缺少新用户如何建立家庭餐型和可用菜品池的主旅程。
2. Earlier P2: W02菜单格和分类标签使用按钮与选中态，但点击不能产生真实修改，形成错误操作暗示。
3. Fix: 新增6屏“首次准备”泳道，并接入第一次排菜；把菜单格和查看标签改为只读语义，只保留明确的“换这道”操作入口。
4. Post-fix evidence: 同视口的全览与本周泳道对照保留原视觉体系；首次准备和W02聚焦截图未发现剩余P0/P1/P2问题。

## Implementation checklist

- [x] 新用户能完成家庭餐次、默认餐型和菜品池准备。
- [x] 首次准备完成后进入第一次排菜。
- [x] 周菜单格不再可点击或呈现选中态。
- [x] 换菜仍从明确操作入口完整进入候选流程。
- [x] 四条客户旅程和补充验证拥有独立筛选。
- [x] 构建、自动化点击、视觉对照与控制台检查通过。

final result: passed

---

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
