import { defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

export const collections = {
    i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
    docs: defineCollection({
        loader: docsLoader(),
        schema: docsSchema({
            extend: (context) =>
                blogSchema(context).extend({
                    // og:image and home page card; cropped to 1200×630. Falls back to the site card.
                    ogImage: context.image().optional(),
                }),
        }),
    }),
};
