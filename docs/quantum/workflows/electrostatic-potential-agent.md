# Map electrostatic potential with an agent

Ask your agent to generate and export a density surface colored by the electrostatic potential of all-electron salicylic acid. Use EigenVista 0.10.6 and run the prompts in sequence. [Set up EigenVista](../../setup.md) · [Quantum agent tour](../agent.md) · [GUI version](electrostatic-potential-gui.md)

## Inspect the source and generate the map

```text
Use my connected EigenVista window. If needed, preserve my existing unsaved
work to a fresh .eigenvista file. Open the packaged salicylic-acid-rhf.molden
example, or download the official copy into approved Inputs from
https://uvar-apps.github.io/eigenvista/downloads/salicylic-acid-rhf.molden.
Confirm 16 atoms and find the total electron-density field from its metadata.
Use the example's all-electron RHF/6-31G(d) provenance. Check the live schemas
for all-electron potential mapping and the surface color-range control.
```

```text
Generate one total electron-density isosurface at 0.0248 electrons/bohr³ on a
112 × 112 × 112 grid. Map the all-electron molecular electrostatic potential
onto the density shell. Wait for successful completion. Set the symmetric
potential range to ±0.130 hartree/e. Read the surface back and report its
field, signed level, grid resolution, triangle count and potential units.
```

Expect **one** density mesh with **21,064 triangles**. The isovalue and color scale describe two different quantities. For another Molden calculation, confirm all-electron provenance upstream before asking for potential mapping. [Salicylic acid provenance](https://uvar-apps.github.io/eigenvista/downloads/README-quantum-example.txt) · [Verified upstream workflow](https://uvar-apps.github.io/eigenvista/tutorials-electrostatic-potential.html)

## Set the finish and export the evidence

```text
Apply the vertex-colored Phong preset to the mapped mesh alone. Enable shader
transparency and set opacity to 0.88. Use Liquorice on black. Set the camera
position to (1.1, -6.0, 21.5) bohr, its target to (0, -0.90, 0.24) bohr,
and its up direction to (sin(0.27), cos(0.27), 0), using radians. Export
salicylic-acid-esp.png at a fresh Results path and inspect the figure. Verify
that the numerical potential scale and molecular framework are visible.
Save a fresh salicylic-acid-esp.eigenvista, reopen it and confirm the shell,
mapping and range persisted. Report the PNG and native paths, the units of
both quantities, and the camera and shader values needed for a repeat export.
```

The figure should show a **−0.130 to +0.130 hartree/e** scale. The position and target reproduce the published orientation. The viewport determines framing and PNG dimensions. Connector readback uses `surfaces.generate` with `electrostaticPotential: true`, `surfaces.set_potential_appearance`, and `shader.apply` with `surface-phong-vertex-color` when the connected version advertises these operations. [Connector reference](https://uvar-apps.github.io/eigenvista/downloads/eigenvista-control/reference.md)

Try a second export after asking the agent to change only the color range to **±0.200 hartree/e**. Ask it to confirm the triangle count and camera match the first result. The same surface samples will occupy less of the wider scale, so use a fixed range for comparisons across molecules. [Potential mapping reference](https://uvar-apps.github.io/eigenvista/reference-fields.html)
