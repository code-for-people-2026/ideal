# Kith Inn 双轨原型 · Design QA

## 对照对象

- 客户版视觉真相：`/Users/miyin/code for people/ideal/牛马互助平台/prototype-customer/index.html`
- 工程版结构真相：`/Users/miyin/code for people/ideal/牛马互助平台/prototype-implementation/index.html`
- 迁移前角色原型：
  - `/Users/miyin/code for people/cfp-mono/docs/kith-inn/prototype-taozi/index.html`
  - `/Users/miyin/code for people/cfp-mono/docs/kith-inn/prototype-customer/index.html`
- 产品内容真相：
  - `/Users/miyin/code for people/ideal/kith-inn/product-decisions.md`
  - `/Users/miyin/code for people/ideal/kith-inn/user-stories.md`
- 实现：
  - `http://127.0.0.1:4174/ideal/kith-inn/prototype-customer/?step=generate`
  - `http://127.0.0.1:4174/ideal/kith-inn/prototype-customer/?step=menu`
  - `http://127.0.0.1:4175/ideal/kith-inn/prototype-implementation/`

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

- 参考源：`/Users/miyin/code for people/ideal/kith-inn/prototype-implementation/prototype-taozi/index.html?step=plan`。
- 实现：`/Users/miyin/code for people/ideal/kith-inn/prototype-customer/index.html?step=menu`。
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

- 审查对象：`/Users/miyin/code for people/ideal/kith-inn/prototype-customer/index.html?step=orders`。
- 修改前截图：`/tmp/kith-orders-audit/01-before.jpg`。
- 修改后截图：`/tmp/kith-orders-audit/02-after.jpg`。
- 并排证据：`/tmp/kith-orders-audit/03-before-after.jpg`；左侧为修改前，右侧为修改后。
- 主要问题：统计数字在外层讲解、手机摘要和筛选区重复；独立的长期申请审核卡把“查看备餐订单”打断成另一个处理流程，增加展示版的心智负担。
- 调整结果：手机首屏收敛为“明日 12 份总览 → 午晚饭筛选 → 订单列表”；长期审核卡、处理按钮和相关状态分支全部删除，订单卡继续使用双行紧凑结构。
- 内容保持：仍包含 9 份明日短单和长期订单，以及周阿姨、王叔、陈姐、刘阿姨四笔订单；王叔的长期申请继续显示“待审核”，但本页不展示审核处理卡或操作按钮。
- 交互验证：订单页默认展示午饭，可切换全部或晚饭；订单底部导航保持可达。
- 控制台错误：无。

## 微信确认首屏专项 · 2026-08-04

- 审查对象：`/Users/miyin/code for people/ideal/kith-inn/prototype-customer/index.html?step=share`。
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
- Implementation：`/Users/miyin/code for people/ideal/kith-inn/prototype-customer/index.html?step=share`；浏览器截图 `/tmp/kith-reconcile-audit/04-share-card.jpg`，`1265 × 998 px`。
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
- 展示版把九笔到账记录归纳为“今天、昨天、前天、旧账”四组，不再按每天的具体日期创建独立分组；订单行继续保留交易日期，避免丢失对账依据。旧账组用 `9月8日` 和 `9月6日` 两笔记录明确示范同一分组容纳多个历史日期。
- 系统代划展示“顾客名、金额、日期与订单唯一匹配”的明确依据；桃子手动划掉只显示操作来源，不要求填写理由。
- 颜色对齐：统计卡、复选框和完成状态统一使用街坊味品牌绿；待处理状态使用品牌红；页面继续使用暖白背景与既有描边色，不再出现系统默认蓝色控件。
- 信息精简：删除占据首屏的大型总进度卡，不再重复展示总笔数、已划掉数量或来源统计；每个相对时间分组自身的 `1/3`、`2/2` 和状态方块已经足够表达进度。
- 展开交互：订单对账页首次打开时四个分组默认收起；分组标题整行保持可点击，右侧展开／收起控件为 `32 × 32px` 的高对比色按钮，各组均可独立展开、收起。
- 产品边界：清单状态不等于平台收款；歧义项和无匹配项不会被系统自动划掉。
- JavaScript 语法检查通过；展示版、微信页和工程师版浏览器运行错误均为 0。

## 送达后付款提醒专项 · 2026-08-05

> 历史版本：本节记录的是送达当天提醒；当前业务口径已由下方“微信私聊代录场景专项”更新为送餐次日发现未付款后提醒。

- Source visual truth：`/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-f7c86b77-507a-43c0-81a6-57daafeb1352.png`，`1986 × 1684 px`。
- Implementation：`/Users/miyin/code for people/ideal/kith-inn/prototype-customer/index.html?step=share`；浏览器截图 `/tmp/kith-meal-reminder/01-after.jpg`，`1265 × 998 px`。
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

- 工程生成页参考：`/Users/miyin/code for people/ideal/kith-inn/prototype-implementation/prototype-taozi/index.html?step=plan` 的未生成状态。
- 换菜交互参考：用户指定的 `/cfp-mono/docs/kith-inn/prototype/menu-brain.html`；本地解析到 `/Users/miyin/code for people/cfp-mono-worktrees/community-cooking-mock-ui/docs/kith-inn/prototype/menu-brain.html`。
- Source visual truth：`/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-6015be0d-c41e-427a-9e30-6f8e9c245652.png`，`688 × 794 px`。
- Viewport：Codex Desktop 内置浏览器 `1280 × 720 CSS px`；实现全屏截图为 `1265 × 712 px`。
- Implementation：`step=generate` 先展示与工程师版一致的“本周还没有菜单 → 10 餐待安排 → 生成本周菜单”；点击后进入 `step=menu` 的修改过程，确认十餐后进入 `step=overview` 的只读本周菜单总览，再继续生成按餐次分享的预订卡片。
- 结构核对：横纵轴互换为十张横向餐次卡；每张卡顶部是星期与午／晚饭，下面纵向排列 `2 荤、2 素、1 汤`，完整覆盖十个餐次和五十个菜品按钮。
- 标题层级：每张卡以周一至周五为主要标签，午饭或晚饭用小字号放在其下方；不同餐次向右排列。
- 字体与间距：继续使用系统中文字体和既有荤、素、汤色彩；卡片宽度设置为容器的 `27%`，首屏展示三张完整卡和约半张下一卡，自然提示左右滑动。
- 色彩与资产：荤菜淡红、素菜淡绿、汤淡蓝、当前选中红色双描边、通过状态浅绿徽章均按参考图还原；参考组件没有图片资产，因此没有新增图标或装饰素材。
- 文案与数据：视觉结构完全沿用参考，菜名继续使用工程师原型中的午晚饭数据，避免展示版与工程版内容分叉。
- 交互对齐：默认选中周一午饭第一道菜，并在整张表下方显示菜名、分类、近期重复、费工度和单一“换这道”按钮。界面不解释规则、不显示次数；前三次点击由系统在同类菜中优先选择本周未出现且该格未试过的菜，第四次点击才打开完整同类候选列表。
- 视觉证据：星期单表页面 `/tmp/kith-menu-generation-v6/menu-weekday-table.png`；删除规则和次数文案后的简洁换菜状态 `/tmp/kith-menu-generation-v8/simple-swap.png`。
- 浏览器验证：DOM 实测 `10` 张餐次卡、`50` 个菜品按钮、`1` 个默认选中状态和 `1` 个详情面板；横向容器 `clientWidth = 322px`、`scrollWidth = 915px`，前五张卡的可见比例为 `[1, 1, 1, 0.55, 0]`。除触屏和触控板原生横滑外，桌面端已支持鼠标按住卡片区域左右拖动；拖动到后半段后点击菜品仍保持当前位置，不会跳回开头。
- 确认结果验证：点击“确认十餐菜单”进入 `step=overview`；总览包含 `10` 张独立餐次卡，顺序为周一午饭、周一晚饭至周五晚饭，每张卡只展示一个餐次的 5 道菜，没有换菜按钮；顶部返回回到修改页，继续按钮进入 `step=share`。
- 比较历史：Pass 1 把参考表格藏在展开层级中；Pass 2 又擅自改成十张纵向餐次卡；Pass 3 回到参考表格但拆为午餐、晚餐两张；Pass 4 合并为一张十行表；Pass 5 将行首从具体日期改为周一至周五，并对调星期与餐次字号；Pass 6 修正“点击即自选”的流程错误；Pass 7 删除规则说明、剩余次数和按钮状态文案；Pass 8 按最新要求交换横纵轴，变成一次露出三张半的横向餐次卡。当前继续保留五类菜品、选中描边、详情和换菜交互。

## 微信私聊代录场景专项 · 2026-08-10

- 情景收敛：页面改为周阿姨与桃子的双人私聊，不再模拟微信群。顾客继续按原习惯发送“明天中午订两份”，桃子代录后回传订单卡。
- 首张卡片：状态为“桃子已代录”，保留午饭、2 份、订单号和配送地址；桃子的气泡明确说明“下次你也可以直接通过这张卡片向我下订单”，卡片底部提供相同入口。
- 次日欠款提醒：9 月 9 日午饭已经送达；到 9 月 10 日 `10:20` 桃子发现顾客忘记付款，再直接发送第二张卡片。卡片展示“昨天午饭 · 尚未付款”、`¥60`、原餐次和“昨天已送达，尚未收到付款”，不再把提醒误写成送达当天发生。
- 工程对齐：这个展示场景对应工程师原型桃子端的手动补单能力；卡片同时承担顾客下一次进入自主下单流程的入口。
- 浏览器验证：私聊页标题为“桃子”，包含 `1` 条顾客下单消息、`1` 条桃子确认消息和 `2` 张应用卡片；第二张卡的时间与欠款文案均已更新，消息区无横向或纵向溢出，浏览器错误为 `0`。

## 菜单右侧渐变蒙版专项 · 2026-08-10

- Source visual truth：修改前的当前原型 `/tmp/kith-menu-mask-before.png`，结合用户指定的“在横向菜单右侧增加渐变蒙版”作为目标；截图为 `1265 × 998 px`。
- Implementation：`/Users/miyin/code for people/ideal/kith-inn/prototype-customer/index.html?step=menu`；修改后截图 `/tmp/kith-menu-mask-after.png`，`1265 × 998 px`。
- Viewport：Codex Desktop 内置浏览器 `1280 × 720 CSS px`；前后截图使用同一页面、初始横滑位置和像素密度，无需额外缩放。
- Full-view comparison：`/tmp/kith-menu-mask-comparison.jpg`，左侧修改前、右侧修改后；两侧页面布局、手机画框、文字和卡片位置完全一致。
- Focused comparison：`/tmp/kith-menu-mask-focus-comparison.jpg`，聚焦横向菜单区域；右侧约 `36px` 从完整内容平滑过渡到透明，第四张半卡仍可辨认，同时更清楚地提示可以继续横滑。
- 字体与文案：未改变字号、字重、行高和菜单内容；标题、菜名和“左右滑动”提示均保持原样。
- 间距与布局：未改变卡片宽度、间距或可见数量，仍是一屏三张完整卡和约半张下一卡；没有新增占位或遮挡可点击区域。
- 颜色与资产：蒙版只把内容渐隐到现有暖白背景，不引入新色；Logo 和现有图片资产均未修改。
- 交互验证：鼠标按住菜单区域从右向左拖动后可进入后续餐次，渐变不拦截拖动或菜品点击；浏览器错误为 `0`。
- 比较历史：Pass 1 未发现 P0 / P1 / P2 视觉或交互问题；渐变强度足以表达横滑方向，同时没有让半张卡失去辨识度。

## 菜单按日分组与层级收敛专项 · 2026-08-10

- Source visual truth：调整前原型 `/tmp/kith-menu-audit-2026-08-10/01-current-menu.jpg`，`1265 × 998 px`；结合本轮已对齐的产品前提——不要求十个餐次同时出现在一屏，继续保留横向浏览。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu`；调整后初始状态 `/tmp/kith-menu-refine-2026-08-10/after-initial.jpg`，`1265 × 998 px`。
- Full-view comparison：`/tmp/kith-menu-refine-2026-08-10/comparison-full.jpg`，左侧为调整前，右侧为调整后；使用相同浏览器、视口、页面步骤和初始横滑位置。
- 信息结构：十个独立餐次列改为五个日期分组；每个日期只出现一次星期与日期，组内午饭、晚饭并列，因此仍完整覆盖五天十餐，同时减少重复列头。
- 视觉密度：荤、素、汤不再整格填色，统一为白底，分别以红、绿、蓝左侧窄色条表达类别；首屏仍露出下一日期的部分卡片，并保留右侧渐变以提示可继续横滑。
- 选中关系：当前菜品使用品牌深绿描边、浅绿底和轻阴影；详情卡增加同色左侧强调线，并明确显示“周几 + 餐次 + 菜品位”，使表格与详情形成直接对应。
- 操作层级：“换这道”收敛为紧凑的暖灰次级按钮；“确认十餐菜单”继续作为本屏唯一红色实心主按钮。
- 文案一致性：导航统一为“修改菜单”，卡片标题改为准确日期范围“9月7日—11日菜单”；“左右滑动查看 · 10 餐”使用普通辅助文字，不再表现成可点击胶囊。
- 交互验证：菜单横向容器 `clientWidth = 322px`、`scrollWidth = 956px`；鼠标拖动后 `scrollLeft` 从 `1` 变为 `193`。拖动后选择周二午饭“番茄炒蛋”，详情同步为“当前选择 · 周二午饭 · 荤2”，横滑位置保持 `193`，没有跳回起点。
- 浏览器验证：DOM 包含五个日期分组、十个午晚饭区块和五十个菜品按钮；初始状态与拖动、选菜状态均无浏览器错误。
- 比较结论：相较调整前，日期与餐次重复减少，类别色降噪，选中态与详情联动更明确；下一日期的局部露出仍能表达横滑，不要求把十餐压缩到同一屏。未发现剩余 P0 / P1 / P2 视觉或核心交互问题。

## 菜单手机可读性与纵向空间专项 · 2026-08-10

- Source visual truth：放大前当前原型 `/tmp/kith-menu-scale-2026-08-10/before.jpg`，`1265 × 998 px`；本轮目标是保持按日期横滑和既有视觉语言，只提升真实手机上的阅读、点击尺寸并使用下方空白。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu`；放大后初始状态 `/tmp/kith-menu-scale-2026-08-10/after-pass1.jpg`，`1265 × 998 px`。
- Full-view comparison：`/tmp/kith-menu-scale-2026-08-10/comparison-full.jpg`；Focused comparison：`/tmp/kith-menu-scale-2026-08-10/comparison-phone.jpg`。两组证据均为左侧放大前、右侧放大后，使用相同浏览器、视口、页面步骤和初始横滑位置。
- 布局：菜单页正文改为纵向弹性布局；菜单卡高度从约 `406px` 增至 `510px`，横向菜单区域从 `283px` 增至 `377px`，确认按钮贴近内容区底部，不再在按钮与底栏之间保留约百像素无效空白。
- 点击与阅读：单个菜品格高度提升到约 `54.5px`，并同步放大菜名、星期、日期、午晚饭标签、详情说明和“换这道”按钮；一天卡片宽度从容器 `58%` 增至 `68%`，使午晚饭两列在手机上更容易辨认和点击。
- 信息保持：仍是一张日期卡包含午饭、晚饭，仍显示 `2荤2素1汤` 的五道菜；右侧渐变、当前选中态、详情卡、次级换菜与红色主按钮层级全部保留。
- 字体与颜色：继续使用原型既有系统中文字体与暖白、品牌绿、品牌红色板；仅提升字号和可点击面积，没有引入新的字体、颜色或视觉资产。
- 图片与资产：页面没有新增图片需求，Logo 及原有品牌资产未修改；未使用占位图或低清替代资源。
- 文案：所有菜单、餐次、说明和按钮文字保持不变，本轮没有增加新的认知负担。
- 交互验证：横向拖动后可从周一进入周二、周三；选择周二午饭“红烧排骨”后详情同步到对应菜品，再点击“换这道”可替换为“葱油鸡”。拖动、选菜和换菜过程中浏览器错误均为 `0`。
- 比较结论：放大后的菜单使用完整正文高度，菜品名称与点击区域明显改善，底部导航和确认按钮仍完整可见；未发现剩余 P0 / P1 / P2 视觉或核心交互问题。

## 菜品横向密度专项 · 2026-08-10

- Source visual truth：用户指出留白过大的局部截图 `/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-04b32ade-e2fd-4943-a09f-54423b8f194f.png`，`660 × 536 px`；同状态完整页面使用 `/tmp/kith-menu-scale-2026-08-10/after-pass1.jpg`，`1265 × 998 px`。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu`；调整后 `/tmp/kith-menu-density-2026-08-10/after.jpg`，`1265 × 998 px`。
- Full-view comparison：`/tmp/kith-menu-density-2026-08-10/comparison-full.jpg`；Focused comparison：`/tmp/kith-menu-density-2026-08-10/comparison-phone.jpg`。两组证据均为左侧调整前、右侧调整后，使用相同浏览器、视口、菜单状态和初始横滑位置。
- P2 修复：上一轮把每日卡片加宽到容器 `68%`，首屏只完整显示周一午饭、晚饭和周二午饭三个餐次，菜名两侧留白偏大。本轮将每日卡片收窄至 `56%`，同步缩小日期卡内边距、午晚饭列间距和菜品格水平内边距。
- 可见餐次：浏览器实测首屏四个餐次的可见比例为 `[1, 1, 1, 0.6]`，即三个完整餐次加约六成的第四个餐次；第四列的截断结合右侧渐变继续表达可横滑，而不是渲染错误。
- 阅读与点击：菜品格宽度从约 `97px` 收敛到 `81px`，高度仍保持约 `55.5px`，字号仍为 `10px`；减少的是无效左右留白，没有退回上一版本偏小的文字和点击区域。
- 字体、颜色与资产：系统中文字体、品牌红绿、类别窄色条、Logo 和既有图片资产均未修改；菜名没有异常换行或截断。
- 文案：菜单日期、餐次、菜名、详情和操作文案保持不变。
- 交互验证：点击周二午饭“红烧排骨”后详情正确联动；横向拖动后 `scrollLeft = 187`，选中状态与详情内容保持不变，浏览器错误为 `0`。
- 比较结论：信息密度恢复到约三餐半，同时保留上一轮的纵向放大和手机可读性；未发现剩余 P0 / P1 / P2 视觉或核心交互问题。

## 菜名字号专项 · 2026-08-10

- Source visual truth：字号调整前 `/tmp/kith-menu-density-2026-08-10/after.jpg`，`1265 × 998 px`；用户明确要求只把“土豆烧牛肉”等菜名放大一级，不改变卡片尺寸和首屏餐次密度。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu`；调整后 `/tmp/kith-menu-font-2026-08-10/after.jpg`，`1265 × 998 px`。
- Focused comparison：`/tmp/kith-menu-font-2026-08-10/comparison-phone.jpg`，左侧菜名为 `10px`，右侧为 `11px`；完整手机画框、布局和初始状态一致，因此无需额外全屏比较。
- 字体：所有菜名字号从 `10px` 提升到 `11px`，计算行高为 `12.98px`；五字菜名均保持单行，没有溢出、截断或异常换行。
- 布局与间距：菜品格继续保持约 `80.9 × 55.5px`，首屏四个餐次可见比例仍为 `[1, 1, 1, 0.6]`，没有因字号变化减少可见餐次数量。
- 色彩、图片和文案：颜色、类别窄色条、Logo、品牌资产和全部菜名内容均未修改。
- 交互验证：页面加载与菜品选择逻辑保持正常，浏览器错误为 `0`。
- 比较结论：菜名辨识度提升，同时保持当前横向密度；未发现 P0 / P1 / P2 视觉或核心交互问题。

## 菜名字号与换行容错专项 · 2026-08-10

- 调整目标：继续放大菜单菜名，并允许较长菜名自然换行；保持菜单卡尺寸和首屏餐次密度不变。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu`；浏览器截图 `/tmp/kith-menu-wrap-2026-08-10/after.jpg`，`1265 × 998 px`。
- 字体：菜名从 `11px` 提升到 `13px`，行高设为 `1.25`；启用正常空白处理和任意位置换行，后续更长菜名可以在现有格子中显示两行。
- 布局：菜品格继续保持约 `80.9 × 55.5px`，没有改变日期卡宽度、横滑位置或首屏三餐半的可见密度。
- 溢出检查：当前五十个菜品按钮均未出现水平或垂直溢出；现有菜名长度仍可单行显示，较长数据进入时具备两行容错。
- 色彩、图片与文案：颜色、分类色条、Logo、品牌资产和菜单内容均未修改。
- 浏览器验证：页面加载与菜单交互无错误；未发现 P0 / P1 / P2 视觉或核心交互问题。

## 餐次标签字号专项 · 2026-08-10

- 调整结果：菜单卡中的“午饭 / 晚饭”从 `9px` 提升到 `11px`，标签区域高度仍为 `23px`。
- 布局保持：菜名继续使用 `13px`，日期卡宽度、菜品格尺寸和首屏三餐半的横向密度均未改变。
- 浏览器验证：五十个菜品按钮均无水平或垂直溢出，页面运行错误为 `0`；未发现 P0 / P1 / P2 问题。

## 三日菜单与连续对账清单专项 · 2026-08-11

- Source visual truth：用户菜单截图 `/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-4f1a54f4-b71d-4232-93ad-68260b675e5c.png`，`830 × 1334 px`；类型导航局部 `/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-51b16d17-b97f-42a0-b3b2-45cdec6f3c40.png`，`339 × 80 px`。用户文字要求定义目标变化：一天合并成一列、菜品右上角午晚角标、首屏对比三天、允许纵向滚动、类型按钮定位，以及今天默认展开的轻量对账分组。
- 对账参考：滴答清单官方“用分组和排序管理任务”与产品首页任务列表示例；只借鉴连续任务表面、轻量分组标题、单行任务与勾选关系，没有复制其品牌色、导航或产品功能。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu` 与 `?step=reconcile`。
- Viewport：Codex Desktop 内置浏览器默认视口 `1280 × 720 CSS px`，浏览器截图 `1265 × 712 px`；手机框实际 `390 × 748 CSS px`。视觉比较使用同一视口中可见的手机区域 `390 × 539 px`，无需像素密度换算。
- Full-view evidence：修改后菜单 `/tmp/kith-menu-reconcile-2026-08-11/menu-after-viewport.png`；修改后对账 `/tmp/kith-menu-reconcile-2026-08-11/reconcile-after-viewport.png`。
- Focused comparison：菜单前后 `/tmp/kith-menu-reconcile-2026-08-11/menu-comparison.png`；对账前后 `/tmp/kith-menu-reconcile-2026-08-11/reconcile-comparison.png`。两张比较图均把同尺寸、同状态的 `390 × 539 px` 手机区域并排放置。
- Pass 1 findings：菜单原来一天占午饭、晚饭两列，首屏无法同时对比三天；午晚餐依赖重复列头，纵向空间没有用于展示后续菜品。对账原来四个日期各自使用独立圆角卡和大号彩色展开按钮，视觉被切成四块，今天也默认收起。两项均为 P2 信息密度与任务连续性问题。
- Pass 1 fixes：每日菜单改成单列十道菜，按荤菜、素菜、汤纵向排列；每道菜右上角增加“午 / 晚”角标，首屏精确显示三个完整日期列。顶部辅助文案改成“荤菜 / 素菜 / 汤”三个按钮，点击后在可滚动菜单中定位对应类别。对账四个日期收进同一张连续清单，移除彩色状态方块和分离卡片，今天默认展开，其他日期保持可折叠。
- 字体与文案：沿用系统中文字体、原有字重和菜单日期层级；窄列菜名使用 `11px` 并允许换行。页面说明同步描述三日对比、午晚角标、类型定位与今天默认展开，没有残留“左右滑动查看 · 10 餐”。
- 间距与布局：菜单横向容器 `clientWidth = 311px`，日期列宽为 `(100% - 12px) / 3`，首四列可见比例 `[1, 1, 1, 0]`；页面正文 `clientHeight = 590px`、`scrollHeight = 844px`，可上下滚动。对账四个分组 `margin-bottom = 0`、`border-radius = 0`，统一由外层清单承载圆角和边框。
- 颜色与状态：继续使用街坊味品牌红、绿、金和现有荤素汤左侧色条；午饭角标用金色、晚饭角标用深绿。菜单选中态与详情关联保持原有深绿，对账待核记录为红色、系统唯一匹配依据为绿色、已划项目保持删除线。
- 图片与资产：没有新增图片需求；既有 Logo 和品牌图片保持原文件、裁切与清晰度，没有占位图、代码绘制图标或低清替代资源。
- 交互验证：菜单包含 `5` 个日期列、`50` 个菜品按钮、`25` 个午饭角标和 `25` 个晚饭角标；鼠标拖动后横向 `scrollLeft` 从 `1` 到 `210`。点击“汤”后正文 `scrollTop` 从 `0` 到 `253.5`，汤类行进入可见区；选菜、换菜逻辑继续工作。对账初始 `aria-expanded` 为“今天 true、其余 false”，可见 `3` 笔今天记录；展开旧账后可见记录增至 `5` 笔。
- 浏览器验证：菜单页和对账页控制台错误均为 `0`；HTML 内联脚本解析通过，未发现横向溢出遮挡、失效按钮或不可达的主要操作。
- Post-fix result：前后比较确认菜单从约一天半提升到三天完整并排，午晚角标清晰；对账从四张独立卡收敛为一张连续任务清单。未发现剩余 P0 / P1 / P2；P3 可继续观察窄屏上较长菜名的两行断点。

## 菜单密度、点选与对账详情专项 · 2026-08-11

- Source visual truth：用户指出对账默认状态不应直接展示的两行截图 `/var/folders/f7/0tfdpjzs0yz9lw9zfh1mjc780000gn/T/codex-clipboard-d3e5f7a6-ca27-4c84-a3d4-c8165189ac4c.png`，`500 × 94 px`；菜单密度与右侧蒙版以本轮修改前截图 `/tmp/kith-refine-2026-08-11/menu-before.png` 为基线。
- Implementation：`kith-inn/prototype-customer/index.html?step=menu` 与 `?step=reconcile`；默认状态截图 `/tmp/kith-refine-2026-08-11/menu-after.png`、`/tmp/kith-refine-2026-08-11/reconcile-after.png`，对账详情展开截图 `/tmp/kith-refine-2026-08-11/reconcile-detail-open.png`，切换到“白切鸡”的真实指针验证截图 `/tmp/kith-refine-2026-08-11/menu-selected-white-chicken.png`。
- 视觉比较：在同一次视觉检查中并列查看用户截图、菜单修改后截图、对账默认截图与详情展开截图。默认对账项只保留顾客、时间、金额和“订单详情”；原来的“待对应订单”及红色同金额候选说明仅在展开详情后出现，信息层级符合用户要求。
- 菜单密度：恢复横向容器右侧 `24px` 渐变蒙版；每日卡内边距收至 `4px`、菜品组间距为 `3px`、菜品格高度为 `40px`，格内边距为 `2px 7px 2px 2px`。菜名使用 `13px / 1.12` 并允许换行，首屏仍可完整对比三天、每列完整展示十道菜。
- P1 交互修复：原拖动逻辑在 `pointerdown` 时立即抢占指针，真实鼠标或触摸的轻微位移可能把点选误判为横拖，表现为选中态一直停在“土豆烧牛肉”。现在只记录按下位置，横向位移超过 `10px` 才进入拖动并捕获指针；普通点击不再被拦截。
- 点选验证：使用浏览器真实指针点击周一午饭“白切鸡”，按钮 `aria-pressed` 从默认状态切换为 `true`，详情同步为“当前选择 · 周一午饭 · 荤2 / 白切鸡”，证明可以从“土豆烧牛肉”切换到其他菜品。
- 对账交互：初始今天展开且可见 `3` 笔记录，详情面板、订单说明和匹配理由数量均为 `0`；点击小太阳的“订单详情”后仅展开 `1` 个面板，并显示“待对应订单”和同金额候选原因。再次收起不影响清单，复选框从未勾选切换为勾选后对应行正确进入划掉状态。
- 字体、颜色与资产：沿用系统中文字体、品牌暖白/深绿/红色和现有荤素汤窄色条；没有新增图片、图标或外部资产，也没有改变业务文案含义。
- 静态验证：`5` 个 HTML 文件、`3` 段内联脚本全部解析通过；检查 `43` 个本地链接，缺失链接为 `0`；`git diff --check` 通过。
- 比较结论：菜单右缘继续明确提示横向内容，菜名更大但卡片更紧凑；普通点选与横向拖动不再争抢指针；对账原因从默认视图下沉到按需详情。未发现剩余 P0 / P1 / P2 视觉或核心交互问题。

final result: passed
