const strategyDetails = {
  epsilon: {
    name: "ε-greedy",
    label: { en: "ε-greedy", zh: "ε-greedy" },
    badge: "EPSILON-GREEDY",
    formula: "π(a) = ε/k + (1−ε)/|arg max Q| for greedy actions",
    evidence: { en: "estimate Q(a)", zh: "估计 Q(a)" },
    en: "A fixed probability mass is spread uniformly across every arm; the remaining mass is shared by arms with the largest sample-average estimate.",
    zh: "固定比例的概率质量均匀分配给所有臂，剩余概率由样本平均估计最大的臂共同获得。",
  },
  ucb: {
    name: "UCB1",
    label: { en: "UCB1", zh: "UCB1" },
    badge: "UPPER CONFIDENCE BOUND",
    formula: "a = arg max [Q(a) + √(2 ln t / N(a))]",
    evidence: { en: "optimistic upper bound", zh: "乐观上置信界" },
    en: "The confidence bonus is large for rarely sampled arms and shrinks with evidence. Exploration is directed toward uncertainty instead of chosen uniformly.",
    zh: "访问较少的臂具有更大的置信奖励，并随证据增加而缩小；探索会定向流向不确定性，而不是均匀随机发生。",
  },
  thompson: {
    name: "Thompson sampling",
    label: { en: "Thompson sampling", zh: "Thompson sampling" },
    badge: "POSTERIOR SAMPLING",
    formula: "θₐ ~ posterior(a);  a = arg max θₐ",
    evidence: { en: "latest posterior sample", zh: "最近一次后验样本" },
    en: "Each arm proposes one plausible reward parameter sampled from its posterior. Uncertainty becomes selection probability through repeated posterior draws.",
    zh: "每个臂从后验中提出一个可能的奖励参数；通过反复后验抽样，不确定性被直接转化为选择概率。",
  },
  softmax: {
    name: "Softmax exploration",
    label: { en: "Softmax exploration", zh: "Softmax 探索" },
    badge: "BOLTZMANN / SOFTMAX",
    formula: "π(a) = exp(Q(a)/τ) / Σᵦ exp(Q(b)/τ)",
    evidence: { en: "action probability π(a)", zh: "动作概率 π(a)" },
    en: "Every arm receives probability according to its relative estimate. Temperature controls whether small value differences are amplified or flattened.",
    zh: "每个臂根据相对估计获得选择概率；温度决定价值差异是被放大还是被压平。",
  },
  gradient: {
    name: "Gradient bandit",
    label: { en: "Gradient bandit", zh: "Gradient Bandit" },
    badge: "POLICY GRADIENT",
    formula: "H(a) ← H(a) + α(R−R̄)[1(a=A)−π(a)]",
    evidence: { en: "preference H(a)", zh: "偏好 H(a)" },
    en: "The algorithm learns action preferences directly rather than estimating reward values for control. Reward above the running baseline raises the chosen action's probability.",
    zh: "算法直接学习动作偏好，而不是依赖奖励价值进行控制；高于运行基线的奖励会提高所选动作的概率。",
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
  compare: { en: "five-strategy comparison", zh: "五策略同时比较" },
  trueMean: { en: "true mean", zh: "真实均值" },
  estimate: { en: "estimate", zh: "估计" },
  pulls: { en: "pulls", zh: "次数" },
  arm: { en: "Arm", zh: "臂" },
  trueMeanLabel: { en: "true mean", zh: "真实均值" },
  probability: { en: "probability", zh: "概率" },
  score: { en: "evidence", zh: "决策证据" },
  noDecision: { en: "No pull yet. Advance once to expose the selection evidence and estimate update.", zh: "尚未拉杆。执行一次单步即可看到选择依据与估计更新。" },
  unavailable: { en: "sampled, not analytic", zh: "由抽样产生，无解析值" },
};

const banditContext = {
  experiment: { en: "A stateless repeated decision problem isolates exploration, uncertainty, and regret from delayed credit assignment.", zh: "无状态的重复决策问题将探索、不确定性和遗憾从延迟信用分配中单独分离出来。" },
  bernoulli: { en: "Bernoulli rewards", zh: "Bernoulli 奖励", enCopy: "Each pull returns either 0 or 1. An arm's editable mean is exactly its success probability.", zhCopy: "每次拉杆只返回 0 或 1，每个臂可编辑的均值就是其成功概率。" },
  gaussian: { en: "Gaussian rewards", zh: "Gaussian 奖励", enCopy: "Each pull samples a continuous reward from a normal distribution centered on the arm's editable true mean.", zhCopy: "每次拉杆从以该臂可编辑真实均值为中心的正态分布中采样连续奖励。" },
  stationary: { en: "The reward means remain fixed, so old observations and new observations describe the same latent problem.", zh: "奖励均值保持不变，因此旧观察与新观察描述的是同一个潜在问题。" },
  drift: { en: "All true means follow a small random walk, so accumulated evidence becomes stale and continued exploration matters.", zh: "所有真实均值都会进行小幅随机游走，因此历史证据会过期，持续探索变得重要。" },
};

const means = [0.18, 0.38, 0.57, 0.72, 0.5];
const strategies = {};
const strategySelect = document.querySelector("#strategy-select");
const rewardSelect = document.querySelector("#reward-select");
const dynamicsSelect = document.querySelector("#bandit-dynamics");
const epsilonInput = document.querySelector("#bandit-epsilon");
const temperatureInput = document.querySelector("#bandit-temperature");
const preferenceAlphaInput = document.querySelector("#bandit-preference-alpha");
const initialQInput = document.querySelector("#bandit-initial-q");
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
    estimates: Array(means.length).fill(Number(initialQInput.value)),
    preferences: Array(means.length).fill(0),
    successes: Array(means.length).fill(0),
    failures: Array(means.length).fill(0),
    pulls: 0,
    reward: 0,
    regret: 0,
    bestPulls: 0,
    regretHistory: [],
    lastArm: null,
    lastDecision: null,
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
  if (shape < 1) return gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const x = normalSample(0, 1);
    const vBase = 1 + c * x;
    if (vBase <= 0) continue;
    const v = vBase * vBase * vBase;
    const u = Math.random();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
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
    .filter((item) => item.value === maximum || Math.abs(item.value - maximum) < 1e-12)
    .map((item) => item.index);
  if (randomTies && candidates.length > 1) return candidates[Math.floor(Math.random() * candidates.length)];
  return candidates[0];
}

function softmax(values, temperature) {
  const scaled = values.map((value) => value / Math.max(0.001, temperature));
  const maximum = Math.max(...scaled);
  const weights = scaled.map((value) => Math.exp(value - maximum));
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((value) => value / total);
}

function sampleProbability(probabilities) {
  let draw = Math.random();
  for (let arm = 0; arm < probabilities.length; arm += 1) {
    draw -= probabilities[arm];
    if (draw <= 0) return arm;
  }
  return probabilities.length - 1;
}

function epsilonProbabilities(estimates) {
  const greedy = argmax(estimates, false);
  const probabilities = Array(means.length).fill(Number(epsilonInput.value) / means.length);
  probabilities[greedy] += 1 - Number(epsilonInput.value);
  return probabilities;
}

function chooseArm(key, state) {
  if (key === "epsilon") {
    const probabilities = epsilonProbabilities(state.estimates);
    return { arm: sampleProbability(probabilities), scores: state.estimates.slice(), probabilities };
  }

  if (key === "ucb") {
    const scores = state.estimates.map((estimate, arm) => {
      if (state.counts[arm] === 0) return Number.POSITIVE_INFINITY;
      return estimate + Math.sqrt(2 * Math.log(state.pulls + 1) / state.counts[arm]);
    });
    const arm = argmax(scores, true);
    const probabilities = Array(means.length).fill(0);
    probabilities[arm] = 1;
    return { arm, scores, probabilities };
  }

  if (key === "thompson") {
    const scores = means.map((_, arm) => {
      if (rewardSelect.value === "bernoulli") {
        return betaSample(state.successes[arm] + 1, state.failures[arm] + 1);
      }
      const count = state.counts[arm];
      const posteriorMean = count === 0 ? Number(initialQInput.value) : state.estimates[arm];
      return normalSample(posteriorMean, 0.35 / Math.sqrt(count + 1));
    });
    return { arm: argmax(scores, true), scores, probabilities: null };
  }

  if (key === "softmax") {
    const probabilities = softmax(state.estimates, Number(temperatureInput.value));
    return { arm: sampleProbability(probabilities), scores: probabilities.slice(), probabilities };
  }

  const probabilities = softmax(state.preferences, 1);
  return { arm: sampleProbability(probabilities), scores: state.preferences.slice(), probabilities };
}

function sampleReward(arm) {
  if (rewardSelect.value === "bernoulli") return Math.random() < means[arm] ? 1 : 0;
  return normalSample(means[arm], 0.18);
}

function advanceStrategy(key) {
  const state = strategies[key];
  const decision = chooseArm(key, state);
  const arm = decision.arm;
  const reward = sampleReward(arm);
  const oldEstimate = state.estimates[arm];
  const oldPreference = state.preferences[arm];
  const baseline = state.pulls === 0 ? 0 : state.reward / state.pulls;
  const bestMean = Math.max(...means);
  const instantRegret = bestMean - means[arm];

  state.pulls += 1;
  state.counts[arm] += 1;
  state.reward += reward;
  state.estimates[arm] += (reward - state.estimates[arm]) / state.counts[arm];
  if (reward > 0.5) state.successes[arm] += 1;
  else state.failures[arm] += 1;

  if (key === "gradient") {
    for (let candidate = 0; candidate < means.length; candidate += 1) {
      const indicator = candidate === arm ? 1 : 0;
      state.preferences[candidate] += Number(preferenceAlphaInput.value) * (reward - baseline) * (indicator - decision.probabilities[candidate]);
    }
  }

  state.regret += instantRegret;
  if (means[arm] === bestMean) state.bestPulls += 1;
  state.lastArm = arm;
  state.lastDecision = {
    arm,
    reward,
    score: decision.scores[arm],
    scores: decision.scores,
    probabilities: decision.probabilities,
    probability: decision.probabilities ? decision.probabilities[arm] : null,
    oldEstimate,
    newEstimate: state.estimates[arm],
    instantRegret,
    baseline,
    oldPreference,
    newPreference: state.preferences[arm],
  };
  state.regretHistory.push(state.regret);
  state.regretHistory = state.regretHistory.slice(-240);
}

function driftMeans() {
  if (dynamicsSelect.value !== "drifting") return;
  for (let arm = 0; arm < means.length; arm += 1) {
    means[arm] = Math.max(0.02, Math.min(0.98, means[arm] + normalSample(0, 0.006)));
  }
}

function performStep(skipRender) {
  if (compareToggle.checked) Object.keys(strategyDetails).forEach(advanceStrategy);
  else advanceStrategy(strategySelect.value);
  driftMeans();
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

function updateControlAvailability() {
  const compare = compareToggle.checked;
  epsilonInput.disabled = strategySelect.value !== "epsilon" && !compare;
  temperatureInput.disabled = strategySelect.value !== "softmax" && !compare;
  preferenceAlphaInput.disabled = strategySelect.value !== "gradient" && !compare;
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
    input.setAttribute("aria-label", banditText.arm[language()] + " " + (arm + 1) + " " + banditText.trueMeanLabel[language()]);
    input.addEventListener("input", () => {
      means[arm] = Number(input.value);
      value.textContent = means[arm].toFixed(2);
      setStatus("shifted");
      renderVisuals();
      renderMetrics();
      renderDecision();
    });
    wrapper.append(top, input);
    editorList.append(wrapper);
  });
}

function syncEditors() {
  Array.from(editorList.children).forEach((wrapper, arm) => {
    const top = wrapper.children[0];
    const input = wrapper.children[1];
    top.children[0].textContent = banditText.arm[language()] + " " + (arm + 1);
    top.children[1].textContent = means[arm].toFixed(2);
    if (document.activeElement !== input) input.value = means[arm];
  });
}

function currentEvidence(key, state) {
  if (state.lastDecision) return { scores: state.lastDecision.scores, probabilities: state.lastDecision.probabilities };
  if (key === "epsilon") return { scores: state.estimates, probabilities: epsilonProbabilities(state.estimates) };
  if (key === "softmax") {
    const probabilities = softmax(state.estimates, Number(temperatureInput.value));
    return { scores: probabilities, probabilities };
  }
  if (key === "gradient") {
    return { scores: state.preferences, probabilities: softmax(state.preferences, 1) };
  }
  if (key === "thompson") {
    const scores = state.successes.map((successes, arm) => (successes + 1) / (successes + state.failures[arm] + 2));
    return { scores, probabilities: null };
  }
  const scores = state.estimates.map((estimate, arm) => state.counts[arm] === 0 ? Number.POSITIVE_INFINITY : estimate + Math.sqrt(2 * Math.log(state.pulls + 1) / state.counts[arm]));
  return { scores, probabilities: null };
}

function renderVisuals() {
  const state = strategies[strategySelect.value];
  const evidence = currentEvidence(strategySelect.value, state);
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
    const probability = evidence.probabilities ? " · π " + (evidence.probabilities[arm] * 100).toFixed(1) + "%" : "";
    stats.textContent = banditText.trueMean[language()] + " " + mean.toFixed(2) + " · " +
      banditText.estimate[language()] + " " + state.estimates[arm].toFixed(2) + " · " +
      banditText.pulls[language()] + " " + state.counts[arm] + probability;
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
  for (const key of Object.keys(strategyDetails)) {
    document.querySelector("#regret-" + key).setAttribute("points", chartPoints(strategies[key].regretHistory, maximum));
  }
}

function renderAlgorithm() {
  const detail = strategyDetails[strategySelect.value];
  document.querySelector("#strategy-name").textContent = detail.name;
  document.querySelector("#bandit-algorithm-badge").textContent = detail.badge;
  document.querySelector("#bandit-formula").textContent = detail.formula;
  document.querySelector("#bandit-explanation").textContent = detail[language()];
  document.querySelector("#bandit-mode").textContent = banditText[compareToggle.checked ? "compare" : "single"][language()];
  updateControlAvailability();
}

function renderContext() {
  const lang = language();
  const reward = banditContext[rewardSelect.value];
  const dynamics = banditContext[dynamicsSelect.value === "stationary" ? "stationary" : "drift"];
  const detail = strategyDetails[strategySelect.value];
  document.querySelector("#context-experiment-copy").textContent = banditContext.experiment[lang];
  document.querySelector("#context-environment-name").textContent = reward[lang] + " · " + (dynamicsSelect.value === "stationary" ? (lang === "zh" ? "平稳" : "stationary") : (lang === "zh" ? "漂移" : "drifting"));
  document.querySelector("#context-environment-copy").textContent = reward[lang === "zh" ? "zhCopy" : "enCopy"] + " " + dynamics[lang];
  document.querySelector("#context-algorithm-name").textContent = detail.label[lang];
  document.querySelector("#context-algorithm-copy").textContent = detail[lang];
}

function formatEvidence(value) {
  if (value === null || value === undefined) return "—";
  if (!Number.isFinite(value)) return "∞";
  return Number(value).toFixed(4);
}

function renderDecision() {
  const key = strategySelect.value;
  const state = strategies[key];
  const decision = state.lastDecision;
  document.querySelector("#bandit-decision-strategy").textContent = strategyDetails[key].name;
  if (!decision) {
    document.querySelector("#bandit-decision-equation").textContent = banditText.noDecision[language()];
    for (const suffix of ["arm", "reward", "score", "probability", "old", "new", "regret", "baseline"]) {
      document.querySelector("#decision-" + suffix).textContent = "—";
    }
  } else {
    const gradient = key === "gradient";
    document.querySelector("#bandit-decision-equation").textContent = gradient
      ? "Hnew = " + decision.oldPreference.toFixed(4) + " + " + Number(preferenceAlphaInput.value).toFixed(2) +
        " × (" + decision.reward.toFixed(4) + " − " + decision.baseline.toFixed(4) + ") × (1 − " +
        decision.probability.toFixed(4) + ") = " + decision.newPreference.toFixed(4)
      : "Qnew = " + decision.oldEstimate.toFixed(4) + " + (" + decision.reward.toFixed(4) + " − " +
        decision.oldEstimate.toFixed(4) + ") / " + state.counts[decision.arm] + " = " + decision.newEstimate.toFixed(4);
    document.querySelector("#decision-arm").textContent = banditText.arm[language()] + " " + (decision.arm + 1);
    document.querySelector("#decision-reward").textContent = decision.reward.toFixed(4);
    document.querySelector("#decision-score").textContent = formatEvidence(decision.score);
    document.querySelector("#decision-probability").textContent = decision.probability === null ? banditText.unavailable[language()] : (decision.probability * 100).toFixed(2) + "%";
    document.querySelector("#decision-old").textContent = (gradient ? decision.oldPreference : decision.oldEstimate).toFixed(4);
    document.querySelector("#decision-new").textContent = (gradient ? decision.newPreference : decision.newEstimate).toFixed(4);
    document.querySelector("#decision-regret").textContent = decision.instantRegret.toFixed(4);
    document.querySelector("#decision-baseline").textContent = decision.baseline.toFixed(4);
  }
  renderScoreTable();
}

function renderScoreTable() {
  const key = strategySelect.value;
  const state = strategies[key];
  const evidence = currentEvidence(key, state);
  const table = document.querySelector("#bandit-score-table");
  table.replaceChildren();
  document.querySelector("#decision-table-kind").textContent = strategyDetails[key].evidence[language()];
  means.forEach((_, arm) => {
    const row = document.createElement("div");
    row.className = "bandit-score-row";
    if (state.lastArm === arm) row.classList.add("is-selected");
    const name = document.createElement("strong");
    name.textContent = banditText.arm[language()] + " " + (arm + 1);
    const estimate = document.createElement("span");
    estimate.textContent = "Q " + state.estimates[arm].toFixed(4);
    const score = document.createElement("code");
    score.textContent = banditText.score[language()] + " " + formatEvidence(evidence.scores[arm]);
    const probability = document.createElement("code");
    probability.textContent = evidence.probabilities ? "π " + (evidence.probabilities[arm] * 100).toFixed(2) + "%" : "N " + state.counts[arm];
    row.append(name, estimate, score, probability);
    table.append(row);
  });
}

function render() {
  renderContext();
  renderAlgorithm();
  syncEditors();
  renderVisuals();
  renderMetrics();
  renderChart();
  renderDecision();
  updateRunButton();
}

function updateRange(input, output, suffix) {
  output.textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2) + (suffix || "");
}

strategySelect.addEventListener("change", render);
rewardSelect.addEventListener("change", () => resetStrategies("reset"));
dynamicsSelect.addEventListener("change", () => {
  setStatus("shifted");
  render();
});
compareToggle.addEventListener("change", render);
epsilonInput.addEventListener("input", () => {
  updateRange(epsilonInput, document.querySelector("#bandit-epsilon-output"));
  render();
});
temperatureInput.addEventListener("input", () => {
  updateRange(temperatureInput, document.querySelector("#bandit-temperature-output"));
  render();
});
preferenceAlphaInput.addEventListener("input", () => updateRange(preferenceAlphaInput, document.querySelector("#bandit-preference-output")));
initialQInput.addEventListener("input", () => updateRange(initialQInput, document.querySelector("#bandit-initial-output")));
initialQInput.addEventListener("change", () => resetStrategies("reset"));
speedInput.addEventListener("input", () => {
  updateRange(speedInput, document.querySelector("#bandit-speed-output"), "×");
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
