---
title: "The AI Wrote the Demo"
description: "Ten questions to fire at your AI product before it goes live."
excerpt: "Ten pressure-test questions that expose what polished AI demos miss, from hidden assumptions to user-facing failures, before production finds them."
date: 2026-03-20
tags: ["posts", "ai", "product"]
layout: blog-post
---

<!-- Excerpt Start -->

{% image "grand-canyon-simulated-lidar.png", "Grand Canyon rendered as a lidar point cloud, canyon walls and floor emerging from fog.", "(max-width: 600px) 100vw, 600px", "AI-simulated lidar scan of the Grand Canyon. [Waymo uses real lidar to drive through fog.](https://www.youtube.com/watch?v=B8TGFA6SfAo)" %}

The demo works until it doesn’t, and what comes next is fog — hiding either a speed bump or a cliff
you only discover on impact.

A self-driving car handles that uncertainty with lidar: it emits its own pulse, reads the return
signal, and builds a picture of what’s ahead. These ten questions work the same way. Paste them into
your AI after the demo works, before you ship.

<!-- Excerpt End -->

In [The Demo Is Not the Product](/post/2026/03/20/the-demo-is-not-the-product), I argued that AI
makes it easy to look like you’re building something without actually building anything real. Demos
won’t surface the problems below on their own.

## 1. First Failure

> What’s going to break first if we went live with this?

Ask this before your users do. The answers usually fall into two categories: what prevents you from
shipping at all, and what ships with you anyway.

The last time I asked this, it surfaced a silent failure: the entire app went blank when a key
third‑party service returned an error. No fallback, no message, just a blank screen.

## 2. Missing Flows

> What will a user try to do that this doesn’t handle?

The AI built what you described. Users will use what you built. Those are not the same thing.

This question reliably surfaces entire missing flows. For me, it caught a missing downgrade path
when a user drops to a free plan (is their content locked or deleted?) and an upload flow that hit
cloud storage before the quota check fires. Ask the model to inhabit the user and reach for
something adjacent, and explore your most frequented user flows.

## 3. Hidden Decisions

> Across this codebase, what assumptions did you make that I didn’t explicitly tell you?

Every codebase is a stack of decisions that never surfaced as questions. The AI made dozens of them.

On an app I’m building right now, this prompt returned over thirty assumptions, including a brand
tagline it invented and an auth‑bypass environment variable it added for headless testing — neither
of which I asked for. Ask for the list. Some of these are harmless. Some of them are the first thing
you’ll hit in production. Some of them _are_ your brand.

## 4. Bad Data

> What happens when the data is empty, null, or wrong?

The demo ran with clean data. Real users won’t.

They’ll send empty strings, null IDs, numbers where you expected text, corrupted files, and dates
formatted three different ways. I’ve seen apps that handled empty states beautifully while still
having fetch calls that silently parsed server errors as valid data. Ask what happens in each case.
“It’ll crash” is an acceptable answer — it tells you exactly where to put the guardrails.

## 5. User‑Facing Failure

> What does failure look like to the user?

Not to you. To them.

Your logs are full of stack traces. Your users see a blank screen, a spinner that never resolves, or
a message that says “Something went wrong.” Most error paths never get exercised because the app was
built against mock data that never fails. Errors get swallowed and turned into empty results that
look like “no data” instead of “something broke.” Ask what each failure mode actually surfaces, and
whether it gives the user anywhere to go. Silent failures are the worst kind.

## 6. Hostile Input

> Where am I trusting input I shouldn’t?

Any data that passes through a user — form fields, query parameters, file uploads, URL slugs — is a
vector.

The AI built the happy path. Ask it to explore what happens when the input is hostile. This question
consistently turns up identity being read from the request body instead of the session (meaning
anyone can act as anyone by changing a single field), or a total lack of schema validation, letting
wrong‑type fields land in the database. “The inputs are unvalidated” is a sentence you want to read
in a chat window, not in a postmortem.

## 7. Easy Breaks

> What could a hostile user break with minimal effort?

Not a sophisticated attacker. Just someone who wants to break it.

The findings here are usually boring and urgent: sequential numeric IDs in URLs that let anyone
enumerate other users’ records by incrementing a number, or state transitions you never designed
for. Ask the AI to think adversarially about the thing it just built. The answers aren’t always
security vulnerabilities; sometimes they’re just friction you didn’t anticipate. If you want to go
deeper, swap “minimal effort” for “real intent” and see what changes.

## 8. Real Load

> What would 100 simultaneous users expose?

You don’t need a load test to see some problems coming. You just need to ask.

This prompt once surfaced a subtle issue: each serverless instance was holding its own database
connection pool, meaning modest concurrency could exhaust the database almost immediately. It also
flagged unauthenticated file‑upload endpoints — harmless in development, an open invitation for
abuse at scale.

## 9. Real Cost

> What does this cost to run, and what could make that number spike?

Ask the AI to reason about the cost profile at real usage. On one app, I discovered that a single
viral moment — a large media file with 100K views — would rack up hundreds of dollars a day in
egress fees. The fix was already in the stack, just unwired. I would not have enjoyed learning that
lesson in production.

## 10. The Honest Demo

> What would I avoid showing a skeptical technical user?

Every other question is technical. This one saves you from yourself.

When I ran this on a recent vibed demo, the answer came back immediately: mock data everywhere, no
real persistence, no backend. Anyone could “be” any user. A critical upload flow was UI‑only. None
of that was wrong for the stage it was at, but knowing it changed how I presented it.

---

They’re the questions that surface once the demo works and you start thinking about what breaks next. They’re how you see what’s hiding in the fog before you hit it.

— Karl
