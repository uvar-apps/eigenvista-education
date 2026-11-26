# Chemistry and biomolecules in the GUI

Use EigenVista 0.10.6 to inspect coordinates, measure a structure, read a protein fold, and build a solvent surface. Start with water to learn the controls, then use the GroEL–GroES complex to see how they scale to chains, residues, and ligands. [Set up EigenVista](../setup.md).

## Open a structure and measure it

1. Open the packaged `water.xyz` or [download the example](https://uvar-apps.github.io/eigenvista/downloads/water.xyz). In **Molecule → Molecular data**, confirm **3 atoms** and **2 bonds**. Click the oxygen and hydrogens to confirm their identities and numbers. This XYZ stores a single geometry in Å. The viewer infers its display bonds from the coordinates.
2. Try **Ball and stick** for the atom positions and connections, **Liquorice** for a thicker framework, and **Van der Waals** for the space-filling envelope. Drag to rotate, right-drag to pan, and scroll to zoom. **Fit scene** restores the framing. Click an atom to read its one-based number and coordinates in Å.
3. In **Molecule → Selections and measurements**, enter `1, 2` in **Atom numbers, in measurement order** and choose **Select atom numbers**. In **Geometry measurements**, set **Distance**, name it `O–H distance`, and choose **Add measurement**. Expect **0.9572 Å**. Use **Pick atoms for inspection** if you prefer clicking. The gold reticles mark the chosen source atoms.
4. Select `2, 1, 3`, choose **Angle**, and add `H–O–H angle`. The middle atom is the vertex. Expect **104.46°**. A signed torsion uses four ordered atoms. **Export measurement CSV** writes the recorded measurements.
5. Use **Atom and residue labels** to add an atom label `O` to atom **1**. To recall a group of atoms later, use **Named selections**. Save a new `water-inspection.eigenvista` and export a PNG using the scene toolbar. Reopen the native file and check the measurements and label.

## Explore a protein assembly

1. Open [1AON.cif](https://uvar-apps.github.io/eigenvista/downloads/1AON.cif). Confirm **58,870 selected atoms** for this file. Read **Molecule → Provenance** for how the importer handled source records. Text mmCIF and BinaryCIF can retain selected atom, residue, chain, and entity identities. PDB can retain atom, residue, and chain identities. The importer uses the first model and a defined alternate-location policy.
2. Choose **Protein cartoon** in the global **Representation** menu. Try **Protein backbone trace**, **Protein smooth tube**, and **Protein ribbon** to compare how they depict the same backbone. Protein depictions use supported backbone segments and deposited assignments.
3. In **Molecule → Molecular data → Biological structure**, try **Chain** coloring to distinguish copies, then **Entity** to group copies with a shared deposited entity. Expand **Components** to toggle the present protein, ligand, ion, and other kinds. Use the representation selector for a component if you want the protein in cartoon and its ligands in Ball and stick.
4. Expand **Chains**, find label chain **A** (author **A**), and choose **Isolate** and **Focus**. Try **Secondary structure** coloring for deposited helices and strands, then **Residue class** to see the side-chain classes. Unassigned secondary structure is gray in the secondary-structure view. The residue class view describes amino-acid identity independently of pH.
5. Use **Show all components** before exploring a different chain or ligand. **Residue range** takes deposited identifiers, which may include insertion codes. **Ligands and neighborhoods** uses the selected ligand copy as the seed for distances to nearby atom centers. The [ligand neighborhood workflow](workflows/ligand-neighborhood-gui.md) walks through one ADP copy with exact checks.

![The full 1AON complex as protein cartoons, with each deposited chain instance assigned a color](https://uvar-apps.github.io/eigenvista/assets/media/1aon-cartoon-chain.webp)

> The full complex in Protein cartoon with Chain coloring. [EigenVista Gallery capture](https://uvar-apps.github.io/eigenvista/gallery.html#1aon-cartoon-chain).

The source and experimental citation for the complex are available with the deposit. [RCSB PDB 1AON](https://www.rcsb.org/structure/1AON), [EigenVista structure reference](https://uvar-apps.github.io/eigenvista/reference-structures.html).

## Build and present a surface

1. Reopen water and choose **Surfaces → Molecular surfaces**. Create `Water SES` using **Solvent excluded (SES)**, **All 3 source atoms**, **Bondi / Mantina**, a **1.4 Å** probe and **0.25 Å** spacing. Use **Generate molecular surface** and wait for it to finish. Read back the saved mesh settings. SES follows the molecular boundary swept by the probe. To compare the boundary traced by the probe center, create a second mesh using **Solvent accessible (SAS)** and keep the inputs fixed. With the linked XYZ and these settings, expect **1,712 SES triangles** and **5,848 SAS triangles**.
2. Use **Saved molecular surfaces** to toggle visibility and change the surface color or opacity. In **Appearance → Appearance**, try **Molecular surface ambient occlusion** with an opaque mesh and built-in shading. The atom/bond AO control is separate. In **Atom colours**, load the packaged MatterViz Pastel JSON and use Element coloring when biological coloring is available. These controls change the appearance of the same geometry.
3. For a transparent finish, use **Appearance → Surface shader**. Load the packaged `surface-x-ray.vert`, `surface-x-ray.frag`, and `surface-x-ray.params`, target `Water SES`, leave **Shader transparency** enabled, and choose **Apply shader**. Try **Clear shader** to return to built-in shading. Use the scene toolbar to export a PNG with either opaque or transparent background.
4. Save a new native file. The molecule, named sets, measurements, annotations, global representation, and cached meshes are durable. Record the camera, biological filters, palette, AO, background, and shader settings alongside your PNG if you want to recreate the scene.

Use **Convert files** when you want to convert supported inputs to native `.eigenvista` files without opening each in the scene. Keep the original files with their full source records. Coordinate-only examples show **No quantum fields**. To inspect a supplied scalar grid, open a compatible [Gaussian Cube](https://uvar-apps.github.io/eigenvista/tutorials-cube.html) and use the **Fields** tab for its rendering and quantitative inspection controls. A materials or catalyst model that requires periodic distances should be prepared in a crystallographic or simulation tool. EigenVista's measurements apply to the atoms actually loaded, in nonperiodic Cartesian space. [File and format reference](https://uvar-apps.github.io/eigenvista/reference-files.html).

## Continue with a workflow

- [Compare protein representations and colorings](workflows/protein-cartoon-gui.md)
- [Inspect one deposited ligand neighborhood](workflows/ligand-neighborhood-gui.md)
- [Compare SES and SAS at fixed parameters](workflows/solvent-surfaces-gui.md)
- [Measure local coordination geometry](workflows/coordination-geometry-gui.md)
- [Follow this tour with a connected agent](agent.md)
