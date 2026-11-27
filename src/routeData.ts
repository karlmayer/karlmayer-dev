import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

import { getOgImage } from "~/lib/og";

export const onRequest = defineRouteMiddleware(async (context) => {
    const { entry, head } = context.locals.starlightRoute;
    const url = new URL(await getOgImage(entry.data.ogImage), context.site).href;

    head.push(
        { tag: "meta", attrs: { property: "og:image", content: url } },
        { tag: "meta", attrs: { name: "twitter:image", content: url } },
    );
    if (entry.data.date) {
        const og = head.find((tag) => tag.attrs?.property === "og:type");
        if (og?.attrs) og.attrs.content = "article";
    }
});
