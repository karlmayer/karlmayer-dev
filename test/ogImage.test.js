const path = require("path");

const { eleventyComputed } = require("../pages/blog/blog.11tydata.js");

const demoPostPath = path.resolve(
    __dirname,
    "../pages/blog/20260320-the-demo-is-not-the-product/20260320-the-demo-is-not-the-product.md"
);
const noImagePath = path.resolve(__dirname, "fixtures/no-image-post.md");

describe("ogImage computed", () => {
    it("uses ogImageSrc when explicitly set in front matter", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: "foggy-grand-canyon.png",
            page: { inputPath: demoPostPath },
        });
        expect(result).toMatch(/^\/img\/.+-og-top-1200\.jpeg$/);
    });

    it("falls back to first image shortcode in post when ogImageSrc is absent", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: undefined,
            page: { inputPath: demoPostPath },
        });
        expect(result).toMatch(/^\/img\/.+-og-top-1200\.jpeg$/);
    });

    it("falls back to overfit-og.png when post has no images", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: undefined,
            page: { inputPath: noImagePath },
        });
        expect(result).toMatch(/^\/img\/.+-og-top-1200\.jpeg$/);
    });

    it("generates deterministic og filename format", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: "foggy-grand-canyon.png",
            page: { inputPath: demoPostPath },
        });
        expect(result).toMatch(/-og-top-1200\.jpeg$/);
    });
});
