// node --test tests/
// Scoring, credit caps and completion rules for the rotating cohort
// challenge scorecard. Nothing here should ever produce a per-participant
// ranking — the assertions at the bottom guard that.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  COHORT_SIZE,
  METRIC_POOL,
  METRIC_CATEGORIES,
  DETALYTICS_ROTATION_POOL,
  WEEKLY_CHALLENGES,
  getActiveChallenge,
  getPastChallenges,
  getMetric,
  activeMetricIds,
  metricSource,
  SOURCE_LABEL,
  MEASUREMENT_LABEL,
  CONTRIBUTION_EVENTS,
  recordContribution,
  creditsForMetric,
  isCheckoutCreditable,
  isReflectionCreditable,
  computeChallengeState,
  summarizeContribution,
  metricProgress,
  isCategoryRecording,
  overallFromPercents,
  publishChallenge,
  PROGRAM_SNAPSHOT,
} from "../lib/config/challenge.mjs";

const active = getActiveChallenge();

// ── configuration shape ─────────────────────────────────────────────────

test("exactly one challenge is active", () => {
  assert.equal(WEEKLY_CHALLENGES.filter(c => c.status === "active").length, 1);
  assert.ok(active);
  assert.equal(getPastChallenges().length, WEEKLY_CHALLENGES.length - 1);
});

test("the active challenge has 1-3 client metrics and one Detalytics metric", () => {
  assert.ok(active.clientMetricIds.length >= 1 && active.clientMetricIds.length <= 3);
  assert.ok(active.detalyticsMetricId);
  assert.ok(!active.clientMetricIds.includes(active.detalyticsMetricId));
});

test("every metric in the pool is fully specified", () => {
  const categoryIds = new Set(METRIC_CATEGORIES.map(c => c.id));
  for (const m of METRIC_POOL) {
    assert.ok(m.id && m.name, `${m.id} needs an id and a name`);
    assert.ok(categoryIds.has(m.category), `${m.id} has an unknown category`);
    assert.ok(["system_recorded", "participant_reported"].includes(m.measurementType));
    assert.ok(m.cadence);
    assert.ok(m.participantCap && Object.keys(m.participantCap).length > 0);
    assert.ok(m.target >= 1);
    assert.ok(m.howMeasured);
    assert.equal(typeof m.dataAvailable, "boolean", `${m.id} must declare dataAvailable`);
    // A metric with no data source must not carry a fabricated baseline.
    if (!m.dataAvailable) {
      assert.equal(m.baselinePercent, 0, `${m.id} has no data source but ships a baseline`);
      assert.ok(m.dataNote, `${m.id} must explain why it has no data`);
    }
  }
});

test("the Detalytics rotation pool never reaches personal or inferred data", () => {
  // Rotation metrics may only count things a participant *did*. These are
  // the categories of doing; no category reads a check-in response, a
  // wellbeing figure, or an inferred state.
  const ACTIVITY_CATEGORIES = new Set([
    "daily_rhythm", "focus_reset", "connection_work", "learning",
    "knowledge_checks", "reflection", "conversation_checkout",
    "return_after_absence",
  ]);
  for (const id of DETALYTICS_ROTATION_POOL) {
    const metric = getMetric(id);
    assert.ok(metric, `${id} is not in the metric pool`);
    assert.ok(ACTIVITY_CATEGORIES.has(metric.category), `${id} is not an activity metric`);
    // Reflection may be counted, but its text must never be the measure.
    assert.ok(
      !/response text|what (they|the participant) wrote|wellbeing|inferred/i.test(metric.howMeasured),
      `${id} appears to read personal content`
    );
  }
});

test("client and Detalytics metrics are distinguishable", () => {
  for (const id of active.clientMetricIds) {
    assert.equal(metricSource(active, id), "client");
    assert.equal(SOURCE_LABEL.client, "Selected by your program");
  }
  assert.equal(metricSource(active, active.detalyticsMetricId), "detalytics");
  assert.equal(SOURCE_LABEL.detalytics, "Selected by Detalytics");
  assert.equal(MEASUREMENT_LABEL.system_recorded, "Recorded in the app");
  assert.equal(MEASUREMENT_LABEL.participant_reported, "Participant-reported");
});

// ── scoring ─────────────────────────────────────────────────────────────

test("overall progress is the mean of the active metric percentages", () => {
  const state = computeChallengeState(active, []);
  assert.equal(state.metrics.length, activeMetricIds(active).length);
  const mean =
    state.metrics.reduce((s, m) => s + m.exactPercent, 0) / state.metrics.length;
  assert.equal(state.overallPercent, Math.round(mean));
});

test("the brief's worked example scores 65%", () => {
  // Daily rhythm 72, learning 58, return 64 → 64.67 → 65
  assert.equal(overallFromPercents([72, 58, 64]), 65);
});

test("the active week's metrics can all actually be recorded", () => {
  // Nothing on a participant-facing screen should show a cohort figure for
  // something the build cannot observe.
  for (const m of computeChallengeState(active, []).metrics) {
    assert.equal(m.dataAvailable, true, `${m.id} is in the live week but records nothing`);
  }
});

test("a metric with no data source shows no percentage and is not scored", () => {
  const withLearning = {
    id: "example",
    targetPercent: 70,
    clientMetricIds: ["steady-rhythm-three-days", "learning-one-node"],
    detalyticsMetricId: "return-after-absence",
  };
  const state = computeChallengeState(withLearning, []);
  const learning = state.metrics.find(m => m.id === "learning-one-node");
  assert.equal(learning.scored, false);
  assert.equal(learning.progressPercent, null, "no invented percentage");
  assert.equal(learning.exactPercent, null);
  assert.ok(learning.dataNote);
  // Left out of the mean rather than dragged in as a zero.
  assert.equal(state.scoredMetrics.length, 2);
  assert.equal(state.unscoredMetrics.length, 1);
  assert.equal(state.overallPercent, overallFromPercents([72, 64]));
  assert.notEqual(state.overallPercent, overallFromPercents([72, 0, 64]));
});

test("all active metrics carry equal weight", () => {
  const withCredit = computeChallengeState(active, [
    { challengeId: active.id, metricId: "reflection-submitted", sourceEvent: "reflection", day: 1 },
  ]);
  const base = computeChallengeState(active, []);
  const lift =
    withCredit.metrics.find(m => m.id === "reflection-submitted").exactPercent -
    base.metrics.find(m => m.id === "reflection-submitted").exactPercent;
  // A single participant's whole share of a 1-per-week metric.
  assert.ok(Math.abs(lift - 100 / COHORT_SIZE) < 1e-9);
  // And it moves the overall by exactly its equal share of the mean.
  assert.ok(
    Math.abs(
      withCredit.overallExact - base.overallExact - lift / base.scoredMetrics.length
    ) < 1e-9
  );
});

test("a participant's contribution is capped at their own normalized share", () => {
  const metric = getMetric("steady-rhythm-three-days");
  const atTarget = metricProgress(metric, 3);
  const wayOver = metricProgress(metric, 40);
  assert.equal(atTarget, wayOver, "extra activity beyond the target adds nothing");
  assert.ok(wayOver - metric.baselinePercent <= 100 / COHORT_SIZE + 1e-9);
});

test("displayed percentages are whole numbers", () => {
  const state = computeChallengeState(active, [
    { challengeId: active.id, metricId: "steady-rhythm-three-days", sourceEvent: "path_activity", day: 1 },
  ]);
  for (const m of state.scoredMetrics) assert.equal(m.progressPercent, Math.round(m.progressPercent));
  assert.equal(state.overallPercent, Math.round(state.overallPercent));
});

test("milestones are reached by overall progress, not by any person", () => {
  const state = computeChallengeState(active, []);
  for (const ms of state.milestones) {
    assert.equal(ms.reached, state.overallPercent >= ms.atPercent);
  }
});

// ── credit caps ─────────────────────────────────────────────────────────

const rec = (ledger, kind, day = 1) =>
  recordContribution(ledger, { kind, day, challengeId: active.id });

test("a Path activity credits once per day", () => {
  let r = rec([], "path_activity", 1);
  assert.equal(r.credited, true);
  r = rec(r.ledger, "path_activity", 1);
  assert.equal(r.credited, false);
  assert.equal(r.reason, "daily_cap_reached");
  r = rec(r.ledger, "path_activity", 2);
  assert.equal(r.credited, true);
  assert.equal(creditsForMetric(r.ledger, active.id, "steady-rhythm-three-days"), 2);
});

test("learning credits twice a week, reflection and conversation once", () => {
  let r = rec([], "learning_node");
  r = rec(r.ledger, "learning_node", 2);
  assert.equal(r.credited, true);
  r = rec(r.ledger, "learning_node", 3);
  assert.equal(r.credited, false);

  let f = rec([], "reflection");
  assert.equal(f.credited, true);
  f = rec(f.ledger, "reflection", 4);
  assert.equal(f.credited, false);

  let c = rec([], "conversation_checkout");
  assert.equal(c.credited, true);
  c = rec(c.ledger, "conversation_checkout", 5);
  assert.equal(c.credited, false);
});

test("a return credits once for the whole challenge", () => {
  let r = rec([], "return_after_absence");
  assert.equal(r.credited, true);
  r = rec(r.ledger, "return_after_absence", 9);
  assert.equal(r.credited, false);
  assert.equal(r.reason, "cap_reached");
});

test("caps stop repeated activity from dominating cohort progress", () => {
  let ledger = [];
  for (let day = 1; day <= 7; day++) {
    for (let i = 0; i < 20; i++) {
      ledger = rec(ledger, "path_activity", day).ledger;
      ledger = rec(ledger, "reflection", day).ledger;
    }
  }
  const state = computeChallengeState(active, ledger, { participantId: "demo" });
  for (const m of state.scoredMetrics) {
    assert.ok(m.exactPercent - m.baselinePercent <= 100 / COHORT_SIZE + 1e-9, `${m.id} exceeded one share`);
  }
});

test("caps are scoped per participant", () => {
  // The ledger is a cohort-wide log. One person hitting a cap must never
  // block anyone else.
  let ledger = [];
  ledger = recordContribution(ledger, { kind: "path_activity", day: 1, participantId: "ana", challengeId: active.id }).ledger;
  const anaAgain = recordContribution(ledger, { kind: "path_activity", day: 1, participantId: "ana", challengeId: active.id });
  assert.equal(anaAgain.credited, false, "ana is at her daily cap");

  const bo = recordContribution(ledger, { kind: "path_activity", day: 1, participantId: "bo", challengeId: active.id });
  assert.equal(bo.credited, true, "bo is unaffected by ana's cap");

  let weekly = [];
  for (const who of ["ana", "bo", "cy"]) {
    const r = recordContribution(weekly, { kind: "reflection", day: 1, participantId: who, challengeId: active.id });
    assert.equal(r.credited, true, `${who} should get their own weekly reflection`);
    weekly = r.ledger;
  }
  assert.equal(
    recordContribution(weekly, { kind: "reflection", day: 3, participantId: "ana", challengeId: active.id }).credited,
    false
  );
  // And a return credits once per person, not once per cohort.
  let returns = [];
  for (const who of ["ana", "bo"]) {
    const r = recordContribution(returns, { kind: "return_after_absence", day: 1, participantId: who, challengeId: active.id });
    assert.equal(r.credited, true);
    returns = r.ledger;
  }
});

test("one participant's share is counted from their own credits only", () => {
  const ledger = [
    { challengeId: active.id, metricId: "reflection-submitted", sourceEvent: "reflection", day: 1, participantId: "ana" },
    { challengeId: active.id, metricId: "reflection-submitted", sourceEvent: "reflection", day: 1, participantId: "bo" },
  ];
  assert.equal(creditsForMetric(ledger, active.id, "reflection-submitted", "ana"), 1);
  assert.equal(creditsForMetric(ledger, active.id, "reflection-submitted"), 2);
  const ana = computeChallengeState(active, ledger, { participantId: "ana" });
  assert.equal(ana.metrics.find(m => m.id === "reflection-submitted").participantCredits, 1);
  const anaSummary = summarizeContribution(active, ledger, "ana");
  assert.equal(anaSummary.find(s => s.kind === "reflection").count, 1);
});

test("recordContribution never mutates the ledger it is given", () => {
  const original = [];
  const r = rec(original, "path_activity");
  assert.equal(original.length, 0);
  assert.equal(r.ledger.length, 1);
});

// ── reflection and conversation completion ──────────────────────────────

test("a reflection counts only after an in-app submission", () => {
  assert.equal(isReflectionCreditable(null), false);
  assert.equal(isReflectionCreditable({ submitted: false, text: "written but not sent" }), false);
  assert.equal(isReflectionCreditable({ submitted: true, text: "   " }), false);
  assert.equal(isReflectionCreditable({ submitted: true, text: "Slept badly, walked anyway." }), true);
  assert.equal(CONTRIBUTION_EVENTS.reflection.verificationType, "app_event");
});

test("a conversation counts only on Yes plus a submitted check-out", () => {
  assert.equal(isCheckoutCreditable(null), false);
  assert.equal(isCheckoutCreditable({ answer: "not_yet", note: "we rescheduled" }), false);
  assert.equal(isCheckoutCreditable({ answer: "prefer_not_to_say", note: "x" }), false);
  assert.equal(isCheckoutCreditable({ answer: "yes", note: "" }), false);
  assert.equal(isCheckoutCreditable({ answer: "yes", note: "It was shorter than I feared." }), true);
});

test("the conversation metric is labelled participant-reported, never verified", () => {
  const metric = getMetric("conversation-checkout");
  assert.equal(metric.measurementType, "participant_reported");
  assert.equal(CONTRIBUTION_EVENTS.conversation_checkout.verificationType, "participant_reported");
  assert.ok(!/verified|objective/i.test(metric.howMeasured));
});

// ── publishing ──────────────────────────────────────────────────────────

test("publishing a draft makes it the live challenge", () => {
  const draft = {
    week: 32,
    title: "Keep the shape of the week",
    description: "The same few things, one more week.",
    targetPercent: 75,
    clientMetricIds: ["steady-rhythm-three-days"],
    detalyticsMetricId: "conversation-checkout",
  };
  const next = publishChallenge(WEEKLY_CHALLENGES, draft, { closingPercent: 66 });

  const nowActive = next.filter(c => c.status === "active");
  assert.equal(nowActive.length, 1, "exactly one week is live");
  assert.equal(nowActive[0].title, draft.title);
  assert.equal(nowActive[0].targetPercent, 75);
  assert.deepEqual(activeMetricIds(nowActive[0]), ["steady-rhythm-three-days", "conversation-checkout"]);
  assert.notEqual(nowActive[0].id, active.id, "it is a different cycle");

  // The week that was live is closed at the figure it had reached.
  const closed = next.find(c => c.id === active.id);
  assert.equal(closed.status, "completed");
  assert.equal(closed.finalPercent, 66);

  // Pure — the configured list is untouched.
  assert.equal(WEEKLY_CHALLENGES.filter(c => c.status === "active").length, 1);
  assert.equal(getActiveChallenge().id, active.id);
});

test("contributions do not carry across a challenge boundary", () => {
  const ledger = recordContribution([], {
    kind: "reflection", day: 1, participantId: "ana", challengeId: active.id,
  }).ledger;
  const draft = {
    week: 32, title: "Next", targetPercent: 70,
    clientMetricIds: ["reflection-submitted"],
    detalyticsMetricId: "return-after-absence",
  };
  const next = publishChallenge(WEEKLY_CHALLENGES, draft, { closingPercent: 60 });
  const newActive = next.find(c => c.status === "active");
  // Credits are keyed by challenge id, so the new week starts from the
  // cohort baseline — which is why the copy must not promise a carry-over.
  assert.equal(creditsForMetric(ledger, newActive.id, "reflection-submitted", "ana"), 0);
  const state = computeChallengeState(newActive, ledger, { participantId: "ana" });
  assert.equal(
    state.metrics.find(m => m.id === "reflection-submitted").participantCredits,
    0
  );
});

// ── privacy ─────────────────────────────────────────────────────────────

test("the private contribution summary stays on the participant's side", () => {
  const ledger = rec([], "reflection").ledger;
  const summary = summarizeContribution(active, ledger);
  const reflection = summary.find(s => s.kind === "reflection");
  assert.equal(reflection.count, 1);
  // Only completion counts travel — no text field exists anywhere in a
  // contribution record.
  for (const c of ledger) {
    assert.deepEqual(
      Object.keys(c).sort(),
      ["challengeId", "day", "metricId", "participantId", "recordedAt", "sourceEvent", "verificationType"]
    );
  }
});

test("nothing in the challenge state carries per-participant identity", () => {
  const state = computeChallengeState(active, rec([], "path_activity").ledger);
  const serialized = JSON.stringify(state);
  assert.ok(!/participantId/.test(serialized));
  assert.ok(!/\bdemo\b/.test(serialized));
});

test("program aggregates never report a figure the build cannot record", () => {
  // A program owner acts on these numbers. Every one of them must come
  // from something the app can actually observe.
  for (const row of PROGRAM_SNAPSHOT.activityByCategory) {
    if (isCategoryRecording(row.categoryId)) {
      assert.equal(typeof row.completionPercent, "number", `${row.categoryId} should report`);
    } else {
      assert.equal(row.completionPercent, null, `${row.categoryId} reports a figure it cannot measure`);
    }
  }
  // Learning has no data source, so no topic may carry a percentage.
  assert.equal(isCategoryRecording("learning"), false);
  for (const row of PROGRAM_SNAPSHOT.learningByTopic) {
    assert.equal(row.completionPercent, null, `${row.topic} reports unmeasured learning`);
  }
  assert.ok(PROGRAM_SNAPSHOT.learningDataNote, "the gap must be explained on screen");
});

test("program aggregates expose no small groups and no individuals", () => {
  assert.ok(PROGRAM_SNAPSHOT.enrolled >= PROGRAM_SNAPSHOT.minimumGroupSize);
  for (const row of PROGRAM_SNAPSHOT.activityByCategory) {
    if (row.completionPercent !== null) {
      assert.ok(row.completionPercent >= 0 && row.completionPercent <= 100);
    }
    assert.ok(["system_recorded", "participant_reported"].includes(row.measurementType));
  }
  const serialized = JSON.stringify(PROGRAM_SNAPSHOT);
  assert.ok(!/rank|leaderboard|individual/i.test(serialized));
});

// ── language ────────────────────────────────────────────────────────────

test("the challenge surfaces avoid clinical and leaderboard vocabulary", () => {
  const forbidden = [
    "diagnosis", "assessment", "symptom", "treatment", "patient",
    "health risk", "recovery score", "clinical score", "health ranking",
    "leaderboard",
  ];
  const sources = [
    "lib/config/challenge.mjs",
    "app/challenge-ui.js",
  ].filter(p => fs.existsSync(p));
  assert.ok(sources.length >= 1);
  for (const path of sources) {
    // Only user-visible strings matter; comments explaining the rules are
    // allowed to name the words they forbid, so strip comment lines.
    const text = fs.readFileSync(path, "utf8")
      .split("\n")
      .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
      .join("\n");
    for (const word of forbidden) {
      assert.ok(
        !new RegExp(word, "i").test(text),
        `${path} uses the forbidden term "${word}"`
      );
    }
  }
});
