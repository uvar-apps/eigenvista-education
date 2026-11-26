import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = fileURLToPath(new URL('../..', import.meta.url));
const css = await readFile(new URL('lesson.css', import.meta.url), 'utf8');
const input = process.argv[2];
assert(/^(quantum|chemistry)\/[\w-]+$/.test(input ?? ''), 'Use a quantum/<id> or chemistry/<id> manifest.');
const [track, id] = input.split('/');
const published = join(root, 'docs/assets/media', track);
const manifest = JSON.parse(await readFile(join(root, 'tools/media-input', `${input}.json`), 'utf8'));
const { title, kind, scenes } = manifest;
assert.equal(typeof title, 'string');
assert(kind === 'tour' || kind === 'workflow');
assert(scenes.length >= 4, `${input} requires four or more scenes.`);
if (kind === 'workflow') {
  const firstAI = scenes.findIndex(scene => scene.mode === 'AI connector');
  assert(firstAI >= 2 && firstAI <= scenes.length - 2, 'A workflow demo needs at least two scenes in each mode.');
  assert(scenes.slice(0, firstAI).every(scene => scene.mode === 'GUI'));
  assert(scenes.slice(firstAI).every(scene => scene.mode === 'AI connector'));
}

const workspace = await mkdtemp(join(tmpdir(), `eigenvista-${id}-`));
const audioEngine = process.env.EIGENVISTA_AUDIO_ENGINE;
const captureLibrary = process.env.EIGENVISTA_PLAYWRIGHT || 'playwright';
const { chromium } = createRequire(import.meta.url)(captureLibrary);
const fps = 24;
const view = { x: 46, y: 132, width: 1024, height: 648 };
const quote = (text) => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const words = (text) => text.trim().split(/\s+/u);
const snap = seconds => Math.ceil(seconds * fps) / fps;

async function narration() {
  if (kind !== 'tour') return new Map();
  assert(audioEngine, 'Set EIGENVISTA_AUDIO_ENGINE to the HyperFrames audio.mjs script.');
  const lines = scenes.map((scene, position) => {
    assert(scene.narration?.trim(), `${input} scene ${position + 1} has no narration.`);
    return { id: String(position), text: scene.narration };
  });
  const request = join(workspace, 'audio-request.json');
  const output = join(workspace, 'audio-meta.json');
  await writeFile(request, JSON.stringify({ lines, provider: 'kokoro', voice: 'af_heart', lang: 'en' }));
  await run(process.execPath, [audioEngine, '--request', request, '--hyperframes', workspace, '--out', output, '--only', 'tts'], { maxBuffer: 4 * 1024 * 1024 });
  const { voices } = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(voices.length, scenes.length, `${input} narration incomplete.`);
  return new Map(voices.map(voice => [Number(voice.id), voice]));
}

function frame(scene, position, still, seconds) {
  const progress = scenes.map((_, index) => `<span${index <= position ? ' class="complete"' : ''}></span>`).join('');
  const prompt = scene.prompt ? `<div class="step-prompt"><b>Prompt excerpt</b>${quote(scene.prompt.length > 225 ? `${scene.prompt.slice(0, 224).replace(/\s+\S*$/u, '')}…` : scene.prompt)}</div>` : '';
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>${quote(title)}</title><style>${css}</style><body>
  <article class="lesson-frame" data-composition-id="lesson" data-width="1600" data-height="900" data-duration="${seconds}">
    <header class="lesson-header"><p>EigenVista Education</p><h1>${quote(title)}</h1></header>
    <div class="lesson-content clip" data-start="0" data-duration="${seconds}" data-track-index="0">
      <figure class="app-capture"><img src="${quote(still)}" alt=""></figure>
      <section class="lesson-step"><p class="step-label">${quote(scene.mode)} · ${position + 1} of ${scenes.length}</p>
        <h2>${quote(scene.title)}</h2><p class="step-caption">${quote(scene.caption)}</p>${prompt}</section>
    </div>
    <footer class="lesson-footer"><span class="source-tag">EigenVista 0.10.6</span><div class="lesson-progress">${progress}</div></footer>
  </article></body></html>`;
}

function timestamp(seconds) {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
}

function cue(start, end, text) {
  const escaped = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `${timestamp(start)} --> ${timestamp(end)}\n${escaped}\n\n`;
}

function captionChunks(text) {
  const cues = [''];
  for (const word of words(text)) {
    const caption = cues.at(-1);
    if (caption.length + word.length + 1 > 78) cues.push(word);
    else cues[cues.length - 1] = caption ? `${caption} ${word}` : word;
  }
  return cues;
}

function captionCues(text, start, seconds, voice) {
  const chunks = captionChunks(text);
  const count = words(text).length;
  const duration = voice?.duration_s || seconds;
  const measured = voice?.words?.length === count;
  let offset = 0;
  return chunks.map(chunk => {
    const first = offset;
    offset += words(chunk).length;
    const left = measured ? voice.words[first].start : duration * first / count;
    const right = measured ? (voice.words[offset]?.start ?? duration) : duration * offset / count;
    return cue(start + left, start + right, chunk);
  }).join('');
}

async function encode(scene, position, png, voice, seconds) {
  const output = join(workspace, `part-${position}.mp4`);
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-filter_complex_threads', '2', '-loop', '1', '-framerate', String(fps), '-i', png];
  const stream = scene.video && resolve(root, scene.video);
  if (stream) args.push('-ss', String(scene.videoStart || 0), '-i', stream);
  if (voice) args.push('-i', join(workspace, voice.path));
  if (stream) {
    const { x, y, width, height } = view;
    args.push('-filter_complex', `[1:v]scale=${width}:${height}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x18242b,setsar=1,fps=${fps},tpad=stop_mode=clone:stop_duration=${seconds}[app];[0:v][app]overlay=${x}:${y}[out]`, '-map', '[out]');
  } else args.push('-map', '0:v:0');
  if (voice) args.push('-map', `${stream ? 2 : 1}:a:0`, '-af', 'apad', '-c:a', 'aac', '-ar', '48000', '-ac', '1', '-b:a', '96k');
  else args.push('-an');
  args.push('-t', String(seconds), '-c:v', 'libx264', '-threads', '3', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', String(fps), output);
  await run('ffmpeg', args);
  return basename(output);
}

const voices = await narration();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
let elapsed = 0;
let captions = 'WEBVTT\n\n';
let chapters = 'WEBVTT\n\n';
let modeStart = 0;
const parts = [];
try {
  for (const [position, scene] of scenes.entries()) {
    const { image, narration: spoken, caption, mode } = scene;
    assert(image?.startsWith(`docs/assets/media/${track}/`) && caption?.trim() && scene.title?.trim());
    const voice = voices.get(position);
    const seconds = snap(Math.max(scene.seconds || 0, (voice?.duration_s || 0) + 0.45, words(caption).length / 2.75 + 1, kind === 'workflow' ? 9 : 8));
    const still = `still-${position}${image.slice(image.lastIndexOf('.'))}`;
    await copyFile(join(root, image), join(workspace, still));
    const html = join(workspace, `scene-${position}.html`);
    const png = join(workspace, `frame-${position}.png`);
    await writeFile(html, frame(scene, position, still, seconds));
    await page.goto(pathToFileURL(html).href);
    await page.locator('.app-capture img').evaluate(img => img.decode());
    const bottom = await page.locator('.lesson-step').evaluate(step => step.getBoundingClientRect().bottom);
    assert(bottom <= 795, `${input}: ${scene.title} exceeds the instruction area.`);
    await page.screenshot({ path: png });
    parts.push(await encode(scene, position, png, voice, seconds));
    captions += captionCues(spoken || caption, elapsed, seconds, voice);
    if (kind === 'tour') chapters += cue(elapsed, elapsed + seconds, scene.title);
    if (kind === 'workflow' && mode !== scenes[position + 1]?.mode) {
      chapters += cue(modeStart, elapsed + seconds, mode);
      modeStart = elapsed + seconds;
    }
    elapsed += seconds;
    console.log(`${input} ${position + 1}/${scenes.length} ${scene.title} (${seconds.toFixed(2)} s)`);
  }
} finally { await browser.close(); }

await mkdir(published, { recursive: true });
const list = join(workspace, 'concat.txt');
await writeFile(list, parts.map(part => `file '${part}'\n`).join(''));
const movie = join(published, `${id}.mp4`);
await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', movie]);
await writeFile(join(published, `${id}.vtt`), `${captions.trimEnd()}\n`);
await writeFile(join(published, `${id}-chapters.vtt`), `${chapters.trimEnd()}\n`);
if (kind === 'tour') await writeFile(join(published, `${id}-transcript.txt`), `${title}\n\n${scenes.map(scene => `${scene.title}\n${scene.narration}`).join('\n\n')}\n`);
console.log(`Rendered ${movie} (${elapsed.toFixed(2)} s) from ${workspace}`);
