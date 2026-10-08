# pellet-personal-website

Personal portfolio site (Thomas Pellet): Hugo static site with a custom `minimal-portfolio` theme, deployed to GitHub Pages on every push to `main`.

---

## Toolchain: Hugo (extended)

Use Hugo extended **0.165.0**. CI (`.github/workflows/deploy.yml`) pins this version with `peaceiris/actions-hugo@v3`, `extended: true`. Additional hosts must use the same `HUGO_VERSION` pin.

```bash
hugo server          # local dev server with drafts
hugo --gc --minify   # production build, same flags as CI (output → public/)
```

---

## Compiler Checks (CRITICAL)

Required gates are a clean production build and the TypeScript Playwright browser suite (Node.js 24 or newer):

```bash
hugo --gc --minify
npm run typecheck
npm run test:e2e
```

Install dependencies with `npm install --ignore-scripts` and browsers with `PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium webkit` when needed. Browser checks cover both path-prefix and root-domain builds in CI before deployment. Follow README for the root-domain local check. Fix any error before pushing — a failed gate blocks deployment. Preserve attempt directories; never delete files to clean up.

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
- `tests/`, `playwright.config.ts` — browser behavior checks against generated production output
- `vercel.json`, `static/_headers` — optional-host deployment settings; account connections are separate

Domain rules:

- **Path prefix matters:** GitHub Pages serves `/pellet-personal-website/`; Vercel and Cloudflare/custom domains serve the root. Use Hugo `relURL` for internal links and assets, and select the host's canonical `baseURL` at build time. Do not hardcode the Pages prefix into templates or content.
- **Resume is copied, not synced:** `static/resume/curriculum_vitae_Thomas_Pellet.pdf` is a manually maintained copy. Updating the resume means replacing that file; no automation exists.
- **Deploy:** push to `main` triggers `.github/workflows/deploy.yml` (build → upload `./public` → GitHub Pages). No manual deploy step.
