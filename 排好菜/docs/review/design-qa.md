# 排好菜工程原型 · Design QA

- source visual truth:
  - `references/kith-menu.jpg`
  - `references/kith-generate.png`
- implementation screenshots:
  - `screenshots/generate.png`
  - `screenshots/menu.png`
  - `screenshots/overview.jpg`
  - `screenshots/library.png`
  - `screenshots/history.png`
  - `screenshots/profile.png`
- combined comparison evidence:
  - `comparisons/generate.jpg`
  - `comparisons/menu.png`
  - `comparisons/navigation.jpg`
- source page: `街坊味/prototype-customer/?step=generate|menu`
- implementation page: `http://127.0.0.1:4173/?step=generate|edit`
- browser viewport: 1400 × 1200 CSS px
- state: iPhone；生成菜单、排菜单、菜品库（全部）、历史（本周展开）、我的四个一级页签
- density: deviceScaleFactor 1
- source pixels: 390 × 748（源原型自带手机内容与外壳）
- implementation pixels: 每张 393 × 852（mobile-app 运行壳的原生 app screen）
- normalization: `comparisons/` 中的同屏证据保持原生宽高比并排展示；设备外壳、状态栏和安全区属于各自运行壳，不作为产品内容偏差。

## Full-view comparison evidence

同屏对照确认实现保留了 Kith 用户原型的核心构图：居中的“修改菜单”标题、三天首屏横向菜单、左侧午饭/晚饭轴、默认荤菜筛选、选中菜品的深绿状态、米白底色、砖红确认按钮和底部主导航。独立产品增加“自己挑”和软规则提醒，是本次评审范围要求，不属于设计漂移。

新增的菜品库、历史和我的三张一级页面与 Kith 视觉真值同屏比较：沿用同一系统中文字体、米白画布、深绿/砖红语义色、白色细边卡片、轻阴影和四栏底部导航。三个页面没有引入新的视觉语言，页面标题、内容密度和首屏层级保持一致。

## Focused region comparison evidence

重点比较菜单表格、选中菜品详情和确认按钮三个区域：

- 三个日期列、两段餐次与四个荤菜槽位在两侧截图中一一对应；
- 菜品卡的圆角、细边框、荤菜砖红左边线和深绿选中态保持一致；
- 实现把源原型的单一“换这道”扩展为“换一道 / 自己挑”，并在相同详情卡区域完成，不破坏原有层级；
- 确认按钮保持同一砖红主色与全宽布局，仍是页面最强行动点。
- 生成页规则卡已与 Kith 的浅暖黄背景 `#fff2d5`、棕色文字 `#765313` 对齐；红色只保留给主行动按钮。
- 指针悬停在手机内容上时不再出现 48px 半透明触控圆点；普通区域使用原生箭头、按钮使用原生 pointer、菜单横滑区使用 grab/grabbing，与 Kith 原型一致。
- 菜品库的分类统计、筛选条和双列菜品卡均使用现有卡片边框、分类色和紧凑密度；历史卡片使用同一圆角与展开层级；我的页面使用同一设置列表和说明卡。

## Required fidelity surfaces

- Fonts and typography: 使用系统中文字体栈（PingFang SC / Microsoft YaHei），标题、日期、菜名、辅助说明的层级与源原型一致；未发现截断、异常换行或字号导致的不可读问题。
- Spacing and layout rhythm: 首屏可同时比较三天；午晚饭纵轴、日期表头、菜品槽位对齐。详情卡、提醒和确认按钮之间节奏清楚，没有遮挡或横向溢出。
- Colors and visual tokens: 米白、砖红、深绿、浅金和灰色边线映射到 Kith 色板；生成规则卡使用浅暖黄 `#fff2d5` 与棕色 `#765313`，主按钮继续使用砖红；选中、确认、提醒三类语义颜色清晰。确认总览说明文字已修为白色，满足深绿背景上的可读性。
- Image quality and asset fidelity: 产品内容没有照片、插画或品牌图像需要复刻；设备外壳、状态栏和系统图标由受保护 mobile-app 运行壳提供。产品图标统一使用 Radix Icons，没有手写 SVG、文字符号或占位图。
- Copy and content: “五天十餐、每餐 2荤2素1汤、近期尽量不重复、只用已确认菜品”与 Kith 用户原型一致；“保存本周菜单”替代 Kith 后续订单卡片，符合独立菜单产品的边界。
- Navigation views: 菜品库清楚说明 86 道确认菜品和分类；历史提供三周记录与菜单摘要；我的明确当前默认规则和工程原型边界。文案没有把尚未实现的账号或云端能力包装成已完成能力。

## Interaction and accessibility checks

- 已验证：生成菜单、荤菜/全部筛选、选择菜品、智能换菜、打开手选候选、手动换菜、确认总览、保存成功。
- 已验证：四个底部页签均可点击并进入可分享 URL；菜品库 12 张卡片可按荤/素/汤筛选；历史卡片可展开与收起；我的页面规则可完整阅读。
- 手动换菜结果会带入菜单总览；本次验证的“香菇蒸鸡”在总览中可见。
- iPhone 393 × 852 和 Pixel 10 427 × 952 均无横向溢出；Pixel 10 使用 64px 顶部安全区。
- 主控件均使用语义按钮和可读标签；可见焦点为深绿色 2px 描边；支持 `prefers-reduced-motion`。
- 指针状态验证：手机内容 `cursor: default`、主按钮 `cursor: pointer`、菜单横滑区 `cursor: grab`、模拟触控圆点 `display: none`。
- 浏览器控制台错误和警告：0。

## Comparison history

1. Pass 1 found [P1] confirmation summary body copy inherited the template's `#555` paragraph color on a dark-green card, producing insufficient contrast. Fixed `.confirmed-card p` to explicit `rgba(255,255,255,.86)`; post-fix computed color and rendered overview screenshot verified.
2. Pass 1 found [P2] an in-place screen state change could temporarily offset the mobile canvas in the preview runtime. Replaced screen transitions with shareable `?step=generate|edit|overview` navigation, matching the Kith prototype convention. Post-fix viewport and app screen bounding boxes remain aligned at 393 × 852 after every primary transition.
3. Pass 2 rechecked edit comparison, overview contrast, iPhone/Pixel layouts, primary interactions and console logs. No actionable P0/P1/P2 findings remain.
4. Pass 3 found [P2] the mobile runtime's 48px translucent touch cursor visibly covered button labels during mouse hover. Added an app-scoped Kith-style native cursor override in `src/prototype.css`; post-fix computed styles and the combined screenshot confirm the overlay is removed while pointer/grab affordances remain.
5. Pass 4 found [P1] `菜品库`、`历史`、`我的` were visible primary navigation controls but had no action. Added shareable routes and three Kith-aligned minimum viable screens; browser interaction verified every tab, filter and history expander.
6. Pass 4 found [P1] the new dark summary cards inherited the runtime's `#555` paragraph color. Added explicit `rgba(255,255,255,.86)` text color; post-fix computed styles and `comparisons/navigation.jpg` verify readable contrast.
7. Pass 5 rechecked the four-tab navigation, 1:1 iPhone captures, Pixel 10 layout, active states and console logs. No actionable P0/P1/P2 findings remain.
8. Pass 6 found [P2] the generate-rule card used a dark brick-red background while the Kith source uses light warm gold. Changed the card to `#fff2d5`, its copy to `#765313`, and its pills to translucent white with brown borders. Post-fix combined evidence confirms the semantic hierarchy now matches Kith: gold for guidance, red for the primary action. Build and mobile-runtime checks pass; browser logs contain no errors or warnings.

## Findings

No actionable P0, P1 or P2 differences remain.

## Follow-up polish

- [P3] If leadership prefers strict Kith wording, “换一道” can be changed back to “换这道”；当前文案更适合独立产品语境。
- [P3] The soft-rule reminder can later display the exact repeated ingredient once the real rules engine is designed.
- [P3] 菜品库新增/编辑菜品和历史菜单复制属于下一轮工程范围；本轮页签不展示这些尚未实现的操作按钮。

final result: passed
