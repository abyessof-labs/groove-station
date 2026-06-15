# Groove Station 🎵

A Spotify-style instrumental music player for focus and flow. Built as a static HTML/CSS/JS app — no frameworks, no build step.

## Tracks

| # | Title | Genre |
|---|-------|-------|
| 1 | The Best of Acid Jazz & Funk | Acid Jazz · 1½ hrs |
| 2 | Funk Jazz Instrumentals | Funk Jazz |
| 3 | Nostalgic Jazz-Funk Ride | 70s/80s Fusion · Retro Pocket Bliss |
| 4 | Best Acid Jazz Funky Instrumentals Vol. 4 | Acid Jazz · True Relaxation & Joy |
| 5 | Best Acid Jazz Funky Instrumentals Vol. 2 | Acid Jazz · True Relaxation & Joy |
| 6 | Best Acid Jazz Funky Instrumentals Vol. 3 | Acid Jazz · True Relaxation & Joy |
| 7 | Funk Soul Instrumental Mix | Funk Soul · Study & Work |
| 8 | Cruella — Original Score (Complete) | Cinematic · Orchestral Score |
| 9 | Chill Funk Deep Bass | Retro Instrumental · Everyday Groovin' |
| 10 | The Ultimate Mix: Funk × R&B × Jazz | Funk / R&B / Jazz · Background Mix |
| 11 | AUD-20220726 | Recording |
| 12 | Chill Funk Lounge | Deep Bass · 3 hrs Chill & Relax |
| 13 | Smooth & Groovy Instrumental Jazz | Smooth Jazz · 2 hrs Work & Study |

> **Audio source:** Tracks stream directly from the public S3 bucket
> `groovestationmacro/Instrumental/` (account 791327541706, region ca-central-1).
> No MP3s are bundled into the deploy. Each track's `key` in `app.js` is the exact
> S3 object key; the player builds the URL via `AUDIO_BASE + encodeURIComponent(key)`.
>
> _The 3 John Mayer / Instrumental Blues YouTube tracks are pending — they couldn't be
> fetched (YouTube blocks the build environment). Add them to S3, then to `app.js`._

## Features

- Play / pause / previous / next
- Shuffle and repeat modes (off / all / one)
- Progress bar scrubbing
- Volume control with mute
- Animated equalizer on active track
- Real-time search/filter
- Keyboard shortcuts:
  - `Space` — play/pause
  - `←` / `→` — seek ±10s
  - `↑` / `↓` — volume ±5%
  - `N` / `P` — next / previous track

## Adding New Tracks

1. Upload the MP3 to the S3 bucket `groovestationmacro/Instrumental/`
2. Add an entry to the `TRACKS` array in `app.js` (use the EXACT S3 object key):
   ```js
   {
     id: 14,
     key: 'Your Exact S3 Filename.mp3',
     name: 'Display Name',
     genre: 'Genre · Description',
   }
   ```
3. Re-deploy (code-only — fast, no audio bundled) and push to GitHub

## Stack

Pure HTML + CSS + JS. No dependencies, no build tools. Hosted via Perplexity Computer.
