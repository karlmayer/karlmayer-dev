// Plain-Markdown copy of each post at /post/YYYY/MM/DD/slug.md, linked from /llms.txt.
import type { APIRoute, GetStaticPaths } from "astro";

import { getPosts, markdownResponse, toMarkdown, type Post } from "~/lib/llms";

export const getStaticPaths = (async () =>
    (await getPosts()).map((post) => ({
        params: { slug: post.id.replace(/^post\//, "") },
        props: { post },
    }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: Post }> = ({ props, site }) => markdownResponse(toMarkdown(props.post, site!));
