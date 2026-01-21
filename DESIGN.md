# Design Decisions

## 2026-01-21 - Project Initialized

Project created from brief: "Personal website for professional use with resume sync, photo gallery, and publications"

### Initial Architecture

**Framework:** Hugo (static site generator)
- Fast build times
- Markdown-based content
- Zero runtime dependencies
- Excellent GitHub Pages support

**Hosting:** GitHub Pages
- Free, reliable hosting
- Automatic deployments via GitHub Actions
- SSL included

**Theme:** Custom "minimal-portfolio"
- Clean typography with Inter font
- Mobile-responsive design
- Generous whitespace
- Professional but not corporate

---

## 2026-01-21 - MVP Implementation

**Context:** Need a working portfolio with all core pages.

**Decision:** Build custom minimal theme rather than use existing Hugo theme.

**Rationale:**
- Complete control over design
- No dependency on external theme updates
- Exactly matches the minimalist aesthetic needed
- Simple enough to maintain

**Structure:**
- `/` - Landing page with bio and social links
- `/publications/` - List of articles (placeholder)
- `/gallery/` - Google Photos embed
- `/resume/` - PDF viewer with download link

**Alternatives considered:**
- Hugo themes like "PaperMod" or "Hugo Coder" - too opinionated
- Next.js - overkill for static content
- Plain HTML - harder to maintain

---

*Append new decisions below this line*
