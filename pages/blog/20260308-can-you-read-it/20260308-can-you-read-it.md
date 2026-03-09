---
title: Can You Read It?
date: 2026-03-08
tags: ['posts']
layout: blog-post
description: "AI is writing faster than ever. The question is whether anyone can keep up with the reading."
---
<!-- Excerpt Start -->

{% image "neos-epiphany.png", "Green Matrix-style digital rain symbolizing machine output versus human understanding.", "(max-width: 600px)", "[“I don't even see the code.”](https://www.imdb.com/title/tt0133093/characters/nm0001592/)" %}

For as long as software has existed, we have measured the bottleneck.
When output was scarce, we counted output. That made sense.

Story points. Velocity. Pull requests merged. Tickets closed. Each
one a new vocabulary for the same instinct — count what gets
produced, because production is what you can see.

It goes back further than that. IBM was counting [K-LOC](https://en.wikipedia.org/wiki/Source_lines_of_code) (thousands
of lines of code) in the 1960s. The assumption was simple: more
code meant more work, more value, more progress. Never mind that
the best engineers wrote less. Never mind that every line added was
a line someone would have to read, debug, and maintain forever.
Output was visible. Quality was not.

Now comes the next iteration: tokens in, tokens out. A reasoning
model generates ten thousand lines before lunch. Management sees
the number and feels progress. The dashboard is very green.

But here's what the dashboard doesn't show: whether anyone actually
understands what was produced.

<!-- Excerpt End -->

*You either see through the code or you don't.*

This is the inversion that doesn't get enough attention: generation is no longer the scarce resource. Comprehension is.

Can you look at ten thousand lines of generated code and understand what it's
actually doing? Can you find the assumption it got wrong? Can
you hold the structure in your head well enough to know what's
missing?

That skill doesn't show up in any token counter. It leaves no
output trail. The engineer who read carefully and deleted four
hundred lines today looks, on every dashboard we have, exactly
like the engineer who did nothing.

That's a problem, because deletion might be the most honest signal
of comprehension we have. Not what you shipped, but what you cut.
Every line removed is a line someone understood well enough to
judge unnecessary. Bloat is what happens when nobody is reading.

But deletion is quiet. Pressure is not. A 2am incident, a security audit, a production failure in a
codebase that was generated faster than anyone read it — you cannot
fake your way through those moments. Volume of output offers no
protection. The question isn't how much code exists; it's whether
anyone actually understands it.

This is what senior engineering judgment looks like now: not the
ability to generate, which any model can do, but the ability to read.
To see intent behind output. To know when the [woman in red](https://matrix.fandom.com/wiki/Woman_in_Red) is a distraction.

We don't have a metric for that yet. Every measure we've ever built
has been a proxy for production, and comprehension leaves no trace on
a dashboard.

Which means we are about to repeat the K-LOC mistake at scale,
optimizing hard for the thing we can count, and ignoring the thing
that actually matters.

The bottleneck moved. The code is raining down. Can you read it *fast enough?*

<span id="blink-cursor" style="font-family: monospace; font-size: 1.2em; color: #00ff41;">█</span>

<script>
  const cursor = document.getElementById('blink-cursor');
  setInterval(() => {
    cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
  }, 530);
</script>

— Karl