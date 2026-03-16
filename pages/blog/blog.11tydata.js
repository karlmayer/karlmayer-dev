module.exports = {
    eleventyComputed: {
        ogImage: async (data) => {
            const Image = require("@11ty/eleventy-img");
            const path = require("path");
            const fs = require("fs");

            const inputPath = data.page.inputPath;
            const dir = inputPath.substring(0, inputPath.lastIndexOf("/") + 1);

            let imageSrc = data.ogImageSrc;
            if (!imageSrc) {
                const content = fs.readFileSync(inputPath, "utf-8");
                const shortcode = content.match(/\{%\s*image\s+"([^"]+)"/);
                const mdImage = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
                const match = shortcode || mdImage;
                if (!match) return "/img/overfit-og.png";
                imageSrc = match[1];
            }

            const src = path.resolve(dir, imageSrc);

            const metadata = await Image(src, {
                widths: [1200],
                formats: ["jpeg"],
                outputDir: "./dist/img/",
                urlPath: "/img/",
                transform: (sharp) => {
                    sharp.resize(1200, 630, { fit: "cover", position: "center" });
                },
            });

            return metadata.jpeg[0].url;
        }
    }
};
