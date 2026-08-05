# MindForge

[English](README.md) | **简体中文**

[![部署到 GitHub Pages](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml)

MindForge 一个强化学习笔记与交互式实验平台。它将学习循环放慢并展开，让状态转移、价值估计、
动作选择、Bellman 目标、TD 误差、资格迹和策略变化不再隐藏在训练脚本内部，而是能够被逐步观察和检查。

## 在线网站

- 首页：[https://jiaxtian.github.io/MindForge/](https://jiaxtian.github.io/MindForge/)
- Gridworld 控制实验室：[gridworld.html](https://jiaxtian.github.io/MindForge/gridworld.html)
- 多臂老虎机实验室：[bandit.html](https://jiaxtian.github.io/MindForge/bandit.html)
- 随机游走预测实验室：[prediction.html](https://jiaxtian.github.io/MindForge/prediction.html)
- Mountain Car 控制实验室：[mountain-car.html](https://jiaxtian.github.io/MindForge/mountain-car.html)
- Blackjack Monte Carlo 实验室：[blackjack.html](https://jiaxtian.github.io/MindForge/blackjack.html)
- CartPole 控制实验室：[cartpole.html](https://jiaxtian.github.io/MindForge/cartpole.html)

## 实验覆盖范围

| 实验室 | 核心问题 | 算法与机制 |
| --- | --- | --- |
| Gridworld | 规划与采样控制如何产生策略？ | 价值迭代、策略迭代、Q-learning、SARSA、Expected SARSA、Dyna-Q、Double Q-learning |
| 多臂老虎机 | 智能体应当如何平衡探索与利用？ | Epsilon-greedy、UCB1、Thompson sampling、Softmax 探索、Gradient Bandit |
| 随机游走 | 价值估计应当在什么时候更新？ | Every-visit Monte Carlo、TD(0)、n-step TD、TD(λ) |
| Mountain Car | 表格型控制如何处理连续状态？ | Q-learning、SARSA、Expected SARSA、SARSA(λ)、状态聚合 |
| Blackjack | 完整回合回报如何支持价值预测与控制？ | 首次访问 MC 预测、ε-soft 同策略 MC 控制、加权重要性采样 |
| CartPole | TD 控制如何平衡不稳定的连续动力学？ | Q-learning、SARSA、Expected SARSA、Double Q-learning、四维状态离散化 |

这些实验共同覆盖老虎机反馈、价值预测、动态规划、无模型控制、基于模型的回放、最大化偏差、随机转移、
资格迹、回合采样、重要性采样、延迟奖励和连续状态离散化等强化学习常用内容。

## Gridworld 控制实验室

预置环境：

1. 经典 Gridworld
2. Cliff Walking
3. Windy Gridworld
4. Dyna Maze
5. 带随机滑移的 Frozen Lake
6. Four Rooms

实验室支持单步更新、自动执行、暂停、重置、50 回合批量训练、超参数调整和可选的障碍编辑。点击状态格
可以查看四个动作价值。完整实时表格会展示每个状态的访问次数、价值、学到的 Q 值或 Bellman 备份、
贪心动作、最近更新动作、采样转移、数值目标、误差和更新后的估计。

Dyna-Q 会保存采样到的一步转移，并在每次真实交互后执行可调数量的模型回放。Double Q-learning 使用两个
估计器，将最大化动作的选择与评价分离，从而降低最大化偏差。

## 多臂老虎机实验室

奖励模型可以选择 Bernoulli 或 Gaussian，底层均值既可以保持平稳，也可以按照随机游走持续漂移。
实验过程中可以直接修改每个臂的真实均值。

实验室会记录样本平均估计、拉杆次数、累计奖励、伪遗憾、最优臂命中率、动作概率、置信上界、后验样本、
学到的偏好，以及最近一次选择背后的完整证据。用户可以调整乐观初值、Softmax 温度、探索率 ε 和
Gradient Bandit 偏好学习率。比较模式会让五种策略在同一个奖励环境中同步前进。

## 随机游走预测实验室

预测实验室使用一个可以调整链长度的对称 Markov 奖励过程。系统会计算真实折扣价值函数，并在每个回合
结束后将其与当前估计进行比较。

- Monte Carlo 等待回合终止，再沿轨迹向后传播采样回报。
- TD(0) 在每次状态转移后立即进行一步自举。
- n-step TD 展示所选备份时域带来的偏差、方差和更新延迟。
- TD(λ) 展示完整资格迹及其向后的信用分配过程。

界面会展示当前轨迹、每个状态的估计值与真实值、当前自举项、更新时域、预测误差、资格迹大小和逐回合 RMSE。

## Mountain Car 控制实验室

Mountain Car 使用标准的确定性位置与速度动力学。由于引擎无法直接爬上右侧山坡，策略必须先暂时远离目标，
通过往返运动积累足够动量。

连续的位置和速度会被映射到可以调整数量的离散格中。得到的状态动作图会展示每个区域的贪心引擎动作和
最大 Q 值。实验室同时展示物理轨迹、引擎与速度向量、当前连续状态和离散状态、精确 TD 更新、逐动作 Q 值、
回合长度、回报和到达目标率。

## Blackjack Monte Carlo 实验室

Blackjack 使用放回抽样的无限牌堆，并提供“庄家软 17 停牌”和“庄家软 17 要牌”两套规则。一个完整状态由
玩家点数、庄家明牌以及玩家是否持有可用 A 组成。

实验室比较固定策略下的首次访问 Monte Carlo 预测、ε-soft 同策略 Monte Carlo 控制，以及使用加权重要性
采样的离策略控制。页面会逐个决策展示手牌、采样回报、重要性权重、精确估计更新、回合轨迹、胜率，以及
有无可用 A 时各自完整的状态价值图或策略图。

## CartPole 控制实验室

CartPole 实现标准的非线性位置、速度、杆角度与角速度动力学，并提供强重力和弱执行器环境，用于观察策略
如何依赖环境转移模型。

Q-learning、SARSA、Expected SARSA 和 Double Q-learning 会在可选择的四维离散状态上运行。页面展示物理
运动、连续与离散状态、当前动作价值、精确 TD 更新、回合长度曲线、500 步平衡率，以及角度—角速度策略切片。


