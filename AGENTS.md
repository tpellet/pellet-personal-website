# pellet-personal-website

Personal portfolio site (Thomas Pellet): Hugo static site with a custom `minimal-portfolio` theme, deployed to GitHub Pages on every push to `main`.

---

## Toolchain: Hugo (extended)

No version pin locally; CI (`.github/workflows/deploy.yml`) builds with `peaceiris/actions-hugo@v3`, `hugo-version: 'latest'`, `extended: true`. Use the extended Hugo binary.

```bash
hugo server          # local dev server with drafts
hugo --gc --minify   # production build, same flags as CI (output → public/)
```

---

## Compiler Checks (CRITICAL)

There is no lint, formatter, or test suite in this repo. The only gate is a clean build:

```bash
hugo --gc --minify
```

Broken front matter, bad template syntax, or missing referenced assets surface here. Fix any error before pushing — a failed build breaks the deploy.

---

## pellet-personal-website — This Project

Layout:

- `hugo.toml` — site config: `baseURL = 'https://tpellet.github.io/pellet-personal-website/'`, theme, menu, params
- `content/` — Markdown pages (`_index.md`, `projects.md`, `gallery.md`, `resume.md`, `publications/_index.md`)
- `layouts/` — local overrides (`_default/baseof.html`, `_default/projects.html`, `partials/head.html`); these take precedence over the theme
- `themes/minimal-portfolio/` — custom theme: base/list/single templates, CSS
- `data/projects.yaml` — project list rendered by `layouts/_default/projects.html`
- `static/` — verbatim assets: `js/theme-toggle.js`, `resume.pdf`, `resume/curriculum_vitae_Thomas_Pellet.pdf`
- `public/` — build output, gitignored; never edit it
- `resources/_gen/` — Hugo asset cache, gitignored

Domain rules:

- **Path prefix matters:** the site is served under `/pellet-personal-website/`. Hardcoded absolute links must include it — `content/resume.md` already hardcodes `/pellet-personal-website/resume/...` (raw HTML is allowed via `unsafe = true` in `hugo.toml`).
- **Resume is copied, not synced:** `static/resume/curriculum_vitae_Thomas_Pellet.pdf` is a manual copy of the canonical PDF in the Interviews repo (per README). Updating the resume = replace that file; no automation exists.
- **Deploy:** push to `main` triggers `.github/workflows/deploy.yml` (build → upload `./public` → GitHub Pages). No manual deploy step.
