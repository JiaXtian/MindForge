import { readFileSync } from "node:fs";

const articles = [
  {
    file: "linear-algebra.html",
    label: "Linear Algebra for Machine Learning",
    sections: 11,
    minEnglishWords: 9000,
    minChineseCharacters: 15000,
  },
  {
    file: "llm.html",
    label: "Large Language Models Explained",
    sections: 12,
    minEnglishWords: 6500,
    minChineseCharacters: 12000,
  },
  {
    file: "probability.html",
    label: "Probability Theory for Machine Learning",
    sections: 12,
    minEnglishWords: 7300,
    minChineseCharacters: 12000,
  },
];

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

function extractBetween(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);

  if (start === -1 || end === -1) {
    throw new Error(`Could not locate content boundary: ${startMarker}`);
  }

  return html.slice(start + startMarker.length, end);
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

function validateArticle(article) {
  const html = readFileSync(new URL(`../${article.file}`, import.meta.url), "utf8");
  const english = extractBetween(html, '<div data-lang-content="en">', '<div data-lang-content="zh" hidden>');
  const chinese = extractBetween(html, '<div data-lang-content="zh" hidden>', "</article>");
  const en = summarize(english, "en");
  const zh = summarize(chinese, "zh");
  const expectedSections = Array.from({ length: article.sections }, (_, index) => index + 1);
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

  if (englishWords < article.minEnglishWords) {
    errors.push(
      `English edition is too short: ${englishWords} words (minimum ${article.minEnglishWords})`,
    );
  }

  if (chineseCharacters < article.minChineseCharacters) {
    errors.push(
      `Chinese edition is too short: ${chineseCharacters} characters ` +
        `(minimum ${article.minChineseCharacters})`,
    );
  }

  return { article, chineseCharacters, en, englishWords, errors };
}

const results = articles.map(validateArticle);
const failures = results.filter((result) => result.errors.length > 0);

if (failures.length > 0) {
  console.error("Bilingual content parity check failed:");
  for (const result of failures) {
    console.error(`\n${result.article.label} (${result.article.file})`);
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
  }
  process.exitCode = 1;
} else {
  for (const result of results) {
    console.log(
      `${result.article.label}: ${result.article.sections} sections, ` +
        `${result.en.h3} subsections, ${result.en.paragraphs} paragraphs, ` +
        `${result.englishWords} English words, ${result.chineseCharacters} Chinese characters.`,
    );
  }
  console.log("Bilingual content parity passed for all articles.");
}
