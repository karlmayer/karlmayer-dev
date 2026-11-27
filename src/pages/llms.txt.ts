// Site index for LLMs, following https://llmstxt.org.
import type { APIRoute } from "astro";

import { getPosts, isoDate, markdownResponse, postMarkdownUrl } from "~/lib/llms";

export const GET: APIRoute = async ({ site }) => {
    const base = site!;
    const url = (path: string) => new URL(path, base).href;
    const posts = await getPosts();

    const text = `# Overfit

> Precision that misses the point. Writing by Karl Mayer on AI, clarity of thought, and the complexity of assumptions.

Overfit is a personal blog. Each post is a standalone essay; the links below go to plain-Markdown copies of each post, and the HTML versions live at the same path without the \`.md\` suffix. Writing is by Karl Mayer and licensed CC BY-SA 4.0.

## Posts

${posts.map((post) => `- [${post.data.title}](${postMarkdownUrl(post, base)}): ${post.data.description} (${isoDate(post.data.date)})`).join("\n")}

## About

- [About Karl Mayer](${url("/about/")}): bio and résumé

## Optional

- [Full text of every post](${url("/llms-full.txt")}): all posts in one Markdown file, newest first
- [RSS feed](${url("/feed.xml")})
`;

    return markdownResponse(text);
};
