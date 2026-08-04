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
    "#speed-input": { value: "5", step: "1" },
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

  for (const [environment, cells] of [["cliff", 40], ["windy", 70], ["maze", 63], ["grid", 36]]) {
    get("#environment-select").value = environment;
    get("#environment-select").dispatch("change");
    assert.equal(get("#grid-board").children.length, cells, environment + " dimensions should match");
  }

  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  assert.equal(get("#lab-status").textContent, "实验已就绪。", "Gridworld status should switch language");
  const startCell = get("#grid-board").children[30];
  const kindLabel = startCell.children.find((child) => child.classList.contains("cell-kind"));
  assert.equal(kindLabel.textContent, "起点", "generated cell labels should switch language");
}

function runBanditSmokeTest() {
  const harness = createHarness({
    "#strategy-select": { value: "epsilon" },
    "#reward-select": { value: "bernoulli" },
    "#bandit-epsilon": { value: "0.10", step: "0.01" },
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

  harness.document.documentElement.lang = "zh-CN";
  harness.window.dispatch("mindforge:language");
  const firstArmName = get("#arm-editor-list").children[0].children[0].children[0];
  assert.equal(firstArmName.textContent, "臂 1", "generated arm labels should switch language");
  assert.equal(get("#bandit-status").textContent, "实验已重置。", "Bandit status should switch language");
}

runGridworldSmokeTest();
runBanditSmokeTest();
console.log("RL lab smoke tests passed: controls, batches, presets, charts, and dynamic bilingual labels.");
