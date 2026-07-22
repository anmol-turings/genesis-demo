// Post-generation language guard for mentor output. The system prompt
// forbids clinical vocabulary, but the model can still slip — so nothing
// generated is rendered, voiced, or cached without passing this check.
// Consumed by app/page.js (one corrective retry, then the safe fallback).

export const CLINICAL_LANGUAGE_RE = /\b(assessment|assessed|diagnos\w*|symptom\w*|disorder\w*|treatment\w*|patient\w*|burn(?:ed|t)?[ -]?out|prognosis|risk score|recovery program)\b/i;
export const DIAGNOSTIC_CERTAINTY_RE = /\b(this means you|the diagnosis|you are (?:depressed|anxious|ill|sick|broken))\b/i;
export const SAFE_FALLBACK_BRIDGE = "Notice what today is *offering* you — a small place to begin is enough.";

export function violatesMentorLanguage(text) {
  return CLINICAL_LANGUAGE_RE.test(text || "") || DIAGNOSTIC_CERTAINTY_RE.test(text || "");
}
