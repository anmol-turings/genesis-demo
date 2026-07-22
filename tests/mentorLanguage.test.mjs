// node --test tests/
// Unit tests for the post-generation mentor language guard and the
// retry/fallback decision logic it drives in app/page.js generateMentor.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  violatesMentorLanguage,
  SAFE_FALLBACK_BRIDGE,
} from "../lib/mentorLanguage.mjs";

// ── forbidden clinical vocabulary ────────────────────────────────────────
const CLINICAL_SAMPLES = [
  "Your assessment shows real progress today.",
  "This is a symptom of something deeper.",
  "These symptoms will fade with practice.",
  "We treat this like a patient in recovery.",
  "You have been diagnosed by your own body.",
  "The diagnosis writes itself in your sleep.",
  "You are burned out, and the work knows it.",
  "Burnout is the body's last honest word.",
  "Classic burn-out — the ledger came due.",
  "Your prognosis is good if you rest.",
  "Your risk score has been falling.",
  "This recovery program asks little of you.",
  "An anxiety disorder is not a verdict.",
  "The treatment is rest, taken seriously.",
];

for (const s of CLINICAL_SAMPLES) {
  test(`flags clinical vocabulary: "${s.slice(0, 40)}..."`, () => {
    assert.equal(violatesMentorLanguage(s), true);
  });
}

// ── diagnostic certainty ────────────────────────────────────────────────
const CERTAINTY_SAMPLES = [
  "This means you are losing ground.",
  "The diagnosis is exhaustion, plainly.",
  "You are depressed, and it shows.",
  "You are anxious because the work never stops.",
  "You are broken in a way rest cannot reach.",
];

for (const s of CERTAINTY_SAMPLES) {
  test(`flags diagnostic certainty: "${s.slice(0, 40)}..."`, () => {
    assert.equal(violatesMentorLanguage(s), true);
  });
}

// ── compliant mythic/journey copy must pass ─────────────────────────────
const CLEAN_SAMPLES = [
  "Notice what today made *available* — that is enough to build on.",
  "You may be noticing the body asking for slowness. We honour it.",
  "Rest is a practice, not an absence. We learn to enter it on purpose.",
  "Recovery between training sessions is where the strength is built.", // 'recovery' alone is allowed
  "The ride continues. The next quarter mile is enough.",
  "A part of you called The Withdrawn has been protecting the rest.",
  "Your answers suggest a useful place to begin.",
  "Sleep is the lever. We learn to pull it cleanly. [concept:body]",
  "The burning question is what you want next.", // 'burn' must not false-positive
  "You are becoming someone steadier.", // 'you are' alone must not false-positive
];

for (const s of CLEAN_SAMPLES) {
  test(`passes clean copy: "${s.slice(0, 40)}..."`, () => {
    assert.equal(violatesMentorLanguage(s), false);
  });
}

// ── edge cases + fallback path invariants ───────────────────────────────
test("handles empty and nullish input without throwing", () => {
  assert.equal(violatesMentorLanguage(""), false);
  assert.equal(violatesMentorLanguage(null), false);
  assert.equal(violatesMentorLanguage(undefined), false);
});

test("case-insensitive matching", () => {
  assert.equal(violatesMentorLanguage("YOUR ASSESSMENT IS COMPLETE"), true);
  assert.equal(violatesMentorLanguage("Diagnosis: tired"), true);
});

test("the safe fallback bridge itself passes the guard", () => {
  assert.equal(violatesMentorLanguage(SAFE_FALLBACK_BRIDGE), false);
});

test("the fallback bridge carries emphasis and works with a concept tag appended", () => {
  // generateMentor appends "[concept:default]" — the combined string must
  // still pass the guard and contain the *emphasis* marker AnimatedText uses.
  const finalRaw = `${SAFE_FALLBACK_BRIDGE} [concept:default]`;
  assert.equal(violatesMentorLanguage(finalRaw), false);
  assert.match(SAFE_FALLBACK_BRIDGE, /\*[^*]+\*/);
  assert.match(finalRaw, /\[concept:default\]/);
});

// ── retry/fallback decision logic (mirrors generateMentor step 6) ───────
async function resolveBridge(fetchMentorMock) {
  let raw = await fetchMentorMock(1);
  if (violatesMentorLanguage(raw)) {
    raw = await fetchMentorMock(2);
    if (violatesMentorLanguage(raw)) {
      raw = `${SAFE_FALLBACK_BRIDGE} [concept:default]`;
    }
  }
  return raw;
}

test("clean first attempt: no retry", async () => {
  let calls = 0;
  const out = await resolveBridge(async () => { calls++; return "A steady step today. [concept:body]"; });
  assert.equal(calls, 1);
  assert.equal(out, "A steady step today. [concept:body]");
});

test("violating first attempt: retried once, clean retry accepted", async () => {
  let calls = 0;
  const out = await resolveBridge(async (n) => {
    calls++;
    return n === 1 ? "Your burnout diagnosis is clear." : "A steadier rhythm is forming. [concept:body]";
  });
  assert.equal(calls, 2);
  assert.equal(out, "A steadier rhythm is forming. [concept:body]");
});

test("both attempts violate: safe fallback substituted", async () => {
  let calls = 0;
  const out = await resolveBridge(async () => { calls++; return "This means you are burned out."; });
  assert.equal(calls, 2);
  assert.equal(out, `${SAFE_FALLBACK_BRIDGE} [concept:default]`);
  assert.equal(violatesMentorLanguage(out), false);
});
