// Token launch radar: entry point (Node 22, standard library only).
//
// Pipeline, end to end:
//   1. Find the sealed DefiLlama snapshot. It lives at /input/snapshot.json
//      inside the grader, or at a path given with --input. Outside the
//      grader, pass --input <snapshot.json|directory> explicitly.
//   2. Score every protocol with the model in lib/model.ts. That model
//      keeps the whole watchlist, adds every rankable pre-token protocol
//      below the floor, and ranks them by implied launch value. The
//      live-token protocols are set aside, never ranked.
//   3. Refuse a board the gate would refuse, before writing anything.
//   4. Write the ranked board to board.json and the dashboard's dataset
//      to data.js. The dashboard is a static page with no framework and
//      no network: it reads data.js, never fetches anything.
//   5. Copy this repo's dashboard/ and screenshots/ into the output
//      directory, and refuse the run unless at least three screenshots
//      are present with valid file names.
//   6. Write dossier.json last, with the vendored make.fun library.
//      The scorer rebuilds that dossier from the output directory and
//      compares it byte for byte, so nothing may change after this step.
//
// Output directory: --output, else MAKEFUN_OUTPUT_DIR, else /output.
// Example outside the grader:
//   MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts --input ../kit/input/snapshot.json

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  boardIssue,
  buildRadar,
  dataScript,
  parseSnapshot,
} from './lib/model.ts';
import { buildDossier } from './vendor/makefun-board.ts';

// Directory holding this file, so dashboard/ and screenshots/ resolve
// relative to the entry no matter where the process was started from.
const entryDir = fileURLToPath(new URL('.', import.meta.url));

// Scorer caps from reference/gate.json. The text cap shapes the dossier;
// the other caps are hard refusals in the gate.
const DOSSIER_TEXT_LIMIT = 65_536;
const SHOT_LIMIT = { max: 4, max_bytes: 524_288 };
const DASHBOARD_LIMIT = { max_files: 400, max_bytes: 4_194_304 };
const SHOT_NAME = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

// Read a `--flag value` or `--flag=value` argument, falling back when
// neither form is present. The space form wins when both are given.
function readFlag(flag: string, fallback: string): string {
  const argv = process.argv;
  const spaced = argv.indexOf(`--${flag}`);
  if (spaced >= 0 && spaced + 1 < argv.length) return argv[spaced + 1]!;
  const joined = argv.find((item) => item.startsWith(`--${flag}=`));
  if (joined === undefined) return fallback;
  return joined.slice(flag.length + 3);
}

function fail(message: string, code: number): never {
  process.stderr.write(`token radar: ${message}\n`);
  process.exit(code);
}

// --- 1. Locate the snapshot -------------------------------------------------

const inputGiven = readFlag('input', '/input');
const snapshotPath = inputGiven.endsWith('.json')
  ? inputGiven
  : join(inputGiven, 'snapshot.json');
if (!existsSync(snapshotPath)) {
  fail(
    `no snapshot at ${snapshotPath}: pass --input <snapshot.json|directory> or mount the sealed /input`,
    2,
  );
}
const outDir = readFlag('output', process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// --- 2. Score the snapshot, and refuse a bad board early --------------------

const snapshot = parseSnapshot(readFileSync(snapshotPath, 'utf8'));
const { board, radar } = buildRadar(snapshot);
const boardProblem = boardIssue(board, snapshot);
if (boardProblem !== null) {
  fail(`the model wrote a board the gate refuses: ${boardProblem}`, 1);
}

// --- 3. Write the board and the dashboard dataset ---------------------------

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'board.json'), `${JSON.stringify({ rows: board })}\n`);
writeFileSync(join(outDir, 'data.js'), dataScript(radar));

// --- 4. Copy the dashboard and the screenshots ------------------------------

// Copy a directory's regular files, skipping dotfiles, and report the
// names that were copied. Missing source directories copy nothing.
function copyDirectory(source: string, destination: string): string[] {
  if (!existsSync(source)) return [];
  mkdirSync(destination, { recursive: true });
  const copied: string[] = [];
  for (const entry of readdirSync(source)) {
    if (entry.startsWith('.')) continue;
    const sourcePath = join(source, entry);
    if (!statSync(sourcePath).isFile()) continue;
    copyFileSync(sourcePath, join(destination, entry));
    copied.push(entry);
  }
  return copied;
}

copyDirectory(join(entryDir, 'dashboard'), join(outDir, 'dashboard'));
const screenshots = copyDirectory(
  join(entryDir, 'screenshots'),
  join(outDir, 'screenshots'),
);
if (screenshots.length < 3) {
  const plural = screenshots.length === 1 ? '' : 's';
  fail(
    `screenshots/ holds ${screenshots.length} image${plural}: hand in 3, the board, a detail view and a filtered view`,
    1,
  );
}
for (const name of screenshots) {
  if (!SHOT_NAME.test(name)) {
    fail(
      `screenshots/${name}: a name is letters, digits and . _ -, 1 to 128 characters`,
      1,
    );
  }
}

// --- 5. Write the dossier last, then report what was written ----------------

// The dossier is written last on purpose: the scorer rebuilds it from
// this output directory and compares bytes, so nothing may change after it.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: DOSSIER_TEXT_LIMIT,
    screenshots: SHOT_LIMIT,
    dashboard: DASHBOARD_LIMIT,
  }),
);

process.stdout.write(
  `token radar: ${snapshot.protocols.length} protocols, ${snapshot.watchlist.length} on the watchlist, ${board.length} rows scored (${radar.early_size} early, ${radar.live_size} live set aside)\n` +
    `token radar: wrote ${join(outDir, 'board.json')}, ${join(outDir, 'data.js')}, ${join(outDir, 'dashboard')} (3 files), ${join(outDir, 'screenshots')} (${screenshots.length} images) and ${join(outDir, 'dossier.json')}\n`,
);
