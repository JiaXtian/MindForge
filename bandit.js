const strategyDetails = {
  epsilon: {
    name: "ε-greedy",
    badge: "EPSILON-GREEDY",
    formula: "a = random with ε; otherwise arg max Q(a)",
    en: "A fixed fraction of decisions is reserved for uniform random exploration; all remaining decisions use the largest sample-average estimate.",
    zh: "固定比例的决策用于均匀随机探索，其余决策选择样本平均估计最大的臂。",
  },
  ucb: {
    name: "UCB1",
    badge: "UPPER CONFIDENCE BOUND",
    formula: "a = arg max [Q(a) + √(2 ln t / N(a))]",
    en: "The confidence bonus is large for rarely visited arms and shrinks with evidence. Exploration is directed toward uncertainty instead of chosen at random.",
    zh: "访问较少的臂具有更大的置信奖励，并随证据增加而缩小；探索会定向流向不确定性，而不是完全随机。",
  },
  thompson: {
    name: "Thompson sampling",
    badge: "POSTERIOR SAMPLING",
    formula: "θₐ ~ posterior(a);  a = arg max θₐ",
    en: "Each arm proposes one plausible reward rate sampled from its posterior. Uncertain arms occasionally look best, while accumulated evidence makes strong arms win more often.",
    zh: "每个臂从自己的后验中抽取一个可能奖励率；不确定的臂偶尔会显得最好，而累积证据会让真正优秀的臂更频繁胜出。",
  },
};

const banditText = {
  ready: { en: "Experiment ready.", zh: "实验已就绪。" },
  running: { en: "Running automatically.", zh: "正在自动运行。" },
  paused: { en: "Experiment paused.", zh: "实验已暂停。" },
  reset: { en: "Experiment reset.", zh: "实验已重置。" },
  shifted: { en: "Reward landscape changed; agents must adapt.", zh: "奖励环境已改变，算法需要重新适应。" },
  run: { en: "Auto run", zh: "自动运行" },
  pause: { en: "Pause", zh: "暂停" },
  single: { en: "single strategy", zh: "单一策略" },
  compare: { en: "three-strategy comparison", zh: "三策略同时比较" },
  trueMean: { en: "true mean", zh: "真实均值" },
  estimate: { en: "estimate", zh: "估计" },
  pulls: { en: "pulls", zh: "次数" },
  arm: { en: "Arm", zh: "臂" },
  trueMeanLabel: { en: "true mean", zh: "真实均值" },
};

const means = [0.18, 0.38, 0.57, 0.72, 0.5];
const strategies = {};
const strategySelect = document.querySelector("#strategy-select");
const rewardSelect = document.querySelector("#reward-select");
const epsilonInput = document.querySelector("#bandit-epsilon");
const speedInput = document.querySelector("#bandit-speed");
const compareToggle = document.querySelector("#compare-toggle");
const stepButton = document.querySelector("#bandit-step");
const runButton = document.querySelector("#bandit-run");
const resetButton = document.querySelector("#bandit-reset");
const batchButton = document.querySelector("#bandit-batch");
const statusElement = document.querySelector("#bandit-status");
const editorList = document.querySelector("#arm-editor-list");
const visuals = document.querySelector("#arm-visuals");
let runTimer = null;
let currentStatusKey = "ready";

function language() {
  return document.documentElement.lang === "zh-CN" ? "zh" : "en";
}

function newStrategyState() {
  return {
    counts: Array(means.length).fill(0),
    estimates: Array(means.length).fill(0),
    successes: Array(means.length).fill(0),
    failures: Array(means.length).fill(0),
    pulls: 0,
    reward: 0,
    regret: 0,
    bestPulls: 0,
    regretHistory: [],
    lastArm: null,
  };
}

function resetStrategies(messageKey) {
  Object.keys(strategyDetails).forEach((key) => {
    strategies[key] = newStrategyState();
  });
  stopRun(false);
  setStatus(messageKey || "ready");
  render();
}

function normalSample(mean, deviation) {
  const u1 = Math.max(Number.EPSILON, Math.random());
  const u2 = Math.random();
  return mean + deviation * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function gammaSample(shape) {
  if (shape < 1) {
    return gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const x = normalSample(0, 1);
    const vBase = 1 + c * x;
    if (vBase <= 0) continue;
    const v = vBase * vBase * vBase;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

function betaSample(alpha, beta) {
  const x = gammaSample(alpha);
  const y = gammaSample(beta);
  return x / (x + y);
}

function argmax(values, randomTies) {
  const maximum = Math.max(...values);
  const candidates = values
    .map((value, index) => ({ value, index }))
    .filter((item) => Math.abs(item.value - maximum) < 1e-12)
    .map((item) => item.index);
  if (randomTies && candidates.length > 1) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return candidates[0];
}

function chooseArm(key, state) {
  if (key === "epsilon") {
    if (Math.random() < Number(epsilonInput.value)) {
      return Math.floor(Math.random() * means.length);
    }
    return argmax(state.estimates, true);
  }

  if (key === "ucb") {
    const unvisited = state.counts.findIndex((count) => count === 0);
    if (unvisited >= 0) return unvisited;
    const scores = state.estimates.map((estimate, arm) => {
      return estimate + Math.sqrt(2 * Math.log(state.pulls + 1) / state.counts[arm]);
    });
    return argmax(scores, true);
  }

  const samples = means.map((_, arm) => {
    if (rewardSelect.value === "bernoulli") {
      return betaSample(state.successes[arm] + 1, state.failures[arm] + 1);
    }
    const count = state.counts[arm];
    const posteriorMean = count === 0 ? 0.5 : state.estimates[arm];
    return normalSample(posteriorMean, 0.35 / Math.sqrt(count + 1));
  });
  return argmax(samples, true);
}

function sampleReward(arm) {
  if (rewardSelect.value === "bernoulli") return Math.random() < means[arm] ? 1 : 0;
  return normalSample(means[arm], 0.18);
}

function advanceStrategy(key) {
  const state = strategies[key];
  const arm = chooseArm(key, state);
  const reward = sampleReward(arm);
  state.pulls += 1;
  state.counts[arm] += 1;
  state.reward += reward;
  state.estimates[arm] += (reward - state.estimates[arm]) / state.counts[arm];
  if (reward > 0.5) state.successes[arm] += 1;
  else state.failures[arm] += 1;
  const bestMean = Math.max(...means);
  state.regret += bestMean - means[arm];
  if (means[arm] === bestMean) state.bestPulls += 1;
  state.lastArm = arm;
  state.regretHistory.push(state.regret);
  state.regretHistory = state.regretHistory.slice(-240);
}

function performStep(skipRender) {
  if (compareToggle.checked) {
    Object.keys(strategyDetails).forEach(advanceStrategy);
  } else {
    advanceStrategy(strategySelect.value);
  }
  if (!skipRender) render();
}

function runBatch() {
  for (let i = 0; i < 500; i += 1) performStep(true);
  render();
}

function setStatus(key) {
  currentStatusKey = key;
  statusElement.textContent = banditText[key][language()];
}

function startRun() {
  if (runTimer) return;
  setStatus("running");
  const delay = Math.max(24, 520 - Number(speedInput.value) * 48);
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
  runButton.textContent = banditText[runTimer ? "pause" : "run"][language()];
}

function renderEditors() {
  editorList.replaceChildren();
  means.forEach((mean, arm) => {
    const wrapper = document.createElement("div");
    wrapper.className = "arm-control";
    const top = document.createElement("div");
    top.className = "arm-control-top";
    const name = document.createElement("span");
    name.textContent = banditText.arm[language()] + " " + (arm + 1);
    const value = document.createElement("strong");
    value.textContent = mean.toFixed(2);
    top.append(name, value);
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0.02";
    input.max = "0.98";
    input.step = "0.01";
    input.value = mean;
    input.setAttribute(
      "aria-label",
      banditText.arm[language()] + " " + (arm + 1) + " " + banditText.trueMeanLabel[language()],
    );
    input.addEventListener("input", () => {
      means[arm] = Number(input.value);
      value.textContent = means[arm].toFixed(2);
      setStatus("shifted");
      renderVisuals();
      renderMetrics();
    });
    wrapper.append(top, input);
    editorList.append(wrapper);
  });
}

function renderVisuals() {
  const state = strategies[strategySelect.value];
  visuals.replaceChildren();
  means.forEach((mean, arm) => {
    const card = document.createElement("article");
    card.className = "arm-card";
    if (state.lastArm === arm) card.classList.add("is-selected");

    const bars = document.createElement("div");
    bars.className = "arm-bars";
    const trueBar = document.createElement("i");
    trueBar.className = "arm-bar is-true";
    trueBar.style.height = Math.max(2, mean * 100) + "%";
    const estimateBar = document.createElement("i");
    estimateBar.className = "arm-bar is-estimate";
    const normalizedEstimate = Math.max(0, Math.min(1, state.estimates[arm]));
    estimateBar.style.height = Math.max(2, normalizedEstimate * 100) + "%";
    bars.append(trueBar, estimateBar);

    const title = document.createElement("h3");
    title.textContent = banditText.arm[language()] + " " + (arm + 1);
    const stats = document.createElement("p");
    stats.textContent =
      banditText.trueMean[language()] + " " + mean.toFixed(2) + " · " +
      banditText.estimate[language()] + " " + state.estimates[arm].toFixed(2) + " · " +
      banditText.pulls[language()] + " " + state.counts[arm];
    card.append(bars, title, stats);
    visuals.append(card);
  });
}

function renderMetrics() {
  const state = strategies[strategySelect.value];
  document.querySelector("#metric-pulls").textContent = state.pulls;
  document.querySelector("#metric-reward").textContent = state.reward.toFixed(1);
  document.querySelector("#metric-regret").textContent = state.regret.toFixed(1);
  const rate = state.pulls === 0 ? 0 : state.bestPulls / state.pulls * 100;
  document.querySelector("#metric-best").textContent = rate.toFixed(0) + "%";
}

function chartPoints(history, maximum) {
  if (history.length < 2) return "";
  return history.map((value, index) => {
    const x = 32 + index / Math.max(1, history.length - 1) * 658;
    const y = 150 - value / maximum * 136;
    return x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
}

function renderChart() {
  const allValues = Object.values(strategies).flatMap((state) => state.regretHistory);
  const maximum = Math.max(1, ...allValues);
  document.querySelector("#regret-epsilon").setAttribute("points", chartPoints(strategies.epsilon.regretHistory, maximum));
  document.querySelector("#regret-ucb").setAttribute("points", chartPoints(strategies.ucb.regretHistory, maximum));
  document.querySelector("#regret-thompson").setAttribute("points", chartPoints(strategies.thompson.regretHistory, maximum));
}

function renderAlgorithm() {
  const detail = strategyDetails[strategySelect.value];
  document.querySelector("#strategy-name").textContent = detail.name;
  document.querySelector("#bandit-algorithm-badge").textContent = detail.badge;
  document.querySelector("#bandit-formula").textContent = detail.formula;
  document.querySelector("#bandit-explanation").textContent = detail[language()];
  document.querySelector("#bandit-mode").textContent =
    banditText[compareToggle.checked ? "compare" : "single"][language()];
  epsilonInput.disabled = strategySelect.value !== "epsilon" && !compareToggle.checked;
}

function render() {
  renderAlgorithm();
  renderVisuals();
  renderMetrics();
  renderChart();
  updateRunButton();
}

strategySelect.addEventListener("change", render);
rewardSelect.addEventListener("change", () => resetStrategies("reset"));
compareToggle.addEventListener("change", render);
epsilonInput.addEventListener("input", () => {
  document.querySelector("#bandit-epsilon-output").textContent = Number(epsilonInput.value).toFixed(2);
});
speedInput.addEventListener("input", () => {
  document.querySelector("#bandit-speed-output").textContent = speedInput.value + "×";
  restartRun();
});
stepButton.addEventListener("click", () => performStep(false));
runButton.addEventListener("click", () => {
  if (runTimer) stopRun(true);
  else startRun();
});
resetButton.addEventListener("click", () => resetStrategies("reset"));
batchButton.addEventListener("click", runBatch);

window.addEventListener("mindforge:language", () => {
  setStatus(currentStatusKey);
  renderEditors();
  render();
});

renderEditors();
resetStrategies("ready");
