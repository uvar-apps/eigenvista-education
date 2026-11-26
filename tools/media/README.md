# Build the teaching media

The finished videos, posters, tracks, and worked-result downloads are committed
under `docs/assets/media/`. GitHub Pages serves these files directly. The
capture clips and scene manifests in `tools/media-input/` support local edits.

## Tutorials and workflow demos

The videos use EigenVista 0.10.6. The GUI footage uses the release-matching
application renderer in Chromium. Agent chapters show captured controller
replays, prompts, and checked results from the packaged Mac connector. The
figure and table downloads were exported with the released native viewer or
assembled from its measured results. Refer to the per-track capture notes for
input files, settings, and output provenance.

Use Node.js, a Chromium installation for Playwright, and FFmpeg with H.264/AAC
encoding. Set `EIGENVISTA_PLAYWRIGHT` to an installed Playwright package when it
is outside this repository. For a narrated tour, also set
`EIGENVISTA_AUDIO_ENGINE` to the HyperFrames `scripts/audio.mjs` path. The audio
engine uses the local English Kokoro voice `af_heart`. Set `HYPERFRAMES_PYTHON`
to a Python environment with `kokoro-onnx` and `soundfile` when needed.

For example, render the orbital demo and its English caption and chapter tracks.

```sh
node tools/media/render.mjs quantum/frontier-orbitals
```

The renderer reads the named scene manifest, composes a 1600 × 900 HTML frame
around each real screenshot or recorded action, and encodes H.264 at 24 frames
per second. The tour transcripts use the same scripts as the narration.

## Concepts

The four original scientific schematics have their own
[HyperFrames sources and build instructions](../media-input/concepts/README.md).

Run the strict MkDocs build after updating published media. Verify the actual
player, captions, chapter controls, poster, and download links on the affected
lesson routes.
