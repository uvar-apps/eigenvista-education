# Compare SES and SAS with an agent

Use a matched pair of crambin surfaces to isolate the effect of changing the surface definition. Start a connector-enabled EigenVista 0.10.6 session and give the agent the session note path. [Set up EigenVista](../../setup.md), [RCSB PDB 1CRN](https://www.rcsb.org/structure/1CRN).

## Generate the matched meshes

> Use my authorized EigenVista session. Preserve any current unsaved work. Open 1CRN from my approved Inputs folder, downloading https://models.rcsb.org/1crn.bcif there if needed. Confirm the preview has 327 source atoms. Show Ball and stick and clear any active custom shader. Generate a solvent-excluded surface and a separate solvent-accessible surface with all source atoms, Bondi/Mantina radii, a 1.4 angstrom probe, 0.5 angstrom spacing, and no radius overrides. Keep the two results under separate IDs. Wait for each job to succeed before moving on. Read back both settings, mesh counts, and any warnings from the app.

Compare the accepted settings first. Atom list, radii, probe and spacing agree, and surface kind differs. For the linked structure and these parameters, expect **27,608 SES triangles** and **34,724 SAS triangles**. For the connector's `molecularSurfaces.generate` method, an empty `atom_indices` list requests **all** source atoms, including hidden atoms. A nonempty list makes an isolated-subset surface. Read current provenance, diagnostics and counts with `molecularSurfaces.list` and page the resolved radii with `molecularSurfaces.atoms` if needed. [Connector reference](https://uvar-apps.github.io/eigenvista/downloads/eigenvista-control/reference.md).

## Export a controlled comparison

> Show both surfaces and fit the visible scene once. Keep the camera, background, base shading, surface color, and opacity fixed. With built-in shading and molecular surface AO off, export new 1crn-ses.png and 1crn-sas.png by showing one surface at a time. Describe how the probe boundary and probe-center envelope differ in those views. For the SES only, make opacity 100%, enable independent molecular surface ambient occlusion with automatic radius, and export a third image. Verify that the accepted SES mesh is unchanged. Save a new 1crn-solvent-shapes.eigenvista retaining both meshes and record the actual settings, warnings, output paths, and PNG dimensions.

`molecularSurfaces.set` changes visibility and appearance while retaining mesh geometry. `scene.set` has a separate `ambientOcclusion.surfaceEnabled` switch for built-in opaque molecular surfaces. Compare like-for-like meshes before interpreting the shading. Each job publishes a result only after success, and previously accepted meshes remain available after a failed or cancelled job. A connection error or timeout leaves job completion unverified until the agent checks the job status. [EigenVista molecular surface reference](https://uvar-apps.github.io/eigenvista/reference-inspection.html#shape).

[Follow the same workflow in the GUI](solvent-surfaces-gui.md) · [Back to the chemistry agent tour](../agent.md)
