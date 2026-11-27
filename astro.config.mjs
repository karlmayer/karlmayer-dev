import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";

const description =
    "Precision that misses the point. Writing on AI, clarity of thought, and the complexity of assumptions.";

export default defineConfig({
    site: "https://www.karlmayer.dev",
    trailingSlash: "ignore",
    vite: {
        resolve: {
            alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
        },
    },
    integrations: [
        starlight({
            title: "Overfit",
            description,
            favicon: "/img/favicon.ico",
            social: [
                { icon: "github", label: "GitHub", href: "https://github.com/karlmayer" },
            ],
            sidebar: [
                { label: "Writing", link: "/post/" },
                { label: "About", link: "/about/" },
                { label: "Library", link: "/library/" },
            ],
            customCss: ["./src/styles/custom.css"],
            routeMiddleware: "./src/routeData.ts",
            lastUpdated: false,
            pagination: false,
            head: [
                {
                    tag: "meta",
                    attrs: { name: "author", content: "Karl Mayer" },
                },
                {
                    tag: "script",
                    attrs: { async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-KLBXE58Z2K" },
                },
                {
                    tag: "script",
                    content:
                        "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-KLBXE58Z2K');",
                },
            ],
            plugins: [
                starlightBlog({
                    title: "Writing",
                    prefix: "post",
                    postCount: 10,
                    recentPostCount: 10,
                    authors: {
                        karl: {
                            name: "Karl Mayer",
                            url: "https://www.karlmayer.dev/about/",
                        },
                    },
                }),
            ],
        }),
    ],
});
