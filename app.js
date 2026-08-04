const translations = {
  zh: {
    skip: "跳到正文",
    navLabs: "算法实验室",
    navNotes: "学习笔记",
    navRoadmap: "学习路线",
    navStartLab: "打开实验室",
    navHome: "首页",
    navGrid: "网格世界",
    navBandit: "多臂老虎机",
    navPrediction: "价值预测",
    navMountainCar: "Mountain Car",
    themeToDark: "切换到深色模式",
    themeToLight: "切换到浅色模式",
    languageLabel: "Switch to English",
    heroEyebrow: "一份强化学习实践笔记",
    heroTitleLine1: "在行动中学习，",
    heroTitleLine2: "让价值显现。",
    heroCopy: "MindForge 记录我的强化学习历程，并把核心算法变成可以暂停、单步执行、重置和重新塑造的实验。",
    heroPrimary: "进入网格世界实验室",
    heroSecondary: "探索全部实验",
    statLabs: "个交互实验室",
    statAlgorithms: "种算法实验模式",
    statExperiments: "次可重复实验",
    libraryEyebrow: "交互式实验室",
    libraryTitle: "只改变一条规则，观察学习如何改变。",
    libraryCopy: "实验室会显露训练循环通常隐藏的状态、策略、价值估计、不确定性与遗憾。",
    statusInteractive: "可交互",
    statusReady: "等待生长",
    statusReusable: "可复用",
    statusPlanned: "计划中",
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
    openLab: "打开实验室",
    notesKicker: "个人学习记录",
    notesTitle: "强化学习笔记",
    notesCopy: "一座刻意留空的书架，用来逐步记录定义、推导、实验、错误与学习过程中产生的问题。",
    openNotes: "打开笔记库",
    templateKicker: "双语写作骨架",
    templateTitle: "学习笔记模板",
    templateCopy: "为问题、假设、推导、实验、修正与下一步提供清晰结构，中英文内容在源码中成对维护。",
    openTemplate: "查看模板",
    futureKicker: "函数逼近",
    futureTitle: "策略梯度与深度控制",
    futureCopy: "后续实验将把表格型直觉连接到 DQN、REINFORCE、Actor-Critic 与连续控制。",
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
    notesPageEyebrow: "学习记录",
    notesPageTitle: "笔记从这里开始生长。",
    notesPageDeck: "这里暂时不放预先生成的章节。每一篇内容都将在实际学习、推导和实验之后，由你逐步写入。",
    notesEmptyLabel: "当前状态",
    notesEmptyTitle: "书架还是空的，这正是设计的一部分。",
    notesEmptyCopy: "复制笔记模板，修改标题与章节，在学习过程中保留问题、推导、实验结果和修正痕迹。",
    notesTemplateButton: "打开笔记模板",
    notesGuideTitle: "建议的记录节奏",
    notesGuideOne: "先写下真正不明白的问题，而不是从定义开始抄写。",
    notesGuideTwo: "推导时显式写出条件、符号形状和每一步依据。",
    notesGuideThree: "用一个可重复实验检验直觉，并保存失败结果。",
    notesGuideFour: "最后区分已经理解的结论与仍需追问的问题。",
    templateEyebrow: "可复制模板",
    templatePageTitle: "强化学习学习笔记",
    templatePageDeck: "复制此页面并替换占位文本。英文与中文块保持相同章节顺序，便于持续同步。",
    templateMetaTopic: "主题：……",
    templateMetaDate: "日期：……",
    templateMetaStatus: "状态：草稿",
    templateUseTitle: "使用方式",
    templateUseCopy: "在源码中搜索 EDIT HERE。先复制文件并改名，再同时编辑 en 与 zh 内容块；不要直接把模板本身写成某一篇笔记。",
    backToNotes: "返回笔记库",
    labEyebrow: "交互式强化学习实验室",
    gridHeroTitle: "让 Bellman 更新在网格上变得可见。",
    gridHeroDeck: "选择环境和算法，调整超参数，然后单步观察价值、策略、TD 误差与轨迹如何改变。",
    banditHeroTitle: "在探索与利用之间做可见的选择。",
    banditHeroDeck: "改变每个臂的真实奖励率，比较五种探索策略如何形成估计、承担遗憾并追踪最优动作。",
    predictionHeroTitle: "看清等待完整回报与立即自举之间的差别。",
    predictionHeroDeck: "跟随一次随机游走，比较 Monte Carlo、TD(0)、n-step TD 与 TD(λ) 在何时、以何种目标移动每个状态价值。",
    mountainHeroTitle: "先积累动量，才能抵达目标。",
    mountainHeroDeck: "控制一辆动力不足的小车，并检查连续的位置与速度如何被转换成有限的 Q-table。",
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
    whatToWatch: "观察重点",
    guidedExperimentsTitle: "引导实验",
    reproducibleComparisons: "可复现对照",
    gridExperimentOneTitle: "更新目标是否考虑探索风险？",
    gridExperimentOneCopy: "选择悬崖行走，设 α=0.50、ε=0.10，分别训练 Q-learning 与 SARSA 50 回合；比较悬崖附近的贪心箭头和最近一次更新目标。",
    gridExperimentTwoTitle: "规划可以替代多少真实经验？",
    gridExperimentTwoCopy: "选择 Dyna 迷宫，分别使用 0、10、30 个规划步；保持 α、γ、ε 不变，并比较真实环境步数而不是总备份次数。",
    gridExperimentThreeTitle: "期望备份与采样事故有何差别？",
    gridExperimentThreeCopy: "在冰湖中先运行价值迭代至收敛，再训练 Q-learning；规划器会平均所有滑移结果，而 Q-learning 只能看到实际采样到的事故。",
    banditExperimentOneTitle: "哪种策略会有目的地分配探索？",
    banditExperimentOneCopy: "保持默认平稳均值，启用五策略比较并执行 500 次拉杆；比较 UCB 置信分数、Thompson 后验样本和累积遗憾。",
    banditExperimentTwoTitle: "旧证据失效时会发生什么？",
    banditExperimentTwoCopy: "执行 500 次后切换为非平稳随机游走并继续；观察最优臂改变后，哪些策略会重新检查其他选择。",
    banditExperimentThreeTitle: "乐观能否在没有随机探索时产生探索？",
    banditExperimentThreeCopy: "令 ε=0、Q₀=1.0，选择 ε-greedy 并重置后逐步执行；每次令人失望的奖励都会压低一个臂，使尚未尝试的乐观臂成为下一选择。",
    predictionExperimentOneTitle: "知道最终结果之前能学到什么？",
    predictionExperimentOneCopy: "用 Monte Carlo 单步完成一回合，重置后用 TD(0) 重复；观察抵达任一终点前价值表是否发生变化。",
    predictionExperimentTwoTitle: "偏差与方差的折中位于哪里？",
    predictionExperimentTwoCopy: "在 19 状态链上以相同 α 比较 n=1、4、10；记录更新延迟、自举项大小和 100 回合内 RMSE 的波动。",
    predictionExperimentThreeTitle: "一个 TD 误差应当传播多远？",
    predictionExperimentThreeCopy: "分别令 λ=0、0.5、0.95 运行 TD(λ)；在接近终点时逐步执行，检查多少个较早状态仍保有显著资格迹。",
    mountainExperimentOneTitle: "为什么暂时远离目标反而有帮助？",
    mountainExperimentOneCopy: "训练后从山谷中逐步执行并跟随引擎箭头；策略应先向左推动，再反向向右，把位置势能转化为速度。",
    mountainExperimentTwoTitle: "更精细的状态表何时会变慢？",
    mountainExperimentTwoCopy: "分别用 12×10 和 24×18 离散格训练 50 回合；比较早期到达率，并观察相邻状态格是否学到一致动作。",
    mountainExperimentThreeTitle: "资格迹能否更快传播终止信息？",
    mountainExperimentThreeCopy: "保持 α、γ、ε 相同，对比 SARSA 与 SARSA(λ=0.85)；观察回合长度，以及一个 TD 误差如何改变近期状态动作对。",
    gridWatchOne: "规划算法每一步更新整张价值表；TD 算法每一步只使用一条真实经验。",
    gridWatchTwo: "Q-learning 使用下一状态的最大 Q 值，SARSA 使用行为策略实际选择的下一动作。",
    gridWatchThree: "Dyna-Q 在每条真实经验之后回放学到的模型；可与普通 Q-learning 比较样本效率。",
    banditWatchOne: "ε-greedy 以固定概率探索，因此即使已经找到好臂也会继续随机试验。",
    banditWatchTwo: "UCB 根据访问次数构造乐观上界，优先检查尚不确定的臂。",
    banditWatchThree: "Thompson sampling 从后验中抽样，把不确定性直接转换成选择概率。",
    banditWatchFour: "在漂移环境中，样本平均会记住过期奖励；观察哪些策略会持续复查其他选择。",
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
    predictionWatchOne: "Monte Carlo 等待终止结果，再把观察到的完整回报沿整条轨迹向前传递。",
    predictionWatchTwo: "TD(0) 使用一个奖励和当前后继状态估计立即更新。",
    predictionWatchThree: "n-step TD 在一步自举与完整采样回报之间选择一个明确时域。",
    predictionWatchFour: "TD(λ) 通过近期状态的衰减记忆组合多种长度的备份。",
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
    mountainWatchOne: "只有位置并不满足 Markov 性：同一位置会因速度不同而需要不同动作。",
    mountainWatchTwo: "更多离散格能保留更细差异，但也会把经验分散到更大的表中，减慢早期学习。",
    mountainWatchThree: "即时奖励始终为 −1，因此更短的成功轨迹具有更大的回报。",
    mountainWatchFour: "SARSA(λ) 让每个 TD 误差沿近期活跃状态动作对传播，加速延迟信用分配。",
    gridWatchFour: "Double Q-learning 将动作选择与评价分离，以降低最大化偏差。",
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
