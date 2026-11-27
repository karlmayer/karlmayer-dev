// Search sources for "Ask this piece". Overfit's own index (Pagefind) is local to the site;
// Wikipedia and Hacker News are keyless public APIs that allow browser requests, and are
// opt-in because the query leaves the reader's device.

export interface Source {
    origin: "Overfit" | "Wikipedia" | "Hacker News";
    title: string;
    url: string;
    snippet: string;
}

const TIMEOUT_MS = 5000;
const SNIPPET_CHARS = 320;

const clean = (html: string) => {
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > SNIPPET_CHARS ? `${flat.slice(0, SNIPPET_CHARS)}…` : flat;
};

const getJson = async (url: string) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
};

interface PagefindResult {
    data(): Promise<{ url: string; excerpt: string; meta: { title?: string } }>;
}

/** Other Overfit posts, via the Pagefind index Starlight builds (production builds only). */
export async function searchOverfit(query: string, limit = 3): Promise<Source[]> {
    const path = "/pagefind/pagefind.js";
    const pagefind: { search(q: string): Promise<{ results: PagefindResult[] }> } = await import(
        /* @vite-ignore */ path
    );
    const { results } = await pagefind.search(query);
    const here = location.pathname.replace(/\/?$/, "/");
    const pages = await Promise.all(results.slice(0, limit + 1).map((r) => r.data()));
    return pages
        .filter((page) => new URL(page.url, location.href).pathname !== here && page.url.includes("/post/"))
        .slice(0, limit)
        .map((page) => ({
            origin: "Overfit",
            title: page.meta.title ?? page.url,
            url: page.url,
            snippet: clean(page.excerpt),
        }));
}

export async function searchWikipedia(query: string, limit = 2): Promise<Source[]> {
    const data = await getJson(
        `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return (data.pages ?? []).map((page: { key: string; title: string; description?: string; excerpt: string }) => ({
        origin: "Wikipedia",
        title: page.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
        snippet: clean([page.description, page.excerpt].filter(Boolean).join(". ")),
    }));
}

export async function searchHackerNews(query: string, limit = 3): Promise<Source[]> {
    const data = await getJson(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`,
    );
    return (data.hits ?? []).map(
        (hit: { objectID: string; title: string; url?: string; points?: number; num_comments?: number; story_text?: string }) => ({
            origin: "Hacker News",
            title: hit.title,
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            snippet: clean(
                [`${hit.points ?? 0} points, ${hit.num_comments ?? 0} comments on Hacker News`, hit.story_text]
                    .filter(Boolean)
                    .join(". "),
            ),
        }),
    );
}

/** Run the enabled searches in parallel; a failing source is skipped, not fatal. */
export async function gatherSources(query: string, includeWeb: boolean): Promise<Source[]> {
    const searches = [searchOverfit(query), ...(includeWeb ? [searchWikipedia(query), searchHackerNews(query)] : [])];
    const settled = await Promise.allSettled(searches);
    settled.forEach((r) => r.status === "rejected" && console.warn("[on-device-ai] source failed:", r.reason));
    return settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/** Numbered context block for the prompt; the numbers match the source list shown to the reader. */
export const formatSources = (sources: Source[]) =>
    sources.map((s, i) => `[${i + 1}] ${s.origin}: ${s.title}\n${s.snippet}`).join("\n\n");
