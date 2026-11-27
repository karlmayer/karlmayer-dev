import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

import fallback from "~/assets/overfit-og.png";

// 1200×630 top-biased crop, matching the old 11ty OG transform.
export async function getOgImage(src: ImageMetadata = fallback) {
    const result = await getImage({
        src,
        width: 1200,
        height: 630,
        fit: "cover",
        position: "top",
        format: "jpeg",
    });
    return result.src;
}
