# Glimpse — Video Prompt Library

Production-ready prompts for video generation (Veo 3, Sora, Runway Gen-3, Kling 1.6, Pika).
Every prompt is locked to the Glimpse Brand System: hour-before-sunrise light, linen and paper textures, real hands and real rooms, brass accents, slow settle. No doves, holograms, ghosts, fading photos, glowing portraits, or sparkle effects.

**Universal format for each prompt:**
- **Use case** — where this video lives (hero, story, ad, deck loop)
- **Duration** — recommended length
- **Aspect** — 16:9 / 9:16 / 1:1
- **Full prompt** — paste-ready single block
- **Negative prompt** — what to suppress
- **Tool notes** — variants per engine

**Universal negative prompt (append to every video):**
> no text, no captions, no logos, no watermarks, no AI faces, no holograms, no doves, no halos, no clouds, no urns, no gravestones, no fading photos, no sparkle effects, no lens flares stacked, no neon, no oversaturation, no stock-photo smiles, no staged grief, no slow-motion tears, no piano clichés, no anime, no cartoon.

---

## 01 — Hero Film (Landing Page Top)

**Use case:** Homepage hero loop / about page anchor
**Duration:** 12s
**Aspect:** 16:9

**Prompt:**
> A close, unhurried shot of an older man's hand resting on a folded paper envelope on a linen tablecloth. Warm hour-before-sunrise light enters from a window on the left, brushed brass key catches the glow. The hand lifts slightly, fingertips pausing on the paper as if remembering. Shallow depth of field, 50mm lens look, anamorphic softness. Camera dollies in 4 inches over 12 seconds. Palette: warm paper cream, deep ink black, linen beige, single brass accent. No people's faces. Mood: calm, weighted, dignified. Texture: real matte paper, real cotton weave, real wood grain. Pace: slow settle. Real, photographic, documentary realism — not cinematic gloss.

**Tool notes:**
- *Veo 3:* keep the camera move spec — Veo respects "dollies in 4 inches."
- *Sora:* lean on "documentary realism, 50mm, anamorphic softness."
- *Runway Gen-3:* add `--motion 2` for the slow settle.
- *Kling:* set duration 10s, motion strength 0.3.

---

## 02 — The Wedding Morning (Signature Story)

**Use case:** Brand film, deck slide, ad
**Duration:** 18s
**Aspect:** 16:9

**Prompt:**
> A bride, around 28, sits alone on the edge of a hotel bed in soft morning light, wearing a simple white slip. She holds a small linen-wrapped wooden box on her lap. She opens it slowly — inside, a brushed brass card and a small speaker, no screens visible. She presses the card to the speaker; we do not hear the audio, only see her shoulders settle and her eyes close for two seconds, breath out. A faint, real smile, not performative. Window light from camera right, warm linen curtains diffusing. Shot on 35mm look, shallow depth. Camera static, locked off, single take. Palette: paper cream, dawn peach, ink black. No tears. No music swell implied. Mood: held, private, true. The room is real, lived-in, not styled.

**Tool notes:**
- *Sora* handles the held emotional beat best; specify "single take, static camera."
- *Veo 3:* allow native audio — only ambient room tone, no music.
- For 9:16 vertical (Reels/TikTok), reframe to "tight on her hands holding the box, her face entering frame from above at second 9."

---

## 03 — The New Mother and the Pastry

**Use case:** Story slide, product page "Glimpse delivery" example
**Duration:** 15s
**Aspect:** 16:9

**Prompt:**
> A young woman, mid-30s, stands at her kitchen counter in soft daylight, a sleeping newborn in a sling against her chest. A small kraft paper bakery box sits on the counter, tied with cotton twine, a handwritten card on top in older-generation cursive. She unties it slowly with one hand. Inside: a single pastry — a perfect bourekas or rugelach, depending on culture — and a folded note. She reads the note, free hand resting on the baby's back. The shot stays wide enough to keep the kitchen visible: real tile, a half-drunk mug, morning light. No close-up of her crying. A long breath out, a small private smile. Palette: warm cream, soft linen, brass twine accent. 35mm, locked-off camera, single take. Documentary realism.

**Tool notes:**
- Specify culture/dish per market: pastry, croissant, scone, bourekas, mooncake.
- *Runway Gen-3:* keep camera static — Runway over-moves by default.

---

## 04 — The Pub Shot (Father–Son)

**Use case:** Brand film B-roll, "moments after" sequence
**Duration:** 12s
**Aspect:** 16:9

**Prompt:**
> Interior of a quiet, warm pub at dusk, low amber light, brass rail, wood bar worn smooth. A man, mid-40s, sits alone at the bar. The bartender, without speaking, places two short whiskey glasses in front of him — one full, one with a folded paper resting on top. The man looks at the second glass for four full seconds. He picks up his own glass, raises it slightly toward the empty seat beside him, and drinks. The second glass stays untouched. Camera at chest height, locked off, slight handheld breath. Palette: amber, ink, brass. No other patrons in focus. Mood: private ritual, quiet honor, no sadness performed. Real pub textures — beer mats, water rings, dim Edison bulbs.

**Tool notes:**
- *Veo 3:* enable ambient audio (low pub murmur, no music).
- Make sure to specify "the second glass stays untouched" or models will animate someone drinking it.

---

## 05 — The First Car Voucher (Eighteenth Birthday)

**Use case:** Product example, ad
**Duration:** 14s
**Aspect:** 16:9 and 9:16 vertical

**Prompt:**
> A teenager, just turned 18, sits on the hood of an old but cared-for car in a driveway at golden hour. They hold a thick paper envelope, sealed with a brass wax stamp. They open it slowly — inside, a folded letter in confident older handwriting, and a small brass key on a leather fob. They read for six seconds, then look up, off-camera, somewhere into the middle distance. The smallest nod. They place the key in their palm, close their hand around it. Camera slow push-in from waist level. Palette: warm gold, deep blue evening sky entering at the edges, brass. Real car, real driveway, real teenager — no model-cast polish. Mood: weight of inheritance, not sadness.

**Tool notes:**
- *Sora:* the "nod" is the emotional anchor — call it out: "the smallest nod, almost imperceptible."

---

## 06 — Welcome Kit Unboxing (Product Reveal)

**Use case:** Onboarding page, investor deck product slide
**Duration:** 16s
**Aspect:** 1:1 or 16:9

**Prompt:**
> Top-down shot, flat-lay, of a linen-bound box on a paper-textured surface. Two hands enter frame and untie a cotton ribbon. The lid lifts away. Inside, arranged with quiet precision: a small brushed brass card the size of a credit card with the Glimpse mark, a slim cream booklet, a folded letter, and a single thin envelope marked "for the first day." The hands lift the brass card and place it gently to the side. Daylight from above, no harsh shadow, soft diffusion. Camera locked top-down, almost no movement — a single 1-inch dolly down at second 12. Palette: paper cream, linen, brass, ink. Materials are real: paper grain, brass micro-scratches, cotton weave. No screens, no devices, no phones visible. Mood: archival, considered, the opposite of consumer-tech unboxing.

**Tool notes:**
- *Veo 3 / Sora:* "top-down flat-lay" is well understood. Specify "no phones visible" — models default to including a device.
- For Instagram square: 1:1, second 12 dolly removed, lock fully static.

---

## 07 — Investor Deck Background Loop (Ambient)

**Use case:** Slide background, web hero idle state
**Duration:** 8s loop, seamless
**Aspect:** 16:9

**Prompt:**
> Slow drift across the surface of cream linen fabric, lit by side-light from camera left at hour-before-sunrise warmth. Subtle texture variations, faint shadow of a window mullion at the right edge that does not fully appear. Camera lateral drift, 1 inch over 8 seconds, infinite loop. No subject. No movement other than the drift. Palette: paper cream, dawn peach, faint ink shadow. Photographic, not abstract. Mood: held breath. Texture is the subject.

**Tool notes:**
- *Runway Gen-3:* set seed deliberately and re-render until loop seam is clean; ask for `--motion 1` minimum.
- *Sora:* request "seamless loop" explicitly.

---

## 08 — The Steward Dashboard Moment (Product Story)

**Use case:** Product page, demo intro
**Duration:** 10s
**Aspect:** 16:9

**Prompt:**
> Over-shoulder of a woman, 50s, at a kitchen table, daylight, a slim matte laptop in front of her — but we never see the screen content, only the warm reflected light on her face and the edge of the laptop frame. She is calm, considering. She lifts her hand and taps the trackpad once, deliberately. Her shoulders settle. She closes the laptop halfway. Beside the laptop: a mug, a folded paper note, a brass paperweight. Camera over-shoulder, static, soft diffusion. Palette: paper cream, ink, brass, daylight blue. Real woman, no acting performance. Mood: a small decision honored quietly.

**Tool notes:**
- Important: "we never see the screen content" — otherwise models will hallucinate UI text.
- This sells the *steward* role without ever showing the product. Use this in lieu of UI mockups in the deck.

---

## 09 — The Kill Switch (Ethics Story)

**Use case:** Trust page, "how it stops" section
**Duration:** 9s
**Aspect:** 9:16 vertical (mobile-first)

**Prompt:**
> A young man, late 20s, in a sunlit bedroom, sitting on the edge of a bed, phone in hand. He looks at the screen for three seconds, exhales, and taps once with his thumb. He sets the phone face-down on the linen duvet beside him and rests his hand on top of it for two seconds. Then he stands and walks out of frame toward a doorway with morning light. Camera at chest height, slight handheld breath, single take. Palette: linen cream, soft blue morning light, ink. We never see the phone screen. Mood: a boundary chosen, not a tragedy. Real, undirected, documentary realism.

**Tool notes:**
- This is the *kill switch* story — pause/close a Glimpse — without showing UI.
- The "hand resting on the phone" beat is the emotional core; do not let the model skip it.

---

## 10 — Cross-Generational Montage (Brand Anthem)

**Use case:** 60s anthem film, top-of-funnel campaign
**Duration:** 60s (six 10s beats)
**Aspect:** 16:9

**Prompt (six-beat sequence):**
> A 60-second anthem in six unhurried beats, each 10 seconds, single takes, no music suggested, only natural sound.
>
> Beat 1 — A grandfather's hand writing in a leather-bound notebook at a wooden desk, morning light, brass desk lamp. Pen moves slowly. We never read the words.
>
> Beat 2 — A woman, 30s, on her phone in a sunlit cafe, listening to something private, earbuds in, eyes lowered, the smallest smile. We do not hear the audio.
>
> Beat 3 — A child, around six, sitting on a rug, holding a small linen pouch with both hands, listening to a brass-cased speaker beside her. She nods once, like she understands something an adult would.
>
> Beat 4 — A young man at a kitchen counter, opening a cardboard box with a single handwritten card on top. He reads, free hand on the counter, weight shifting.
>
> Beat 5 — An empty pub seat with a single short whiskey glass and a folded paper on top, no human in frame, low amber light, brass rail.
>
> Beat 6 — A wide shot of a bride alone in a hotel room at first light, holding a small wooden box on her lap, sitting still. The frame holds for the full ten seconds.
>
> Across all beats: hour-before-sunrise to golden hour light. Linen, paper, brass, real rooms. No music. Only ambient room tone. Documentary realism, 35mm look, locked-off cameras, no slow-motion. Palette: paper cream, ink, dawn peach, brass. Pace: slow settle. Mood: held, dignified, true.

**Tool notes:**
- Render each beat separately and cut in editing. Models cannot hold six beats coherently in one generation.
- Use the same seed family across beats for visual consistency (especially in Sora and Veo).

---

## 11 — Vertical Reel — "Some things shouldn't end with you"

**Use case:** Instagram Reels, TikTok, YouTube Shorts
**Duration:** 18s
**Aspect:** 9:16

**Prompt:**
> Five quick, calm cuts, each 3 seconds, in vertical format:
> 1. A hand placing a folded paper letter into a linen-bound box.
> 2. A brass key dropped softly onto a paper envelope.
> 3. A speaker the size of a deck of cards being set down on a kitchen counter, daylight.
> 4. A handwritten birthday card being slid across a wooden table by an unseen older hand.
> 5. A young woman at a window at first light, holding a small wooden box, exhaling.
> All shots: 35mm look, shallow depth, real textures, hour-before-sunrise to soft daylight. No text overlays. No music suggested. Palette: paper cream, ink, brass. Mood: weighted calm. Documentary realism.

**Tool notes:**
- Caption added in post — never burned in by the generator.
- End on shot 5 for 4 seconds (longer than the others) — the emotional resolve.

---

## 12 — Founder Story Inset (Investor Demo Opening)

**Use case:** First 8 seconds of the investor demo
**Duration:** 8s
**Aspect:** 16:9

**Prompt:**
> A single sustained shot: an older voicemail-style cassette recorder sits on a child's bedside table at dusk, beside a small lamp with a paper shade. The lamp casts warm light. No one is in frame. The recorder's small red light is on, steady, not blinking. The camera holds, dead still, for eight seconds. Soft ambient hum, distant household sound. Palette: paper cream, lamp amber, deep navy room shadow. No movement at all in the frame. Mood: a child has just listened to a parent's voice and walked out. The room remembers.

**Tool notes:**
- Use this *before* the founder speaks on camera. The empty room frames the entire pitch.
- Critical: "no movement at all" — models will animate dust or curtain. Suppress in negative prompt: `no dust motes, no moving curtain, no flicker.`

---

## 13 — The Consent Conversation (Recipient Onboarding)

**Use case:** "How recipients control it" explainer
**Duration:** 14s
**Aspect:** 16:9

**Prompt:**
> Two women at a kitchen table in afternoon light — one is the steward (50s), one is the recipient (mid-20s, her daughter). Between them: a single sheet of paper and a brass pen. The older woman slides the paper across. The younger reads, then picks up the pen and signs with deliberate care, free hand resting on the table. The older woman nods once and places her hand briefly over her daughter's. Camera at table height, locked off, single take. Palette: paper, ink, brass, warm cream. No dialogue heard. Real mother, real daughter casting — not glossy. Mood: a quiet contract between people who love each other.

**Tool notes:**
- This sells *consent* without a single piece of UI.
- Cast for age-realism — Sora and Veo over-glamorize without explicit "real mother, real daughter, no model-cast polish."

---

## 14 — The Vault (Trust + Architecture)

**Use case:** Security/trust page, technical architecture slide
**Duration:** 10s
**Aspect:** 16:9

**Prompt:**
> A wide, still shot of a small wooden archival cabinet in a quiet, sunlit room. The cabinet has a brass handle. A hand enters frame and opens one shallow drawer — inside, neatly arranged: linen-wrapped bundles, paper folders, a small brass-cased speaker, a cassette, a folded letter. The hand closes the drawer gently. Camera at chest height, completely static. Daylight only, no artificial source. Palette: paper cream, wood, linen, brass. No screens, no devices beyond the speaker. Mood: archival care, not technology. Documentary realism.

**Tool notes:**
- This is your "data center" shot — without a single server.
- Use as the visual for the technical architecture slide. Pairs with the line: *"This is what infrastructure looks like when it's built for people."*

---

## 15 — The Closing Frame (End of Every Film)

**Use case:** Outro, closing slide, signoff
**Duration:** 6s
**Aspect:** 16:9 and 9:16

**Prompt:**
> A still, almost-static frame: a folded paper note resting on a linen surface in hour-before-sunrise light. A single brass paperweight on the corner. The frame holds for six full seconds. The faintest camera breath — less than half an inch of drift over six seconds. Palette: paper cream, ink, brass. No subject, no movement, no sound implied. The Glimpse logotype appears only in post, in the final two seconds, in ink-black serif, small, lower-center. Mood: arrived.

**Tool notes:**
- Use the exact same shot at the end of *every* Glimpse film. This is a brand signature.
- Logo added in editing — never asked from the video model.

---

## Output Discipline

Across all 15 prompts, never let the video model:
- Generate text, captions, or logos in-frame.
- Show faces of "AI-rendered" deceased people.
- Use chat bubbles, app UI, or screen content.
- Apply slow-motion to tears or grief beats.
- Use music in the prompt — score is added in post.
- Use sparkle, particle, or "magic" effects of any kind.
- Add doves, halos, clouds, or angelic motifs.

Every Glimpse film proves the brand by what it *withholds*.

---

## Implementation Notes

**Replit / web build**
- Host the hero film (Prompt 01) as a muted, autoplay, looping `<video>` at the top of the homepage. Max 1.2MB. Provide WebM + MP4. Poster frame at second 6.
- Lazy-load all other films below the fold.

**Figma**
- Create a `Glimpse / Motion` page in the design library. Embed each rendered video at 320px wide as reference for designers. Include the original prompt as a comment under each.

**Canva (for decks)**
- Use Prompts 04, 05, 12, 14 as slide backgrounds — muted, no audio, looping. Insert as MP4.
- Never use a stock video clip from Canva's library. The brand is the absence of stock.

**Investor deck (Keynote / Slides)**
- Open the demo with Prompt 12 (Founder Story Inset).
- Use Prompt 02 (Wedding Morning) as the single film on the "solution" slide.
- Close the deck on Prompt 15 (Closing Frame) with the manifesto sentence overlaid in post.
