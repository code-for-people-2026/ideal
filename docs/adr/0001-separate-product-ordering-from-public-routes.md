# Separate product ordering from public routes

Product source directories use deliberate numeric prefixes so the repository
can show the non-contiguous `1 → 3 → 9` evolution blueprint and its related
explorations. Public GitHub Pages routes use stable English slugs without those
prefixes: repository ordering may evolve as evidence reveals new product levels,
but that must not force public URLs to change. The mapping is therefore explicit
in `pages-prototypes.txt` rather than inferred from directory names.
