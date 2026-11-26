# Inspect a deposited ligand neighborhood in the GUI

Find the atoms around a specific ADP copy in the GroEL–GroES complex. Compare an atom-center cutoff with its whole-residue expansion, then record one distance using the deposited atom identities. Use EigenVista 0.10.6 and the exact [1AON.cif sample](https://uvar-apps.github.io/eigenvista/downloads/1AON.cif). [Set up EigenVista](../../setup.md).

## Find the copy and compare two selections

1. Open the file and confirm **58,870 selected atoms**. Choose **Ball and stick** so individual ligand and protein atoms are visible.
2. Open **Molecule → Selections and measurements → Ligands and neighborhoods** and type `ADP` into **Find ligand copy**. Choose **Select this ligand** beside `ADP · A:1 · residue #8017`. This means author chain **A**, residue **1**, mmCIF label chain **W**. There are seven deposited ADP copies in this input. The selected ligand contains **27 atoms**.
3. Set **Neighborhood radius (Å)** to **4.0** and leave **Include complete residues** off. Enter `ADP A:1 4 Å atoms` in **Save neighborhood as** and choose **Show neighborhood**. Wait for it to finish. Expect **74 selected atoms**, including the 27 seeds.
4. Select the same original ADP copy again to restore the ligand as the search seed. Keep **4.0 Å**, turn **Include complete residues** on, and save `ADP A:1 4 Å complete residues`. Expect **154 selected atoms** spanning **21 residues**, including the ligand and the magnesium ion. The expansion includes every atom of each matched residue, so some of these atoms are farther than 4.0 Å from every ligand atom.

The search uses all loaded source atoms, including hidden ones. Each saved selection is a fixed set of source indices for this document. The first answers which atom centers pass the cutoff. The second gives residue context for those hits.

## Record a contact distance

1. In **Selected atoms**, enter `658, 58678` in **Atom numbers, in measurement order** and choose **Select atom numbers**. Confirm **THR 91 OG1** (author chain A) and **ADP 1 O2B** (author chain A, label chain W). These are one-based GUI atom numbers for the linked sample. If a different input revision gives different numbers, use the deposited identities to resolve them again.
2. Under **Geometry measurements**, add a **Distance** named `THR A:91 OG1 to ADP A:1 O2B`. Expect approximately **2.546 Å**. Export the measurement CSV. Turn on **Always show measurement label** when adding or editing the measurement if you want it visible through geometry.
3. In **Named selections**, choose **Isolate** and **Focus** for the saved complete-residue selection. Export a neighborhood PNG and save a new `1aon-adp-a1.eigenvista` with both named sets and the measurement. The app saves the sets and measurement definition. The current crop and camera remain session settings.

Report the atom-center distance and provenance as geometric observations. Assigning a hydrogen bond or assessing affinity requires additional evidence beyond this cutoff and distance. [RCSB PDB 1AON](https://www.rcsb.org/structure/1AON), [EigenVista inspection reference](https://uvar-apps.github.io/eigenvista/reference-inspection.html).

[Use a connected agent for the same workflow](ligand-neighborhood-agent.md) · [Back to the chemistry GUI tour](../gui.md)
