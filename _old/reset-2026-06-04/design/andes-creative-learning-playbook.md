---
title: Andes Creative Learning Playbook
date: 2026-06-04
status: learning-before-redesign
purpose: raise creative quality before any new Andes visual production
---

# Andes Creative Learning Playbook

This is a learning note, not a website spec. The previous styleframes were useful as information architecture, but they were not strong creative work. They looked like diagrams. Andes needs investor-grade motion narrative: a visual system that makes the company feel inevitable, specific, and large.

## 1. What Was Wrong With The First Styleframes

The main issue was not layout polish. The issue was creative method.

The frames were built from abstract rectangles, labels, lines, and copy. That creates clarity, but not cinematic conviction. It can explain the business, but it does not make the viewer feel the market, the friction, or the magnitude.

Specific failures:

- Too much diagram language.
- Too little material reality.
- No strong photographic or documentary texture.
- No clear hero object that the eye remembers.
- Brazil/Japan specificity appeared mostly as text labels, not as visual evidence.
- The frames did not yet have "shots"; they had sections.
- Motion was imagined after the frame, not designed as the reason for the frame.

The correction: stop designing pages first. Design shots first.

## 2. What High-Level Motion-Narrative Sites Do

High-end work is not just clean UI. It usually has five layers working together.

### 2.1 One Memorable Visual Object

The best references do not show many equal-weight things. They choose one dominant object:

- a product render
- a cinematic image
- a system graph
- a map
- a flowing data object
- a physical artifact

Everything else supports that object.

For Andes, the likely hero object should not be a generic app card. It should be a living trade corridor: Japan/Korea -> Brazil, with commerce artifacts becoming infrastructure.

### 2.2 Shot Composition Before Component Composition

Weak web design says: hero, cards, CTA, diagram.

Strong motion narrative says:

- What is the camera looking at?
- What enters the frame first?
- What is hidden?
- What transforms?
- What stays still while the world changes?
- What is the final visual memory?

For Andes, each section should be treated as a shot:

1. Map-scale corridor.
2. Friction artifacts drifting in.
3. One real order resolving.
4. Deep platform layer forming under the agent layer.
5. Rails expanding across phases.
6. Protocol graph simplifying into Andes.

### 2.3 Material Specificity

High-end investor creative is specific without becoming cluttered.

For Andes, specificity should come from:

- Sao Paulo / Av. Paulista
- Japan/Korea product origin
- WhatsApp commerce
- PIX
- NF-e
- PRC
- SISCOMEX
- CNPJ
- shipping label
- customs metadata
- local entity chain

These should not appear as generic badges. They need to feel like real operational fragments, composed with restraint.

### 2.4 Motion As Transformation

Cheap motion decorates. Good motion explains.

For Andes:

- A line should not just draw. It should establish the trade corridor.
- Labels should not just fade in. They should reveal friction.
- Fragments should not just float. They should fail to align, then get absorbed by the platform.
- Layers should not just slide. They should show where the moat lives.
- A graph should not just appear. It should emerge from real trade events.

### 2.5 Reduction At The End

High-end motion often starts complex and ends simple. That creates intelligence.

For Andes:

```
messy commerce fragments
  -> organized operating path
  -> platform stack
  -> rails
  -> protocol graph
  -> one final sentence
```

The close should feel quieter than the middle.

## 3. Reference DNA To Study

These are not references to copy. They are references to decompose.

### Apple Product Films / Product Pages

Source: https://www.apple.com/airpods-pro/

What to learn:

- scroll and motion are treated as cinematography
- product/frame scale does the storytelling
- copy appears only when the visual has earned it
- the best moments are sparse

Andes translation:

- let the trade corridor and platform object carry the scene
- avoid explaining everything with text
- make each reveal feel like a camera move, not a slide transition

### Stripe

Source: https://stripe.com/

What to learn:

- infrastructure is communicated through systems, not decoration
- dense business complexity is organized into elegant surfaces
- proof and scale are treated with confidence

Andes translation:

- structure the hard layer: tax, customs, logistics, payments
- do not make the website feel like a store
- use macro numbers and rails with restraint

### Linear

Source: https://linear.app/

What to learn:

- hierarchy through type, spacing, and calm surfaces
- a product can feel premium without loud assets
- motion is polished but not attention-seeking

Andes translation:

- use fewer elements per frame
- let typography carry authority
- no gratuitous 3D or decorative movement

### Anthropic

Source: https://www.anthropic.com/

What to learn:

- mission-first seriousness
- trust through restraint
- abstract technology communicated without toy metaphors

Andes translation:

- use serious language
- avoid cartoon AI or chatbot-first framing
- make "agentic commerce" feel institutional

### Sierra

Source: https://sierra.ai/

What to learn:

- long-form narrative through bold, simple moments
- product concept becomes understandable through staged reveal
- motion supports the claim rather than replacing it

Andes translation:

- one idea per scene
- show how Andes appears inside the customer's economic reality
- avoid copying Sierra's cards or gradients

### Igloo / Active Theory / Cinematic WebGL Studios

Sources:

- https://igloo.inc/
- https://activetheory.net/

What to learn:

- a single abstract object can carry a whole company story
- depth, lighting, and motion make a system feel alive
- technical craft must be paired with strict restraint

Andes translation:

- a single corridor/platform object can become the identity
- use WebGL/Remotion only if it improves the business story
- no "cool animation" detached from Andes' moat

## 4. New Production Method

The next Andes creative work should follow this order.

### Step 1: Reference Teardown

Before designing, study 6-8 references frame by frame:

- macrostructure
- dominant object
- scene rhythm
- typography scale
- material texture
- motion pattern
- what is withheld
- what becomes memorable

Output: one page of notes per reference.

### Step 2: Andes Material Board

Create a material board before any layout:

- maps
- route geometry
- document fragments
- shipping labels
- WhatsApp order fragments
- product metadata
- Brazil fiscal/regulatory labels
- local entity proof
- generated/photographed operational texture

No styleframe without material.

### Step 3: Shot List

Write the site as a shot list:

1. What is the camera looking at?
2. What changes during this shot?
3. What does the investor understand after this shot?
4. What is the final still image?

### Step 4: Styleframes

Only after the shot list and material board:

- make 6 still frames
- each frame must have one dominant visual object
- each frame must be beautiful as a still image
- no frame may rely on explanatory labels alone

### Step 5: Remotion Motion Board

Use Remotion to block timing.

Important technical rule: Remotion animation should be driven by `useCurrentFrame()` and `useVideoConfig()`. CSS animations and Tailwind animation classes should not be used for the video timeline because they do not render deterministically.

### Step 6: Web Translation

Only after motion board approval:

- map Remotion timeline to scroll timeline
- reuse SVG/visual primitives
- create reduced-motion completed states
- keep production website text in i18n files

## 5. Andes Creative Quality Gate

No new Andes creative should be shown unless it passes these gates.

### Gate A: One-Shot Memory

Can I remember the frame after closing my eyes?

If the answer is "it was a clean diagram," fail.

### Gate B: Andes Specificity

Could the frame belong to Stripe, Sierra, Linear, or any AI startup?

If yes, fail.

The frame must contain Andes-specific market reality.

### Gate C: Investor Scale

Does the frame make Andes feel like a continental infrastructure company?

If it feels like an app, agency, store, dashboard, or SaaS feature, fail.

### Gate D: Motion Necessity

Does the motion reveal a business transformation?

If it only makes things appear, fail.

### Gate E: Material Reality

Does the frame include some form of real-world commerce material or a clearly designed abstraction of it?

If it is only nodes and labels, fail.

### Gate F: Restraint

Is there one dominant object, one primary idea, and one controlled accent?

If everything is equally important, fail.

## 6. Immediate Next Learning Task

Before making another Andes visual pass, create:

1. Reference teardown board
   - Apple
   - Stripe
   - Linear
   - Anthropic
   - Sierra
   - Igloo or Active Theory

2. Andes material board
   - route map
   - commerce fragments
   - regulatory fragments
   - operating proof fragments
   - protocol graph vocabulary

3. Revised Frame A only
   - do not remake all six frames
   - make one frame excellent first

The goal is not speed. The goal is to raise the taste floor before production.
