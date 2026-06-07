# Overfit — karlmayer.dev

Personal blog by Karl Mayer. Built with Eleventy (11ty) v3.

## Commands

```bash
pnpm dev      # dev server with live reload
pnpm build    # production build → dist/
pnpm lint     # eslint + stylelint
pnpm lint:fix # auto-fix lint issues
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

3. Drop images in the same directory. Reference them with the `image` shortcode:

```njk
{% image "filename.jpg", "alt text", "(max-width: 375px) 320px, 800px", "Optional caption" %}
```

## Notes

- `mindmap.njk` exists but is hidden (nav link commented out, excluded from sitemap) — it's broken.
