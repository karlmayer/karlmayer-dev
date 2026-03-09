module.exports = {
    eleventyComputed: {
        ogImage: async (data) => {
            if (!data.ogImageSrc) return undefined;

            const { default: Image } = await import("@11ty/eleventy-img");
            const path = await import("path");

            const inputPath = data.page.inputPath;
            const dir = inputPath.substring(0, inputPath.lastIndexOf("/") + 1);
            const src = path.default.resolve(dir, data.ogImageSrc);

            const metadata = await Image(src, {
                widths: [1200],
                formats: ["jpeg"],
                outputDir: "./dist/img/",
                urlPath: "/img/",
            });

            return metadata.jpeg[0].url;
        }
    }
};
