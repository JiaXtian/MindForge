import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../linear-algebra.html", import.meta.url), "utf8");

function extractBetween(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);

  if (start === -1 || end === -1) {
    throw new Error(`Could not locate content boundary: ${startMarker}`);
  }

  return html.slice(start + startMarker.length, end);
}

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

function summarize(content, language) {
  return {
    sections: countMatches(content, /<section\b/g),
    h2: countMatches(content, /<h2\b/g),
    h3: countMatches(content, /<h3\b/g),
    paragraphs: countMatches(content, /<p\b/g),
    tables: countMatches(content, /<table\b/g),
    tableRows: countMatches(content, /<tr\b/g),
    equations: countMatches(content, /class="equation"/g),
    sectionIds: [...content.matchAll(new RegExp(`id="${language}-(\\d+)"`, "g"))].map(
      (match) => Number(match[1]),
    ),
  };
}

const english = extractBetween(
  '<div data-lang-content="en">',
  '<div data-lang-content="zh" hidden>',
);
const chinese = extractBetween('<div data-lang-content="zh" hidden>', "</article>");
const en = summarize(english, "en");
const zh = summarize(chinese, "zh");
const expectedSections = Array.from({ length: 11 }, (_, index) => index + 1);

const englishWords = countMatches(
  english.replace(/<[^>]+>/g, " "),
  /[A-Za-z]+(?:[-'][A-Za-z]+)*/g,
);
const chineseCharacters = countMatches(chinese.replace(/<[^>]+>/g, " "), /[\u4e00-\u9fff]/g);
const errors = [];

for (const key of ["sections", "h2", "h3", "paragraphs", "tables", "tableRows", "equations"]) {
  if (en[key] !== zh[key]) {
    errors.push(`${key}: English ${en[key]}, Chinese ${zh[key]}`);
  }
}

if (JSON.stringify(en.sectionIds) !== JSON.stringify(expectedSections)) {
  errors.push(`English section IDs: ${en.sectionIds.join(", ")}`);
}

if (JSON.stringify(zh.sectionIds) !== JSON.stringify(expectedSections)) {
  errors.push(`Chinese section IDs: ${zh.sectionIds.join(", ")}`);
}

if (englishWords < 9000) {
  errors.push(`English edition is too short: ${englishWords} words (minimum 9000)`);
}

if (chineseCharacters < 15000) {
  errors.push(`Chinese edition is too short: ${chineseCharacters} characters (minimum 15000)`);
}

if (errors.length > 0) {
  console.error("Bilingual content parity check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Bilingual content parity passed: 11 sections, ${en.h3} subsections, ` +
      `${en.paragraphs} paragraphs, ${englishWords} English words, ` +
      `${chineseCharacters} Chinese characters.`,
  );
}
