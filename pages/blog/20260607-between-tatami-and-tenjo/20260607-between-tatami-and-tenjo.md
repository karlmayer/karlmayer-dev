---
title: Between the Tatami and the Tenjō
description: Why testing AI agents demands trust calibration, not correctness verification.
date: 2026-06-07
tags: [posts, ai, agents, testing, evals]
layout: blog-post
excerpt:
  "Agents don't run. They behave. Same input produces a distribution of outputs, not an answer. Once
  behavior replaces output, the whole premise of testing shifts."
---

_Quiet here for a while. I've been shipping agentic solutions — deep into automated testing and
eval, and the surprises that come with it. Here's what I learned._

## We're Not Testing Software Anymore

I'm seeing teams try to test AI agents like traditional software. Specs like requirements. Tests
like verdicts. Green checkmarks meaning "this works."

That mental model doesn't survive contact with an agent.

Traditional software is deterministic. Same input, same output, every time. A failing test means
something broke. A passing test means something holds.

Agents don't run. They behave. Same input produces a distribution of outputs, not an answer.

And once behavior replaces output, the whole premise of testing shifts. We're no longer validating a
function. We're evaluating a distribution.

Accept that, and the rest follows: specs become floors, tests become measurements, reliability
becomes statistical, and "green" stops meaning what we think it means.

## The Spec Is the Floor

The spec is the minimum coherent description of what the agent must do. Clear it and we've kept the
agent off the reject pile. That's all a spec should do.

{% image "tatami.jpg", "Woven tatami mats covering the floor of a traditional Japanese room.", "(max-width: 600px) 100vw, 600px" %}

And that minimalism is intentional. Over-specify and we're not protecting quality. We're freezing
it. The model improves. The task evolves. The context shifts. A spec written too tightly becomes a
constraint on behavior we'd actually want. Agents are valuable precisely because they generalize.
They handle the unexpected, the edge case, the thing we didn't think to write a rule for.

So the floor should be stable. Like [tatami](https://en.wikipedia.org/wiki/Tatami), the woven mats
that set a traditional Japanese room's dimensions, it's the surface everything else is measured
against. Everything above it should be free to move.

There is one exception. A small set of behaviors where failure is irreversible. Those don't belong
in the spec. They belong somewhere else, and we'll get there.

If the floor defines the minimum, the ceiling defines the stretch. That's where evals actually earn
their keep.

## The Unreachable Ceiling

The ceiling is where our evals live, set deliberately above what the agent can currently reach. Not
because failure is the goal but because unreachable evals make the gap visible. An eval suite the
agent consistently passes has stopped doing its job. The Japanese word for ceiling,
[tenjō](https://en.wiktionary.org/wiki/%E5%A4%A9%E4%BA%95), is written with the characters for sky
and well: a celestial well, a limit you look up at. A ceiling you reach toward, not one you touch.

{% image "japanese-ceiling.png", "An ornate wooden ceiling of a traditional Japanese building.", "(max-width: 400px) 50vw, 400px" %}

What goes up there? Everything that matters. Single-turn responses. Multi-turn coherence. Tool call
accuracy and sequencing. Order of events. Gates and policies respected under pressure. And most
importantly: outcomes. Did the agent actually accomplish what it was asked to do, end to end, in a
way a reasonable person would accept?

This is where traditional testing runs out of road. We can assert a tool was called. We can't easily
assert the outcome was good. For ceiling-level eval, the best judge available right now is another
AI. LLM-as-a-judge isn't perfect. It has biases and blind spots. But it scales in a way human review
doesn't and it evaluates dimensions no assertion can capture.

Use it. Calibrate it. Don't trust it blindly.

And notice the language shift: these aren't tests anymore. Tests assert. Evals measure. We're
measuring.

## Green Is a Snapshot, And We Choose the Threshold

Deterministic evals against a non-deterministic system report a result that was only ever true once.
In that run. With that seed. With that prompt. The eval result is a sample. Treat it like one.

But there's a second lie buried here. Not just that green is a snapshot, but that the threshold for
green was a design decision most teams pulled out of thin air. What pass rate is good enough? 90%?
95%? The answer depends entirely on what the agent is doing and what failure costs.

A customer-facing agent making irreversible decisions needs a different threshold than an internal
drafting tool. Threshold-setting is a trust decision, not a technical one. Make it explicitly. Own
it.

"All green" doesn't imply reliability. It implies we crossed a threshold we may not have thought
hard enough about.

## The Oracle Problem

In testing theory, an [oracle](https://en.wikipedia.org/wiki/Test_oracle) is the external authority
that decides whether an output is correct. For traditional software, the spec is often oracle
enough. For agents, the spec runs out fast.

Did the agent plan well? Was the response helpful? Did it choose the right tool at the right moment?
We can define a floor, but we can't always define correct. The oracle has to be a human, because no
formal specification exists that could do the job instead.

This is why human review exists. Not as a temporary inconvenience but as the only available oracle
for tasks where correctness is irreducibly subjective. The solution isn't to eliminate the oracle.
It's to be honest about which tasks need one.

Split the eval suite: deterministic assertions where ground truth exists, human-or-LLM-as-judge
where it doesn't. Treat them as different kinds of evidence. They are.

And once the oracle starts to blur, you need something firmer than judgment. You need boundaries.

## Tripwires: The Only Hard Ground

But the oracle has an expiry date. As the agent grows more capable, the eval suite grows with it.
Eventually review volume outpaces reviewer attention. The human is still there, skimming, not
judging. Still nominally the oracle. No longer actually one. It degrades quietly, the worst kind of
degradation.

So plan for that from the start. Don't discover it in production.

Pick tripwires instead. A small, brutal set of evals that capture what the agent must never get
wrong. Non-negotiable. Someone owns each one, probably the product owner. Create accountability.

Choosing tripwires is harder than it sounds. It requires knowing which failures are recoverable and
which aren't. A bad plan can be revised. A leaked credential can't. A wrong answer can be corrected.
A discriminatory output in a regulated context can't.

Tripwires live at the boundary of the irreversible. That's the selection criterion.

If the failure mode is recoverable, it belongs in the probabilistic middle. If it isn't, it's a
tripwire.

When one fails, work stops, and someone has already agreed to that consequence. That's what makes
them hard ground.

Everything else is a distribution. The tripwires are the only hard ground.

And if we don't know which behaviors deserve hard ground, that's our first eval. Expect to fail it a
few times before we get it right.

## Keeping the Evals Clean

Even with all of this in place, there's still one way to lose the whole system. It comes down to
what gets to see the evals.

The first risk is familiar. If the agent under test is trained on data that includes its own evals,
or optimized against them, it learns to pass the evals, not to exhibit the behavior the evals were
meant to capture. Goodhart's Law. The measurement becomes the target and stops being a measurement.
The standard advice is data separation: keep eval data out of training. Most teams know this.

The second risk is newer, and I haven't seen much on this. It's the coding agents we use to build
and maintain the system. These agents reads the whole codebase, including the eval logic. The evals
sit in the same repo as the implementation, and the coding agents' reasoning starts bending toward
them. Not because they're cheating, but because that's what's in context.

{% image "shoji.jpg", "An AI agent on one side of a shoji screen, the eval suite walled off on the other.", "(max-width: 600px) 100vw, 600px", "[Traditionally, shoji don't lock.](https://en.wikipedia.org/wiki/Shoji)" %}

My instinct, still evolving, is that eval code belongs in a separate repo, with restricted access
and different ownership. A [shoji](https://en.wikipedia.org/wiki/Shoji), the sliding paper screen,
makes a deliberate division in a room, and it slides because it's meant to. That's the right model.
The goal isn't to seal the coding agent away from the evals forever. Sometimes it should see them,
to debug a flaky case or refactor the harness itself. The goal is to control when the screen opens.
Closed by default, open by a deliberate act, never ambient. The coding agent writing the
implementation works with the screen shut. When it needs the eval side, that's a different session,
ideally a different instance, and whatever it learns there doesn't get to quietly inform the
implementation the evals are meant to judge.

All of this points to a deeper truth: we're not striving for correctness now as much as we are for
trust.

## From Correctness Verification to Trust Calibration

Everything above leads here.

We've been doing correctness verification. Same input, same output, assert the result, mark it
green. That discipline is rigorous, well-understood, and wrong for this problem.

What we actually need is trust calibration. Not "does this pass" but "how much do we stake on this,
under what conditions, and who's accountable when that trust breaks." Those are different questions.
They require different infrastructure, different culture, and a different relationship with failure.

Trust isn't binary. It accrues. It decays. It transfers slowly from humans to systems, and only as
fast as the evidence warrants. A green dashboard doesn't build trust. Months of stable pass rates,
clean tripwires, honest oracles, and reviewers who are still actually reviewing. That builds trust.

The agent isn't trying to pass our evals. It's trying to earn our confidence.

Build the infrastructure that measures whether it has.

And if our evals are still just asserting correctness against a system that doesn't guarantee it,
now we know what they're lying about.
