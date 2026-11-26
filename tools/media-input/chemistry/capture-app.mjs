/** Capture the actual EigenVista browser app and its UI interactions. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createReadStream, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as pause } from "node:timers/promises";

const [checkout, capturePath, ...subjects] = process.argv.slice(2);
if (!checkout || !capturePath) throw new Error("Pass the EigenVista checkout and a capture directory");
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const upstream = path.resolve(checkout);
const recordings = path.resolve(capturePath);
const media = path.join(repo, "docs/assets/media/chemistry");
const captures = path.join(media, "stills");
const { chromium } = await import(pathToFileURL(path.join(upstream, "app/node_modules/playwright/index.mjs")));
for (const dir of [recordings, captures]) mkdirSync(dir, { recursive: true });
const dist = path.join(upstream, "app/dist");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".wasm": "application/wasm" };
const server = createServer((request, response) => {
  const route = new URL(request.url, "http://127.0.0.1").pathname;
  const file = path.join(dist, route === "/" ? "/index.html" : route);
  try {
    response.writeHead(200, { "Content-Type": mime[path.extname(file)], "Content-Length": statSync(file).size });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject));
const address = `http://127.0.0.1:${server.address().port}/?control=1`;
let browser;

async function command(page, method, params = {}) {
  return page.evaluate(({ method, params }) => window.eigenvistaControl.request(method, params), { method, params });
}

async function until(read, accept, message, duration = 50000) {
  const deadline = Date.now() + duration;
  let actual;
  do {
    actual = await read();
    if (accept(actual)) return actual;
    await pause(200);
  } while (Date.now() < deadline);
  throw new Error(`${message}: ${JSON.stringify(actual)?.slice(0, 1000)}`);
}

async function getSelection(page, count) {
  return until(() => command(page, "selection.get"), (item) => item.selectedCount === count, `Expected ${count} selected atoms`);
}

async function openFile(page, source, atoms) {
  await page.getByLabel("Open molecular file", { exact: true }).setInputFiles(source);
  await until(() => command(page, "app.state"), (state) => state.document?.atomCount === atoms && !state.busy, "Molecule import failed");
  await pause(450);
}

async function widget(page, tab, id, title) {
  const pane = page.getByRole("region", { name: "Workspace tools", exact: true, includeHidden: true });
  if (await pane.isHidden()) await page.getByRole("button", { name: "Show tools", exact: true }).click();
  await pane.getByRole("tab", { name: tab, exact: true }).click();
  const disclosure = pane.locator(`[data-panel-id="${id}"] > .section-title`).getByRole("button", { name: title, exact: true });
  if (await disclosure.getAttribute("aria-expanded") !== "true") await disclosure.click();
}

async function disclose(page, label) {
  const summary = page.locator("summary").filter({ hasText: label }).first();
  if (!(await summary.evaluate((element) => element.closest("details").open))) await summary.click();
}

async function still(page, name, locator) {
  await pause(400);
  const png = path.join(recordings, `${name}.png`);
  if (locator) await locator.screenshot({ path: png });
  else await page.screenshot({ path: png });
  execFileSync("cwebp", ["-quiet", "-q", "91", png, "-o", path.join(captures, `${name}.webp`)]);
}

async function record(name, actions) {
  const context = await browser.newContext({
    viewport: { width: 1520, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: recordings, size: { width: 1520, height: 900 } },
  });
  const started = performance.now();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const cues = {};
  const mark = (key) => { cues[key] = (performance.now() - started) / 1000; };
  try {
    await page.goto(address);
    await page.waitForFunction(() => Boolean(window.eigenvistaControl));
    await until(() => command(page, "app.state"), (state) => !state.busy, "EigenVista startup");
    await actions(page, mark);
  } catch (error) {
    await page.screenshot({ path: path.join(recordings, `${name}-failure.png`) });
    throw error;
  } finally {
    await context.close();
    await page.video().saveAs(path.join(recordings, `${name}.webm`));
    console.log(name, JSON.stringify(cues), path.join(recordings, `${name}.webm`));
  }
}

async function ligand() {
  await record("ligand-gui", async (page, mark) => {
    await openFile(page, path.join(upstream, "site/downloads/1AON.cif"), 58870);
    await widget(page, "Molecule", "geometry", "Selections and measurements");
    await disclose(page, "Ligands and neighborhoods");
    mark("find-copy");
    await page.getByLabel("Find ligand copy", { exact: true }).fill("ADP · A:1");
    await page.getByRole("button", { name: /^Select ADP · A:1 · residue #8017$/ }).click();
    await getSelection(page, 27);
    await still(page, "ligand-choose-adp");
    mark("search-atoms");
    await page.getByLabel("Neighborhood radius (Å)", { exact: true }).fill("4");
    await page.getByLabel("Include complete residues", { exact: true }).uncheck();
    await page.getByLabel("Neighborhood selection name", { exact: true }).fill("ADP A:1 4 Å atoms");
    await page.getByRole("button", { name: "Show neighborhood", exact: true }).click();
    await getSelection(page, 74);
    await still(page, "ligand-cutoff-controls");
    mark("search-residues");
    await page.getByRole("button", { name: /^Select ADP · A:1 · residue #8017$/ }).click();
    await getSelection(page, 27);
    await page.getByLabel("Include complete residues", { exact: true }).check();
    await page.getByLabel("Neighborhood selection name", { exact: true }).fill("ADP A:1 4 Å complete residues");
    await page.getByRole("button", { name: "Show neighborhood", exact: true }).click();
    await getSelection(page, 154);
    await still(page, "ligand-residue-controls");
    await pause(500);
  });
}

async function measured(page, order, kind, title) {
  await page.getByLabel("Inspection atom numbers", { exact: true }).fill(order);
  await page.getByRole("button", { name: "Select atom numbers", exact: true }).click();
  await getSelection(page, order.split(",").length);
  await disclose(page, "Geometry measurements");
  await page.getByLabel("Measurement type", { exact: true }).selectOption(kind);
  await page.getByLabel("Measurement name", { exact: true }).fill(title);
  await page.getByLabel("Always show measurement label", { exact: true }).check();
  await page.getByRole("button", { name: "Add measurement", exact: true }).click();
  await page.getByLabel(`Value of ${title}`, { exact: true }).waitFor({ state: "visible" });
}

async function water() {
  await record("water-gui", async (page, mark) => {
    await openFile(page, path.join(upstream, "site/downloads/water.xyz"), 3);
    await widget(page, "Molecule", "geometry", "Selections and measurements");
    mark("measure");
    await measured(page, "1, 2", "distance", "O–H distance");
    await still(page, "water-distance");
    await measured(page, "2, 1, 3", "angle", "H–O–H angle");
    await still(page, "water-angle");
    assert.equal((await command(page, "measure.list")).total, 2);
    await widget(page, "Surfaces", "molecular", "Molecular surfaces");
    mark("surface");
    assert.equal((await surface(page, "ses", "Water SES", "0.25")).triangleCount, 1712);
    await still(page, "water-surface-controls");
    await pause(900);
  });
}

async function assembly() {
  await record("assembly-gui", async (page, mark) => {
    await openFile(page, path.join(upstream, "site/downloads/1AON.cif"), 58870);
    await widget(page, "Molecule", "document", "Molecular data");
    const coloring = page.getByLabel("Structure coloring", { exact: true });
    mark("chain");
    await page.getByLabel("Representation", { exact: true }).first().selectOption("cartoon");
    await coloring.selectOption("chain");
    await page.getByRole("button", { name: "Fit scene", exact: true }).click();
    await still(page, "assembly-chain");
    mark("entity");
    await coloring.selectOption("entity");
    await still(page, "assembly-entity");
    await pause(700);
  });
}

async function protein() {
  await record("protein-gui", async (page, mark) => {
    await openFile(page, path.join(upstream, "fixtures/bcif/1crn.bcif"), 327);
    await widget(page, "Molecule", "document", "Molecular data");
    const representation = page.getByLabel("Representation", { exact: true }).first();
    const coloring = page.getByLabel("Structure coloring", { exact: true });
    mark("representations");
    await representation.selectOption("trace");
    await pause(550);
    await representation.selectOption("cartoon");
    await page.getByRole("button", { name: "Fit scene", exact: true }).click();
    await coloring.selectOption("secondary");
    await still(page, "protein-secondary-controls");
    mark("coloring");
    await coloring.selectOption("residue-class");
    await still(page, "protein-residue-controls");
    await pause(650);
  });
}

async function surface(page, kind, title, spacing) {
  await page.getByLabel("Molecular surface to edit", { exact: true }).selectOption("");
  await page.getByLabel("Molecular surface type", { exact: true }).selectOption(kind);
  await page.getByLabel("Molecular surface name", { exact: true }).fill(title);
  await page.getByLabel("Molecular surface probe radius", { exact: true }).fill("1.4");
  await page.getByLabel("Molecular surface grid spacing", { exact: true }).fill(spacing);
  await page.getByRole("button", { name: "Generate molecular surface", exact: true }).click();
  const item = await until(() => command(page, "molecularSurfaces.list"),
    (data) => data.items.some((entry) => entry.label === title), `Missing ${title} result`);
  return item.items.find((entry) => entry.label === title);
}

async function solvent() {
  await record("solvent-gui", async (page, mark) => {
    await openFile(page, path.join(upstream, "fixtures/bcif/1crn.bcif"), 327);
    await widget(page, "Surfaces", "molecular", "Molecular surfaces");
    mark("ses");
    const ses = await surface(page, "ses", "Crambin SES", "0.5");
    assert.equal(ses.triangleCount, 27608);
    await still(page, "solvent-ses-controls");
    mark("sas");
    const sas = await surface(page, "sas", "Crambin SAS", "0.5");
    assert.equal(sas.triangleCount, 34724);
    await command(page, "molecularSurfaces.set", { id: ses.id, visible: false });
    await still(page, "solvent-sas-controls");
    await pause(550);
  });
}

async function coordination() {
  await record("coordination-gui", async (page, mark) => {
    await openFile(page, path.join(repo, "docs/chemistry/data/tio6-local.xyz"), 7);
    await widget(page, "Molecule", "geometry", "Selections and measurements");
    mark("measure");
    await measured(page, "1, 2", "distance", "Equatorial Ti–O");
    await measured(page, "1, 6", "distance", "Axial Ti–O");
    await still(page, "coordination-distance-controls");
    mark("angles");
    await measured(page, "2, 1, 6", "angle", "Equatorial–axial angle");
    await still(page, "coordination-angle-controls");
    await pause(550);
  });
}

async function finish(page, receipt) {
  if (!receipt.jobId) return receipt;
  const job = await until(() => command(page, "job.get", { jobId: receipt.jobId }),
    (item) => ["completed", "failed", "cancelled"].includes(item.status), "Background job did not finish");
  assert.equal(job.status, "completed", JSON.stringify(job));
  return job;
}

async function measureWithController(page, id, label, kind, atoms) {
  await command(page, "measure.upsert", {
    measurement: { id, label, kind, atoms, color: "#f4cb65", visible: true, always_visible: true },
  });
}

async function replay() {
  await record("ligand-ai", async (page, mark) => {
    await openFile(page, path.join(upstream, "site/downloads/1AON.cif"), 58870);
    await widget(page, "Molecule", "geometry", "Selections and measurements");
    await disclose(page, "Ligands and neighborhoods");
    const atoms = (await command(page, "atoms.list", { residueIndex: 8016, limit: 100 })).items;
    const seeds = atoms.map((atom) => atom.index);
    assert.equal(seeds.length, 27);
    mark("resolve");
    await command(page, "selection.set", { atoms: seeds, showOnly: true, focus: true });
    await pause(900);
    for (const [wholeResidues, count] of [[false, 74], [true, 154]]) {
      await finish(page, await command(page, "selection.neighborhood", {
        seeds, radiusAngstrom: 4, wholeResidues, showOnly: true, focus: true, resetFilters: true,
      }));
      await getSelection(page, count);
      await pause(1100);
    }
    await measureWithController(page, "contact", "THR–ADP", "distance", [657, 58677]);
    await command(page, "selection.set", { atoms: [] });
    await still(page, "ligand-ai-contact");
  });

  await record("protein-ai", async (page, mark) => {
    await openFile(page, path.join(upstream, "fixtures/bcif/1crn.bcif"), 327);
    await widget(page, "Molecule", "document", "Molecular data");
    mark("cartoon");
    await command(page, "scene.set", { representation: "cartoon" });
    await command(page, "structure.set", { colorMode: "secondary" });
    await pause(1000);
    await command(page, "structure.set", { colorMode: "residue-class" });
    await pause(1000);
    const chain = (await command(page, "structure.list")).items[0];
    await command(page, "structure.set", {
      residueRange: { chainIndex: chain.index, first: "7", last: "19" },
    });
    await command(page, "structure.focus", { target: "visible" });
    await still(page, "protein-ai-range");
  });

  await record("solvent-ai", async (page, mark) => {
    await openFile(page, path.join(upstream, "fixtures/bcif/1crn.bcif"), 327);
    await widget(page, "Surfaces", "molecular", "Molecular surfaces");
    mark("generate");
    for (const kind of ["ses", "sas"]) {
      await finish(page, await command(page, "molecularSurfaces.generate", { request: {
        id: kind, label: `Crambin ${kind.toUpperCase()}`, kind, atom_indices: [],
        radii_set: "bondi", radii_overrides: [], probe_radius: 1.4, spacing: 0.5, color: "#85aebe", opacity: 1,
      } }));
      await pause(700);
    }
    await command(page, "molecularSurfaces.set", { id: "sas", visible: false });
    await pause(700);
    await command(page, "molecularSurfaces.set", { id: "ses", visible: false });
    await command(page, "molecularSurfaces.set", { id: "sas", visible: true });
    await pause(700);
  });

  await record("coordination-ai", async (page, mark) => {
    await openFile(page, path.join(repo, "docs/chemistry/data/tio6-local.xyz"), 7);
    await widget(page, "Molecule", "geometry", "Selections and measurements");
    await disclose(page, "Geometry measurements");
    mark("measure");
    await measureWithController(page, "equatorial", "Equatorial Ti–O", "distance", [0, 1]);
    await pause(650);
    await measureWithController(page, "axial", "Axial Ti–O", "distance", [0, 5]);
    await pause(700);
    await command(page, "camera.orbit", { horizontalDegrees: 28, verticalDegrees: 22 });
    await still(page, "coordination-ai-distance");
  });
}

try {
  browser = await chromium.launch({ headless: true, args: ["--use-angle=metal", "--use-gl=angle"] });
  const actions = { ligand, water, assembly, protein, solvent, coordination, replay };
  for (const name of subjects.length ? subjects : Object.keys(actions)) {
    if (!actions[name]) throw new Error(`Unknown capture: ${name}`);
    await actions[name]();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
