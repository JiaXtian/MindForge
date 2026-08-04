const POSITION_MIN = -1.2;
const POSITION_MAX = 0.6;
const VELOCITY_MIN = -0.07;
const VELOCITY_MAX = 0.07;
const GOAL_POSITION = 0.5;
const MAX_EPISODE_STEPS = 500;
const MOUNTAIN_ACTIONS = [
  { force: -1, symbol: "←", en: "push left", zh: "向左加速" },
  { force: 0, symbol: "·", en: "coast", zh: "不加速" },
  { force: 1, symbol: "→", en: "push right", zh: "向右加速" },
];

const mountainDetails = {
  qlearning: {
    badge: "Q-LEARNING / OFF-POLICY",
    formula: "Q(s,a) ← Q(s,a) + α[r + γ maxₐ′Q(s′,a′) − Q(s,a)]",
    en: "Exploration generates behavior, but the target always evaluates the greedy next action. The learned surface therefore approaches a greedy control policy.",
    zh: "探索负责生成行为，但目标始终评价下一状态的贪心动作，因此学到的价值曲面趋向贪心控制策略。",
  },
  sarsa: {
    badge: "SARSA / ON-POLICY",
    formula: "Q(s,a) ← Q(s,a) + α[r + γQ(s′,a′) − Q(s,a)]",
    en: "The next exploratory action enters the target. This makes the action values describe the epsilon-greedy policy that is actually driving the car.",
    zh: "下一步探索动作会进入目标，因此动作价值描述的是实际驾驶小车的 ε-greedy 策略。",
  },
  expected: {
    badge: "EXPECTED SARSA",
    formula: "target = r + γΣₐπ(a|s′)Q(s′,a)",
    en: "Averaging over every possible next action removes one source of sampling noise while preserving the current behavior policy in the target.",
    zh: "对所有可能的下一动作求期望，能够消除一部分采样噪声，同时在目标中保留当前行为策略。",
  },
  lambda: {
    badge: "SARSA(λ) / REPLACING TRACES",
    formula: "Q ← Q + αδe;  e(s,a) ← 1;  e ← γλe",
    en: "Replacing traces remember recently active state-action pairs. Each new TD error updates the whole trace, allowing the terminal signal to travel backward faster.",
    zh: "替换资格迹会记住近期活跃的状态动作对；每个新 TD 误差都会沿整条资格迹更新，使终止信号更快向前传播。",
  },
};

const mountainText = {
  ready: { en: "Experiment ready.", zh: "实验已就绪。" },
  running: { en: "Running automatically.", zh: "正在自动运行。" },
  paused: { en: "Experiment paused.", zh: "实验已暂停。" },
  reset: { en: "Control values reset.", zh: "控制价值已重置。" },
  success: { en: "Goal reached. A new episode has started.", zh: "已到达目标，新回合已经开始。" },
  timeout: { en: "Episode truncated at 500 steps.", zh: "回合在 500 步时截断。" },
  run: { en: "Auto run", zh: "自动运行" },
  pause: { en: "Pause", zh: "暂停" },
  noUpdate: { en: "No update yet. Advance one environment step.", zh: "尚无更新，请执行一次环境交互。" },
  engineNeutral: { en: "engine neutral", zh: "引擎空挡" },
  greedy: { en: "greedy", zh: "贪心" },
  updated: { en: "updated", zh: "刚更新" },
};

const algorithmSelect = document.querySelector("#mountain-algorithm");
const positionBinsSelect = document.querySelector("#position-bins");
const velocityBinsSelect = document.querySelector("#velocity-bins");
const alphaInput = document.querySelector("#mountain-alpha");
const gammaInput = document.querySelector("#mountain-gamma");
const epsilonInput = document.querySelector("#mountain-epsilon");
const lambdaInput = document.querySelector("#mountain-lambda");
const speedInput = document.querySelector("#mountain-speed");
const stepButton = document.querySelector("#mountain-step");
const episodeButton = document.querySelector("#mountain-episode");
const runButton = document.querySelector("#mountain-run");
const resetButton = document.querySelector("#mountain-reset");
const batchButton = document.querySelector("#mountain-batch");
const statusElement = document.querySelector("#mountain-status");

let positionBins;
let velocityBins;
let qValues;
let traces;
let position;
let velocity;
let queuedAction = null;
let totalSteps = 0;
let episodeSteps = 0;
let episodes = 0;
let successes = 0;
let latestReturn = null;
let lastAction = 1;
let lastUpdate = null;
let history = [];
let trajectory = [];
let completedTrajectory = [];
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

function epsilon() {
  return Number(epsilonInput.value);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function heightAt(x) {
  return Math.sin(3 * x) * 0.45 + 0.55;
}

function discretize(currentPosition, currentVelocity) {
  const p = clamp(Math.floor((currentPosition - POSITION_MIN) / (POSITION_MAX - POSITION_MIN) * positionBins), 0, positionBins - 1);
  const v = clamp(Math.floor((currentVelocity - VELOCITY_MIN) / (VELOCITY_MAX - VELOCITY_MIN) * velocityBins), 0, velocityBins - 1);
  return { p, v, index: v * positionBins + p };
}

function stateLabel(state) {
  return "S(p" + state.p + ",v" + state.v + ")";
}

function bestActions(values) {
  const maximum = Math.max(...values);
  return values
    .map((value, action) => ({ value, action }))
    .filter((item) => Math.abs(item.value - maximum) < 1e-10)
    .map((item) => item.action);
}

function chooseAction(state) {
  if (Math.random() < epsilon()) return Math.floor(Math.random() * MOUNTAIN_ACTIONS.length);
  const candidates = bestActions(qValues[state.index]);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function expectedValue(state) {
  const greedy = bestActions(qValues[state.index]);
  const randomShare = epsilon() / MOUNTAIN_ACTIONS.length;
  return qValues[state.index].reduce((sum, value, action) => {
    const greedyShare = greedy.includes(action) ? (1 - epsilon()) / greedy.length : 0;
    return sum + (randomShare + greedyShare) * value;
  }, 0);
}

function resetEpisode() {
  position = -0.6 + Math.random() * 0.2;
  velocity = 0;
  episodeSteps = 0;
  queuedAction = null;
  traces.forEach((row) => row.fill(0));
  trajectory = [{ position, velocity }];
}

function resetExperiment(messageKey) {
  stopRun(false);
  positionBins = Number(positionBinsSelect.value);
  velocityBins = Number(velocityBinsSelect.value);
  const stateCount = positionBins * velocityBins;
  qValues = Array.from({ length: stateCount }, () => [0, 0, 0]);
  traces = Array.from({ length: stateCount }, () => [0, 0, 0]);
  totalSteps = 0;
  episodes = 0;
  successes = 0;
  latestReturn = null;
  lastAction = 1;
  lastUpdate = null;
  history = [];
  completedTrajectory = [];
  resetEpisode();
  setStatus(messageKey || "ready");
  updateControls();
  render();
}

function environmentStep(action) {
  const force = MOUNTAIN_ACTIONS[action].force;
  let nextVelocity = velocity + 0.001 * force - 0.0025 * Math.cos(3 * position);
  nextVelocity = clamp(nextVelocity, VELOCITY_MIN, VELOCITY_MAX);
  let nextPosition = clamp(position + nextVelocity, POSITION_MIN, POSITION_MAX);
  if (nextPosition <= POSITION_MIN && nextVelocity < 0) nextVelocity = 0;
  const reachedGoal = nextPosition >= GOAL_POSITION;
  const truncated = episodeSteps + 1 >= MAX_EPISODE_STEPS;
  return { position: nextPosition, velocity: nextVelocity, reward: -1, done: reachedGoal || truncated, reachedGoal, truncated };
}

function updateWithTrace(state, action, error) {
  traces[state.index][action] = 1;
  for (let index = 0; index < qValues.length; index += 1) {
    for (let currentAction = 0; currentAction < MOUNTAIN_ACTIONS.length; currentAction += 1) {
      qValues[index][currentAction] += alpha() * error * traces[index][currentAction];
      traces[index][currentAction] *= gamma() * Number(lambdaInput.value);
    }
  }
}

function performStep(skipRender) {
  const algorithm = algorithmSelect.value;
  const state = discretize(position, velocity);
  const action = (algorithm === "sarsa" || algorithm === "lambda") && queuedAction !== null ? queuedAction : chooseAction(state);
  const result = environmentStep(action);
  const nextState = discretize(result.position, result.velocity);
  let nextAction = null;
  let target = result.reward;
  if (!result.done) {
    if (algorithm === "qlearning") target += gamma() * Math.max(...qValues[nextState.index]);
    else if (algorithm === "expected") target += gamma() * expectedValue(nextState);
    else {
      nextAction = chooseAction(nextState);
      target += gamma() * qValues[nextState.index][nextAction];
    }
  }

  const old = qValues[state.index][action];
  const error = target - old;
  if (algorithm === "lambda") updateWithTrace(state, action, error);
  else qValues[state.index][action] += alpha() * error;

  lastUpdate = {
    state,
    action,
    reward: result.reward,
    nextState,
    old,
    target,
    error,
    newValue: qValues[state.index][action],
    kind: algorithm === "lambda" ? "Q + eligibility trace" : "Q(S,A)",
  };
  position = result.position;
  velocity = result.velocity;
  queuedAction = nextAction;
  lastAction = action;
  totalSteps += 1;
  episodeSteps += 1;
  trajectory.push({ position, velocity });
  trajectory = trajectory.slice(-180);

  if (result.done) {
    latestReturn = -episodeSteps;
    history.push(episodeSteps);
    history = history.slice(-160);
    episodes += 1;
    if (result.reachedGoal) successes += 1;
    completedTrajectory = trajectory.slice();
    setStatus(result.reachedGoal ? "success" : "timeout");
    resetEpisode();
  }
  if (!skipRender) render();
}

function completeEpisode(skipRender) {
  const target = episodes + 1;
  let guard = 0;
  while (episodes < target && guard < MAX_EPISODE_STEPS + 1) {
    performStep(true);
    guard += 1;
  }
  if (!skipRender) render();
}

function trainBatch() {
  const target = episodes + 50;
  let guard = 0;
  while (episodes < target && guard < 30000) {
    performStep(true);
    guard += 1;
  }
  render();
}

function setStatus(key) {
  currentStatusKey = key;
  statusElement.textContent = mountainText[key][language()];
}

function startRun() {
  if (runTimer) return;
  setStatus("running");
  const delay = Math.max(45, 540 - Number(speedInput.value) * 50);
  runTimer = window.setInterval(() => performStep(false), delay);
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
  runButton.textContent = mountainText[runTimer ? "pause" : "run"][language()];
}

function updateControls() {
  lambdaInput.disabled = algorithmSelect.value !== "lambda";
}

function scenePoint(currentPosition) {
  const x = 42 + (currentPosition - POSITION_MIN) / (POSITION_MAX - POSITION_MIN) * 716;
  const y = 270 - heightAt(currentPosition) * 180;
  return { x, y };
}

function renderScene() {
  const samples = [];
  for (let i = 0; i <= 100; i += 1) {
    const samplePosition = POSITION_MIN + i / 100 * (POSITION_MAX - POSITION_MIN);
    samples.push(scenePoint(samplePosition));
  }
  const trackPath = samples.map((point, index) => (index === 0 ? "M" : "L") + point.x.toFixed(1) + " " + point.y.toFixed(1)).join(" ");
  document.querySelector("#mountain-track").setAttribute("d", trackPath);
  document.querySelector("#mountain-fill").setAttribute("d", trackPath + " L758 310 L42 310 Z");
  const goalPoint = scenePoint(GOAL_POSITION);
  document.querySelector("#goal-flag").setAttribute("transform", "translate(" + goalPoint.x.toFixed(1) + " " + goalPoint.y.toFixed(1) + ")");

  const point = scenePoint(position);
  const car = document.querySelector("#mountain-car");
  car.setAttribute("transform", "translate(" + point.x.toFixed(1) + " " + (point.y - 12).toFixed(1) + ") rotate(" + (-Math.cos(3 * position) * 24).toFixed(1) + ")");

  const force = MOUNTAIN_ACTIONS[lastAction].force;
  const forceArrow = document.querySelector("#force-arrow");
  forceArrow.setAttribute("x1", point.x);
  forceArrow.setAttribute("y1", point.y - 38);
  forceArrow.setAttribute("x2", point.x + force * 48);
  forceArrow.setAttribute("y2", point.y - 38);
  const velocityArrow = document.querySelector("#velocity-arrow");
  velocityArrow.setAttribute("x1", point.x);
  velocityArrow.setAttribute("y1", point.y - 55);
  velocityArrow.setAttribute("x2", point.x + velocity / VELOCITY_MAX * 70);
  velocityArrow.setAttribute("y2", point.y - 55);

  const displayedTrajectory = trajectory.length > 1 ? trajectory : completedTrajectory;
  const trajectoryPoints = displayedTrajectory.map((sample) => {
    const p = scenePoint(sample.position);
    return p.x.toFixed(1) + "," + (p.y - 3).toFixed(1);
  });
  document.querySelector("#mountain-trajectory").setAttribute("points", trajectoryPoints.join(" "));
  document.querySelector("#mountain-action-label").textContent = MOUNTAIN_ACTIONS[lastAction][language()];
}

function renderReadout() {
  const state = discretize(position, velocity);
  document.querySelector("#mountain-position").textContent = position.toFixed(4);
  document.querySelector("#mountain-velocity").textContent = velocity.toFixed(4);
  document.querySelector("#mountain-discrete").textContent = "(" + state.p + ", " + state.v + ")";
  document.querySelector("#mountain-force").textContent = String(MOUNTAIN_ACTIONS[lastAction].force);
}

function renderMetrics() {
  document.querySelector("#mountain-episodes").textContent = episodes;
  document.querySelector("#mountain-steps").textContent = totalSteps;
  document.querySelector("#mountain-return").textContent = latestReturn === null ? "—" : latestReturn;
  document.querySelector("#mountain-success").textContent = (episodes === 0 ? 0 : successes / episodes * 100).toFixed(0) + "%";
}

function renderChart() {
  const line = document.querySelector("#mountain-history-line");
  if (history.length < 2) {
    line.setAttribute("points", "");
    return;
  }
  const maximum = Math.max(...history);
  const minimum = Math.min(...history);
  const spread = Math.max(1, maximum - minimum);
  const points = history.map((value, index) => {
    const x = 32 + index / Math.max(1, history.length - 1) * 658;
    const y = 16 + (value - minimum) / spread * 134;
    return x.toFixed(1) + "," + y.toFixed(1);
  });
  line.setAttribute("points", points.join(" "));
}

function renderAlgorithm() {
  const detail = mountainDetails[algorithmSelect.value];
  document.querySelector("#mountain-badge").textContent = detail.badge;
  document.querySelector("#mountain-formula").textContent = detail.formula;
  document.querySelector("#mountain-explanation").textContent = detail[language()];
}

function format(value) {
  return value === null || value === undefined ? "—" : Number(value).toFixed(4);
}

function renderUpdate() {
  const equation = document.querySelector("#mountain-equation");
  if (!lastUpdate) {
    equation.textContent = mountainText.noUpdate[language()];
    for (const suffix of ["state", "action", "reward", "next", "old", "target", "error", "new"]) {
      document.querySelector("#mountain-update-" + suffix).textContent = "—";
    }
    return;
  }
  equation.textContent = "Qnew = " + format(lastUpdate.old) + " + " + alpha().toFixed(2) + " × (" + format(lastUpdate.target) + " − " + format(lastUpdate.old) + ") = " + format(lastUpdate.newValue);
  document.querySelector("#mountain-update-kind").textContent = lastUpdate.kind;
  document.querySelector("#mountain-update-state").textContent = stateLabel(lastUpdate.state);
  document.querySelector("#mountain-update-action").textContent = MOUNTAIN_ACTIONS[lastUpdate.action].symbol + " " + MOUNTAIN_ACTIONS[lastUpdate.action][language()];
  document.querySelector("#mountain-update-reward").textContent = format(lastUpdate.reward);
  document.querySelector("#mountain-update-next").textContent = stateLabel(lastUpdate.nextState);
  document.querySelector("#mountain-update-old").textContent = format(lastUpdate.old);
  document.querySelector("#mountain-update-target").textContent = format(lastUpdate.target);
  document.querySelector("#mountain-update-error").textContent = format(lastUpdate.error);
  document.querySelector("#mountain-update-new").textContent = format(lastUpdate.newValue);
}

function renderQInspector() {
  const state = discretize(position, velocity);
  const inspector = document.querySelector("#mountain-q-inspector");
  inspector.replaceChildren();
  document.querySelector("#mountain-q-state").textContent = stateLabel(state);
  const values = qValues[state.index];
  const greedy = bestActions(values);
  const magnitude = Math.max(0.001, ...values.map((value) => Math.abs(value)));
  values.forEach((value, action) => {
    const row = document.createElement("div");
    row.className = "q-action-row";
    if (greedy.includes(action)) row.classList.add("is-greedy");
    if (lastUpdate && lastUpdate.state.index === state.index && lastUpdate.action === action) row.classList.add("is-updated");
    const label = document.createElement("strong");
    label.textContent = MOUNTAIN_ACTIONS[action].symbol + " " + MOUNTAIN_ACTIONS[action][language()];
    const track = document.createElement("span");
    track.className = "q-action-track";
    const fill = document.createElement("i");
    fill.style.width = Math.max(2, Math.abs(value) / magnitude * 100) + "%";
    track.append(fill);
    const number = document.createElement("code");
    number.textContent = value.toFixed(4);
    const tag = document.createElement("small");
    tag.textContent = greedy.includes(action) ? mountainText.greedy[language()] : "";
    row.append(label, track, number, tag);
    inspector.append(row);
  });
}

function renderQMap() {
  const map = document.querySelector("#mountain-q-map");
  map.replaceChildren();
  map.style.setProperty("--position-bins", positionBins);
  const current = discretize(position, velocity);
  const allValues = qValues.map((values) => Math.max(...values));
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const spread = Math.max(0.001, maximum - minimum);
  for (let v = velocityBins - 1; v >= 0; v -= 1) {
    for (let p = 0; p < positionBins; p += 1) {
      const index = v * positionBins + p;
      const values = qValues[index];
      const best = bestActions(values)[0];
      const cell = document.createElement("div");
      cell.className = "mountain-map-cell";
      if (current.index === index) cell.classList.add("is-current");
      const heat = (Math.max(...values) - minimum) / spread * 38;
      cell.style.setProperty("--map-heat", heat.toFixed(1) + "%");
      cell.textContent = MOUNTAIN_ACTIONS[best].symbol;
      cell.setAttribute("title", "p" + p + ", v" + v + " · " + Math.max(...values).toFixed(3));
      map.append(cell);
    }
  }
}

function render() {
  updateControls();
  updateRunButton();
  renderAlgorithm();
  renderScene();
  renderReadout();
  renderMetrics();
  renderChart();
  renderUpdate();
  renderQInspector();
  renderQMap();
}

function updateRange(input, output, suffix) {
  output.textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2) + (suffix || "");
}

algorithmSelect.addEventListener("change", () => resetExperiment("reset"));
positionBinsSelect.addEventListener("change", () => resetExperiment("reset"));
velocityBinsSelect.addEventListener("change", () => resetExperiment("reset"));
alphaInput.addEventListener("input", () => updateRange(alphaInput, document.querySelector("#mountain-alpha-output")));
gammaInput.addEventListener("input", () => updateRange(gammaInput, document.querySelector("#mountain-gamma-output")));
epsilonInput.addEventListener("input", () => updateRange(epsilonInput, document.querySelector("#mountain-epsilon-output")));
lambdaInput.addEventListener("input", () => updateRange(lambdaInput, document.querySelector("#mountain-lambda-output")));
speedInput.addEventListener("input", () => {
  updateRange(speedInput, document.querySelector("#mountain-speed-output"), "×");
  restartRun();
});
stepButton.addEventListener("click", () => performStep(false));
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
