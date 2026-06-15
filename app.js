// ─────────────────────────────────────────────────
//  Track Library
// ─────────────────────────────────────────────────
const TRACKS = [
  {
    id: 1,
    file: 'audio/The-Best-of-Acid-Jazz-and-Funk-1-Hours-and-Half-of-Non-Stop-Music.mp3',
    name: 'The Best of Acid Jazz & Funk',
    genre: 'Acid Jazz · 1½ hrs',
  },
  {
    id: 2,
    file: 'audio/Funk-Jazz-Instrumentals-2.mp3',
    name: 'Funk Jazz Instrumentals',
    genre: 'Funk Jazz',
  },
  {
    id: 3,
    file: 'audio/Nostalgic-Jazz-Funk-Ride-1-Hour-Retro-Pocket-Bliss-70s-80s-Fusion-4.mp3',
    name: 'Nostalgic Jazz-Funk Ride',
    genre: '70s/80s Fusion · Retro Pocket Bliss',
  },
  {
    id: 4,
    file: 'audio/Best-Acid-Jazz-Funky-Instrumentals-Vol.-4-True-Relaxation-and-Joy-6.mp3',
    name: 'Best Acid Jazz Funky Instrumentals Vol. 4',
    genre: 'Acid Jazz · True Relaxation & Joy',
  },
  {
    id: 5,
    file: 'audio/Best-Acid-Jazz-Funky-Instrumentals-Vol.-2-True-Relaxation-and-Joy-7.mp3',
    name: 'Best Acid Jazz Funky Instrumentals Vol. 2',
    genre: 'Acid Jazz · True Relaxation & Joy',
  },
  {
    id: 6,
    file: 'audio/Best-Acid-Jazz-Funky-Instrumentals-Vol.-3-True-Relaxation-and-Joy-8.mp3',
    name: 'Best Acid Jazz Funky Instrumentals Vol. 3',
    genre: 'Acid Jazz · True Relaxation & Joy',
  },
  {
    id: 7,
    file: 'audio/Funk-Soul-Music-Instrumental-Playlist-Background-Funk-Soul-Mix-for-Studying-Working-Relax-9.mp3',
    name: 'Funk Soul Instrumental Mix',
    genre: 'Funk Soul · Study & Work',
  },
  {
    id: 8,
    file: 'audio/Cruella_Original_Score_Complete-10.mp3',
    name: 'Cruella — Original Score (Complete)',
    genre: 'Cinematic · Orchestral Score',
  },
  {
    id: 9,
    file: 'audio/Chill-Funk-Deep-Bass-for-Everyday-Groovin-1-Hour-Retro-Instrumental-Vibes-11.mp3',
    name: 'Chill Funk Deep Bass',
    genre: 'Retro Instrumental · Everyday Groovin\'',
  },
  {
    id: 10,
    file: 'audio/The-Ultimate-Mix-Funk-x-R-B-Jazz-Relaxing-Background-Music-12.mp3',
    name: 'The Ultimate Mix: Funk × R&B × Jazz',
    genre: 'Funk / R&B / Jazz · Background Mix',
  },
  {
    id: 11,
    file: 'audio/AUD-20220726-WA0014-13.mp3',
    name: 'AUD-20220726',
    genre: 'Recording',
  },
  {
    id: 12,
    file: 'audio/Instrumental-Blues-Two-Hour-Compilation.mp3',
    name: 'Instrumental Blues — 2 Hour Compilation',
    genre: 'Blues Instrumental · 2 hrs',
  },
  {
    id: 13,
    file: 'audio/Mayelevator-Vol-2-John-Mayer-Instrumental.mp3',
    name: 'Mayelevator Vol. 2 — John Mayer Instrumental',
    genre: 'Instrumental · Elevator / Chill',
  },
  {
    id: 14,
    file: 'audio/Mayelevator-Vol-1-John-Mayer-Instrumental.mp3',
    name: 'Mayelevator Vol. 1 — John Mayer Instrumental',
    genre: 'Instrumental · Elevator / Chill',
  },
];

// ─────────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────────
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0=off 1=all 2=one
let volume = 0.7;
let isMuted = false;
let isDraggingProgress = false;
let displayedTracks = [...TRACKS];
let shuffleOrder = [];

const audio = document.getElementById('audio-engine');

// ─────────────────────────────────────────────────
//  Render Track List
// ─────────────────────────────────────────────────
function renderTracks(tracks) {
  const list = document.getElementById('track-list');
  list.innerHTML = '';

  tracks.forEach((track, idx) => {
    const li = document.createElement('li');
    li.className = 'track-item';
    li.dataset.index = idx;
    li.dataset.id = track.id;

    li.innerHTML = `
      <div class="track-num">
        <span class="num-text">${idx + 1}</span>
        <span class="play-indicator">
          <span class="bars"><span></span><span></span><span></span></span>
        </span>
      </div>
      <div class="track-details">
        <span class="track-name">${escHtml(track.name)}</span>
        <span class="track-genre">${escHtml(track.genre)}</span>
      </div>
      <span class="track-duration" id="dur-${track.id}">—</span>
    `;

    li.addEventListener('click', () => playTrack(idx));
    list.appendChild(li);
  });

  document.getElementById('track-count').textContent = tracks.length;
  document.getElementById('hero-count').textContent = `${tracks.length} song${tracks.length !== 1 ? 's' : ''}`;
  loadDurations(tracks);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Pre-load durations by probing each audio file
function loadDurations(tracks) {
  tracks.forEach(track => {
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = track.file;
    probe.addEventListener('loadedmetadata', () => {
      const el = document.getElementById(`dur-${track.id}`);
      if (el) el.textContent = formatTime(probe.duration);
    });
  });
}

// ─────────────────────────────────────────────────
//  Playback
// ─────────────────────────────────────────────────
function playTrack(idx) {
  if (idx < 0 || idx >= displayedTracks.length) return;
  currentIndex = idx;
  const track = displayedTracks[idx];

  audio.src = track.file;
  audio.volume = isMuted ? 0 : volume;
  audio.play().catch(() => {});

  isPlaying = true;
  updateNowPlaying(track);
  updateTrackListActive(idx);
  updatePlayIcons();
}

function updateNowPlaying(track) {
  document.getElementById('np-title').textContent = track.name;
  document.getElementById('np-artist').textContent = track.genre;
}

function updateTrackListActive(idx) {
  document.querySelectorAll('.track-item').forEach(item => {
    item.classList.remove('active', 'playing', 'paused');
  });
  const items = document.querySelectorAll('.track-item');
  if (items[idx]) {
    items[idx].classList.add('active', isPlaying ? 'playing' : 'paused');
  }
}

function updatePlayIcons() {
  const playIcon = document.getElementById('play-icon');
  const playHeroIcon = document.getElementById('play-hero-icon');

  if (isPlaying) {
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    playHeroIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    playHeroIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function togglePlay() {
  if (currentIndex === -1) {
    playTrack(0);
    return;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
  }
  updateTrackListActive(currentIndex);
  updatePlayIcons();
}

function playNext() {
  if (displayedTracks.length === 0) return;
  let next;
  if (isShuffle) {
    next = shuffleOrder.shift();
    if (next === undefined) {
      rebuildShuffleOrder();
      next = shuffleOrder.shift();
    }
  } else {
    next = (currentIndex + 1) % displayedTracks.length;
  }
  playTrack(next);
}

function playPrev() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const prev = (currentIndex - 1 + displayedTracks.length) % displayedTracks.length;
  playTrack(prev);
}

function rebuildShuffleOrder() {
  shuffleOrder = [...Array(displayedTracks.length).keys()]
    .filter(i => i !== currentIndex)
    .sort(() => Math.random() - 0.5);
}

// ─────────────────────────────────────────────────
//  Audio Events
// ─────────────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
  if (isDraggingProgress || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-thumb').style.left = pct + '%';
  document.getElementById('current-time').textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  document.getElementById('total-time').textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  if (repeatMode === 2) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else if (repeatMode === 1 || currentIndex < displayedTracks.length - 1 || isShuffle) {
    playNext();
  } else {
    isPlaying = false;
    updatePlayIcons();
    updateTrackListActive(currentIndex);
  }
});

audio.addEventListener('play', () => {
  isPlaying = true;
  updateTrackListActive(currentIndex);
  updatePlayIcons();
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  updateTrackListActive(currentIndex);
  updatePlayIcons();
});

// ─────────────────────────────────────────────────
//  Progress Bar
// ─────────────────────────────────────────────────
const progressTrack = document.getElementById('progress-track');

function seekTo(e) {
  if (!audio.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  document.getElementById('progress-fill').style.width = (pct * 100) + '%';
  document.getElementById('progress-thumb').style.left = (pct * 100) + '%';
  document.getElementById('current-time').textContent = formatTime(audio.currentTime);
}

progressTrack.addEventListener('mousedown', (e) => {
  isDraggingProgress = true;
  seekTo(e);
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingProgress) seekTo(e);
});

document.addEventListener('mouseup', () => {
  isDraggingProgress = false;
});

// ─────────────────────────────────────────────────
//  Volume
// ─────────────────────────────────────────────────
const volumeTrack = document.getElementById('volume-track');

function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  audio.volume = isMuted ? 0 : volume;
  const pct = (volume * 100).toFixed(1) + '%';
  document.getElementById('volume-fill').style.width = pct;
  document.getElementById('volume-thumb').style.left = pct;
  updateVolumeIcon();
}

function updateVolumeIcon() {
  const icon = document.getElementById('volume-icon');
  if (isMuted || volume === 0) {
    icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  } else if (volume < 0.5) {
    icon.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
  } else {
    icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  }
}

let isDraggingVolume = false;

function seekVolume(e) {
  const rect = volumeTrack.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  isMuted = false;
  setVolume(pct);
}

volumeTrack.addEventListener('mousedown', (e) => {
  isDraggingVolume = true;
  seekVolume(e);
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingVolume) seekVolume(e);
});

document.addEventListener('mouseup', () => {
  isDraggingVolume = false;
});

document.getElementById('mute-btn').addEventListener('click', () => {
  isMuted = !isMuted;
  audio.volume = isMuted ? 0 : volume;
  updateVolumeIcon();
});

// ─────────────────────────────────────────────────
//  Transport Controls
// ─────────────────────────────────────────────────
document.getElementById('play-btn').addEventListener('click', togglePlay);
document.getElementById('play-hero').addEventListener('click', togglePlay);
document.getElementById('prev-btn').addEventListener('click', playPrev);
document.getElementById('next-btn').addEventListener('click', playNext);

document.getElementById('shuffle-btn').addEventListener('click', () => {
  isShuffle = !isShuffle;
  document.getElementById('shuffle-btn').classList.toggle('active', isShuffle);
  if (isShuffle) rebuildShuffleOrder();
});

document.getElementById('repeat-btn').addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3;
  const btn = document.getElementById('repeat-btn');
  btn.classList.toggle('active', repeatMode > 0);
  if (repeatMode === 2) {
    btn.title = 'Repeat one';
    btn.querySelector('svg').innerHTML = '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="12" y="13" text-anchor="middle" font-size="8" fill="currentColor" font-family="sans-serif">1</text>';
  } else {
    btn.title = repeatMode === 1 ? 'Repeat all' : 'Repeat off';
    btn.querySelector('svg').innerHTML = '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>';
  }
});

// ─────────────────────────────────────────────────
//  Search / Filter
// ─────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  displayedTracks = q
    ? TRACKS.filter(t => t.name.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q))
    : [...TRACKS];
  renderTracks(displayedTracks);
  // Re-highlight if current track is still in list
  const inList = displayedTracks.findIndex(t => t.id === (TRACKS[currentIndex] || {}).id);
  if (inList >= 0) updateTrackListActive(inList);
});

// ─────────────────────────────────────────────────
//  Like Button
// ─────────────────────────────────────────────────
document.getElementById('heart-btn').addEventListener('click', function () {
  this.classList.toggle('liked');
});

// ─────────────────────────────────────────────────
//  Keyboard Shortcuts
// ─────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'Space': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': e.preventDefault(); audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); break;
    case 'ArrowLeft': e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 10); break;
    case 'ArrowUp': e.preventDefault(); setVolume(volume + 0.05); break;
    case 'ArrowDown': e.preventDefault(); setVolume(volume - 0.05); break;
    case 'KeyN': playNext(); break;
    case 'KeyP': playPrev(); break;
  }
});

// ─────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────
function formatTime(sec) {
  if (!isFinite(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─────────────────────────────────────────────────
//  Init
// ─────────────────────────────────────────────────
setVolume(0.7);
renderTracks(displayedTracks);
