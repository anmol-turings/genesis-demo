// ═══════════════════════════════════════════════════════════════════════
// PALETTE — locked tokens for the Genesis visual language.
// Use these everywhere. Never inline hex values in scenes.
// ═══════════════════════════════════════════════════════════════════════

export const PALETTE = {
  // Voids
  void: '#020205',       // deepest black, sits behind everything
  deep: '#06060a',       // primary background
  slate: '#0f0f1a',      // surfaces

  // Golds (the brand spine)
  goldDim: '#7a6230',    // muted gold, used for fine line work
  gold: '#c9a84c',       // primary gold
  goldLight: '#e8c97a',  // highlight gold
  cream: '#f0e8d4',      // warmest text

  // Realm colors
  body: '#c9a84c',       // gold (Body Under Siege)
  withdrawn: '#5fa0d4',  // cool blue (Withdrawn Self)
  heart: '#7abcae',      // teal (Heart in Hiding)
  scattered: '#a06ac4',  // purple (Scattered Mind)
  hollow: '#c4884a',     // copper (Hollow Work)

  // Warm ember (used by Embers scene)
  ember: '#d97a3a',
  emberCore: '#f0c060',

  // Ice / water
  iceWarm: '#e8c97a',
  iceCool: '#9aa8c8',
  iceShadow: '#1a2238',
  waterTop: '#0a1024',
  waterDeep: '#04060f',
  fog: '#0e1426',

  // Text
  silver: '#a8a8b8',
  mist: '#7a7a90',
} as const;

// Semantic aliases for scene roles
export const ROLE = {
  surfaceLine: PALETTE.gold,
  emphasisGlow: PALETTE.goldLight,
  bodyText: PALETTE.cream,
  metaText: PALETTE.goldDim,
  ambient: PALETTE.silver,
} as const;
