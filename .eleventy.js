const moment = require('moment');
const CleanCSS = require("clean-css");

moment.locale('en');

module.exports = async function (eleventyConfig) {
    const { EleventyRenderPlugin } = await import("@11ty/eleventy");
    const PluginRss = await import("@11ty/eleventy-plugin-rss");
    const Image = (await import("@11ty/eleventy-img")).default;

    eleventyConfig.addPlugin(PluginRss.default);
    eleventyConfig.addPlugin(EleventyRenderPlugin);

    eleventyConfig.addPassthroughCopy('img');
    eleventyConfig.addPassthroughCopy({'pages/robots.txt': 'robots.txt'});
    eleventyConfig.addWatchTarget('pages/_css');

    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    eleventyConfig.addFilter('dateIso', date => {
        return moment(date).toISOString();
    });

    eleventyConfig.addFilter('dateReadable', date => {
        return moment(date).utc().format('LL'); // May 31, 2019
    });

    eleventyConfig.addFilter('dateInternational', date => {
        return moment(date).utc().format('YYYY-MM-DD');
    });

    eleventyConfig.addFilter('replaceStrippedCharacters', function (title) {
        return title
            .replace('&', '&amp;')
            .replace(/</g, '‹')
            .replace(/>/g, '›');
    })

    eleventyConfig.addShortcode('excerpt', article => extractExcerpt(article));
    eleventyConfig.addAsyncShortcode("image", async function (src, alt, sizes = "100vw", caption = "") {
        const path = this.page.inputPath;
        const dir = path.substring(0, path.lastIndexOf("/") + 1);
        src = dir + src;

        if (alt === undefined) {
            throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
        }

        const metadata = await Image(src, {
            widths: [320, null],
            formats: ["webp"],
            svgShortCircuit: true,
            outputDir: "./dist/img/",
            urlPath: "/img/",
            sharpOptions: {
                animated: true
            }
        });

        const lowsrc = metadata.webp[0];

        return `<figure class="picture">
    <picture>
      ${Object.values(metadata).map(imageFormat => {
            return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
        }).join("\n")}
        <img
          src="${lowsrc.url}"
          alt="${alt}"
          loading="lazy"
          decoding="async">
      </picture>
      ${caption ? `<figcaption>${caption.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')}</figcaption>` : ""}
    </figure>`;
    });

    return {
        dir: {
            input: "pages",
            includes: "_includes",
            layouts: "_layouts",
            output: "dist"
        },
        templateFormats: ["html", "liquid", "njk", "md"],
        passthroughFileCopy: true
    }
}

function extractExcerpt(article) {
    if (!article.hasOwnProperty('templateContent')) {
        console.warn('Failed to extract excerpt: Document has no property "templateContent".');
        return null;
    }

    let excerpt = null;
    const content = article.templateContent;

    const separatorsList = [
        { start: '<!-- Excerpt Start -->', end: '<!-- Excerpt End -->' },
        { start: '<p>', end: '</p>' }
    ];

    separatorsList.some(separators => {
        const startPosition = content.indexOf(separators.start);
        const endPosition = content.indexOf(separators.end);

        if (startPosition !== -1 && endPosition !== -1) {
            excerpt = content.substring(startPosition + separators.start.length, endPosition).trim();
            return true;
        }
    });

    return excerpt;
}
