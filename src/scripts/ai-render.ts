// Renders model output as a small Markdown subset: paragraphs, bullet lists, **bold**, *italic*,
// `code`, and [n] citations linked to their sources. Output is built from DOM nodes and text, never
// innerHTML, so nothing the model writes can inject markup.
import type { Source } from "./ai-sources";

const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_|\[\d+(?:\s*,\s*\d+)*\])/g;

function inline(text: string, sources: Source[]): Node[] {
    return text
        .split(INLINE)
        .filter(Boolean)
        .flatMap((part): Node[] => {
            const wrap = (tag: string, inner: string) => {
                const el = document.createElement(tag);
                el.append(...inline(inner, sources));
                return [el];
            };
            if (/^(\*\*|__).+\1$/.test(part)) return wrap("strong", part.slice(2, -2));
            if (/^`.+`$/.test(part)) {
                const code = document.createElement("code");
                code.textContent = part.slice(1, -1);
                return [code];
            }
            if (/^([*_]).+\1$/.test(part)) return wrap("em", part.slice(1, -1));
            if (/^\[[\d,\s]+\]$/.test(part)) return citations(part, sources);
            return [document.createTextNode(part)];
        });
}

// "[2]" or "[1, 3]" → one link per number that matches a source; unknown numbers stay as text.
function citations(part: string, sources: Source[]): Node[] {
    const numbers = part.slice(1, -1).split(",").map((n) => Number(n.trim()));
    if (!numbers.every((n) => sources[n - 1])) return [document.createTextNode(part)];
    return numbers.map((n) => {
        const source = sources[n - 1];
        const a = document.createElement("a");
        a.className = "cite";
        a.href = source.url;
        a.title = `${source.origin}: ${source.title}`;
        a.textContent = `[${n}]`;
        if (source.origin !== "Overfit") {
            a.target = "_blank";
            a.rel = "noopener";
        }
        return a;
    });
}

export function renderAnswer(container: HTMLElement, markdown: string, sources: Source[]) {
    const blocks = markdown.trim().split(/\n{2,}/);
    container.replaceChildren(
        ...blocks.map((block) => {
            const lines = block.split("\n").filter((line) => line.trim());
            if (lines.length && lines.every((line) => /^\s*[-*•]\s+/.test(line))) {
                const ul = document.createElement("ul");
                ul.append(
                    ...lines.map((line) => {
                        const li = document.createElement("li");
                        li.append(...inline(line.replace(/^\s*[-*•]\s+/, ""), sources));
                        return li;
                    }),
                );
                return ul;
            }
            const p = document.createElement("p");
            p.append(...inline(lines.join(" ").replace(/^#+\s*/, ""), sources));
            return p;
        }),
    );
}
