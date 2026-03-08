# Overfit — karlmayer.dev

Personal blog by Karl Mayer. Built with Eleventy (11ty) v3.

## Commands

```bash
pnpm dev      # dev server with live reload
pnpm build    # production build → dist/
pnpm lint     # eslint + stylelint
pnpm lint:fix # auto-fix lint issues
```

## Project structure

```
pages/
  _layouts/       # base.njk (all pages), blog-post.njk
  _css/           # base.css, library.css (inlined + minified at build)
  blog/
    blog.11tydata.js          # computed data for all posts
    YYYYMMDD-slug/
      post.md                 # blog post
      image.jpg               # post images (co-located)
  index.njk       # home / post list
  resume.njk
  library.njk
  sitemap.njk     # → dist/sitemap.xml
  robots.txt      # → dist/robots.txt
  feed.njk        # → dist/feed.xml (RSS)
dist/             # build output (not committed)
```

## Writing a new blog post

1. Create `pages/blog/YYYYMMDD-slug/YYYYMMDD-slug.md`
2. Required front matter:

```yaml
---
title: Post Title
date: YYYY-MM-DD
tags: ['posts']
layout: blog-post
description: "One or two sentence description for meta/OG tags."
ogImageSrc: image-filename.jpg   # optional — co-located image for og:image
---
```

3. Drop images in the same directory as the post. Reference them with the `image` shortcode:

```njk
{% image "filename.jpg", "alt text", "(max-width: 375px) 320px, 800px", "Optional caption" %}
```

Images are auto-converted to webp, resized, and output to `dist/img/` with hashed filenames.

## SEO

- `description` front matter → `<meta name="description">`, `og:description`, `twitter:description`
- `ogImageSrc` → processed through eleventy-img at build time → `og:image` + `twitter:image` (1200px jpeg). When set, Twitter card upgrades to `summary_large_image`.
- Canonical URLs, OG tags, and JSON-LD `BlogPosting` structured data are automatic for all blog posts.
- `og:type` is `article` for blog posts, `website` for all other pages.

## Notes

- CSS is inlined and minified into `<head>` via the `cssmin` filter — no separate stylesheet requests.
- External links automatically get `target="_blank"` via JS in `base.njk`.
- `mindmap.njk` exists but is hidden (nav link commented out, excluded from sitemap) — it's broken.
- Theme toggle (light/dark) uses `localStorage` with a pre-paint script to avoid flash.
