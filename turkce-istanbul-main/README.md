# Türkçe İstanbul 🇹🇷

A Duolingo-style Turkish learning web app (A1–A2), mobile-first and installable as a PWA. Runs with `node server.js`: no build step, no dependencies.

- 50 units across A1, A2, B1 and B2 (~450 words and phrases): from greetings and numbers up to conditionals, passive voice, formal writing, environment and Istanbul culture. Filter the path by level (All, A1, A2, B1, B2)
- Modes: lessons, flashcards, matching, word search, sentence builder, mistakes review, searchable dictionary, A1, A2, B1 and B2 exams (70% to pass)
- Exercises: multiple choice, typing (diacritic-tolerant), listening (browser text-to-speech, `tr-TR`), picture choice ("select the correct image", emoji-based), translate-with-a-word-bank, fill in the missing word (choose or type), matching pairs (text or audio), and speaking (repeat the word / sentence)
- Hearts, XP, daily streak, per-user logins with progress synced across devices, offline via service worker

> Content is original practice material on the *themes* of A1–A2 Istanbul-style coursebooks. It does not reproduce any textbook. Add your own units in `js/lessons.js` (`[turkish, english]` pairs).

## Run
```bash
node server.js
```
Open http://localhost:3000. Needs Node 18+ and nothing else (no `npm install`).

The terminal also prints an address like `http://192.168.1.20:3000`. Open that on your phone or another computer on the same Wi-Fi, log in with the same account, and your progress follows you.

- **Accounts:** sign up with a username and password, then log in on any device. Progress (XP, streak, units, words, exams, mistakes) is saved to the server a second after every change and picked up by your other devices when you open or return to the app.
- **Offline:** the app keeps working without the server; unsent progress uploads automatically when it is reachable again. If two devices changed progress at the same time, XP, unit levels, word levels and exam scores are merged, so nothing earned is lost.
- **Old progress:** profiles saved in a browser before logins existed can be imported when you sign up.
- **Data:** everything lives in the `data/` folder, in `data/db.json` (readable JSON; passwords are stored only as scrypt hashes). Back up or move that folder to move your accounts.

| Setting | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | port |
| `HOST` | `0.0.0.0` | `127.0.0.1` = this computer only |
| `DATA_DIR` | `./data` | where `db.json` is stored |
| `ALLOW_REGISTER` | `1` | `0` closes sign-ups (existing users can still log in) |
| `TRUST_PROXY` | `0` | `1` when behind an HTTPS reverse proxy |

Example: `PORT=8080 HOST=127.0.0.1 node server.js`

> The server speaks plain HTTP, which is fine at home. If you expose it to the internet, put it behind HTTPS (Caddy, nginx, Cloudflare Tunnel…) and set `TRUST_PROXY=1`, otherwise passwords travel unencrypted. Installing as a PWA / offline caching also needs HTTPS (or `localhost`).

## Notes on the exercises
- **Typed answers:** small typos and missing Turkish letters (i for ı, s for ş…) are counted correct, and the correct spelling is shown with the differing letters underlined.
- **"Can't listen now" / "Can't speak now"** ask for confirmation, then skip those exercises for the unit (listening) or the visit (speaking).
- **Speaking** uses the browser's speech recognition (Chrome, Edge, Safari; not Firefox) and needs `https://` or `localhost`. Chrome sends the audio to Google for recognition. Where it is unavailable the speaking questions simply don't appear.
- "Benim adım …" uses your own username.

## Always on: start at boot + Tailscale HTTPS address (Linux)
```bash
sudo ./deploy/install-linux.sh              # private: reachable only from devices signed in to your Tailscale
sudo ./deploy/install-linux.sh --public     # reachable from anywhere on the internet (Tailscale Funnel)
sudo ./deploy/install-linux.sh --uninstall
```
This installs a systemd service (starts when the PC boots, restarts if it crashes, runs as your user) and publishes it with `tailscale serve`, giving a fixed address like `https://<pc-name>.<tailnet>.ts.net:8443` (port 8443 so anything you already publish on 443 is left alone; change it with `TS_HTTPS_PORT=10000`). One-time setup: install Tailscale (`curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up`) and turn on **HTTPS Certificates** in the Tailscale admin console (DNS page). Install the Tailscale app on your phone and sign in to the same account to use the private address.
Logs: `journalctl -u turkce-istanbul -f`.

## Tests
```bash
node --test tests/api.test.js        # server API: accounts, sessions, sync, security (no dependencies)
node tests/e2e.js                    # real-browser check of login + two-device sync (needs Playwright)
node tests/quiz.js                   # every unit/level builds; each new question type renders and grades correctly (needs Playwright)

Pictures for the picture questions live in the `PIC` table in `js/quiz2.js` (Turkish word → emoji); add a word there and it automatically gets picture questions.
```
`tests/browser-suite.js` is the older suite for the previous on-device profile switcher and no longer applies to the login flow.

## GitHub Pages
The login and sync need `server.js`, so the static GitHub Pages workflows in `.github/workflows` no longer give a working app. Delete them, or host the whole project on any machine that can run Node.

## Units, exams, microphone and voice

- **Unit exam:** the last stage of every unit (🏆) tests every word of that unit with 2–3 questions each. You need **90 %** to pass; the next unit stays locked until then.
- **Unit-only vocabulary:** questions, wrong answers and picture options come from the current unit only.
- **Microphone:** the browser's permission prompt is shown the first time the app opens on a device, and the permission is re-checked (and asked again by the browser) before every speaking question. There is no custom explanation screen.
- **Turkish voice only:** text-to-speech uses a `tr-TR` voice and never falls back to an English one. If the device has none, audio stays off and a notice explains how to install one (Linux: `sudo apt install speech-dispatcher espeak-ng`; Windows: Settings → Time & language → Speech → add Turkish).


## New in this version

**Server**
- **Daily backup** of `data/db.json` into `data/backups/` (one file per day, newest `BACKUP_KEEP=14` kept; files are readable only by the server user).
- **Admin page** at `/admin.html`: accounts with XP / streak / units / words / devices, reset a password (gives a temporary one and signs the user out), delete an account, back up now. Admins = `ADMIN_USERS=name1,name2`; if not set, the oldest account.
- **Weekly league** (`/api/league`): XP since Monday for everyone on this server.
- **Reminder time**: Profile > Reminders lets each learner pick the first reminder time (default 20:00; follow-ups 2 h later and 23:30 when there is room).

**Learning**
- Spaced repetition (missed words return after 1, 3, 7, 14 days, shown as a Review card on Home), Weak words deck, Refresh units, Dictation, Suffix-building questions (explains vowel harmony / hardening / buffers / softening), Grammar cards (also on unit screens), Stories (tap a word), Dialogues, Timed challenge (60 s), Placement test on first login (also in Practice).
- Pronunciation score: after a speaking question the words that were recognised are shown in green, missed ones in red.
- Six real-life Istanbul units (simit stand, İstanbulkart, Marmaray/ferry/dolmuş, Grand Bazaar, Kadıköy directions, pharmacy), culture note on every unit, word of the day.

**Motivation**
- Daily goal ring (10/20/30 XP), weekly summary, badges, streak freeze and avatars bought with XP (spending is tracked separately, so total XP never goes down), dark / light / auto theme.

Not included: hearts shop, and weekly summary as a push notification (it is a Profile card).

Run the checks with `npm test` (and `node tests/e2e.js` with Playwright).
