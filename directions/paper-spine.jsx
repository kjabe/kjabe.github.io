// Direction 07 · Paper + Spine (combined)
// Paper's quiet academic homepage shell + the Spine timeline as the
// centerpiece.
//
// Logo: East-Asian-name-stamp-inspired KA chop / seal (six variants,
// swappable from the tweaks panel). See ../seal-variations.html. Default
// variant is "seal-square". The seal lives in the header at 32 px (no
// caption) — there's no separate hero logo block.
//
// Layout flows naturally — no internal scroll container — so the page
// scrolls as a real website would. The spine's IntersectionObserver uses
// the viewport as its root so reveal-on-scroll fires as the user scrolls
// the window. Print, prefers-reduced-motion, and responsive (<720 / <480)
// are all handled below.

// -- Container-width hook ----------------------------------------------------
// Reports the rendered width of `ref.current` via ResizeObserver. Used to
// drive responsive overrides without relying on viewport media queries,
// which would misfire inside the fixed-size design-canvas artboard.
function useContainerWidth(ref) {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof ResizeObserver === "undefined") {
      setWidth(node.getBoundingClientRect().width);
      return;
    }
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(node);
    setWidth(node.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

// -- Reduced-motion hook -----------------------------------------------------
function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return reduce;
}

// -- Lines-family geometry helpers ------------------------------------------
// Module-scope helpers shared by the "seal-lines-*" variants below. They
// break a square's perimeter into segments of varying lengths so the frame
// reads as implied rather than continuous. Arrays are pre-computed at module
// load so Babel doesn't transpile IIFEs inside each render.
function _buildSideSegments(sideLengths, gap, axis, position) {
  // axis: 'h' → horizontal side (y is constant=position, x varies 5→95)
  //       'v' → vertical   side (x is constant=position, y varies 5→95)
  const segs = [];
  let cursor = 5;
  for (const L of sideLengths) {
    if (axis === 'h') {
      segs.push({ x1: cursor, y1: position, x2: cursor + L, y2: position });
    } else {
      segs.push({ x1: position, y1: cursor, x2: position, y2: cursor + L });
    }
    cursor += L + gap;
  }
  return segs;
}
function _buildSquareSegments(top, right, bottom, left, gap) {
  return [
    ..._buildSideSegments(top,    gap, 'h', 5),
    ..._buildSideSegments(right,  gap, 'v', 95),
    ..._buildSideSegments(bottom, gap, 'h', 95),
    ..._buildSideSegments(left,   gap, 'v', 5),
  ];
}
// Three rhythms. Each side's length-array sums to (90 − gap×(n−1)) so the
// segments + gaps add up to the 90-unit span between corners.
const LINES_RHYTHM   = _buildSquareSegments(
  [22, 18, 16, 28],
  [16, 24, 20, 24],
  [28, 16, 18, 22],
  [22, 16, 24, 22],
  2,
);
const LINES_STACCATO = _buildSquareSegments(
  [10, 14,  8, 16, 12,  9,  9],
  [ 8, 12, 16, 10, 14,  9,  9],
  [14,  8, 12, 16,  8, 11,  9],
  [12, 10, 16,  8, 14,  9,  9],
  2,
);
const LINES_MIXED    = [
  ..._buildSideSegments([42, 46],                              2, 'h', 5),
  ..._buildSideSegments([6, 8, 5, 9, 7, 6, 11, 8, 4, 8],       2, 'v', 95),
  ..._buildSideSegments([16, 22, 12, 18, 14],                  2, 'h', 95),
  ..._buildSideSegments([30, 22, 34],                          2, 'v', 5),
];

// -- Logo (KA chop / seal) ---------------------------------------------------
// Eighteen East-Asian-name-stamp-inspired variants. `style` selects:
//   seal-square            · outlined square + KA + accent dot
//   seal-bitten            · square + dot, bottom-right corner die-cut by a
//                            chop-dot-sized circle (mask-based — outline
//                            curves cleanly around the bite).
//   seal-bitten-rounded    · seal-bitten but with the OTHER three corners
//                            rounded (size-aware radius). Friendlier
//                            silhouette; the bite stays sharp. DEFAULT in v6.
//   seal-bitten-deep       · same family, medium bite (radius 10)
//   seal-bitten-bold       · same family, dramatic bite (radius 16)
//   seal-vermillion     · filled vermillion with KA cut out
//   seal-round          · circle outline + KA + small dot
//   seal-split          · square divided by a horizontal rule; K above, A below
//   seal-double         · nested square frames + KA
//   seal-irregular      · square outline with intentional broken edges
//   seal-corner         · only four L-shaped corner brackets (no full frame)
//   seal-vertical       · square + vertical divider; K | A side-by-side
//   seal-tag            · tag/torii-shaped frame with a cross-bar above
//   seal-piano          · square + a piano-keys band across the top (themed)
//   seal-soccer         · square + filled pentagon in the lower-right (themed)
//   seal-lines-rhythm   · square implied by balanced segment rhythm
//   seal-lines-staccato · square implied by dense 7-segment-per-side rhythm
//   seal-lines-mixed    · asymmetric — wildly different rhythm per side
//
// The strokeWidth scales inversely with size so a 32 px header logo still
// reads cleanly — at 170 px hero we get a ~3 px visual stroke; at 32 px we
// get ~1.5 px. `showCaption` toggles the "koji abe · stanford" cap (off
// for the small header logo; on for any large standalone use).
function LogoBlock({ color = "#14130f", style = "seal-square", size = 170, caption = "koji abe · stanford", showCaption = true }) {
  // useId gives a stable unique mask-id suffix per render — needed so
  // multiple LogoBlocks on one page don't fight over the same `vm-cut-*` id.
  const uid = React.useId().replace(/[:]/g, "");
  // Visual stroke target: ~2-3 px at any size. In viewBox-100 space the
  // multiplier is (target_px * 100 / size). Clamp 2.5..6 so the hero stays
  // crisp and the favicon stays visible.
  const sw = Math.min(6, Math.max(2.5, 220 / size));
  // Thinner inner frame for seal-double — half the main stroke.
  const swInner = Math.min(3, Math.max(1, sw / 2.5));
  // Dot radius: keep it visible at small sizes too.
  const dotR = Math.max(2.6, 110 / size);
  const dotRSmall = Math.max(2, 80 / size);
  // Bite radius for seal-bitten: scales independently of dotR so the
  // visual bite stays comfortable across sizes. At hero (≥140) it tracks
  // the dot at 2.6; at medium sizes (64–32) it grows modestly (≈3.4–4.9)
  // so the bite reads at all; at favicon (16) it's clamped to 5 so the
  // bite doesn't dominate the tiny mark.
  const biteR = Math.max(2.6, Math.min(5, 100 / size + 1.8));
  // Corner radius for seal-bitten-rounded. Size-aware so the visible
  // rounding stays ~4–5 px at every scale (clamped at favicon/header,
  // shrinks at social/hero). cR1 / cR2 are the arc start/end stops along
  // each side, derived from cornerR.
  const cornerR = Math.min(14, Math.max(2.5, 460 / size));
  const cR1 = 5 + cornerR;
  const cR2 = 95 - cornerR;
  // Inner text size scales with whether we're showing one or two letters.
  const variants = {
    "seal-square": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, square chop. ${caption}`}>
        <rect x="5" y="5" width="90" height="90" stroke={color} strokeWidth={sw} fill="none" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
        <circle cx="82" cy="82" r={dotR} fill={color} />
      </svg>
    ),
    // --- Bitten-corner family ------------------------------------------
    // Same as seal-square but with the bottom-right corner completely
    // bitten away by a quarter-circle the size of (a multiple of) the
    // chop dot. Three intensities: faithful (same size), medium, and a
    // dramatic chomp. The original chop dot stays where it is so the
    // bite reads as "the dot was punched out of the corner."
    //
    // seal-bitten uses an SVG mask: the cutter circle sits at the
    // corner (95,95) so half is outside the square; the visible bite is
    // the quarter-disc inside, leaving a circular arc on the outline
    // (no stroked edge — the curve is defined by the mask itself).
    "seal-bitten": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, square with bottom-right corner die-cut by the chop dot. ${caption}`}>
        <defs>
          <mask id={`bite-mask-${uid}`} maskUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="white" />
            <circle cx="95" cy="95" r={biteR} fill="black" />
          </mask>
        </defs>
        <rect x="5" y="5" width="90" height="90"
              stroke={color} strokeWidth={sw} fill="none"
              strokeLinejoin="miter"
              mask={`url(#bite-mask-${uid})`} />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
        {/* Inner chop dot uses biteR (not dotR) so it always matches the
            bite-circle size, regardless of render size. */}
        <circle cx="82" cy="82" r={biteR} fill={color} />
      </svg>
    ),
    // Medium bite: fixed-radius arc (10) instead of a mask, so the
    // visual bite is consistent across sizes. Dot stays at (82,82).
    "seal-bitten-deep": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, square with bottom-right corner bitten (medium bite). ${caption}`}>
        <path d="M 5 5 L 95 5 L 95 85 A 10 10 0 0 0 85 95 L 5 95 Z"
              stroke={color} strokeWidth={sw} fill="none" strokeLinejoin="miter" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
        <circle cx="82" cy="82" r={dotR} fill={color} />
      </svg>
    ),
    // Bold bite: fixed-radius arc (16). Dot pulled inward to (76,76) so
    // it doesn't fight the bite.
    "seal-bitten-bold": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, square with bottom-right corner bitten (large bite). ${caption}`}>
        <path d="M 5 5 L 95 5 L 95 79 A 16 16 0 0 0 79 95 L 5 95 Z"
              stroke={color} strokeWidth={sw} fill="none" strokeLinejoin="miter" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
        <circle cx="76" cy="76" r={dotR} fill={color} />
      </svg>
    ),
    // Small bite + rounded other corners: same mask as seal-bitten so the
    // bite reads identically, but the other three corners use a size-aware
    // arc radius (cornerR) for a friendlier silhouette. The bottom-right
    // stays sharp so the circular die-cut remains clean.
    "seal-bitten-rounded": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, three corners rounded, bottom-right corner die-cut by the chop dot. ${caption}`}>
        <defs>
          <mask id={`bite-mask-r-${uid}`} maskUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="white" />
            <circle cx="95" cy="95" r={biteR} fill="black" />
          </mask>
        </defs>
        {/* Path: clockwise from just past the top-left arc.
            TL rounded → top edge → TR rounded → right edge → bottom-right
            SHARP → bottom edge → BL rounded → left edge → close. */}
        <path d={`M ${cR1} 5 L ${cR2} 5 A ${cornerR} ${cornerR} 0 0 1 95 ${cR1} L 95 95 L ${cR1} 95 A ${cornerR} ${cornerR} 0 0 1 5 ${cR2} L 5 ${cR1} A ${cornerR} ${cornerR} 0 0 1 ${cR1} 5 Z`}
              stroke={color} strokeWidth={sw} fill="none"
              strokeLinejoin="miter"
              mask={`url(#bite-mask-r-${uid})`} />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
        {/* Chop dot matches the bite-circle size, same as seal-bitten. */}
        <circle cx="82" cy="82" r={biteR} fill={color} />
      </svg>
    ),
    "seal-vermillion": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, filled vermillion. ${caption}`}>
        <defs>
          <mask id={`vm-cut-${uid}`}>
            <rect width="100" height="100" fill="white" />
            <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
                  fontFamily='"Source Serif 4", serif' fontWeight="700" fontSize="48"
                  fill="black" letterSpacing="-1">KA</text>
          </mask>
        </defs>
        <rect width="100" height="100" fill={color} mask={`url(#vm-cut-${uid})`} />
      </svg>
    ),
    "seal-round": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, round chop. ${caption}`}>
        <circle cx="50" cy="50" r="46" stroke={color} strokeWidth={sw} fill="none" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="38"
              fill={color} letterSpacing="-1">KA</text>
        <circle cx="76" cy="76" r={dotRSmall} fill={color} />
      </svg>
    ),
    "seal-split": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, split layout. ${caption}`}>
        <rect x="5" y="5" width="90" height="90" stroke={color} strokeWidth={sw} fill="none" />
        <line x1="5" y1="50" x2="95" y2="50" stroke={color} strokeWidth={swInner} />
        <text x="50" y="30" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="28"
              fill={color}>K</text>
        <text x="50" y="72" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="28"
              fill={color}>A</text>
      </svg>
    ),
    "seal-double": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, double frame. ${caption}`}>
        <rect x="3" y="3" width="94" height="94" stroke={color} strokeWidth={sw} fill="none" />
        <rect x="10" y="10" width="80" height="80" stroke={color} strokeWidth={swInner} fill="none" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="40"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    "seal-irregular": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, worn edge. ${caption}`}>
        <path d="M 5 5 L 36 5 M 42 5 L 68 5 M 74 5 L 95 5
                 L 95 36 M 95 42 L 95 70 M 95 76 L 95 95
                 L 76 95 M 70 95 L 42 95 M 36 95 L 5 95
                 L 5 76 M 5 70 L 5 42 M 5 36 L 5 5"
              stroke={color} strokeWidth={sw} fill="none" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    // --- Similar-but-different variants (ported from export-website-v4) -
    // seal-corner: only L-shaped corner brackets frame the letters. Quieter
    // than the full square; reads as modern/minimal but keeps the chop DNA.
    "seal-corner": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, corner brackets. ${caption}`}>
        <path d="M 5 22 L 5 5 L 22 5 M 95 22 L 95 5 L 78 5
                 M 5 78 L 5 95 L 22 95 M 95 78 L 95 95 L 78 95"
              stroke={color} strokeWidth={sw} strokeLinecap="square" fill="none" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="44"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    // seal-vertical: like seal-split but the divider is vertical, so K and
    // A read as a pair side-by-side. Stays inside a single frame.
    "seal-vertical": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, vertical split. ${caption}`}>
        <rect x="5" y="5" width="90" height="90" stroke={color} strokeWidth={sw} fill="none" />
        <line x1="50" y1="5" x2="50" y2="95" stroke={color} strokeWidth={swInner} />
        <text x="28" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="38"
              fill={color}>K</text>
        <text x="72" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="38"
              fill={color}>A</text>
      </svg>
    ),
    // seal-tag: a tag-/torii-/gate-shaped outline, with a small cross-bar
    // at the top suggesting a name plate. Still a single-letter chop but
    // visibly distinct from the plain square.
    "seal-tag": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, name-tag frame. ${caption}`}>
        <path d="M 5 15 L 95 15 L 95 95 L 5 95 Z" stroke={color} strokeWidth={sw} fill="none" strokeLinejoin="miter" />
        <line x1="2" y1="15" x2="98" y2="15" stroke={color} strokeWidth={sw} strokeLinecap="square" />
        <line x1="14" y1="6" x2="86" y2="6" stroke={color} strokeWidth={swInner} />
        <text x="50" y="58" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="40"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    // --- Themed variants -----------------------------------------------
    // seal-piano: a row of piano keys (black + white) sits across the top
    // of the square; KA beneath. Subtle, doesn't shout "piano!".
    "seal-piano": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram with piano-keys motif. ${caption}`}>
        <rect x="5" y="5" width="90" height="90" stroke={color} strokeWidth={sw} fill="none" />
        {/* keybed: a horizontal band split by 6 white-key dividers */}
        <line x1="5"  y1="28" x2="95" y2="28" stroke={color} strokeWidth={swInner} />
        <line x1="20" y1="5"  x2="20" y2="28" stroke={color} strokeWidth={swInner} />
        <line x1="35" y1="5"  x2="35" y2="28" stroke={color} strokeWidth={swInner} />
        <line x1="50" y1="5"  x2="50" y2="28" stroke={color} strokeWidth={swInner} />
        <line x1="65" y1="5"  x2="65" y2="28" stroke={color} strokeWidth={swInner} />
        <line x1="80" y1="5"  x2="80" y2="28" stroke={color} strokeWidth={swInner} />
        {/* black keys (three then two) */}
        <rect x="13" y="5"  width="9" height="14" fill={color} />
        <rect x="28" y="5"  width="9" height="14" fill={color} />
        <rect x="58" y="5"  width="9" height="14" fill={color} />
        <rect x="73" y="5"  width="9" height="14" fill={color} />
        <rect x="88" y="5"  width="7" height="14" fill={color} />
        <text x="50" y="62" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="40"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    // seal-soccer: a single pentagon (the trademark soccer-ball patch) sits
    // in the lower-right where the chop dot lives, with KA in the middle.
    // The pentagon is filled so it reads even at 32 px. Surrounding short
    // lines hint at the adjacent hexagon seams of a Telstar ball.
    "seal-soccer": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram with soccer-ball motif. ${caption}`}>
        <rect x="5" y="5" width="90" height="90" stroke={color} strokeWidth={sw} fill="none" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="42"
              fill={color} letterSpacing="-1">KA</text>
        <polygon points="82,73 90,79 87,89 77,89 74,79"
                 fill={color} />
        <line x1="74" y1="79" x2="68" y2="76" stroke={color} strokeWidth={swInner} />
        <line x1="90" y1="79" x2="95" y2="76" stroke={color} strokeWidth={swInner} />
        <line x1="82" y1="73" x2="82" y2="68" stroke={color} strokeWidth={swInner} />
      </svg>
    ),
    // --- Lines family --------------------------------------------------
    // A square implied by line segments of *varying lengths* lying on the
    // four sides. Stroke width is uniform; only segment length and the
    // rhythm of gaps vary between the three variants. KA sits centered.
    // Pattern arrays (LINES_RHYTHM / LINES_STACCATO / LINES_MIXED) live at
    // module scope above.
    "seal-lines-rhythm": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, line-rhythm square. ${caption}`}>
        {LINES_RHYTHM.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke={color} strokeWidth={sw} strokeLinecap="square" />
        ))}
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="40"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    "seal-lines-staccato": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, staccato line square. ${caption}`}>
        {LINES_STACCATO.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke={color} strokeWidth={sw} strokeLinecap="square" />
        ))}
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="40"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
    "seal-lines-mixed": (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`KA monogram, mixed-rhythm line square. ${caption}`}>
        {LINES_MIXED.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke={color} strokeWidth={sw} strokeLinecap="square" />
        ))}
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
              fontFamily='"Source Serif 4", serif' fontWeight="600" fontSize="40"
              fill={color} letterSpacing="-1">KA</text>
      </svg>
    ),
  };
  const svgEl = variants[style] || variants["seal-square"];

  if (!showCaption) {
    // Bare logo for header / favicon / inline use.
    return <span className="ps-logo" style={{ display: "inline-flex", lineHeight: 0 }}>{svgEl}</span>;
  }
  return (
    <div className="ps-logo" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {svgEl}
      <div style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(20,19,15,0.55)",
        textAlign: "center",
      }}>
        {caption}
      </div>
    </div>
  );
}

// -- Print + reduced-motion stylesheet ---------------------------------------
// Inline React styles can't host @media rules; this stylesheet handles them.
// Selectors target stable `ps-*` className hooks rendered below.
const PS_GLOBAL_CSS = `
@media (prefers-reduced-motion: reduce) {
  /* Dots and year tabs snap instantly with reduce-motion; cards keep an
     opacity fade (handled inline) so the reveal-on-scroll still reads. */
  .ps-spine-dot, .ps-spine-year { transition: none !important; }
}
@media print {
  .ps-root { background: white !important; color: black !important; max-width: none !important; }
  .ps-page { padding: 0 !important; }
  .ps-print-hide { display: none !important; }
  .ps-spine-rail { display: none !important; }
  .ps-spine-row { display: block !important; margin-bottom: 14px !important; page-break-inside: avoid; }
  .ps-spine-card { opacity: 1 !important; transform: none !important; text-align: left !important; box-shadow: none !important; border: 0 !important; border-left: 2px solid #888 !important; border-radius: 0 !important; padding: 2px 0 2px 16px !important; background: transparent !important; }
  .ps-spine-dot, .ps-spine-mark { display: none !important; }
  .ps-spine-year { display: block !important; padding: 0 0 4px !important; text-align: left !important; color: black !important; font-weight: 600 !important; }
  .ps-root a[href]:not([href^="#"])::after { content: " (" attr(href) ")"; font-size: 0.85em; color: #555; font-family: monospace; }
  .ps-thumb { display: none !important; }
  .ps-project-row { grid-template-columns: 1fr !important; }
}
`;

// -- Styles ------------------------------------------------------------------
const psStyles = {
  // Root is the scroll viewport. v4 moved away from the "natural page scroll"
  // approach because the design-canvas's transform chain made IntersectionObserver
  // unreliable; with the root owning overflow:auto + a local scroll-reveal hook,
  // animations fire correctly whether or not we're nested inside a canvas.
  root: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    scrollBehavior: "smooth",
    background: "var(--ps-bg, #fffdf9)",
    color: "var(--ps-fg, #14130f)",
    fontFamily: 'var(--ps-body, "Source Serif 4", Georgia, serif)',
    fontSize: 16.5,
    lineHeight: 1.55,
    boxSizing: "border-box",
    position: "relative",
  },
  // The maxWidth-960 reading column lives one level inside root so the
  // scroll viewport itself can fill 100% of its container.
  column: {
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
  },

  // Outer page padding (overridden at narrow widths)
  page: { padding: "40px 96px 80px" },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center", // center-align so the small SVG logo lines up with text
    borderBottom: "1px solid var(--ps-rule, #d9d4c7)",
    paddingBottom: 14,
    marginBottom: 40,
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 12,
    color: "var(--ps-muted, #635e52)",
    letterSpacing: "0.02em",
    gap: 18,
    minHeight: 36,
  },
  topNav: { display: "flex", gap: 18 },
  topNavA: { color: "var(--ps-link, #0a4cb3)", textDecoration: "none" },
  topHomeLink: { display: "inline-flex", alignItems: "center", lineHeight: 0, textDecoration: "none" },

  // Hero is now a single column — the seal lives in the header, not here.
  hero: { marginBottom: 64 },
  heroName: {
    fontFamily: 'var(--ps-display, "Source Serif 4", Georgia, serif)',
    fontSize: 56,
    lineHeight: 1.02,
    fontWeight: 500,
    letterSpacing: "-0.015em",
    margin: "0 0 18px",
  },
  heroLine: { fontSize: 20, lineHeight: 1.45, margin: "0 0 18px", maxWidth: 620 },
  heroMeta: {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 12,
    color: "var(--ps-muted, #635e52)",
    letterSpacing: "0.02em",
  },

  sectionH: {
    fontFamily: 'var(--ps-display, "Source Serif 4", Georgia, serif)',
    fontSize: 13.5,
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--ps-fg, #14130f)",
    margin: "0 0 18px",
    paddingBottom: 8,
    borderBottom: "1px solid var(--ps-rule, #d9d4c7)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionMeta: {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.04em",
    textTransform: "none",
    color: "var(--ps-muted, #635e52)",
  },
  block: { marginBottom: 64 },
  aboutP: { margin: "0 0 12px", fontSize: 16.5 },

  link: { color: "var(--ps-link, #0a4cb3)", textDecoration: "underline", textUnderlineOffset: 2 },

  // -- Spine -----------------------------------------------------------------
  spineWrap: { position: "relative", maxWidth: 820, margin: "32px auto 0" },
  spine: {
    position: "absolute", left: "50%", top: 0, bottom: 0, width: 2,
    transform: "translateX(-1px)",
    background: "var(--ps-spine, #d9d2c0)",
  },
  // v4 shrank the middle column from 88 px → 56 px once the year label moved
  // inside the card (see `cardYear` below) — the mid column now hosts only the dot.
  spineRow: { position: "relative", display: "grid", gridTemplateColumns: "1fr 56px 1fr", alignItems: "start", marginBottom: 56 },
  spineRowLast: { marginBottom: 0 },
  spineDot: {
    position: "absolute", left: "50%", width: 14, height: 14,
    transform: "translate(-50%, 0)",
    borderRadius: 999,
    background: "var(--ps-bg, #fffdf9)",
    border: "2px solid var(--ps-rule, #d9d4c7)",
    transition: "background .35s, border-color .35s, box-shadow .35s",
    zIndex: 2,
    // top reduced from 30 → 24 to align with the new in-card year eyebrow.
    top: 24,
  },
  // The middle column is now JUST a track for the dot — the year label
  // moved inside the card (see `cardYear` below) so the dot never
  // collides with text.
  spineMid: { gridColumn: "2 / 3" },
  spineDotOn: {
    background: "var(--ps-spine-accent, #355a85)",
    borderColor: "var(--ps-spine-accent, #355a85)",
    boxShadow: "0 0 0 4px var(--ps-spine-accent-glow, rgba(53,90,133,0.16))",
  },
  spineCard: {
    // position:relative so the mobile lab-mark badge (absolutely positioned
    // inside the card) anchors to the card. No-op for the desktop layout —
    // the card was already in normal flow inside its grid cell.
    position: "relative",
    background: "var(--ps-card, #ffffff)",
    border: "1px solid var(--ps-rule, #d9d4c7)",
    borderRadius: 6,
    padding: "18px 20px",
    opacity: 0,
    transition: "opacity .65s cubic-bezier(.2,.7,.3,1), transform .65s cubic-bezier(.2,.7,.3,1)",
    boxShadow: "0 1px 0 rgba(0,0,0,0.02), 0 10px 24px -16px rgba(20,15,5,0.16)",
  },
  spineCardLeft: { gridColumn: "1 / 2", textAlign: "right", transform: "translateX(-24px)" },
  spineCardRight: { gridColumn: "3 / 4", textAlign: "left", transform: "translateX(24px)" },
  spineCardOn: { opacity: 1, transform: "translateX(0)" },
  // Year label v4 moved inside the card as an uppercase eyebrow above the
  // role, replacing the middle-column tab. Mid column is now dot-only.
  cardYear: {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--ps-muted, #635e52)",
    margin: "0 0 6px",
    // Keep the year clear of the top-right lab-mark badge (24 px wide + 12 px
    // right offset = 36 px). Invisible on left-aligned cards (text already
    // starts from the left); shifts the year inboard on right-aligned cards.
    paddingRight: 36,
    transition: "color .35s",
  },
  cardYearOn: { color: "var(--ps-spine-accent, #355a85)" },
  // Wet / dry lab mark — top-right corner badge inside the card. Absolutely
  // positioned within the card (`spineCard` is `position: relative`). Loaded
  // as <img> so the SVG keeps its own prefers-color-scheme adaptation;
  // doesn't recolor on the spine reveal (the dot already carries that
  // signal). Source files: ./lab-marks-blue/wet-droplet-chop.svg +
  // ./lab-marks-blue/dry-prompt.svg.
  spineMark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    opacity: 0,                                            // hidden until the row enters view; spineMarkOn restores opacity 0.85
    transition: "opacity .65s cubic-bezier(.2,.7,.3,1)",   // matches the card's reveal duration + easing
    zIndex: 2,
  },
  // Applied when useScrollReveal fires inView=true — same trigger as the
  // card slide-in and the dot light-up, so the mark fades in alongside them.
  spineMarkOn: { opacity: 0.85 },

  roleH: {
    fontFamily: 'var(--ps-display, "Source Serif 4", Georgia, serif)',
    fontSize: 18, fontWeight: 600, margin: "0 0 2px",
  },
  roleOrg: { fontSize: 13.5, color: "var(--ps-muted, #635e52)", margin: "0 0 8px", fontStyle: "italic" },
  roleBlurb: { fontSize: 14.5, lineHeight: 1.5, margin: 0 },

  // -- Projects (Paper style) -----------------------------------------------
  projectRow: {
    display: "grid", gridTemplateColumns: "120px 1fr", gap: 28,
    paddingBottom: 22, marginBottom: 22,
    borderBottom: "1px dotted var(--ps-rule, #d9d4c7)",
  },
  projectLast: { borderBottom: "none", marginBottom: 0, paddingBottom: 0 },
  thumb: {
    width: 120, height: 84,
    background: "var(--ps-card, #ffffff)",
    border: "1px solid var(--ps-rule, #d9d4c7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 8,
    boxSizing: "border-box",
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 9.5, color: "rgba(40,30,15,0.55)", letterSpacing: "0.04em",
  },
  thumbImg: {
    width: "100%", height: "100%", objectFit: "contain",
  },
  projTitle: { fontWeight: 600, fontSize: 18, margin: "0 0 4px" },
  projMeta: {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 11, color: "var(--ps-muted, #635e52)",
    letterSpacing: "0.02em", marginBottom: 8, display: "flex", gap: 14, flexWrap: "wrap",
  },
  projVenue: { color: "var(--ps-link, #0a4cb3)" },
  projSummary: { fontSize: 15, lineHeight: 1.5, margin: 0 },
  projTags: {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 11, color: "var(--ps-muted, #635e52)",
    marginTop: 6, letterSpacing: "0.02em",
  },

  // -- Contact ---------------------------------------------------------------
  contactGrid: {
    display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px 24px",
    fontSize: 15.5,
  },
  contactLabel: {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 11.5, letterSpacing: "0.04em", color: "var(--ps-muted, #635e52)",
    textTransform: "uppercase", paddingTop: 4,
  },

  foot: {
    marginTop: 56,
    paddingTop: 14,
    borderTop: "1px solid var(--ps-rule, #d9d4c7)",
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 11, color: "var(--ps-muted, #635e52)",
    display: "flex", justifyContent: "space-between",
  },
};

// -- Responsive overrides ---------------------------------------------------
// Layered onto the desktop styles when the container is narrower than
// 720 px (`isMobile`) or 480 px (`isNarrow`).
function buildResponsive(isMobile, isNarrow) {
  if (!isMobile && !isNarrow) return {};
  return {
    page: { padding: isNarrow ? "24px 18px 56px" : "32px 24px 64px" },
    topRow: { gap: 12, marginBottom: 28 },
    topMidHide: { display: "none" }, // hide the date/location middle blob
    heroName: { fontSize: isNarrow ? 40 : 48 },
    heroLine: { fontSize: 17 },
    spineWrap: { maxWidth: "100%", margin: "20px 0 0" },
    spine: { left: 14, transform: "none" },
    // Mobile: spine moves to a 32 px left rail; card is the only thing in
    // column 2. Year is in the card so no separate row/col is needed for it.
    spineRow: { gridTemplateColumns: "32px 1fr", marginBottom: 32 },
    spineDot: { left: 14, transform: "translate(-50%, 0)", top: 22 },
    // (No spineMark override — badge layout is identical at every breakpoint;
    // the base psStyles.spineMark already carries the top-right badge coords.)
    spineCardLeft: { gridColumn: "2 / 3", textAlign: "left", transform: "translateX(-12px)" },
    spineCardRight: { gridColumn: "2 / 3", textAlign: "left", transform: "translateX(12px)" },
    projectRow: { gridTemplateColumns: "1fr", gap: 14 },
    // Compact mark box: the grid is still a single column (so the thumb sits
    // on its own row above the title) but the box shrinks from full-width to
    // 56 × 40 px — roughly half the desktop 120 × 84, same 1.4 aspect ratio,
    // so the SVG (objectFit: contain) scales identically. Tighter padding
    // gives the small mark more legible inner room.
    thumb: { width: 56, height: 40, padding: 4 },
    contactGrid: { gridTemplateColumns: "1fr", gap: "2px 0" },
    contactLabel: { paddingTop: 10 },
    // Stack the footer: at 375 px the two spans collide under space-between
    // (the left span wraps "abe" to a 2nd line while the date span starts
    // on line 1 of its column, producing "© 2026 kojisunday, may 24…").
    foot: { flexDirection: "column", gap: 6, alignItems: "flex-start" },
  };
}

// -- Scroll-driven reveal ----------------------------------------------------
// IntersectionObserver is unreliable inside the design-canvas's transform
// chain (the root's viewport-space rect is offscreen, so IO callbacks
// never fire). This hook listens to scroll on `scrollRef.current` and
// compares bounding rects directly — works regardless of ancestor
// transforms. Ported from /export-website-v4/.
function useScrollReveal(scrollRef, { threshold = 0.25 } = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const target = ref.current;
    const scroller = scrollRef && scrollRef.current;
    if (!target || !scroller) return;
    let raf = 0;
    let done = false;
    const check = () => {
      raf = 0;
      if (done) return;
      const tr = target.getBoundingClientRect();
      const sr = scroller.getBoundingClientRect();
      // Effective scroller viewport (collapse the bottom 10% so cards
      // reveal a bit before they reach the fold).
      const viewTop = sr.top;
      const viewBot = sr.bottom - sr.height * 0.10;
      const visible = Math.max(0, Math.min(tr.bottom, viewBot) - Math.max(tr.top, viewTop));
      const ratio = tr.height > 0 ? visible / tr.height : 0;
      if (ratio >= threshold) {
        done = true;
        setInView(true);
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(check);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    // Initial check (in case the row is already in view on mount).
    check();
    // Safety fallback — if scroll detection fails entirely, reveal after
    // 8 s so the page is never permanently blank.
    const fallback = setTimeout(() => { if (!done) { done = true; setInView(true); } }, 8000);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [scrollRef, threshold]);
  return [ref, inView];
}

// -- Live header strip (date + Stanford temperature) -----------------------
// Replaces the static "updated YYYY-MM-DD · stanford, ca" string. Date is
// computed from the user's clock; temperature is fetched from Open-Meteo
// (no API key, free). If the fetch fails the temperature half just
// disappears — no error UI.
function PSHeaderStrip({ lowercase = false, stacked = false } = {}) {
  let dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  if (lowercase) dateStr = dateStr.toLowerCase();
  const [temp, setTemp] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    // Stanford, CA: 37.4275, -122.1697
    fetch("https://api.open-meteo.com/v1/forecast?latitude=37.4275&longitude=-122.1697&current=temperature_2m&temperature_unit=celsius")
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        const c = j?.current?.temperature_2m;
        if (typeof c === "number") {
          const f = c * 9 / 5 + 32;
          setTemp({ c: c.toFixed(1), f: f.toFixed(1) });
        }
      })
      .catch(() => { /* swallow — just don't show temp */ });
    return () => { cancelled = true; };
  }, []);
  // stacked = true → date / location / temp each on their own line (footer
  // uses this on narrow widths so the strip never collides with the copyright).
  // stacked = false → one inline run "date · stanford, ca · temp" (the
  // footer's desktop/mid-mobile rendering).
  if (stacked) {
    return (
      <React.Fragment>
        <span>{dateStr}</span><br />
        <span>stanford, ca</span>
        {temp && <React.Fragment><br /><span>{temp.c} °C / {temp.f} °F</span></React.Fragment>}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <span>{dateStr} · stanford, ca</span>
      {temp && <span> · {temp.c} °C / {temp.f} °F</span>}
    </React.Fragment>
  );
}

// -- Spine row -----------------------------------------------------------
// Uses the local scroll-reveal hook so reveals fire as the user scrolls
// inside the artboard (the design canvas's pan/zoom doesn't create a
// usable IntersectionObserver context).
function PSSpineRow({ entry, side, isLast, responsive, reduceMotion, scrollRef }) {
  const [ref, inView] = useScrollReveal(scrollRef, { threshold: 0.25 });
  // In mobile layout both sides collapse to column 2, but the tiny translate
  // direction (slide in from left vs right) is still derived from `side` for
  // visual rhythm. `responsive.spineCardLeft` is only populated when we're in
  // a mobile/narrow breakpoint, so its presence acts as the mobile signal.
  const mobileSide = side === "left" ? responsive.spineCardLeft : responsive.spineCardRight;
  const desktopSide = side === "left" ? psStyles.spineCardLeft : psStyles.spineCardRight;
  const sideStyle = mobileSide || desktopSide;

  // Layer the card style:
  //   base (opacity 0 + slide-in transform) → side override → inView override →
  //   reduce-motion override (if active: drop the horizontal translate, keep
  //   the opacity fade — W3C's "reduce" allows opacity transitions, and the
  //   reveal-on-scroll is part of the design's information hierarchy).
  const baseCard = { ...psStyles.spineCard, ...sideStyle };
  const onCard = inView ? psStyles.spineCardOn : {};
  const reducedMotionOverride = reduceMotion
    ? { transform: "none", transition: "opacity .3s ease-out" }
    : {};
  const cardStyle = { ...baseCard, ...onCard, ...reducedMotionOverride };

  const rowStyle = { ...psStyles.spineRow, ...(responsive.spineRow || {}), ...(isLast ? psStyles.spineRowLast : {}) };
  const dotStyle = { ...psStyles.spineDot, ...(responsive.spineDot || {}), ...(inView ? psStyles.spineDotOn : {}) };

  const ariaLabel = `${entry.period}, ${entry.role} at ${entry.org}`;
  const yearStyleInCard = { ...psStyles.cardYear, ...(inView ? psStyles.cardYearOn : {}) };

  // Lab mark is a top-right corner badge inside the card at every breakpoint.
  // Reveal mirrors the card: base is invisible, spineMarkOn fades it in when
  // the IO fires, reduce-motion shortens the transition. No side-of-dot
  // positioning and no responsive override to layer in.
  const onMark = inView ? psStyles.spineMarkOn : {};
  const reducedMotionMark = reduceMotion ? { transition: "opacity .3s ease-out" } : {};
  const markStyle = { ...psStyles.spineMark, ...onMark, ...reducedMotionMark };

  const markImg = entry.lab && (
    <img
      className="ps-spine-mark"
      src={entry.lab === "wet" ? "./lab-marks-blue/wet-droplet-chop.svg?v=6" : "./lab-marks-blue/dry-prompt.svg?v=2"}
      width="24" height="24"
      alt={`${entry.lab} lab`}
      style={markStyle}
    />
  );

  return (
    <div ref={ref} className="ps-spine-row" style={rowStyle}>
      <div className="ps-spine-dot" role="img" aria-label={ariaLabel} style={dotStyle} />
      <div className="ps-spine-card" style={cardStyle}>
        {markImg}
        <div className="ps-spine-year" style={yearStyleInCard}>{entry.period}</div>
        <h3 style={psStyles.roleH}>{entry.isPlaceholder ? <Ph>{entry.role}</Ph> : entry.role}</h3>
        <p style={psStyles.roleOrg}>{entry.isPlaceholder ? <Ph>{entry.org}</Ph> : entry.org} · {entry.location}</p>
        <p style={psStyles.roleBlurb}>{entry.isPlaceholder ? <Ph>{entry.blurb}</Ph> : entry.blurb}</p>
      </div>
    </div>
  );
}

// -- Main component ---------------------------------------------------------
function PaperSpine({ tweaks = {} }) {
  const c = window.CONTENT;
  const dark = tweaks.theme === "dark";
  const accent = tweaks.accent || "#0a4cb3";
  // The spine timeline has its own accent (slate-blue) so it stays cool/
  // archival even if the rest of the page uses a brighter `accent` link
  // color. Tweak `spineAccent` to override.
  const spineAccent = tweaks.spineAccent || "#355a85";
  // rootRef = the scroll viewport (also the scroll-reveal root for the spine).
  const rootRef = React.useRef(null);
  const containerWidth = useContainerWidth(rootRef);
  const reduceMotion = useReducedMotion();

  // Capture wheel + touchmove on the scroll viewport so the design-canvas's
  // pan/zoom doesn't steal them. Without this, scrolling inside the artboard
  // pans the canvas instead of scrolling the inner page; stopPropagation
  // (with capture: true) lets the overflow:auto root behave like a normal
  // scrollable webpage. Listeners are passive so we don't block native scroll.
  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const stop = (e) => { e.stopPropagation(); };
    node.addEventListener("wheel", stop, { passive: true, capture: true });
    node.addEventListener("touchmove", stop, { passive: true, capture: true });
    return () => {
      node.removeEventListener("wheel", stop, { capture: true });
      node.removeEventListener("touchmove", stop, { capture: true });
    };
  }, []);

  // Only flip to responsive after measurement (>0 guard) — otherwise the
  // first paint would show a mobile layout even on desktop.
  const isMobile = containerWidth > 0 && containerWidth < 720;
  const isNarrow = containerWidth > 0 && containerWidth < 480;
  const responsive = buildResponsive(isMobile, isNarrow);

  const logoColor = tweaks.logoColor || "#14130f";
  const logoStyle = tweaks.logoStyle || "seal-square";

  const vars = {
    "--ps-bg": dark ? "#16140f" : "#fffdf9",
    "--ps-fg": dark ? "#ece6d6" : "#14130f",
    "--ps-muted": dark ? "#8a8472" : "#635e52",
    "--ps-rule": dark ? "#2c2820" : "#d9d4c7",
    "--ps-card": dark ? "#1c1a14" : "#ffffff",
    "--ps-spine": dark ? "#3a3528" : "#d9d2c0",
    "--ps-link": accent,
    "--ps-accent": accent,
    "--ps-accent-glow": `${accent}29`,
    "--ps-spine-accent": spineAccent,
    "--ps-spine-accent-glow": `${spineAccent}29`,
    "--ps-display": tweaks.headingFont,
    "--ps-body": tweaks.headingFont,
  };

  return (
    <div ref={rootRef} className="ps-root" style={{ ...psStyles.root, ...vars }}>
      <style>{PS_GLOBAL_CSS}</style>
      <div className="ps-column" style={psStyles.column}>
      <div className="ps-page" style={{ ...psStyles.page, ...(responsive.page || {}) }}>

        {/* top bar — small seal logo replaces the "koji abe" wordmark.
            Date/location moved to the footer (PSHeaderStrip) in v5. */}
        <div className="ps-print-hide" style={{ ...psStyles.topRow, ...(responsive.topRow || {}) }}>
          <a href="#top" style={psStyles.topHomeLink} aria-label="Koji Abe — home">
            <LogoBlock color={logoColor} style={logoStyle} size={32} showCaption={false} />
          </a>
          <nav style={psStyles.topNav}>
            <a href="#about" style={psStyles.topNavA}>about</a>
            <a href="#career" style={psStyles.topNavA}>career</a>
            <a href="#projects" style={psStyles.topNavA}>projects</a>
            <a href="#contact" style={psStyles.topNavA}>contact</a>
          </nav>
        </div>

        {/* hero — single column, no logo block here anymore */}
        <header id="top" style={{ ...psStyles.hero, ...(responsive.hero || {}) }}>
          <h1 style={{ ...psStyles.heroName, ...(responsive.heroName || {}) }}>Koji Abe</h1>
          <p style={{ ...psStyles.heroLine, ...(responsive.heroLine || {}) }}>
            Research data scientist — built rapid diagnostics in industry, supporting AI research infrastructure now.
          </p>
          <div style={psStyles.heroMeta}>
            stanford, ca · <a href={`mailto:${c.links.email}`} style={psStyles.link}>{c.links.email}</a>
          </div>
        </header>

        {/* About */}
        <section style={psStyles.block} id="about">
          <h2 style={psStyles.sectionH}>
            <span>About</span>
            <span style={psStyles.sectionMeta}>short</span>
          </h2>
          <p style={psStyles.aboutP}>{c.longBioParagraphs[0]}</p>
          <p style={psStyles.aboutP}>{c.longBioParagraphs[1]}</p>
          {/* paragraph[3]: wet-lab origins + COVID-19 rapid test FDA EUA */}
          <p style={psStyles.aboutP}>{c.longBioParagraphs[3]}</p>
        </section>

        {/* Now */}
        <section style={psStyles.block} id="now">
          <h2 style={psStyles.sectionH}>
            <span>Now</span>
            <span style={psStyles.sectionMeta}>2026-04 —</span>
          </h2>
          <p style={psStyles.aboutP}><Ph>{c.now.text}</Ph></p>
        </section>

        {/* Career path — Spine timeline */}
        <section style={psStyles.block} id="career">
          <h2 style={psStyles.sectionH}>
            <span>Career path</span>
            <span style={psStyles.sectionMeta}>{c.careerTimeline.length} stops · scroll</span>
          </h2>
          <div style={{ ...psStyles.spineWrap, ...(responsive.spineWrap || {}) }}>
            <div className="ps-spine-rail" style={{ ...psStyles.spine, ...(responsive.spine || {}) }} />
            {c.careerTimeline.map((entry, i) => (
              <PSSpineRow
                key={entry.id}
                entry={entry}
                side={i % 2 === 0 ? "right" : "left"}
                isLast={i === c.careerTimeline.length - 1}
                responsive={responsive}
                reduceMotion={reduceMotion}
                scrollRef={rootRef}
              />
            ))}
          </div>
        </section>

        {/* Projects */}
        <section style={psStyles.block} id="projects">
          <h2 style={psStyles.sectionH}>
            <span>Selected projects</span>
            <span style={psStyles.sectionMeta}>{c.projects.length}</span>
          </h2>
          {c.projects.map((p, i) => (
            <div key={p.slug} className="ps-project-row" style={{ ...psStyles.projectRow, ...(responsive.projectRow || {}), ...(i === c.projects.length - 1 ? psStyles.projectLast : {}) }}>
              <div className="ps-thumb" style={{ ...psStyles.thumb, ...(responsive.thumb || {}) }} role="img" aria-label={`${p.title} mark`}>
                {p.mark
                  ? <img src={p.mark} alt="" style={psStyles.thumbImg} />
                  : <span>{p.slug}.png</span>}
              </div>
              <div>
                <h3 style={psStyles.projTitle}>{p.isPlaceholder ? <Ph>{p.title}</Ph> : p.title}</h3>
                <div style={psStyles.projMeta}>
                  <span>{p.year}</span>
                  <span style={psStyles.projVenue}>{p.role}</span>
                  <span>{p.status}</span>
                  {p.paperUrl && <a href={p.paperUrl} style={psStyles.link} target="_blank" rel="noopener">paper →</a>}
                </div>
                <p style={psStyles.projSummary}>{p.isPlaceholder ? <Ph>{p.summary}</Ph> : p.summary}</p>
                <div style={psStyles.projTags}>{p.tags.map(t => `[${t}]`).join("  ")}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Off the clock — supplemental personal info */}
        <section style={psStyles.block} id="off-the-clock">
          <h2 style={psStyles.sectionH}>
            <span>Off the clock</span>
            <span style={psStyles.sectionMeta}>personal</span>
          </h2>
          <p style={psStyles.aboutP}>
            {c.offTheClock.isPlaceholder ? <Ph>{c.offTheClock.text}</Ph> : c.offTheClock.text}
            {" "}
            <a href={c.offTheClock.blogUrl} style={psStyles.link} target="_blank" rel="noopener">
              {c.offTheClock.isPlaceholder
                ? <Ph>{`${c.offTheClock.blogLabel} →`}</Ph>
                : `${c.offTheClock.blogLabel} →`}
            </a>
          </p>
        </section>

        {/* Elsewhere */}
        <section style={psStyles.block} id="contact">
          <h2 style={psStyles.sectionH}>
            <span>Elsewhere</span>
            <span style={psStyles.sectionMeta}>i reply</span>
          </h2>
          <div style={{ ...psStyles.contactGrid, ...(responsive.contactGrid || {}) }}>
            <div style={{ ...psStyles.contactLabel, ...(responsive.contactLabel || {}) }}>email</div>
            <div><a href={`mailto:${c.links.email}`} style={psStyles.link}>{c.links.email}</a></div>
            <div style={{ ...psStyles.contactLabel, ...(responsive.contactLabel || {}) }}>linkedin</div>
            <div><a href={c.links.linkedin.url} style={psStyles.link} target="_blank" rel="noopener">koji-abe-uw-bioe</a></div>
            <div style={{ ...psStyles.contactLabel, ...(responsive.contactLabel || {}) }}>scholar</div>
            <div><a href={c.links.scholar.url} style={psStyles.link} target="_blank" rel="noopener">Koji Abe</a></div>
          </div>
        </section>

        <footer className="ps-print-hide" style={{ ...psStyles.foot, ...(responsive.foot || {}) }}>
          <span>© 2026 koji abe</span>
          <span><PSHeaderStrip lowercase stacked={isNarrow} /></span>
        </footer>
      </div>
      </div>
    </div>
  );
}

window.PaperSpine = PaperSpine;
window.LogoBlock = LogoBlock;
