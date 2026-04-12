---
title: "What Goes on the Whiteboard"
description:
  "A blackboard architecture for cryptarithmetic constraint solving — how I designed a system where
  agents read and write shared structured state, and what three versions taught me about using LLMs
  to reduce search space."
excerpt:
  "A blackboard architecture sounds simple until you build one. Then it sounds obvious — but only in
  retrospect."
date: 2026-04-12
tags: [posts, architecture, ai]
layout: blog-post
---

<!-- Excerpt Start -->

{% image "send-more-money.png", "The cryptarithmetic puzzle SEND + MORE = MONEY with solution digits mapped.", "(max-width: 600px) 100vw, 600px", "[The classic: where each letter is a unique digit.](https://en.wikipedia.org/wiki/Cryptarithmetic)" %}

A blackboard architecture is a simple idea. Agents read from and write to shared state. Each agent
operates at a specific level. A controller decides what runs next. No agent talks directly to
another.

Most multi-agent systems collapse into a web of direct calls — fast to build, hard to reason about.
The blackboard keeps communication explicit and state inspectable. It lets deterministic and
non-deterministic agents collaborate at scale — a rules engine and an LLM, a simulator and a
reasoning model, a constraint solver and a language model — each reading from the same board, each
doing what it's actually good at. That matters for any domain where you need both correctness and
judgment: drug discovery, financial modeling, logistics, code analysis.

That's the theory anyway. I wrote about
[why this architecture matters](https://www.karlmayer.dev/post/2026/04/02/we-had-blackboards-once/).
This is what building one taught me.

## The sandbox problem

I chose cryptarithmetic as the sandbox. SEND + MORE = MONEY: assign a unique digit to each letter so
the addition holds.

```
  S E N D
+ M O R E
---------
M O N E Y

S=9  E=5  N=6  D=7 M=1  O=0  R=8  Y=2 (base 10)
```

The same puzzle works in other number bases. For example, in base 36, where digits run from 0
through Z:

```
  S E N D
+ M O R E
---------
M O N E Y

S=Z  E=W  N=X  D=6 M=1  O=0  R=Y  Y=2 (base 36)
```

Same structure. Much larger search space. My solver found the base-36 solution in 48,850 nodes —
down from a 1.7 million node baseline — after five rounds of LLM constraint narrowing.

Harder puzzles reveal more. COOKING + HACKING = TONIGHT has 9 unique letters, more columns, and
shared letters creating tighter dependencies across the addition. It has a base-10 solution — I'll
leave that for the reader — here's a base-36 solution found in 63,375 nodes:

```
  C O O K I N G
+ H A C K I N G
---------------
  T O N I G H T

A=Z  C=D  G=8  H=2  I=4  K=K N=1  O=N  T=G (base 36)
```

Cryptarithmetic is hard enough to need multiple agents. Simple enough to reason about what each one
should do. Structured in exactly the levels a board wants — word structure, column arithmetic, digit
domains, solution mapping.

I ran the LLM locally on a MacBook M5 using `openai/gpt-oss-20b` via LM Studio. That way I could
swap models deliberately, see the full output, and optimize for the architecture — not the bill!

No database, no distributed compute, and minimal parallelism needed. Just in-memory data structures
on a single machine. But the architecture scales. The same levels, schemas, and control loop work in
a distributed system.

## Three versions

My initial starting point was to let the LLM do the work. That didn't pan out.

### V1 — LLM-primary

Give the LLM the puzzle, have it propose the full digit mapping, use deterministic agents to provide
context. For famous puzzles it pattern-matched on training data. For novel puzzles it guessed badly.
Repair loops. Two to four LLM calls per puzzle. Didn't solve reliably.

The problem wasn't the LLM. It was what I was asking it to do. Proposing a full mapping collapses
two distinct phases — narrowing the search space and searching it — into one step. That's not what
an LLM is good at.

### V2 — Solver-primary

Next, I tried cutting the LLM down to one call, 128 tokens, search-ordering hints only. Hand the
rest to a backtracking constraint solver. This worked. But the solver was just ended up
brute-forcing nearly all 1.7 million nodes on a hard base-36 puzzle. The LLM was giving hints about
which letter to assign first. It wasn't doing enough to shrink the space before search began.

So I asked: what if the LLM focused entirely on elimination? Not "try S first" but "S can't be these
34 digits, here's why."

### V3 — Blackboard

Last, I switched to the LLM reasoning column by column, round by round, eliminating digits from each
letter's domain before the solver touches it. A board makes the loop legible — the LLM sees what
narrowed, what didn't, and why, then tries again.

V1 asked for the answer. V2 asked for hints. V3 asks for constraints — and gives the LLM the
structure to get better at it each round.

The solver never changed. What evolved was what I asked the LLM to do, and how much structure
surrounded that ask.

## The board

So what made the cut? Here are the six levels — each persisted as JSON messages on the board.

| Level             | What's there                                                         | Example message                                                          |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| L1 — Problem      | Puzzle words, base. Posted once.                                     | `{"a": "SEND", "b": "MORE", "c": "MONEY", "base": 36}`                   |
| L2 — Lexical      | Which letters can't be zero, carry-out facts. Posted once.           | `{"leading_letters": ["S","M"], "carry_out": true, "unique_letters": 8}` |
| L3 — Arithmetic   | Column constraints + per-letter domain sizes. Updated each round.    | `{"domains": {"S": 4, "E": 12, "N": 18, "D": 24}}`                       |
| L4 — Hypothesis   | LLM constraint document: eliminations, ordering, dependencies.       | `{"eliminations": {"M": [0,2,...,35]}, "ordering": ["M","S","O"]}`       |
| L5 — Verification | What applied, what the board rejected and why. Solver partial state. | `{"applied": {"M": [0,2,...,35]}, "dropped": {}, "fullness": false}`     |
| L6 — Control      | Engine decisions: iteration, stagnation, relaxation, outcome.        | `{"iteration": 3, "stagnation_count": 0, "status": "running"}`           |

---

Each round, the constraint agent reads L1, L2, L3, and L5 before calling the LLM — then posts its
output to L4. The LLM sees the puzzle definition, word structure facts, current domain sizes, and
what happened to its prior hypothesis: what stuck and what was rejected. Not a hand-constructed
summary. The actual structured records other agents wrote.

Here's what L4 looks like for SEND+MONEY. The LLM reasons through the columns, self-corrects
mid-thought:

```
[stream] We need eliminations from column arithmetic. Columns: units:
D+E = Y + 36*c1. Since max D+E=70, carry at most 1. So Y = (D+E) mod 36.
No elimination yet.
Tens: E + R + c1 = N + 36*c2. So N = (E+R+c1) mod 36.
Hundreds: N + O + c2 = E + 36*c3. So E = (N+O+c2) mod 36.
Thousands: S + M + c3 = O + 36*c4.
Leftmost column: M + c4 = M? Wait... Actually result's first digit is M.
So c4 must equal M. So M=1... S+M+c3 = O+36. Since M=1: O = S+c3-35.
For O to be valid (0-35), S+c3 must be >=35. So S is 33-35.
If S=35, c3=0 => O=0. If S=34, c3=1 => O=0. So O must be 0.
Eliminations: M must be 1. S must be 34 or 35. O must be 0.
```

And posts this to the board:

```json
{
  "eliminations": {
    "M": [0,2,3,...,35],
    "S": [0,1,2,...,33],
    "O": [1,2,3,...,35]
  },
  "ordering": ["M","S","O"]
}
```

For COOKING + HACKING, we get this in the iteration 1:

```json
{
  "eliminations": {
    "A": [1,2,...,34],
    "C": [0],
    "G": [0,18],
    "H": [0],
    "I": [0,9,18,27],
    "K": [0,4,9,13,22,31],
    "T": [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35]
  },
  "ordering": ["A","I","K","G","H","C","T","O","N"],
  "dependencies": [
    {"columns": [0,2], "shared_letter": "G"},
    {"columns": [0,6], "shared_letter": "T"}
  ],
  "contradiction_checks": [
    {
      "letters": ["A","C"],
      "claim": "If A=0 then c6=0 and c5=0, forcing C+H=T which must be even; if A=35 then c6=1 and c5=1, forcing C+H+1=T. Both consistent but restrict the parity of T."
    }
  ]
}
```

The constraint document has four optional fields. `eliminations` is the only one that narrows the
search space — digits to remove from each letter's domain. `ordering` tells the solver which letters
to assign first. `dependencies` surfaces column relationships where two letters are tightly coupled.
`contradiction_checks` flags pairs of letters the LLM believes are in conflict. All fields are
optional — the LLM is instructed to omit anything it would be guessing. What matters is what it's
confident about, not what it can fill in.

The richer constraint document shows all four fields in use — including `dependencies` and
`contradiction_checks`, which the simpler puzzle didn't need. The LLM is reasoning about carry
relationships across columns, not just individual letter domains.

## Three things I learned

### 1. Wrong eliminations are cheap.

We can't presume the LLM is right. Its confidence in its own output is as unreliable as the output
itself. What matters is that it's useful. If an elimination causes the solver to return
unsatisfiable, the engine relaxes it and continues. A wrong hint costs microseconds of extra
backtracking. A wrong full-mapping proposal costs another ten-second LLM call.

The LLM belongs where mistakes are cheap. The solver belongs where correctness is required. That's
the whole design.

### 2. The reasoning chain doesn't go on the board.

The stream shows why. Long, self-correcting, unstructured. It persists in a side-channel
conversation history — threaded across rounds so the LLM retains continuity — but it doesn't go
through the board.

The obvious argument for putting it there: full transparency, auditable reasoning, another agent
could catch errors before they become eliminations.

The problem: the board holds beliefs — typed, structured entries agents can act on, contradict, or
build from. A reasoning chain is none of those things. It contaminates the hypothesis level with
internal monologue. Thinking tokens dwarf structured output. L4 holds what the LLM concluded, not
how it got there.

The better question isn't whether reasoning belongs on the board. It's whether anything in it is
worth extracting as a typed belief. That's the discipline.

The board carries inter-agent beliefs. The conversation history carries intra-agent continuity. Both
matter. Neither is the other.

### 3. Stagnation is expected, not a bug.

Any given round might narrow the search space — or it might not. No way to know in advance which
paths lead to the solution. That uncertainty is the point. It's why there's a loop.

Stagnation happens when the hypothesis space is exhausted before the solver is. The LLM has nothing
left to eliminate with confidence. Posts contradiction checks instead. Domains stop narrowing.

The circuit breaker — two consecutive rounds with no domain narrowing, hand off to the solver —
isn't fixing a broken design. It's the control layer recognizing hypotheses are spent. The board
tells you when. The controller acts on the signal.

The original blackboard architecture called this scheduler control. When no knowledge source had a
promising hypothesis, the system didn't loop. It decided. Same idea, different name.

## Before you build yours

Building the board forced me to decide what counts as knowledge. At what confidence. At what level
of abstraction. Every design decision came back to that.

The levels encode the epistemic hierarchy. The schemas encode what counts as a hypothesis. The
verification layer encodes what the system is willing to believe. Get any of those wrong and the
board becomes a log — accurate, useless as shared memory.

Three rules I'd start with:

- The board holds findings. What an agent did belongs in a log. What should happen next belongs in
  the controller. Neither belongs on the board.
- Design the read interface first. What question does each agent need the board to answer before it
  acts? That's what belongs there.
- Keep reasoning off the board. If it's not a typed belief another agent can act on, it doesn't
  belong.

And three questions worth sitting with:

- What's the epistemic status of this entry — observation, hypothesis, or conclusion? Does your
  schema capture that?
- What happens when two agents disagree? Does the board have a way to represent that, or does one
  just overwrite the other?
- What's your stagnation signal? How does the controller know when hypotheses are spent?

The architecture is obvious once you've built it wrong twice.

— Karl

_P.S. I'll post the code to GitHub soon._
