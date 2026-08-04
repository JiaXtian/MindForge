import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const pages = [
  "index.html",
  "gridworld.html",
  "bandit.html",
  "prediction.html",
  "mountain-car.html",
  "404.html",
];

const removedPages = [
  "linear-algebra.html",
  "llm.html",
  "probability.html",
  "article.css",
  "scripts/check-content-parity.mjs",
  "notes.html",
  "note-template.html",
];

const errors = [];
const appScript = readFileSync("app.js", "utf8");
const translationBlock = appScript.match(/zh:\s*\{([\s\S]*?)\n\s*\}\n\};/);
const translationKeys = new Set(
  translationBlock
    ? [...translationBlock[1].matchAll(/^\s{4}([A-Za-z0-9]+):/gm)].map((match) => match[1])
    : [],
);

if (!translationBlock) errors.push("Could not read the Chinese translation dictionary from app.js");

for (const file of removedPages) {
  if (existsSync(file)) errors.push("Legacy file still exists: " + file);
}

for (const file of pages) {
  if (!existsSync(file)) {
    errors.push("Missing page: " + file);
    continue;
  }

  const html = readFileSync(file, "utf8");
  for (const required of ['id="theme-toggle"', 'id="language-toggle"', 'src="app.js"']) {
    if (!html.includes(required)) errors.push(file + " is missing " + required);
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|data:|#)/.test(target)) continue;
    const path = target.split("#")[0].split("?")[0];
    if (path && !existsSync(resolve(dirname(file), path))) {
      errors.push(file + " links to missing local file: " + target);
    }
  }

  for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) {
    if (!translationKeys.has(match[1])) {
      errors.push(file + " uses a missing Chinese translation key: " + match[1]);
    }
  }
}

const template = readFileSync("NOTE_TEMPLATE.md", "utf8");
const englishTemplate = template.split("## English")[1]?.split("## 中文")[0] || "";
const chineseTemplate = template.split("## 中文")[1] || "";
const englishSections = (englishTemplate.match(/^### [1-6]\. /gm) || []).length;
const chineseSections = (chineseTemplate.match(/^### [1-6]\. /gm) || []).length;
if (englishSections !== 6 || chineseSections !== 6) {
  errors.push(
    "Note template must contain 6 paired sections; found English " +
      englishSections +
      ", Chinese " +
      chineseSections,
  );
}

const gridworld = readFileSync("gridworld.html", "utf8");
for (const algorithm of ["value", "policy", "qlearning", "sarsa", "expected", "dyna", "double"]) {
  if (!gridworld.includes('value="' + algorithm + '"')) {
    errors.push("Gridworld is missing algorithm: " + algorithm);
  }
}
for (const environment of ["grid", "cliff", "windy", "maze", "frozen", "fourrooms"]) {
  if (!gridworld.includes('value="' + environment + '"')) {
    errors.push("Gridworld is missing environment: " + environment);
  }
}

const bandit = readFileSync("bandit.html", "utf8");
for (const strategy of ["epsilon", "ucb", "thompson", "softmax", "gradient"]) {
  if (!bandit.includes('value="' + strategy + '"')) {
    errors.push("Bandit lab is missing strategy: " + strategy);
  }
}

const prediction = readFileSync("prediction.html", "utf8");
for (const algorithm of ["mc", "td0", "nstep", "lambda"]) {
  if (!prediction.includes('value="' + algorithm + '"')) {
    errors.push("Prediction lab is missing algorithm: " + algorithm);
  }
}

const mountainCar = readFileSync("mountain-car.html", "utf8");
for (const algorithm of ["qlearning", "sarsa", "expected", "lambda"]) {
  if (!mountainCar.includes('value="' + algorithm + '"')) {
    errors.push("Mountain Car is missing algorithm: " + algorithm);
  }
}

const home = readFileSync("index.html", "utf8");
const homeLabCards = (
  home.match(/<a class="module-card[^\"]*" href="(?:gridworld|bandit|prediction|mountain-car)\.html">/g) || []
).length;
if (homeLabCards !== 4) {
  errors.push("Home page must expose exactly four laboratory cards; found " + homeLabCards);
}
for (const lab of ["gridworld", "bandit", "prediction", "mountain-car"]) {
  if (!home.includes('href="' + lab + '.html"')) {
    errors.push("Home page is missing direct access to " + lab + ".html");
  }
}
for (const removedLink of ["notes.html", "note-template.html"]) {
  if (home.includes(removedLink)) errors.push("Home page still references " + removedLink);
}

for (const [name, html] of [
  ["gridworld.html", gridworld],
  ["bandit.html", bandit],
  ["prediction.html", prediction],
  ["mountain-car.html", mountainCar],
]) {
  if (html.includes("guided-experiments") || html.includes("guidedExperimentsTitle")) {
    errors.push(name + " still contains the guided experiments section");
  }
  if (/data-i18n="(?:grid|bandit|prediction|mountain)Hero(?:Title|Deck)"/.test(html)) {
    errors.push(name + " still contains the removed promotional hero copy");
  }
}

for (const requiredDetail of ["q-table-body", "transition-log", "update-equation"]) {
  if (!gridworld.includes('id="' + requiredDetail + '"')) {
    errors.push("Gridworld is missing detail visualization: " + requiredDetail);
  }
}

const publicFiles = [
  "index.html",
  "gridworld.html",
  "bandit.html",
  "prediction.html",
  "mountain-car.html",
  "app.js",
  "README.md",
  "README.zh-CN.md",
  "NOTE_TEMPLATE.md",
  "sitemap.xml",
];
const forbiddenLegacyLinks = [
  "linear-algebra.html",
  "llm.html",
  "probability.html",
];
for (const file of publicFiles) {
  const content = readFileSync(file, "utf8");
  for (const legacy of forbiddenLegacyLinks) {
    if (content.includes(legacy)) errors.push(file + " still references " + legacy);
  }
}

const englishReadme = readFileSync("README.md", "utf8");
const chineseReadme = readFileSync("README.zh-CN.md", "utf8");
if (!englishReadme.includes("[简体中文](README.zh-CN.md)")) {
  errors.push("README.md is missing the Chinese language switch link");
}
if (!chineseReadme.includes("[English](README.md)")) {
  errors.push("README.zh-CN.md is missing the English language switch link");
}

const englishHeadings = (englishReadme.match(/^## /gm) || []).length;
const chineseHeadings = (chineseReadme.match(/^## /gm) || []).length;
if (englishHeadings !== chineseHeadings) {
  errors.push(
    "README language editions must have matching section counts; found English " +
      englishHeadings +
      ", Chinese " +
      chineseHeadings,
  );
}

if (errors.length > 0) {
  console.error("MindForge site validation failed:");
  errors.forEach((error) => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log(
    "MindForge validation passed: 6 bilingual pages, 4 interactive labs, " +
      "7 Gridworld algorithms, 6 environments, 5 bandit strategies, 4 prediction methods, " +
      "4 Mountain Car controllers, and no legacy chapters.",
  );
}
