// Behaviours carried over from the 11ty site.

const iconCopy =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const iconCheck =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

// Click a blockquote (or its copy button) to copy the quote.
document.querySelectorAll<HTMLElement>(".sl-markdown-content blockquote").forEach((bq) => {
    const btn = document.createElement("button");
    btn.className = "blockquote-copy";
    btn.type = "button";
    btn.setAttribute("aria-label", "Copy quote");
    btn.innerHTML = iconCopy;

    const copy = () => {
        const text = bq.innerText.replace(/\n+/g, " ").trim();
        navigator.clipboard.writeText(text).then(() => {
            btn.innerHTML = iconCheck;
            setTimeout(() => (btn.innerHTML = iconCopy), 1500);
        });
    };

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        copy();
    });
    bq.addEventListener("click", copy);
    bq.appendChild(btn);
});

// Mark the current section in the header nav ("Writing" covers the home page and posts).
const path = location.pathname;
document.querySelectorAll<HTMLAnchorElement>("header nav a[href]").forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    const current = href === "/" ? path === "/" || path.startsWith("/post") : path.startsWith(href);
    if (current) a.setAttribute("aria-current", "page");
});

// Open off-site links in a new tab.
document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    if (a.host && a.host !== location.host) {
        a.target = "_blank";
        a.rel = "noopener";
    }
});
