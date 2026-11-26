import { copyFileSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = resolve(sourceDir, '../../../docs/assets/media/concepts');
const duration = 16;
const graphics = {
  'orbital-phase': {
    title: 'Orbital phase', poster: 3,
    cues: [
      [0, 5, 'Opposite signs of the orbital amplitude meet at a node.'],
      [5, 11, 'Reverse both signs together. The node and amplitude magnitude stay the same.'],
      [11, 16, 'Squaring the amplitude gives the same nonnegative one-orbital density.'],
    ],
  },
  'cube-interpolation': {
    title: 'Sampling a cube field', poster: 8,
    cues: [
      [0, 4.6, 'Locate the surrounding skewed cell using the source grid vectors.'],
      [4.6, 12.1, 'At each position, trilinear weights blend the eight stored corner values.'],
      [12.1, 16, 'Once the probe leaves the finite grid, its status is outside and the value is blank.'],
    ],
  },
  'ligand-expansion': {
    title: 'Two ways to select neighbors', poster: 11.5,
    cues: [
      [0, 4, 'Find atoms within 4 Å of any of the 27 atoms in ADP A:1.'],
      [4, 8.3, 'The 1AON distance selection contains 74 atoms including the ADP seeds.'],
      [8.3, 12, 'Complete residues adds each matched residue’s remaining atoms.'],
      [12, 16, 'The expanded selection contains 154 atoms across 21 residues.'],
    ],
  },
  'solvent-surfaces': {
    title: 'Two solvent surfaces', poster: 11,
    cues: [
      [0, 3.75, 'Two atoms of radius 1.8 Å are 4.2 Å apart. The probe radius is 1.4 Å.'],
      [3.75, 7.6, 'The dashed SAS follows the center of the rolling probe.'],
      [7.6, 12.2, 'The solid SES follows contact arcs and the inner arc swept between the atoms.'],
      [12.2, 16, 'Both curves use the same atoms and solvent probe.'],
    ],
  },
};
const ids = process.argv.slice(2);
const gsap = process.env.GSAP_PATH;
const hyperframes = process.env.HYPERFRAMES_BIN ?? 'hyperframes';
const ffmpeg = process.env.HYPERFRAMES_FFMPEG_PATH ?? 'ffmpeg';
if (!gsap) throw new Error('Set GSAP_PATH to the GSAP 3.14.2 dist/gsap.min.js file.');

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit', env: { ...process.env, HYPERFRAMES_SKIP_SKILLS: '1' },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${basename(command)} exited with status ${result.status}`);
}

function timestamp(seconds) {
  const milliseconds = Math.round(seconds * 1000);
  const wholeSeconds = Math.floor(milliseconds / 1000);
  return `00:00:${String(wholeSeconds).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}

function render(id) {
  const graphic = graphics[id];
  if (!graphic) throw new Error(`Unknown concept: ${id}`);
  const work = mkdtempSync(join(tmpdir(), `eigenvista-${id}-`));
  try {
    writeFileSync(join(work, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1280, height=720">
  <title>${graphic.title}</title>
  <style>
    body { margin: 0; }
    #frame { position: relative; width: 1280px; height: 720px; overflow: hidden; }
    .clip { display: block; position: absolute; inset: 0; }
  </style>
  <script src="gsap.min.js"></script>
</head>
<body>
  <div id="frame" data-composition-id="${id}" data-width="1280" data-height="720" data-duration="${duration}">
    <canvas id="diagram" class="clip" width="1280" height="720" data-start="0" data-duration="${duration}" data-track-index="0"></canvas>
  </div>
  <script src="concepts.js"></script>
  <script>
    window.__timelines = window.__timelines || {};
    window.__timelines["${id}"] = createDiagramTimeline();
  </script>
</body>
</html>
`);
    copyFileSync(gsap, join(work, 'gsap.min.js'));
    copyFileSync(join(sourceDir, 'concepts.js'), join(work, 'concepts.js'));
    run(hyperframes, ['lint', work]);
    run(hyperframes, ['validate', work]);
    const video = join(outputDir, `${id}.mp4`);
    run(hyperframes, ['render', work, '--output', video, '--fps', '24', '--crf', '23', '--workers', '1', '--strict']);
    run(ffmpeg, ['-v', 'error', '-y', '-ss', String(graphic.poster), '-i', video, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '89', join(outputDir, `${id}.webp`)]);
    const cues = graphic.cues.map(([start, end, text]) => `${timestamp(start)} --> ${timestamp(end)}\n${text}\n`);
    writeFileSync(join(outputDir, `${id}.vtt`), `WEBVTT\n\n${cues.join('\n')}`);
  } finally {
    if (readdirSync(work).length > 0) rmSync(work, { recursive: true });
  }
}

for (const id of ids.length ? ids : Object.keys(graphics)) render(id);
