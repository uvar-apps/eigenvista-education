const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const root = document.querySelector('[data-composition-id]');
const duration = Number(root.dataset.duration);
const clock = { seconds: 0 };

const colors = {
  paper: '#f3f1e8', white: '#fffef8', graph: '#e4e9e2', graphite: '#183027',
  secondary: '#425b50', border: '#cbd5c8', green: '#21604e', lightGreen: '#d7e8de',
  cyan: '#24668b', lightBlue: '#d8e8f1', red: '#ac4836', amber: '#ac6d17',
  lightAmber: '#f5e4c7', muted: '#879a90', quiet: '#c1cdc2',
};

const topics = {
  'orbital-phase': ['Orbital phase', 'Wavefunction amplitude', drawOrbital],
  'cube-interpolation': ['Sampling a cube field', 'Scalar-field inspection', drawCube],
  'ligand-expansion': ['Two ways to select neighbors', '1AON · ADP A:1', drawLigand],
  'solvent-surfaces': ['Two solvent surfaces', 'Two-atom cross-section', drawSurfaces],
};

function label(value, x, y, { size = 28, color = colors.graphite, bold = false, family = 'Arial', align = 'left' } = {}) {
  ctx.font = `${bold ? 700 : 400} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function paragraph(value, x, y, width, options) {
  const length = options.size ?? 28;
  const words = value.split(' ');
  let line = '';
  ctx.font = `${options.bold ? 700 : 400} ${length}px ${options.family ?? 'Arial'}`;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > width) {
      label(line, x, y, options);
      line = word;
      y += Math.round(length * 1.27);
    } else {
      line = candidate;
    }
  }
  if (line) label(line, x, y, options);
}

function box(x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function path(points, stroke, width = 2, dash = []) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

function disk(x, y, radius, fill, stroke = null, width = 2, dash = []) {
  if (radius <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.setLineDash(dash);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.restore();
}

function opacity(alpha, draw) {
  ctx.save();
  ctx.globalAlpha = alpha;
  draw();
  ctx.restore();
}

function progress(time, start, end) {
  const fraction = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return fraction * fraction * (3 - 2 * fraction);
}

function base(title, topic, time) {
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, 1280, 720);
  label(topic, 58, 52, { size: 23, color: colors.green, bold: true });
  label(title, 56, 113, { size: 61, family: 'Georgia', color: colors.graphite });
  path([[58, 154], [1222, 154]], colors.border, 2);
  box(58, 183, 744, 442, 18, colors.white, colors.border);
  box(822, 183, 400, 442, 18, colors.lightGreen, colors.border);
  for (let x = 80; x < 800; x += 26) {
    for (let y = 205; y < 614; y += 26) disk(x, y, 1.05, colors.graph);
  }
  label('EigenVista Education', 58, 664, { size: 21, bold: true, color: colors.secondary });
  path([[1030, 664], [1222, 664]], colors.border, 4);
  path([[1030, 664], [1030 + time / duration * 192, 664]], colors.green, 4);
}

function callout(kicker, headline, detail, annotation = '') {
  label(kicker, 854, 239, { size: 23, bold: true, color: colors.green });
  paragraph(headline, 853, 298, 330, { size: 38, bold: true });
  paragraph(detail, 854, 403, 330, { size: 27, color: colors.secondary });
  if (annotation) {
    path([[854, 539], [1190, 539]], colors.border, 2);
    label(annotation, 854, 575, { size: 24, bold: true, color: colors.green });
  }
}

function lobe(side, fill, sign) {
  ctx.save();
  ctx.translate(430, 396);
  ctx.scale(side, 1);
  const shading = ctx.createLinearGradient(26, 0, 206, -70);
  shading.addColorStop(0, fill);
  shading.addColorStop(1, fill === colors.amber ? '#bf892f' : fill === colors.red ? '#c76750' : '#4086a7');
  ctx.beginPath();
  ctx.moveTo(31, 0);
  ctx.bezierCurveTo(65, -59, 124, -108, 188, -89);
  ctx.bezierCurveTo(240, -75, 241, 76, 188, 89);
  ctx.bezierCurveTo(124, 109, 65, 59, 31, 0);
  ctx.fillStyle = shading;
  ctx.fill();
  ctx.restore();
  if (sign) label(sign, 430 + side * 155, 397, { size: 63, color: colors.white, align: 'center', bold: true });
}

function drawOrbital(time) {
  const flipped = time >= 6.9;
  const density = time >= 11;
  path([[430, 256], [430, 529]], colors.muted, 3, [8, 10]);
  if (density) {
    lobe(-1, colors.amber, '');
    lobe(1, colors.amber, '');
  } else {
    lobe(-1, flipped ? colors.cyan : colors.red, flipped ? '+' : '−');
    lobe(1, flipped ? colors.red : colors.cyan, flipped ? '−' : '+');
  }
  disk(430, 396, 9, colors.graphite, colors.white, 3);
  label('Schematic p-like orbital', 430, 218, { size: 22, color: colors.secondary, align: 'center' });
  label('Node  ·  ψ = 0', 430, 565, { size: 33, align: 'center', bold: true });
  if (time < 5) {
    callout('Signed amplitude', 'Opposite phases', 'The colors show opposite signs of ψ on either side of a node.', 'Two signs, one orbital');
  } else if (!density) {
    opacity(Math.sin(progress(time, 5, 9) * Math.PI), () => disk(430, 396, 34, null, colors.green, 3));
    callout('Global sign change', 'ψ → −ψ', 'Flip both signs together. The nodal plane stays in place.', 'Same amplitude magnitude');
  } else {
    callout('One-orbital density', 'Square the amplitude', 'Both signs give the same nonnegative density.', '|−ψ|² = |ψ|²');
  }
}

// The rightmost cell uses fixture indices i=5..6, j=3..4, k=3..4.
const cubeCorners = [
  0.09729610020035, 0.04229130156845, 0.03781476943949, 0.01466189752599,
  0.004407131464869, 0.001907746722418, 0.001215293922077, 0.0004698255641306,
];

function cubePoint(i, j, k) {
  return [163 + 157 * i + 100 * j + 31 * k, 484 + 12 * i - 50 * j - 136 * k];
}

function cubeCell(i, stroke, width) {
  for (const a of [0, 1]) {
    for (const b of [0, 1]) {
      path([cubePoint(i, a, b), cubePoint(i + 1, a, b)], stroke, width);
      path([cubePoint(i + a, 0, b), cubePoint(i + a, 1, b)], stroke, width);
      path([cubePoint(i + a, b, 0), cubePoint(i + a, b, 1)], stroke, width);
    }
  }
}

function drawCube(time) {
  const p = progress(time, 1, 9);
  const outside = time > 12;
  const u = outside ? 1 + 0.72 * progress(time, 12, 14.1) : 0.19 + 0.71 * p + 0.1 * progress(time, 10, 12);
  const v = 0.36 + 0.22 * p;
  const w = 0.24 + 0.39 * p;
  const probe = cubePoint(1 + u, v, w);
  const boundary = cubePoint(2, v, w);
  cubeCell(0, colors.quiet, 2);
  cubeCell(1, colors.green, 4);
  let value = 0;
  for (const i of [0, 1]) {
    for (const j of [0, 1]) {
      for (const k of [0, 1]) {
        const point = cubePoint(1 + i, j, k);
        const weight = (i ? u : 1 - u) * (j ? v : 1 - v) * (k ? w : 1 - w);
        if (!outside && time >= 4.6) opacity(0.23 + weight, () => path([point, probe], colors.amber, 3));
        disk(...point, 8, colors.green, colors.white);
        value += weight * cubeCorners[4 * i + 2 * j + k];
      }
    }
  }
  if (outside) path([boundary, probe], colors.red, 4, [7, 10]);
  disk(...probe, 19, outside ? colors.lightAmber : colors.lightGreen, outside ? colors.red : colors.amber, 3);
  disk(...probe, 7, outside ? colors.red : colors.amber);
  label('Two outer cells from signed-affine.cube', 430, 565, { size: 27, align: 'center', bold: true });
  if (time < 4.6) {
    callout('Affine coordinates', 'Locate the cell', 'Use the cube’s grid vectors to find the enclosing cell.', '7 × 7 × 7 stored samples');
  } else if (!outside) {
    callout('Trilinear weights', 'Blend eight corners', 'Weight each corner by the sample’s fractional position in the cell.', `Scalar ≈ ${value.toFixed(4)}`);
  } else {
    callout('Finite grid', 'Outside the domain', 'Beyond the final grid face, no cell encloses the probe.', 'Status: outside');
  }
}

const pocketResidues = [
  [[250, 323], [208, 290], [161, 278], [127, 248]],
  [[416, 291], [450, 260], [500, 255], [539, 228]],
  [[483, 401], [533, 416], [576, 384], [622, 381]],
  [[354, 466], [371, 511], [430, 523], [459, 551]],
  [[234, 442], [190, 464], [154, 499], [116, 499]],
  [[635, 453], [678, 472], [716, 446], [747, 455]],
];
const ligandCenter = [329, 377];
const cutoff = 157;

function drawLigand(time) {
  const expanded = time >= 8.3;
  const select = progress(time, 0.2, 3.6);
  const resolution = progress(time, 8.3, 10.2);
  const isHit = ([x, y]) => Math.hypot(x - ligandCenter[0], y - ligandCenter[1]) <= cutoff;
  disk(...ligandCenter, cutoff * select, '#edf5ee', colors.green, 3, [10, 9]);
  for (const residue of pocketResidues) {
    const hasHit = residue.some(isHit);
    path(residue, colors.quiet, 6);
    if (expanded && hasHit) opacity(resolution, () => path(residue, colors.amber, 6));
    for (const point of residue) {
      const withinVisibleCutoff = Math.hypot(point[0] - ligandCenter[0], point[1] - ligandCenter[1]) <= cutoff * select;
      disk(...point, 11, withinVisibleCutoff ? colors.green : colors.quiet, colors.white, 2);
      if (expanded && hasHit && !isHit(point)) opacity(resolution, () => disk(...point, 12, colors.amber, colors.white, 2));
    }
  }
  const ligand = [[299, 394], [329, 377], [351, 399], [375, 382], [395, 395]];
  path(ligand, colors.cyan, 8);
  ligand.forEach((point) => disk(...point, 12, colors.cyan, colors.white, 2));
  disk(...ligandCenter, 14, colors.cyan, colors.white, 3);
  path([[329, 377], [329, 222]], colors.green, 2, [5, 6]);
  label('4 Å', 343, 248, { size: 27, bold: true, color: colors.green });
  label('One seed radius shown schematically', 430, 579, { size: 28, color: colors.secondary, align: 'center' });
  if (!expanded) {
    callout('Distance selection', '74 selected atoms', 'Count every atom within 4 Å of any atom in the chosen ADP copy.', 'Includes all 27 ADP seeds');
  } else {
    callout('Whole-residue selection', '154 selected atoms', 'Include every atom of each matched residue, even beyond the cutoff.', '21 residues in this sample');
  }
}

const atomicRadius = 1.8;
const probeRadius = 1.4;
const halfDistance = 2.1;
const inflated = atomicRadius + probeRadius;
const probeHeight = Math.sqrt(inflated ** 2 - halfDistance ** 2);
const tangent = Math.atan2(probeHeight, halfDistance);
const toScreen = (x, y) => [430 + x * 47, 413 - y * 47];

function arc(cx, cy, radius, start, end) {
  return Array.from({ length: 33 }, (_, index) => {
    const theta = start + (end - start) * (index / 32);
    return toScreen(cx + radius * Math.cos(theta), cy + radius * Math.sin(theta));
  });
}

function upperSurface(radius, centerArc = []) {
  return [
    ...arc(-halfDistance, 0, radius, Math.PI, tangent),
    ...centerArc,
    ...arc(halfDistance, 0, radius, Math.PI - tangent, 0),
  ];
}

const sas = upperSurface(inflated);
const ses = upperSurface(atomicRadius, arc(0, probeHeight, probeRadius, Math.PI + tangent, 2 * Math.PI - tangent));

function drawSurfaces(time) {
  const drawSas = progress(time, 0.5, 3);
  const drawSes = progress(time, 7.6, 10.3);
  const travel = progress(time, 1.0, 12.5) * (sas.length - 1);
  const previous = Math.floor(travel);
  const next = Math.min(previous + 1, sas.length - 1);
  const center = sas[previous].map((value, axis) => value + (sas[next][axis] - value) * (travel - previous));
  const mirrored = (points) => points.map(([x, y]) => [x, 826 - y]);
  const outline = (points, stroke, width, dash = []) => path([...points, ...mirrored(points).reverse(), points[0]], stroke, width, dash);
  for (const x of [-halfDistance, halfDistance]) {
    const atom = toScreen(x, 0);
    disk(...atom, atomicRadius * 47, '#d8e2d7', '#a4b4a7', 2);
    disk(...atom, 6, colors.secondary);
  }
  opacity(drawSas, () => outline(sas, colors.cyan, 4, [10, 9]));
  opacity(drawSes, () => outline(ses, colors.green, 5));
  if (time >= 1.0) {
    if (time < 13.2) disk(...center, probeRadius * 47, '#f7d8a83a', colors.amber, 3);
    disk(...center, 8, colors.amber, colors.white, 2);
  }
  label('Atom radius 1.8 Å  ·  Probe 1.4 Å  ·  Spacing 4.2 Å', 430, 592, { size: 25, align: 'center', bold: true });
  if (time < 7.6) {
    callout('Solvent-accessible surface', 'Follow the center', 'The dashed path traces the center of the rolling solvent probe.', 'SAS  ·  dashed blue');
  } else {
    callout('Solvent-excluded surface', 'Trace the boundary', 'Solid contact arcs join the concave arc swept by the probe between atoms.', 'SES  ·  solid green');
  }
}

function draw(time) {
  const [title, topic, render] = topics[root.dataset.compositionId];
  base(title, topic, time);
  render(time);
}

function createDiagramTimeline() {
  const timeline = gsap.timeline({ paused: true });
  timeline.to(clock, { seconds: duration, duration, ease: 'none', onUpdate: () => draw(clock.seconds) });
  draw(0);
  return timeline;
}
