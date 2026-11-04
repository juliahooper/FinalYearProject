// Fixture tests for scripts/check.mjs (PLAN.md §4, §9.5 Step 5).
//
//   npm test
//
// Each test copies the files the check reads into a temp folder, optionally breaks one,
// and runs the check against it with --root ... --no-write.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse as parseYaml } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const INPUTS = ["tags.yml", "references.bib", "README.md", "readings", "decisions", "experiments"];

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "fyp-check-"));
  for (const p of INPUTS) {
    // readings/pdfs is git-ignored and can be large; the check never reads it.
    cpSync(join(repo, p), join(dir, p), { recursive: true, filter: (src) => !src.includes(`${sep}pdfs`) });
  }
  // Follow-ups can cite files elsewhere in the repo (e.g. course-materials/); the check only
  // tests that they exist, so empty placeholders stand in for them.
  const followUps = parseYaml(readFileSync(join(repo, "readings/follow-up.yml"), "utf8")) ?? [];
  for (const src of followUps.flatMap((f) => f.found_in ?? []).map((s) => s.source)) {
    if (typeof src !== "string" || !src.includes("/") || src.startsWith("external:")) continue;
    mkdirSync(dirname(join(dir, src)), { recursive: true });
    writeFileSync(join(dir, src), "");
  }
  return dir;
}

function check(dir, { write = false } = {}) {
  const args = [join(here, "check.mjs"), "--root", dir, ...(write ? [] : ["--no-write"])];
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
}

test("the check passes on a copy of the repo and writes experiment counts", () => {
  const dir = fixture();
  try {
    const { code, out } = check(dir, { write: true });
    assert.equal(code, 0, out);
    const status = JSON.parse(readFileSync(join(dir, "app/public/status.json"), "utf8"));
    assert.deepEqual(Object.keys(status.experiments), ["total", "byStatus", "byKind", "reusePending"]);
    assert.match(readFileSync(join(dir, "README.md"), "utf8"), / open · experiments: \d+ done · /);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("each experiment rule reports its own error or warning", () => {
  const dir = fixture();
  try {
    const exp = join(dir, "experiments/EXP-97-many-faults");
    mkdirSync(join(exp, "results"), { recursive: true });
    writeFileSync(join(exp, "results/paper.pdf"), "");
    writeFileSync(join(exp, "results/big.bin"), Buffer.alloc(5 * 1024 * 1024 + 1));
    writeFileSync(
      join(exp, "README.md"),
      [
        "---",
        "id: EXP-98",
        'title: "Many faults"',
        "kind: fancy",
        "status: done",
        'question: "?"',
        "run_on:",
        "code_by: claude",
        'origin: "someone else\'s repo"',
        "reuse_approved: no",
        "depends_on: [EXP-55]",
        "decisions: []",
        "sections: [nowhere]",
        "readings: [nosuch2020paper]",
        'headline: ""',
        "results:",
        "  - file: ../EXP-01-identity-mentions/results/exp2_results.csv",
        '    caption: ""',
        "extra: 1",
        "---",
        "",
      ].join("\n"),
    );
    mkdirSync(join(dir, "experiments/Bad_Folder"));
    const { code, out } = check(dir);
    assert.equal(code, 1, out);
    const rel = "experiments/EXP-97-many-faults";
    for (const re of [
      /experiments\/Bad_Folder: folder name must be EXP-NN-<slug>/,
      new RegExp(`${rel}/README.md: unknown field "extra"`),
      new RegExp(`${rel}/README.md: "kind" is "fancy"`),
      new RegExp(`${rel}/README.md: "id" is "EXP-98" but the folder says "EXP-97"`),
      new RegExp(`${rel}/README.md: section "nowhere" doesn't exist`),
      new RegExp(`${rel}/README.md: depends_on "EXP-55" has no folder`),
      new RegExp(`warning  ${rel}/README.md: reading "nosuch2020paper" has no file`),
      new RegExp(`${rel}/README.md: results file ".*" must be inside ${rel}/`),
      new RegExp(`${rel}/README.md: status is done, so "run_on" needs`),
      new RegExp(`${rel}/README.md: status is done, so "headline" needs`),
      /EXP-98: the supervisor did not approve reuse; remove or replace this experiment/,
      new RegExp(`error    ${rel}/results/paper.pdf: PDFs are never committed`),
      new RegExp(`warning  ${rel}/results/big.bin: is 5.0 MB; files over 5 MB need Julia's OK`),
    ]) {
      assert.match(out, re);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an experiment with a bad decision ID fails", () => {
  const dir = fixture();
  try {
    mkdirSync(join(dir, "experiments/EXP-99-broken/results"), { recursive: true });
    writeFileSync(join(dir, "experiments/EXP-99-broken/results/out.csv"), "a,b\n1,2\n");
    writeFileSync(
      join(dir, "experiments/EXP-99-broken/README.md"),
      [
        "---",
        "id: EXP-99",
        'title: "Broken fixture"',
        "kind: supporting",
        "status: done",
        'question: "Does the check catch a bad decision ID?"',
        "run_on: 2026-11-04",
        "code_by: claude",
        'origin: ""',
        "depends_on: []",
        "decisions: [NOPE-01]",
        "sections: []",
        "readings: []",
        'headline: "It should."',
        "results:",
        "  - file: results/out.csv",
        '    caption: ""',
        "---",
        "",
      ].join("\n"),
    );
    const { code, out } = check(dir);
    assert.equal(code, 1, out);
    assert.match(out, /EXP-99-broken\/README\.md: decision "NOPE-01" has no file in decisions\//);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
