import {Easing} from 'remotion';

// ═══════════════════════════════════════════════════════════════════════
// EASINGS — named bezier curves for specific motion characters.
//
// Pick by intent, not by name:
//   - reveals      → easeOutCubic (snappy entrance, slow settle)
//   - exits        → easeInCubic  (slow start, snappy out)
//   - settling     → easeInOutQuint (slow at both ends)
//   - cinematic    → easeInOutCubic (the most universal)
//   - punctuation  → snap (very abrupt, for emphasis beats)
//   - anticipate   → for motions with a small preparatory pull-back
// ═══════════════════════════════════════════════════════════════════════

export const EASE = {
  linear:         Easing.linear,
  easeOut:        Easing.bezier(0.16, 1.0, 0.3, 1.0),    // smooth deceleration
  easeIn:         Easing.bezier(0.7, 0.0, 0.84, 0.0),    // smooth acceleration
  easeInOut:      Easing.bezier(0.65, 0.0, 0.35, 1.0),   // standard cinematic
  easeOutCubic:   Easing.bezier(0.33, 1.0, 0.68, 1.0),   // common UI reveal
  easeInOutCubic: Easing.bezier(0.65, 0.0, 0.35, 1.0),   // alias for cinematic
  easeInOutQuint: Easing.bezier(0.83, 0.0, 0.17, 1.0),   // dramatic, slow at edges
  snap:           Easing.bezier(0.85, 0.0, 0.15, 1.0),   // emphasis cuts
  anticipate:     Easing.bezier(0.4, -0.4, 0.6, 1.4),    // overshoot + return
};

// Spring presets — for organic, physics-feeling motion (use Remotion's spring())
export const SPRING = {
  gentle:  {damping: 18, mass: 1.0, stiffness: 90},   // soft, slow
  normal:  {damping: 14, mass: 1.0, stiffness: 120},  // standard
  snappy:  {damping: 10, mass: 0.8, stiffness: 180},  // alert
  bouncy:  {damping: 8,  mass: 1.0, stiffness: 200},  // playful
};
