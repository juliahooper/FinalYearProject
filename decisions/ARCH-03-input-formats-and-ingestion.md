---
id: ARCH-03
title: Input formats and ingestion
group: system
status: decided
decided_on: 2026-11-03
readings: []
---

## Question
Which source types are supported (web pages, JSONL, CSV, Hugging Face datasets), and how they're loaded.

## Options considered
Only the chosen option is recorded in the master plan; alternatives that were rejected are noted under Why.

## Decision
**Four source types, one source per file, dataset version or URL list, and a hash manifest with manual reruns, decided 3 November 2026.**

| Source type | How it is read |
|---|---|
| Web pages (saved HTML or a list of URLs) | Main text extracted with Trafilatura, removing menus, adverts and boilerplate |
| JSONL | One record per line; a configured field holds the text |
| CSV or TSV | One row per document; a configured column holds the text |
| Hugging Face datasets | Loaded by name and pinned version; a configured field holds the text; streamed |
| Plain text or Markdown files | One file per document |

Every type is converted into the same internal form: a list of documents, each with an ID, its text and metadata. PDFs and Word files are future work.

**What one source is:** a file, a dataset version or a URL list. Each gets one accept, review or reject decision (MET-03). Documents and passages keep their IDs and character offsets, so the report can point to the exact document and span behind a flag.

**Detecting what is new**

1. EvenGround keeps a manifest file in the repo listing each approved source with its fingerprint, decision and date. The fingerprint is a SHA-256 hash of the content for files and URL lists, and the pinned revision for Hugging Face datasets, which are too large to hash on every run.
2. A CI run fingerprints every source and scans only those whose fingerprint is new or changed.
3. Accepted sources are written back to the manifest.
4. A manual rerun can be triggered for one source or all sources, ignoring the manifest, for example after a new model checkpoint or a threshold change. The report records that the run was manual and who triggered it.

## Why
- These are the formats LLM training pipelines ingest, and converting them to one internal form keeps the scanner simple.
- Trafilatura is an open-source library for extracting the main text of web pages, so menus and boilerplate are not scanned.
- A source as a file, dataset version or URL list matches how teams add data, and keeps the number of gate decisions readable.
- A hash manifest avoids rescanning unchanged data, works for Hugging Face datasets and URL lists that are not files in the repo, and gives an audit trail of what was admitted to training, when and why, in line with AI Act Article 10's data governance duty.
- Manual reruns are needed because the result can change without the data changing: a new checkpoint (DET-03), new thresholds (MET-04) or a new configuration.

## Consequences
- A configurable cap on documents scanned per source (all, the first N or a random N), stated in the report when sampling is used (CI-03).
- Non-English documents are detected and skipped rather than scored, and the report says how many.
- The manifest also records the checkpoint and configuration that produced each decision, so a rerun can show what changed.
- CI-01 must expose the manual rerun as a command and, for GitHub, as a manually triggered workflow.
- The Trafilatura extraction step is covered by EVAL-05 tests on a few saved web pages.
