---
id: ARCH-05
title: Tech stack
group: system
status: decided
decided_on: 2026-11-03
readings: [zafrir2019q8bert]
---

## Question
Language, libraries and packaging.

## Options considered
- **ONNX Runtime as the main inference engine**: moved off the critical path the same day, because ModernBERT's ONNX export is fragile (see Why). Kept as an optional later optimisation.
- **CPU-only PyTorch for inference.** **Chosen.**

## Decision
**Python, CPU-only PyTorch for inference with ONNX as an optional optimisation, PySBD for sentence splitting, decided 3 November 2026 (inference revised the same day).**

| Need | Choice |
|---|---|
| Language | Python 3.11 or 3.12; the research-notes web app stays a separate codebase |
| Training and evaluation | Hugging Face Transformers on PyTorch |
| Inference in the shipped tool | PyTorch, CPU-only build. Optional later optimisation: export to ONNX on CPU and quantise to 8-bit, kept only if test metrics are unchanged |
| Sentence splitting | PySBD, with a custom rule on top that never splits a quotation and recognises reporting verbs |
| Loading datasets | Hugging Face Datasets, versions pinned |
| Metrics and statistics | scikit-learn and SciPy |
| Configuration | YAML validated with Pydantic |
| Command line | Typer |
| Reports | Jinja2 templates for HTML and Markdown |
| API adapter | httpx |
| Tests | pytest |
| Packaging | `pyproject.toml`, installable with pip, all versions pinned in a lock file; Docker decided in ARCH-06 |

**Name:** the tool is named **EvenGround** (package and command `evenground`, for example `evenground scan ./data`): "even" for fair and balanced, "ground" for the nine Equal Status grounds. Chosen 3 November 2026; the name was free on PyPI when checked.

## Why
- The models (ModernBERT, HateBERT, DeBERTa-v3) load through Hugging Face Transformers on PyTorch, so training and evaluation stay in one ecosystem.
- The CPU-only PyTorch build keeps the install small enough for CI runners. ONNX was moved off the critical path because ModernBERT's export is fragile: support had to be added to Hugging Face Optimum with a workaround (Optimum pull request 2131), a fine-tuned ModernBERT classifier exported on GPU differed from the original by about 0.005 (ONNX Runtime issue 24198), and ONNX Runtime's speed optimisations for ModernBERT were still an open pull request when checked (Optimum pull request 2208).
- 8-bit quantisation typically shrinks a model about four times with little accuracy loss (see Zafrir et al., 2019, @zafrir2019q8bert, for BERT), so it is available if CPU latency in MET-06 is too slow.
- PySBD is rule-based, needs no downloaded model and is designed for edge cases such as abbreviations and quotes; correct handling of quotes matters for the "mention is not bias" stance.
- scikit-learn and SciPy cover every MET-05 metric and test.

## Consequences
- ONNX export is attempted only after the PyTorch tool works end to end: on CPU, without flash-attention installed, and validated on the test metrics rather than raw output differences. If it fails, the tool ships with PyTorch and the attempt is reported as a practical finding.
- If an ONNX model is shipped, every release checks its scores match the PyTorch model's within a small tolerance (EVAL-05).
- MET-06 latency is measured with PyTorch on a CPU-only runner, and with ONNX and quantisation if the export succeeds. If PyTorch on CPU is too slow, DET-02 is revisited with a model that has mature ONNX support, such as RoBERTa-base.
