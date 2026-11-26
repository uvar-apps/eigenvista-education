# EigenVista Education

Hands-on tutorials for quantum chemists and researchers working with molecular
structures, proteins, materials, and catalysts. Each workflow has a desktop GUI
lesson and a companion lesson for a local coding agent using the bundled AI
connector.

[Open the education site](https://uvar-apps.github.io/eigenvista-education/) ·
[EigenVista application and reference](https://uvar-apps.github.io/eigenvista/)

## License

The original tutorials and teaching examples are available under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
For attribution, credit **EigenVista Education**, link to the original material
and the license, and indicate changes. See [LICENSE](LICENSE) for the legal text.

Credited upstream figures and linked datasets carry their source terms. The
salicylic acid figure is distributed with the
[upstream EigenVista notice](docs/assets/eigenvista-license.txt).

## Preview locally

From the repository root, use Python 3.13 to match CI.

```sh
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m mkdocs build --strict
python -m mkdocs serve
```

Open the URL printed by MkDocs. The build writes `site/`, which can be served as
static files. See [AGENTS.md](AGENTS.md) for authoring conventions and
[PROGRESS.md](PROGRESS.md) for release coverage and delivery evidence.
See [the media build guide](tools/media/README.md) to reproduce the videos,
captions, and concept animations.

## GitHub Pages

The repository's **Settings → Pages → Build and deployment → Source** is
**GitHub Actions**. [The Pages workflow](.github/workflows/pages.yml) builds
and validates pull requests. On `main`, it uploads `site/` as a Pages artifact
and deploys it. The workflow can also be run manually from `main`.
