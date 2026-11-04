"""False-positive rates at filter cut-offs (EXP-03).

Reads the Detoxify scores from EXP-01 (identity mentions and neutral controls) and
EXP-02 (sentences that promote, report or argue against abuse), and counts how many
sentences in each set score at or above each cut-off, with a 95% Wilson interval.

    python fp_rates.py [exp01_results.csv exp02_results.csv fp_rates.csv fp_by_term.csv]

With no arguments, paths are relative to this experiment's folder (run from there):
inputs come from the EXP-01 and EXP-02 results folders, outputs go to results/.

Outputs:
    fp_rates.csv    one row per model x set x cut-off: flagged, n, rate, lo, hi, mean_p
    fp_by_term.csv  one row per identity term: mean score and counts at 0.4 and 0.5

Logic as run on 3 November 2026 (PLAN.md §9, Appendix A); only the set labels changed,
from the XAI project's "Exp 1" / "Exp 2" to EXP-02 / EXP-01.
"""

import argparse
from math import sqrt

import numpy as np
import pandas as pd

CUT_OFFS = [0.1, 0.4, 0.5]
MODELS = ["original", "unbiased"]


def wilson(k, n, z=1.96):
    """95% Wilson score interval for k successes out of n."""
    if n == 0:
        return (np.nan, np.nan)
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    m = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return ((c - m) / d, (c + m) / d)


def rates(exp01, exp02):
    sets = [
        ("Identity mention (EXP-01)", exp01[~exp01.is_control]),
        ("Neutral control (EXP-01)", exp01[exp01.is_control]),
        ("Promotes abuse (EXP-02)", exp02[exp02.condition == "promote"]),
        ("Reports abuse (EXP-02)", exp02[exp02.condition == "report"]),
        ("Argues against abuse (EXP-02)", exp02[exp02.condition == "counter"]),
    ]
    rows = []
    for model in MODELS:
        col = f"p_{model}"
        for name, sub in sets:
            for t in CUT_OFFS:
                k = int((sub[col] >= t).sum())
                n = len(sub)
                lo, hi = wilson(k, n)
                rows.append(dict(model=model, set=name, threshold=t, flagged=k, n=n,
                                 rate=k / n, lo=lo, hi=hi, mean_p=sub[col].mean()))
    return pd.DataFrame(rows)


def by_term(exp01):
    ids = exp01[~exp01.is_control]
    return ids.groupby("term").agg(
        orig_mean=("p_original", "mean"),
        orig_ge04=("p_original", lambda s: (s >= 0.4).sum()),
        orig_ge05=("p_original", lambda s: (s >= 0.5).sum()),
        unb_mean=("p_unbiased", "mean"),
        unb_ge04=("p_unbiased", lambda s: (s >= 0.4).sum()),
        unb_ge05=("p_unbiased", lambda s: (s >= 0.5).sum()),
        n=("text", "count"),
    ).sort_values("orig_mean", ascending=False)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("exp01", nargs="?", default="../EXP-01-identity-mentions/results/exp2_results.csv")
    ap.add_argument("exp02", nargs="?", default="../EXP-02-report-and-counter/results/exp1_results.csv")
    ap.add_argument("out_rates", nargs="?", default="results/fp_rates.csv")
    ap.add_argument("out_by_term", nargs="?", default="results/fp_by_term.csv")
    a = ap.parse_args()

    exp01 = pd.read_csv(a.exp01)
    exp02 = pd.read_csv(a.exp02)

    r = rates(exp01, exp02)
    r.to_csv(a.out_rates, index=False)
    pd.set_option("display.width", 200)
    print(r.assign(rate=lambda d: (d.rate * 100).round(1), lo=lambda d: (d.lo * 100).round(1),
                   hi=lambda d: (d.hi * 100).round(1), mean_p=lambda d: d.mean_p.round(3)).to_string(index=False))
    print(exp02.condition.value_counts().to_dict())

    pt = by_term(exp01)
    print(pt.round(3).to_string())
    pt.to_csv(a.out_by_term)
    print("max control p:", exp01[exp01.is_control][["p_original", "p_unbiased"]].max().to_dict())


if __name__ == "__main__":
    main()
