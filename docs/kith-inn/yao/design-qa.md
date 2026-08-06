# Kith Inn 双轨原型 · Design QA

## 对照对象

- 客户版视觉真相：`/Users/miyin/code for people/ideal/牛马互助平台/prototype-customer/index.html`
- 工程版结构真相：`/Users/miyin/code for people/ideal/牛马互助平台/prototype-implementation/index.html`
- 迁移前角色原型：
  - `/Users/miyin/code for people/cfp-mono/docs/kith-inn/prototype-taozi/index.html`
  - `/Users/miyin/code for people/cfp-mono/docs/kith-inn/prototype-customer/index.html`
- 产品内容真相：
  - `/Users/miyin/code for people/ideal/docs/kith-inn/yao/product-decisions.md`
  - `/Users/miyin/code for people/ideal/docs/kith-inn/yao/user-stories.md`
- 实现：
  - `http://127.0.0.1:4174/ideal/docs/kith-inn/yao/prototype-customer/?step=generate`
  - `http://127.0.0.1:4174/ideal/docs/kith-inn/yao/prototype-customer/?step=menu`
  - `http://127.0.0.1:4175/ideal/docs/kith-inn/yao/prototype-implementation/`

## 截图与归一化

- 浏览器：Codex Desktop 内置浏览器。
- CSS viewport：`1280 × 720`；`devicePixelRatio = 2`。
- 客户版参考截图：`/tmp/kith-migration-source/ref-customer.jpg`，`1277 × 998 px`。
- 客户版最终截图：`/tmp/kith-migration-source/final-customer-menu.jpg`，`1265 × 998 px`。
- 客户版订单对账截图：`/tmp/kith-migration-source/final-customer-ledger.jpg`，`1265 × 998 px`。
- 工程总蓝图最终截图：`/tmp/kith-migration-source/final-blueprint.jpg`，`1265 × 1604 px`。
- 全屏并排证据：`/tmp/kith-migration-source/compare-customer-final.jpg`，`2530 × 1050 px`。
- 手机区域并排证据：`/tmp/kith-migration-source/focus-customer-phone-final.jpg`，`1150 × 902 px`。
- 角色原型迁移证据：`/tmp/kith-migration-source/compare-customer-migration.jpg`，`2530 × 1052 px`。
- 归一化：参考客户截图按宽度从 `1277 px` 等比缩放到 `1265 px`，与实现顶端对齐；聚焦比较使用两张截图中等大的 `575 × 850 px` 手机区域。浏览器输出已归一为 CSS 像素级截图，未按 DPR 再放大。

## 状态

- 客户版：`step=generate`、`step=menu`、`step=share`、`step=orders` 与 `step=reconcile`。
- 工程总蓝图：默认首屏和完整页面。
- 桃子端：`step=orders`，并打开“手动补一单”。
- 顾客端：从 `step=entry` 进入，再切换到底部“订单”。

## 全屏对照结论

- 信息架构：客户版保持参考原型的“左侧价值叙事 + 右侧 iPhone 结果 + 底部讲解顺序”，用一页讲清菜单生成，再用四页呈现修改菜单、微信确认、订单管理和订单对账。
- 字体与层级：继续使用系统中文字体栈；大标题、正文、证明条目、手机内标题的字重和行高与参考一致，未发现溢出或错误换行。
- 间距与布局：桌面双栏比例、手机大小、圆角、卡片间距和底部讲解控件保持参考节奏；四个客户页面的手机内容 `scrollHeight = clientHeight = 648`，没有隐藏主按钮。
- 颜色与 token：沿用街坊味既有的米白、砖红、墨黑、绿色与金色；客户版继承参考原型的对比关系，工程版继承现有角色原型的同一套 token。
- 图片质量：使用现有 `kith-inn-logo.png`，没有用 CSS 图形、占位图或自制 SVG 替代品牌资产；刷新控件继续使用原有 `refresh-cw.svg`。
- 文案：客户版依次聚焦生成菜单、修改菜单、微信双向确认、订单管理和订单对账；五页均以工程角色原型的菜单、订单与候选对账数据为准，只压缩非核心配置过程。

## 聚焦区域对照结论

- `focus-customer-phone-final.jpg` 显示两边手机画框、状态栏、导航栏、深色主卡、证明数据与主按钮的密度一致。
- Kith Inn 结果卡有意比参考价值主张页更数据化，但仍保持相同的视觉重心、圆角系统和金色强调，不属于设计漂移。
- `compare-customer-migration.jpg` 显示顾客端角色原型在迁移前后像素结构一致；新增的“返回工程总蓝图”是有意增加的外部讲解导航，不改变 App 内部结构。

## 比较历史

### Pass 1

- [P1 · 内容] 客户版和工程总蓝图沿用了早期“收款截图辅助对账”的表述，与最新 PRD “不记录截图，只手工维护收款状态”冲突。
- [P2 · 导航] 迁移后的桃子端与顾客端只能互相切换，缺少回到工程总蓝图的明确入口。

修复：

- 客户版最终页改为订单自动汇总、按订单编号或顾客查找、桃子手工标记收款；微信群页补充顾客下单后回传的订单提醒卡片。
- 工程总蓝图明确 P0 不接支付、不保存截图，并链接最新 User Stories。
- 两个角色原型都增加“返回工程总蓝图”，同时保留原有角色切换和 App 底部导航。

### Pass 2

- 视觉证据：`compare-customer-final.jpg`、`focus-customer-phone-final.jpg`、`compare-customer-migration.jpg`。
- 未发现剩余 P0 / P1 / P2 视觉、内容或交互问题。

## 交互与控制台验证

- 客户版：五个步骤可通过主按钮和底部箭头依次切换；手机左上角返回可回到上一个结果；URL `?step=` 同步更新。
- 桃子端：底部“订单”可达；“手动补一单”能打开表单；四个 App 底部入口仍在。
- 顾客端：微信群卡片可进入预订；底部“订单”可达；两项 App 底部入口仍在。
- 工程总蓝图：桃子端、顾客端、直接看订单、PRD、产品决策、领域词汇和 User Stories 入口均存在。
- 客户版、工程总蓝图、桃子端、顾客端控制台错误：无。
- 所有 HTML 内联脚本均通过 JavaScript 语法解析。

## 后续 P3

- 当前 QA 以会议讲解使用的桌面画布为主；小于 `560 px` 的移动外层布局有响应式规则，但未在本轮单独截图对照。手机内 App 画框仍保持固定原型尺寸。

## 菜单对齐专项 · 2026-08-04

- 参考源：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-implementation/prototype-taozi/index.html?step=plan`。
- 实现：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-customer/index.html?step=menu`。
- 浏览器与状态：Codex Desktop 内置浏览器；工程师版菜单已生成、五天默认收起；展示版同状态。
- 参考截图：`/tmp/kith-menu-align/reference-engineer-current.png`，`1292 × 884 px`。
- 实现截图：`/tmp/kith-menu-align/after-showcase.png`，`1277 × 874 px`；比较前归一到参考截图尺寸。
- 全屏并排证据：`/tmp/kith-menu-align/comparison.png`，`2584 × 884 px`；左侧为工程师版，右侧为展示版。
- 对齐范围：手机标题、状态栏、周切换、日期范围、发布锁定状态、五天菜单卡、确认按钮、桃子端底部导航；外层讲解步骤编号和受众提示保留各自语境。
- 内容核对：两版使用同一组五天十餐菜品与 `2荤2素1汤` 结构；周一已发布只读，其余四天可展开换菜。
- 交互核对：周二可展开/收起；未发布菜品可打开同类候选并完成替换；周一展开后只有“已发布”标记，没有换菜入口。
- 比较历史：Pass 1 发现展示版只呈现三行压缩摘要、缺少五天展开和底部导航；本轮替换为工程师版同一信息结构。Pass 2 并排比较未发现剩余 P0 / P1 / P2 内容、交互或视觉漂移。
- JavaScript 语法检查通过；浏览器 DOM 与核心交互检查通过。

## 订单管理可读性专项 · 2026-08-04

- 审查对象：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-customer/index.html?step=orders`。
- 修改前截图：`/tmp/kith-orders-audit/01-before.jpg`。
- 修改后截图：`/tmp/kith-orders-audit/02-after.jpg`。
- 并排证据：`/tmp/kith-orders-audit/03-before-after.jpg`；左侧为修改前，右侧为修改后。
- 主要问题：统计数字在外层讲解、手机摘要和筛选区重复；独立的长期申请审核卡把“查看备餐订单”打断成另一个处理流程，增加展示版的心智负担。
- 调整结果：手机首屏收敛为“明日 12 份总览 → 午晚饭筛选 → 订单列表”；长期审核卡、处理按钮和相关状态分支全部删除，订单卡继续使用双行紧凑结构。
- 内容保持：仍包含 9 份明日短单和长期订单，以及周阿姨、王叔、陈姐、刘阿姨四笔订单；王叔的长期申请继续显示“待审核”，但本页不展示审核处理卡或操作按钮。
- 交互验证：订单页默认展示午饭，可切换全部或晚饭；订单底部导航保持可达。
- 控制台错误：无。

## 微信确认首屏专项 · 2026-08-04

- 审查对象：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-customer/index.html?step=share`。
- 修改前截图：`/tmp/kith-share-audit/01-before.jpg`。
- 修改后截图：`/tmp/kith-share-audit/02-after.jpg`。
- 并排证据：`/tmp/kith-share-audit/03-before-after.jpg`；左侧为修改前，右侧为修改后。
- 主要问题：桃子文字、桃子开饭卡、顾客确认气泡和顾客订单卡均使用大间距时，会导致最后一张订单回执卡被手机可视区截断。
- 调整结果：采用微信式“桃子说明 → 开饭卡片 → 顾客确认气泡 → 客观订单回执卡”消息顺序；头像缩至 34px，卡片宽度、内边距、标题和消息间距同步收紧。
- 首屏验证：四段消息与输入栏仍可在同一手机首屏呈现；顾客自己的表达留在右侧绿色气泡，回执卡不再使用“周阿姨已经订好了”这类替顾客说话的标题。
- 内容保持：桃子的开饭时间、午晚饭菜单、发布锁定、周阿姨午饭 2 份与晚饭 1 份、地址、订单号和反向提醒均保留。
- 控制台错误：无。

## 微信订单回执参考对齐 · 2026-08-04

- Source visual truth：`/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-54c5c964-2782-4c66-bbb9-c6975ed8bcf1.png`，`1986 × 1684 px`。
- Implementation：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-customer/index.html?step=share`；浏览器截图 `/tmp/kith-reconcile-audit/04-share-card.jpg`，`1265 × 998 px`。
- Viewport：`1280 × 720 CSS px`，`devicePixelRatio = 2`；浏览器截图输出已归一为 CSS 像素，不再按 DPR 放大。
- State：微信群内“桃子发明日菜单 → 顾客确认午晚饭份数 → 顾客分享订单回执”。
- Full-view comparison：`/tmp/kith-reconcile-audit/05-reference-implementation.jpg`；参考图按高度等比缩放为 `1177 × 998 px`，与实现 `1265 × 998 px` 顶端对齐。
- Focused comparison：`/tmp/kith-reconcile-audit/06-phone-focus.jpg`；参考手机区域归一为 `388 × 748 px`，实现手机区域为 `390 × 748 px`。
- 字体：继续使用原型既有系统中文字体栈；聊天正文、卡片状态、标题、订单号保持与参考相同的三级层级，没有异常换行或截断。
- 间距：消息顺序、左右对齐、卡片密度和首屏占用与参考一致；当前实现已补齐参考图中的送达说明和付款提醒。
- 色彩：保留微信灰背景、顾客绿色气泡、街坊味砖红状态和淡红信息区；与参考的语义颜色一致。
- 图片：沿用现有 `kith-inn-logo.png`，没有新增替代品牌资产或低清占位图。
- 文案：卡片从“周阿姨已经订好了”改为客观状态“订单已提交”，顾客主观表达只出现在本人绿色气泡中；这是为匹配产品实际的“平台不收款”边界而做的有意差异。
- 交互：两张小程序卡片继续可点击进入后续讲解；浏览器运行错误为 0。
- 比较历史：Pass 1 发现卡片标题替顾客说话，且缺少参考图中的“本人气泡 → 客观回执”层级；修复后 Pass 2 的全屏与手机聚焦对照未发现剩余 P0 / P1 / P2。

## 对账清单专项 · 2026-08-04

- 修改前：`/tmp/kith-reconcile-audit/01-before.jpg`；修改后：`/tmp/kith-reconcile-audit/02-after.jpg`。
- 展示版把模拟时间推进到 9 月，按周五至周二四个日期归纳九笔到账记录；分组标题以星期为主标题、具体日期为次级小字，不再使用“今天 / 昨天”。小太阳、李家和 9 月 2 日的小赵保留待处理，其余记录演示系统划掉或桃子手动划掉。
- 系统代划展示“顾客名、金额、日期与订单唯一匹配”的明确依据；桃子手动划掉只显示操作来源，不要求填写理由。
- 颜色对齐：统计卡、复选框和完成状态统一使用街坊味品牌绿；待处理状态使用品牌红；页面继续使用暖白背景与既有描边色，不再出现系统默认蓝色控件。
- 信息精简：删除占据首屏的大型总进度卡，不再重复展示总笔数、已划掉数量或来源统计；每个日期标题自身的 `1/3`、`2/2` 和状态方块已经足够表达进度。
- 展开交互：订单对账页首次打开时所有日期默认收起；日期标题整行保持可点击，右侧展开／收起控件为 `32 × 32px` 的高对比色按钮，各日期均可独立展开、收起。
- 产品边界：清单状态不等于平台收款；歧义项和无匹配项不会被系统自动划掉。
- JavaScript 语法检查通过；展示版、微信页和工程师版浏览器运行错误均为 0。

## 送达后付款提醒专项 · 2026-08-05

- Source visual truth：`/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-f7c86b77-507a-43c0-81a6-57daafeb1352.png`，`1986 × 1684 px`。
- Implementation：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-customer/index.html?step=share`；浏览器截图 `/tmp/kith-meal-reminder/01-after.jpg`，`1265 × 998 px`。
- Viewport：`1280 × 720 CSS px`，`devicePixelRatio = 2`；浏览器截图输出已归一为 CSS 像素。
- State：微信群内“桃子发明日菜单 → 顾客订单回执 → 桃子标记送达 → 未确认收款提醒”。
- Full-view comparison：`/tmp/kith-meal-reminder/02-full-comparison.jpg`；参考图按高度等比缩放为 `1177 × 998 px`，与实现 `1265 × 998 px` 顶端对齐。
- Focused comparison：`/tmp/kith-meal-reminder/03-phone-comparison.jpg`；参考手机区域归一为 `388 × 748 px`，实现手机区域为 `390 × 748 px`。
- 字体：沿用系统中文字体栈；“已送达 · 待确认收款”、金额、餐次和订单号形成清晰层级，无异常换行或截断。
- 间距：六段消息与底部输入栏仍在同一手机首屏；消息区 `clientHeight = scrollHeight = 648px`，最后一张付款提醒卡底部 `787.86px`，输入栏顶部 `816px`，未发生遮挡。
- 色彩：送达气泡继续使用微信白色消息样式；付款提醒用街坊味金色描边和淡金信息区，与参考中的“待付款”状态一致。
- 图片：继续复用 `kith-inn-logo.png`，没有新增替代图标、占位图或低清资产。
- 文案：一次提交午饭和晚饭时，订单回执明确拆成两笔餐次订单；中午只说明“午饭已送到门口”，提醒卡仅显示午饭订单号、2 份和 ¥60，晚饭继续保持未履约状态。应付动作明确为“微信转账给桃子”，没有伪装成小程序支付。
- 交互：付款提醒卡可进入订单管理；浏览器运行错误为 0。
- 比较历史：Pass 1 相对参考图缺少“送达说明 → 待付款提醒”后半段流程，属于 P1 内容缺口；补齐后 Pass 2 的全屏和手机聚焦对照未发现剩余 P0 / P1 / P2。

## 菜单生成与十餐修改专项 · 2026-08-05

- 工程生成页参考：`/Users/miyin/code for people/ideal/docs/kith-inn/yao/prototype-implementation/prototype-taozi/index.html?step=plan` 的未生成状态。
- 换菜交互参考：用户指定的 `/cfp-mono/docs/kith-inn/prototype/menu-brain.html`；本地解析到 `/Users/miyin/code for people/cfp-mono-worktrees/community-cooking-mock-ui/docs/kith-inn/prototype/menu-brain.html`。
- Source visual truth：`/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-6015be0d-c41e-427a-9e30-6f8e9c245652.png`，`688 × 794 px`。
- Viewport：Codex Desktop 内置浏览器 `1280 × 720 CSS px`；实现全屏截图为 `1265 × 712 px`。
- Implementation：`step=generate` 先展示与工程师版一致的“本周还没有菜单 → 10 餐待安排 → 生成本周菜单”；点击后进入 `step=menu` 的修改过程，确认十餐后进入 `step=overview` 的只读本周菜单总览，再继续生成按天分享的预订卡片。
- 结构核对：不再拆成午餐、晚餐两张表；改为一张 `餐次 / 荤1 / 荤2 / 素1 / 素2 / 汤` 六列表，十行依次为 `周一午饭、周一晚饭、周二午饭、周二晚饭……周五晚饭`，完整覆盖十个餐次和五十个菜品按钮。
- 标题层级：每行以周一至周五为主要标签，午饭或晚饭用小字号放在其下方；星期与餐次的字号已按最新要求对调。
- 字体与间距：继续使用系统中文字体；标题、徽章、表头、菜品名、详情和按钮仍沿用参考图的层级、色彩与紧凑间距，十行可在手机内连续滚动查看。
- 色彩与资产：荤菜淡红、素菜淡绿、汤淡蓝、当前选中红色双描边、通过状态浅绿徽章均按参考图还原；参考组件没有图片资产，因此没有新增图标或装饰素材。
- 文案与数据：视觉结构完全沿用参考，菜名继续使用工程师原型中的午晚饭数据，避免展示版与工程版内容分叉。
- 交互对齐：默认选中周一午饭第一道菜，并在整张表下方显示菜名、分类、近期重复、费工度和单一“换这道”按钮。界面不解释规则、不显示次数；前三次点击由系统在同类菜中优先选择本周未出现且该格未试过的菜，第四次点击才打开完整同类候选列表。
- 视觉证据：星期单表页面 `/tmp/kith-menu-generation-v6/menu-weekday-table.png`；删除规则和次数文案后的简洁换菜状态 `/tmp/kith-menu-generation-v8/simple-swap.png`。
- 浏览器验证：DOM 实测 `1` 张周表、`10` 个餐次行、`50` 个菜品按钮、`1` 个默认选中状态和 `1` 个详情面板；前四行标签依次为 `周一午饭、周一晚饭、周二午饭、周二晚饭`。周一午饭依次智能换为“葱油鸡、冬菇蒸肉饼、莲藕炖排骨”，前三次均不打开候选列表；第四次点击才出现 `5` 个自选候选，当前菜不会重复出现在列表里。
- 确认结果验证：点击“确认十餐菜单”进入 `step=overview`；总览包含 `5` 个日期卡片和 `10` 个午晚饭餐次，没有换菜按钮；顶部返回回到修改页，继续按钮进入 `step=share`。
- 比较历史：Pass 1 把参考表格藏在展开层级中；Pass 2 又擅自改成十张纵向餐次卡；Pass 3 回到参考表格但拆为午餐、晚餐两张；Pass 4 合并为一张十行表；Pass 5 将行首从具体日期改为周一至周五，并对调星期与餐次字号；Pass 6 修正“点击即自选”的流程错误；Pass 7 删除规则说明、剩余次数和按钮状态文案，只保留 weekly-menu 式“换这道”操作。当前保留参考图的五类菜品、选中描边、详情和换菜交互，未发现剩余 P0 / P1 / P2。

## 微信午饭单场景专项 · 2026-08-06

- 情景收敛：微信确认页只讲“桃子晚上开放明天午饭预订 → 顾客下单 → 午饭订单回传 → 第二天午饭送达 → 提醒付款”，不再同时讲晚饭。
- 时间口径：桃子晚上 `20:00` 发布午饭卡，卡片和群消息统一写明“明天上午 `11:00` 截止”；顾客于 `20:08` 完成下单。
- 卡片内容：开饭卡只展示 9 月 9 日午饭的五道菜；订单回执只保留一笔午饭订单、2 份、订单号和配送地址。
- 心智负担：删除晚饭份数和第二笔订单；送达气泡与付款提醒只关联这一笔午饭订单，不再让顾客同时理解两个餐次。
- 静态验证：展示页不再包含“午饭晚饭都可以订”“今晚 21:30 截止”或任何晚饭订单；保留第二天午饭送达说明和 `¥60` 微信付款提醒。
- 视觉证据：`/tmp/kith-share-lunch-payment/after.png`。
- 浏览器验证：微信页包含 `3` 张卡片，其中 `1` 张为午饭付款提醒；晚饭文案数量为 `0`，消息区 `clientHeight = scrollHeight = 648px`，完整流程没有造成手机内容区额外滚动。

final result: passed
