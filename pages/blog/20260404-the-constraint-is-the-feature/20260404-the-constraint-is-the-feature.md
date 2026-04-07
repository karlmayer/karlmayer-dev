---
title: "The Constraint Is the Feature"
description:
  "What transfer learning actually means, and why the right model choice follows from understanding
  it."
excerpt:
  "Teachable Machine works because transfer learning constrains the problem. The same constraints
  that make fast demos possible also define where they fail."
date: 2026-04-04
tags: [posts, ml, pwa, teachable-machine]
layout: blog-post
---

<!-- Excerpt Start -->

{% image "teachable-yoga.png", "Teachable Yoga app predicting a yoga pose from webcam input.", "(max-width: 600px) 100vw, 600px", "[Virabhadrasana II, if you're feeling formal.](https://www.yogajournal.com/poses/warrior-ii-pose/)" %}

Most introductions to machine learning are lectures. Google's
[Teachable Machine](https://teachablemachine.withgoogle.com/) is a lab. It trains a real neural
network in five minutes. Your dataset can fit in a single phone camera roll. No code, no GPU, no
waiting. I love to share it with kids and adults. The moment it correctly identifies something they
trained it on, something shifts. AI stops being magic and starts being a thing you can understand.

Let's go deeper than I usually do. Before we get into the why, here it is:

<!-- Excerpt End -->

<iframe
  src="https://karlmayer.github.io/teachable_yoga/"
  title="Teachable Yoga Demo"
  loading="lazy"
  allow="camera"
  style="width: 100%; height: 720px; border: 0; border-radius: 8px;"
></iframe>

## Not Magic. Transfer Learning.

Without [transfer learning](https://www.ibm.com/think/topics/transfer-learning), that camera roll of
images gets you a model that memorizes rather than learns. You'd need orders of magnitude more data
just to start generalizing, plus serious compute and days of training. A model built from scratch on
a few dozen images has seen almost nothing.

Teachable Machine sidesteps all of that. Instead of training a model from nothing, you start with
one that already knows a lot, then teach it the last step. Like hiring someone with twenty years of
experience and spending an afternoon showing them how your company does things.

What's technically happening: the pre-trained backbone runs your input and converts it into a
feature vector encoding what it has learned to notice. Your training data never touches the
backbone. You're training a small classifier on top of it, learning to map those feature vectors to
your specific classes. The backbone stays frozen. That's why a few dozen examples is enough. You're
not teaching the model to see, you're teaching it to sort.

Every model type Teachable Machine offers uses a pre-trained backbone:
[MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) for images,
[Speech Commands](https://github.com/tensorflow/tfjs-models/tree/master/speech-commands) for audio,
[PoseNet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) for pose. These models were
trained on millions of examples and already understand the world: edges, shapes, body structure,
acoustic texture. The constraint of a fixed backbone is exactly what makes it work. But the backbone
has to match the problem. Speech Commands was trained on short spoken commands ("yes", "no", "stop",
"go"); use it for environmental sounds and the constraint works against you rather than for you.

## Pose Model, Not Image Model

Yoga poses are a good classroom example because everyone can do them in front of a webcam and the
model's failures are immediately legible. If it confuses Tree with Warrior II, you can see exactly
why.

{% image "teachable-machine-interface.png", "Teachable Machine pose project with five classes on the left, a trained model in the center, and a preview panel on the right classifying a sample image as Goddess with 100% confidence.", "(max-width: 600px) 100vw, 600px", "A pose project in Teachable Machine: five classes, one trained model, and a live preview scoring Goddess at 100%." %}

For yoga pose recognition, Teachable Machine offers a choice that matters more than it looks: image
or pose. The image model classifies based on raw pixels. The pose model runs PoseNet first,
detecting 17 body keypoints, and classifies the resulting skeleton. The difference isn't just what
each model sees. It's what each model _can't_ see.

The image model's feature space includes everything in the frame: lighting, background, clothing,
mat color. It could learn to classify your yoga poses by the color of your pants and report high
confidence doing it. Technically precise. Structurally wrong.

The pose model doesn't have that problem, not because it's better at ignoring irrelevant features,
but because those features aren't present. You get 34 numbers encoding body geometry. Clothing color
contains no signal there. The anti-overfitting is architectural: you designed out the spurious
correlation before training started.

The tradeoff is constraint: occlusion degrades it. PoseNet estimates keypoints it can't see, so a
cropped frame produces uncertain results rather than a clean error.

## Under the Hood

With the model sorted, the rest was engineering. TensorFlow.js runs entirely in the browser, so
nothing server-side needed. Vite was the right call over Next.js — all client-side inference, no
server-side rendering needed. `vite-plugin-pwa` handles the service worker and manifest, GitHub
Actions deploys to GitHub Pages, Claude Code scaffolded it, and the core inference loop (load model,
grab webcam frame, run PoseNet, classify, draw skeleton overlay) lives in a single component. That
makes it a better classroom tool: feedback is immediate, no camera frames round-trip to a server,
and no student images go anywhere.

[Workbox](https://developer.chrome.com/docs/workbox), Google's service worker library, handles
caching so the whole thing runs offline after the first load. That matters less as a feature than as
a constraint: if a student opens the app in a gym or a school with bad Wi-Fi, it should still work.
The tradeoff is that performance lives and dies on the device in hand.

One thing worth flagging: testing the model against static images. The instinct is to write a
Node.js test script. It won't work. PoseNet requires a browser WebGL context that never exists in
Node. You need to run the model somewhere a browser lives, whether that's a test mode built into the
app or a headless browser via Selenium.

## What We Learned

The skeleton abstraction helps more than you'd expect. Lighting, clothing, and background don't
reach the classifier. Body proportion and flexibility do, but that's a narrower diversity problem
than an image model would face. A camera roll from one person in one room is actually a reasonable
starting point.

Device performance is a real constraint. PoseNet is smooth on a MacBook and sluggish on a budget
Android mid-session when thermal throttling sets in. The gap between demo and production lives here
more than anywhere else.

The deeper learning: this classifies poses, not sequences. A real yoga instructor doesn't care that
you hit the keypoints for Warrior II. It cares that you held it. Classification is the wrong unit
for a real yoga app. That's not a failure of Teachable Machine; it's a problem definition question
that sits upstream of any model choice.

More in the
[learnings doc](https://github.com/karlmayer/teachable_yoga/blob/main/docs/learnings.md). Try it on
your mobile device:
[karlmayer.github.io/teachable_yoga](https://karlmayer.github.io/teachable_yoga/). The
[code is here](https://github.com/karlmayer/teachable_yoga) if you want to retrain it for your own
classes.

The constraints that make it work and the constraints that limit it are the same thing. The backbone
that enables small datasets also fixes the feature space. Knowing which constraints are features and
which are walls is most of the design work.

— Karl
