#!/usr/bin/env bash
# Word count for one report: scripts/wordcount.sh interim|final
#
# Body: texcount over main.tex and every \input section (text, headings and captions),
#       leaving out the declarations (marked %TC:ignore in main.tex).
# Total: every word in the built PDF before the DECLARATIONS heading. That includes the
#       reference list, which texcount can't count (a biblatex .bbl file is data, not
#       typeset text), plus the title block and page furniture, so it slightly overcounts.
#       That's the safe direction for checking a limit.
# References: roughly total minus body.
#
# Needs main.pdf to be built first. In CI, texcount runs inside the LaTeX container and
# writes paper/<report>/wordcount-body.txt; locally, texcount is run directly if installed.
set -euo pipefail

report="${1:?usage: scripts/wordcount.sh interim|final}"
dir="paper/$report"

if command -v texcount >/dev/null 2>&1; then
  body=$(cd "$dir" && texcount -inc -sum -1 main.tex | grep -oE '^[0-9]+' | head -1)
elif [ -f "$dir/wordcount-body.txt" ]; then
  body=$(grep -oE '^[0-9]+' "$dir/wordcount-body.txt" | head -1)
else
  body=""
fi

total=""
if [ -f "$dir/main.pdf" ] && command -v pdftotext >/dev/null 2>&1; then
  total=$(pdftotext "$dir/main.pdf" - | sed '/^DECLARATIONS/,$d' | wc -w | tr -d ' ')
fi

refs=""
if [ -n "$body" ] && [ -n "$total" ] && [ "$total" -ge "$body" ]; then refs=$((total - body)); fi

case "$report" in
  final) limit="10,000 (references included; more than 10% over is penalised)" ;;
  *) limit="to be confirmed with the supervisor" ;;
esac

summary="### Word count: $report report

| Part | Words |
|---|---|
| Body (texcount, excluding declarations) | ${body:-not available} |
| Reference list, title block and page furniture (total minus body) | ${refs:-not available} |
| **Total, from the PDF, excluding declarations** | **${total:-not available}** |

Limit: $limit. Use the total to check against it."

echo "$summary"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then echo "$summary" >> "$GITHUB_STEP_SUMMARY"; fi
