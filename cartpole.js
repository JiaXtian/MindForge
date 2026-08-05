const CARTPOLE_ACTIONS = [{ force: -1, symbol: "←", en: "push left", zh: "向左施力" }, { force: 1, symbol: "→", en: "push right", zh: "向右施力" }];
const CARTPOLE_LIMITS = [[-2.4, 2.4], [-3, 3], [-0.20944, 0.20944], [-3.5, 3.5]];
const CARTPOLE_RESOLUTIONS = { coarse: [5, 5, 8, 8], medium: [7, 7, 10, 10], fine: [9, 9, 14, 14] };

const cartpoleEnvironments = {
  standard: { name: { en: "Standard CartPole", zh: "标准 CartPole" }, gravity: 9.8, force: 10, en: "The canonical deterministic task uses gravity 9.8, force magnitude 10, a ±2.4 position limit, and a ±12° angle limit.", zh: "标准确定性任务使用重力 9.8、施力大小 10、±2.4 位置边界和 ±12° 角度边界。" },
  gravity: { name: { en: "Strong-gravity CartPole", zh: "强重力 CartPole" }, gravity: 15, force: 10, en: "Gravity rises to 15 while force remains unchanged. Angular errors accelerate faster, reducing the time available for corrective actions.", zh: "重力提高到 15 而施力保持不变；角度误差会更快增长，留给纠正动作的时间更短。" },
  weak: { name: { en: "Weak-actuator CartPole", zh: "弱执行器 CartPole" }, gravity: 9.8, force: 6, en: "Force magnitude falls from 10 to 6. Each decision changes acceleration less, so control must anticipate pole motion earlier.", zh: "施力大小从 10 降到 6，每次决策对加速度的影响更小，因此控制策略必须更早预判杆的运动。" },
};

const cartpoleAlgorithms = {
  qlearning: { name: { en: "Q-learning", zh: "Q-learning" }, badge: "Q-LEARNING / OFF-POLICY", formula: "Q(s,a) ← Q(s,a) + α[r + γ maxₐ′Q(s′,a′) − Q(s,a)]", en: "The behavior is epsilon-greedy, but the target evaluates the best next action. Continuous observations are first assigned to a finite state bin.", zh: "行为策略采用 ε-greedy，但目标评价下一状态中的最佳动作；连续观测会先被分配到有限状态格。" },
  sarsa: { name: { en: "SARSA", zh: "SARSA" }, badge: "SARSA / ON-POLICY", formula: "Q(s,a) ← Q(s,a) + α[r + γQ(s′,a′) − Q(s,a)]", en: "The selected exploratory next action enters the target, so learned action values describe the behavior policy that actually balances the pole.", zh: "实际选出的探索性下一动作进入目标，因此学到的动作价值描述真正执行平衡任务的行为策略。" },
  expected: { name: { en: "Expected SARSA", zh: "Expected SARSA" }, badge: "EXPECTED SARSA", formula: "target = r + γΣₐπ(a|s′)Q(s′,a)", en: "The target averages both next actions under the epsilon-greedy policy, removing next-action sampling noise while staying on-policy.", zh: "目标在 ε-greedy 策略下对两个下一动作求期望，在保持同策略的同时消除下一动作采样噪声。" },
  double: { name: { en: "Double Q-learning", zh: "Double Q-learning" }, badge: "DOUBLE Q-LEARNING", formula: "Qᴬ ← r + γQᴮ(s′, arg max Qᴬ)  or swap A,B", en: "Two tables separate action selection from evaluation, reducing optimistic error when noisy estimates are maximized.", zh: "两张价值表将动作选择与评价分离，从而降低对含噪估计取最大值时产生的乐观误差。" },
};

const cartpoleText = {
  ready: { en: "Experiment ready.", zh: "实验已就绪。" }, running: { en: "Running control steps automatically.", zh: "正在自动执行控制步骤。" }, paused: { en: "Experiment paused.", zh: "实验已暂停。" }, reset: { en: "Control values reset.", zh: "控制价值已重置。" }, failed: { en: "Limit crossed; a new episode has started.", zh: "状态越界，新回合已经开始。" }, solved: { en: "Balanced for 500 steps; a new episode has started.", zh: "已平衡 500 步，新回合已经开始。" }, run: { en: "Auto run", zh: "自动运行" }, pause: { en: "Pause", zh: "暂停" }, noUpdate: { en: "No TD update yet. Advance one control step.", zh: "尚无 TD 更新，请执行一次控制步骤。" }, experiment: { en: "Classic control combines nonlinear dynamics, delayed failure, continuous observation, and discrete action selection.", zh: "经典控制将非线性动力学、延迟失败、连续观测与离散动作选择结合在同一任务中。" },
};

const environmentSelect = document.querySelector("#cartpole-environment");
const algorithmSelect = document.querySelector("#cartpole-algorithm");
const resolutionSelect = document.querySelector("#cartpole-resolution");
const alphaInput = document.querySelector("#cartpole-alpha");
const gammaInput = document.querySelector("#cartpole-gamma");
const epsilonInput = document.querySelector("#cartpole-epsilon");
const speedInput = document.querySelector("#cartpole-speed");
const stepButton = document.querySelector("#cartpole-step");
const episodeButton = document.querySelector("#cartpole-episode");
const runButton = document.querySelector("#cartpole-run");
const resetButton = document.querySelector("#cartpole-reset");
const batchButton = document.querySelector("#cartpole-batch");
const statusElement = document.querySelector("#cartpole-status");

let bins;
let qA;
let qB;
let state;
let queuedAction = null;
let totalSteps = 0;
let episodeSteps = 0;
let episodes = 0;
let solvedEpisodes = 0;
let latestLength = null;
let lastAction = 1;
let lastUpdate = null;
let history = [];
let runTimer = null;
let currentStatusKey = "ready";

function language() { return document.documentElement.lang === "zh-CN" ? "zh" : "en"; }
function alpha() { return Number(alphaInput.value); }
function gamma() { return Number(gammaInput.value); }
function epsilon() { return Number(epsilonInput.value); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function stateKey(discrete) { return discrete.join("-"); }
function ensureTable(table, key) { if (!table[key]) table[key] = [0, 0]; return table[key]; }
function displayedQ(key) { const a = ensureTable(qA, key); if (algorithmSelect.value !== "double") return a; const b = ensureTable(qB, key); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
function bestAction(values, randomTie) { if (values[0] === values[1]) return randomTie ? (Math.random() < 0.5 ? 0 : 1) : 0; return values[0] > values[1] ? 0 : 1; }

function discretize(observation) {
  return observation.map((value, index) => {
    const [minimum, maximum] = CARTPOLE_LIMITS[index];
    const normalized = (clamp(value, minimum, maximum) - minimum) / (maximum - minimum);
    return clamp(Math.floor(normalized * bins[index]), 0, bins[index] - 1);
  });
}

function chooseAction(discrete) {
  const key = stateKey(discrete);
  if (Math.random() < epsilon()) return Math.random() < 0.5 ? 0 : 1;
  return bestAction(displayedQ(key), true);
}

function expectedValue(key) {
  const values = displayedQ(key);
  const greedy = bestAction(values, false);
  return values.reduce((sum, value, action) => sum + (epsilon() / 2 + (action === greedy ? 1 - epsilon() : 0)) * value, 0);
}

function resetEpisode() {
  state = [
    (Math.random() - 0.5) * 0.08,
    (Math.random() - 0.5) * 0.08,
    (Math.random() - 0.5) * 0.06,
    (Math.random() - 0.5) * 0.08,
  ];
  episodeSteps = 0;
  queuedAction = null;
}

function resetExperiment(messageKey) {
  stopRun(false);
  bins = CARTPOLE_RESOLUTIONS[resolutionSelect.value].slice();
  qA = {};
  qB = {};
  totalSteps = 0;
  episodes = 0;
  solvedEpisodes = 0;
  latestLength = null;
  lastUpdate = null;
  history = [];
  resetEpisode();
  setStatus(messageKey || "ready");
  render();
}

function environmentStep(action) {
  const config = cartpoleEnvironments[environmentSelect.value];
  const [x, xDot, theta, thetaDot] = state;
  const force = config.force * CARTPOLE_ACTIONS[action].force;
  const gravity = config.gravity;
  const massCart = 1;
  const massPole = 0.1;
  const totalMass = massCart + massPole;
  const halfLength = 0.5;
  const poleMassLength = massPole * halfLength;
  const cosine = Math.cos(theta);
  const sine = Math.sin(theta);
  const temporary = (force + poleMassLength * thetaDot * thetaDot * sine) / totalMass;
  const thetaAcceleration = (gravity * sine - cosine * temporary) / (halfLength * (4 / 3 - massPole * cosine * cosine / totalMass));
  const xAcceleration = temporary - poleMassLength * thetaAcceleration * cosine / totalMass;
  const tau = 0.02;
  const next = [x + tau * xDot, xDot + tau * xAcceleration, theta + tau * thetaDot, thetaDot + tau * thetaAcceleration];
  const failed = Math.abs(next[0]) > 2.4 || Math.abs(next[2]) > 0.20944;
  return { next, reward: 1, failed };
}

function finishEpisode(solved, skipRender) {
  episodes += 1;
  if (solved) solvedEpisodes += 1;
  latestLength = episodeSteps;
  history.push(episodeSteps);
  if (history.length > 100) history.shift();
  setStatus(solved ? "solved" : "failed");
  resetEpisode();
  if (!skipRender) render();
}

function performStep(skipRender) {
  const oldDiscrete = discretize(state);
  const oldKey = stateKey(oldDiscrete);
  const action = queuedAction === null ? chooseAction(oldDiscrete) : queuedAction;
  queuedAction = null;
  const result = environmentStep(action);
  episodeSteps += 1;
  totalSteps += 1;
  const solved = episodeSteps >= 500 && !result.failed;
  const terminal = result.failed || solved;
  const nextDiscrete = discretize(result.next);
  const nextKey = stateKey(nextDiscrete);
  let target = result.reward;
  let table = qA;
  let tableName = "Q";
  let nextAction = null;

  if (!terminal) {
    if (algorithmSelect.value === "qlearning") target += gamma() * Math.max(...ensureTable(qA, nextKey));
    else if (algorithmSelect.value === "sarsa") { nextAction = chooseAction(nextDiscrete); queuedAction = nextAction; target += gamma() * ensureTable(qA, nextKey)[nextAction]; }
    else if (algorithmSelect.value === "expected") target += gamma() * expectedValue(nextKey);
    else {
      const updateA = Math.random() < 0.5;
      table = updateA ? qA : qB;
      const evaluator = updateA ? qB : qA;
      const selector = ensureTable(table, nextKey);
      nextAction = bestAction(selector, true);
      target += gamma() * ensureTable(evaluator, nextKey)[nextAction];
      tableName = updateA ? "Qᴬ" : "Qᴮ";
    }
  } else if (algorithmSelect.value === "double") {
    const updateA = Math.random() < 0.5;
    table = updateA ? qA : qB;
    tableName = updateA ? "Qᴬ" : "Qᴮ";
  }

  const values = ensureTable(table, oldKey);
  const old = values[action];
  const error = target - old;
  values[action] += alpha() * error;
  lastUpdate = { state: oldKey, action, reward: result.reward, next: terminal ? "terminal" : nextKey, old, target, error, nextValue: values[action], table: tableName };
  lastAction = action;
  state = result.next;
  if (terminal) finishEpisode(solved, skipRender);
  else if (!skipRender) render();
}

function completeEpisode(skipRender) { const target = episodes + 1; let guard = 0; while (episodes < target && guard < 600) { performStep(true); guard += 1; } if (!skipRender) render(); }
function trainBatch() { stopRun(false); for (let i = 0; i < 50; i += 1) completeEpisode(true); render(); }
function setStatus(key) { currentStatusKey = key; statusElement.textContent = cartpoleText[key][language()]; }
function updateRunButton() { runButton.textContent = cartpoleText[runTimer ? "pause" : "run"][language()]; }
function startRun() { stopRun(false); runTimer = window.setInterval(() => performStep(false), Math.max(24, 740 - Number(speedInput.value) * 68)); setStatus("running"); updateRunButton(); }
function stopRun(announce) { if (runTimer) { window.clearInterval(runTimer); runTimer = null; } if (announce) setStatus("paused"); updateRunButton(); }
function restartRun() { if (runTimer) startRun(); }

function renderContext() {
  const lang = language();
  const environment = cartpoleEnvironments[environmentSelect.value];
  const algorithm = cartpoleAlgorithms[algorithmSelect.value];
  document.querySelector("#context-experiment-copy").textContent = cartpoleText.experiment[lang];
  document.querySelector("#context-environment-name").textContent = environment.name[lang];
  document.querySelector("#context-environment-copy").textContent = environment[lang];
  document.querySelector("#context-algorithm-name").textContent = algorithm.name[lang];
  document.querySelector("#context-algorithm-copy").textContent = algorithm[lang];
}

function renderScene() {
  const center = 360 + state[0] / 2.4 * 280;
  const poleX = Math.sin(state[2]) * 95;
  const poleY = -15 - Math.cos(state[2]) * 95;
  document.querySelector("#cartpole-cart").setAttribute("transform", "translate(" + center.toFixed(2) + " 170)");
  const pole = document.querySelector("#cartpole-pole");
  pole.setAttribute("x2", poleX.toFixed(2)); pole.setAttribute("y2", poleY.toFixed(2));
  const force = document.querySelector("#cartpole-force");
  force.setAttribute("x1", center.toFixed(2)); force.setAttribute("x2", (center + CARTPOLE_ACTIONS[lastAction].force * 58).toFixed(2));
}

function renderReadout() {
  const discrete = discretize(state);
  const key = stateKey(discrete);
  document.querySelector("#cartpole-position").textContent = state[0].toFixed(4);
  document.querySelector("#cartpole-velocity").textContent = state[1].toFixed(4);
  document.querySelector("#cartpole-angle").textContent = (state[2] * 180 / Math.PI).toFixed(2) + "°";
  document.querySelector("#cartpole-angular-velocity").textContent = state[3].toFixed(4);
  document.querySelector("#cartpole-state-label").textContent = "S(" + key + ")";
  document.querySelector("#cartpole-q-state").textContent = "S(" + key + ")";
  document.querySelector("#cartpole-environment-name").textContent = cartpoleEnvironments[environmentSelect.value].name[language()];
}

function renderMetrics() {
  document.querySelector("#cartpole-steps").textContent = totalSteps;
  document.querySelector("#cartpole-episodes").textContent = episodes;
  document.querySelector("#cartpole-latest-length").textContent = latestLength === null ? "—" : latestLength;
  document.querySelector("#cartpole-success-rate").textContent = (episodes ? solvedEpisodes / episodes * 100 : 0).toFixed(1) + "%";
}

function renderAlgorithm() { const detail = cartpoleAlgorithms[algorithmSelect.value]; document.querySelector("#cartpole-badge").textContent = detail.badge; document.querySelector("#cartpole-formula").textContent = detail.formula; document.querySelector("#cartpole-explanation").textContent = detail[language()]; }

function renderQInspector() {
  const target = document.querySelector("#cartpole-q-inspector"); target.replaceChildren();
  const key = stateKey(discretize(state)); const values = displayedQ(key); const greedy = bestAction(values, false); const minimum = Math.min(...values); const spread = Math.max(0.001, Math.max(...values) - minimum);
  values.forEach((value, action) => { const row = document.createElement("div"); row.className = "q-action-row" + (action === greedy ? " is-greedy" : "") + (lastUpdate?.state === key && lastUpdate.action === action ? " is-updated" : ""); const name = document.createElement("strong"); name.textContent = CARTPOLE_ACTIONS[action][language()]; const track = document.createElement("span"); track.className = "q-action-track"; const fill = document.createElement("i"); fill.style.width = ((value - minimum) / spread * 100).toFixed(1) + "%"; track.append(fill); const code = document.createElement("code"); code.textContent = value.toFixed(4); const label = document.createElement("small"); label.textContent = action === greedy ? "greedy" : ""; row.append(name, track, code, label); target.append(row); });
}

function renderUpdate() {
  if (!lastUpdate) { document.querySelector("#cartpole-equation").textContent = cartpoleText.noUpdate[language()]; for (const suffix of ["state", "action", "reward", "next", "old", "target", "error", "new"]) document.querySelector("#cartpole-update-" + suffix).textContent = "—"; return; }
  document.querySelector("#cartpole-update-kind").textContent = lastUpdate.table;
  document.querySelector("#cartpole-equation").textContent = lastUpdate.table + " ← " + lastUpdate.old.toFixed(4) + " + " + alpha().toFixed(2) + " × (" + lastUpdate.target.toFixed(4) + " − " + lastUpdate.old.toFixed(4) + ") = " + lastUpdate.nextValue.toFixed(4);
  document.querySelector("#cartpole-update-state").textContent = lastUpdate.state; document.querySelector("#cartpole-update-action").textContent = CARTPOLE_ACTIONS[lastUpdate.action][language()]; document.querySelector("#cartpole-update-reward").textContent = lastUpdate.reward.toFixed(2); document.querySelector("#cartpole-update-next").textContent = lastUpdate.next; document.querySelector("#cartpole-update-old").textContent = lastUpdate.old.toFixed(4); document.querySelector("#cartpole-update-target").textContent = lastUpdate.target.toFixed(4); document.querySelector("#cartpole-update-error").textContent = lastUpdate.error.toFixed(4); document.querySelector("#cartpole-update-new").textContent = lastUpdate.nextValue.toFixed(4);
}

function renderChart() { const maximum = Math.max(1, ...history); const points = history.map((length, index) => (32 + index / Math.max(1, history.length - 1) * 658).toFixed(1) + "," + (150 - length / maximum * 130).toFixed(1)); document.querySelector("#cartpole-history-line").setAttribute("points", points.join(" ")); }

function renderMap() {
  const map = document.querySelector("#cartpole-q-map"); map.replaceChildren();
  const discrete = discretize(state); const angleBins = bins[2]; const angularBins = bins[3]; map.style.setProperty("--cartpole-angle-bins", angleBins);
  for (let angular = angularBins - 1; angular >= 0; angular -= 1) for (let angle = 0; angle < angleBins; angle += 1) { const key = stateKey([discrete[0], discrete[1], angle, angular]); const values = displayedQ(key); const greedy = bestAction(values, false); const cell = document.createElement("span"); cell.className = "cartpole-map-cell" + (angle === discrete[2] && angular === discrete[3] ? " is-current" : ""); cell.textContent = CARTPOLE_ACTIONS[greedy].symbol; cell.setAttribute("title", key + " · " + Math.max(...values).toFixed(4)); map.append(cell); }
  document.querySelector("#cartpole-map-slice").textContent = "x-bin " + discrete[0] + " · v-bin " + discrete[1];
}

function render() { renderContext(); renderScene(); renderReadout(); renderMetrics(); renderAlgorithm(); renderQInspector(); renderUpdate(); renderChart(); renderMap(); updateRunButton(); document.querySelector("#cartpole-dynamics-mode").textContent = cartpoleEnvironments[environmentSelect.value].name[language()]; }
function updateRange(input, output, suffix) { output.textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2) + (suffix || ""); }

environmentSelect.addEventListener("change", () => resetExperiment("reset")); algorithmSelect.addEventListener("change", () => resetExperiment("reset")); resolutionSelect.addEventListener("change", () => resetExperiment("reset")); alphaInput.addEventListener("input", () => updateRange(alphaInput, document.querySelector("#cartpole-alpha-output"))); gammaInput.addEventListener("input", () => updateRange(gammaInput, document.querySelector("#cartpole-gamma-output"))); epsilonInput.addEventListener("input", () => updateRange(epsilonInput, document.querySelector("#cartpole-epsilon-output"))); speedInput.addEventListener("input", () => { updateRange(speedInput, document.querySelector("#cartpole-speed-output"), "×"); restartRun(); }); stepButton.addEventListener("click", () => performStep(false)); episodeButton.addEventListener("click", () => completeEpisode(false)); runButton.addEventListener("click", () => { if (runTimer) stopRun(true); else startRun(); }); resetButton.addEventListener("click", () => resetExperiment("reset")); batchButton.addEventListener("click", trainBatch); window.addEventListener("mindforge:language", () => { setStatus(currentStatusKey); render(); });

resetExperiment("ready");
