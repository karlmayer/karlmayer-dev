---
title: The Last Generation of Explicit Logic
date: 2026-03-01
tags: ['posts']
layout: blog-post
description: "For 70 years, computers — first human, then machine — had one job: execute exactly what they were told. Reasoning models just changed that job description for the first time."
ogImageSrc: langley-computer-friden-1952.jpg
---

<!-- Excerpt Start -->

{% image "langley-computer-friden-1952.jpg", "A human computer at work at NASA Langley Research Center in 1952, using a microscope to read data from film while a Friden calculating machine sits beside her.", "(max-width: 375px) 320px, 800px", "[NASA / Image L-74768](https://www.nasa.gov/history/langleys-computers-1935-1970/)" %}

Before computers were machines, they were people — hired to
execute, not to reason.

Through the 1930s, 40s, and 50s, rooms full of women sat at
desks performing calculations by hand. Mathematicians, many of
them — and brilliant ones. The constraint wasn't their capability. It was the job. At NASA, at Los Alamos, at the Bureau of Standards.
[Katherine Johnson](https://en.wikipedia.org/wiki/Katherine_Johnson)
computed orbital trajectories. [Dorothy Vaughan](https://en.wikipedia.org/wiki/Dorothy_Vaughan) managed entire
teams of them. They were called [computers](https://en.wikipedia.org/wiki/Computer_(occupation)).
That was the job title, and the job description was simple and absolute: receive
a specification, execute it precisely, return the result. No judgment,
no interpretation, no deviation. They were valued for exactly one
quality: the ability to suppress their own reasoning in service
of perfect fidelity to the specification.

When the machines arrived, they inherited the job description wholesale.
Alan Turing defined the digital computer as a machine intended to carry
out any operation a human computer could perform.

<!-- Excerpt End -->

Every generation of technology since then added new layers of
abstraction, but never changed: logic must be specified to be
executed. The machine does exactly what you tell it. Nothing more.

That assumption is so deep most people in technology don't know
they hold it.

*And the job description just changed for the first time in 70 years.*

With a [reasoning model](https://en.wikipedia.org/wiki/OpenAI_o3), you express what you're trying to achieve
and the model works out how to get there. Not executing your
logic. Inferring it. The specification becomes optional.

That's not a faster computer. That's a different kind of thing
entirely — one that has more in common with the architect who
designed the calculation than the computer who executed it.

But here's where it gets complicated. We spent generations learning
to be precise, and for good reason. Explicit logic is auditable.
Testable. When a specified system fails, you can find exactly
where it went wrong. When a reasoning model fails, you have
probabilities and educated guesses.

The temptation now is to overfit our reasoning systems the same
way we overfitted our specifications: to constrain them so
tightly with rules, guardrails, and instructions that we recreate
the very rigidity we were trying to escape. To specify the
reasoning itself into submission.

That's the trap. Overspecified reasoning doesn't generalize.
It just fails in more interesting ways.

Which brings us to the question technology has never had to ask
before: *which things still deserve to be specified, and why?*

Should a medical diagnosis system reason its way to a conclusion,
or should every step be specified and auditable? Should a financial
system infer intent or execute rules? Should the software that
flies a plane think, or obey?

The answer isn't obvious. That's the point.

— Karl