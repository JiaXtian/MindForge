const ACTIONS = [
  { dx: 0, dy: -1, arrow: "↑" },
  { dx: 1, dy: 0, arrow: "→" },
  { dx: 0, dy: 1, arrow: "↓" },
  { dx: -1, dy: 0, arrow: "←" },
];

const algorithmDetails = {
  value: {
    badge: "VALUE ITERATION",
    formula: "V(s) ← maxₐ [r + γV(s′)]",
    en: "One step performs a synchronous Bellman optimality sweep over every non-terminal state. The policy then points to the action that attains the largest backup.",
    zh: "每次单步会对所有非终止状态执行一轮同步 Bellman 最优更新，策略随后指向取得最大更新值的动作。",
  },
  policy: {
    badge: "POLICY ITERATION",
    formula: "Vᵖ(s) ← r + γVᵖ(s′)  ·  π ← greedy(Vᵖ)",
    en: "Five policy-evaluation sweeps are followed by one greedy policy-improvement step. Watch evaluation settle before the arrows change.",
    zh: "先执行五轮策略评估，再进行一次贪心策略改进。观察价值逐渐稳定后，策略箭头才会改变。",
  },
  qlearning: {
    badge: "Q-LEARNING / OFF-POLICY",
    formula: "Q(s,a) ← Q(s,a) + α[r + γ maxₐ′Q(s′,a′) − Q(s,a)]",
    en: "The behavior remains epsilon-greedy, but the target assumes the best next action. Each step changes only the visited state-action pair.",
    zh: "行为策略仍采用 ε-greedy，但更新目标假设下一步选择最优动作；每次只修改实际访问的一对状态与动作。",
  },
  sarsa: {
    badge: "SARSA / ON-POLICY",
    formula: "Q(s,a) ← Q(s,a) + α[r + γQ(s′,a′) − Q(s,a)]",
    en: "The target uses the next action actually selected by the same epsilon-greedy behavior policy, so exploration risk becomes part of the learned value.",
    zh: "目标使用同一个 ε-greedy 行为策略实际选出的下一动作，因此探索带来的风险会进入学到的价值。",
  },
  expected: {
    badge: "EXPECTED SARSA",
    formula: "Q(s,a) ← Q(s,a) + α[r + γ Σₐπ(a|s′)Q(s′,a) − Q(s,a)]",
    en: "Instead of sampling one next action, the target averages over the epsilon-greedy policy. This reduces target variance while remaining on-policy.",
    zh: "更新目标不采样单个下一动作，而是对 ε-greedy 策略求期望，从而在保持 on-policy 的同时降低目标方差。",
  },
};

const environmentNames = {
  grid: { en: "Classic grid", zh: "经典网格" },
  cliff: { en: "Cliff walking", zh: "悬崖行走" },
  windy: { en: "Windy grid", zh: "风场网格" },
  maze: { en: "Maze", zh: "迷宫" },
};

const uiText = {
  ready: { en: "Experiment ready.", zh: "实验已就绪。" },
  running: { en: "Running automatically.", zh: "正在自动运行。" },
  paused: { en: "Experiment paused.", zh: "实验已暂停。" },
  reset: { en: "Experiment reset.", zh: "实验已重置。" },
  edited: { en: "Obstacle changed; learning was reset.", zh: "障碍已修改，学习状态已重置。" },
  episode: { en: "Episode finished.", zh: "本回合结束。" },
  sweep: { en: "Completed one full-state sweep.", zh: "已完成一轮全状态更新。" },
  batchPlanning: { en: "Run 50 sweeps", zh: "执行 50 轮更新" },
  batchLearning: { en: "Train 50 episodes", zh: "训练 50 回合" },
  run: { en: "Auto run", zh: "自动运行" },
  pause: { en: "Pause", zh: "暂停" },
  planning: { en: "planning / full sweep", zh: "规划 / 全状态更新" },
  learning: { en: "learning / sampled transition", zh: "学习 / 采样转移" },
  start: { en: "start", zh: "起点" },
  cliff: { en: "cliff", zh: "悬崖" },
  goal: { en: "goal", zh: "目标" },
  trap: { en: "trap", zh: "陷阱" },
  state: { en: "state", zh: "状态" },
};

const board = document.querySelector("#grid-board");
const environmentSelect = document.querySelector("#environment-select");
const algorithmSelect = document.querySelector("#algorithm-select");
const gammaInput = document.querySelector("#gamma-input");
const alphaInput = document.querySelector("#alpha-input");
const epsilonInput = document.querySelector("#epsilon-input");
const speedInput = document.querySelector("#speed-input");
const stepButton = document.querySelector("#step-button");
const runButton = document.querySelector("#run-button");
const resetButton = document.querySelector("#reset-button");
const batchButton = document.querySelector("#batch-button");
const statusElement = document.querySelector("#lab-status");

let env;
let values;
let qValues;
let policy;
let agentState;
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
let runTimer = null;
let currentStatusKey = "ready";

function language() {
  return document.documentElement.lang === "zh-CN" ? "zh" : "en";
}

function stateIndex(x, y, width) {
  return y * width + x;
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
      cliffs: Array.from({ length: 8 }, (_, index) => stateIndex(index + 1, 3, 10)),
      wind: [],
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
      cliffs: [],
      wind: [0, 0, 0, 1, 1, 1, 2, 2, 1, 0],
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
      cliffs: [],
      wind: [],
      stepReward: -0.04,
    };
  } else {
    spec = {
      type: "grid",
      width: 6,
      height: 6,
      start: stateIndex(0, 5, 6),
      terminals: {
        [stateIndex(5, 0, 6)]: 1,
        [stateIndex(5, 4, 6)]: -1,
      },
      walls: [
        stateIndex(1, 1, 6), stateIndex(1, 2, 6), stateIndex(3, 2, 6),
        stateIndex(3, 3, 6), stateIndex(4, 3, 6),
      ],
      cliffs: [],
      wind: [],
      stepReward: -0.02,
    };
  }
  spec.walls = new Set(spec.walls);
  spec.cliffs = new Set(spec.cliffs);
  return spec;
}

function isTerminal(state) {
  return Object.prototype.hasOwnProperty.call(env.terminals, state);
}

function isUnavailable(state) {
  return env.walls.has(state) || env.cliffs.has(state);
}

function transition(state, action) {
  if (isTerminal(state)) return { next: state, reward: 0, done: true };
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

  if (env.cliffs.has(next)) {
    return { next: env.start, reward: -100, done: true };
  }
  if (isTerminal(next)) {
    return { next, reward: env.terminals[next], done: true };
  }
  return { next, reward: env.stepReward, done: false };
}

function resetLearning(messageKey) {
  const stateCount = env.width * env.height;
  values = Array(stateCount).fill(0);
  qValues = Array.from({ length: stateCount }, () => [0, 0, 0, 0]);
  policy = Array.from({ length: stateCount }, (_, state) => (state + 1) % ACTIONS.length);
  agentState = env.start;
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
  stopRun(false);
  setStatus(messageKey || "ready");
  updateControlAvailability();
  render();
}

function rebuildEnvironment() {
  env = makeEnvironment(environmentSelect.value);
  resetLearning("ready");
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

function actionValueFromValues(state, action) {
  const result = transition(state, action);
  return result.reward + (result.done ? 0 : gamma() * values[result.next]);
}

function bestActions(actionValues) {
  const maximum = Math.max(...actionValues);
  return actionValues
    .map((value, action) => ({ value, action }))
    .filter((item) => Math.abs(item.value - maximum) < 1e-10)
    .map((item) => item.action);
}

function greedyAction(state, randomTie) {
  const candidates = bestActions(qValues[state]);
  if (randomTie && candidates.length > 1) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return candidates[0];
}

function chooseAction(state) {
  if (Math.random() < epsilon()) return Math.floor(Math.random() * ACTIONS.length);
  return greedyAction(state, true);
}

function expectedNextValue(state) {
  const candidates = bestActions(qValues[state]);
  const randomShare = epsilon() / ACTIONS.length;
  return qValues[state].reduce((sum, value, action) => {
    const greedyShare = candidates.includes(action) ? (1 - epsilon()) / candidates.length : 0;
    return sum + (randomShare + greedyShare) * value;
  }, 0);
}

function runPlanningStep() {
  const nextValues = values.slice();
  let delta = 0;
  const algorithm = algorithmSelect.value;

  for (let state = 0; state < values.length; state += 1) {
    if (isUnavailable(state) || isTerminal(state)) continue;
    let nextValue;
    if (algorithm === "policy") {
      nextValue = actionValueFromValues(state, policy[state]);
    } else {
      const candidates = ACTIONS.map((_, action) => actionValueFromValues(state, action));
      nextValue = Math.max(...candidates);
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
        const actionValues = ACTIONS.map((_, action) => actionValueFromValues(state, action));
        policy[state] = bestActions(actionValues)[0];
      }
      policyEvaluationSweeps = 0;
    }
  } else {
    for (let state = 0; state < values.length; state += 1) {
      if (isUnavailable(state) || isTerminal(state)) continue;
      const actionValues = ACTIONS.map((_, action) => actionValueFromValues(state, action));
      policy[state] = bestActions(actionValues)[0];
    }
  }
  latestReturn = values[env.start];
  history.push(latestReturn);
  history = history.slice(-80);
  setStatus("sweep");
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
  const result = transition(state, action);
  let target = result.reward;
  let nextAction = null;

  if (!result.done) {
    if (algorithm === "qlearning") {
      target += gamma() * Math.max(...qValues[result.next]);
    } else if (algorithm === "sarsa") {
      nextAction = chooseAction(result.next);
      target += gamma() * qValues[result.next][nextAction];
    } else {
      target += gamma() * expectedNextValue(result.next);
    }
  }

  const tdError = target - qValues[state][action];
  qValues[state][action] += alpha() * tdError;
  latestSignal = tdError;
  environmentSteps += 1;
  episodeSteps += 1;
  episodeReturn += result.reward;
  agentState = result.next;
  queuedAction = nextAction;

  if (result.done || episodeSteps >= 300) finishEpisode();
  if (!skipRender) render();
}

function performStep() {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") {
    runPlanningStep();
  } else {
    runLearningStep(true);
  }
  render();
}

function trainBatch() {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") {
    for (let i = 0; i < 50; i += 1) runPlanningStep();
  } else {
    const targetEpisode = episodeCount + 50;
    let guard = 0;
    while (episodeCount < targetEpisode && guard < 30000) {
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
  updateRunButton();
  const delay = Math.max(28, 560 - Number(speedInput.value) * 52);
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
  const key = runTimer ? "pause" : "run";
  runButton.textContent = uiText[key][language()];
}

function updateControlAvailability() {
  const planning = algorithmSelect.value === "value" || algorithmSelect.value === "policy";
  alphaInput.disabled = planning;
  epsilonInput.disabled = planning;
  batchButton.textContent = uiText[planning ? "batchPlanning" : "batchLearning"][language()];
  document.querySelector("#stage-mode").textContent = uiText[planning ? "planning" : "learning"][language()];
}

function updateAlgorithmCard() {
  const detail = algorithmDetails[algorithmSelect.value];
  document.querySelector("#algorithm-badge").textContent = detail.badge;
  const formula = document.querySelector("#algorithm-formula");
  formula.textContent = detail.formula;
  formula.dataset.copyEn = detail.formula;
  formula.dataset.copyZh = detail.formula;
  const explanation = document.querySelector("#algorithm-explanation");
  explanation.textContent = detail[language()];
  explanation.dataset.copyEn = detail.en;
  explanation.dataset.copyZh = detail.zh;
}

function displayedValue(state) {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") return values[state];
  return Math.max(...qValues[state]);
}

function displayedAction(state) {
  if (algorithmSelect.value === "value" || algorithmSelect.value === "policy") return policy[state];
  return greedyAction(state, false);
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
    if (env.cliffs.has(state)) cell.classList.add("is-cliff");
    if (isTerminal(state) && env.terminals[state] >= 0) cell.classList.add("is-goal");
    if (isTerminal(state) && env.terminals[state] < 0) cell.classList.add("is-trap");

    if (!isUnavailable(state)) {
      const value = displayedValue(state);
      const heat = Math.min(34, Math.abs(value) / scale * 34);
      cell.style.setProperty("--heat", heat.toFixed(1) + "%");

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
    }

    const kind = document.createElement("span");
    kind.className = "cell-kind";
    if (state === env.start) kind.textContent = uiText.start[language()];
    if (env.cliffs.has(state)) kind.textContent = uiText.cliff[language()];
    if (isTerminal(state)) {
      kind.textContent = uiText[env.terminals[state] >= 0 ? "goal" : "trap"][language()];
    }
    cell.append(kind);

    if (state === agentState && algorithmSelect.value !== "value" && algorithmSelect.value !== "policy") {
      const agent = document.createElement("span");
      agent.className = "agent-dot";
      agent.textContent = "A";
      cell.append(agent);
    }

    cell.addEventListener("click", () => toggleWall(state));
    board.append(cell);
  }
}

function toggleWall(state) {
  if (state === env.start || isTerminal(state) || env.cliffs.has(state)) return;
  if (env.walls.has(state)) env.walls.delete(state);
  else env.walls.add(state);
  resetLearning("edited");
}

function renderMetrics() {
  document.querySelector("#metric-sweep").textContent = sweepCount;
  document.querySelector("#metric-step").textContent = environmentSteps;
  document.querySelector("#metric-episode").textContent = episodeCount;
  document.querySelector("#metric-return").textContent =
    latestReturn === null ? "—" : Number(latestReturn).toFixed(2);
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

function render() {
  document.querySelector("#environment-name").textContent = environmentNames[env.type][language()];
  updateAlgorithmCard();
  updateControlAvailability();
  updateRunButton();
  renderBoard();
  renderMetrics();
  renderChart();
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
alphaInput.addEventListener("input", () => {
  updateRange(alphaInput, document.querySelector("#alpha-output"));
});
epsilonInput.addEventListener("input", () => {
  updateRange(epsilonInput, document.querySelector("#epsilon-output"));
});
speedInput.addEventListener("input", () => {
  updateRange(speedInput, document.querySelector("#speed-output"), "×");
  restartRunTimer();
});

stepButton.addEventListener("click", performStep);
runButton.addEventListener("click", () => {
  if (runTimer) stopRun(true);
  else startRun();
});
resetButton.addEventListener("click", () => resetLearning("reset"));
batchButton.addEventListener("click", trainBatch);

window.addEventListener("mindforge:language", () => {
  setStatus(currentStatusKey);
  updateControlAvailability();
  updateRunButton();
  render();
});

env = makeEnvironment(environmentSelect.value);
resetLearning("ready");
