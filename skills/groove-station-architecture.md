---
name: groove-station-architecture
description: "How the Groove Station instrumental music player is built, published, and updated after the July 2026 migration to gated audio. Load when the user asks to add a track, add a song/YouTube link to the player, update the music player, redeploy the site, push changes to GitHub, or troubleshoot why an uploaded track isn't showing or won't play. Covers the static-site + private-S3 + login-Lambda signed-URL architecture and the exact four-place add-a-track procedure. Trigger phrases: 'add a track', 'add a song', 'add this to the groove station', 'add this to the player', 'update the music player', 'redeploy the player', 'push to GitHub', 'why isn't my track showing', 'uploaded to S3 but not showing', 'track won't play', 'groove station not working'."
metadata:
  author: Grizzly Lighting
  version: '1.0'
---

# Groove Station Architecture

## When to Use This Skill

Load this skill for anything involving the Groove Station instrumental music player:
adding tracks, publishing/redeploying, pushing to GitHub, or troubleshooting a track that
was uploaded to S3 but isn't showing or won't play.

Trigger phrases: "add a track", "add a song", "add this to the groove station",
"add this to the player", "update the music player", "redeploy the player",
"push to GitHub", "why isn't my track showing", "uploaded to S3 but not showing",
"track won't play", "groove station not working".

---

## What It Is

Groove Station is a Spotify-style **static** HTML/CSS/JS instrumental music player. There is
no build step and no server-side rendering — just static files (`index.html`, `app.js`,
`style.css`, `login.html`, `login.js`, cover art). Audio is **not** bundled into the site and
**never** committed to GitHub; it streams from AWS S3 at runtime behind a passphrase.

| Item | Detail |
|------|--------|
| GitHub repo | `https://github.com/abyessof-labs/groove-station` (private) |
| GitHub owner | `abyessof-labs` |
| Git identity | `Anthony Fossey <afossey@macrostudios.ca>` |
| Audio bucket | `s3://groovestationmacro/Instrumental/` |
| AWS account (audio + Lambda) | `791327541706`, region `ca-central-1` |
| Login/signing API | `https://lnion9r8xf.execute-api.ca-central-1.amazonaws.com` |
| Login Lambda | `groove-station-login` (Node.js 22.x) |
| Track registry | `TRACKS` array in `app.js` |

---

## The Three Steps to Add a Track (mental model)

A track appears and plays only when all three are done. This is the single most important concept.

```
   ┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
   │  1. S3 object   │     │  2. TRACKS entry     │     │  3. REDEPLOY the       │
   │  (the MP3/M4A)  │ ──▶ │  in app.js           │ ──▶ │  static site           │
   │  private        │     │  key = exact S3 key  │     │  (+ push to GitHub)    │
   └────────┬────────┘     └──────────┬───────────┘     └────────────────────────┘
            └── both reference the SAME byte-for-byte S3 key ──┘
```

- **(1)** File exists in `s3://groovestationmacro/Instrumental/` (private bucket).
- **(2)** `app.js` has a `TRACKS` entry whose `key` is that S3 object key, byte-for-byte
  (spaces, curly quotes “ ”, fullwidth bar ｜, ✨, apostrophes ’ — exact, un-encoded).
- **(3)** The static site is **redeployed** so the live build includes the new `TRACKS` entry.

Miss any one → the track won't appear. **Uploading to S3 alone does nothing visible** — the site
can't auto-discover S3 files (object listing isn't public). **The step most often forgotten is the
redeploy (3): the `app.js` change gets committed but the live site is never republished.**

### Note on the login Lambda (no per-track edit needed)

The `groove-station-login` Lambda mints a short-lived pre-signed URL for each requested `TRACKS`
key on demand for a valid session — it signs the keys the player asks for. It does **not** require
a separate per-track allowlist edit. Adding a key to `app.js` and redeploying is enough for it to
be signed and played. (Confirmed July 2026: 8 new `.m4a` tracks played with real durations after
just a redeploy, with no Lambda change.)

---

## How Publishing Works (GitHub → live site)

"Publish" is two steps people conflate — do both after any code change:

1. **Push code to GitHub.** The repo is the source of truth for the code. After editing
   `app.js` / `index.html` / `style.css` / `login.*`, commit and push to
   `abyessof-labs/groove-station`.
2. **Redeploy the static site.** Pushing to GitHub does **not** update the live site by
   itself; the site must be redeployed from the current code.

**Never include audio in the deploy.** `.gitignore` excludes `audio/` and `*.mp3`. A deploy
that includes the ~2 GB of MP3s will time out and crash — keep the payload to the few hundred
KB of source files only.

---

## How Audio Loads at Runtime (private S3 + signed URLs)

**The S3 bucket is PRIVATE** (changed July 2026). Direct URLs like
`https://groovestationmacro.s3.ca-central-1.amazonaws.com/Instrumental/<file>` return
**403 Forbidden**. There are no stable public audio URLs and no long-lived links. Audio is
gated behind a passphrase.

Runtime sequence:

1. `boot()` in `app.js` checks `localStorage` for a valid session token (`gs_token`, with
   `gs_authed_until` giving a rolling ~30-day window).
2. No/expired token → redirect to `login.html`; the passphrase mints a token via the API.
3. With a valid token, `boot()` does `POST { token }` to the login API.
4. The `groove-station-login` Lambda validates the token and returns:
   ```json
   { "urls": { "<exact S3 key>": "<short-lived pre-signed URL>", ... },
     "token": "<optionally refreshed>", "expires": <unix-seconds> }
   ```
5. `app.js` stores it as `SIGNED`. Playback uses `trackUrl(key) => SIGNED[key] || ''`.

The Lambda signs the keys the player requests for a valid session, on demand — there is no
per-track allowlist to maintain. If `SIGNED[key]` is missing at playback, the usual cause is that
the `key` doesn't match the S3 object byte-for-byte, or the site wasn't redeployed with the new
`TRACKS` entry, or the session expired. These are short-lived **pre-signed (signed) URLs**, minted
per session; they expire (unlike the old public, non-expiring URLs).

---

## Adding a New Track — Correct, Complete Procedure

Do all three. Skipping the redeploy is the #1 cause of "I uploaded it but it doesn't show."

1. **Get the audio into S3.** Upload to `s3://groovestationmacro/Instrumental/`. Read the
   exact object key from `aws s3 ls s3://groovestationmacro/Instrumental/`.
   (YouTube note: `yt-dlp` is blocked from the Perplexity sandbox by YouTube's bot check.
   Fetch/convert locally or supply cookies, then upload to S3.)

2. **Register it in `app.js`.** Add a `TRACKS` entry with the next sequential `id`, the
   **exact** S3 `key` (un-encoded, byte-for-byte), a clean `name`, and a `genre`. Validate
   with `node --check app.js`.
   ```js
   { id: 35, key: 'Exact S3 Filename.m4a', name: 'Display Name', genre: 'Genre · Note' }
   ```

3. **Redeploy the static site** (code-only payload) so the live build includes the new track,
   then **commit and push** the `app.js` change to GitHub. Audio stays gitignored.
   This is the step most often forgotten — a committed `app.js` change does nothing until the
   site is republished. No Lambda edit is needed; it signs the new key on demand.

**Verify:** load the site, log in, confirm the track count and that the new track plays with a
real duration. If a track stays at "—", first suspect the site wasn't redeployed or the `key`
doesn't match S3 byte-for-byte — not the Lambda.

---

## Reconciling Filenames

S3 object keys are the source of truth. The `key` in each `TRACKS` entry must match the S3 key
byte-for-byte, including spaces and special characters. List current keys:
```bash
aws s3 ls s3://groovestationmacro/Instrumental/
```

---

## Common Failure Modes

| Symptom | Likely cause |
|---|---|
| Uploaded to S3, track not in the player at all | No `TRACKS` entry, and/or **site not redeployed** (most common) |
| Track shows in list but won't play, duration stuck at "—" | `key` doesn't match S3 byte-for-byte, or session/login issue |
| Direct S3 URL returns 403 | Expected — bucket is private; not a bug |
| Whole player redirects to login | Session token missing/expired — enter passphrase |
| "Couldn't load audio right now" banner | Login API call failed (network, or Lambda/token error) |
| New track plays in local repo but not on live site | **Site wasn't redeployed** after the `app.js` change |

---

## TL;DR

Groove Station = static site (GitHub push + a redeploy) + **private** S3 audio served through
a **login Lambda that mints short-lived pre-signed URLs on demand** for the keys the player
requests. Adding a track is a **three-step** change: (1) upload to S3, (2) `TRACKS` entry in
`app.js`, (3) **redeploy the site** (and push to GitHub). Uploading to S3 by itself does
nothing. The step most often forgotten is the **redeploy** — that's why an `app.js` change
that's already committed still doesn't show up live. No per-track Lambda edit is required.
