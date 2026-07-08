// Groove Station — passphrase login. Posts the passphrase to the login API,
// stores the returned 30-day session token (the app fetches fresh pre-signed
// audio URLs on each load using it), then enters the player.
const LOGIN_ENDPOINT = 'https://lnion9r8xf.execute-api.ca-central-1.amazonaws.com';

const form = document.getElementById('login-form');
const errEl = document.getElementById('login-error');
const btn = document.getElementById('login-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errEl.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  const passphrase = document.getElementById('pass').value;
  try {
    const res = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });
    if (!res.ok) throw new Error('bad');
    const data = await res.json();
    localStorage.setItem('gs_token', data.token);
    localStorage.setItem('gs_authed_until', String(data.expires));
    window.location.replace('./');
  } catch (err) {
    errEl.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});
