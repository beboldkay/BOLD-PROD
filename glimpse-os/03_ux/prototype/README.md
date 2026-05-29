# Glimpse Prototype — Replit Setup (3 steps)

A working, clickable prototype of Glimpse. Single file. No install, no build, no errors.

## What's in it

A full demo flow:
- **Home** — the hero landing
- **Begin a Vault** — author a new Glimpse in four calm steps
- **The Vault** — steward dashboard with three seed Glimpses
- **Recipient** — what the receiving person sees
- **Delivery** — the cinematic arrival moment (use this in the investor demo)
- **How it stops** — the four locks (kill switch)

Brand-locked: paper, ink, brass, linen, hour-before-sunrise light, slow settle. No clichés.

## How to run it in Replit

1. Go to **replit.com** → **Create Repl** → template **"HTML, CSS, JS"** → name it `glimpse`.
2. Open the `index.html` that Replit created. **Delete everything** inside it.
3. Open `index.html` from this folder, **copy the whole file**, and paste it into Replit's `index.html`.
4. Press **Run**. The prototype opens in the Replit preview pane.

That's it. No other files needed.

## How to demo it

For an investor walkthrough, the order to click is:

1. **Home** — let the hero settle. Read the one line aloud: *"The moments you won't be there for, still arrive."*
2. **Begin a Vault** — fill it in slowly. Author for "Maya, daughter, on her wedding morning." Write two sentences in the author's voice. Schedule it.
3. **The Vault** — show the three seed entries. Point out the *Paused* and *Close* buttons. The kill switch is in the chrome.
4. Click **Preview delivery** on the first entry — this is the cinematic moment. Hold silence while it settles.
5. **How it stops** — the four locks. Close on the manifesto sentence.

Total demo length: under 4 minutes.

## How to change the seed content

Inside `index.html`, search for `SEED_GLIMPSES`. Edit the three entries there — change names, moments, scheduled dates, messages. The Vault page will reflect your edits on next Run.

## How to put it on a custom domain

In Replit: **Deployments** → **Autoscale** (or **Static**) → connect a domain.
For a static prototype, choose **Static** deployment. Replit handles the rest.

## What this prototype is, and isn't

It is a **clickable demo** — every button works, the state moves, the delivery moment plays.
It is **not** a backend. There's no real database, no real user accounts, no real human review queue. Those belong in Stage 6 (Technical Architecture).

For investor demos, fundraising decks, partner walkthroughs, and design reviews — this is enough.
