# EigenVista Education

This repository teaches the released EigenVista desktop application. Start with
the [specification](Specification.md) and the [progress log](PROGRESS.md).

- Keep public content under `docs/`. Add every tutorial to `mkdocs.yml` and link it from `docs/index.md`. For each workflow, keep the GUI and AI connector pages linked to each other.
- Check UI labels, accepted input formats, calculation parameters, and connector behavior against the matching EigenVista release. Treat behavior on upstream `main` as unreleased unless the release contains it. Use the upstream GitHub repository, public website, and a local checkout when available.
- Start a worked example with its input and settings. Include a result readers can check, its units when applicable, and enough detail to distinguish a native save from a figure export.
- Write AI examples as natural-language requests for a local coding agent. Keep connector commands in setup or maintainer notes. Use approved inputs, separate outputs, and wait for calculations before reporting or saving results.
- Preserve provenance and applicable notices for upstream data or captures. Use repository-relative Markdown links within the site. Never add private data, session files, or credentials.
- Run `python -m mkdocs build --strict` from the repository root after changes. Check the affected routes and exercise navigation and search in a browser for changes to layout or site configuration.
- Record changes to scope, source versions, verification, and publication in `PROGRESS.md`. GitHub Actions publishes only the built `site/` directory.

## Serena MCP

Prefer Serena for code and symbol navigation when its tools fit the work. Call
`initial_instructions` first, pass the session ID when required, and verify that
the active project is this workspace. Use filesystem tools for Markdown and
when Serena is unavailable or unsuitable.
