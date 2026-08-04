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
    statAlgorithms: "种经典算法",
    statExperiments: "次可重复实验",
    libraryEyebrow: "交互式实验室",
    libraryTitle: "只改变一条规则，观察学习如何改变。",
    libraryCopy: "实验室会显露训练循环通常隐藏的状态、策略、价值估计、不确定性与遗憾。",
    statusInteractive: "可交互",
    statusReady: "等待生长",
    statusReusable: "可复用",
    statusPlanned: "计划中",
    gridKicker: "4 种环境 · 5 种算法",
    gridTitle: "网格世界控制实验室",
    gridCopy: "在普通网格、悬崖、风场和迷宫中比较价值迭代、策略迭代、Q-learning、SARSA 与 Expected SARSA。",
    banditKicker: "可调奖励分布",
    banditTitle: "多臂老虎机实验室",
    banditCopy: "把 ε-greedy、UCB1 与 Thompson sampling 放进同一奖励环境，比较收益、不确定性与累积遗憾。",
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
    banditHeroDeck: "改变每个臂的真实奖励率，比较三种探索策略如何形成估计、承担遗憾并找到最优动作。",
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
    metricSweep: "更新轮次",
    metricStep: "交互步数",
    metricEpisode: "回合数",
    metricReturn: "最近回报",
    metricSignal: "更新信号",
    metricPulls: "拉杆次数",
    metricReward: "累计奖励",
    metricRegret: "累计遗憾",
    metricBest: "最优臂命中率",
    chartReturn: "回报轨迹",
    chartRegret: "累积遗憾",
    chartRecent: "最近 80 个回合或更新轮次",
    algorithmLens: "当前算法",
    editGridHint: "点击普通格子可以添加或移除障碍；修改环境会重置当前学习状态。",
    armEditorTitle: "奖励环境",
    armEditorCopy: "拖动滑块改变每个臂的真实期望奖励。算法只能看到采样结果，不能直接读取这些数值。",
    whatToWatch: "观察重点",
    gridWatchOne: "规划算法每一步更新整张价值表；TD 算法每一步只使用一条真实经验。",
    gridWatchTwo: "Q-learning 使用下一状态的最大 Q 值，SARSA 使用行为策略实际选择的下一动作。",
    gridWatchThree: "提高 ε 会增加探索；提高 γ 会让遥远奖励更早影响当前状态。",
    banditWatchOne: "ε-greedy 以固定概率探索，因此即使已经找到好臂也会继续随机试验。",
    banditWatchTwo: "UCB 根据访问次数构造乐观上界，优先检查尚不确定的臂。",
    banditWatchThree: "Thompson sampling 从后验中抽样，把不确定性直接转换成选择概率。",
    environmentGrid: "经典网格",
    environmentCliff: "悬崖行走",
    environmentWindy: "风场网格",
    environmentMaze: "迷宫",
    algorithmValue: "价值迭代",
    algorithmPolicy: "策略迭代",
    algorithmQ: "Q-learning",
    algorithmSarsa: "SARSA",
    algorithmExpected: "Expected SARSA",
    algorithmEpsilon: "ε-greedy",
    algorithmUcb: "UCB1",
    algorithmThompson: "Thompson sampling",
    rewardBernoulli: "Bernoulli 奖励",
    rewardGaussian: "Gaussian 奖励",
    armTrueMean: "真实均值",
    armEstimate: "估计",
    armPulls: "次数",
    legendAgent: "智能体",
    legendGoal: "目标",
    legendWall: "障碍",
    legendHazard: "危险区域",
    fiveArms: "5 个臂",
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
