# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

**GitHub:** https://github.com/devish6/claude-code-projects  
**Owner:** devish6 (laroiya1706@gmail.com)  
**Purpose:** A collection of web-based mini-projects and experiments, each built as a self-contained file.

> 🔴 **This repo is PUBLIC and it is also a live website** — GitHub Pages serves `main` at
> https://devish6.github.io/claude-code-projects/. Anything committed here is world-readable
> *and* served. Read the exclusions below before running `git add`.

## Git & GitHub Workflow

Every project must be committed and pushed to GitHub immediately after creation or modification —
**except for the exclusions below.**

### 🛑 Never commit these to this repo

Because the repo is public and Pages-served, three kinds of thing must stay out. All are listed in
`.gitignore`; do not `git add -f` them.

1. **Nested git repositories with their own remotes** — `vedic-numerology/` (the private Numevix
   app, and it holds `.env` with the production Neon URL and Stripe keys), `llm-council/` (a clone
   of someone else's project). These belong in their own repos, and adding one here records a
   broken gitlink rather than the files.
2. **Anything containing an endpoint, key, or token** — `cunique-billiards/` embeds Apps Script /
   SheetDB URLs in its `.tsx` files, which are write-capable credentials for the CueNique admin
   portal. Publishing them lets anyone write to that data.
3. **Working copies of sites that live in their own repo** — `deshane-chiro/` here is a loose local
   copy; the live deshanechiro.ca is served from `devish6/deshane-chiro`. Edit it there, not here.

⚠️ Business, tax, and personal documents also never go in this repo (e.g. the OIDAR/accountant
questions doc stays on the Desktop). If a new project needs secrets or is client work, give it its
own **private** repo and add its directory to `.gitignore` here.

```bash
export PATH="/opt/homebrew/bin:$PATH"   # required for gh CLI

# After creating or updating a project:
git add <file>
git commit -m "<descriptive message>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

- All projects live in this single repo as files or subdirectories.
- The `gh` CLI is installed at `/opt/homebrew/bin/gh` and authenticated as `devish6`.
- Branch: `main`

## Project Conventions

Projects in this repo are **vanilla HTML/CSS/JS single-file applications** — no build steps, no bundlers, no external dependencies. Everything (styles, markup, logic) lives in one `.html` file that can be opened directly in a browser.

To open/preview a project locally:
```bash
open <project-file>.html
```

## Design Patterns

The established visual style (see `tic-tac-toe.html`) uses:
- Dark gradient backgrounds (`#1a1a2e → #16213e → #0f3460`)
- Glassmorphism cards: `rgba(255,255,255,0.05)` backgrounds with subtle borders
- Accent colours: red `#e94560` and teal `#4ecdc4`
- Springy CSS animations using `cubic-bezier(0.34, 1.56, 0.64, 1)`

New projects should follow this visual language for consistency unless explicitly told otherwise.

## Permissions

Allowed Bash operations are listed in `.claude/settings.local.json`. Add new `git` or `gh` patterns there as needed rather than prompting the user each time.
