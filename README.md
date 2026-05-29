# Shader Wallpapers — Bug Hunter Edition

Five interactive WebGL shader wallpapers built for cybersecurity / bug-bounty desktops. Each one reacts to your mouse position and clicks.

| # | Name | Mouse | Click |
|---|---|---|---|
| 01 | Decryption Cascade | bends column flow | amber decrypt pulse |
| 02 | Hex Sonar | aims the sweep beam | active sonar ping |
| 03 | Glitch Field | tears rows toward cursor | chroma shock |
| 04 | Singularity | drags the event horizon | collapse + shock ring |
| 05 | Threat Mesh | lights your voronoi cell | exploit wave |

## How to use them

There are three formats. Pick whichever your setup supports.

### 1 · Static PNG (works everywhere)

Open `wallpapers/png/` and download any PNG (2560×1440).

- **macOS** — System Settings → Wallpaper → Add Photo → pick the file.
- **Windows** — right-click the file → Set as desktop background.
- **Linux (GNOME)** — Settings → Background → Add Picture.

### 2 · Animated (Windows · Lively Wallpaper)

[Lively Wallpaper](https://www.rocksdanister.com/lively/) is free and open source.

1. Install Lively.
2. Drag any `wallpapers/*.html` file into the Lively window.
3. Apply it. Mouse + click interactions stay live.

### 3 · Animated (macOS · Plash)

[Plash](https://sindresorhus.com/plash) is free on the Mac App Store.

1. Install Plash.
2. Click the menu-bar icon → Open URL.
3. Paste either the GitHub Pages URL of a wallpaper (e.g. `https://<you>.github.io/shader-wallpapers/wallpapers/04-singularity.html`) or a local `file://` path.

### 4 · Just play with them in a browser

Open `index.html` for the gallery, or any `wallpapers/*.html` directly.

## What's in here

```
index.html                       landing + gallery
wallpapers/
  shader-base.js                 shared WebGL boilerplate
  shader-base.css                shared HUD styling
  01-decryption-cascade.html
  02-hex-sonar.html
  03-glitch-field.html
  04-singularity.html
  05-threat-mesh.html
  png/                           2560×1440 stills
README.md
LICENSE                          MIT
.gitlab-ci.yml                   GitLab Pages config
```

## Deploy to GitHub Pages

1. Create a public repo (e.g. `shader-wallpapers`) and push this folder.
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `(root)`.
3. Your URL: `https://<your-username>.github.io/shader-wallpapers/`.

## Deploy to GitLab Pages

A `.gitlab-ci.yml` is included. Just push to `main` — it'll publish to `https://<your-username>.gitlab.io/shader-wallpapers/`.

## Tech

Pure WebGL fragment shaders. No libraries, no build step, no tracking. Each shader is ~150 lines of GLSL plus a shared 200-line WebGL runner (`shader-base.js`). Tested on Chrome / Safari / Firefox / Edge desktop.

## License

MIT. Use them, fork them, ship them with attribution.
