const { Console } = require("console");
const moment = require('moment');
const CleanCSS = require("clean-css");
const PluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const Image = require("@11ty/eleventy-img");

moment.locale('en');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(PluginRss);
    eleventyConfig.addPlugin(EleventyRenderPlugin);

    eleventyConfig.addPassthroughCopy('img');
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
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);

    return {
        dir: {
            input: "pages",
            includes: "_includes",
            layouts: "_layouts",
            output: "dist",
            templateFormats: ["html", "liquid", "njk"]
        },
        passthroughFileCopy: true
    }
}

async function imageShortcode(src, alt, sizes = "100vw") {
    let path = this.page.inputPath;
    let dir = path.substring(0, path.lastIndexOf("/") + 1);
    src = dir + src;

    if (alt === undefined) {
        throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }

    let metadata = await Image(src, {
        widths: [320, null],
        formats: ["webp"],
        svgShortCircuit: true,
        outputDir: "./dist/img/",
        urlPath: "/img/",
        sharpOptions: {
            animated: true
        }
    });

    let lowsrc = metadata.webp[0];
    let highsrc = metadata.webp[metadata.webp.length - 1];

    return `<div class="picture">
    <picture>
      ${Object.values(metadata).map(imageFormat => {
        return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
    }).join("\n")}
        <img
          src="${lowsrc.url}"
          alt="${alt}"
          loading="lazy"
          decoding="async">
      </picture></div>`;
}

function extractExcerpt(article) {
    if (!article.hasOwnProperty('templateContent')) {
        console.warn('Failed to extract excerpt: Document has no property "templateContent".');
        return null;
    }

    let excerpt = null;
    const content = article.templateContent;

    // The start and end separators to try and match to extract the excerpt
    const separatorsList = [
        { start: '<!-- Excerpt Start -->', end: '<!-- Excerpt End -->' },
        { start: '<p>', end: '</p>' }
    ];

    separatorsList.some(separators => {
        const startPosition = content.indexOf(separators.start);
        const endPosition = content.indexOf(separators.end);

        if (startPosition !== -1 && endPosition !== -1) {
            excerpt = content.substring(startPosition + separators.start.length, endPosition).trim();
            return true; // Exit out of array loop on first match
        }
    });

    return excerpt;
}
