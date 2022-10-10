const { Console } = require("console");
const moment = require('moment');
const CleanCSS = require("clean-css");
const PluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyRenderPlugin } = require("@11ty/eleventy");

moment.locale('en');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(PluginRss);
    eleventyConfig.addPlugin(EleventyRenderPlugin);

    eleventyConfig.addPassthroughCopy('images');
    eleventyConfig.addPassthroughCopy('resume/resume.yaml');

    eleventyConfig.addWatchTarget('pages/_css');

    eleventyConfig.addFilter('dateIso', date => {
        return moment(date).toISOString();
    });

    eleventyConfig.addFilter('dateReadable', date => {
        return moment(date).utc().format('LL'); // e.g. May 31, 2019
    });

    eleventyConfig.addFilter('dateInternational', date => {
        return moment(date).utc().format('YYYY-MM-DD');
    });

    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    eleventyConfig.addShortcode('excerpt', article => extractExcerpt(article));

    return {
        dir: {
            input: "pages",
            // ⚠️ These values are both relative to your input directory.
            includes: "_includes",
            layouts: "_layouts",
            output: "dist",
            templateFormats: ["html", "liquid", "njk"]
        },
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