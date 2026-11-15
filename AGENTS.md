# Personal website

Write for visitors who want to understand the research. For a figure or interactive
viewer, explain what is shown, what to look for, and how to use any unfamiliar
controls. Put the figure where readers can see it alongside that explanation.

Keep version comparisons, snapshot IDs, and rendering or sampling details in the
README or data documentation. Include a technical detail on the page when it
changes how a visitor should interpret the science or use a control. Give each
instruction once, where the visitor needs it.

## English originals and Simplified Chinese editions

English is the editorial source. Write or revise the English page first, then
update its complete Simplified Chinese counterpart under `zh/` in the same
change. Mirror every public page, including the standalone and embedded 3D
viewer. Preserve the science, dates, attribution, uncertainty, units, plot
symbols, original publication titles and identifiers. Use idiomatic Chinese
sentence order. Explain what a figure shows in Chinese captions and alt text,
and share the original scientific images, videos and datasets across editions.

Translate navigation, page titles, social descriptions, figure keys, subtitles,
alternative text, accessible names, empty/loading/error states, and text that
JavaScript changes after a click. Exercise the news toggle, pet counter, map,
and viewer in both editions when editing those features.

Use `lang="zh-Hans"` for Chinese. Give each edition its own canonical URL and
reciprocal `en`, `zh-Hans` and English `x-default` alternate links. Add both URLs
to the sitemap for new pages. Internal page links and embedded viewers stay in
the current language; both editions share the same section IDs. Place the
language link between Vanilla and the theme control. It should lead to the
same page and section and work as an ordinary link without JavaScript.

For a new visit through an English URL, `js/language.js` checks the GeoJS
country-code endpoint. The first request exposes the visitor’s network IP to
GeoJS. Send no credentials or referrer. Select Chinese for `CN` and English
for other codes or an unavailable service. Honor an explicit Chinese URL,
`?lang=en`, and the visitor’s manual language choice. Store only the language.
[GeoJS country endpoint](https://www.geojs.io/docs/v1/endpoints/country/)

### Terminology and review

Start with the national astronomy terminology standard and the National
Astronomical Data Center’s bilingual dictionary. Check the meaning in context
against mainland Chinese research publications. For people, book credits and
institutional names, use an author's, publisher’s or institution's attested
Chinese spelling. Retain the original spelling when the Chinese name is unknown.
[《天文学名词》第三版](https://www.cnterm.cn/cb/sdgb/202409/t20240926_762086.html) ·
[天文学名词数据库](https://nadc.china-vo.org/astrodict/) ·
[《黑洞旅行指南》中文版书讯](https://wyb.chinawriter.com.cn/content/202207/25/content65813.html)

| English | Preferred Simplified Chinese in this site’s context |
| --- | --- |
| cosmic ray; cosmic-ray transport | 宇宙线；宇宙线输运 |
| particle acceleration; scattering rate | 粒子加速；散射率 |
| magnetohydrodynamics (MHD); multiphase turbulence | 磁流体力学（MHD）；多相湍流 |
| filament in the intracluster medium | 丝状结构；指冷气体时也可用“冷气体细丝” |
| dissipative heating; Ohmic heating; viscous dissipation | 耗散加热；欧姆加热；黏性耗散 |
| kinematic viscosity; magnetic diffusivity | 运动黏度；磁扩散率 |
| intrinsic volume emissivity; projected surface brightness | 本征体积发射率；投影图上的表面亮度 |
| plasma beta; soft X-rays | 等离子体 β（气体热压与磁压之比）；软 X 射线 |
| Rayleigh–Taylor instability; inverse cascade | 瑞利–泰勒不稳定性；逆级联 |
| shear-driven turbulence; second-order Fermi acceleration | 剪切驱动的湍流；二阶费米加速 |

Check whether a rate is local, per unit volume, or integrated. Distinguish
particle number density from mass density. For β = 1, say that the thermal and
magnetic pressures are equal. In US university contexts, distinguish 博士生
from 博士候选人 and use 助教 for a graduate student instructor serving as a TA.
[发射率](https://nadc.china-vo.org/astrodict/termdetails?id=8749) ·
[瑞利–泰勒不稳定性的中文论文用例](https://www.hplpb.com.cn/article/doi/10.11884/HPLPB202234.220133)

For substantive translations, use two independent reviews: one checks the
Chinese against the scientific claims, equations, figures and numbers; the
other reads it as a native speaker and checks natural phrasing, names, and
control labels. Resolve disagreements against the English source and check the
corrected Chinese in its page context.

Chinese pages use self-hosted webfont subsets of 思源黑体 for body copy and
controls and 思源宋体 for page titles, with system fallbacks. After introducing
new Chinese characters, refresh the subsets with
`python3 tools/subset_chinese_fonts.py <Source-Han-Sans-SC-Regular.otf> <Source-Han-Serif-SC-Medium.otf>`
(fontTools and Brotli). Keep the font license in `assets/fonts/OFL.txt`.
