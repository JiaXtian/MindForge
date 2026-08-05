const translations = {
  zh: {
    skip: "跳到正文",
    navLabs: "算法实验室",
    navRoadmap: "学习路线",
    navStartLab: "打开实验室",
    navHome: "首页",
    navGrid: "网格世界",
    navBandit: "多臂老虎机",
    navPrediction: "价值预测",
    navMountainCar: "Mountain Car",
    navBlackjack: "Blackjack",
    navCartPole: "CartPole",
    themeToDark: "切换到深色模式",
    themeToLight: "切换到浅色模式",
    languageLabel: "Switch to English",
    heroEyebrow: "一份强化学习实践笔记",
    heroTitleLine1: "在行动中学习，",
    heroTitleLine2: "让价值显现。",
    heroCopy: "MindForge 记录我的强化学习历程，并把核心算法变成可以暂停、单步执行、重置和重新塑造的实验。",
    statLabs: "个交互实验室",
    statAlgorithms: "种算法实验模式",
    statExperiments: "次可重复实验",
    libraryEyebrow: "交互式实验室",
    libraryTitle: "只改变一条规则，观察学习如何改变。",
    libraryCopy: "实验室会显露训练循环通常隐藏的状态、策略、价值估计、不确定性与遗憾。",
    statusInteractive: "可交互",
    gridKicker: "6 种环境 · 7 种算法",
    gridTitle: "网格世界控制实验室",
    gridCopy: "在网格、悬崖、风场、Dyna 迷宫、冰湖与四房间中比较规划、TD 控制、模型回放和双估计器。",
    banditKicker: "可调奖励分布",
    banditTitle: "多臂老虎机实验室",
    banditCopy: "在平稳或漂移奖励环境中比较 ε-greedy、UCB1、Thompson、Softmax 与 Gradient Bandit。",
    predictionKicker: "MC · TD · 资格迹",
    predictionTitle: "随机游走预测实验室",
    predictionCopy: "逐步比较 Monte Carlo、TD(0)、n-step TD 与 TD(λ) 如何估计同一策略的状态价值。",
    mountainKicker: "连续状态 · 表格控制",
    mountainTitle: "Mountain Car 控制实验室",
    mountainCopy: "观察动力学、动量、状态离散化和资格迹如何共同塑造一个延迟奖励控制策略。",
    blackjackKicker: "回合采样 · MC 控制",
    blackjackTitle: "Blackjack Monte Carlo 实验室",
    blackjackCopy: "比较首次访问 MC 预测、ε-soft 同策略控制与加权重要性采样，并检查完整状态价值和策略图。",
    cartpoleKicker: "经典控制 · 状态离散化",
    cartpoleTitle: "CartPole 控制实验室",
    cartpoleCopy: "在不同动力学条件下比较四种 TD 控制算法，观察连续四维状态如何形成有限动作价值表。",
    openLab: "打开实验室",
    principlesEyebrow: "如何使用实验室",
    principlesTitle: "把循环放慢，直到每一步都能被读懂。",
    principlesCopy: "当每次状态转移都能对应一次更新、一个估计变化和一个后续决策时，强化学习才会真正直观。",
    principleOneTitle: "训练前先观察。",
    principleOneCopy: "辨认状态、可选动作、奖励、终止条件，以及智能体究竟能看到哪些信息。",
    principleTwoTitle: "一次只改变一个变量。",
    principleTwoCopy: "调整 γ、α、ε 或环境时保持其他条件不变，再比较轨迹和学习曲线。",
    principleThreeTitle: "记录意外。",
    principleThreeCopy: "失败策略或不稳定估计是在揭示算法假设，而不是浪费时间。",
    journeyEyebrow: "学习路线",
    journeyTitle: "从 Bellman 更新走向学到的行为。",
    journeyCopy: "路线按照知识依赖展开；只有当概念在学习和实验中真正清晰时，新的笔记与实验才会加入。",
    phaseNow: "当前",
    phaseNext: "下一阶段",
    phaseLater: "后续",
    phaseOneTitle: "MDP 与规划",
    phaseOneCopy: "回报 · Bellman 方程 · 价值迭代 · 策略迭代",
    phaseTwoTitle: "从经验中学习",
    phaseTwoCopy: "Monte Carlo · TD · SARSA · Q-learning · 探索",
    phaseThreeTitle: "深度强化学习",
    phaseThreeCopy: "DQN · 策略梯度 · Actor-Critic · Offline RL · RLHF",
    closingEyebrow: "从一次状态转移开始",
    closingTitle: "当你能看见策略改变，策略就更容易理解。",
    closingButton: "运行网格世界实验室",
    footerCopy: "一份通过实验、修正与重复逐渐形成的强化学习笔记。",
    labEyebrow: "交互式强化学习实验室",
    currentExperiment: "实验类型",
    currentEnvironment: "当前环境",
    currentAlgorithm: "当前算法",
    controlPanel: "实验控制台",
    environment: "环境",
    algorithm: "算法",
    rewardModel: "奖励模型",
    gamma: "折扣因子 γ",
    alpha: "学习率 α",
    epsilon: "探索率 ε",
    speed: "运行速度",
    singleStep: "单步执行",
    autoRun: "自动运行",
    pause: "暂停",
    reset: "重置",
    trainBatch: "训练 50 回合",
    compareMode: "同时比较三种策略",
    compareFiveMode: "同时比较五种策略",
    planningSteps: "Dyna 规划步数",
    cellClickMode: "格子点击模式",
    editObstacles: "编辑障碍",
    chainLength: "非终止状态数",
    nStepHorizon: "n-step 时域",
    lambdaTrace: "资格迹衰减 λ",
    singleTransition: "单次状态转移",
    completeEpisode: "完成当前回合",
    trainHundred: "训练 100 回合",
    trainFifty: "训练 50 回合",
    positionBins: "位置离散格数",
    velocityBins: "速度离散格数",
    temperature: "温度 τ",
    preferenceStep: "偏好学习率 α",
    optimisticInitial: "初始估计 Q₀",
    rewardDynamics: "奖励动态",
    stationaryBandit: "平稳环境",
    driftingBandit: "非平稳随机游走",
    metricSweep: "更新轮次",
    metricStep: "交互步数",
    metricEpisode: "回合数",
    metricReturn: "最近回报",
    metricSignal: "更新信号",
    metricPulls: "拉杆次数",
    metricReward: "累计奖励",
    metricRegret: "累计遗憾",
    metricBest: "最优臂命中率",
    latestOutcome: "最近结果",
    rmse: "价值 RMSE",
    successRate: "到达目标率",
    chartReturn: "回报轨迹",
    chartRegret: "累积遗憾",
    chartRecent: "最近 80 个回合或更新轮次",
    algorithmLens: "当前算法",
    lastUpdateTitle: "最近一次更新",
    lastDecisionTitle: "最近一次决策",
    updateState: "状态",
    updateAction: "动作",
    updateReward: "奖励",
    updateNext: "下一状态",
    updateOld: "旧估计",
    updateTarget: "更新目标",
    updateError: "TD / Bellman 误差",
    updateNew: "新估计",
    updateBootstrap: "自举项",
    updateHorizon: "更新时域",
    editGridHint: "点击格子可以查看动作价值；启用障碍编辑后可修改普通格子，修改会重置学习状态。",
    stateInspectorTitle: "所选状态的动作价值",
    stateInspectorCopy: "比较所选状态的四个动作。贪心动作与最近刚更新的动作会使用不同标记。",
    transitionLogTitle: "近期转移账本",
    latestEight: "最近 8 条",
    transitionLogCopy: "每一行记录采样经验及其产生的数值更新；规划算法则记录 Bellman 备份。",
    qTableTitle: "实时状态动作表",
    qTableCopy: "每一行对应一个状态。规划算法的动作列显示一步 Bellman 备份，控制算法的动作列显示学到的 Q 值。",
    tableState: "状态",
    tableVisits: "访问次数",
    tableValue: "V / max Q",
    armEditorTitle: "奖励环境",
    armEditorCopy: "拖动滑块改变每个臂的真实期望奖励。算法只能看到采样结果，不能直接读取这些数值。",
    environmentGrid: "经典网格",
    environmentCliff: "悬崖行走",
    environmentWindy: "风场网格",
    environmentMaze: "迷宫",
    environmentFrozen: "冰湖",
    environmentFourRooms: "四房间",
    algorithmValue: "价值迭代",
    algorithmPolicy: "策略迭代",
    algorithmQ: "Q-learning",
    algorithmSarsa: "SARSA",
    algorithmExpected: "Expected SARSA",
    algorithmDyna: "Dyna-Q",
    algorithmDouble: "Double Q-learning",
    algorithmMc: "Every-visit Monte Carlo",
    algorithmTd0: "TD(0)",
    algorithmNStep: "n-step TD",
    algorithmTdLambda: "TD(λ)",
    algorithmSarsaLambda: "SARSA(λ)",
    algorithmEpsilon: "ε-greedy",
    algorithmUcb: "UCB1",
    algorithmThompson: "Thompson sampling",
    algorithmSoftmax: "Softmax 探索",
    algorithmGradient: "Gradient Bandit",
    rewardBernoulli: "Bernoulli 奖励",
    rewardGaussian: "Gaussian 奖励",
    armTrueMean: "真实均值",
    armEstimate: "估计",
    armPulls: "次数",
    legendAgent: "智能体",
    legendGoal: "目标",
    legendWall: "障碍",
    legendHazard: "危险区域",
    legendSelected: "正在检查的状态",
    fiveArms: "5 个臂",
    selectedArm: "所选臂",
    observedReward: "观察奖励",
    selectionScore: "选择分数",
    selectionProbability: "动作概率",
    instantRegret: "即时遗憾",
    baselineReward: "奖励基线",
    decisionTableTitle: "逐臂决策证据",
    decisionTableCopy: "显示量会随策略变化：置信上界、后验样本、Softmax 概率或学到的偏好。",
    randomWalkTitle: "对称随机游走",
    estimatedValue: "估计值 V(s)",
    trueValue: "真实价值 vπ(s)",
    rmseCurve: "预测误差",
    perEpisode: "每回合记录",
    valueTableTitle: "价值估计表",
    eligibilityTitle: "资格迹",
    eligibilityCopy: "TD(λ) 沿近期访问状态向后分配信用；每次转移后，资格迹按照 γλ 衰减。",
    episodeLedgerTitle: "当前回合轨迹",
    mountainEnvironment: "连续山谷",
    position: "位置",
    velocity: "速度",
    discreteState: "离散状态",
    force: "引擎作用力",
    stepsPerEpisode: "每回合步数",
    lowerIsBetter: "越低越好",
    currentQValues: "当前状态 Q 值",
    stateAggregationMap: "状态聚合图",
    velocityByPosition: "速度 × 位置",
    stateAggregationCopy: "每个格子代表连续状态空间中的一个矩形区域；颜色表示 max Q，符号表示贪心引擎动作。",
    dynamicsTitle: "环境动力学",
    dynamicsCopy: "引擎无法直接爬上右侧山坡。成功策略需要先向左行驶，把高度转化为速度，再向右加速并积累足够动量。",
    ruleSet: "规则集",
    blackjackStandard: "庄家软 17 停牌",
    blackjackSoft17: "庄家软 17 要牌",
    algorithmMcPrediction: "首次访问 MC 预测",
    algorithmMcControl: "同策略 MC 控制",
    algorithmOffPolicyMc: "离策略 MC 控制",
    trainFiveHundred: "训练 500 回合",
    dealerHand: "庄家",
    playerHand: "玩家",
    playerSum: "玩家点数",
    dealerShowing: "庄家明牌",
    usableAce: "可用 A",
    nextAction: "下一动作",
    winRate: "胜率",
    averageReturn: "平均回报",
    visitedStates: "已访问状态",
    sampledReturn: "采样回报",
    importanceWeight: "重要性权重",
    blackjackStateMap: "状态价值与策略图",
    dealerByPlayer: "庄家明牌 × 玩家点数",
    blackjackMapCopy: "每个格子显示当前价值估计；使用控制算法时还会显示贪心动作 H 或 S。",
    withoutUsableAce: "无可用 A",
    withUsableAce: "有可用 A",
    returnHistory: "回报记录",
    recentHundred: "最近 100 回合",
    cartpoleStandard: "标准动力学",
    cartpoleStrongGravity: "强重力",
    cartpoleWeakForce: "弱执行器",
    stateResolution: "状态分辨率",
    resolutionCoarse: "粗粒度 · 5×5×8×8",
    resolutionMedium: "中粒度 · 7×7×10×10",
    resolutionFine: "细粒度 · 9×9×14×14",
    cartPosition: "小车位置",
    cartVelocity: "小车速度",
    poleAngle: "杆角度",
    angularVelocity: "角速度",
    latestLength: "最近回合长度",
    balanceRate: "500 步平衡率",
    lowerIsNotBetter: "越高越好",
    cartpoleStateMap: "角度—角速度状态切片",
    cartpoleMapCopy: "固定小车位置与速度为当前离散格，展示不同杆角度和角速度下的贪心施力方向。",
    cartpoleDynamicsCopy: "动作施加固定水平力；位置或杆角度越界时回合终止，因此每多保持一个成功步骤就获得奖励 1。",
    labResetStatus: "实验已重置。",
    runStatus: "正在自动运行",
    pausedStatus: "实验已暂停。",
    footerLabCopy: "所有计算都在浏览器本地完成；刷新页面即可从干净状态重新开始。"
  }
};

const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const languageToggle = document.querySelector("#language-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const experimentSwitcher = document.querySelector("#experiment-switcher");

function currentLanguage() {
  return root.lang === "zh-CN" ? "zh" : "en";
}

function getInitialTheme() {
  const saved = localStorage.getItem("mindforge-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("mindforge-theme", theme);
  const isChinese = currentLanguage() === "zh";
  const key = theme === "light" ? "themeToDark" : "themeToLight";
  const english = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  themeToggle?.setAttribute("aria-label", isChinese ? translations.zh[key] : english);
  themeMeta?.setAttribute("content", theme === "dark" ? "#111310" : "#f2efe7");
  window.dispatchEvent(new CustomEvent("mindforge:theme", { detail: { theme } }));
}

function setLanguage(language) {
  const isChinese = language === "zh";
  root.lang = isChinese ? "zh-CN" : "en";
  localStorage.setItem("mindforge-language", language);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (!element.dataset.en) element.dataset.en = element.textContent.trim();
    element.textContent = isChinese ? translations.zh[key] ?? element.dataset.en : element.dataset.en;
  });

  document.querySelectorAll("[data-lang-content]").forEach((element) => {
    element.hidden = element.dataset.langContent !== language;
  });

  document.querySelectorAll("[data-copy-en][data-copy-zh]").forEach((element) => {
    element.textContent = isChinese ? element.dataset.copyZh : element.dataset.copyEn;
  });

  if (languageToggle) {
    languageToggle.querySelector(".current-language").textContent = isChinese ? "中" : "EN";
    languageToggle.querySelector(".next-language").textContent = isChinese ? "EN" : "中";
    languageToggle.setAttribute("aria-label", isChinese ? translations.zh.languageLabel : "切换到中文");
  }

  if (document.body.dataset.titleEn) {
    document.title = isChinese ? document.body.dataset.titleZh : document.body.dataset.titleEn;
  }

  setTheme(root.dataset.theme);
  window.dispatchEvent(new CustomEvent("mindforge:language", { detail: { language } }));
}

setTheme(getInitialTheme());
setLanguage(localStorage.getItem("mindforge-language") === "zh" ? "zh" : "en");

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

languageToggle?.addEventListener("click", () => {
  setLanguage(currentLanguage() === "zh" ? "en" : "zh");
});

experimentSwitcher?.addEventListener("change", () => {
  window.location.href = experimentSwitcher.value;
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}
