# Progress

## 26 November 2026

### Source baseline

- Reviewed the local EigenVista checkout and confirmed it matched GitHub `main`
  at `ec70d078ed6e98b65271ab61b14d99bb2ccde3c7`. Reviewed the public site and
  matched 102 served files to the checkout, including the 27 sitemap pages and
  custom 404. [Source](https://github.com/uvar-apps/eigenvista/tree/ec70d078ed6e98b65271ab61b14d99bb2ccde3c7) · [Public site](https://uvar-apps.github.io/eigenvista/).
- Based the tutorials on the 0.10.6 desktop release, built from
  `576e80e0aad9cf643b1ff04c6f9b3db5c35cace3`. Used its manuals, example inputs,
  application source and packaged connector reference to check instructions.
  [Release notes](https://github.com/uvar-apps/eigenvista/releases/tag/v0.10.6) · [Connector reference](https://uvar-apps.github.io/eigenvista/downloads/eigenvista-control/reference.md).

### Tutorial delivery

| Phase | Quantum chemistry | Chemistry and biomolecules |
| --- | --- | --- |
| General tours | One GUI tour and one AI connector tour | One GUI tour and one AI connector tour |
| Research workflows | Frontier orbitals, quantitative cube fields, electrostatic potential, and molecular geometry | Protein fold and residue coloring, ligand neighborhoods, SES/SAS comparison, and local coordination geometry |

Each of the eight workflows has a GUI tutorial and an AI connector tutorial.
The [site index](docs/index.md) links to all 20 lessons and the shared [setup
guide](docs/setup.md). The local TiO₆ example is an idealized educational input.

### Verification

- The strict MkDocs build validates navigation, Markdown destinations and local anchors.
- Chromium and WebKit passed all 132 route and viewport checks at 1440, 390,
  and 320 pixels, including the home index, paired links, navigation, search,
  and a fixture download. The 47 unique external tutorial URLs resolved.
- Checks with the released Apple Silicon app and its bundled connector exercised
  native setup, water geometry, water and C₇H₁₀ orbitals, quantitative cube
  inspection, SES/SAS generation, measurement and field tables, PNG export,
  electrostatic potential mapping on the 21,064-triangle salicylic acid mesh,
  and native save and reopen. Supplementary checks used the release converter
  and independent calculations for protein metadata, ligand distances and
  neighborhood counts, and the TiO₆ geometry.
- The GitHub Actions workflow builds the Markdown site, uploads only `site/`
  and deploys it from `main`.

### Publication

- GitHub Pages is configured to publish through GitHub Actions. The build and
  deploy jobs passed for `0c3e9bd1a18d4998c313422d8234060248c9ab3e`.
  [Deployment 45786724301](https://github.com/uvar-apps/eigenvista-education/actions/runs/45786724301).
- Anonymous HTTPS checks matched all 73 built files, covering 22 content routes
  (including all 20 tutorials), the fixture download, search index, and the
  custom 404. [Live education site](https://uvar-apps.github.io/eigenvista-education/).

### Educational material license

- Applied CC BY 4.0 to the original tutorials and teaching examples. Added
  the legal text to [LICENSE](LICENSE), attribution guidance to the README and
  homepage, and a license link to the site footer.
