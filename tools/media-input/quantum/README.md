# Quantum lesson media

The workflow PNGs and analysis/measurement CSVs under
`docs/assets/media/quantum/results/` were exported by the Apple Silicon
EigenVista 0.10.6 release through its packaged connector. The orbital-comparison
CSV records metadata and mesh counts read back from that same connector. The
two orbital PNGs were exported in one session at 1680 × 1328 pixels, with a
fixed camera, viewport, background and signed levels. The WebP images are
web-sized derivatives or screenshots of the actual app.

The release ZIP was `EigenVista-0.10.6-apple-silicon-20261125T094508Z-576e80e.zip`.
Its SHA-256 is `6ec1a77af6d616edc68b6fbdeec7b74c81b6b4493870fa6bc972b59de0a959cc`.
[Release](https://github.com/uvar-apps/eigenvista/releases/tag/v0.10.6).

The UI captures use the 1440 × 900 Chromium viewport with the locally built
EigenVista 0.10.6 app served over loopback. The local checkout was `ec70d07`.
The app source and science crates matched `v0.10.6`. The GUI takes show
the visible controls and result checks. The connector chapters pair prompts
with verified native outputs. Browser replays use the same documented control
operations to show the display changing on screen. Short clips keep the
procedure moving, while the lesson text spells out each parameter.

The cancellation take starts a 256³ replacement from a verified 128³ native
file and checks that the four original meshes survive. The frontier and
electrostatic connector replays start from previously verified native meshes
and apply the display controls in sequence. The cube and geometry replays
compute their analyses directly from the linked source fixtures.

| Example | Capture and export settings |
| --- | --- |
| Water tour | HOMO 5 with signed levels ±0.03 bohr⁻³ᐟ² and a 64³ grid. The distance and 65-sample profile span the same oxygen–hydrogen pair. The density extension uses 0.05 electrons/bohr³ on a 48³ grid. Its SAS uses a 1.4 Å probe, Bondi/Mantina radii, and 0.5 Å spacing. The cutaway uses the bundled surface clip shader with `xmax = 0`. |
| Frontier orbitals | Orbitals 26 and 27 with signed levels ±0.03 bohr⁻³ᐟ² and a 128³ grid. Ball and stick, the default teal and burgundy sign colors, and a common camera and light background. Read back each mesh before recording its triangle count. |
| Quantitative cube | The 7³ signed affine fixture, an 81 × 81 XY section spanning 4 × 4 bohr, color range ±0.45 and contours at −0.25, 0 and 0.25. The 81-sample line runs from −4 to +4 bohr along X. The scalar units are unspecified. |
| Electrostatic potential | Salicylic acid total density at 0.0248 electrons/bohr³ and 112³. The mapped shell has 21,064 triangles, a potential range of ±0.130 hartree/e, and the vertex-colored Phong shader at 0.88 opacity. |
| Geometry | Distance order 1, 2. Angle order 1, 2, 7. Torsion order 1, 2, 7, 3. The PNG shows the C1–C2 distance and bridge-carbon label. The CSV retains all three measurements using zero-based source indices. |

The raw WebM clips are source inputs for rebuilding the tutorial videos.
Published media use captions and chapters. The official inputs retain their
credit and terms. [Example provenance](https://uvar-apps.github.io/eigenvista/downloads/README-quantum-example.txt) · [Molden fixtures](https://github.com/uvar-apps/eigenvista/blob/v0.10.6/fixtures/molden/README.md) · [Cube fixtures](https://github.com/uvar-apps/eigenvista/blob/v0.10.6/fixtures/cube/README.md).
