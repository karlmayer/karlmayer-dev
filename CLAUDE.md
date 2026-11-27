# Overfit — karlmayer.dev

Personal blog by Karl Mayer. Built with Astro + Starlight, using the `starlight-blog` plugin (prefix `post`).

## Commands

```bash
pnpm dev      # dev server with live reload (http://localhost:4321)
pnpm build    # production build → dist/
pnpm preview  # serve the built dist/
pnpm check    # astro sync + tsc 7.1 (beta) with @astrojs/ts-content-mapper for .astro files
pnpm lint     # eslint + stylelint
pnpm lint:fix # auto-fix lint issues
```

## Writing a new blog post

1. Create `src/content/docs/post/YYYY/MM/DD/slug/index.mdx`. The folder path is the URL
   (`/post/YYYY/MM/DD/slug/`), so keep the slug stable once published.
2. Front matter:

```yaml
---
title: Post Title
date: YYYY-MM-DD
tags: ["ai"]
description: "One or two sentence description for meta/OG tags."
excerpt: "Shown on the home page and /post/ listing."   # falls back to description on the home page
ogImage: ./image-filename.jpg   # optional — co-located image for og:image and the home page card
draft: true                     # optional — excluded from production builds
---
```

3. Drop images in the same directory, import them, and use the `Figure` component:

```mdx
import Figure from "~/components/Figure.astro";
import photo from "./filename.jpg";

<Figure src={photo} alt="alt text" sizes="(max-width: 600px) 100vw, 600px" caption="Optional caption" credit="Optional credit" />
```

Caption and credit both accept `[text](url)` links. The credit renders as a smaller line under the caption; use it for third-party image attribution (e.g. Creative Commons) so the caption stays free.

Posts are MDX: no HTML comments (use `{/* */}`), and inline `style` attributes must be JSX objects.

## Layout

- `astro.config.mjs` — Starlight + blog plugin config, sidebar, analytics head tags.
- `src/routeData.ts` — Starlight route middleware that adds `og:image` / `twitter:image` (1200×630, via `src/lib/og.ts`).
- `src/content/docs/index.mdx` — home page (splash + `PostGrid`).
- `src/pages/about.astro` — fetches the résumé at build time (`src/lib/resume.js`).
- `src/pages/library.astro` — Goodreads widgets and link lists.
- `src/pages/feed.xml.ts` — keeps the legacy `/feed.xml` URL; same feed as `/post/rss.xml`.
- `public/` — static files served as-is (`/img/*`, `robots.txt`).
