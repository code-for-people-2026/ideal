# 每日微信订单同步

本项目部署在 Vercel，数据存于独立的 Neon 数据库。微信采集必须在这台 Windows 电脑上执行。先读取本机不入库的 `sync.config.json`，其中指定唯一账号、三个目标群、运行时目录与微信命令路径。不可借用其他账号的聊天记录补齐。

`<runtimeDir>` 代表私有配置中的绝对路径，执行命令时替换成该路径并正确引用；Python/Node 使用本机已安装的运行时。

## 每天凌晨 1 点的步骤（北京时间）

1. 在本目录运行 `python scripts/capture.py --days 7`。脚本打印的 `<runtimeDir>/inbox/时间戳` 包含三个群的消息和采集时间。其中 `*-cards.json` 保留接龙全文和结构化转账信息；核对支付必须阅读卡片详情，将同一 transferid 的发起和收款回执关联并去重，不能仅凭“微信转账”四个字判断已付。读取全部结果，采集失败或记录不完整时终止上传并报告，不以空订单覆盖历史。
2. 运行 `node --env-file=.env.production.local scripts/export-current.mjs <runtimeDir>/current.json`，使用 `scripts/export-current.mjs` 将现有云端数据导出到本地 `<runtimeDir>/current.json`，对比最近七天和消息中提到的未来配送日期。优先保留已核实的订单；有新接龙、追加、撤单或收款回执时再更新受影响日期。
3. 分析接龙时，同一商品/餐次/交付日期的连续接龙是同一个批次的逐次更新，采用最新完整名单，不能累加各版本。区分接龙发布时间和实际送餐日期；“明天”按消息日期计算。保留下单昵称、份量、商品、房号（存在才记录）、价格及证据说明。只按明确单价计算金额；未知金额为 null。空白昵称不能虚构人名，用“接龙第 N 位（未署名）”并注明待核。
4. 比对转账时，以明确发送人、接收人、金额和收款状态为证据；只发起但未收款为 sent，确有收款回执且能匹配本订单才为 paid。红包金额不明为 redpacket；没有群内证据为 none，不等于欠款。无法唯一匹配的转账放 exceptions，不能重复计入多张订单或多个日期。历史实际来源不足时明确标为待核，不凭猜测自动销账。
5. 同一群同一订单沿用云端的 id，即使数量或昵称有更正也不要换 id。新订单生成稳定 id（群、配送日期、批次、客户/接龙位置的摘要），不能使用本次处理序号或随机值。同一个客户的不同批次是不同订单。所有人工确认保存在独立的 `ledger_confirmations` 表，上传不得重置它。
6. 将受影响日期的完整快照写入 `<runtimeDir>/outbox/日期.json`，格式为数组，每项为 `{groupId,date,snapshotAt,orders,exceptions}`。groupId 为 taozi/jingjing/yuma。snapshotAt 使用 manifest 的带时区 ISO 时间。orders 字段为 `{id,date,customer,location,item,quantity,amount,payment,note}`；exceptions 为 `{date,text}`。保留历史日期，不修改无新证据的旧日期。没有新数据时跳过订单导入，仍须完成第8步。
7. 运行 `node --env-file=.env.production.local scripts/upload.mjs <runtimeDir>/outbox/日期.json`。此命令校验、事务导入并输出云端各群总数。导入后再导出对照，确认受影响日期客户名单、数量、金额一致且人工确认未改变。

8. 核验完成后（包括没有新订单的情况），写本地报告 `<runtimeDir>/sync-日期.json`，包含 `{capturedAt,status:"verified",manualConfirmationsPreserved:true,totalOrders}`，时间来自本次采集 manifest，总数来自核验后的云端导出。运行 `node --env-file=.env.production.local scripts/record-sync.mjs <runtimeDir>/inbox/本次目录 <runtimeDir>/sync-日期.json`，检查三个群的同步时间已记录。此步骤仅更新同步状态，不改订单快照或人工确认。采集失败、分析未完成或云端核验失败时不执行此步骤；失败时保留上次成功同步时间。

9. 成功同步后，运行 `node --experimental-strip-types scripts/generate-share.mjs`。本机 `sync.config.json` 中的 `accessLinksFile` 指向私有 JSON 文件，键为 taozi/jingjing/yuma，值为完整专属链接；`shareFontPath` 可指定中文字体。脚本读取云端接口（包含有效人工确认），对比各群日期的订单与异常说明，不把单纯同步时间变化视为更新。初次运行只为每群最近有订单的日期生成一张；以后为每个有变化的群日期生成图片。输出的 pending 是待发送清单；未成功发送的任务会保留，重复运行不会新建重复任务，同一天未发送的旧版会被新版替代。图片与状态都在 `<runtimeDir>/shares/`，不得提交到 Git 或公开托管。
10. 阅读并使用 `computer-use` 技能，经 `@oai/sky` 的窗口 UI 操作本机微信。先从窗口列表确认当前账号，打开并核验收件人是「文件传输助手」，通过「发送文件」的选择文件对话框附加 pending 指定的 PNG。发送前核对群名、日期、图片和收件人；发送后检查图片消息实际出现且无失败标记。用户已经授权将这三群分享图片发送给自己的文件传输助手，不需要逐次再次请求确认。不得发送给任何群或其他联系人，不能改用微信内部接口、命令或操作系统脚本代替 computer-use。
11. 每张核验成功后运行 `node --experimental-strip-types scripts/generate-share.mjs --sent 待发送ID`（可一次给多个已核验的 ID）。发送前或结果不确定时不得提前标记成功。失败保留队列并报告原因，下次先查看助手会话核对是否已经发出，避免不确定结果重试造成重复；采集失败时不生成新图，但已核验旧图的待发送任务可在确认当前状态后补发。电脑锁屏、微信未登录或 UI 工具不可用时不能宣称发送成功；数据库同步成功和图片发送成功分别报告。二维码包含群专属访问凭证，只向用户授权的本人文件传输助手发送。

## 本地配置与限制

- `.env.production.local` 是 Vercel 拉取的数据库连接和站点会话配置，不打印、提交或上传到其他服务。微信密钥仅位于 `<runtimeDir>/wechat/`，不可上传。
- 只将整理后的三群订单和支付状态上传 Neon；原始聊天、数据库文件和解密密钥留在本机。
- 微信没有同步到最新消息时，不把采集时间当作消息最新时间；记录该事实，后续补齐时再更新。
- 定时任务由当前 Codex 任务执行，电脑及 Codex 需要可运行；电脑关机或离线时无法保证 1 点执行。
