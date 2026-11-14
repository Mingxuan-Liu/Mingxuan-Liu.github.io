# Native spatial detail · 2048_eta3e-4

Original products from the supplied Visualization/2048_eta3e-4 directory,
copied without resampling or recoloring. Snapshot 00056, t / t_eddy ≈ 2.493.

- `emission/halpha.png` and `emission/soft_xray.png` are the matched, 2048 × 2048
  intrinsic Hα (6563 Å) and soft X-ray (0.5–2 keV) surface brightness maps shown
  on the project page. Both integrate the rest-frame emissivity along x3, in
  erg s⁻¹ cm⁻² arcsec⁻². Each band maps the 55th and 99.25th percentiles of
  positive intensity to 10% and 90% of its palette using a sigmoid in log
  intensity. A 3 × 3 bilateral filter acts on the displayed tones. The palette
  definitions and transform come from `production/apj_style.jl` and
  `visualization/render_emission_brightness.jl` in Reconnection-Analysis at
  commit `6a3a1d3`.
- `column.png`: 2048 × 2048 total particle column, integrated along x3.
- `halpha.png`: 2048 × 2048 intrinsic Hα surface brightness along the same sightline.
- `projection.json`: definitions for the earlier column and Hα pair, native sampling, color limits, assumptions and
  original product checksums. The numerical NPZ and composite image it records
  are not part of this website's selected display products.
- `four_fields.png`: 4800 × 4000 native-volume render of density, temperature,
  plasma beta and Hα emissivity.
- `ohmic_heating.png`: 2400 × 2400 standalone Ohmic dissipation render from the
  native 2048³ volume.
- `heating_comparison.png`: 4800 × 2400 native-volume heating renders with matched
  color scales.
- `render.json`: original rendering provenance. It also describes other products
  in the source run, which are not all copied here.
- `SHA256SUMS`: checksums of the copied source files.

The projection's 2048 × 2048 pixels preserve native transverse sampling (8 kpc /
2048 = 3.90625 pc); they integrate away the depth coordinate. The native renders
are fixed camera views. Neither product is a replacement for a native-resolution
rotatable volume. The separate `../interactive/` bundle remains a 512³ averaged
3D overview of the 2048³ simulation.
