module.exports = {
    eleventyComputed: {
        postNav: (data) => {
            const posts = data.collections?.posts || [];
            const currentUrl = data.page?.url;
            if (!currentUrl || !posts.length) return null;

            // Match homepage ordering: newest first.
            const orderedPosts = [...posts].reverse();
            const currentIndex = orderedPosts.findIndex(post => post.url === currentUrl);
            if (currentIndex === -1) return null;

            return {
                newer: orderedPosts[currentIndex - 1] || null,
                older: orderedPosts[currentIndex + 1] || null,
            };
        },
        ogImage: async (data) => {
            const Image = require("@11ty/eleventy-img");
            const path = require("path");
            const fs = require("fs");

            const inputPath = data.page.inputPath;
            const dir = inputPath.substring(0, inputPath.lastIndexOf("/") + 1);

            let imageSrc = data.ogImageSrc;
            let src;
            if (!imageSrc) {
                const content = fs.readFileSync(inputPath, "utf-8");
                const shortcode = content.match(/\{%\s*image\s+"([^"]+)"/);
                const mdImage = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
                const match = shortcode || mdImage;
                if (!match) {
                    // Keep fallback OGs consistent by processing the default image through the same transform.
                    src = path.resolve("./img/overfit-og.png");
                } else {
                    imageSrc = match[1];
                }
            }
            if (!src) {
                src = path.resolve(dir, imageSrc);
            }

            const metadata = await Image(src, {
                widths: [1200],
                formats: ["jpeg"],
                allowUpscale: true,
                filenameFormat: function (id, _src, width, format) {
                    return `${id}-og-top-${width}.${format}`;
                },
                outputDir: "./dist/img/",
                urlPath: "/img/",
                transform: (sharp) => {
                    sharp.resize(1200, 630, {
                        fit: "cover",
                        // Force top-biased crop with horizontal centering.
                        position: "north",
                        withoutEnlargement: false,
                    });
                },
            });

            return metadata.jpeg[0].url;
        }
    }
};
