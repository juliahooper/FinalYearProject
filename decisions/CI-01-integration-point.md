---
id: CI-01
title: Integration point
group: ci-cd
status: decided
decided_on: 2026-11-03
readings: [breckdata]
---

## Question
GitHub Action, pre-commit hook, CLI in any CI, or several of these.

## Options considered
- **Option A**: GitHub Action only.
- **Option B**: a command-line core with a GitHub Action wrapper, plus configurable local hooks. **Chosen.**
- Pipeline orchestrators (a DVC stage or an Airflow task) are future work.

## Decision
**Option B, a command-line core with a GitHub Action wrapper, plus configurable local hooks, decided 3 November 2026.**

| Layer | Runs | What it does | Can it be bypassed? |
|---|---|---|---|
| Pre-commit hook (optional) | Developer's machine, on `git commit` | Fast check, no model: warns if new or changed data files are not in the manifest | Yes |
| Pre-push hook (optional) | Developer's machine, on `git push` | Sampled scan of changed local files (default 50 random passages per file) | Yes |
| GitHub Action | GitHub's servers, on pull requests that change data or the manifest | Full scan; the authoritative gate | No |
| Any other CI | That CI's runner | The same `evenground` command, documented with a GitLab CI example | No |

- Which hooks are enabled and the pre-push sample size are set in the configuration (ARCH-07); hooks are shipped as a pre-commit framework hook definition.
- Commands: `evenground scan` (new or changed sources), `evenground scan --all` or `--source <name>` (manual rerun), `evenground report` (rebuild a report from saved results).
- Exit code 0 means every source was accepted; a non-zero code means at least one was rejected. The exit code for "review" is decided in CI-02.
- Outputs: a machine-readable JSON results file and the human report (UI-01); on GitHub, a summary comment on the pull request.
- Manual rerun on GitHub through a manually triggered workflow (`workflow_dispatch`).
- The Action caches the model checkpoint between runs.

## Why
- One command-line core means one codebase that works in any CI and is also used to run the experiments, which fits a self-hostable tool.
- GitHub Actions is the main integration because it is built into GitHub and needs no separate CI service.
- Validating data as a pipeline step before training has strong precedent: Google's TFX data validation checks petabytes of data a day for hundreds of teams and catches errors before they reach training (Breck et al., 2019).
- A failing check blocks the pull request, so the gate is enforced where data enters the repository.
- Hooks give early local feedback without making the developer wait for the model on every commit; because hooks can be skipped, the CI Action stays the enforcement point.
- Pipeline orchestrators (a DVC stage or an Airflow task) are future work; the command-line core makes them easy to add.

## Consequences
- A small example data repository using the EvenGround Action serves as the demo for the deliverable section and the video.
- CI-02 maps the review outcome to an exit code and pull request behaviour.
- CI-03 includes the time to download or restore the cached checkpoint.
- EVAL-05 includes an integration test that runs the Action on the example repository.
