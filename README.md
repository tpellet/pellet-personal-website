# Thomas Pellet — portfolio

Hugo portfolio with a custom theme, responsive navigation, publication filters, a saved light/dark preference, an interactive research graphic, and a downloadable resume. Content remains readable without JavaScript or the optional animation library.

## Development

Use **Hugo extended 0.165.0** and Node.js 24 or newer. GitHub Actions uses the same Hugo version.

```bash
hugo server
hugo --gc --minify
npm install --ignore-scripts
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium webkit
npm run typecheck
npm run test:e2e
```

The browser suite serves the minified `public/` build at the GitHub Pages path prefix. It checks local page links and assets, sharing images, PDF delivery, theme persistence, unavailable/invalid storage, publication filters, mobile navigation, viewport overflow, keyboard focus, reduced motion, unavailable animation library, no-JavaScript access, and 404 recovery in Chromium, mobile Chromium, and WebKit. Test artifacts use a new directory for every attempt. No API key or paid model is required.

To check the same templates on a root domain:

```bash
hugo --gc --minify --baseURL https://portfolio.example/ --destination public-root
E2E_BASE_URL=http://127.0.0.1:4174/ E2E_SITE_DIR=public-root npm run test:e2e
```

The checks exercise local production artifacts; they do not establish that a hosting account is connected or verify external websites. [tester-army/e2e](https://github.com/tester-army/e2e) was considered; its optional agent layer adds no benefit for these deterministic controls, so the suite uses [Playwright directly](https://playwright.dev/docs/test-configuration).

## Editing

- `content/`: page metadata and prose.
- `data/projects.yaml`: public project cards.
- `data/publications.yaml`: publication metadata shared by the home and research pages.
- `layouts/`: local templates, taking precedence over the theme.
- `themes/minimal-portfolio/static/css/style.css`: visual design.
- `static/js/theme-toggle.js`: progressive browser interactions.
- `static/resume/curriculum_vitae_Thomas_Pellet.pdf`: manually maintained resume copy. There is no automatic synchronization.

Use Hugo `relURL` for internal links and assets. The default address is [GitHub Pages](https://tpellet.github.io/pellet-personal-website/), which includes `/pellet-personal-website/`. Root-domain hosts override the build `baseURL`; templates must work in both cases. Never edit generated `public/` or `resources/_gen/` output.

Fonts and animation code are served locally. Manrope and Instrument Serif come from Fontsource 5.3.0, with their OFL licenses in `static/fonts/`. `static/js/motion.js` is the unmodified [Motion 14.0.0 distribution](https://cdn.jsdelivr.net/npm/motion@14.0.0/dist/motion.js), accompanied by its MIT license. Its SHA-256 is `cbd68b4c7f906740542503da2f45aa42a511114959eeb116320afc77812a3d04`. Update these pinned assets deliberately, together with their licenses and browser checks.

## Hosting

GitHub Pages remains the active deployment. Pushing `main` runs `.github/workflows/deploy.yml`, builds with Hugo extended 0.165.0, runs browser checks for both path-prefix and root-domain output, and uploads the Pages artifact only after they pass. Keep repository **Settings → Pages → Source** set to GitHub Actions.

The following configurations prepare additional hosts. Importing the repository and connecting domains require an authenticated hosting account; adding these files alone does not create a deployment.

### Vercel

Import this GitHub repository, use the **Hugo** preset and production branch `main`, and enable Vercel system environment variables. `vercel.json` sets `public` as output and skips npm dependency installation because the site build needs only Hugo.

Set **`HUGO_VERSION=0.165.0`** in the project environment for Production and Preview before the first build. The build command enforces that pin. Production uses `VERCEL_PROJECT_PRODUCTION_URL` (the selected custom domain, or the project `.vercel.app` address); previews use their own `VERCEL_URL`. Both values come from Vercel without a scheme, so the command supplies `https://`. Add the desired custom domain in project settings, then rebuild to update canonical and sharing URLs.

References: [Vercel build settings](https://vercel.com/docs/builds/configure-a-build), [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), [configuration schema](https://vercel.com/docs/project-configuration/vercel-json).

### Cloudflare Pages

In **Workers & Pages → Create application → Pages → Import an existing Git repository**, select this repository and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | Hugo |
| Build command | `hugo --gc --minify --baseURL "${HUGO_BASEURL:-$CF_PAGES_URL}/"` |
| Build output directory | `public` |
| Environment variable, Production and Preview | `HUGO_VERSION=0.165.0` |

Leave `HUGO_BASEURL` unset initially so builds use the deployment address supplied by Cloudflare. After adding a custom domain, set `HUGO_BASEURL` to its production origin **without a trailing slash**, for example `https://portfolio.example`, in the **Production environment only**. Rebuild to update canonical URLs. Keep Preview unset so previews use their own address. `static/_headers` supplies conservative response headers on Cloudflare; Vercel carries matching headers in its configuration. GitHub Pages does not consume `_headers`.

No Wrangler configuration or credentials are needed for this Git integration. Reference: [Cloudflare's Hugo deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/).
