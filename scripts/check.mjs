// Repo consistency checks (PLAN.md §4).
//
//   node scripts/check.mjs              check, then write app/public/status.json and the README status block
//   node scripts/check.mjs --no-write   check only
//   node scripts/check.mjs --root DIR   run against another copy of the repo
//
// Exits 1 if there are errors. Warnings are printed but don't fail the check.
// Nothing is written when there are errors.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { parse as parseBib } from "@retorquere/bibtex-parser";

const args = process.argv.slice(2);
const write = !args.includes("--no-write");
const rootArg = args.indexOf("--root");
const root = rootArg >= 0 ? resolve(args[rootArg + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------
// Schema (PLAN.md §3.2–§3.5)
// ---------------------------------------------------------------------

const READING_STATUS = ["to-read", "skimmed", "summarised", "verified"];
const SUMMARISED_BY = ["claude", "julia"];
const DECISION_STATUS = ["open", "exploring", "decided"];
const DECISION_GROUPS = ["system", "detector", "metrics", "ci-cd", "reporting", "validation", "governance"];
const SECTIONS = ["abstract", "introduction", "background", "related-work", "methodology", "deliverable", "analysis", "conclusion"];
const TAG_FIELDS = ["id", "label", "group", "bg"];
const TAG_FG = "#1F1B1E";
// Pastels the app gives to tags added later (PLAN.md §3.3); they must pass contrast too.
const SPARE_PALETTE = ["#F3E5FC", "#E3F4F8", "#FDEBD5", "#E8EEFC", "#FCE7E2", "#E5F5E0"];
const READINGS_TARGET = 30;
const DEADLINES = [
  { label: "interim report", date: "2026-11-06" },
  { label: "final report and video", date: "2027-04-07" },
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isString = (v) => typeof v === "string";
const isStringList = (v) => Array.isArray(v) && v.every(isString);

const READING_FIELDS = {
  key: isString,
  title: isString,
  authors: isStringList,
  year: (v) => v === null || Number.isInteger(v),
  venue: isString,
  doi: isString,
  url: isString,
  stars: (v) => Number.isInteger(v) && v >= 0 && v <= 5,
  status: (v) => READING_STATUS.includes(v),
  tags: isStringList,
  sections: isStringList,
  decisions: isStringList,
  summarised_by: (v) => SUMMARISED_BY.includes(v),
  verified: (v) => typeof v === "boolean",
  added: (v) => isString(v) && DATE_RE.test(v),
  found_via: isString,
};
const READING_HINTS = {
  authors: 'a list of names, e.g. ["Nangia, N.", "Vania, C."]',
  year: "a whole number, or empty",
  stars: "a whole number from 0 to 5",
  status: READING_STATUS.join(" | "),
  tags: "a list of tag IDs",
  sections: "a list of section IDs",
  decisions: "a list of decision IDs",
  summarised_by: SUMMARISED_BY.join(" | "),
  verified: "true or false",
  added: "a date, YYYY-MM-DD",
};

const DECISION_FIELDS = {
  id: isString,
  title: isString,
  group: (v) => DECISION_GROUPS.includes(v),
  status: (v) => DECISION_STATUS.includes(v),
  decided_on: (v) => v === null || (isString(v) && DATE_RE.test(v)),
  readings: isStringList,
};
const DECISION_HINTS = {
  group: DECISION_GROUPS.join(" | "),
  status: DECISION_STATUS.join(" | "),
  decided_on: "a date, YYYY-MM-DD, or empty",
  readings: "a list of citekeys",
};

// ---------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------

const errors = [];
const warnings = [];
const error = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

const read = (rel) => readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n");

const mdFiles = (dir) =>
  existsSync(join(root, dir))
    ? readdirSync(join(root, dir)).filter((f) => f.endsWith(".md") && !f.startsWith("_")).sort()
    : [];

// Splits "---\n<yaml>\n---\n<body>". Returns null front matter if there is none or it doesn't parse.
function frontMatter(rel) {
  const text = read(rel);
  const m = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!m) {
    error(rel, "no front matter (the file must start with a --- block)");
    return null;
  }
  try {
    const data = parseYaml(m[1]);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      error(rel, "front matter is not a set of fields");
      return null;
    }
    return data;
  } catch (e) {
    error(rel, `front matter is not valid YAML: ${e.message.split("\n")[0]}`);
    return null;
  }
}

function validateFields(rel, data, fields, hints) {
  for (const k of Object.keys(data)) {
    if (!(k in fields)) error(rel, `unknown field "${k}" (allowed: ${Object.keys(fields).join(", ")})`);
  }
  for (const [k, ok] of Object.entries(fields)) {
    if (!(k in data)) error(rel, `missing field "${k}"`);
    else if (!ok(data[k])) error(rel, `"${k}" is ${JSON.stringify(data[k])}, expected ${hints[k] ?? "text"}`);
  }
}

// WCAG 2 contrast ratio between two #RRGGBB colours.
function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const count = (keys) => Object.fromEntries(keys.map((k) => [k, 0]));

// ---------------------------------------------------------------------
// 1. Tags (and contrast, §3.3)
// ---------------------------------------------------------------------

let tags = [];
try {
  tags = parseYaml(read("tags.yml")) ?? [];
  if (!Array.isArray(tags)) {
    error("tags.yml", "must be a list of tags");
    tags = [];
  }
} catch (e) {
  error("tags.yml", `not valid YAML: ${e.message.split("\n")[0]}`);
}
const tagIds = new Set();
for (const [i, t] of tags.entries()) {
  const where = `tags.yml (tag ${i + 1}${t?.id ? `, "${t.id}"` : ""})`;
  if (!t || typeof t !== "object") {
    error(where, "must have id, label, group and bg");
    continue;
  }
  for (const k of Object.keys(t)) if (!TAG_FIELDS.includes(k)) error(where, `unknown field "${k}" (allowed: ${TAG_FIELDS.join(", ")})`);
  for (const k of TAG_FIELDS) if (!isString(t[k]) || !t[k]) error(where, `missing "${k}"`);
  if (isString(t.id)) {
    if (tagIds.has(t.id)) error(where, `duplicate tag id "${t.id}"`);
    tagIds.add(t.id);
  }
  if (isString(t.bg)) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(t.bg)) error(where, `bg "${t.bg}" must be a colour like "#ECE6FB"`);
    else {
      const ratio = contrast(t.bg, TAG_FG);
      if (ratio < 4.5) error(where, `black text on ${t.bg} has contrast ${ratio.toFixed(2)}:1, below WCAG AA (4.5:1); pick a lighter pastel`);
    }
  }
}
for (const bg of SPARE_PALETTE) {
  const ratio = contrast(bg, TAG_FG);
  if (ratio < 4.5) error("scripts/check.mjs", `spare palette colour ${bg} has contrast ${ratio.toFixed(2)}:1 with black text, below WCAG AA`);
}

// ---------------------------------------------------------------------
// 2. Decisions
// ---------------------------------------------------------------------

const decisions = new Map(); // id -> { rel, data }
for (const f of mdFiles("decisions")) {
  const rel = `decisions/${f}`;
  const d = frontMatter(rel);
  if (!d) continue;
  validateFields(rel, d, DECISION_FIELDS, DECISION_HINTS);
  if (!isString(d.id)) continue;
  if (!f.startsWith(`${d.id}-`)) error(rel, `filename must start with its id, "${d.id}-"`);
  if (decisions.has(d.id)) error(rel, `duplicate decision id "${d.id}" (also in ${decisions.get(d.id).rel})`);
  if (d.status === "decided" && !d.decided_on) error(rel, `status is decided, so "decided_on" needs a date`);
  decisions.set(d.id, { rel, data: d });
}

// ---------------------------------------------------------------------
// 3. Readings
// ---------------------------------------------------------------------

const readings = new Map(); // key -> { rel, data }
for (const f of mdFiles("readings")) {
  const rel = `readings/${f}`;
  const r = frontMatter(rel);
  if (!r) continue;
  validateFields(rel, r, READING_FIELDS, READING_HINTS);
  const key = basename(f, ".md");
  if (r.key !== key) error(rel, `"key" is ${JSON.stringify(r.key)} but the filename says "${key}"; they must match`);
  if (r.year === null) warn(rel, `"year" is empty`);
  if (r.verified === true && r.status !== "verified") error(rel, `verified is true, so status must be "verified"`);
  if (r.status === "verified" && r.verified !== true) error(rel, `status is "verified" but verified is not true`);
  for (const t of isStringList(r.tags) ? r.tags : []) {
    if (!tagIds.has(t)) error(rel, `tag "${t}" is not in tags.yml (tags: ${[...tagIds].join(", ")})`);
  }
  for (const s of isStringList(r.sections) ? r.sections : []) {
    if (!SECTIONS.includes(s)) error(rel, `section "${s}" doesn't exist (sections: ${SECTIONS.join(", ")})`);
  }
  for (const id of isStringList(r.decisions) ? r.decisions : []) {
    if (!decisions.has(id)) error(rel, `decision "${id}" has no file in decisions/`);
  }
  readings.set(key, { rel, data: r });
}

for (const { rel, data } of decisions.values()) {
  for (const key of isStringList(data.readings) ? data.readings : []) {
    if (!readings.has(key)) error(rel, `reading "${key}" has no file in readings/`);
  }
}

// ---------------------------------------------------------------------
// 4. references.bib against readings/
// ---------------------------------------------------------------------

const bibKeys = new Set();
const bibWithoutReading = [];
if (!existsSync(join(root, "references.bib"))) {
  if (readings.size) error("references.bib", "missing; export the FYP collection from Zotero (docs/reading-workflow.md)");
} else {
  const bib = parseBib(read("references.bib"));
  for (const e of bib.errors) error("references.bib", `could not parse: ${e.error}`);
  for (const e of bib.entries) {
    if (bibKeys.has(e.key)) error("references.bib", `duplicate key "${e.key}"`);
    bibKeys.add(e.key);
    if (!readings.has(e.key)) {
      bibWithoutReading.push(e.key);
      warn("references.bib", `"${e.key}" is in Zotero, not summarised yet`);
    }
    if (!e.fields.doi && !e.fields.url) warn("references.bib", `"${e.key}" has no DOI or URL`);
  }
}
for (const [key, { rel }] of readings) {
  if (!bibKeys.has(key)) error(rel, `"${key}" is not in references.bib; add the paper to the FYP collection in Zotero, or rename the file to its Zotero citekey`);
}

// ---------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------

for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`error    ${e}`);
console.log(
  `\n${readings.size} readings, ${decisions.size} decisions, ${bibKeys.size} bib entries, ${tags.length} tags: ` +
    `${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`,
);

if (errors.length) {
  console.log("Nothing was written. Fix the errors above and run the check again.");
  process.exit(1);
}
if (!write) process.exit(0);

// ---------------------------------------------------------------------
// 5. app/public/status.json
// ---------------------------------------------------------------------

const rs = [...readings.values()].map((r) => r.data);
const ds = [...decisions.values()].map((d) => d.data);

const tally = (init, items, pick) => {
  const out = { ...init };
  for (const item of items) for (const k of [pick(item)].flat()) out[k] = (out[k] ?? 0) + 1;
  return out;
};

const byGroup = {};
for (const g of DECISION_GROUPS) {
  const inGroup = ds.filter((d) => d.group === g);
  byGroup[g] = { total: inGroup.length, ...tally(count(DECISION_STATUS), inGroup, (d) => d.status) };
}

const status = {
  readings: {
    total: rs.length,
    target: READINGS_TARGET,
    verified: rs.filter((r) => r.verified).length,
    byStatus: tally(count(READING_STATUS), rs, (r) => r.status),
    byStars: tally(count(["0", "1", "2", "3", "4", "5"]), rs, (r) => String(r.stars)),
    byTag: tally(count([...tagIds]), rs, (r) => r.tags),
    bySection: tally(count(SECTIONS), rs, (r) => r.sections),
    byDecision: tally(count([...decisions.keys()].sort()), rs, (r) => r.decisions),
    unverifiedClaude: rs.filter((r) => r.summarised_by === "claude" && !r.verified).map((r) => r.key).sort(),
  },
  decisions: {
    total: ds.length,
    byStatus: tally(count(DECISION_STATUS), ds, (d) => d.status),
    byGroup,
  },
  bib: {
    total: bibKeys.size,
    withoutReading: bibWithoutReading.sort(),
  },
};

mkdirSync(join(root, "app/public"), { recursive: true });
writeFileSync(join(root, "app/public/status.json"), JSON.stringify(status, null, 2) + "\n");

// ---------------------------------------------------------------------
// 6. README status block
// ---------------------------------------------------------------------

function countdown() {
  const today = new Date(new Date().toISOString().slice(0, 10));
  for (const { label, date } of DEADLINES) {
    const days = Math.round((new Date(date) - today) / 86400000);
    if (days === 0) return `${label} due today`;
    if (days > 0) return `${label} in ${days} day${days === 1 ? "" : "s"}`;
  }
  return "all deadlines passed";
}

const decided = status.decisions.byStatus.decided;
const line =
  `> Readings: ${rs.length} / ${READINGS_TARGET} · verified: ${status.readings.verified} · ` +
  `decisions: ${decided} decided / ${ds.length - decided} open · ${countdown()}`;

const readme = read("README.md");
const block = /<!-- status:start -->[\s\S]*?<!-- status:end -->/;
if (!block.test(readme)) {
  console.log("README.md has no <!-- status:start --> ... <!-- status:end --> block, so it was not updated.");
} else {
  const updated = readme.replace(block, `<!-- status:start -->\n${line}\n<!-- status:end -->`);
  if (updated !== readme) writeFileSync(join(root, "README.md"), updated);
}
console.log(`Wrote app/public/status.json and the README status block:\n${line}`);
