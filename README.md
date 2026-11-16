# token-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/rizko-d/token-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/rizko-d/token-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token launch radar: a Node program that reads a sealed DefiLlama snapshot of 758 protocols, ranks every pre-token protocol by an implied launch value, and writes a static, no-network dashboard with a board, a detail view for every protocol, and a farm plan for each one.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts --input ../kit/input/snapshot.json
```

## How it ranks

Implied value is TVL times a comps multiple computed at run time from the snapshot's own tokenised protocols, adjusted for growth, age, and launch likelihood. The dashboard shows the working for every row, plus the comps table and data pitfalls.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rizko-f&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
