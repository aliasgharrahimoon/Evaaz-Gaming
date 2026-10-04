# EVAAZ GAMING – Cyberpunk Game Portfolio

Static site (HTML/CSS/JS, no build step). Works on GitHub Pages as-is.

## Structure
- `index.html` – public site (hero, games grid, modal, about, contact)
- `admin.html` – admin panel
- `data/games.json` – all your games
- `js/config.js` – admin password hash, email, social links
- `js/main.js` / `js/fx.js` – site logic / effects (rain, cursor, loader)
- `css/style.css` – theme (colors are CSS variables at the top)
- `img/` – put covers and screenshots here, then reference as `img/name.png`

## Run locally
Browsers block `fetch` on `file://`, so use a local server:
```
cd neon-arcade
python3 -m http.server 8000
```
Open http://localhost:8000

## Deploy to GitHub Pages
1. Create a repo on GitHub and push this folder's contents to the `main` branch (files at the repo root).
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. Wait a minute. Your site is at `https://<username>.github.io/<repo>/`.

## Using the admin panel
1. Open `/admin.html`, log in (default password: `neon2077`).
2. Add / edit / delete games. Changes are saved as a **draft in your browser**.
3. Click **Preview draft** to see the site with your draft (`index.html?preview`).
4. Click **Export games.json**, replace `data/games.json` in your repo with it, commit and push. Done.
5. For images: copy files into `img/` and enter `img/cover.png`, or paste any image URL.

### Change the password
In the browser console or terminal compute the SHA-256 of your new password:
```
echo -n "mynewpassword" | sha256sum
```
Paste the hash into `ADMIN_HASH` in `js/config.js`.

**Security note:** the login is client-side only, so it's a deterrent, not real security. The admin page can't publish anything by itself — only you can, by committing the exported JSON.
