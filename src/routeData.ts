import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

import serifLatin from "@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2?url";

import { getOgImage } from "~/lib/og";

export const onRequest = defineRouteMiddleware(async (context) => {
    const route = context.locals.starlightRoute;
    const { entry, head } = route;

    // Blog layout: no docs sidebar or table of contents; the header carries navigation.
    route.hasSidebar = false;
    route.toc = undefined;

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
    if (entry.data.date) {
        const og = head.find((tag) => tag.attrs?.property === "og:type");
        if (og?.attrs) og.attrs.content = "article";
    }
});
