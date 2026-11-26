# Compare SES and SAS in the GUI

Use crambin to compare two meanings of molecular shape at fixed atom radii, probe size, and spacing. Open [1CRN mmCIF](https://files.rcsb.org/download/1CRN.cif) or [BinaryCIF](https://models.rcsb.org/1crn.bcif) in EigenVista 0.10.6. [Set up EigenVista](../../setup.md).

## Generate two meshes from the same source

1. Confirm **327 selected atoms** and choose **Ball and stick**. Clear any custom shader to make the first comparison with built-in materials. In **Surfaces → Molecular surfaces**, choose **Create a new surface**, and name it `Crambin SES`.
2. Set **Surface type** to **Solvent excluded (SES)**, **Source atoms** to **All 327 source atoms**, and **Atomic radii** to **Bondi / Mantina**. Use a **1.4 Å** probe and **0.5 Å** grid spacing. Leave radius overrides empty. Choose **Generate molecular surface** and wait for completion.
3. Choose **Create a new surface** again and name it `Crambin SAS`. Select **Solvent accessible (SAS)** and repeat the same source, radii, probe and spacing. In **Saved molecular surfaces**, expand both entries and verify the settings. For the linked structure and these parameters, expect **27,608 SES triangles** and **34,724 SAS triangles**. Regenerating an existing entry replaces its mesh after a successful calculation.
4. Make both surfaces visible, **Fit scene** once, then show only SES and export a PNG. Show only SAS and export a second PNG without moving the camera. Set the same color and opacity for both surfaces. SES follows the molecular boundary swept by the probe, including reentrant regions. SAS follows the path of the probe's center and offsets the accessible envelope.

## Separate geometry from presentation

At **100% opacity** and with built-in shading, enable **Appearance → Appearance → Molecular surface ambient occlusion** for a second SES image. Compare the two SES PNGs. The shading changes the depth cues while the saved mesh and generation settings stay the same. The separate atom/bond AO switch controls the atomic framework. Leave the camera fixed and keep the original SES and SAS PNGs as the geometric comparison.

An isolated surface from **Current selection** or **Named selection** is computed from those atoms alone. Hidden atoms still count if **All 327 source atoms** is selected. Use this distinction when studying a region on a larger complex. Reducing the spacing samples finer geometry and uses more memory. On failure, keep the accepted result and retry with an explicitly changed spacing or subset if the comparison calls for it.

Save `1crn-solvent-shapes.eigenvista` and reopen it. Verify that both cached meshes and their settings are available. Keep the camera, AO, and shader choices with the PNGs as presentation settings. SES and SAS represent geometry derived from coordinates and radii. Density or electrostatic-potential maps require a separate field or wavefunction input.

[RCSB PDB 1CRN](https://www.rcsb.org/structure/1CRN) · [EigenVista molecular surface reference](https://uvar-apps.github.io/eigenvista/reference-inspection.html#shape)

[Use a connected agent for the same workflow](solvent-surfaces-agent.md) · [Back to the chemistry GUI tour](../gui.md)
