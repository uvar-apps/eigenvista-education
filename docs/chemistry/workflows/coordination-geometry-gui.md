# Measure local coordination geometry in the GUI

Compare equatorial and axial distances in a local coordination model. The [TiO₆ teaching XYZ](../data/tio6-local.xyz) is an idealized, finite set of seven atoms in Å. It models an elongated oxygen octahedron around titanium. Use the exercise to practice recording geometry from a cluster or local site prepared elsewhere. [Set up EigenVista](../../setup.md).

## Import and choose the atom pairs

1. Open `tio6-local.xyz` in EigenVista 0.10.6. Choose **Ball and stick** and confirm **7 atoms** in **Molecule → Molecular data**. Atom **1** is Ti at the origin, atoms **2–5** are oxygen on the ±x and ±y axes, and **6–7** are oxygen on ±z. Use a click in the scene to confirm an atom's identity and coordinates.
2. Under **Molecule → Selections and measurements**, enter each ordered list below in **Atom numbers, in measurement order** and choose **Select atom numbers**. Choose the matching **Measurement type**, set the name, and use **Add measurement**. Repeat for each row.

| Name | Type | Atom numbers | Expected result |
| --- | --- | --- | --- |
| Equatorial Ti–O | Distance | `1, 2` | 1.950 Å |
| Axial Ti–O | Distance | `1, 6` | 2.100 Å |
| Equatorial–axial O–Ti–O | Angle | `2, 1, 6` | 90° |
| Opposite axial O–Ti–O | Angle | `6, 1, 7` | 180° |
| Example O–Ti–O–O torsion | Signed torsion | `2, 1, 4, 6` | −90° |

In the angle rows, atom **1** is the vertex. The signed torsion is a four-point geometric check of the application convention. Only the specified order gives the listed sign. A collinear plane reports **Undefined** for torsion. Keep the two distance monitors visible and export a figure comparing the short and long distances.

## Document what the coordinates show

Use **Atom and residue labels** to label atom **1** `Ti`, then **Export measurement CSV** under **Geometry measurements** to retain the values and units. Save `tio6-local-geometry.eigenvista` and reopen it to confirm that the annotations and measurement definitions persist. The axial distance exceeds the equatorial distance by **0.150 Å** in this input.

Use the same procedure to compare local sites across finite exported models. Record the coordinate source, model or frame ID, units, and atom identities for each value. For periodic materials, assemble the intended neighbors in Cartesian coordinates with your crystallographic or simulation tool first. EigenVista measures the explicitly loaded coordinates and its display connectivity is a geometric guide. The teaching file provides no energetic, oxidation-state, periodic, or bond-order evidence. [EigenVista file reference](https://uvar-apps.github.io/eigenvista/reference-files.html), [Geometry and selection reference](https://uvar-apps.github.io/eigenvista/tutorials-geometry.html).

[Use a connected agent for the same workflow](coordination-geometry-agent.md) · [Back to the chemistry GUI tour](../gui.md)
