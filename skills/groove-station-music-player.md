---
name: groove-station-music-player
description: "Groove Station instrumental music player management skill. Load when Anthony asks to add tracks, add a YouTube link to the player, update the player, redeploy the site, or push changes to GitHub. Trigger phrases: 'add a track', 'add this to the groove station', 'add this to the player', 'update the music player', 'push to GitHub', 'redeploy the player', 'add a song', 'fetch this track'."
metadata:
  author: Grizzly Lighting
  version: '2.0'
---

# Groove Station Music Player

## Overview

Groove Station is a Spotify-style static HTML/CSS/JS instrumental music player built for Anthony. It lives at a permanent Perplexity-hosted URL and is backed by a private GitHub repo. **Audio is streamed directly from a public AWS S3 bucket — MP3s are never bundled into the deploy and never committed to GitHub.**

## Key References

| Item | Detail |
|------|--------|
| Project path | `/home/user/workspace/grizzly-music/` (re-clone each session; sandbox is ephemeral) |
| GitHub repo | `https://github.com/afossey-tech/groove-station` (private) |
| GitHub user | `afossey-tech` |
| Git config | `user.name = Anthony Fossey`, `user.email = afossey@macrostudios.ca` |
| **Audio bucket** | `s3://groovestationmacro/Instrumental/` (AWS account 791327541706, region `ca-central-1`) |
| Audio access | Bucket objects under `Instrumental/` are **public-read** (CORS enabled for GET/HEAD with range requests). Stable, non-expiring URLs. |
| Public URL base | `https://groovestationmacro.s3.ca-central-1.amazonaws.com/Instrumental/` |
| Track registry | `TRACKS` array in `app.js` |

## Architecture (IMPORTANT — read before changing anything)

The player streams each track from S3 at runtime. In `app.js`:

```js
const AUDIO_BASE = 'https://groovestationmacro.s3.ca-central-1.amazonaws.com/Instrumental/';
function trackUrl(key) { return AUDIO_BASE + encodeURIComponent(key); }
```

Each `TRACKS` entry uses a `key` field = the **exact S3 object key** (filename) under `Instrumental/`. The player builds the URL via `trackUrl(track.key)`. `encodeURIComponent` handles spaces and special characters (✨ ｜ ♫ ： apostrophes) correctly — do not pre-encode the key.

```js
{
  id: 14,
  key: 'Your Exact S3 Filename.mp3',
  name: 'Display Name',
  genre: 'Genre · Description',
}
```

**Never bundle audio into the deploy.** A `deploy_website` payload that includes the MP3s (~2 GB) will time out and crash the sandbox. The deploy must be code-only (a few hundred KB). The `.gitignore` already excludes `audio/` and `*.mp3`.

## Session Setup (do this first, every time)

The sandbox is ephemeral — the repo and any audio are gone between sessions.

```bash
cd /home/user/workspace
git clone https://github.com/afossey-tech/groove-station grizzly-music   # api_credentials=["github"]
```

You do NOT need to download the MP3s to deploy — the player streams them from S3. Only fetch audio locally if you specifically need to inspect or re-encode a file.

## When Anthony Pastes a YouTube Link

> **Known blocker:** `yt-dlp` from the Perplexity sandbox is blocked by YouTube's bot check ("Sign in to confirm you're not a bot") across all player clients. Do not burn time retrying clients/runtimes. The audio must be obtained outside the sandbox.

1. Get the video title/channel for naming (fetch the YouTube URL).
2. Ask Anthony to get the MP3 into S3 via ONE of:
   - **He runs `yt-dlp` locally** and uploads the MP3 to `s3://groovestationmacro/Instrumental/`, OR
   - **He uploads the MP3 into the chat**, and you push it to S3 with the AWS connector (`aws-s3-upload-files`, bucket `groovestationmacro`, prefix `Instrumental`, region `ca-central-1`), OR
   - **He provides a YouTube `cookies.txt`** so you can run `yt-dlp --cookies` from the sandbox, then upload the result to S3.
3. Confirm the object exists and is public:
   ```bash
   curl -sI "https://groovestationmacro.s3.ca-central-1.amazonaws.com/Instrumental/<URL-ENCODED-FILENAME>" | grep -iE "^HTTP|content-type|accept-ranges"
   ```
   Expect `HTTP 200`, `audio/mp3`, and `Accept-Ranges: bytes`.
4. Add a new `TRACKS` entry in `app.js` with the next sequential `id`, the EXACT S3 `key`, a clean `name`, and a descriptive `genre`.
5. Validate: `node --check app.js`.
6. Redeploy (see Deployment) and push to GitHub (see GitHub).
7. Report back: new track name, updated track count, and that the live site is updated.

## Adding a Track Already in S3

If the MP3 is already in `s3://groovestationmacro/Instrumental/`, skip the download entirely: add the `TRACKS` entry with the exact key, validate, redeploy, push.

## Reconciling Filenames

S3 object keys are the source of truth. The `key` in each `TRACKS` entry must match the S3 key **byte-for-byte**, including spaces and special characters. To list current keys, ask Anthony to run in CloudShell:
```bash
aws s3 ls s3://groovestationmacro/Instrumental/
```
or generate presigned URLs (only needed if you must download for inspection):
```bash
for key in $(aws s3 ls s3://groovestationmacro/Instrumental/ | awk '{print $4}'); do
  echo "$key => $(aws s3 presign "s3://groovestationmacro/Instrumental/$key" --region ca-central-1 --expires-in 86400)"
done
```

## Deployment

Static site, no build step. Payload MUST be code-only:

```bash
cd /home/user/workspace/grizzly-music
rm -rf audio skills   # ensure no audio or stray folders ship
```
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
Use `api_credentials=["pplx-tool:deploy_website"]`. Deploying the same `project_path` updates the same site URL.

Verify after deploy: screenshot the `internal_url` (via `pplx-tool screenshot_page`). The track list should show the right count and per-track durations should populate (durations load from S3 — if they stay "—", streaming is broken).

## GitHub Push Workflow

After any change to `app.js`, `index.html`, `style.css`, or `README.md`:
```bash
cd /home/user/workspace/grizzly-music
git add app.js index.html style.css README.md
git -c user.name="Anthony Fossey" -c user.email="afossey@macrostudios.ca" commit -m "..."
git push origin HEAD
```
Use `api_credentials=["github"]`. Audio (`audio/*.mp3`) is gitignored — only source code is tracked.

## S3 Bucket Access Notes (for reference / troubleshooting)

The `Instrumental/` prefix is public-read via a bucket policy allowing `s3:GetObject` on `arn:aws:s3:::groovestationmacro/Instrumental/*`, with Block Public Access disabled at the bucket level. CORS allows `GET`/`HEAD` from any origin and exposes `Content-Length`, `Content-Range`, `Accept-Ranges` (needed for scrubbing). Object listing is NOT public. If audio stops loading, verify the policy/CORS are intact and the object key matches the `TRACKS` `key` exactly.

## Pending / Backlog

Three YouTube tracks Anthony requested could not be fetched (sandbox YouTube block) and are NOT yet in S3 or the player:
- Instrumental Blues — 2 Hour Compilation (youtube.com/watch?v=bWk2Von4U5w)
- Mayelevator Vol. 2 — John Mayer Instrumental (youtube.com/watch?v=u3jG9AMHmD4)
- Mayelevator Vol. 1 — John Mayer Instrumental (youtube.com/watch?v=uSNXSvZEelk)

To add them: get the MP3s into `s3://groovestationmacro/Instrumental/` (see "When Anthony Pastes a YouTube Link"), then add `TRACKS` entries, redeploy, and push.

## Player Features (for reference when updating UI)

- Spotify dark theme: `#121212` base, `#1DB954` accent
- Fonts: Cabinet Grotesk (display), Satoshi (body) via Fontshare CDN
- Bottom player bar fixed at 90px; sidebar 240px wide
- Animated equalizer bars on active track (CSS `bar-bounce` keyframe)
- Keyboard shortcuts: Space (play/pause), ←/→ seek ±10s, ↑/↓ volume ±5%, N/P next/prev
- Real-time search filters the track list
