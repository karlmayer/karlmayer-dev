// Every post's text in one file, newest first (https://llmstxt.org).
import type { APIRoute } from "astro";

import { getPosts, markdownResponse, toMarkdown } from "~/lib/llms";

export const GET: APIRoute = async ({ site }) => {
    const posts = await getPosts();
    return markdownResponse(posts.map((post) => toMarkdown(post, site!)).join("\n---\n\n"));
};
