// Plain-Markdown views of posts for llms.txt (https://llmstxt.org).
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"docs"> & { data: { date: Date } };

export async function getPosts(): Promise<Post[]> {
    const entries = await getCollection(
        "docs",
        ({ id, data }) => id.startsWith("post/") && data.date !== undefined && !(import.meta.env.PROD && data.draft),
    );
    return (entries as Post[]).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const postUrl = (post: Post, site: URL) => new URL(`/${post.id}/`, site).href;
export const postMarkdownUrl = (post: Post, site: URL) => new URL(`/${post.id}.md`, site).href;
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

// String props on a JSX tag, e.g. alt="..." caption="..." (written JSON-escaped by the converter).
function props(tag: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [, key, value] of tag.matchAll(/(\w+)=("(?:[^"\\]|\\.)*")/g)) out[key] = JSON.parse(value);
    return out;
}

/** The post's MDX source reduced to Markdown an LLM can read: no imports, components, or comments. */
export function toMarkdown(post: Post, site: URL): string {
    const body = (post.body ?? "")
        .replace(/^import\s.+$\n?/gm, "")
        .replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, "")
        .replace(/<Figure\b[\s\S]*?\/>/g, (tag) => {
            const { alt, caption, credit } = props(tag);
            const notes = [caption, credit && `(${credit})`].filter(Boolean).join(" ");
            return `[Image: ${alt}${notes ? ` — ${notes}` : ""}]`;
        })
        .replace(/<iframe\b[\s\S]*?<\/iframe>/g, (tag) => {
            const { src, title } = props(tag);
            return `[Embedded demo: ${title ?? src}](${src})`;
        })
        .replace(/<span class="blink-cursor"[^>]*>.*?<\/span>\n?/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const header = [
        `# ${post.data.title}`,
        post.data.description && `> ${post.data.description}`,
        `Karl Mayer · ${isoDate(post.data.date)} · ${postUrl(post, site)}`,
    ].filter(Boolean);

    return `${header.join("\n\n")}\n\n${body}\n`;
}

export const markdownResponse = (text: string) =>
    new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
