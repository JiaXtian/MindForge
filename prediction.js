const predictionDetails = {
  mc: {
    name: { en: "Every-visit Monte Carlo", zh: "Every-visit Monte Carlo" },
    badge: "EVERY-VISIT MONTE CARLO",
    formula: "V(Sₜ) ← V(Sₜ) + α[Gₜ − V(Sₜ)]",
    en: "No value changes before termination. Once the outcome is known, the sampled return is reconstructed backward and every visited state is updated.",
    zh: "终止之前价值不会改变；结果出现后，算法从后向前重建采样回报，并更新轨迹中每次访问的状态。",
  },
  td0: {
    name: { en: "TD(0)", zh: "TD(0)" },
    badge: "TD(0) / ONE-STEP",
    formula: "V(Sₜ) ← V(Sₜ) + α[Rₜ₊₁ + γV(Sₜ₊₁) − V(Sₜ)]",
    en: "TD(0) learns after every transition. Its target contains one observed reward and one estimated continuation value, so learning begins before the final outcome is known.",
    zh: "TD(0) 在每次转移后立即学习。目标由一个已观察奖励和一个后继状态估计组成，因此无需等待最终结果。",
  },
  nstep: {
    name: { en: "n-step TD", zh: "n-step TD" },
    badge: "N-STEP TD",
    formula: "Gₜ:ₜ₊ₙ = Σᵢ₌₀ⁿ⁻¹ γⁱRₜ₊ᵢ₊₁ + γⁿV(Sₜ₊ₙ)",
    en: "The update waits for n rewards, then bootstraps if the episode is still alive. Increasing n trades lower bootstrap bias for higher sampling variance and delay.",
    zh: "更新等待 n 个奖励；若回合尚未终止，再从第 n 个后继状态自举。增大 n 会用更高采样方差与延迟换取更少自举偏差。",
  },
  lambda: {
    name: { en: "TD(λ)", zh: "TD(λ)" },
    badge: "TD(λ) / ELIGIBILITY TRACES",
    formula: "δₜ = Rₜ₊₁ + γV(Sₜ₊₁) − V(Sₜ);  V ← V + αδₜeₜ",
    en: "Each transition creates a one-step TD error, but the error updates every state with a nonzero eligibility trace. Gamma lambda controls how quickly recent credit fades.",
    zh: "每次转移产生一个一步 TD 误差，但该误差会更新所有资格迹非零的状态；γλ 决定近期信用衰减的速度。",
  },
};

const predictionText = {
  ready: { en: "Experiment ready.", zh: "实验已就绪。" },
  running: { en: "Running transitions automatically.", zh: "正在自动执行状态转移。" },
  paused: { en: "Experiment paused.", zh: "实验已暂停。" },
  reset: { en: "Prediction estimates reset.", zh: "价值预测已重置。" },
  terminalLeft: { en: "Episode ended at the left terminal with return 0.", zh: "回合在左侧终点结束，回报为 0。" },
  terminalRight: { en: "Episode ended at the right terminal with return 1.", zh: "回合在右侧终点结束，回报为 1。" },
  run: { en: "Auto run", zh: "自动运行" },
  pause: { en: "Pause", zh: "暂停" },
  active: { en: "episode in progress", zh: "回合进行中" },
  waiting: { en: "waiting for terminal return", zh: "等待终止回报" },
  online: { en: "online bootstrapping", zh: "在线自举" },
  trace: { en: "backward credit assignment", zh: "向后信用分配" },
  leftTerminal: { en: "LEFT · 0", zh: "左终点 · 0" },
  rightTerminal: { en: "RIGHT · +1", zh: "右终点 · +1" },
  noUpdate: { en: "No value update yet. Monte Carlo updates only after termination.", zh: "尚无价值更新。Monte Carlo 只在回合终止后更新。" },
  transitions: { en: "transitions", zh: "次转移" },
  state: { en: "State", zh: "状态" },
  estimate: { en: "estimate", zh: "估计" },
  truth: { en: "true", zh: "真实值" },
  error: { en: "error", zh: "误差" },
  inactiveTrace: { en: "Traces are active only for TD lambda.", zh: "资格迹仅在 TD(λ) 中启用。" },
  lastCompleted: { en: "last completed", zh: "最近完成" },
};

const predictionContext = {
  experiment: { en: "On-policy state-value prediction estimates the return from each state without changing the random-walk policy.", zh: "同策略状态价值预测在不改变随机游走策略的前提下，估计从每个状态出发的回报。" },
  environment: { en: "A symmetric episodic Markov reward process starts in the center, moves left or right with equal probability, and pays 1 only at the right terminal.", zh: "一个对称的回合型 Markov 奖励过程：从中心出发，以相同概率左右移动，只有抵达右侧终点时获得奖励 1。" },
};

const chainSelect = document.querySelector("#chain-select");
const algorithmSelect = document.querySelector("#prediction-algorithm");
const alphaInput = document.querySelector("#prediction-alpha");
const gammaInput = document.querySelector("#prediction-gamma");
const nStepInput = document.querySelector("#n-step-input");
const lambdaInput = document.querySelector("#lambda-input");
const speedInput = document.querySelector("#prediction-speed");
const stepButton = document.querySelector("#prediction-step");
const episodeButton = document.querySelector("#prediction-episode");
const runButton = document.querySelector("#prediction-run");
const resetButton = document.querySelector("#prediction-reset");
const batchButton = document.querySelector("#prediction-batch");
const statusElement = document.querySelector("#prediction-status");

let stateCount;
let estimates;
let trueValues;
let eligibility;
let agentState;
let episodeTransitions;
let episodePath;
let completedPath;
let pendingTransitions;
let totalSteps = 0;
let episodes = 0;
let latestOutcome = null;
let lastUpdate = null;
let errorHistory = [];
let runTimer = null;
let currentStatusKey = "ready";

function language() {
  return document.documentElement.lang === "zh-CN" ? "zh" : "en";
}

function alpha() {
  return Number(alphaInput.value);
}

function gamma() {
  return Number(gammaInput.value);
}

function stateName(state) {
  if (state < 0) return predictionText.leftTerminal[language()];
  if (state >= stateCount) return predictionText.rightTerminal[language()];
  return String.fromCharCode(65 + state) + " · S" + (state + 1);
}

function solveTrueValues() {
  const solution = Array(stateCount).fill(0);
  for (let iteration = 0; iteration < 10000; iteration += 1) {
    let delta = 0;
    const next = solution.slice();
    for (let state = 0; state < stateCount; state += 1) {
      const left = state === 0 ? 0 : gamma() * solution[state - 1];
      const right = state === stateCount - 1 ? 1 : gamma() * solution[state + 1];
      next[state] = 0.5 * (left + right);
      delta = Math.max(delta, Math.abs(next[state] - solution[state]));
    }
    for (let state = 0; state < stateCount; state += 1) solution[state] = next[state];
    if (delta < 1e-12) break;
  }
  return solution;
}

function rmse() {
  const squared = estimates.reduce((sum, value, state) => sum + (value - trueValues[state]) ** 2, 0);
  return Math.sqrt(squared / stateCount);
}

function resetExperiment(messageKey) {
  stopRun(false);
  stateCount = Number(chainSelect.value);
  estimates = Array(stateCount).fill(0);
  trueValues = solveTrueValues();
  eligibility = Array(stateCount).fill(0);
  agentState = Math.floor(stateCount / 2);
  episodeTransitions = [];
  episodePath = [agentState];
  completedPath = [];
  pendingTransitions = [];
  totalSteps = 0;
  episodes = 0;
  latestOutcome = null;
  lastUpdate = null;
  errorHistory = [];
  setStatus(messageKey || "ready");
  updateControls();
  render();
}

function applyValueUpdate(state, target, metadata) {
  const old = estimates[state];
  const error = target - old;
  estimates[state] += alpha() * error;
  lastUpdate = {
    state,
    reward: metadata.reward,
    target,
    bootstrap: metadata.bootstrap,
    horizon: metadata.horizon,
    old,
    error,
    newValue: estimates[state],
    kind: metadata.kind,
  };
}

function updateTd0(transition) {
  const bootstrap = transition.done ? 0 : gamma() * estimates[transition.next];
  applyValueUpdate(transition.state, transition.reward + bootstrap, {
    reward: transition.reward,
    bootstrap,
    horizon: 1,
    kind: "TD(0)",
  });
}

function updateTdLambda(transition) {
  const bootstrapValue = transition.done ? 0 : estimates[transition.next];
  const target = transition.reward + gamma() * bootstrapValue;
  const error = target - estimates[transition.state];
  for (let state = 0; state < stateCount; state += 1) eligibility[state] *= gamma() * Number(lambdaInput.value);
  eligibility[transition.state] += 1;
  const old = estimates[transition.state];
  for (let state = 0; state < stateCount; state += 1) estimates[state] += alpha() * error * eligibility[state];
  lastUpdate = {
    state: transition.state,
    reward: transition.reward,
    target,
    bootstrap: gamma() * bootstrapValue,
    horizon: "λ",
    old,
    error,
    newValue: estimates[transition.state],
    kind: "TD(λ)",
  };
}

function updateNStep(flush) {
  const n = Number(nStepInput.value);
  while (pendingTransitions.length >= n || (flush && pendingTransitions.length > 0)) {
    const horizon = Math.min(n, pendingTransitions.length);
    let target = 0;
    for (let i = 0; i < horizon; i += 1) target += gamma() ** i * pendingTransitions[i].reward;
    const last = pendingTransitions[horizon - 1];
    const bootstrap = last.done ? 0 : gamma() ** horizon * estimates[last.next];
    target += bootstrap;
    applyValueUpdate(pendingTransitions[0].state, target, {
      reward: pendingTransitions[0].reward,
      bootstrap,
      horizon,
      kind: horizon + "-step TD",
    });
    pendingTransitions.shift();
    if (!flush && pendingTransitions.length < n) break;
  }
}

function updateMonteCarlo() {
  let returned = 0;
  for (let index = episodeTransitions.length - 1; index >= 0; index -= 1) {
    const transition = episodeTransitions[index];
    returned = transition.reward + gamma() * returned;
    applyValueUpdate(transition.state, returned, {
      reward: transition.reward,
      bootstrap: 0,
      horizon: episodeTransitions.length - index,
      kind: "MC return",
    });
  }
}

function finishEpisode(outcome) {
  const algorithm = algorithmSelect.value;
  if (algorithm === "mc") updateMonteCarlo();
  if (algorithm === "nstep") updateNStep(true);
  episodes += 1;
  latestOutcome = outcome;
  completedPath = episodePath.slice();
  errorHistory.push(rmse());
  errorHistory = errorHistory.slice(-180);
  eligibility.fill(0);
  agentState = Math.floor(stateCount / 2);
  episodeTransitions = [];
  pendingTransitions = [];
  episodePath = [agentState];
  setStatus(outcome === 1 ? "terminalRight" : "terminalLeft");
}

function performTransition(skipRender) {
  const state = agentState;
  const move = Math.random() < 0.5 ? -1 : 1;
  const next = state + move;
  const done = next < 0 || next >= stateCount;
  const reward = next >= stateCount ? 1 : 0;
  const transition = { state, reward, next, done };
  episodeTransitions.push(transition);
  pendingTransitions.push(transition);
  episodePath.push(next);
  totalSteps += 1;

  if (algorithmSelect.value === "td0") updateTd0(transition);
  if (algorithmSelect.value === "lambda") updateTdLambda(transition);
  if (algorithmSelect.value === "nstep") updateNStep(false);

  agentState = next;
  if (done) finishEpisode(reward);
  if (!skipRender) render();
}

function completeEpisode(skipRender) {
  const target = episodes + 1;
  let guard = 0;
  while (episodes < target && guard < 10000) {
    performTransition(true);
    guard += 1;
  }
  if (!skipRender) render();
}

function trainBatch() {
  const target = episodes + 100;
  let guard = 0;
  while (episodes < target && guard < 500000) {
    performTransition(true);
    guard += 1;
  }
  render();
}

function setStatus(key) {
  currentStatusKey = key;
  statusElement.textContent = predictionText[key][language()];
}

function startRun() {
  if (runTimer) return;
  setStatus("running");
  const delay = Math.max(30, 570 - Number(speedInput.value) * 52);
  runTimer = window.setInterval(() => performTransition(false), delay);
  updateRunButton();
}

function stopRun(announce) {
  if (runTimer) window.clearInterval(runTimer);
  runTimer = null;
  if (announce) setStatus("paused");
  updateRunButton();
}

function restartRun() {
  if (!runTimer) return;
  stopRun(false);
  startRun();
}

function updateRunButton() {
  runButton.textContent = predictionText[runTimer ? "pause" : "run"][language()];
}

function updateControls() {
  nStepInput.disabled = algorithmSelect.value !== "nstep";
  lambdaInput.disabled = algorithmSelect.value !== "lambda";
  const phaseKey = algorithmSelect.value === "mc" ? "waiting" : algorithmSelect.value === "lambda" ? "trace" : "online";
  document.querySelector("#prediction-phase").textContent = predictionText[phaseKey][language()];
}

function renderAlgorithm() {
  const detail = predictionDetails[algorithmSelect.value];
  document.querySelector("#prediction-badge").textContent = detail.badge;
  document.querySelector("#prediction-formula").textContent = detail.formula;
  document.querySelector("#prediction-explanation").textContent = detail[language()];
}

function renderContext() {
  const lang = language();
  const detail = predictionDetails[algorithmSelect.value];
  const count = Number(chainSelect.value);
  document.querySelector("#context-experiment-copy").textContent = predictionContext.experiment[lang];
  document.querySelector("#context-environment-name").textContent = lang === "zh" ? count + " 状态对称随机游走" : count + "-state symmetric random walk";
  document.querySelector("#context-environment-copy").textContent = predictionContext.environment[lang];
  document.querySelector("#context-algorithm-name").textContent = detail.name[lang];
  document.querySelector("#context-algorithm-copy").textContent = detail[lang];
}

function renderTrack() {
  const track = document.querySelector("#random-walk-track");
  track.replaceChildren();
  const states = [-1, ...Array.from({ length: stateCount }, (_, index) => index), stateCount];
  states.forEach((state) => {
    const node = document.createElement("div");
    node.className = "walk-state";
    if (state < 0 || state >= stateCount) node.classList.add("is-terminal");
    if (state === agentState) node.classList.add("has-agent");
    const label = document.createElement("strong");
    label.textContent = stateName(state);
    node.append(label);
    if (state >= 0 && state < stateCount) {
      const bars = document.createElement("div");
      bars.className = "walk-value-bars";
      const estimate = document.createElement("i");
      estimate.className = "walk-estimate";
      estimate.style.height = Math.max(2, estimates[state] * 100) + "%";
      const truth = document.createElement("i");
      truth.className = "walk-truth";
      truth.style.bottom = Math.max(0, Math.min(100, trueValues[state] * 100)) + "%";
      bars.append(estimate, truth);
      const values = document.createElement("span");
      values.textContent = estimates[state].toFixed(3) + " / " + trueValues[state].toFixed(3);
      node.append(bars, values);
    }
    if (state === agentState) {
      const agent = document.createElement("b");
      agent.className = "walk-agent";
      agent.textContent = "A";
      node.append(agent);
    }
    track.append(node);
  });
}

function renderMetrics() {
  document.querySelector("#prediction-episodes").textContent = episodes;
  document.querySelector("#prediction-steps").textContent = totalSteps;
  document.querySelector("#prediction-outcome").textContent = latestOutcome === null ? "—" : String(latestOutcome);
  document.querySelector("#prediction-rmse").textContent = rmse().toFixed(3);
}

function renderChart() {
  const line = document.querySelector("#prediction-error-line");
  if (errorHistory.length < 2) {
    line.setAttribute("points", "");
    return;
  }
  const maximum = Math.max(0.001, ...errorHistory);
  const points = errorHistory.map((value, index) => {
    const x = 32 + index / Math.max(1, errorHistory.length - 1) * 658;
    const y = 150 - value / maximum * 134;
    return x.toFixed(1) + "," + y.toFixed(1);
  });
  line.setAttribute("points", points.join(" "));
}

function format(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  return Number(value).toFixed(4);
}

function renderUpdate() {
  const equation = document.querySelector("#prediction-equation");
  if (!lastUpdate) {
    equation.textContent = predictionText.noUpdate[language()];
    for (const suffix of ["state", "reward", "target", "bootstrap", "old", "error", "new", "horizon"]) {
      document.querySelector("#prediction-update-" + suffix).textContent = "—";
    }
    return;
  }
  equation.textContent = "Vnew = " + format(lastUpdate.old) + " + " + alpha().toFixed(2) + " × (" + format(lastUpdate.target) + " − " + format(lastUpdate.old) + ") = " + format(lastUpdate.newValue);
  document.querySelector("#prediction-update-kind").textContent = lastUpdate.kind;
  document.querySelector("#prediction-update-state").textContent = stateName(lastUpdate.state);
  document.querySelector("#prediction-update-reward").textContent = format(lastUpdate.reward);
  document.querySelector("#prediction-update-target").textContent = format(lastUpdate.target);
  document.querySelector("#prediction-update-bootstrap").textContent = format(lastUpdate.bootstrap);
  document.querySelector("#prediction-update-old").textContent = format(lastUpdate.old);
  document.querySelector("#prediction-update-error").textContent = format(lastUpdate.error);
  document.querySelector("#prediction-update-new").textContent = format(lastUpdate.newValue);
  document.querySelector("#prediction-update-horizon").textContent = format(lastUpdate.horizon);
}

function renderValueTable() {
  const table = document.querySelector("#prediction-value-table");
  table.replaceChildren();
  estimates.forEach((estimate, state) => {
    const row = document.createElement("div");
    row.className = "prediction-value-row";
    const name = document.createElement("strong");
    name.textContent = stateName(state);
    const estimateCell = document.createElement("span");
    estimateCell.textContent = predictionText.estimate[language()] + " " + estimate.toFixed(4);
    const trueCell = document.createElement("span");
    trueCell.textContent = predictionText.truth[language()] + " " + trueValues[state].toFixed(4);
    const errorCell = document.createElement("code");
    errorCell.textContent = predictionText.error[language()] + " " + (estimate - trueValues[state]).toFixed(4);
    row.append(name, estimateCell, trueCell, errorCell);
    table.append(row);
  });
}

function renderEligibility() {
  const view = document.querySelector("#eligibility-view");
  view.replaceChildren();
  if (algorithmSelect.value !== "lambda") {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = predictionText.inactiveTrace[language()];
    view.append(empty);
    return;
  }
  const maximum = Math.max(0.001, ...eligibility);
  eligibility.forEach((value, state) => {
    const row = document.createElement("div");
    row.className = "eligibility-row";
    const label = document.createElement("strong");
    label.textContent = stateName(state);
    const track = document.createElement("span");
    const fill = document.createElement("i");
    fill.style.width = value / maximum * 100 + "%";
    track.append(fill);
    const number = document.createElement("code");
    number.textContent = value.toFixed(4);
    row.append(label, track, number);
    view.append(row);
  });
}

function renderPath() {
  const path = document.querySelector("#episode-path");
  path.replaceChildren();
  const showingCompleted = episodePath.length === 1 && completedPath.length > 0;
  const displayedPath = showingCompleted ? completedPath : episodePath;
  displayedPath.forEach((state, index) => {
    const item = document.createElement("span");
    item.textContent = stateName(state);
    if (index === displayedPath.length - 1) item.classList.add("is-current");
    path.append(item);
    if (index < displayedPath.length - 1) {
      const arrow = document.createElement("i");
      arrow.textContent = "→";
      path.append(arrow);
    }
  });
  const transitionCount = showingCompleted ? Math.max(0, displayedPath.length - 1) : episodeTransitions.length;
  document.querySelector("#episode-buffer-size").textContent =
    (showingCompleted ? predictionText.lastCompleted[language()] + " · " : "") +
    transitionCount + " " + predictionText.transitions[language()];
}

function render() {
  renderContext();
  renderAlgorithm();
  updateControls();
  updateRunButton();
  renderTrack();
  renderMetrics();
  renderChart();
  renderUpdate();
  renderValueTable();
  renderEligibility();
  renderPath();
}

function updateRange(input, output, suffix) {
  output.textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2) + (suffix || "");
}

chainSelect.addEventListener("change", () => resetExperiment("reset"));
algorithmSelect.addEventListener("change", () => resetExperiment("reset"));
alphaInput.addEventListener("input", () => updateRange(alphaInput, document.querySelector("#prediction-alpha-output")));
gammaInput.addEventListener("input", () => {
  updateRange(gammaInput, document.querySelector("#prediction-gamma-output"));
  resetExperiment("reset");
});
nStepInput.addEventListener("input", () => updateRange(nStepInput, document.querySelector("#n-step-output")));
lambdaInput.addEventListener("input", () => updateRange(lambdaInput, document.querySelector("#lambda-output")));
speedInput.addEventListener("input", () => {
  updateRange(speedInput, document.querySelector("#prediction-speed-output"), "×");
  restartRun();
});
stepButton.addEventListener("click", () => performTransition(false));
episodeButton.addEventListener("click", () => completeEpisode(false));
runButton.addEventListener("click", () => {
  if (runTimer) stopRun(true);
  else startRun();
});
resetButton.addEventListener("click", () => resetExperiment("reset"));
batchButton.addEventListener("click", trainBatch);

window.addEventListener("mindforge:language", () => {
  setStatus(currentStatusKey);
  render();
});

resetExperiment("ready");
