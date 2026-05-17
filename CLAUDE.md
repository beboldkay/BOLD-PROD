# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Single-page marketing site for **BOLD Productions** (experiential / guerrilla marketing agency, TLV-based). Everything ships as one self-contained HTML file — markup, Tailwind config, CSS, and JS are all inline. There is no build system, no package manager, no tests, and no linter.

## Files

- `WEB` — **current production page** (English/LTR, ~720 lines). Includes the live brief form (Formspree), HUD canvas animation, hero word-swap glitch, toast/status UX, and `prefers-reduced-motion` handling. This is the file to edit for any real changes.
- `Bold .txt` — **earlier prototype** (Hebrew/RTL, ~340 lines). No form submission, no canvas, no reduced-motion handling. Kept for reference / Hebrew copy. Do **not** edit this when asked to change "the site" unless the user explicitly wants the Hebrew version updated.

Note the space in `Bold .txt` — quote the path in shell commands.

## Deploying / running locally

The file at `WEB` is meant to be served as `index.html`. There's no dev server config; preview with any static server, e.g.:

```
python3 -m http.server 8000   # then open http://localhost:8000/WEB
```

Before deploying (per the inline `HOW TO USE` block at the top of `WEB`):

1. Rename / copy `WEB` to `index.html`.
2. Place the logo at `assets/logos/bold-logo.png` (referenced from nav, proof strip, and footer; all three have `onerror="this.style.display='none'"` so a missing logo degrades silently).
3. Edit the two globals near the top of `<head>`:
   - `window.BOLD_FORM_ACTION` — Formspree endpoint (currently `https://formspree.io/f/xvzzeprq`).
   - `window.BOLD_SITE_URL` — deployed site URL; used to build the `_next` redirect to `/thanks.html` after form submit.
4. Provide a `thanks.html` at the site root for the post-submit redirect.

Formspree requires the destination email to be verified and the form activated, or submissions return JSON errors that surface in the in-page `#form-status` box.

## Architecture conventions

Because the page is single-file, "architecture" here means the conventions that keep edits consistent across sections.

**Design tokens** are declared once in the inline `tailwind.config` script and reused everywhere as Tailwind classes. Do not introduce new hex colors ad hoc — extend the config and use the named token:

- Colors: `void-black` `#050505` (page bg), `panel-gray` `#111111` (alternating section bg), `neon-pink` `#ff00ff`, `neon-green` `#39ff14`, `neon-red` `#ff3333`, `neon-cyan` `#00ffff`.
- Fonts: `font-sans` → Heebo (body), `font-eng` → Space Grotesk (display / "terminal" feel). Both loaded from Google Fonts.
- The custom `marquee` keyframe + `animate-marquee` is what powers the top ticker.

**Section structure** — each major section has a stable `id` used by both the nav anchors and the in-page CTAs: `#top` (hero), `#proof`, `#manifesto`, `#sectors`, `#brief`. When adding a section, follow the same pattern and add a nav link in both the desktop nav and mobile CTA strip.

**Visual effects** are layered globally and assume the same DOM hooks across the page:

- `<canvas id="hud-canvas">` runs the crosshair/target HUD via `requestAnimationFrame`. It sits at `z-index: 9999`, `pointer-events: none`.
- `.scanlines` is a fixed overlay at `z-index: 50`.
- `.glitch-wrapper` reads its text from `data-text="..."` (must match the inner text) and animates two pseudo-elements clipped against a `#050505` background — change the bg color and the effect breaks.
- `body { cursor: none }` plus the HUD canvas replaces the system cursor. The `@media (hover: none) and (pointer: coarse)` block restores normal cursors on touch devices, and `@media (prefers-reduced-motion: reduce)` disables animations, hides `#hud-canvas` and `.scanlines`, and restores the cursor. Any new motion/cursor effects must respect both blocks.
- The hero "STEP INTO." word cycles through the `words` array on a `setInterval`, gated by `prefersReducedMotion`.

**Form contract** (`#brief-form` → Formspree):

- Required fields posted: `client_name`, `email`, `sector`, `objective`. Optional: `budget_scope`.
- Hidden fields: `_subject` (email subject line), `_gotcha` (honeypot, must stay `display:none`), `_next` (redirect URL, set at runtime from `BOLD_SITE_URL`).
- Submission is `fetch` with `Accept: application/json`; the page parses Formspree's error array into `#form-status` and shows a `#toast`. If you change field names, update both the validation block and the Formspree form config.

## Editing guidance

- Keep the page self-contained — do not split into separate JS/CSS files or introduce a bundler unless explicitly asked. The single-file constraint is the deploy model.
- The `Bold .txt` prototype is Hebrew/RTL (`<html lang="he" dir="rtl">`); `WEB` is English/LTR. If asked to "add a section" or "fix the form," default to `WEB` unless context makes clear it's the Hebrew version.
- Tailwind is loaded from `https://cdn.tailwindcss.com` (JIT in browser), so any new utility classes work without a build step but production users pay a CDN hit on every page load — don't add heavy `@apply` rewrites expecting compilation.
