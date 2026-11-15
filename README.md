# mingxuan-liu.github.io

Personal and research website for Mingxuan Liu (刘明轩), PhD candidate in the
Department of Astronomy, University of Michigan.

Plain static HTML/CSS/JS — no build step, no dependencies. GitHub Pages serves
the repository root as-is.

## Pages

| File | Purpose |
|---|---|
| `index.html` | About: portrait, bio, research interests, news feed |
| `research.html` | Compact overview with equal space for all four projects |
| `research/*.html` | Individual project write-ups, figures and visualizations |
| `publications.html` | Papers, talks, code/data releases, translation |
| `teaching.html` | GSI record and the translated book (`#book` anchor) |
| `vanilla.html` | Vanilla the husky |

## Where things live

```
css/main.css          all styling; design tokens are the :root variables at the top
js/site.js            theme toggle, mobile menu, news expander, husky interactions
js/research.js        native-map zoom/comparison and on-demand 3D viewer
img/logo.png          full-resolution ink-wash artwork shown on the Research page
img/header-logo.png   square thumbnail of the complete artwork for the site header
img/favicon.png       close crop of the mountain and cosmic-ray paths for the search favicon
img/favicon.svg       same mark at the previous favicon address
favicon.ico           browser fallback, also served at the previous img/logo.ico address
img/profile_pic.jpg   portrait
img/research/         research figures and movie poster
img/pubs/             publication thumbnails and figures
img/symbols/          geometric marks, one per research project (use currentColor)
img/vanilla/          vanilla-logo.svg — source of the husky mark, plus her photos
img/outreach/         photos of the translated book
assets/multiphase/    evolution movie, native maps/renders and the 3D overview
```

The husky and the project symbols are inlined into the HTML rather than loaded as
`<img>`, so CSS can colour and animate them. The husky appears in every page's nav and
again, larger, on `vanilla.html`; the symbols appear on `index.html` and `research.html`.
If you change any of that artwork, edit the file under `img/` and then copy it into the
inline copies.

## Common edits

**Add a news item** — copy a `.news-item` block at the top of the `.news-list`
in `index.html`. Newest first.

**Add a paper** — copy a `.pub` block in `publications.html`. Photo thumbnails use 3:2 frames;
add `pub-thumb-plot` to preserve a figure's natural proportions and show every axis and label.

**Change colours** — edit the `:root` custom properties in `css/main.css`.
Dark mode overrides live in the `:root[data-theme="dark"]` block right below.

**Nav links** — the `<nav class="site-nav">` block is duplicated in each page.
Change it in one file, then copy it across; mark the current page with
`aria-current="page"`.

## Multiphase turbulence manuscript and media

The completed manuscript is introduced on `index.html`, `research/multiphase.html`,
and `publications.html#filament-heating`. It is listed separately from refereed
publications. No manuscript PDF or TeX source is included. When the arXiv URL is
available, add it to the marked `.ref-links` blocks in the multiphase project and publications,
update the status text and the publication's JSON-LD, and update the sitemap dates.

- `assets/multiphase/1024/evolution.mp4` is the updated 24-second H.264 movie
  from `1024_eta8e-4`, at 2880 × 2160 pixels and 30 fps. Native simulation resolution
  is 1024³. Temperature evolves from a fixed viewpoint for 12 seconds, followed
  by a 12-second orbit through the final state's four fields. This supplied version
  uses image dissolves (`render.json`: `temporal_mode = dissolve`). It loads on play;
  `img/research/multiphase-evolution.jpg` is a still at 11.9 seconds. The original
  movie checksum, rendering provenance, timeline and verification record accompany it.
- `assets/multiphase/2048/interactive/` is the compact 512³ viewer bundle, packaged
  from the updated source `2048_eta3e-4/web/` with the source project's
  `visualization/package_web.py`. The sibling source `interactive/` still contains
  the older 128³ export and must not replace this updated bundle.
  The web package retains all 512³ spatial samples, with the original viewer's
  8-bit logarithmic display mapping, fixed field ranges, and checksummed chunks.
  Keep the complete runtime together. No Float32 source arrays, zip, duplicate
  `web/` folder, raw Athena snapshots or server-side computation is required.
- The 3D viewer represents snapshot `00056` of `2048_eta3e-4`: a native 2048³ grid
  displayed as 512³ volume-weighted averaged cells (4³ native cells per display
  cell). This is 64 times as many cells as the earlier 128³ display. It is a fixed
  snapshot with rotation and a spatial cutaway, not a movie. Plasma β loads first.
  Other fields load only when selected (128 MiB each, 768 MiB for all six).
  The page labels both resolutions and links to a full-page viewer. The iframe is
  created only after opening the disclosure, and removed when it closes to stop
  background animation and release GPU resources.
- `assets/multiphase/2048/native/` preserves the original 2048 × 2048 gas-column
  and Hα projections, 4800 × 4000 four-field render, 4800 × 2400 heating comparison,
  standalone 2400 × 2400 Ohmic dissipation render, and their provenance.
  The zoomable comparison uses `native/emission/` for the paired intrinsic Hα and
  0.5–2 keV surface brightness maps. Each pixel samples one native sightline along
  x3, at 3.90625 pc per pixel across 8 kpc. The two colorscales independently
  stretch each band's contrast and apply a 3 × 3 filter to the display tones. “Native pixels” means one
  image pixel per CSS pixel; further zoom adds no new data. The fixed volume
  renders and 2D projections are distinct from the rotatable 512³ viewer.
  The comparison slider's track follows the visible map width, and its thumb
  stays aligned with the dividing line when fitted, zoomed, panned or resized.

### Resolution and delivery

The 512³ source export averages linear physical fields before taking logarithms.
The compact package applies the exact R8 mapping already used by the viewer;
this reduces download size without further spatial averaging. Display values
outside each fixed legend saturate, and these display textures are not
quantitative source data. Native 2048 × 2048 projections remain available above
for transverse detail without spatial averaging.

Each texture is split into small, checksummed files suitable for static hosting.
Only selected layers occupy GPU textures. Rotation uses fewer screen pixels
and ray samples; pausing restores fine rendering without changing the 512³ grid.
A complete native 2048³ volume would still need a different delivery strategy,
such as selected subvolumes or multiresolution bricks.

### Project navigation

The header logo opens the artwork on the research overview. Selecting the artwork
opens the full-resolution PNG. Existing
`research.html#cosmic-rays`, `#multiphase`, `#shear`, `#flames`,
`#multiphase-evolution` and `#multiphase-interactive` URLs forward to their new
project destinations. With JavaScript disabled, overview links and project
figures remain available, including links to the original native maps and viewer.

Preview through HTTP using the command below; the viewer requires WebGL2 and
loads 128 MiB per selected field. Opening its HTML directly from disk does not work.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## SEO

`robots.txt` and `sitemap.xml` sit at the repo root. Bump `<lastmod>` in the sitemap
when a page changes materially. Every page carries a canonical URL, Open Graph and
Twitter tags, and `rel="me"` links to ORCID / Scholar / GitHub; `index.html` carries a
schema.org `@graph` (WebSite + ProfilePage + Person) and `publications.html` describes
the two published papers and the completed manuscript as `ScholarlyArticle`, with
the manuscript's status explicitly identified.

## Pet counter

Both editions of Vanilla’s page share one total. The portrait queues pets on the
visitor’s device, retries after a lost connection, and refreshes the public count
while the page is visible. A returning visitor’s earlier browser-only tally is
imported once. The endpoint is configured in `js/vanilla.js`. Deployment details
are in [counter/README.md](counter/README.md).

## Analytics

Google Analytics (GA4, measurement ID `G-PH383HH12X`) loads on every page from the
snippet just above `</head>`. To remove it, delete that block from each site page.

## Notes

- Figures are reproduced from my own papers; captions credit the source figure.
- There is no CV page for now; add one back when there is more to put on it.
- `js/data.js`, `js/barAnimation.js`, `js/jquery-3.4.1.min.js`, `css/jjstyle/`,
  `img/pubs/flames.png` and the original `IMG_*.{jpg,jpeg,JPG}` photo files are not
  referenced by any page and can be deleted.
