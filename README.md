# mingxuan-liu.github.io

Personal and research website for Mingxuan Liu (刘明轩), PhD candidate in the
Department of Astronomy, University of Michigan.

Plain static HTML/CSS/JS — no build step, no dependencies. GitHub Pages serves
the repository root as-is.

## Pages

| File | Purpose |
|---|---|
| `index.html` | About: portrait, bio, research interests, news feed |
| `research.html` | Research projects, each with figures and a plain-language write-up |
| `publications.html` | Papers, talks, code/data releases, translation |
| `teaching.html` | GSI record and the translated book (`#book` anchor) |
| `vanilla.html` | Vanilla the husky |

## Where things live

```
css/main.css          all styling; design tokens are the :root variables at the top
js/site.js            theme toggle, mobile menu, news expander, husky interactions
img/favicon.svg       site favicon (a Kelvin–Helmholtz roll)
img/profile_pic.jpg   portrait
img/research/         figures used on research.html
img/pubs/             3:2 thumbnails used on publications.html
img/symbols/          geometric marks, one per research project (use currentColor)
img/vanilla/          vanilla-logo.svg — source of the husky mark, plus her photos
img/outreach/         photos of the translated book
```

The husky and the project symbols are inlined into the HTML rather than loaded as
`<img>`, so CSS can colour and animate them. The husky appears in every page's nav and
again, larger, on `vanilla.html`; the symbols appear on `index.html` and `research.html`.
If you change any of that artwork, edit the file under `img/` and then copy it into the
inline copies.

## Common edits

**Add a news item** — copy a `.news-item` block at the top of the `.news-list`
in `index.html`. Newest first.

**Add a paper** — copy a `.pub` block in `publications.html`. Thumbnails are 840×560 (3:2).

**Change colours** — edit the `:root` custom properties in `css/main.css`.
Dark mode overrides live in the `:root[data-theme="dark"]` block right below.

**Nav links** — the `<nav class="site-nav">` block is duplicated in each page.
Change it in one file, then copy it across; mark the current page with
`aria-current="page"`.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Pet counter

The tally on `vanilla.html` is stored in `localStorage`, so it persists per browser.
`counter/` holds an optional Cloudflare Worker that turns it into a single total
shared by everyone; it is inert until you set `PET_API` in `js/site.js`. See
`counter/README.md`.

## Analytics

Google Analytics (GA4, measurement ID `G-PH383HH12X`) loads on every page from the
snippet just above `</head>`. To remove it, delete that block from all five files.

## Notes

- Figures are reproduced from my own papers; captions credit the source figure.
- There is no CV page for now; add one back when there is more to put on it.
- `js/data.js`, `js/barAnimation.js`, `js/jquery-3.4.1.min.js`, `css/jjstyle/`,
  `img/pubs/flames.png` and the original `IMG_*.{jpg,jpeg,JPG}` photo files are not
  referenced by any page and can be deleted.
