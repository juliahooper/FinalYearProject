---
id: ETH-02
title: Data licensing and use
group: governance
status: decided
decided_on: 2026-11-02
readings: []
---

## Question
Licences of every dataset used, and how the tool handles data it scans.

## Options considered
Only the chosen option is recorded in the master plan; alternatives that were rejected are noted under Why.

## Decision
**A dataset registry with frozen copies, names stripped from Bias in Bios, local-first scanning, decided 2 November 2026.**

**Part 1: Dataset registry**

- Every dataset gets a datasheet in the repo following Gebru et al. (2021) @gebru2021datasheets: motivation, composition, collection, preprocessing, uses, distribution and maintenance, plus the source URL, exact version or commit, retrieval date, licence, personal data it contains and the decisions that use it.
- The licence text is saved beside the datasheet and the licence page is archived on the retrieval date, so the accepted terms are on record.
- A frozen local copy of each dataset is kept outside git, backed up and never redistributed, with its SHA-256 checksum stored in the datasheet.
- `npm run check` is extended to fail if any dataset the code uses has no datasheet or its checksum no longer matches.
- Licences are confirmed at the original source, never a mirror, because licences on mirrors and hosting sites are often missing or wrong.
- The gap set gets its own datasheet.

| Dataset | Licence | Condition |
|---|---|---|
| CrowS-Pairs | CC BY-SA 4.0 | Credit; anything shared from it is also CC BY-SA |
| HateCheck | CC BY 4.0 | Credit |
| ToxiGen | Data CDLA-Permissive-2.0, code MIT | Include the licence text if shared |
| StereoSet | CC BY-SA 4.0 | Credit; share-alike; only the development set is public |
| BBQ | CC BY 4.0 per a mirror | Confirm at the official repo |
| SBIC | Not yet verified | Confirm at the official page |
| Bias in Bios | Code MIT; data rebuilt from Common Crawl | Personal data, see Part 2 |
| Contextual Abuse Dataset (training, DET-03) | CC BY 4.0 | Credit; confirm at the official source |

**Part 2: Personal data**

- Bias in Bios is used with names stripped: only the biography text, pronouns and occupation are kept. It is stored locally and never redistributed. The source-level test only needs gender words and occupations, so nothing is lost.
- The supervisor's written confirmation for ETH-01 also covers this secondary use of public personal data.

**Part 3: How the tool handles scanned data**

- Local by default: all scanning runs on the user's machine or CI runner.
- The commercial API backend (DET-04) is opt-in, with an explicit warning that text leaves the machine.
- Reports show only the short flagged span, never whole documents, and no scanned text is kept after a run except the flagged spans in the report; saved scores, the cache and the manifest store hashes and scores, never the text itself.
- Stretch goal, after the local-first design works: redact personal data (names, emails, phone numbers) before any text is sent to an API.

## Why
- A licence revoked or a dataset withdrawn before submission would not break the project. CC BY and CC BY-SA 4.0 grant an irrevocable licence, and a licensor who stops distributing does not end the licence already granted; it only ends on failure to comply (CC BY 4.0 legal code, sections 2(a)(1), 6(a) and 6(c)). CDLA-Permissive-2.0 has no termination clause and only requires its terms to be followed. A pinned copy with its recorded licence therefore stays usable.
- Datasheets make each dataset's origin, terms and limits explicit, which also answers the benchmark validity concerns in VAL-01.
- Training data often contains personal information such as names, phone numbers and email addresses, and a tool inside a training-data pipeline handles exactly that kind of text, so it should not send it anywhere by default.
- Public biographies are still personal data under the GDPR, so the minimum needed is kept.
- Identifying information is removed from harmful examples shown in the paper (Kirk et al., 2022).

## Consequences
- Repo: a datasets folder with one datasheet per dataset, saved licence texts and checksums, and an updated check script.
- If a dataset is withdrawn for ethical reasons rather than licensing, the frozen copy is still used and the withdrawal is noted in the paper.
- MET-06 can count "no text leaves the machine" as a privacy property of the local backend.
- Still open, for ARCH-06: the licence for the tool's code (MIT or Apache-2.0) and for the gap set (CC BY 4.0 suggested).
