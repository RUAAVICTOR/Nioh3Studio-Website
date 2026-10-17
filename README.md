# Nioh 3 Studio website

The independent product website for Nioh 3 Studio / 独脚踏鞴工作室.

- Website repository: https://github.com/RUAAVICTOR/Nioh3Studio-Website
- GitHub Pages: https://ruaavictor.github.io/Nioh3Studio-Website/
- Desktop software, downloads and software issues: https://github.com/Master-Bayesian/Nioh3-Scroll-Generator

This repository owns the website only. It has no dependency on a desktop-software checkout, native build, Python, Tauri, game files, database, accounts or a separate download service. Download links continue to point to the software project and the owner's mirrors.

## Local development

Use an existing Node.js 22 installation. There are no npm dependencies to install.

```sh
npm run build
npm test
npm run preview
```

Open the loopback URL printed by the preview script, normally `http://127.0.0.1:4173/`. `npm run dev` builds and starts the same preview. The generated `dist/index.html` can also be opened directly in a browser. Keep its relative asset/language directories intact.

For a different output directory or preview port:

```sh
npm run build -- --out /absolute/output/directory
npm run preview -- --root /absolute/output/directory --port 4174
```

`WEBSITE_TEST_DIST` selects that output directory when running `npm test`. Tests are read-only. On the original Windows host, build/QA output may be directed to `D:/Nioh3_v080_deliverables/tmp/` instead of the source volume.

## Editing

### Update domestic download links

Edit [downloads.json](downloads.json) directly in GitHub using the pencil button, then commit to `main`. This is the only file needed for routine mirror updates. The existing workflow rebuilds and deploys the page automatically.

- `url`: the channel's new HTTPS share URL.
- `password`: its access code, as a quoted string; use `""` if no code is required.
- Baidu's `passwordQuery: "pwd"` automatically inserts the current `password` into the link, overriding any old `pwd` pasted with a URL. Keep that setting when updating the Baidu share.
- `name` contains the three language labels; `id` identifies the channel. These normally stay unchanged. To add a channel, copy an entry and supply a unique ID, all three labels, its URL and optional password. No template or translation-catalog edit is needed for its label.

The two Chinese pages share the same data. English continues to hide domestic downloads. Links and passwords are generated into HTML during the build, with no extra runtime request or backend. A malformed configuration fails the build before deployment, leaving the last successful website in place. The access codes here are public share codes, not account credentials.

| File | Purpose |
| --- | --- |
| `generate.mjs` | Page structure, six hero features and five functional workspace views. |
| `downloads.json`, `shared/downloads.mjs` | Maintained download channels and build-time validation/rendering. |
| `a/style.css` | The selected A layout. Older alternative/comparison layouts are not included. |
| `shared/demo-ui.mjs`, `shared/demo-ui.css` | Static tool UI components. These illustrate the application and do not perform game operations. |
| `shared/engine-section.mjs`, `shared/engine.css` | The generation-engine narrative and three source panels. |
| `shared/engine-excerpts.json`, `shared/code-excerpts.mjs` | Exact source snapshots, original line numbers and common-indentation normalization before highlighting. |
| `i18n/catalog.json` | Simplified Chinese, Traditional Chinese and English text. New Chinese copy needs complete translations. |
| `shared/preferences.js`, `shared/i18n.js`, `shared/interactions.js`, `shared/engine.js` | Theme/language preferences, keyboard behavior and in-place transitions. |
| `seo.mjs`, `seo.config.json`, `build-site.mjs` | Metadata, static language routes and deployment output. |

Edit the source files, then rebuild. `a/index.html`, the runtime translation bundle, coverage metadata and `dist/` are generated and ignored by Git. The site uses relative links so it works at the GitHub Pages project path. English hides the QQ and domestic-download controls. Themes follow the system until manually selected. Reduced motion and no-JavaScript reading remain supported.

## GitHub Pages deployment

`.github/workflows/pages.yml` is an isolated website workflow:

1. Pushes to `main`, pull requests to `main`, and manual dispatches build the site and run checks.
2. `actions/configure-pages` supplies the actual Pages base URL to the build. Canonical URLs, language alternates, social-image URLs and `sitemap.xml` are generated from that URL.
3. Only pushes/manual runs on `main` upload `dist/` and deploy through the `github-pages` environment. PRs do not publish.
4. The build has read permissions. Only the deployment job receives `pages: write` and `id-token: write`. No personal-access-token secret is needed.

The repository's Pages publishing source must be **GitHub Actions**. Action references are pinned to verified commit SHAs. The workflow never checks out, writes to or triggers a release in the software repository.

The default URL is recorded in `seo.config.json` for local builds. If a custom domain is configured later, update that value and Pages settings. The workflow uses the Pages-reported URL when building. Only deploy `dist/`; do not expose the repository root or local review files. A project-level `robots.txt` is included, but control of the account-root `/robots.txt` belongs to the account's user-site configuration; the sitemap can also be submitted directly after publication.

Official workflow reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Content and provenance

The website carries the owner-approved marketing copy. Software views are independent presentational components based on the owner's UI. The Python and Rust excerpts are static source text with file/revision references and original line numbers; no solver runs in the page. Equipment source snapshots reference published commits `ed8e4671333d0ea4de70e03937008a52b2a7ca67` and `b13a34dba6f486b92127dc75ae911bd96cd197c0` of the software project.

The extracted website preserves the most recently reviewed six-feature layout, header-free functional views, in-place transitions and source indentation. Local browser review covered three languages, light/dark, desktop/phone/narrow widths, keyboard navigation, rapid changes and reduced motion. CI checks the independent static build, public assets, locale routes, SEO, feature counts and code formatting without installing browser dependencies.

See [LICENSE](LICENSE), [Arc MIT notice](ARC_LICENSE.txt) and [third-party/source notices](THIRD_PARTY_NOTICES.md).
