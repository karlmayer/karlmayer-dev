import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

import serifLatin from "@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2?url";

import { getOgImage } from "~/lib/og";

const MIN_TOC_HEADINGS = 4;

type TocItem = { slug: string; children: TocItem[] };

// Starlight prepends an "Overview" entry (slug `_top`) for the page title; don't count it.
const countHeadings = (items: TocItem[]): number =>
    items.reduce((n, item) => n + (item.slug === "_top" ? 0 : 1) + countHeadings(item.children), 0);

export const onRequest = defineRouteMiddleware(async (context) => {
    const route = context.locals.starlightRoute;
    const { entry, head } = route;

    // Blog layout: no docs sidebar; the header carries navigation. Only posts with enough
    // sections get a table of contents (rendered in the post rail / mobile bar).
    route.hasSidebar = false;
    const isPost = route.id.startsWith("post/") && entry.data.date !== undefined;
    if (!isPost || countHeadings(route.toc?.items ?? []) < MIN_TOC_HEADINGS) route.toc = undefined;

    const url = new URL(await getOgImage(entry.data.ogImage), context.site).href;

    head.push(
        // Wordmark and titles use DM Serif Display; fetch it early to avoid a visible font swap.
        {
            tag: "link",
            attrs: { rel: "preload", href: serifLatin, as: "font", type: "font/woff2", crossorigin: "anonymous" },
        },
        { tag: "meta", attrs: { property: "og:image", content: url } },
        { tag: "meta", attrs: { name: "twitter:image", content: url } },
    );
    if (isPost) {
        const og = head.find((tag) => tag.attrs?.property === "og:type");
        if (og?.attrs) og.attrs.content = "article";
        // Plain-Markdown copy for LLMs and agents (src/pages/post/[...slug].md.ts, listed in /llms.txt).
        head.push({
            tag: "link",
            attrs: { rel: "alternate", type: "text/markdown", href: `/${route.id}.md` },
        });
    }
});
