const BLACKJACK_ACTIONS = [
  { en: "hit", zh: "要牌", symbol: "H" },
  { en: "stick", zh: "停牌", symbol: "S" },
];

const blackjackAlgorithms = {
  prediction: {
    name: { en: "First-visit MC prediction", zh: "首次访问 MC 预测" },
    badge: "FIRST-VISIT MC",
    formula: "V(s) ← average of returns following the first visit to s",
    en: "A fixed policy hits below 20 and sticks on 20 or 21. After termination, only the first occurrence of each state receives its sampled return.",
    zh: "固定策略在点数低于 20 时要牌，在 20 或 21 时停牌；回合终止后，每个状态只有首次出现的位置接收采样回报。",
  },
  onpolicy: {
    name: { en: "On-policy MC control", zh: "同策略 MC 控制" },
    badge: "EPSILON-SOFT MC CONTROL",
    formula: "Q(s,a) ← average(G | first visit to (s,a));  π ← ε-greedy(Q)",
    en: "The same epsilon-soft policy generates hands and is improved from first-visit action returns. Exploration remains part of the policy being evaluated.",
    zh: "同一个 ε-soft 策略负责生成手牌并根据首次访问动作回报改进；探索始终属于正在被评价的策略。",
  },
  offpolicy: {
    name: { en: "Off-policy MC control", zh: "离策略 MC 控制" },
    badge: "WEIGHTED IMPORTANCE SAMPLING",
    formula: "C(s,a) ← C(s,a)+W;  Q ← Q + W/C · (G−Q);  W ← W/b(a|s)",
    en: "A uniform random behavior policy explores, while weighted importance sampling learns a greedy target policy. A backward update stops when behavior disagrees with the target.",
    zh: "均匀随机行为策略负责探索，加权重要性采样学习贪心目标策略；当行为动作与目标动作不一致时，反向更新立即停止。",
  },
};

const blackjackRules = {
  standard: { name: { en: "Infinite deck · dealer stands on soft 17", zh: "无限牌堆 · 庄家软 17 停牌" }, en: "Cards are sampled with replacement. The dealer hits below 17 and stands on every 17, including a usable-ace soft 17.", zh: "牌张采用放回抽样；庄家低于 17 时要牌，并在包括可用 A 组成的软 17 在内的所有 17 上停牌。" },
  soft17: { name: { en: "Infinite deck · dealer hits soft 17", zh: "无限牌堆 · 庄家软 17 要牌" }, en: "Cards are sampled with replacement. The dealer must hit a soft 17, slightly shifting the transition probabilities and player values.", zh: "牌张采用放回抽样；庄家必须在软 17 时继续要牌，这会轻微改变转移概率与玩家价值。" },
};

const blackjackText = {
  ready: { en: "Experiment ready.", zh: "实验已就绪。" }, running: { en: "Running decisions automatically.", zh: "正在自动执行决策。" }, paused: { en: "Experiment paused.", zh: "实验已暂停。" }, reset: { en: "Monte Carlo estimates reset.", zh: "Monte Carlo 估计已重置。" }, episode: { en: "Episode complete; sampled returns were applied.", zh: "回合已完成，采样回报已经更新。" }, run: { en: "Auto run", zh: "自动运行" }, pause: { en: "Pause", zh: "暂停" }, yes: { en: "yes", zh: "是" }, no: { en: "no", zh: "否" }, showing: { en: "showing", zh: "明牌" }, decisions: { en: "decisions", zh: "次决策" }, noUpdate: { en: "No completed return yet.", zh: "尚无完整采样回报。" }, experiment: { en: "Episodic Monte Carlo learning estimates values directly from complete Blackjack returns without bootstrapping.", zh: "回合型 Monte Carlo 学习直接使用完整 Blackjack 回报估计价值，不进行自举。" },
};

const ruleSelect = document.querySelector("#blackjack-rules");
const algorithmSelect = document.querySelector("#blackjack-algorithm");
const epsilonInput = document.querySelector("#blackjack-epsilon");
const gammaInput = document.querySelector("#blackjack-gamma");
const speedInput = document.querySelector("#blackjack-speed");
const stepButton = document.querySelector("#blackjack-step");
const episodeButton = document.querySelector("#blackjack-episode");
const runButton = document.querySelector("#blackjack-run");
const resetButton = document.querySelector("#blackjack-reset");
const batchButton = document.querySelector("#blackjack-batch");
const statusElement = document.querySelector("#blackjack-status");

let values;
let valueCounts;
let qValues;
let qCounts;
let cumulativeWeights;
let player;
let dealer;
let episode;
let episodes;
let wins;
let returnSum;
let lastUpdate;
let lastOutcome;
let history;
let runTimer = null;
let currentStatusKey = "ready";

function language() { return document.documentElement.lang === "zh-CN" ? "zh" : "en"; }
function epsilon() { return Number(epsilonInput.value); }
function gamma() { return Number(gammaInput.value); }
function drawCard() { return Math.min(10, Math.floor(Math.random() * 13) + 1); }

function handValue(hand) {
  let total = hand.reduce((sum, card) => sum + card, 0);
  const hasAce = hand.includes(1);
  const usable = hasAce && total + 10 <= 21;
  if (usable) total += 10;
  return { total, usable };
}

function stateFromHand() {
  const current = handValue(player);
  return { sum: current.total, dealer: dealer[0], usable: current.usable };
}

function stateKey(state) { return state.sum + "-" + state.dealer + "-" + (state.usable ? 1 : 0); }
function ensureQ(key) { if (!qValues[key]) qValues[key] = [0, 0]; if (!qCounts[key]) qCounts[key] = [0, 0]; if (!cumulativeWeights[key]) cumulativeWeights[key] = [0, 0]; }

function greedyAction(key, randomTie = true) {
  ensureQ(key);
  if (qValues[key][0] === qValues[key][1]) return randomTie && Math.random() < 0.5 ? 0 : 1;
  return qValues[key][0] > qValues[key][1] ? 0 : 1;
}

function chooseAction(state) {
  const key = stateKey(state);
  const algorithm = algorithmSelect.value;
  if (algorithm === "prediction") return { action: state.sum >= 20 ? 1 : 0, probability: 1 };
  if (algorithm === "offpolicy") return { action: Math.random() < 0.5 ? 0 : 1, probability: 0.5 };
  const greedy = greedyAction(key);
  const action = Math.random() < epsilon() ? (Math.random() < 0.5 ? 0 : 1) : greedy;
  const probability = epsilon() / 2 + (action === greedy ? 1 - epsilon() : 0);
  return { action, probability };
}

function startEpisode() {
  player = [drawCard(), drawCard()];
  while (handValue(player).total < 12) player.push(drawCard());
  dealer = [drawCard(), drawCard()];
  episode = [];
}

function resetExperiment(messageKey) {
  stopRun(false);
  values = {};
  valueCounts = {};
  qValues = {};
  qCounts = {};
  cumulativeWeights = {};
  episodes = 0;
  wins = 0;
  returnSum = 0;
  lastUpdate = null;
  lastOutcome = null;
  history = [];
  startEpisode();
  setStatus(messageKey || "ready");
  render();
}

function dealerPlay() {
  while (true) {
    const value = handValue(dealer);
    const hitsSoft17 = ruleSelect.value === "soft17" && value.total === 17 && value.usable;
    if (value.total < 17 || hitsSoft17) dealer.push(drawCard());
    else return value.total;
  }
}

function settleStick() {
  const playerTotal = handValue(player).total;
  const dealerTotal = dealerPlay();
  if (dealerTotal > 21 || playerTotal > dealerTotal) return 1;
  if (playerTotal < dealerTotal) return -1;
  return 0;
}

function applyReturns(reward) {
  let G = 0;
  const firstStateVisit = {};
  const firstActionVisit = {};
  episode.forEach((transition, index) => {
    const key = stateKey(transition.state);
    const pair = key + "-" + transition.action;
    if (firstStateVisit[key] === undefined) firstStateVisit[key] = index;
    if (firstActionVisit[pair] === undefined) firstActionVisit[pair] = index;
  });
  let weight = 1;
  for (let index = episode.length - 1; index >= 0; index -= 1) {
    const transition = episode[index];
    G = gamma() * G + (index === episode.length - 1 ? reward : 0);
    const key = stateKey(transition.state);
    if (algorithmSelect.value === "prediction") {
      if (firstStateVisit[key] !== index) continue;
      const old = values[key] || 0;
      valueCounts[key] = (valueCounts[key] || 0) + 1;
      values[key] = old + (G - old) / valueCounts[key];
      lastUpdate = { key, action: transition.action, G, weight: 1, old, next: values[key], kind: "V(s)" };
    } else if (algorithmSelect.value === "onpolicy") {
      const pair = key + "-" + transition.action;
      if (firstActionVisit[pair] !== index) continue;
      ensureQ(key);
      const old = qValues[key][transition.action];
      qCounts[key][transition.action] += 1;
      qValues[key][transition.action] += (G - old) / qCounts[key][transition.action];
      lastUpdate = { key, action: transition.action, G, weight: 1, old, next: qValues[key][transition.action], kind: "Q(s,a)" };
    } else {
      ensureQ(key);
      const old = qValues[key][transition.action];
      cumulativeWeights[key][transition.action] += weight;
      qValues[key][transition.action] += weight / cumulativeWeights[key][transition.action] * (G - old);
      lastUpdate = { key, action: transition.action, G, weight, old, next: qValues[key][transition.action], kind: "weighted Q" };
      if (transition.action !== greedyAction(key, false)) break;
      weight /= transition.probability;
    }
  }
}

function finishEpisode(reward, skipRender) {
  applyReturns(reward);
  episodes += 1;
  if (reward > 0) wins += 1;
  returnSum += reward;
  history.push(reward);
  if (history.length > 100) history.shift();
  lastOutcome = { reward, player: player.slice(), dealer: dealer.slice(), path: episode.slice() };
  startEpisode();
  setStatus("episode");
  if (!skipRender) render();
}

function performStep(skipRender) {
  const state = stateFromHand();
  const decision = chooseAction(state);
  episode.push({ state, action: decision.action, probability: decision.probability });
  if (decision.action === 0) {
    player.push(drawCard());
    if (handValue(player).total > 21) finishEpisode(-1, skipRender);
    else if (!skipRender) render();
  } else {
    finishEpisode(settleStick(), skipRender);
  }
}

function completeEpisode(skipRender) {
  const target = episodes + 1;
  let guard = 0;
  while (episodes < target && guard < 40) { performStep(true); guard += 1; }
  if (!skipRender) render();
}

function trainBatch() {
  stopRun(false);
  for (let index = 0; index < 500; index += 1) completeEpisode(true);
  setStatus("episode");
  render();
}

function setStatus(key) { currentStatusKey = key; statusElement.textContent = blackjackText[key][language()]; }
function updateRunButton() { runButton.textContent = blackjackText[runTimer ? "pause" : "run"][language()]; }
function startRun() { stopRun(false); runTimer = window.setInterval(() => performStep(false), Math.max(30, 760 - Number(speedInput.value) * 70)); setStatus("running"); updateRunButton(); }
function stopRun(announce) { if (runTimer) { window.clearInterval(runTimer); runTimer = null; } if (announce) setStatus("paused"); updateRunButton(); }
function restartRun() { if (runTimer) startRun(); }

function renderContext() {
  const lang = language();
  const rules = blackjackRules[ruleSelect.value];
  const algorithm = blackjackAlgorithms[algorithmSelect.value];
  document.querySelector("#context-experiment-copy").textContent = blackjackText.experiment[lang];
  document.querySelector("#context-environment-name").textContent = rules.name[lang];
  document.querySelector("#context-environment-copy").textContent = rules[lang];
  document.querySelector("#context-algorithm-name").textContent = algorithm.name[lang];
  document.querySelector("#context-algorithm-copy").textContent = algorithm[lang];
}

function renderHand(target, cards, hideHole) {
  const container = document.querySelector(target);
  container.replaceChildren();
  cards.forEach((card, index) => {
    const element = document.createElement("span");
    element.className = "playing-card";
    element.textContent = hideHole && index > 0 ? "?" : card === 1 ? "A" : String(card);
    container.append(element);
  });
}

function renderTable() {
  const lang = language();
  const state = stateFromHand();
  const decision = chooseAction(state).action;
  renderHand("#player-hand", player, false);
  renderHand("#dealer-hand", dealer, true);
  document.querySelector("#player-total").textContent = state.sum + (state.usable ? " · soft" : "");
  document.querySelector("#dealer-total").textContent = blackjackText.showing[lang] + " " + dealer[0];
  document.querySelector("#blackjack-player-sum").textContent = state.sum;
  document.querySelector("#blackjack-dealer-showing").textContent = dealer[0];
  document.querySelector("#blackjack-usable-ace").textContent = blackjackText[state.usable ? "yes" : "no"][lang];
  document.querySelector("#blackjack-next-action").textContent = BLACKJACK_ACTIONS[decision][lang];
  document.querySelector("#blackjack-action-mark").textContent = BLACKJACK_ACTIONS[decision].symbol;
  document.querySelector("#blackjack-episode-state").textContent = (lang === "zh" ? "回合 " : "episode ") + (episodes + 1);
  document.querySelector("#blackjack-environment-name").textContent = blackjackRules[ruleSelect.value].name[lang];
}

function visitedStateCount() { return new Set(Object.keys(values).concat(Object.keys(qValues))).size; }

function renderMetrics() {
  document.querySelector("#blackjack-episodes").textContent = episodes;
  document.querySelector("#blackjack-win-rate").textContent = (episodes ? wins / episodes * 100 : 0).toFixed(1) + "%";
  document.querySelector("#blackjack-average-return").textContent = (episodes ? returnSum / episodes : 0).toFixed(3);
  document.querySelector("#blackjack-visited-states").textContent = visitedStateCount();
}

function renderAlgorithm() {
  const detail = blackjackAlgorithms[algorithmSelect.value];
  document.querySelector("#blackjack-badge").textContent = detail.badge;
  document.querySelector("#blackjack-formula").textContent = detail.formula;
  document.querySelector("#blackjack-explanation").textContent = detail[language()];
  epsilonInput.disabled = algorithmSelect.value === "prediction";
}

function renderUpdate() {
  const lang = language();
  if (!lastUpdate) {
    document.querySelector("#blackjack-equation").textContent = blackjackText.noUpdate[lang];
    for (const suffix of ["state", "action", "return", "weight", "old", "new"]) document.querySelector("#blackjack-update-" + suffix).textContent = "—";
    return;
  }
  document.querySelector("#blackjack-update-kind").textContent = lastUpdate.kind;
  document.querySelector("#blackjack-equation").textContent = lastUpdate.kind + " ← " + lastUpdate.old.toFixed(4) + " + update(" + lastUpdate.G.toFixed(4) + " − " + lastUpdate.old.toFixed(4) + ") = " + lastUpdate.next.toFixed(4);
  document.querySelector("#blackjack-update-state").textContent = lastUpdate.key;
  document.querySelector("#blackjack-update-action").textContent = BLACKJACK_ACTIONS[lastUpdate.action][lang];
  document.querySelector("#blackjack-update-return").textContent = lastUpdate.G.toFixed(4);
  document.querySelector("#blackjack-update-weight").textContent = lastUpdate.weight.toFixed(4);
  document.querySelector("#blackjack-update-old").textContent = lastUpdate.old.toFixed(4);
  document.querySelector("#blackjack-update-new").textContent = lastUpdate.next.toFixed(4);
}

function mapValue(key) {
  if (algorithmSelect.value === "prediction") return { value: values[key] || 0, action: null };
  const estimates = qValues[key] || [0, 0];
  return { value: Math.max(...estimates), action: estimates[0] >= estimates[1] ? 0 : 1 };
}

function renderMap(target, usable) {
  const map = document.querySelector(target);
  map.replaceChildren();
  const corner = document.createElement("span"); corner.className = "blackjack-map-label"; corner.textContent = "Σ/A"; map.append(corner);
  for (let dealerCard = 1; dealerCard <= 10; dealerCard += 1) { const label = document.createElement("span"); label.className = "blackjack-map-label"; label.textContent = dealerCard === 1 ? "A" : dealerCard; map.append(label); }
  for (let sum = 21; sum >= 12; sum -= 1) {
    const rowLabel = document.createElement("span"); rowLabel.className = "blackjack-map-label"; rowLabel.textContent = sum; map.append(rowLabel);
    for (let dealerCard = 1; dealerCard <= 10; dealerCard += 1) {
      const key = sum + "-" + dealerCard + "-" + (usable ? 1 : 0);
      const result = mapValue(key);
      const cell = document.createElement("span");
      cell.className = "blackjack-map-cell";
      cell.style.setProperty("--blackjack-value", ((result.value + 1) / 2 * 100).toFixed(1) + "%");
      cell.textContent = result.action === null ? result.value.toFixed(2) : BLACKJACK_ACTIONS[result.action].symbol + " " + result.value.toFixed(2);
      cell.setAttribute("title", key + " · " + result.value.toFixed(4));
      map.append(cell);
    }
  }
}

function renderChart() {
  const line = document.querySelector("#blackjack-history-line");
  const points = history.map((reward, index) => (32 + index / Math.max(1, history.length - 1) * 658).toFixed(1) + "," + (85 - reward * 58).toFixed(1));
  line.setAttribute("points", points.join(" "));
}

function renderTrajectory() {
  const target = document.querySelector("#blackjack-trajectory");
  target.replaceChildren();
  const path = episode.length ? episode : lastOutcome?.path || [];
  if (!path.length) { const empty = document.createElement("p"); empty.className = "detail-empty"; empty.textContent = blackjackText.noUpdate[language()]; target.append(empty); }
  path.slice(-8).forEach((transition, index) => {
    const row = document.createElement("div"); row.className = "transition-entry";
    const number = document.createElement("span"); number.textContent = String(index + 1).padStart(2, "0");
    const state = document.createElement("strong"); state.textContent = stateKey(transition.state);
    const action = document.createElement("code"); action.textContent = BLACKJACK_ACTIONS[transition.action][language()] + " · b=" + transition.probability.toFixed(2);
    row.append(number, state, action); target.append(row);
  });
  document.querySelector("#blackjack-trajectory-count").textContent = path.length + " " + blackjackText.decisions[language()];
}

function render() {
  renderContext(); renderTable(); renderMetrics(); renderAlgorithm(); renderUpdate(); renderMap("#blackjack-map-hard", false); renderMap("#blackjack-map-soft", true); renderChart(); renderTrajectory(); updateRunButton();
}

function updateRange(input, output, suffix) { output.textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2) + (suffix || ""); }

ruleSelect.addEventListener("change", () => resetExperiment("reset"));
algorithmSelect.addEventListener("change", () => resetExperiment("reset"));
epsilonInput.addEventListener("input", () => updateRange(epsilonInput, document.querySelector("#blackjack-epsilon-output")));
gammaInput.addEventListener("input", () => updateRange(gammaInput, document.querySelector("#blackjack-gamma-output")));
speedInput.addEventListener("input", () => { updateRange(speedInput, document.querySelector("#blackjack-speed-output"), "×"); restartRun(); });
stepButton.addEventListener("click", () => performStep(false));
episodeButton.addEventListener("click", () => completeEpisode(false));
runButton.addEventListener("click", () => { if (runTimer) stopRun(true); else startRun(); });
resetButton.addEventListener("click", () => resetExperiment("reset"));
batchButton.addEventListener("click", trainBatch);
window.addEventListener("mindforge:language", () => { setStatus(currentStatusKey); render(); });

resetExperiment("ready");
