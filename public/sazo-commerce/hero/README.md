# Mobile hero safe area

The mobile home hero is rendered at `320px` high with `object-fit: cover`. The
fixed header ends at `y=56px`, and the overlapping AI search panel starts at
`y=238px`, leaving an unobstructed CSS band of `182px`.

All dedicated mobile hero artwork uses an `887 x 852px` source canvas. Keep
copy, faces, products, parcels, landmarks, and other focal illustrations inside:

```text
x = 70..817px
y = 220..570px
safe size = 747 x 350px
```

The mathematically common visible vertical range across `341px`, `390px`, and
`440px` viewports is approximately `y=210..589px`; the narrower recommended
range above provides visual breathing room. The top and bottom areas are for
quiet, nonessential background only.

The measured values and reusable machine-readable constraints live in
[`mobile-safe-area.json`](./mobile-safe-area.json).
