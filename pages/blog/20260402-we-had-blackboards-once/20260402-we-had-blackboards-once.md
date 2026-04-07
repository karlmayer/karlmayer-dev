---
title: We Had Blackboards Once
date: 2026-04-02
tags: ["posts"]
layout: blog-post
description: "The supervisor pattern recovered the coordinator. It didn't recover the board."
excerpt:
  "Modern agent systems rediscovered coordination, but forgot the shared board that makes
  uncertainty explicit, auditable, and adaptable under real-world ambiguity."
---

<!-- Excerpt Start -->

{% image "ai-gen-whiteboard-photo.png", "Two researchers in 1970s Carnegie Mellon laboratory pointing at a blackboard covered in a modern multi-agent system architecture diagram.", "(max-width: 600px) 100vw, 600px", "The diagram is anachronistic. The problem isn't. [Pawn to queen four.](https://www.cs.cmu.edu/news/2022/50-years-speech-recognition)" %}

In 1976, a team at Carnegie Mellon built one of the first systems that could recognize continuous
human speech. Not isolated words. Not a small, curated vocabulary. Actual speech — messy, ambiguous,
full of noise and human variation.

They called it [Hearsay‑II](https://dl.acm.org/doi/10.1145/356810.356816). And the challenge it
tackled has a name: an ill‑structured problem. In these problems, evidence arrives unevenly, the
solution path isn't known in advance, and any architecture that assumes a clean sequence of steps is
guaranteed to fail.

The blackboard model didn't fail — it got stranded. When connectionism took hold in the late 1980s
and neural networks began outperforming symbolic AI on benchmark after benchmark, the entire
paradigm went with it. Not because it was wrong, but because the field moved on to different
problems. The distinction matters now, because we're building AI systems that face the same class of
problems Hearsay‑II was designed for.

<!-- Excerpt End -->

## The Hearsay room

Imagine a large whiteboard in the middle of a room. Around it stand specialists: one who understands
acoustic signals, one who knows phonemes, one who handles syllables, one who knows vocabulary, one
who understands grammar. None of them can solve the problem alone. But all of them can read from and
write to the [blackboard](<https://en.wikipedia.org/wiki/Blackboard_(design_pattern)>).

When a specialist notices something within their expertise, they post a hypothesis — a candidate
interpretation with a confidence score — at the appropriate level. Acoustic signals at the bottom,
then phonemes, syllables, words, phrases, sentences at the top. No specialist can jump levels; the
hierarchy is explicit and enforced.

Another specialist uses a posted hypothesis as a foothold for the next level up. Multiple candidates
coexist at each level until evidence eliminates them, which means the system avoids premature
commitment by design.

A meta‑level controller watches the accumulating interpretations and decides which specialist acts
next based on what's currently most promising. The solution path emerges from the evidence, not from
a predetermined sequence.

The result was continuous speech recognition — noisy, ambiguous, real-world speech — at a time when
no other architecture could manage it.

## The supervisor's limits

Modern AI systems have already discovered that simple pipelines break on complex tasks. The field's
answer has been the [supervisor pattern](https://github.com/langchain-ai/langgraph-supervisor-py): a
central LLM that dispatches to worker agents, interprets their outputs, and decides what to run next
— a real improvement that routes dynamically and adapts to what workers return.

But it only recovers the coordinator — one piece of Hearsay‑II — and misses three key problems.

**1. The medium is wrong.** In the supervisor pattern, workers report to the supervisor, who
synthesizes and decides, making the supervisor itself the communication medium. In the blackboard
model, agents never talk to each other or to the coordinator directly; they only read and write
shared state. When the board is the medium, state is explicit, persistent, and inspectable
independently of any agent's behavior. When something goes wrong, you can examine what was asserted,
when, and with what confidence.

**2. Uncertainty collapses too early.** In the supervisor pattern, each worker output gets
synthesized into the supervisor's running context — folded into a single accumulating narrative. By
the time the next worker runs, earlier interpretations are gone, not weighed against alternatives.
The blackboard model keeps multiple hypotheses alive at each level until evidence eliminates them.

**3. There are no abstraction levels.** In the supervisor pattern, workers can produce outputs at
any level of abstraction and the supervisor handles it. In the blackboard model, levels are
architectural constraints — a phoneme‑level specialist cannot produce a sentence‑level hypothesis.

The supervisor recovered the coordinator, but not the board, the hypotheses, or the levels, which
happen to be the parts that matter most for ill-structured problems.

The supervisor pattern answers the question: _how do I coordinate multiple agents toward a known
goal?_ It does not answer: _how do I solve a problem whose solution path I don't know yet?_

## Two real-world applications

Consider a software‑engineering agent working toward a long‑horizon goal on a large, ambiguous
codebase: refactor this system, fix this class of bugs, implement this feature from an
underspecified requirement.

An agent is asked to migrate a monolith to a service-oriented architecture. At step 2, it identifies
a core abstraction — call it the "user session" — and classifies it as stateless. That
classification is plausible. It's also wrong. Steps 3 through 15 build on it: services are scoped
around it, interfaces are designed to it, data models derive from it. By step 15, the agent has
produced technically coherent code for the wrong architecture. Every individual step was reasonable.
The system never had a mechanism to revisit step 2 because step 2 wasn't a hypothesis. It was a
fact, routed forward.

Now consider an R&D agent — not executing against a known spec but assembling meaning from
contradictory, incomplete evidence where even the right question is uncertain. The work isn't
producing a deliverable; it's maintaining a structured set of competing interpretations and letting
evidence adjudicate. Collapsing to a single hypothesis early isn't just inefficient; it's the
failure mode that defines bad science.

In both cases, evidence arrives across multiple levels simultaneously: raw data, intermediate
interpretation, theoretical implication, architectural constraint. A supervisor pattern has no way
to represent that structure: it can't reopen a higher‑level question when a lower‑level finding
changes, hold competing interpretations in parallel, or do anything other than route forward.

## Architecting blackboards

The Hearsay‑II principles translate directly into design decisions you can make.

- The **blackboard** becomes a structured shared store (typed, inspectable, append‑friendly) that
  agents read and write instead of passing context directly. State becomes explicit. Failures become
  inspectable.
- **Knowledge sources** become scoped agents with constrained roles. Not "an agent that does
  research," but an agent that operates at a specific abstraction level and only produces outputs
  appropriate to that level.
- The **level hierarchy** becomes architectural. You decide upfront what the levels are, what moves
  between them, and who reads what.
- **Competing hypotheses** are preserved. Multiple agents produce candidates at the same level;
  higher‑level agents evaluate them. Uncertainty survives longer.
- The **scheduler** becomes an opportunistic orchestrator that decides what runs next based on the
  current state of the board.

One honest caveat: the LLM inside each agent doesn't respect your level structure. It will still
internally collapse levels in a single forward pass. You're enforcing the structure at the API
boundary, which gives you interpretable failure modes and structured handoffs, but not the epistemic
guarantees Hearsay‑II's levels provided. The structure is external, but external is what makes it
inspectable.

## The coming ceiling

Emerging agentic problems are different: long-horizon, ambiguous, requiring reasoning across
multiple levels of evidence with compounding commitment. The dominant failure mode is already
visible — not hallucination, not capability gaps, but premature commitment routed forward through a
coordinator with no shared board to inspect, no competing hypotheses to hold, and no levels to
enforce.

There's a reasonable chance we don't ignore this so much as rediscover it — piece by piece, each
time we hit the ceiling — and build blackboard-like systems without knowing that's what they are.
Which means we'll make the same design decisions Hearsay-II already made, without the fifty years of
reasoning about why.

We had blackboards once. We'll have them again.

— Karl

_P.S. One thing this piece doesn't answer: what should actually go on the board. What agents write,
what they read, what counts as a hypothesis versus a conclusion, and how you design the vocabulary
for each level, none of that is obvious, and getting it wrong undermines everything else. That's
next._

---

_Further reading_

Two recent papers applying blackboard architecture to LLM multi-agent systems — and showing it
works:

- [LLM-Based Multi-Agent Blackboard System for Information Discovery in Data Science](https://arxiv.org/abs/2510.01285)
  — Salemi et al., 2025. Blackboard architecture outperforms supervisor-style baselines by 13–57% on
  data science benchmarks.
- [Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture](https://arxiv.org/abs/2507.01701)
  — Han et al., 2025. First implementation of blackboard architecture in LLM multi-agent systems,
  competitive with state-of-the-art while using fewer tokens.
