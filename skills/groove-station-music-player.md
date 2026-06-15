---
name: groove-station-music-player
description: "Groove Station instrumental music player management skill. Load when Anthony asks to add tracks, download music from YouTube, update the player, redeploy the site, or push changes to GitHub. Trigger phrases: 'add a track', 'download this YouTube link', 'add this to the player', 'update the music player', 'push to GitHub', 'redeploy the player', 'add a song', 'fetch this track'."
metadata:
  author: Grizzly Lighting
  version: '1.1'
---

# Groove Station Music Player

## Overview

Groove Station is a Spotify-style static HTML/CSS/JS instrumental music player built and hosted for Anthony. It lives at a permanent Perplexity-hosted URL and is backed by a private GitHub repo.

## Key References

| Item | Detail |
|------|--------|
| Project path | `/home/user/workspace/grizzly-music/` |
| GitHub repo | `https://github.com/afossey-tech/groove-station` (private) |
| GitHub user | `afossey-tech` |
| Audio folder | `/home/user/workspace/grizzly-music/audio/` |
| Track registry | `TRACKS` array in `/home/user/workspace/grizzly-music/app.js` |
| Git config | `user.email = afossey@macrostudios.ca`, `user.name = Anthony Fossey` |
| OneDrive account | `anthonybfossey@outlook.com` |
| OneDrive audio folder | `Groove Station/audio/` |

## Session Startup — Always Do This First

At the start of any new session involving this player:

1. **Clone the repo** to get the latest code:
   ```bash
   git clone https://github.com/afossey-tech/groove-station /home/user/workspace/grizzly-music
   ```
   Use `api_credentials=["github"]`.

2. **Download MP3s from OneDrive** (`anthonybfossey@outlook.com`, folder: `Groove Station/audio/`):
   - Use the OneDrive / Files connector (`search_files_v2`) to list files in the `Groove Station/audio/` folder
   - Download each MP3 into `/home/user/workspace/grizzly-music/audio/`
   - This restores the full audio library so redeployment includes all tracks

3. Only after both steps are complete should you proceed with any changes or redeployment.

## Current Track List (11 tracks as of v1.1)

| id | Filename | Display Name | Genre |
|----|----------|--------------|-------|
| 1 | The-Best-of-Acid-Jazz-and-Funk-1-Hours-and-Half-of-Non-Stop-Music.mp3 | The Best of Acid Jazz & Funk | Acid Jazz · 1½ hrs |
| 2 | Funk-Jazz-Instrumentals-2.mp3 | Funk Jazz Instrumentals | Funk Jazz |
| 3 | Nostalgic-Jazz-Funk-Ride-1-Hour-Retro-Pocket-Bliss-70s-80s-Fusion-4.mp3 | Nostalgic Jazz-Funk Ride | 70s/80s Fusion · Retro Pocket Bliss |
| 4 | Best-Acid-Jazz-Funky-Instrumentals-Vol.-4-True-Relaxation-and-Joy-6.mp3 | Best Acid Jazz Funky Instrumentals Vol. 4 | Acid Jazz · True Relaxation & Joy |
| 5 | Best-Acid-Jazz-Funky-Instrumentals-Vol.-2-True-Relaxation-and-Joy-7.mp3 | Best Acid Jazz Funky Instrumentals Vol. 2 | Acid Jazz · True Relaxation & Joy |
| 6 | Best-Acid-Jazz-Funky-Instrumentals-Vol.-3-True-Relaxation-and-Joy-8.mp3 | Best Acid Jazz Funky Instrumentals Vol. 3 | Acid Jazz · True Relaxation & Joy |
| 7 | Funk-Soul-Music-Instrumental-Playlist-Background-Funk-Soul-Mix-for-Studying-Working-Relax-9.mp3 | Funk Soul Instrumental Mix | Funk Soul · Study & Work |
| 8 | Cruella_Original_Score_Complete-10.mp3 | Cruella — Original Score (Complete) | Cinematic · Orchestral Score |
| 9 | Chill-Funk-Deep-Bass-for-Everyday-Groovin-1-Hour-Retro-Instrumental-Vibes-11.mp3 | Chill Funk Deep Bass | Retro Instrumental · Everyday Groovin' |
| 10 | The-Ultimate-Mix-Funk-x-R-B-Jazz-Relaxing-Background-Music-12.mp3 | The Ultimate Mix: Funk × R&B × Jazz | Funk / R&B / Jazz · Background Mix |
| 11 | AUD-20220726-WA0014-13.mp3 | AUD-20220726 | Recording |

## When Anthony Pastes a YouTube Link

1. Use `yt-dlp` to download the track as MP3 into `audio/`:
   ```bash
   cd /home/user/workspace/grizzly-music
   yt-dlp -x --audio-format mp3 --audio-quality 0 \
     -o "audio/%(title)s.%(ext)s" \
     "YOUTUBE_URL"
   ```
2. Note the exact output filename from yt-dlp stdout.
3. Add a new entry to the `TRACKS` array in `app.js` with the next sequential `id`, correct `file` path, clean `name`, and descriptive `genre`.
4. **Upload the new MP3 to OneDrive** (`anthonybfossey@outlook.com`, `Groove Station/audio/`) using the OneDrive `export_files` connector tool so it's available in future sessions.
5. Redeploy the site (see Deployment section).
6. Commit and push `app.js` to GitHub (see GitHub section).
7. Report back: new track name, updated track count, live player URL.

## Deployment

Static site — no build step. Deploy with:

```bash
pplx-tool deploy_website <<'JSON'
{
  "project_path": "/home/user/workspace/grizzly-music",
  "site_name": "Groove Station",
  "entry_point": "index.html",
  "should_validate": false
}
JSON
```
Use `api_credentials=["pplx-tool:deploy_website"]`.

**Important:** All MP3s must be present in `/home/user/workspace/grizzly-music/audio/` before deploying, or the audio will be missing from the live site.

## GitHub Push Workflow

After any change to `app.js`, `index.html`, or `style.css`:

```bash
cd /home/user/workspace/grizzly-music
git add .
git commit -m "Add track: [Track Name]"
git push origin main
```

Use `api_credentials=["github"]`.

Note: `audio/*.mp3` files are gitignored — only source code is tracked.

## Player Features (for reference when updating UI)

- Spotify dark theme: `#121212` base, `#1DB954` accent
- Fonts: Cabinet Grotesk (display), Satoshi (body) via Fontshare CDN
- Bottom player bar fixed at 90px height, sidebar 240px wide
- Animated equalizer bars on active track (CSS `bar-bounce` keyframe)
- Keyboard shortcuts: Space, ←/→ seek, ↑/↓ volume, N/P next/prev
- Search filters track list in real-time
