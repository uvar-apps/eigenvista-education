# Scientific animation sources

The four diagrams are original Canvas drawings. HyperFrames renders each paused
GSAP timeline to a 16-second 1280 × 720 H.264 video at 24 fps. The build also
writes one static WebP preview and English WebVTT captions for each diagram.

| Diagram | Source and conventions |
| --- | --- |
| Orbital phase | An idealized p-like orbital illustrates opposite signs of the amplitude, global sign inversion, and invariant one-orbital density. [EigenVista orbital guide](https://uvar-apps.github.io/eigenvista/tutorials-orbitals.html) |
| Sampling a cube field | The cell projection is schematic. The displayed trilinear result uses eight stored corner values at grid indices `i=5..6`, `j=3..4`, and `k=3..4` from the EigenVista 0.10.6 signed-affine fixture. [Source cube](https://github.com/uvar-apps/eigenvista/blob/v0.10.6/fixtures/cube/signed-affine.cube) |
| Two ways to select neighbors | The drawing shows example residues and one seed's 4 Å radius. The reported atom and residue counts come from the worked 1AON ADP A:1 calculation. [Ligand workflow](../../../docs/chemistry/workflows/ligand-neighborhood-gui.md) |
| Two solvent surfaces | An equatorial cross-section of two equal spheres uses 1.8 Å atom radii, a 1.4 Å probe radius, and 4.2 Å between atom centers. The SAS follows the outer arcs of the inflated spheres. The solid SES follows the atomic contact arcs and the inner rolling-probe arc. [Scientific inspection manual](https://uvar-apps.github.io/eigenvista/reference-inspection.html#shape) |

Run the builder with Node, HyperFrames 0.9.52, GSAP 3.14.2, FFmpeg with WebP
encoding, and the HyperFrames Chromium browser available.

```sh
GSAP_PATH=/path/to/gsap/dist/gsap.min.js node tools/media-input/concepts/build.mjs
```

Set `HYPERFRAMES_BIN`, `HYPERFRAMES_FFMPEG_PATH` or `HYPERFRAMES_FFPROBE_PATH` to
select binaries outside your `PATH`. An optional diagram ID limits the build to
one diagram. The temporary composition directories are removed when the render
finishes.
