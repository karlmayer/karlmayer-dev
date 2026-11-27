// Byline from starlight-blog's optional `authors` front matter. Posts without it are Karl's;
// starlight-blog falls back to the global `karl` author for its own metadata.
type Author = string | { name: string };

export function bylineOf(authors: Author | Author[] | undefined): string | undefined {
    if (!authors) return undefined;
    const list = Array.isArray(authors) ? authors : [authors];
    return list.map((author) => (typeof author === "string" ? author : author.name)).join(" & ");
}
