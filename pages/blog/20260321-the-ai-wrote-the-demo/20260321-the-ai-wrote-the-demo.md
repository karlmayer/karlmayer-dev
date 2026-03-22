---
title: "The AI Wrote the Demo"
description: "Ten questions to fire at your AI product before it goes live."
date: 2026-03-20
tags: ["posts", "ai", "product"]
layout: blog-post
---

<!-- Excerpt Start -->

{% image "grand-canyon-simulated-lidar.png", "Grand Canyon rendered as a lidar point cloud, canyon walls and floor emerging from fog.", "(max-width: 600px) 100vw, 600px", "AI-simulated lidar scan of the Grand Canyon. [Waymo uses real lidar to drive through fog.](https://www.youtube.com/watch?v=B8TGFA6SfAo)" %}

The demo works. It will keep working, right up until it doesn't. The rest is fog. Somewhere in it: a
speed bump, or a cliff. You don't know which until someone drives off it.

A self-driving car uses lidar to see the road in fog — it emits its own pulse, reads the return
signal, and builds a picture of what's ahead. These ten questions work the same way. Paste them in
after the demo works, before you ship.

<!-- Excerpt End -->

In [The Demo Is Not the Product](/post/2026/03/20/the-demo-is-not-the-product), I argued that AI makes it easy to look like you're building without building anything real. Demos won't surface these on their own.

---

## 1. First Failure

> What's going to break first, if we went live with this?

Ask this before your users do. The answer should come in two categories: what stops you shipping,
and what ships with you. For me, this question recently surfaced a silent failure: the entire app
fails when a key third-party service returns an error. No fallback, no message, just a blank screen.

## 2. Missing Flows

> What will a user try to do that this doesn't handle?

The AI built what you described. Users will use what you built. These are different things. This
question tends to surface entire missing flows: no downgrade path when a user drops to a free plan
(is their content locked or deleted?), and an upload that hits cloud storage before the quota check
fires. Ask it to inhabit the user and reach for something adjacent. This is where "it demos great"
meets "no one actually uses it."

## 3. Hidden Decisions

> Across this codebase, what assumptions did you make that I didn't explicitly tell you?

Every codebase is a stack of decisions that never surfaced as questions. The AI made dozens of them.
On an app I'm building right now, it returned over 30, including a brand tagline it invented and an
auth bypass env var it added for headless testing without being asked. Ask for the list. Some of
these are fine. Some of them are the first thing you'll hit in production. Some of them are your
brand.

## 4. Bad Data

> What happens when the data is empty, null, or wrong?

The demo ran with clean data. Real users will hand you an empty string, a null ID, a number where
you expected text, a file that's been corrupted, a date formatted three different ways. I've seen
apps handle empty states well and still have fetch calls with no error check that silently parsed
server errors as valid data. Ask what happens in each case. "It'll crash" is an acceptable answer:
it tells you where to put the guardrails.

## 5. User-Facing Failure

> What does failure look like to the user?

Not to you — to them. Your error logs are full of stack traces. Your users see a blank screen, a
spinning loader that never resolves, or a message that says "Something went wrong." Most of the
time, error paths have never been exercised; the app was built against mock data that never fails.
Errors get silently swallowed, returning empty results that look like "no data" instead of
"something broke." Ask what each failure mode surfaces and whether it gives the user anywhere to go.
Silent failures are the worst kind.

## 6. Hostile Input

> Where am I trusting input I shouldn't?

Any data that passes through a user (form fields, query parameters, file uploads, URL slugs) is a
vector. The AI built the happy path. Ask it to probe what happens when the input is hostile. This
one consistently finds user identity being read from the request body instead of the session,
meaning anyone could act as anyone by changing one field value, and no request body schema
validation anywhere, so a wrong-type field silently reaches the database. "The inputs are
unvalidated" is a sentence you want to read in a chat window and not in a postmortem.

## 7. Easy Breaks

> What could a hostile user break with minimal effort?

Not a sophisticated attacker — just someone who wants to break it. The top findings here are usually
each a five-minute fix requiring zero sophistication: sequential numeric IDs in URLs, meaning anyone
can enumerate other users' records by incrementing a single number. Ask the AI to think
adversarially about the thing it just built. The answers aren't always security vulnerabilities;
sometimes they're just friction you didn't design for, or state you didn't think about. If you want
to go deeper, swap "minimal effort" for "real intent" and see what changes.

## 8. Real Load

> What would 100 simultaneous users expose?

Ask the AI to reason about scale. Recently, I saw it flag serverless instance holds its own database
connection pool, so concurrent users across concurrent instances exhaust the connection limit fast,
not gradually. It also catches unauthenticated file endpoints: fine in development, free storage for
anyone at scale. This question doesn't require load testing. It requires the AI to think about the
thing it built as a system with real load on it, which it will do competently if you ask.

## 9. Real Cost

> What does this cost to run, and what could make that number spike?

Vibe-coded apps are usually priced for the demo. Ask the AI to reason about the cost profile at real
usage. I discovered in app I'm building a single viral moment (a large media file with 100K views)
would cost hundreds of dollars in a day in egress fees. The fix was already in the stack, unwired. I
would not have liked to find that out the hard way.

## 10. The Honest Demo

> What would I avoid showing a skeptical technical user?

Every other question is technical. This one saves you from yourself. When I ran this on a recent
app, it came back fast: mock data everywhere, no real persistence, no backend. Anyone could "be" any
user. An important upload flow was UI-only. None of that is wrong for the stage it was at — but the
question forced me to say it out loud before someone else found it.

---

None of these questions are clever. They're not a framework. They're what anyone who's shipped
software professionally starts doing automatically, the moment the demo works.

You have the model, the codebase, and the context. These questions are the probe. Point at least one
of them at what's ahead before you ship.
