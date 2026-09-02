# 实施对照原型（IRP）

## 用途

帮助产品、设计、工程和测试共同理解当前 MVP 的：

- 角色与责任主体。
- 入口、主路径和页面级状态。
- Agent 与真人的权限边界。
- 数据可见范围和会话隔离。
- User Story ID 与关键验收结果。

## 文件

- [打开实施对照原型](./index.html)
- [查看 MVP User Stories](../user-stories/近邻互助组-MVP.md)
- [查看当前产品决议](../product-decisions/近邻互助组-MVP原型设计决议.md)

## 消费者 Agent 交互方案

本轮原型只回答一个问题：消费者 Agent 在五方服务事项房间里，怎样既发挥自动协作作用，又不越过消费者的最终决定权。

- `?scenario=taozi&variant=requester-agent-inline`：同屏发言，Agent 的每一步都直接出现在房间时间线。
- `?scenario=taozi&variant=requester-agent-copilot`：授权副驾驶，消费者明确开关 Agent 能做的事；这是当前推荐的 MVP 默认方案。
- `?scenario=taozi&variant=requester-agent-summary`：协作摘要，双方 Agent 后台补齐信息，只把证据、结论和待决定事项投影回房间。

在仓库根目录运行 `python3 -m http.server 4173`，然后打开对应 URL；页面底部可用左右按钮切换三个方案。

## 不负责证明

本原型不是架构原型、接口契约或生产代码。服务端状态机、幂等、异常矩阵、数据 schema、安全、性能、可访问性和真实集成仍需在工程设计及测试中补齐。
