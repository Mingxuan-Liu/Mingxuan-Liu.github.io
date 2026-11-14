# Native spatial detail · 2048_eta3e-4

Original products from the supplied Visualization/2048_eta3e-4 directory,
copied without resampling or recoloring. Snapshot 00056, t / t_eddy ≈ 2.493.

- `column.png`: 2048 × 2048 total particle column, integrated along x3.
- `halpha.png`: 2048 × 2048 intrinsic Hα surface brightness along the same sightline.
- `projection.json`: definitions, native sampling, color limits, assumptions and
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
- `SHA256SUMS`: checksums of the seven copied source files.

The projection's 2048 × 2048 pixels preserve native transverse sampling (8 kpc /
2048 = 3.90625 pc); they integrate away the depth coordinate. The native renders
are fixed camera views. Neither product is a replacement for a native-resolution
rotatable volume. The separate `../interactive/` bundle remains a 128³ averaged
3D overview of the 2048³ simulation.
