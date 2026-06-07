# Overfit Copilot Instructions

Keep this file concise and non-duplicative.

## Source of Truth

- Use scripts in `package.json` as the canonical command list.
- Use `CLAUDE.md` as the canonical project and content-authoring documentation.
- Do not duplicate detailed command, structure, or blog-writing docs here.

## Working Rules

- Prefer minimal, targeted edits that preserve existing Eleventy and Nunjucks patterns.
- Place new blog posts under `pages/blog/YYYYMMDD-slug/YYYYMMDD-slug.md`.
- Keep generated output in `dist/` out of authored source changes unless explicitly requested.
- Use Conventional Commits for commit messages (for example: `feat:`, `fix:`, `chore:`, `docs:`).
