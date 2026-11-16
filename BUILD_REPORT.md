# Build report — token-radar-01 entry (radar-2)

Built 2026-11-16, locally, free. No account created, nothing submitted,
nothing paid, no wallet connected. The user signs and submits themselves.

## What it is

A token launch radar: a Node program (`main.ts`, standard library only) that
reads the sealed DefiLlama snapshot (758 protocols, as of 2026-11-14, floor
$50M), ranks every pre-token protocol by an implied value, and writes a
static, no-network dashboard. Dark, professional theme; sortable and
filterable board; a detail view for every protocol; a live-token view kept
separate; methodology, comp table and data pitfalls on the page.

Entry root: `~/workspace/makefun/token-radar-01/entry/`

- `main.ts` — starter entry point, unchanged (reads `/input/snapshot.json`,
  writes `board.json`, `data.js`, copies `dashboard/` + `screenshots/`,
  writes `dossier.json` via the vendored library)
- `lib/model.ts` — radar-2 valuation model, farm plans, cautions (rewritten)
- `dashboard/index.html`, `dashboard/app.css`, `dashboard/app.js` (rewritten)
- `vendor/makefun-board.ts` — byte-for-byte the kit's copy
  (sha256 `9ca51b6e5cd84fe46cb0efa61e2ea99365a1fb0e21f2b75e6007f977f0dc326e`)
- `screenshots/1-board.png`, `2-detail.png`, `3-filtered.png` — real renders
  of this dashboard (see below)
- `.makefun/owner.json` — `{"wallet": "vitaKkZsRToivowgPSba4wCKZ8buCQQzQvxeLXyxoFC"}`
- `LICENSE` — MIT (starter)

## Valuation formula (radar-2)

    implied = round(tvl_usd x comp_multiple x growth_mult x age_mult x launch_mult)

- `comp_multiple` — the sector group's median market-cap / TVL among the
  snapshot's **own** tokenised protocols with TVL >= $50M, each ratio
  winsorised to [0.005, 0.5], versioned entries left out, shrunk toward the
  global median by sample size: `(n*median + 3*global) / (n+3)`, clamped to
  [0.02, 0.40]. Computed at run time from the snapshot, never hardcoded.
- `growth_mult` = 1 + clamp(change_7d, -30, +30) / 100 x 0.5 (0.85–1.15)
- `age_mult` = 0.70 + min(age_days, 1095) / 1095 x 0.30 (0.70–1.00; unknown age
  uses 365 days)
- `launch_mult` = 1.00, except 0.75 for vault curators / allocators and CDP,
  0.60 for payments / chains / stable wrappers, 0.85 for liquid staking and
  bridges.

Comps computed from this snapshot (global median 0.082x):

| Sector group | Comps (n) | Median mcap/TVL | Multiple used | Launch |
|---|---|---|---|---|
| Trading (DEXs, derivatives, basis) | 5 | 0.204x | 0.158x | 1.00 |
| Lending and collateral | 3 | 0.129x | 0.105x | 1.00 |
| CDP (stablecoin debt) | 1 | 0.008x | 0.064x | 0.75 |
| Yield and aggregators | 5 | 0.169x | 0.136x | 1.00 |
| Real-world assets | 4 | 0.178x | 0.137x | 1.00 |
| Vault curators and allocators | 2 | 0.013x | 0.054x | 0.75 |
| Liquid staking and restaking | 9 | 0.018x | 0.034x | 0.85 |
| Bridges | 8 | 0.276x | 0.223x | 0.85 |
| Payments, chains, stable wrappers | 1 | 0.032x | 0.069x | 0.60 |
| Other categories | 13 | 0.090x | 0.088x | 1.00 |

Top 10 by implied value (total implied across the board: $840,186,435):

1. Steakhouse Financial — $93,977,358 (Risk Curators, $2.75B TVL)
2. Gauntlet — $55,971,113 (Risk Curators, $1.58B TVL)
3. Veda — $53,196,874 (Onchain Capital Allocator, $1.56B TVL)
4. USDD — $43,004,148 (CDP, $1.06B TVL; caution shown: its TVL is largely
   a stable asset it issues)
5. Bittensor dTAO — $41,207,651 (Dexs, $376M TVL)
6. OnRe — $35,322,989 (RWA, $309M TVL)
7. OpenTrade — $29,357,493 (RWA, $242M TVL)
8. Plume Vaults — $25,848,192 (RWA, $212M TVL)
9. Symbiotic — $23,711,122 (Collateral Markets, $254M TVL)
10. R25 — $20,533,632 (RWA, $198M TVL)

## Coverage

- Board rows: **178** (100–4,000 allowed)
- Watchlist covered: **40 / 40**
- Early rows below the $50M floor: **138** — every rankable pre-token
  protocol below the floor in the snapshot (rankable = pre-token, not a CEX,
  not a versioned pool, not a wrapped / staked / bridged product of a token
  that trades, not an exchange's own product)
- Live-token protocols set aside with their market caps: **24**
- Categories on the board: 30. Cautions shown on 58 rows (rule-based, from
  category / age / missing data — e.g. stablecoin TVL, >3 years with no
  token, listed under 90 days, no listing date, growth capped).
- Farm plans: 7 steps per protocol, each with cost and time, derived from
  the protocol's category, chains, TVL and age (main action, a second
  qualifying action, weekly activity, hold period, points/rewards check,
  category-specific risk + exit). No protocol name is special-cased.

## Screenshots (real, not faked)

Rendered with Playwright + Chromium headless shell, installed free in
`/tmp/shot` (no system browser was present; `which chromium` /
`google-chrome` / `firefox` found nothing, so `npx playwright-core install
chromium` was used). Viewport 1440x900, from the built output in `/tmp/out1`.

- `1-board.png` — 1440x900, 159 KiB: board, top-3 spotlight, filters
- `2-detail.png` — 1440x900, 219 KiB: detail dialog for rank 1 (Steakhouse
  Financial), implied-value breakdown, recompute matches board.json, farm plan
- `3-filtered.png` — 1440x900, 162 KiB: filtered view, category Risk
  Curators, 33 rows shown

All three were eyeballed after rendering: dark theme, readable type, table
bars, dialog and filter state all correct.

## Gate validation (20/20 pass, run 2026-11-16 after final build)

- Dashboard: 3 files, 33,134 bytes (<=400 files, <=4 MiB); index.html +
  .css + .js present; no `http://` or `https://` in any dashboard file
- Board: 178 rows; ranks exactly 1..178; implied values sorted descending,
  all positive integers <= $1e14; slugs unique and all in the snapshot;
  names non-empty
- Watchlist coverage 40/40
- Farm steps: every row 7 steps, each 20–600 characters
- Screenshots: 3 PNGs, each <=512 KiB, 1440x900 (long side <=1440, short
  side >=800)
- Dossier: 769,292 bytes (<=1.5 MiB); dossier text 33,398 bytes (<=65,536),
  full dashboard source shown with no cut; dossier rebuild via
  `buildDossier` is byte-identical to the written `dossier.json`
- Page recompute check: the dashboard recomputes every row's implied value
  from its stored factors; 0/178 mismatches against `board.json`
- Methodology, comp table (10 rows) and pitfalls render; live-token tab
  renders 24 rows

## How to reproduce

```sh
cd ~/workspace/makefun/token-radar-01/entry
rm -rf /tmp/out1 && mkdir -p /tmp/out1
MAKEFUN_OUTPUT_DIR=/tmp/out1 node main.ts --input ../kit/input/snapshot.json
# output: /tmp/out1/board.json, /tmp/out1/data.js, /tmp/out1/dashboard/,
#         /tmp/out1/screenshots/, /tmp/out1/dossier.json
```

Screenshots (needs the Playwright setup in /tmp/shot; re-install if the
cache is gone: `cd /tmp/shot && npx playwright-core install chromium`):

```sh
cd /tmp/shot && node shots.mjs   # writes /tmp/shots/*.png
cp /tmp/shots/*.png ~/workspace/makefun/token-radar-01/entry/screenshots/
# then re-run main.ts so dossier.json embeds the new screenshots
```

Requires Node 22+ (built and tested on Node v24.22.1; the grader runs
Node 22, and the code is erasable TypeScript with no build step).

## Submission identities (wired in, NOT submitted)

- Solana payout wallet: `vitaKkZsRToivowgPSba4wCKZ8buCQQzQvxeLXyxoFC`
  (public address only; 43 chars, valid base58; no private key exists here
  and none was asked for)
- GitHub: `rizko-d` — https://github.com/rizko-d (12 public repos,
  created 2020-04-12)
- Planned repo: `github.com/rizko-d/token-radar`, public, created after
  2026-11-14, containing this entry at its root (including
  `.makefun/owner.json` and `LICENSE`). The repo does not exist yet — the
  user creates it and pushes this entry, then signs and submits themself.
  `.makefun/owner.json` proves the repo's wallet to the gate even if the
  make.fun account signs in by wallet rather than by GitHub.

## Known weaknesses vs the 9,484 existing entries

1. **The field is huge and the judge is pairwise.** 9,484 submissions were
   already in at last check, and the dev heat only screens the top 40 by
   interval low into the final. A good dashboard is not enough on its own —
   it has to beat the house anchors and the strongest entries head-to-head,
   repeatedly. Our edge is the comps-calibrated model and the pitfalls
   section; many entries are likely starter clones or flat-TVL tables.
2. **Rank 1–3 are vault curators whose token may never exist.** Steakhouse,
   Gauntlet and Veda top the board on TVL alone even after the 0.054x comp
   and 0.75x launch discount. If the judge (or a rival entry) argues
   curators are service businesses that will never tokenise, the top of our
   board looks naive. The dashboard defends the ranking with the comp table
   and the "curator's TVL is other people's assets" pitfall, but the thesis
   is genuinely contestable — and USDD at #4 has the same problem in the
   other direction (its token already exists as a stablecoin).
3. **One snapshot, one week of growth, no live data.** Everything is frozen
   at 2026-11-14. The 7-day change is a single noisy week (median pre-token
   change is negative; one protocol is up 4,448%). A rival entry that
   handles the noise more convincingly, or that finds a stronger early
   signal below the floor, can outrank us on criterion 2 (value model).
   Our early rows are also capped by the snapshot itself: only 138 rankable
   pre-token protocols exist below the floor, so we cannot out-cover anyone
   on breadth — only on model quality and farm-plan concreteness.
4. **Transcript gate (submission-time risk, not a build risk).** From
   17 Nov 2026 00:00 UTC an entry without transcripts is rejected. This
   build was written in this agent session; the submission must carry the
   sessions that built it, bundled with the kit CLI. If the sessions are
   not bundled correctly at submit time, the entry is rejected regardless
   of dashboard quality.
