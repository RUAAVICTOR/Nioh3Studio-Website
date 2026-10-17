# Website repository guidance

- This repository contains only the Nioh 3 Studio product website. The desktop software, releases and updater belong to `Master-Bayesian/Nioh3-Scroll-Generator` and must not be modified as part of website work.
- Communicate with the owner in Simplified Chinese. Write source comments and repository documentation in English; maintain all three UI locales.
- Use Node.js 22. There are no npm dependencies to install. Run `npm run build` and `npm test`; serve with `npm run preview`.
- Edit templates, CSS, JavaScript and `i18n/catalog.json`; do not hand-edit generated pages in `a/` or `dist/`.
- Source excerpts are presentation-only snapshots in `shared/engine-excerpts.json`. Preserve their content, source references, original line numbers and relative indentation. Do not run a native generation engine in the website.
- Keep six hero features, five workspace demonstrations, three source panels, English QQ/domestic-download gating, theme preferences, reduced motion and keyboard navigation intact.
- Deploy only `dist/`. Never include local evidence, native software files, browser profiles or credentials in a deployment artifact.
- GitHub Pages deploys from `main` through `.github/workflows/pages.yml`; pull requests perform build/check only. Do not change workflow permissions beyond what deployment requires.
