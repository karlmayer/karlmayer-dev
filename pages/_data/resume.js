module.exports = async function () {
    const res = await fetch('https://karlmayer.github.io/e-resume/resume.html');
    const html = await res.text();

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1].trim() : '';

    const styles = [];
    const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let m;
    while ((m = styleRe.exec(html)) !== null) {
        styles.push(scopeCSS(m[1].trim(), '#resume'));
    }

    return { content, styles: styles.join('\n') };
};

function scopeCSS(css, scope) {
    // Strip @import rules (avoids loading Google Fonts etc.)
    css = css.replace(/@import[^;]+;/g, '');

    const result = [];
    let i = 0;

    while (i < css.length) {
        // Skip whitespace
        while (i < css.length && /\s/.test(css[i])) i++;
        if (i >= css.length) break;

        if (css[i] === '@') {
            // Read @-rule keyword + prelude
            let rule = '';
            while (i < css.length && css[i] !== '{' && css[i] !== ';') {
                rule += css[i++];
            }
            if (i < css.length && css[i] === ';') {
                i++; // discard (@charset, @import etc.)
            } else if (i < css.length && css[i] === '{') {
                // Block @-rule (@media, @supports). Scope inner rules recursively.
                i++; // skip {
                let inner = '';
                let depth = 1;
                while (i < css.length && depth > 0) {
                    if (css[i] === '{') depth++;
                    else if (css[i] === '}') depth--;
                    if (depth > 0) inner += css[i];
                    i++;
                }
                result.push(`${rule.trim()} { ${scopeCSS(inner, scope)} }`);
            }
        } else {
            // Regular rule — read selector up to {
            let selector = '';
            while (i < css.length && css[i] !== '{') {
                selector += css[i++];
            }
            if (i >= css.length) break;
            i++; // skip {

            let block = '';
            let depth = 1;
            while (i < css.length && depth > 0) {
                if (css[i] === '{') depth++;
                else if (css[i] === '}') depth--;
                if (depth > 0) block += css[i];
                i++;
            }

            const scoped = selector.trim().split(',').map(s => {
                s = s.trim();
                if (!s) return '';
                if (s === 'body' || s === 'html') return scope;
                if (s.startsWith(scope)) return s;
                return `${scope} ${s}`;
            }).filter(Boolean).join(', ');

            result.push(`${scoped} { ${block} }`);
        }
    }

    return result.join('\n');
}
