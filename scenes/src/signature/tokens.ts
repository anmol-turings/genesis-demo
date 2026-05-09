export const COLORS = {
  bgOuter: '#F2EDE3',
  bgCard: '#0B1220',
  bgCardGlow: '#142036',
  ink: '#F5EFE0',
  inkDim: '#8FA3B8',
  inkFaint: '#3A4A5E',
  before: '#6B8294',
  after: '#E8B86D',
  accent: '#FF7A59',
  accentCool: '#5BC0BE',
} as const;

export const STROKE = {
  hairline: 1,
  thin: 2,
  medium: 4,
  heavy: 8,
} as const;

export const TYPE = {
  family: 'Inter, system-ui, sans-serif',
  title: {size: 56, weight: 700, tracking: '-0.02em'},
  subtitle: {size: 28, weight: 400, tracking: '0'},
  label: {size: 22, weight: 500, tracking: '0.04em'},
  annotation: {size: 18, weight: 400, tracking: '0'},
} as const;

export const TIMING = {
  total: 240,
  titleIn: {start: 0, end: 30},
  before: {start: 30, end: 90},
  after: {start: 90, end: 180},
  hold: {start: 180, end: 240},
} as const;

export const EASING = {
  outExpo: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const LAYOUT = {
  canvas: 1080,
  outerMargin: 40,
  cardSize: 1000,
  cardPadding: 64,
  visualRegionRatio: 0.65,
  typeRegionRatio: 0.35,
} as const;

export const DASH = {
  before: '8 6',
} as const;
