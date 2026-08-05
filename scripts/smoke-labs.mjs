import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.value = "";
    this.step = "";
    this.checked = false;
    this.disabled = false;
    this.textContent = "";
    this.dataset = {};
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this.style = { setProperty: (name, value) => { this.style[name] = value; } };
  }

  set className(value) {
    this._className = value;
    this.classList = new FakeClassList();
    value.split(/\s+/).filter(Boolean).forEach((name) => this.classList.add(name));
  }

  get className() {
    return this._className || "";
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  dispatch(type) {
    for (const listener of this.listeners.get(type) || []) listener({ target: this });
  }

  click() {
    this.dispatch("click");
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = [...children];
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }
}

function createHarness(defaults) {
  const elements = new Map();
  const windowListeners = new Map();
  let timerId = 0;

  const getElement = (selector) => {
    if (!elements.has(selector)) elements.set(selector, new FakeElement());
    return elements.get(selector);
  };

  for (const [selector, properties] of Object.entries(defaults)) {
    Object.assign(getElement(selector), properties);
  }

  const document = {
    documentElement: { lang: "en" },
    activeElement: null,
    querySelector: getElement,
    createElement: (tagName) => new FakeElement(tagName),
  };

  const window = {
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    dispatch(type) {
      for (const listener of windowListeners.get(type) || []) listener();
    },
    setInterval() {
      timerId += 1;
      return timerId;
    },
    clearInterval() {},
  };

  const context = vm.createContext({
    console,
    document,
    window,
    Math,
    Number,
    Object,
    Array,
    Set,
  });

  return { context, document, elements, window };
}

function runGridworldSmokeTest() {
  const harness = createHarness({
    "#environment-select": { value: "grid" },
    "#algorithm-select": { value: "value" },
    "#gamma-input": { value: "0.95", step: "0.01" },
    "#alpha-input": { value: "0.20", step: "0.01" },
    "#epsilon-input": { value: "0.10", step: "0.01" },
    "#planning-input": { value: "10", step: "1" },
    "#speed-input": { value: "5", step: "1" },
    "#edit-toggle": { checked: false },
  });

  vm.runInContext(readFileSync("gridworld.js", "utf8"), harness.context, {
    filename: "gridworld.js",
  });

  const get = (selector) => harness.elements.get(selector);
  assert.equal(get("#grid-board").children.length, 36, "classic grid should contain 36 cells");
  assert.equal(get("#alpha-input").disabled, true, "planning should disable the learning rate");

  get("#step-button").click();
  assert.equal(get("#metric-sweep").textContent, 1, "single step should run one Bellman sweep");

  get("#algorithm-select").value = "qlearning";
  get("#algorithm-select").dispatch("change");
  assert.equal(get("#alpha-input").disabled, false, "TD learning should enable the learning rate");
  get("#batch-button").click();
  assert.equal(get("#metric-episode").textContent, 50, "batch training should finish 50 episodes");

  get("#algorithm-select").value = "dyna";
  get("#algorithm-select").dispatch("change");
  get("#step-button").click();
  assert.equal(get("#metric-step").textContent, 1, "Dyna-Q should consume one real transition");
  assert.equal(get("#metric-sweep").textContent, 10, "Dyna-Q should perform configured model backups");
  assert.notEqual(get("#update-equation").textContent, "", "Dyna-Q should expose its numeric update");

  for (const [environment, cells] of [["cliff", 40], ["windy", 70], ["maze", 63], ["frozen", 36], ["fourrooms", 121], ["grid", 36]]) {
    get("#environment-select").value = environment;
    get("#environment-select").dispatch("change");
    assert.equal(get("#grid-board").children.length, cells, environment + " dimensions should match");
    if (environment === "frozen") {
      const outcomes = harness.context.transitionOutcomes(30, 0);
      const probability = outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
      assert.ok(outcomes.length > 1, "Frozen Lake should expose stochastic successors");
      assert.ok(Math.abs(probability - 1) < 1e-12, "Frozen Lake transition probabilities should sum to one");
      assert.ok(get("#context-environment-copy").textContent.includes("80%"), "environment switch should update Gridworld context");
    }
  }

  get("#algorithm-select").value = "double";
  get("#algorithm-select").dispatch("change");
  get("#step-button").click();
  assert.ok(["Qᴬ", "Qᴮ"].includes(get("#update-table").textContent), "Double Q-learning should identify the estimator it updated");
  assert.equal(get("#q-table-body").children.length, 36, "live Q-table should contain one row per grid state");

  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  assert.equal(get("#lab-status").textContent, "实验已就绪，可点击格子查看状态。", "Gridworld status should switch language");
  const startCell = get("#grid-board").children[30];
  const kindLabel = startCell.children.find((child) => child.classList.contains("cell-kind"));
  assert.equal(kindLabel.textContent, "起点", "generated cell labels should switch language");
}

function runBanditSmokeTest() {
  const harness = createHarness({
    "#strategy-select": { value: "epsilon" },
    "#reward-select": { value: "bernoulli" },
    "#bandit-dynamics": { value: "stationary" },
    "#bandit-epsilon": { value: "0.10", step: "0.01" },
    "#bandit-temperature": { value: "0.20", step: "0.01" },
    "#bandit-preference-alpha": { value: "0.10", step: "0.01" },
    "#bandit-initial-q": { value: "0", step: "0.05" },
    "#bandit-speed": { value: "5", step: "1" },
    "#compare-toggle": { checked: false },
  });

  vm.runInContext(readFileSync("bandit.js", "utf8"), harness.context, {
    filename: "bandit.js",
  });

  const get = (selector) => harness.elements.get(selector);
  assert.equal(get("#arm-editor-list").children.length, 5, "bandit should expose five editable arms");
  assert.equal(get("#arm-visuals").children.length, 5, "bandit should render five arm estimates");

  get("#bandit-batch").click();
  assert.equal(get("#metric-pulls").textContent, 500, "batch run should perform 500 pulls");

  get("#bandit-reset").click();
  get("#compare-toggle").checked = true;
  get("#compare-toggle").dispatch("change");
  get("#bandit-batch").click();
  assert.ok(get("#regret-epsilon").getAttribute("points"), "epsilon-greedy should produce a regret curve");
  assert.ok(get("#regret-ucb").getAttribute("points"), "UCB1 should produce a regret curve");
  assert.ok(get("#regret-thompson").getAttribute("points"), "Thompson sampling should produce a regret curve");
  assert.ok(get("#regret-softmax").getAttribute("points"), "Softmax should produce a regret curve");
  assert.ok(get("#regret-gradient").getAttribute("points"), "Gradient Bandit should produce a regret curve");
  assert.equal(get("#bandit-score-table").children.length, 5, "decision evidence should include every arm");

  get("#strategy-select").value = "gradient";
  get("#strategy-select").dispatch("change");
  assert.ok(get("#bandit-decision-equation").textContent.startsWith("Hnew"), "Gradient Bandit should expose its preference update");
  get("#reward-select").value = "gaussian";
  get("#reward-select").dispatch("change");
  get("#bandit-dynamics").value = "drift";
  get("#bandit-dynamics").dispatch("change");
  assert.ok(get("#context-environment-name").textContent.includes("Gaussian"), "reward model should update Bandit context");
  assert.ok(get("#context-environment-name").textContent.includes("drifting"), "reward dynamics should update Bandit context");

  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  const firstArmName = get("#arm-editor-list").children[0].children[0].children[0];
  assert.equal(firstArmName.textContent, "臂 1", "generated arm labels should switch language");
  assert.equal(get("#bandit-status").textContent, "奖励环境已改变，算法需要重新适应。", "Bandit status should switch language");
}

function runPredictionSmokeTest() {
  const harness = createHarness({
    "#chain-select": { value: "9" },
    "#prediction-algorithm": { value: "td0" },
    "#prediction-alpha": { value: "0.15", step: "0.01" },
    "#prediction-gamma": { value: "1", step: "0.01" },
    "#n-step-input": { value: "4", step: "1" },
    "#lambda-input": { value: "0.80", step: "0.01" },
    "#prediction-speed": { value: "6", step: "1" },
  });

  vm.runInContext(readFileSync("prediction.js", "utf8"), harness.context, {
    filename: "prediction.js",
  });

  const get = (selector) => harness.elements.get(selector);
  assert.equal(get("#random-walk-track").children.length, 11, "nine-state walk should include two terminals");
  get("#prediction-step").click();
  assert.equal(get("#prediction-steps").textContent, 1, "single transition should advance the walk once");
  assert.notEqual(get("#prediction-equation").textContent, "", "TD(0) should expose an immediate update");
  get("#prediction-episode").click();
  assert.equal(get("#prediction-episodes").textContent, 1, "complete episode should reach a terminal state");
  get("#prediction-batch").click();
  assert.equal(get("#prediction-episodes").textContent, 101, "prediction batch should train 100 episodes");
  assert.ok(get("#prediction-error-line").getAttribute("points"), "prediction should produce an RMSE curve");

  get("#prediction-algorithm").value = "mc";
  get("#prediction-algorithm").dispatch("change");
  get("#prediction-episode").click();
  assert.equal(get("#prediction-update-kind").textContent, "MC return", "Monte Carlo should update from a completed return");

  get("#prediction-algorithm").value = "nstep";
  get("#prediction-algorithm").dispatch("change");
  get("#chain-select").value = "19";
  get("#chain-select").dispatch("change");
  assert.ok(get("#context-environment-name").textContent.startsWith("19-state"), "chain length should update prediction context");
  assert.equal(get("#context-algorithm-name").textContent, "n-step TD", "algorithm switch should update prediction context");
  get("#prediction-episode").click();
  assert.ok(get("#prediction-update-kind").textContent.includes("step TD"), "n-step TD should expose its backup horizon");

  get("#prediction-algorithm").value = "lambda";
  get("#prediction-algorithm").dispatch("change");
  get("#prediction-step").click();
  assert.equal(get("#eligibility-view").children.length, 19, "TD lambda should expose one trace per state");
  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  assert.equal(get("#prediction-status").textContent, "价值预测已重置。", "Prediction status should switch language");
  assert.ok(get("#prediction-explanation").textContent.includes("资格迹"), "Prediction explanation should switch language");
}

function runMountainCarSmokeTest() {
  const harness = createHarness({
    "#mountain-algorithm": { value: "qlearning" },
    "#position-bins": { value: "18" },
    "#velocity-bins": { value: "14" },
    "#mountain-alpha": { value: "0.32", step: "0.01" },
    "#mountain-gamma": { value: "0.99", step: "0.01" },
    "#mountain-epsilon": { value: "0.10", step: "0.01" },
    "#mountain-lambda": { value: "0.85", step: "0.01" },
    "#mountain-speed": { value: "7", step: "1" },
  });

  vm.runInContext(readFileSync("mountain-car.js", "utf8"), harness.context, {
    filename: "mountain-car.js",
  });

  const get = (selector) => harness.elements.get(selector);
  assert.equal(get("#mountain-q-map").children.length, 252, "default discretization should contain 18 x 14 states");
  get("#mountain-step").click();
  assert.equal(get("#mountain-steps").textContent, 1, "single control step should advance the dynamics");
  assert.notEqual(get("#mountain-equation").textContent, "", "Mountain Car should expose its Q update");
  get("#mountain-episode").click();
  assert.equal(get("#mountain-episodes").textContent, 1, "complete episode should reach the goal or truncation");
  get("#mountain-batch").click();
  assert.equal(get("#mountain-episodes").textContent, 51, "Mountain Car batch should train 50 episodes");
  assert.ok(get("#mountain-history-line").getAttribute("points"), "Mountain Car should produce an episode-length curve");

  get("#position-bins").value = "12";
  get("#position-bins").dispatch("change");
  get("#velocity-bins").value = "10";
  get("#velocity-bins").dispatch("change");
  assert.equal(get("#mountain-q-map").children.length, 120, "changed discretization should rebuild the Q map");
  assert.ok(get("#context-environment-name").textContent.includes("12×10"), "discretization should update Mountain Car context");

  get("#mountain-algorithm").value = "lambda";
  get("#mountain-algorithm").dispatch("change");
  assert.equal(get("#context-algorithm-name").textContent, "SARSA(λ)", "algorithm switch should update Mountain Car context");
  get("#mountain-step").click();
  assert.equal(get("#mountain-update-kind").textContent, "Q + eligibility trace", "SARSA lambda should expose trace-based updates");
  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  assert.equal(get("#mountain-status").textContent, "控制价值已重置。", "Mountain Car status should switch language");
  assert.ok(["向左加速", "不加速", "向右加速"].includes(get("#mountain-action-label").textContent), "Mountain Car action should switch language");
}

function runBlackjackSmokeTest() {
  const harness = createHarness({
    "#blackjack-rules": { value: "standard" },
    "#blackjack-algorithm": { value: "prediction" },
    "#blackjack-epsilon": { value: "0.10", step: "0.01" },
    "#blackjack-gamma": { value: "1", step: "0.01" },
    "#blackjack-speed": { value: "7", step: "1" },
  });

  vm.runInContext(readFileSync("blackjack.js", "utf8"), harness.context, {
    filename: "blackjack.js",
  });

  const get = (selector) => harness.elements.get(selector);
  assert.equal(get("#blackjack-map-hard").children.length, 121, "hard-hand map should include labels and 100 states");
  assert.equal(get("#blackjack-map-soft").children.length, 121, "usable-ace map should include labels and 100 states");
  assert.equal(get("#blackjack-visited-states").textContent, 0, "rendering the map must not mark unvisited states as sampled");
  get("#blackjack-step").click();
  assert.ok(get("#blackjack-trajectory").children.length > 0, "single decision should appear in the trajectory");
  const episodesAfterStep = Number(get("#blackjack-episodes").textContent);
  get("#blackjack-episode").click();
  assert.equal(get("#blackjack-episodes").textContent, episodesAfterStep + 1, "complete hand should produce one additional Monte Carlo episode");
  assert.notEqual(get("#blackjack-equation").textContent, "", "completed hand should expose a return update");
  get("#blackjack-batch").click();
  assert.equal(get("#blackjack-episodes").textContent, episodesAfterStep + 501, "Blackjack batch should train 500 additional episodes");

  get("#blackjack-algorithm").value = "offpolicy";
  get("#blackjack-algorithm").dispatch("change");
  assert.equal(get("#blackjack-visited-states").textContent, 0, "control-policy map rendering must not create artificial visits");
  get("#blackjack-episode").click();
  assert.notEqual(get("#blackjack-update-weight").textContent, "—", "off-policy MC should expose an importance weight");
  get("#blackjack-rules").value = "soft17";
  get("#blackjack-rules").dispatch("change");
  assert.ok(get("#context-environment-name").textContent.includes("soft 17"), "rule change should update environment context");

  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  assert.equal(get("#blackjack-status").textContent, "Monte Carlo 估计已重置。", "Blackjack status should switch language");
  assert.ok(get("#context-algorithm-copy").textContent.includes("重要性采样"), "Blackjack algorithm context should switch language");
}

function runCartPoleSmokeTest() {
  const harness = createHarness({
    "#cartpole-environment": { value: "standard" },
    "#cartpole-algorithm": { value: "qlearning" },
    "#cartpole-resolution": { value: "medium" },
    "#cartpole-alpha": { value: "0.22", step: "0.01" },
    "#cartpole-gamma": { value: "0.99", step: "0.01" },
    "#cartpole-epsilon": { value: "0.10", step: "0.01" },
    "#cartpole-speed": { value: "7", step: "1" },
  });

  vm.runInContext(readFileSync("cartpole.js", "utf8"), harness.context, {
    filename: "cartpole.js",
  });

  const get = (selector) => harness.elements.get(selector);
  assert.equal(get("#cartpole-q-map").children.length, 100, "medium CartPole slice should contain 10 x 10 states");
  get("#cartpole-step").click();
  assert.equal(get("#cartpole-steps").textContent, 1, "single control step should advance CartPole dynamics");
  assert.notEqual(get("#cartpole-equation").textContent, "", "CartPole should expose its TD update");
  get("#cartpole-episode").click();
  assert.equal(get("#cartpole-episodes").textContent, 1, "complete CartPole episode should reach failure or 500 steps");
  get("#cartpole-batch").click();
  assert.equal(get("#cartpole-episodes").textContent, 51, "CartPole batch should train 50 episodes");
  assert.ok(get("#cartpole-history-line").getAttribute("points"), "CartPole should produce an episode-length curve");

  get("#cartpole-resolution").value = "coarse";
  get("#cartpole-resolution").dispatch("change");
  assert.equal(get("#cartpole-q-map").children.length, 64, "coarse CartPole slice should contain 8 x 8 states");
  get("#cartpole-algorithm").value = "double";
  get("#cartpole-algorithm").dispatch("change");
  get("#cartpole-step").click();
  assert.ok(["Qᴬ", "Qᴮ"].includes(get("#cartpole-update-kind").textContent), "Double Q-learning should expose the updated estimator");
  get("#cartpole-environment").value = "gravity";
  get("#cartpole-environment").dispatch("change");
  assert.equal(get("#context-environment-name").textContent, "Strong-gravity CartPole", "environment switch should update context");

  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  assert.equal(get("#cartpole-status").textContent, "控制价值已重置。", "CartPole status should switch language");
  assert.ok(get("#context-environment-copy").textContent.includes("重力"), "CartPole environment context should switch language");
}

runGridworldSmokeTest();
runBanditSmokeTest();
runPredictionSmokeTest();
runMountainCarSmokeTest();
runBlackjackSmokeTest();
runCartPoleSmokeTest();
console.log("RL lab smoke tests passed: six labs, batch learning, detail views, charts, presets, dynamic context, and bilingual labels.");
