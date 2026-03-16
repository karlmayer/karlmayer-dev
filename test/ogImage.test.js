const path = require("path");
const { eleventyComputed } = require("../pages/blog/blog.11tydata.js");

const MOCK_URL = "/img/mocked-og-abc123.jpeg";

jest.mock("@11ty/eleventy-img", () =>
    jest.fn().mockResolvedValue({ jpeg: [{ url: MOCK_URL }] })
);

const thoughtBuildersPath = path.resolve(
    __dirname,
    "../pages/blog/20260317-thought-builders/20260317-thought-builders.md"
);
const noImagePath = path.resolve(__dirname, "fixtures/no-image-post.md");

describe("ogImage computed", () => {
    it("uses ogImageSrc when explicitly set in front matter", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: "foggy-grand-canyon.avif",
            page: { inputPath: thoughtBuildersPath },
        });
        expect(result).toBe(MOCK_URL);
    });

    it("falls back to first image shortcode in post when ogImageSrc is absent", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: undefined,
            page: { inputPath: thoughtBuildersPath },
        });
        expect(result).toBe(MOCK_URL);
    });

    it("falls back to overfit-og.png when post has no images", async () => {
        const result = await eleventyComputed.ogImage({
            ogImageSrc: undefined,
            page: { inputPath: noImagePath },
        });
        expect(result).toBe("/img/overfit-og.png");
    });

    it("processes images at 1200x630 with cover crop", async () => {
        const Image = require("@11ty/eleventy-img");
        await eleventyComputed.ogImage({
            ogImageSrc: "foggy-grand-canyon.avif",
            page: { inputPath: thoughtBuildersPath },
        });

        const [, options] = Image.mock.calls[Image.mock.calls.length - 1];
        expect(options.widths).toEqual([1200]);
        expect(options.formats).toEqual(["jpeg"]);

        const mockSharp = { resize: jest.fn() };
        options.transform(mockSharp);
        expect(mockSharp.resize).toHaveBeenCalledWith(1200, 630, {
            fit: "cover",
            position: "center",
        });
    });
});
