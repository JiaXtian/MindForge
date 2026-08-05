const ACTIONS = [
  { dx: 0, dy: -1, arrow: "↑", en: "up", zh: "上" },
  { dx: 1, dy: 0, arrow: "→", en: "right", zh: "右" },
  { dx: 0, dy: 1, arrow: "↓", en: "down", zh: "下" },
  { dx: -1, dy: 0, arrow: "←", en: "left", zh: "左" },
];

const algorithmDetails = {
  value: {
    name: { en: "Value iteration", zh: "价值迭代" },
    badge: "VALUE ITERATION",
    formula: "V(s) ← maxₐ Σₛ′ p(s′|s,a)[r + γV(s′)]",
    en: "A synchronous Bellman optimality sweep updates every state from a frozen copy of the previous value table. Stochastic environments average over all possible successors.",
    zh: "同步 Bellman 最优更新使用上一轮价值表的冻结副本更新每个状态；在随机环境中，更新会对所有可能后继状态求期望。",
  },
  policy: {
    name: { en: "Policy iteration", zh: "策略迭代" },
    badge: "POLICY ITERATION",
    formula: "Vᵖ(s) ← Eπ[r + γVᵖ(s′)]  ·  π ← greedy(Vᵖ)",
    en: "Five policy-evaluation sweeps are followed by one greedy improvement. This modified policy iteration makes the evaluation and improvement phases visible.",
    zh: "先进行五轮策略评估，再执行一次贪心策略改进。这种修正策略迭代能清楚展示评估与改进两个阶段。",
  },
  qlearning: {
    name: { en: "Q-learning", zh: "Q-learning" },
    badge: "Q-LEARNING / OFF-POLICY",
    formula: "Q(s,a) ← Q(s,a) + α[r + γ maxₐ′Q(s′,a′) − Q(s,a)]",
    en: "The behavior is epsilon-greedy, while the target assumes a greedy next action. Only the sampled state-action pair changes on each real interaction.",
    zh: "行为策略采用 ε-greedy，而目标假设下一步执行贪心动作；每次真实交互只更新被采样的一对状态与动作。",
  },
  sarsa: {
    name: { en: "SARSA", zh: "SARSA" },
    badge: "SARSA / ON-POLICY",
    formula: "Q(s,a) ← Q(s,a) + α[r + γQ(s′,a′) − Q(s,a)]",
    en: "The target uses the next action selected by the same behavior policy. Exploration risk therefore becomes part of the learned action value.",
    zh: "目标使用同一行为策略实际选择的下一动作，因此探索产生的风险会直接进入动作价值。",
  },
  expected: {
    name: { en: "Expected SARSA", zh: "Expected SARSA" },
    badge: "EXPECTED SARSA",
    formula: "Q(s,a) ← Q(s,a) + α[r + γΣₐπ(a|s′)Q(s′,a) − Q(s,a)]",
    en: "The next-state target averages over the epsilon-greedy policy instead of sampling one action, reducing target variance while remaining on-policy.",
    zh: "下一状态目标对 ε-greedy 策略求期望，而不是只采样一个动作，因此在保持 on-policy 的同时降低目标方差。",
  },
  dyna: {
    name: { en: "Dyna-Q", zh: "Dyna-Q" },
    badge: "DYNA-Q / LEARNED MODEL",
    formula: "real Q-update + n simulated Q-updates from model M(s,a)",
    en: "Each real transition updates Q and enters a learned one-step model. Dyna-Q then replays sampled model entries, converting computation into additional learning experience.",
    zh: "每条真实转移既更新 Q，也写入一步模型；随后 Dyna-Q 从模型中抽样回放，把额外计算转化为额外学习经验。",
  },
  double: {
    name: { en: "Double Q-learning", zh: "Double Q-learning" },
    badge: "DOUBLE Q-LEARNING",
    formula: "Qᴬ ← r + γQᴮ(s′, arg max Qᴬ)  or swap A,B",
    en: "Two estimators alternate roles. One selects the maximizing action and the other evaluates it, weakening the positive bias caused by maximizing noisy estimates.",
    zh: "两个估计器交替分工：一个选择最大动作，另一个负责评价，从而削弱对含噪估计取最大值造成的正偏差。",
  },
};

const environmentNames = {
  grid: { en: "Classic grid", zh: "经典网格", enCopy: "A deterministic 6×6 navigation MDP with walls, one trap, and a terminal goal. Each move costs a small reward, so shortest safe paths are preferred.", zhCopy: "一个确定性的 6×6 导航 MDP，包含障碍、陷阱和终止目标。每次移动都有小额代价，因此策略倾向于寻找最短安全路径。" },
  cliff: { en: "Cliff walking", zh: "悬崖行走", enCopy: "A 4×10 episodic task with a severe cliff penalty. It exposes how on-policy and off-policy targets account for exploratory behavior differently.", zhCopy: "一个带有严重悬崖惩罚的 4×10 回合任务，用于展示同策略与离策略目标如何以不同方式处理探索风险。" },
  windy: { en: "Windy grid", zh: "风场网格", enCopy: "A 7×10 grid where column-dependent wind pushes the agent upward after each action, coupling intended motion with environment dynamics.", zhCopy: "一个 7×10 网格，智能体每次行动后都会受到由列决定的向上风力，因此预期移动与环境动力学相互耦合。" },
  maze: { en: "Dyna maze", zh: "Dyna 迷宫", enCopy: "A sparse maze designed to compare direct learning from real transitions with additional planning updates sampled from a learned model.", zhCopy: "一个稀疏迷宫，用于比较直接使用真实转移学习与从已学习模型中抽样执行额外规划更新。" },
  frozen: { en: "Frozen lake · 20% slip", zh: "冰湖 · 20% 滑移", enCopy: "A stochastic grid in which the intended action succeeds with 80% probability and lateral slips share the remaining probability mass.", zhCopy: "一个随机网格：预期动作以 80% 概率成功，其余概率由两个侧向滑移动作平分。" },
  fourrooms: { en: "Four rooms", zh: "四房间", enCopy: "An 11×11 navigation problem whose narrow doorways create bottlenecks and reveal how slowly local value information crosses distant regions.", zhCopy: "一个 11×11 导航问题，狭窄门口形成状态瓶颈，可观察局部价值信息跨越远距离区域时的传播速度。" },
};

const gridContext = {
  experiment: { en: "Tabular MDP planning and control exposes complete state, transition, value, and policy updates.", zh: "表格型 MDP 规划与控制会完整展示状态、转移、价值和策略更新。" },
};

const uiText = {
  ready: { en: "Experiment ready. Select a cell to inspect it.", zh: "实验已就绪，可点击格子查看状态。" },
  running: { en: "Running automatically.", zh: "正在自动运行。" },
  paused: { en: "Experiment paused.", zh: "实验已暂停。" },
  reset: { en: "Experiment reset.", zh: "实验已重置。" },
  edited: { en: "Obstacle changed; learning was reset.", zh: "障碍已修改，学习状态已重置。" },
  selected: { en: "State selected for inspection.", zh: "已选择状态进行检查。" },
  episode: { en: "Episode finished.", zh: "本回合结束。" },
  sweep: { en: "Completed one full-state Bellman sweep.", zh: "已完成一轮全状态 Bellman 更新。" },
  batchPlanning: { en: "Run 50 sweeps", zh: "执行 50 轮更新" },
  batchLearning: { en: "Train 50 episodes", zh: "训练 50 回合" },
  run: { en: "Auto run", zh: "自动运行" },
  pause: { en: "Pause", zh: "暂停" },
  planning: { en: "planning · expected full sweep", zh: "规划 · 期望全状态更新" },
  learning: { en: "learning · sampled transition", zh: "学习 · 采样转移" },
  dynaMode: { en: "learning · real + model replay", zh: "学习 · 真实经验 + 模型回放" },
  doubleMode: { en: "learning · two estimators", zh: "学习 · 双估计器" },
  start: { en: "start", zh: "起点" },
  cliff: { en: "cliff", zh: "悬崖" },
  hole: { en: "hole", zh: "冰洞" },
  goal: { en: "goal", zh: "目标" },
  trap: { en: "trap", zh: "陷阱" },
  wall: { en: "wall", zh: "障碍" },
  state: { en: "state", zh: "状态" },
  noUpdates: { en: "No updates yet. Advance one step to expose the calculation.", zh: "尚无更新。执行一次单步即可看到计算过程。" },
  noTransitions: { en: "The transition ledger is empty.", zh: "转移记录暂时为空。" },
  greedy: { en: "greedy", zh: "贪心" },
  updated: { en: "updated", zh: "刚更新" },
  backup: { en: "backup", zh: "备份值" },
  learnedQ: { en: "learned Q", zh: "已学习 Q" },
  terminal: { en: "terminal", zh: "终止" },
  planningReplay: { en: "model backups", zh: "模型回放" },
  tablePlanning: { en: "V(s) + Bellman backups", zh: "V(s) + Bellman 备份" },
  tableDouble: { en: "average of Q-A and Q-B", zh: "Q-A 与 Q-B 的平均值" },
  tableLearning: { en: "learned Q(s, a)", zh: "已学习的 Q(s, a)" },
  bellman: { en: "Bellman backup", zh: "Bellman 备份" },
  targetShort: { en: "target", zh: "目标" },
  errorShort: { en: "error", zh: "误差" },
};

const board = document.querySelector("#grid-board");
const environmentSelect = document.querySelector("#environment-select");
const algorithmSelect = document.querySelector("#algorithm-select");
const gammaInput = document.querySelector("#gamma-input");
const alphaInput = document.querySelector("#alpha-input");
const epsilonInput = document.querySelector("#epsilon-input");
const planningInput = document.querySelector("#planning-input");
const speedInput = document.querySelector("#speed-input");
const editToggle = document.querySelector("#edit-toggle");
const stepButton = document.querySelector("#step-button");
const runButton = document.querySelector("#run-button");
const resetButton = document.querySelector("#reset-button");
const batchButton = document.querySelector("#batch-button");
const statusElement = document.querySelector("#lab-status");

let env;
let values;
let qA;
let qB;
let policy;
let visits;
let model;
let agentState;
let selectedState;
let queuedAction = null;
let sweepCount = 0;
let environmentSteps = 0;
let episodeCount = 0;
let episodeReturn = 0;
let episodeSteps = 0;
let latestReturn = null;
let latestSignal = 0;
let policyEvaluationSweeps = 0;
let history = [];
let transitionLog = [];
let lastUpdate = null;
let runTimer = null;
let currentStatusKey = "ready";

function language() {
  return document.documentElement.lang === "zh-CN" ? "zh" : "en";
}

function stateIndex(x, y, width) {
  return y * width + x;
}

function buildFourRoomsWalls() {
  const walls = [];
  for (let y = 0; y < 11; y += 1) {
    if (y !== 1 && y !== 8) walls.push(stateIndex(5, y, 11));
  }
  for (let x = 0; x < 11; x += 1) {
    if (x !== 1 && x !== 8) walls.push(stateIndex(x, 5, 11));
  }
  return walls;
}

function makeEnvironment(type) {
  let spec;
  if (type === "cliff") {
    spec = {
      type,
      width: 10,
      height: 4,
      start: stateIndex(0, 3, 10),
      terminals: { [stateIndex(9, 3, 10)]: 0 },
      walls: [],
      hazards: Array.from({ length: 8 }, (_, index) => [stateIndex(index + 1, 3, 10), { reward: -100, reset: true, kind: "cliff" }]),
      wind: [],
      slip: 0,
      stepReward: -1,
    };
  } else if (type === "windy") {
    spec = {
      type,
      width: 10,
      height: 7,
      start: stateIndex(0, 3, 10),
      terminals: { [stateIndex(7, 3, 10)]: 0 },
      walls: [],
      hazards: [],
      wind: [0, 0, 0, 1, 1, 1, 2, 2, 1, 0],
      slip: 0,
      stepReward: -1,
    };
  } else if (type === "maze") {
    spec = {
      type,
      width: 9,
      height: 7,
      start: stateIndex(0, 6, 9),
      terminals: { [stateIndex(8, 0, 9)]: 5 },
      walls: [
        stateIndex(2, 0, 9), stateIndex(2, 1, 9), stateIndex(2, 2, 9),
        stateIndex(2, 4, 9), stateIndex(2, 5, 9), stateIndex(4, 1, 9),
        stateIndex(4, 2, 9), stateIndex(4, 3, 9), stateIndex(4, 4, 9),
        stateIndex(6, 2, 9), stateIndex(6, 3, 9), stateIndex(6, 5, 9),
      ],
      hazards: [],
      wind: [],
      slip: 0,
      stepReward: -0.04,
    };
  } else if (type === "frozen") {
    const holes = [[1, 4], [3, 4], [4, 3], [1, 2], [4, 1], [2, 0]];
    spec = {
      type,
      width: 6,
      height: 6,
      start: stateIndex(0, 5, 6),
      terminals: { [stateIndex(5, 0, 6)]: 1 },
      walls: [],
      hazards: holes.map(([x, y]) => [stateIndex(x, y, 6), { reward: 0, reset: false, kind: "hole" }]),
      wind: [],
      slip: 0.2,
      stepReward: 0,
    };
  } else if (type === "fourrooms") {
    spec = {
      type,
      width: 11,
      height: 11,
      start: stateIndex(0, 10, 11),
      terminals: { [stateIndex(10, 0, 11)]: 1 },
      walls: buildFourRoomsWalls(),
      hazards: [],
      wind: [],
      slip: 0,
      stepReward: -0.01,
    };
  } else {
    spec = {
      type: "grid",
      width: 6,
      height: 6,
      start: stateIndex(0, 5, 6),
      terminals: { [stateIndex(5, 0, 6)]: 1, [stateIndex(5, 4, 6)]: -1 },
      walls: [
        stateIndex(1, 1, 6), stateIndex(1, 2, 6), stateIndex(3, 2, 6),
        stateIndex(3, 3, 6), stateIndex(4, 3, 6),
      ],
      hazards: [],
      wind: [],
      slip: 0,
      stepReward: -0.02,
    };
  }
  spec.walls = new Set(spec.walls);
  spec.hazards = new Map(spec.hazards);
  return spec;
}

function isTerminal(state) {
  return Object.prototype.hasOwnProperty.call(env.terminals, state);
}

function isHazard(state) {
  return env.hazards.has(state);
}

function isUnavailable(state) {
  return env.walls.has(state) || isHazard(state);
}

function deterministicTransition(state, action) {
  if (isTerminal(state) || isHazard(state)) return { next: state, reward: 0, done: true };
  const x = state % env.width;
  const y = Math.floor(state / env.width);
  let nx = Math.max(0, Math.min(env.width - 1, x + ACTIONS[action].dx));
  let ny = Math.max(0, Math.min(env.height - 1, y + ACTIONS[action].dy));
  let next = stateIndex(nx, ny, env.width);
  if (env.walls.has(next)) {
    nx = x;
    ny = y;
    next = state;
  }

  if (env.wind.length > 0) {
    const strength = env.wind[nx] || 0;
    for (let i = 0; i < strength; i += 1) {
      const candidateY = Math.max(0, ny - 1);
      const candidate = stateIndex(nx, candidateY, env.width);
      if (env.walls.has(candidate)) break;
      ny = candidateY;
      next = candidate;
    }
  }

  if (env.hazards.has(next)) {
    const hazard = env.hazards.get(next);
    return { next: hazard.reset ? env.start : next, reward: hazard.reward, done: true };
  }
  if (isTerminal(next)) return { next, reward: env.terminals[next], done: true };
  return { next, reward: env.stepReward, done: false };
}

function transitionOutcomes(state, action) {
  if (env.slip <= 0) return [{ ...deterministicTransition(state, action), probability: 1 }];
  const candidates = [
    { action, probability: 1 - env.slip },
    { action: (action + 1) % ACTIONS.length, probability: env.slip / 2 },
    { action: (action + ACTIONS.length - 1) % ACTIONS.length, probability: env.slip / 2 },
  ];
  const combined = new Map();
  for (const candidate of candidates) {
    const result = deterministicTransition(state, candidate.action);
    const key = result.next + "|" + result.reward + "|" + result.done;
    if (!combined.has(key)) combined.set(key, { ...result, probability: 0 });
    combined.get(key).probability += candidate.probability;
  }
  return [...combined.values()];
}

function sampleTransition(state, action) {
  const outcomes = transitionOutcomes(state, action);
  let draw = Math.random();
  for (const outcome of outcomes) {
    draw -= outcome.probability;
    if (draw <= 0) return { next: outcome.next, reward: outcome.reward, done: outcome.done };
  }
  const fallback = outcomes[outcomes.length - 1];
  return { next: fallback.next, reward: fallback.reward, done: fallback.done };
}

function gamma() {
  return Number(gammaInput.value);
}

function alpha() {
  return Number(alphaInput.value);
}

function epsilon() {
  return Number(epsilonInput.value);
}

function resetLearning(messageKey) {
  const stateCount = env.width * env.height;
  values = Array(stateCount).fill(0);
  qA = Array.from({ length: stateCount }, () => [0, 0, 0, 0]);
  qB = Array.from({ length: stateCount }, () => [0, 0, 0, 0]);
  policy = Array.from({ length: stateCount }, (_, state) => (state + 1) % ACTIONS.length);
  visits = Array(stateCount).fill(0);
  model = new Map();
  agentState = env.start;
  selectedState = env.start;
  queuedAction = null;
  sweepCount = 0;
  environmentSteps = 0;
  episodeCount = 0;
  episodeReturn = 0;
  episodeSteps = 0;
  latestReturn = null;
  latestSignal = 0;
  policyEvaluationSweeps = 0;
  history = [];
  transitionLog = [];
  lastUpdate = null;
  stopRun(false);
  setStatus(messageKey || "ready");
  updateControlAvailability();
  render();
}

function rebuildEnvironment() {
  env = makeEnvironment(environmentSelect.value);
  resetLearning("ready");
}

function actionValueFromValues(state, action) {
  return transitionOutcomes(state, action).reduce((sum, result) => {
    const continuation = result.done ? 0 : gamma() * values[result.next];
    return sum + result.probability * (result.reward + continuation);
  }, 0);
}

function bestActions(actionValues) {
  const maximum = Math.max(...actionValues);
  return actionValues
    .map((value, action) => ({ value, action }))
    .filter((item) => Math.abs(item.value - maximum) < 1e-10)
    .map((item) => item.action);
}

function displayedQValues(state) {
  if (algorithmSelect.value === "double") {
    return qA[state].map((value, action) => (value + qB[state][action]) / 2);
  }
  return qA[state];
}

function behaviorQValues(state) {
  if (algorithmSelect.value === "double") {
    return qA[state].map((value, action) => value + qB[state][action]);
  }
  return qA[state];
}

function greedyAction(state, randomTie) {
  const candidates = bestActions(behaviorQValues(state));
  if (randomTie && candidates.length > 1) return candidates[Math.floor(Math.random() * candidates.length)];
  return candidates[0];
}

function chooseAction(state) {
  if (Math.random() < epsilon()) return Math.floor(Math.random() * ACTIONS.length);
  return greedyAction(state, true);
}

function expectedNextValue(state) {
  const candidates = bestActions(qA[state]);
  const randomShare = epsilon() / ACTIONS.length;
  return qA[state].reduce((sum, value, action) => {
    const greedyShare = candidates.includes(action) ? (1 - epsilon()) / candidates.length : 0;
    return sum + (randomShare + greedyShare) * value;
  }, 0);
}

function stateLabel(state) {
  if (state === null || state === undefined) return "—";
  const x = state % env.width;
  const y = Math.floor(state / env.width);
  return "S(" + x + "," + y + ")";
}

function recordUpdate(update) {
  lastUpdate = update;
  transitionLog.unshift(update);
  transitionLog = transitionLog.slice(0, 8);
}

function runPlanningStep() {
  const previousValues = values.slice();
  const nextValues = values.slice();
  let delta = 0;
  const algorithm = algorithmSelect.value;
  if (isUnavailable(selectedState) || isTerminal(selectedState)) selectedState = env.start;
  const inspectedBackups = ACTIONS.map((_, action) => actionValueFromValues(selectedState, action));
  const inspectedAction = algorithm === "policy" ? policy[selectedState] : bestActions(inspectedBackups)[0];

  for (let state = 0; state < values.length; state += 1) {
    if (isUnavailable(state) || isTerminal(state)) continue;
    let nextValue;
    if (algorithm === "policy") {
      nextValue = actionValueFromValues(state, policy[state]);
    } else {
      nextValue = Math.max(...ACTIONS.map((_, action) => actionValueFromValues(state, action)));
    }
    nextValues[state] = nextValue;
    delta = Math.max(delta, Math.abs(nextValue - values[state]));
  }

  values = nextValues;
  sweepCount += 1;
  latestSignal = delta;
  if (algorithm === "policy") {
    policyEvaluationSweeps += 1;
    if (policyEvaluationSweeps >= 5) {
      for (let state = 0; state < values.length; state += 1) {
        if (isUnavailable(state) || isTerminal(state)) continue;
        policy[state] = bestActions(ACTIONS.map((_, action) => actionValueFromValues(state, action)))[0];
      }
      policyEvaluationSweeps = 0;
    }
  } else {
    for (let state = 0; state < values.length; state += 1) {
      if (isUnavailable(state) || isTerminal(state)) continue;
      policy[state] = bestActions(ACTIONS.map((_, action) => actionValueFromValues(state, action)))[0];
    }
  }

  recordUpdate({
    kind: "planning",
    table: "V",
    state: selectedState,
    action: inspectedAction,
    reward: null,
    next: null,
    old: previousValues[selectedState],
    target: values[selectedState],
    error: values[selectedState] - previousValues[selectedState],
    newValue: values[selectedState],
    planningCount: 0,
  });
  latestReturn = values[env.start];
  history.push(latestReturn);
  history = history.slice(-80);
  setStatus("sweep");
}

function updateTable(table, state, action, target) {
  const old = table[state][action];
  const error = target - old;
  table[state][action] += alpha() * error;
  return { old, error, newValue: table[state][action] };
}

function qLearningTarget(result, table = qA) {
  return result.reward + (result.done ? 0 : gamma() * Math.max(...table[result.next]));
}

function runDynaPlanning() {
  const entries = [...model.entries()];
  const count = Number(planningInput.value);
  if (entries.length === 0 || count === 0) return 0;
  for (let i = 0; i < count; i += 1) {
    const [key, remembered] = entries[Math.floor(Math.random() * entries.length)];
    const [state, action] = key.split(":").map(Number);
    updateTable(qA, state, action, qLearningTarget(remembered));
    sweepCount += 1;
  }
  return count;
}

function finishEpisode() {
  latestReturn = episodeReturn;
  history.push(episodeReturn);
  history = history.slice(-80);
  episodeCount += 1;
  episodeReturn = 0;
  episodeSteps = 0;
  agentState = env.start;
  queuedAction = null;
  setStatus("episode");
}

function runLearningStep(skipRender) {
  const algorithm = algorithmSelect.value;
  const state = agentState;
  const action = algorithm === "sarsa" && queuedAction !== null ? queuedAction : chooseAction(state);
  const result = sampleTransition(state, action);
  let target = result.reward;
  let nextAction = null;
  let table = qA;
  let tableName = "Q";
  let update;

  if (algorithm === "double") {
    const updateA = Math.random() < 0.5;
    table = updateA ? qA : qB;
    const evaluator = updateA ? qB : qA;
    tableName = updateA ? "Qᴬ" : "Qᴮ";
    if (!result.done) {
      const selectedAction = bestActions(table[result.next]);
      const greedy = selectedAction[Math.floor(Math.random() * selectedAction.length)];
      target += gamma() * evaluator[result.next][greedy];
    }
    update = updateTable(table, state, action, target);
  } else {
    if (!result.done) {
      if (algorithm === "qlearning" || algorithm === "dyna") {
        target += gamma() * Math.max(...qA[result.next]);
      } else if (algorithm === "sarsa") {
        nextAction = chooseAction(result.next);
        target += gamma() * qA[result.next][nextAction];
      } else {
        target += gamma() * expectedNextValue(result.next);
      }
    }
    update = updateTable(qA, state, action, target);
  }

  visits[state] += 1;
  latestSignal = update.error;
  environmentSteps += 1;
  episodeSteps += 1;
  episodeReturn += result.reward;
  agentState = result.next;
  queuedAction = nextAction;
  selectedState = state;

  let planningCount = 0;
  if (algorithm === "dyna") {
    model.set(state + ":" + action, { ...result });
    planningCount = runDynaPlanning();
  }

  recordUpdate({
    kind: "learning",
    table: tableName,
    state,
    action,
    reward: result.reward,
    next: result.next,
    old: update.old,
    target,
    error: update.error,
    newValue: update.newValue,
    planningCount,
  });

  if (result.done || episodeSteps >= 300) finishEpisode();
  if (!skipRender) render();
}

function performStep() {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") runPlanningStep();
  else runLearningStep(true);
  render();
}

function trainBatch() {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") {
    for (let i = 0; i < 50; i += 1) runPlanningStep();
  } else {
    const targetEpisode = episodeCount + 50;
    let guard = 0;
    while (episodeCount < targetEpisode && guard < 60000) {
      runLearningStep(true);
      guard += 1;
    }
  }
  render();
}

function setStatus(key) {
  currentStatusKey = key;
  statusElement.textContent = uiText[key][language()];
}

function startRun() {
  if (runTimer) return;
  setStatus("running");
  const delay = Math.max(45, 560 - Number(speedInput.value) * 52);
  runTimer = window.setInterval(performStep, delay);
  updateRunButton();
}

function stopRun(announce) {
  if (runTimer) window.clearInterval(runTimer);
  runTimer = null;
  if (announce) setStatus("paused");
  updateRunButton();
}

function restartRunTimer() {
  if (!runTimer) return;
  stopRun(false);
  startRun();
}

function updateRunButton() {
  runButton.textContent = uiText[runTimer ? "pause" : "run"][language()];
}

function updateControlAvailability() {
  const algorithm = algorithmSelect.value;
  const planning = algorithm === "value" || algorithm === "policy";
  alphaInput.disabled = planning;
  epsilonInput.disabled = planning;
  planningInput.disabled = algorithm !== "dyna";
  batchButton.textContent = uiText[planning ? "batchPlanning" : "batchLearning"][language()];
  const modeKey = planning ? "planning" : algorithm === "dyna" ? "dynaMode" : algorithm === "double" ? "doubleMode" : "learning";
  document.querySelector("#stage-mode").textContent = uiText[modeKey][language()];
  document.querySelector("#q-table-mode").textContent = uiText[planning ? "tablePlanning" : algorithm === "double" ? "tableDouble" : "tableLearning"][language()];
}

function updateAlgorithmCard() {
  const detail = algorithmDetails[algorithmSelect.value];
  document.querySelector("#algorithm-badge").textContent = detail.badge;
  document.querySelector("#algorithm-formula").textContent = detail.formula;
  document.querySelector("#algorithm-explanation").textContent = detail[language()];
}

function renderContext() {
  const lang = language();
  const environment = environmentNames[environmentSelect.value];
  const algorithm = algorithmDetails[algorithmSelect.value];
  document.querySelector("#context-experiment-copy").textContent = gridContext.experiment[lang];
  document.querySelector("#context-environment-name").textContent = environment[lang];
  document.querySelector("#context-environment-copy").textContent = environment[lang === "zh" ? "zhCopy" : "enCopy"];
  document.querySelector("#context-algorithm-name").textContent = algorithm.name[lang];
  document.querySelector("#context-algorithm-copy").textContent = algorithm[lang];
}

function displayedValue(state) {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") return values[state];
  return Math.max(...displayedQValues(state));
}

function displayedAction(state) {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") return policy[state];
  return bestActions(displayedQValues(state))[0];
}

function kindLabel(state) {
  if (state === env.start) return uiText.start[language()];
  if (env.walls.has(state)) return uiText.wall[language()];
  if (env.hazards.has(state)) return uiText[env.hazards.get(state).kind][language()];
  if (isTerminal(state)) return uiText[env.terminals[state] >= 0 ? "goal" : "trap"][language()];
  const x = state % env.width;
  if (env.wind[x] > 0) return "W" + env.wind[x];
  return "";
}

function renderBoard() {
  board.replaceChildren();
  board.style.setProperty("--cols", env.width);
  board.style.setProperty("--rows", env.height);
  const availableValues = values
    .map((_, state) => state)
    .filter((state) => !isUnavailable(state) && !isTerminal(state))
    .map(displayedValue);
  const scale = Math.max(0.001, ...availableValues.map((value) => Math.abs(value)));
  const visitScale = Math.max(1, ...visits);

  for (let state = 0; state < env.width * env.height; state += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "grid-cell";
    cell.setAttribute("role", "gridcell");
    cell.dataset.state = state;
    const x = state % env.width;
    const y = Math.floor(state / env.width);
    cell.setAttribute("aria-label", uiText.state[language()] + " " + x + ", " + y);

    if (env.walls.has(state)) cell.classList.add("is-wall");
    if (env.hazards.has(state)) cell.classList.add(env.hazards.get(state).kind === "cliff" ? "is-cliff" : "is-hole");
    if (isTerminal(state) && env.terminals[state] >= 0) cell.classList.add("is-goal");
    if (isTerminal(state) && env.terminals[state] < 0) cell.classList.add("is-trap");
    if (state === selectedState) cell.classList.add("is-selected");

    if (!isUnavailable(state)) {
      const value = displayedValue(state);
      const heat = Math.min(34, Math.abs(value) / scale * 34);
      cell.style.setProperty("--heat", heat.toFixed(1) + "%");
      cell.style.setProperty("--visit", (visits[state] / visitScale * 26).toFixed(1) + "%");

      const valueLabel = document.createElement("span");
      valueLabel.className = "cell-value";
      valueLabel.textContent = value.toFixed(2);
      cell.append(valueLabel);

      if (!isTerminal(state)) {
        const arrow = document.createElement("span");
        arrow.className = "cell-policy";
        arrow.textContent = ACTIONS[displayedAction(state)].arrow;
        cell.append(arrow);
      }

      if (visits[state] > 0) {
        const visit = document.createElement("span");
        visit.className = "cell-visits";
        visit.textContent = "n=" + visits[state];
        cell.append(visit);
      }
    }

    const kind = document.createElement("span");
    kind.className = "cell-kind";
    kind.textContent = kindLabel(state);
    cell.append(kind);

    if (state === agentState && algorithmSelect.value !== "value" && algorithmSelect.value !== "policy") {
      const agent = document.createElement("span");
      agent.className = "agent-dot";
      agent.textContent = "A";
      cell.append(agent);
    }

    cell.addEventListener("click", () => handleCellClick(state));
    board.append(cell);
  }
}

function handleCellClick(state) {
  if (editToggle.checked) {
    toggleWall(state);
    return;
  }
  selectedState = state;
  setStatus("selected");
  render();
}

function toggleWall(state) {
  if (state === env.start || isTerminal(state) || isHazard(state)) return;
  if (env.walls.has(state)) env.walls.delete(state);
  else env.walls.add(state);
  resetLearning("edited");
}

function renderMetrics() {
  document.querySelector("#metric-sweep").textContent = sweepCount;
  document.querySelector("#metric-step").textContent = environmentSteps;
  document.querySelector("#metric-episode").textContent = episodeCount;
  document.querySelector("#metric-return").textContent = latestReturn === null ? "—" : Number(latestReturn).toFixed(2);
  const signalPrefix = algorithmSelect.value === "value" || algorithmSelect.value === "policy" ? "Δ " : "δ ";
  document.querySelector("#metric-signal").textContent = signalPrefix + Number(latestSignal).toFixed(3);
}

function renderChart() {
  const polyline = document.querySelector("#return-line");
  if (history.length < 2) {
    polyline.setAttribute("points", "");
    return;
  }
  const minimum = Math.min(...history);
  const maximum = Math.max(...history);
  const spread = Math.max(1e-6, maximum - minimum);
  const points = history.map((value, index) => {
    const x = 32 + index / Math.max(1, history.length - 1) * 658;
    const y = 148 - (value - minimum) / spread * 130;
    return x.toFixed(1) + "," + y.toFixed(1);
  });
  polyline.setAttribute("points", points.join(" "));
}

function selectedActionValues() {
  if (isUnavailable(selectedState) || isTerminal(selectedState)) return null;
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") {
    return ACTIONS.map((_, action) => actionValueFromValues(selectedState, action));
  }
  return displayedQValues(selectedState);
}

function renderQInspector() {
  const inspector = document.querySelector("#q-inspector");
  inspector.replaceChildren();
  document.querySelector("#inspector-state").textContent = stateLabel(selectedState);
  const actionValues = selectedActionValues();
  if (!actionValues) {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = uiText.terminal[language()];
    inspector.append(empty);
    return;
  }
  const greedyActions = bestActions(actionValues);
  const magnitude = Math.max(0.001, ...actionValues.map((value) => Math.abs(value)));
  actionValues.forEach((value, action) => {
    const row = document.createElement("div");
    row.className = "q-action-row";
    if (greedyActions.includes(action)) row.classList.add("is-greedy");
    if (lastUpdate && lastUpdate.state === selectedState && lastUpdate.action === action) row.classList.add("is-updated");
    const label = document.createElement("strong");
    label.textContent = ACTIONS[action].arrow + " " + ACTIONS[action][language()];
    const track = document.createElement("span");
    track.className = "q-action-track";
    const fill = document.createElement("i");
    fill.style.width = Math.max(2, Math.abs(value) / magnitude * 100) + "%";
    track.append(fill);
    const number = document.createElement("code");
    number.textContent = value.toFixed(4);
    const tags = document.createElement("small");
    const labels = [];
    if (greedyActions.includes(action)) labels.push(uiText.greedy[language()]);
    if (lastUpdate && lastUpdate.state === selectedState && lastUpdate.action === action) labels.push(uiText.updated[language()]);
    tags.textContent = labels.join(" · ");
    row.append(label, track, number, tags);
    inspector.append(row);
  });
}

function numberText(value) {
  return value === null || value === undefined ? "—" : Number(value).toFixed(4);
}

function renderUpdateInspector() {
  const equation = document.querySelector("#update-equation");
  if (!lastUpdate) {
    equation.textContent = uiText.noUpdates[language()];
    for (const id of ["state", "action", "reward", "next", "old", "target", "error", "new"]) {
      document.querySelector("#update-" + id).textContent = "—";
    }
    document.querySelector("#update-table").textContent = "V / Q";
    return;
  }
  const stepSize = lastUpdate.kind === "planning" ? 1 : alpha();
  equation.textContent =
    lastUpdate.table + "new = " + numberText(lastUpdate.old) + " + " + stepSize.toFixed(2) +
    " × (" + numberText(lastUpdate.target) + " − " + numberText(lastUpdate.old) + ") = " + numberText(lastUpdate.newValue);
  document.querySelector("#update-table").textContent = lastUpdate.table + (lastUpdate.planningCount ? " + " + lastUpdate.planningCount + " " + uiText.planningReplay[language()] : "");
  document.querySelector("#update-state").textContent = stateLabel(lastUpdate.state);
  document.querySelector("#update-action").textContent = ACTIONS[lastUpdate.action].arrow + " " + ACTIONS[lastUpdate.action][language()];
  document.querySelector("#update-reward").textContent = numberText(lastUpdate.reward);
  document.querySelector("#update-next").textContent = stateLabel(lastUpdate.next);
  document.querySelector("#update-old").textContent = numberText(lastUpdate.old);
  document.querySelector("#update-target").textContent = numberText(lastUpdate.target);
  document.querySelector("#update-error").textContent = numberText(lastUpdate.error);
  document.querySelector("#update-new").textContent = numberText(lastUpdate.newValue);
}

function renderTransitionLog() {
  const log = document.querySelector("#transition-log");
  log.replaceChildren();
  if (transitionLog.length === 0) {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = uiText.noTransitions[language()];
    log.append(empty);
    return;
  }
  transitionLog.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "transition-entry";
    const order = document.createElement("span");
    order.textContent = String(environmentSteps + sweepCount - index).padStart(3, "0");
    const route = document.createElement("strong");
    route.textContent = stateLabel(entry.state) + " " + ACTIONS[entry.action].arrow + " " + (entry.next === null ? uiText.bellman[language()] : stateLabel(entry.next));
    const numbers = document.createElement("code");
    numbers.textContent = uiText.targetShort[language()] + " " + numberText(entry.target) + " · " + uiText.errorShort[language()] + " " + numberText(entry.error);
    row.append(order, route, numbers);
    log.append(row);
  });
}

function appendTableCell(row, text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  row.append(cell);
}

function renderQTable() {
  const body = document.querySelector("#q-table-body");
  body.replaceChildren();
  const planning = algorithmSelect.value === "value" || algorithmSelect.value === "policy";
  for (let state = 0; state < env.width * env.height; state += 1) {
    const row = document.createElement("tr");
    if (state === selectedState) row.classList.add("is-selected");
    if (isUnavailable(state) || isTerminal(state)) row.classList.add("is-unavailable");
    appendTableCell(row, stateLabel(state) + (kindLabel(state) ? " · " + kindLabel(state) : ""), "state-column");
    appendTableCell(row, String(visits[state]));
    appendTableCell(row, isUnavailable(state) ? "—" : displayedValue(state).toFixed(4), "value-column");
    const actionValues = isUnavailable(state) || isTerminal(state)
      ? null
      : planning
        ? ACTIONS.map((_, action) => actionValueFromValues(state, action))
        : displayedQValues(state);
    for (let action = 0; action < ACTIONS.length; action += 1) {
      const className = actionValues && bestActions(actionValues).includes(action) ? "is-greedy" : "";
      appendTableCell(row, actionValues ? actionValues[action].toFixed(4) : "—", className);
    }
    if (!env.walls.has(state)) {
      row.addEventListener("click", () => {
        selectedState = state;
        setStatus("selected");
        render();
      });
    }
    body.append(row);
  }
}

function render() {
  document.querySelector("#environment-name").textContent = environmentNames[env.type][language()];
  renderContext();
  updateAlgorithmCard();
  updateControlAvailability();
  updateRunButton();
  renderBoard();
  renderMetrics();
  renderChart();
  renderQInspector();
  renderUpdateInspector();
  renderTransitionLog();
  renderQTable();
}

function updateRange(input, output, suffix) {
  output.textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2) + (suffix || "");
}

environmentSelect.addEventListener("change", rebuildEnvironment);
algorithmSelect.addEventListener("change", () => resetLearning("ready"));
gammaInput.addEventListener("input", () => {
  updateRange(gammaInput, document.querySelector("#gamma-output"));
  resetLearning("reset");
});
alphaInput.addEventListener("input", () => updateRange(alphaInput, document.querySelector("#alpha-output")));
epsilonInput.addEventListener("input", () => updateRange(epsilonInput, document.querySelector("#epsilon-output")));
planningInput.addEventListener("input", () => updateRange(planningInput, document.querySelector("#planning-output")));
speedInput.addEventListener("input", () => {
  updateRange(speedInput, document.querySelector("#speed-output"), "×");
  restartRunTimer();
});
editToggle.addEventListener("change", render);
stepButton.addEventListener("click", performStep);
runButton.addEventListener("click", () => {
  if (runTimer) stopRun(true);
  else startRun();
});
resetButton.addEventListener("click", () => resetLearning("reset"));
batchButton.addEventListener("click", trainBatch);

window.addEventListener("mindforge:language", () => {
  setStatus(currentStatusKey);
  render();
});

env = makeEnvironment(environmentSelect.value);
resetLearning("ready");
