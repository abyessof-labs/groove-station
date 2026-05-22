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

> **Note:** MP3 files are excluded from this repo (too large for GitHub). Add your own to `audio/` matching the filenames in `app.js`.

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

1. Drop the MP3 into `audio/`
2. Add an entry to the `TRACKS` array in `app.js`:
   ```js
   {
     id: 12,
     file: 'audio/your-file.mp3',
     name: 'Display Name',
     genre: 'Genre · Description',
   }
   ```
3. Re-deploy

## Stack

Pure HTML + CSS + JS. No dependencies, no build tools. Hosted via Perplexity Computer.
