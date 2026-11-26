# Set up EigenVista

The tutorials use the **EigenVista 0.10.6 desktop release**. The two published previews target Apple Silicon Macs and CachyOS Linux x86_64. Each compatible archive includes the viewer, sample inputs, palettes, converter, and the AI connector. [Release downloads](https://github.com/uvar-apps/eigenvista/releases/tag/v0.10.6) · [Platform requirements and installation](https://uvar-apps.github.io/eigenvista/install.html).

## Start the desktop GUI

1. Download the archive for your operating system and CPU and follow the official installation steps. On Linux, keep `bin/` and `share/` within the same extracted directory and launch the app from a graphical session. [Mac installation](https://uvar-apps.github.io/eigenvista/install.html) · [Linux installation](https://uvar-apps.github.io/eigenvista/install.html#linux).
2. Open EigenVista. The tools pane has four tabs: **Molecule**, **Fields**, **Surfaces**, and **Appearance**.
3. Download the input linked in your lesson. Use **Open** in the viewer to load it. Keep a separate folder for `.eigenvista` saves, figures, and inspection tables.

Drag the tools-pane boundary to resize it. **Shift+T** toggles the tools, and **Shift+Z** toggles Zen mode for a minimal scene view. The fullscreen button controls the window separately. [Workspace controls](https://uvar-apps.github.io/eigenvista/reference-scene.html).

For a first tour, choose [quantum chemistry](quantum/gui.md) or [chemistry and biomolecules](chemistry/gui.md).

## Connect a local AI agent

Use a coding agent with terminal and file access on the machine running the app. An image viewer lets it inspect and show you the PNG it exports. The bundled helper connects that local agent to an enabled EigenVista window. [Official connector overview](https://uvar-apps.github.io/eigenvista/ai.html).

### Start an enabled session

On **Mac**, in Finder, right-click **EigenVista.app** and choose **Show Package Contents**. Open **Contents → Resources → AI-connector**, then double-click **Start AI connection.command**. On **Linux**, run the following from the extracted package directory in your graphical session.

```sh
"./share/eigenvista/AI-connector/Start AI connection.sh"
```

The launcher opens a separate, connector-enabled window. Keep its terminal open and give the agent the **nonsecret session-note path** printed by the launcher. Keep the private connection file's contents out of prompts, logs, and uploads. Use the bundled examples or copy a tutorial input into the session's persistent `Inputs/` directory. Each session gets its own `Results/` directory. The launcher also supports `--input` for specific existing data folders you approve. [Launcher options and setup prompt](https://uvar-apps.github.io/eigenvista/ai-install.html).

### Check the connection

Paste the request below, with the session-note filename from the launcher, into the agent you want to use.

```text
Use my EigenVista session note at [path to session note]. Read the packaged
connector instructions and attach to the enabled window using the bundled helper.
Tell me the app version, which file is open, whether there are unsaved changes
or active calculations, and the approved input and results directories. Leave
the current molecule and view as they are. Keep connection credentials private.
```

If the agent has trouble connecting, ask it to check that the enabled window is still running and that the session-note path points to the current session. An ordinary app launch leaves the connector off. The official setup guide also offers an agent-driven installation prompt. [Setup and troubleshooting](https://uvar-apps.github.io/eigenvista/ai-install.html).

Molecular processing and the connection run on your machine. Your agent's model provider may receive prompts, file contents, or images, depending on the agent's configuration. Use public lesson inputs to get started and check your agent's data settings before sharing research files. [Connector privacy](https://uvar-apps.github.io/eigenvista/ai.html#privacy).

For a first tour, choose [quantum chemistry with an agent](quantum/agent.md) or [chemistry and biomolecules with an agent](chemistry/agent.md).

## Keep the data and the figure

- Save a new **`.eigenvista`** file for supported molecular data, computed meshes, and persisted inspection definitions. Record camera, palette, filters, AO, and custom shader settings separately when those choices matter.
- Export a **PNG** for the actual rendered view and **CSV** for supported numerical results. Record source, units, selections, thresholds, and parameters with the output.
- In an agent session, request fresh filenames and ask the agent to confirm each calculation and export completed. Ask it to inspect the exported image if it has an image viewer.

[File reference](https://uvar-apps.github.io/eigenvista/reference-files.html) · [Scientific inspection reference](https://uvar-apps.github.io/eigenvista/reference-inspection.html).
