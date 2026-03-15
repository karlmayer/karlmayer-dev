---
title: Chess Instincts. Poker Stakes.
date: 2026-03-14
tags: ['posts']
layout: blog-post
description: "AI agents have chess instincts. The world they're deployed into plays like a poker table."
---

<!-- Excerpt Start -->

{% image "knight-and-cards.png", "A chess knight resting on a deck of playing cards.", "(max-width: 600px) 100vw, 600px", "[Eight moves. All of them wrong.](https://en.wikipedia.org/wiki/Knightmare_Chess)" %}

You know that moment in Scrabble when your perfect word vanishes because someone played right across your spot? You had a plan. Now you don't. You find another one.

For an AI agent, that moment doesn't exist. The plan just keeps running — grandmasters at a poker table, certain the game is about to make sense.

The good news is it's a design problem, not a model problem.

<!-- Excerpt End -->

---

## Grandmaster. Card Shark. Scrabble Player.

The grandmaster is easy to admire. Every piece visible, every threat calculable, every move planned within a complete picture. Commitment has real value when the task is well-defined, the inputs are reliable, and the goal doesn't shift.

The card shark looks compelling too. Adaptive, responsive, always reading the room. But a card shark who never commits loses. Constant reassessment without execution is just hesitation with good instincts.

What you want is a Scrabble player — someone who arrived with a plan, reads the board as it changes, and commits when the moment is right.

So why don't agents work that way already?

---

## Why Agents Default to the Chessboard

When an AI agent works through a task, it generates text one token at a time — each word shaped by everything that came before it. Once it has written out a plan, that plan sits in its working memory, pulling every subsequent step toward consistency with it. The further it goes, the harder it becomes to deviate. A committed plan becomes self-reinforcing.

One contributing factor is the training data itself. These models learned from an enormous amount of human text, and the overwhelming pattern in that text is: people start things and finish them. Stopping midway, backtracking, saying "actually my earlier reasoning was wrong" — that's statistically rare in human writing. So the model absorbed a deep prior toward completion.

The result is what I'd call **completion bias**: a strong, baked-in instinct to execute the plan within a single context window. Not because the agent is stubborn, but because forward progress is what it learned to do.

For now, the grandmaster is where every agent begins.

---

## What Goes Wrong

Completion bias isn't abstract. Consider what happens when a task hits a partial failure — one tool call succeeds, the next returns an error.

I ran a small test across four deliberately underspecified tasks. A baseline agent (no intervention) retrieved Q3 2024 revenue successfully, then hit an archive error for Q3 2023. It reported the blocker clearly — and then kept going anyway, producing a worked example with a fabricated $3.5M baseline and a calculated YoY growth figure. The task looked complete, but the numbers were invented.[^1]

That's the failure mode in its clearest form: not a crash, not silence, but a plausible-looking output built on a foundation the agent admitted it didn't have.

The pattern generalizes to three specific ways completion bias surfaces in longer tasks. **Plan fixation**: a step produces a result that makes a later step unnecessary, but the agent runs it anyway. **Error propagation**: a tool returns quietly wrong data, which flows into every downstream step as valid input. **Missed shortcuts**: the agent reaches the answer at step two and executes four more steps because that was the plan.

None of these require a catastrophic failure to cause damage. A three-step task without reassessment is probably fine; a fifteen-step task is a compounding error machine.

---

## Teaching Your Agent to Read the Table

### Give It Permission to Stop

You don't need to rebuild the model. The most direct fix is a single instruction in your agent's system prompt. The idea is simple: failure is an option. In practice, a phrasing that works is more specific than that:

> *If at any point you cannot proceed without information you don't have access to, stop and explain what's blocking you rather than making assumptions to fill the gap.*

The precision matters. "Failure is an option" grants general permission to stop — but the agent still has to decide what counts as a failure worth stopping for. The longer phrasing targets the specific mechanism: proceeding without information you don't have. That's the decision point where completion bias does its damage, and naming it directly is what closes the gap.

Both phrasings outperformed the baseline in testing, but the more specific version produced cleaner stops — refusing stale comparisons outright rather than hedging around them. The effect is most pronounced not when a task is completely impossible, but at the boundary between partial success and fabrication, when the agent has just enough to rationalize continuing.

What this intervention is actually doing is overriding a prior the model arrives with. Anthropic's own prompting documentation recommends telling agents to "always be as persistent and autonomous as possible" and to "never artificially stop any task early." That's the factory default. The one-sentence fix isn't adding a feature — it's pushing back against a deeply set completion instinct.

For anyone using AI directly rather than building agents, the same logic applies:

> *As you work through this, if you hit a point where you'd need to guess or assume to continue, stop and tell me what's missing rather than filling in the gap.*

You're inserting the permission to fail that the agent's default wiring skips.

### Plan One Step Ahead, Not Ten

That prompt fix is the surface. Underneath is a deeper architectural choice.

**Plan-then-execute** generates a complete multi-step plan upfront and runs it. Efficient, elegant, fragile in dynamic environments. The chess approach.

**Step-and-reassess** plans one or two steps ahead, executes, observes what actually happened, and decides what comes next. Less tidy. Considerably more reliable when the world doesn't cooperate with the plan. The Scrabble approach.

For a technical builder, this is a design decision that shapes your entire agent loop. For anyone else, you can approximate it in a prompt:

> *Don't plan everything upfront. Take the first step, tell me what you found, and we'll decide the next step together based on that.*

This turns a single-shot task into a collaborative loop.

### Reassess Before You Commit

Some AI systems offer *extended thinking* — a mode where the model reasons through a problem in a private scratchpad before producing an action. This is different from the above interventions in an important way: it moves reassessment to *before* the commitment is made, not after.

The model can notice contradictions between its plan and new evidence while still in the reasoning phase — before the output is locked in. It's most powerful at the start of a task, before the first action is committed to, rather than between steps.

Use it for tasks with genuine uncertainty or multiple plausible paths. The prompt that gets the most out of it:

> *Before you take any action, think through what could go wrong with the obvious approach and whether there's a better path given what you know so far.*

---

A Scrabble player doesn't mourn the word that got blocked. They find another one. The interventions above don't make the agent smarter. They give it room to reason when the world doesn't cooperate with the plan.

— Karl

[^1]: The tool responses in this test were synthetic, and this is a small sample — four tasks, not an extensive study. Full methodology and results at [karlmayer/agent-evals-lab](https://github.com/karlmayer/agent-evals-lab). Two variants with explicit stopping instructions held the line on all four tasks; the baseline fabricated past a partial result on one.
