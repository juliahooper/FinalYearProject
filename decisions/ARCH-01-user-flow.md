---
id: ARCH-01
title: User flow
group: system
status: exploring
decided_on:
readings: [nielsen1990heuristic, pruitt2003personas]
---

## Question
How a developer adds the tool to a pipeline, runs it, and acts on the result.

## Options considered
Only the chosen option is recorded in the master plan; alternatives that were rejected are noted under Why.

## Decision
**Provisional, 3 November 2026: three personas, an interactive setup command plus a local app, and a sources file.** The blocking and override rules stay open until CI-02, so this decision stays at *exploring* until then.

| Persona | Who they are | How they use EvenGround |
|---|---|---|
| ML engineer | Builds and maintains a training pipeline | Sets up EvenGround, adds data, fixes or overrides rejected sources, through the command line and CI |
| Data reviewer | Data steward, compliance or ethics lead | Reads the report and decides "review" items; never uses the command line |
| Non-technical builder | Someone with little technical expertise building something like a chatbot as a side project, with no CI pipeline | Uses the local app to choose data, run a scan and read the report |

```mermaid
flowchart TD
  subgraph Team["Team path: ML engineer and data reviewer"]
    T1["Set up<br/>evenground init"]:::team --> T2["Add data<br/>Edit sources.yaml or the data folder"]:::team
    T2 --> T3["Early feedback (optional)<br/>Pre-commit and pre-push hooks"]:::optional
    T3 --> T4["Open a pull request<br/>EvenGround Action scans new sources"]:::team
    T4 --> T5["Read the report<br/>Summary comment and full report"]:::team
  end
  subgraph Solo["Solo path: non-technical builder"]
    S1["Open the local app<br/>evenground ui"]:::solo --> S2["Choose data<br/>Upload a file or name a dataset"]:::solo
    S2 --> S3["Run a scan<br/>Runs on this computer"]:::solo
    S3 --> S4["Read the report<br/>Shown in the app"]:::solo
  end
  T5 --> G["Gate decision per source<br/>Same pipeline on both paths"]:::gate
  S4 --> G
  G --> A["Accept<br/>Data can enter training; manifest records it"]:::accept
  G --> R["Review<br/>Data reviewer decides; rules open until CI-02"]:::optional
  G --> X["Reject<br/>Clean, remove or override; rules open until CI-02"]:::optional

  classDef team fill:#E1EFFB,stroke:#76707A,color:#1F1B1E
  classDef solo fill:#DFF4EA,stroke:#76707A,color:#1F1B1E
  classDef gate fill:#FCE4EE,stroke:#76707A,color:#1F1B1E
  classDef accept fill:#FFFFFF,stroke:#76707A,color:#1F1B1E
  classDef optional fill:#FFFFFF,stroke:#76707A,color:#1F1B1E,stroke-dasharray: 4 3
```

Dashed: an optional step, or a rule still to be decided in CI-02. Teams use EvenGround as a CI gate; a solo builder uses the local app on their own computer. Both paths run the same pipeline and reach the same accept, review or reject decision.

**Setup**

- `evenground init` asks a few questions in the terminal (data folder, which hooks, local model only or ensemble) and creates the config file, an empty manifest, `sources.yaml`, the GitHub workflow file and the hook config.
- `evenground ui` opens a local web app on the user's own computer for setup, choosing data (upload a file or name a dataset), running a scan and reading the report. It runs locally only, with the local model by default; the API ensemble needs an explicit opt-in.
- The local app is built after the core pipeline works and is kept to those four tasks; its technology is chosen in UI-01. If time runs short it becomes a stretch goal, and the solo path falls back to `evenground scan` plus the HTML report.

**Declaring sources:** `sources.yaml` lists every Hugging Face dataset (name and pinned version), URL list and data folder meant for training. Adding data means editing this file, so every addition appears in the pull request diff, and CI runs when this file or the data folder changes.

## Why
- Personas make design teams engage with users' needs better than scenarios alone, and surface needs other methods miss (Pruitt and Grudin, 2003). Three personas cover the aim's promise of a report non-technical staff can act on, and give VAL-03 defined users to evaluate against.
- The non-technical builder is the user least likely to know about representational bias and most likely to fine-tune on scraped data without checks, and has no CI pipeline, so a local app is the only realistic way in.
- A setup command and a sources file make the correct path the easy one, and keep every data addition visible in review.

## Consequences
- CI-02 decides whether review blocks a merge, where review decisions are recorded, and how overrides work; this flow is updated then.
- UI-01 chooses the local app's technology and designs one report for all three personas.
- VAL-03's heuristic evaluation and cognitive walkthrough are run against named persona tasks, for example "a non-technical builder scans a dataset and decides whether to use it".
- The local app adds work in phase 4; its scope is limited to setup, choosing data, scanning and reading the report.
- This diagram is the user-flow figure for the interim report.
