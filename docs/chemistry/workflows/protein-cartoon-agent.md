# Read a protein fold with an agent

Use one camera to compare deposited secondary structure and residue classes in crambin. Start a connector-enabled EigenVista 0.10.6 session, give your agent the session note path, and approve an input and results folder. Use text mmCIF or BinaryCIF. [Set up EigenVista](../../setup.md), [RCSB PDB 1CRN](https://www.rcsb.org/structure/1CRN).

## Ask for matched figures

> Use my authorized EigenVista session. Read its app capabilities and state, and preserve any current unsaved work. Obtain 1CRN from https://files.rcsb.org/download/1CRN.cif or https://models.rcsb.org/1crn.bcif in my approved Inputs folder unless that input is already available. Confirm the imported atom and residue counts, the deposited label and author identity of chain A, and the origin of the secondary assignments. Keep the whole protein visible. Show Protein backbone trace, fit the molecule, and export a new 1crn-trace.png. Keep that camera, switch to Protein cartoon and Secondary structure coloring, then export a new 1crn-secondary.png after the representation is ready. Change only the coloring to Residue class and export a new 1crn-residue-class.png. Compare the legends and what the two color schemes reveal about the same fold. Give me each PNG and its dimensions.

Compare the same source and camera in the trace and cartoon figures. In EigenVista's 1CRN fixtures, you should see **327 atoms**, **46 residues**, one chain **A**, and deposited annotations for **21 helical**, **8 sheet**, and **17 unknown** residues. The last two images share geometry and camera. Their legends encode different attributes. [Upstream fixture record](https://github.com/uvar-apps/eigenvista/tree/v0.10.6/fixtures/bcif).

## Inspect one helix in atomic detail

> Resolve the deposited range ILE 7 through PRO 19 on chain A, using the imported label and author IDs. Show that range, focus it, and switch to Ball and stick for the atomic detail. Confirm the range contains 13 residues and export a new 1crn-helix-detail.png. Restore the full structure and the global Protein cartoon representation. Save a new 1crn-fold.eigenvista with the cartoon and record the session camera, coloring, representation, and original source used in the comparison.

`structure.list` and `residues.list` resolve the source. `structure.set` applies the biological coloring and range, `structure.focus` frames the displayed selection, and `scene.set` sets the global representation. An agent can read back the camera with `camera.get` and keep it fixed for comparison. Session coloring, range, and camera are recorded separately from the saved molecule. [Connector reference](https://uvar-apps.github.io/eigenvista/downloads/eigenvista-control/reference.md).

[Follow the same workflow in the GUI](protein-cartoon-gui.md) · [Back to the chemistry agent tour](../agent.md)
