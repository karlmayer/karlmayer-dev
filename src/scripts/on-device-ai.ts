// "Summarize" and "Ask" on posts, using the browser's built-in on-device model
// (Chrome: Gemini Nano; Edge: its own small model). Progressive enhancement: the controls stay
// hidden unless the browser reports the model as available or downloadable.
// https://developer.chrome.com/docs/ai/built-in-apis

// Minimal shapes for the parts of the APIs used here; not yet in TypeScript's DOM lib.
type Availability = "unavailable" | "downloadable" | "downloading" | "available";
type Monitor = (m: EventTarget) => void;
interface SummarizerOptions {
    type: "key-points" | "tldr" | "teaser" | "headline";
    format: "markdown" | "plain-text";
    length: "short" | "medium" | "long";
    expectedInputLanguages: string[];
    outputLanguage: string;
    monitor?: Monitor;
}
interface LanguageModelOptions {
    expectedInputs: { type: "text"; languages: string[] }[];
    expectedOutputs: { type: "text"; languages: string[] }[];
    initialPrompts?: { role: "system" | "user" | "assistant"; content: string }[];
    monitor?: Monitor;
}
declare global {
    var Summarizer:
        | {
              availability(options: SummarizerOptions): Promise<Availability>;
              create(options: SummarizerOptions): Promise<{
                  summarizeStreaming(text: string, options?: { context?: string }): AsyncIterable<string>;
              }>;
          }
        | undefined;
    var LanguageModel:
        | {
              availability(options: LanguageModelOptions): Promise<Availability>;
              create(options: LanguageModelOptions): Promise<{
                  prompt(input: string, options?: { responseConstraint?: object }): Promise<string>;
                  promptStreaming(input: string): AsyncIterable<string>;
              }>;
          }
        | undefined;
}

import { renderAnswer } from "./ai-render";
import { formatSources, gatherSources, type Source } from "./ai-sources";

const SUMMARY_OPTIONS: SummarizerOptions = {
    type: "key-points",
    format: "markdown",
    length: "medium",
    expectedInputLanguages: ["en"],
    outputLanguage: "en",
};
const LM_OPTIONS: LanguageModelOptions = {
    expectedInputs: [{ type: "text", languages: ["en"] }],
    expectedOutputs: [{ type: "text", languages: ["en"] }],
};

const root = document.querySelector<HTMLElement>("[data-on-device-ai]");
if (root) void init(root);

async function init(root: HTMLElement) {
    const [summarize, ask] = await Promise.all([
        self.Summarizer?.availability(SUMMARY_OPTIONS).catch(() => "unavailable" as const) ?? "unavailable",
        self.LanguageModel?.availability(LM_OPTIONS).catch(() => "unavailable" as const) ?? "unavailable",
    ]);
    if (summarize === "unavailable" && ask === "unavailable") return;

    const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const status = $("[data-status]");
    const summaryButton = $<HTMLButtonElement>("[data-summarize]");
    const askButton = $<HTMLButtonElement>("[data-ask]");
    const summaryOut = $("[data-summary]");
    const askForm = $<HTMLFormElement>("[data-ask-form]");
    const answerOut = $("[data-answer]");

    const needsDownload = (a: string) => a === "downloadable" || a === "downloading";
    const note = "Runs in your browser. Nothing leaves your device.";
    const downloadNote = "First use downloads the browser’s on-device model (a few GB, once).";

    summaryButton.hidden = summarize === "unavailable";
    askButton.hidden = ask === "unavailable";
    root.hidden = false;

    const setStatus = (text: string) => (status.textContent = text);
    const monitor: Monitor = (m) =>
        m.addEventListener("downloadprogress", (e) => {
            const loaded = (e as ProgressEvent).loaded;
            setStatus(loaded < 1 ? `Downloading on-device model… ${Math.round(loaded * 100)}%` : "Preparing…");
        });

    // The post's clean Markdown copy (see src/pages/post/[...slug].md.ts).
    let essay: Promise<string> | undefined;
    const getEssay = () =>
        (essay ??= fetch(location.pathname.replace(/\/?$/, ".md")).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.text();
        }));

    const fail = (error: unknown) => {
        const tooLong = error instanceof DOMException && error.name === "QuotaExceededError";
        setStatus(tooLong ? "This piece is too long for the on-device model." : "The on-device model couldn’t finish that.");
        console.warn("[on-device-ai]", error);
    };

    summaryButton.addEventListener("click", async () => {
        summaryButton.disabled = true;
        askForm.hidden = true;
        summaryOut.hidden = false;
        setStatus(needsDownload(summarize) ? downloadNote : "Summarizing…");
        try {
            const summarizer = await self.Summarizer!.create({ ...SUMMARY_OPTIONS, monitor });
            setStatus("Summarizing…");
            const stream = summarizer.summarizeStreaming(await getEssay(), {
                context: "An essay from Overfit, a blog by Karl Mayer about AI and software.",
            });
            for await (const text of accumulate(stream)) renderPoints(summaryOut, text);
            setStatus(note);
        } catch (error) {
            fail(error);
        } finally {
            summaryButton.disabled = false;
        }
    });

    type Session = Awaited<ReturnType<NonNullable<typeof self.LanguageModel>["create"]>>;
    const title = document.querySelector("h1")?.textContent?.trim() ?? document.title;
    const webToggle = $<HTMLInputElement>("[data-include-web]");

    // Web search is on by default; a reader who unticks it stays opted out on later visits.
    const WEB_KEY = "overfit-ai-include-web";
    try {
        if (localStorage.getItem(WEB_KEY) === "off") webToggle.checked = false;
    } catch {
        // Storage unavailable (private mode): fall back to the default for this page.
    }
    webToggle.addEventListener("change", () => {
        try {
            localStorage.setItem(WEB_KEY, webToggle.checked ? "on" : "off");
        } catch {
            // ignore
        }
    });
    const sourcesOut = $<HTMLOListElement>("[data-sources]");

    // The answering session holds the essay; one per page, so follow-up questions keep the thread.
    let session: Promise<Session> | undefined;
    // A separate, essay-free session that only turns questions into search queries.
    let querySession: Promise<Session> | undefined;

    const searchQueryFor = async (question: string) => {
        try {
            querySession ??= self.LanguageModel!.create({ ...LM_OPTIONS, monitor });
            const json = await (await querySession).prompt(
                `A reader of the essay "${title}" asked: "${question}"\n` +
                    "Write a short search query (2 to 6 words) that would find background for an answer.",
                {
                    responseConstraint: {
                        type: "object",
                        properties: { query: { type: "string" } },
                        required: ["query"],
                    },
                },
            );
            return (JSON.parse(json).query as string).trim() || question;
        } catch (error) {
            console.warn("[on-device-ai] query generation failed, searching the question as typed:", error);
            querySession = undefined;
            return question;
        }
    };

    const renderSources = (sources: Source[], query: string) => {
        sourcesOut.replaceChildren(
            ...sources.map((s, i) => {
                const li = document.createElement("li");
                const num = document.createElement("span");
                num.className = "num";
                num.textContent = `[${i + 1}]`;
                const a = document.createElement("a");
                a.href = s.url;
                a.textContent = s.title;
                if (s.origin !== "Overfit") {
                    a.target = "_blank";
                    a.rel = "noopener";
                }
                li.append(num, a, ` · ${s.origin}`);
                return li;
            }),
        );
        sourcesOut.dataset.query = `Searched for “${query}”`;
        sourcesOut.hidden = sources.length === 0;
    };

    askButton.addEventListener("click", () => {
        askForm.hidden = !askForm.hidden;
        if (!askForm.hidden) {
            setStatus(needsDownload(ask) ? downloadNote : note);
            askForm.querySelector<HTMLInputElement>("input[type=text]")?.focus();
        }
    });

    askForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = askForm.querySelector<HTMLInputElement>("input[type=text]")!;
        const question = input.value.trim();
        if (!question) return;
        const includeWeb = webToggle.checked;
        const submit = askForm.querySelector("button")!;
        submit.disabled = true;
        answerOut.hidden = false;
        answerOut.textContent = "";
        sourcesOut.hidden = true;
        setStatus(needsDownload(ask) ? downloadNote : "Thinking…");
        try {
            session ??= getEssay().then((md) =>
                self.LanguageModel!.create({
                    ...LM_OPTIONS,
                    monitor,
                    initialPrompts: [
                        {
                            role: "system",
                            content:
                                "You answer readers' questions about one essay from Overfit, a blog by Karl Mayer. " +
                                "Base your answer on the essay below. Search results may be attached to a question; " +
                                "use them only when they help, and cite them by number like [2]. If neither the essay " +
                                "nor the results cover the question, say so plainly. Keep answers under 120 words " +
                                "and don't use headings.\n\nESSAY:\n" +
                                md,
                        },
                    ],
                }),
            );
            await session;

            const query = await searchQueryFor(question);
            setStatus(includeWeb ? "Searching Overfit, Wikipedia, and Hacker News…" : "Searching Overfit…");
            const sources = await gatherSources(query, includeWeb);

            const prompt = sources.length
                ? `${question}\n\nSEARCH RESULTS (may be irrelevant):\n${formatSources(sources)}\n\n` +
                  "If you use a search result, cite it inline by its number, like [2]."
                : question;
            setStatus("Thinking…");
            // Show the numbered sources first so citations are checkable as the answer streams in.
            renderSources(sources, query);
            for await (const text of accumulate((await session).promptStreaming(prompt))) {
                renderAnswer(answerOut, text, sources);
            }
            setStatus(
                includeWeb
                    ? `The model ran in your browser. Your search query was sent to Wikipedia and Hacker News.`
                    : note,
            );
            input.value = "";
        } catch (error) {
            session = undefined;
            fail(error);
        } finally {
            submit.disabled = false;
        }
    });
}

// Streaming chunks are deltas in current Chrome but were cumulative in older builds; handle both.
async function* accumulate(stream: AsyncIterable<string>) {
    let text = "";
    for await (const chunk of stream) {
        text = text && chunk.startsWith(text) ? chunk : text + chunk;
        yield text;
    }
}

// Key points arrive as Markdown bullets; render them as list items with plain text only.
function renderPoints(list: HTMLElement, markdown: string) {
    const points = markdown
        .split("\n")
        .map((line) => line.replace(/^\s*[-*•]\s+/, "").replace(/\*\*|__|`/g, "").trim())
        .filter(Boolean);
    list.replaceChildren(
        ...points.map((point) => {
            const li = document.createElement("li");
            li.textContent = point;
            return li;
        }),
    );
}
