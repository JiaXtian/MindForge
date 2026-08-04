import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const pages = [
  "index.html",
  "notes.html",
  "note-template.html",
  "gridworld.html",
  "bandit.html",
  "404.html",
];

const removedPages = [
  "linear-algebra.html",
  "llm.html",
  "probability.html",
  "article.css",
  "scripts/check-content-parity.mjs",
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

const template = readFileSync("note-template.html", "utf8");
const englishSections = (template.match(/id="en-[^"]+"/g) || []).length;
const chineseSections = (template.match(/id="zh-[^"]+"/g) || []).length;
if (englishSections !== 6 || chineseSections !== 6) {
  errors.push(
    "Note template must contain 6 paired sections; found English " +
      englishSections +
      ", Chinese " +
      chineseSections,
  );
}

const gridworld = readFileSync("gridworld.html", "utf8");
for (const algorithm of ["value", "policy", "qlearning", "sarsa", "expected"]) {
  if (!gridworld.includes('value="' + algorithm + '"')) {
    errors.push("Gridworld is missing algorithm: " + algorithm);
  }
}
for (const environment of ["grid", "cliff", "windy", "maze"]) {
  if (!gridworld.includes('value="' + environment + '"')) {
    errors.push("Gridworld is missing environment: " + environment);
  }
}

const bandit = readFileSync("bandit.html", "utf8");
for (const strategy of ["epsilon", "ucb", "thompson"]) {
  if (!bandit.includes('value="' + strategy + '"')) {
    errors.push("Bandit lab is missing strategy: " + strategy);
  }
}

const publicFiles = [
  "index.html",
  "notes.html",
  "note-template.html",
  "gridworld.html",
  "bandit.html",
  "app.js",
  "README.md",
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

if (errors.length > 0) {
  console.error("MindForge site validation failed:");
  errors.forEach((error) => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log(
    "MindForge validation passed: 6 bilingual pages, 2 interactive labs, " +
      "5 Gridworld algorithms, 4 environments, 3 bandit strategies, and no legacy chapters.",
  );
}
