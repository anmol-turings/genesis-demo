// lib/config/challenge.mjs
//
// COHORT CHALLENGE SCORECARD — configuration + scoring.
//
// There is no participant ranking here and there never should be. What is
// ranked and compared are the *metrics*, by progress. Everything a program
// owner sees is normalized to cohort size and aggregated.
//
// Shapes (kept close to the eventual backend contract):
//
//   weeklyChallenge   { id, title, description, startsAt, endsAt,
//                       targetPercent, clientMetricIds, detalyticsMetricId,
//                       status }
//   challengeMetric   { id, name, category, source, measurementType,
//                       cadence, participantCap, target, progressPercent }
//   challengeContribution
//                     { participantId, challengeId, metricId, recordedAt,
//                       sourceEvent, verificationType }
//
// This file is plain ESM with no JSX and no React so `node --test` can
// import it directly (see tests/challenge.test.mjs).

// ── cohort ──────────────────────────────────────────────────────────────
// Every metric percentage is normalized to this many enrolled participants.
export const COHORT_SIZE = 42;

// ── metric categories ───────────────────────────────────────────────────
export const METRIC_CATEGORIES = [
  { id: 'daily_rhythm',        name: 'Daily rhythm',        blurb: 'Sleep, light, wind-down — the repeating shape of a day.' },
  { id: 'focus_reset',         name: 'Focus and reset',     blurb: 'Short deliberate pauses inside a working day.' },
  { id: 'connection_work',     name: 'Connection and work', blurb: 'Practices that involve other people or the work itself.' },
  { id: 'learning',            name: 'Learning',            blurb: 'Constellation nodes — courses, readings, talks.' },
  { id: 'knowledge_checks',    name: 'Knowledge checks',    blurb: 'A short check that a learning node landed.' },
  { id: 'reflection',          name: 'Reflection',          blurb: 'A written response submitted in the app. The text stays private.' },
  { id: 'conversation_checkout', name: 'Conversation check-out', blurb: 'A short check-out after a conversation held away from the app.' },
  { id: 'return_after_absence', name: 'Return after absence', blurb: 'Coming back after a stretch away.' },
];

export function getCategory(id) {
  return METRIC_CATEGORIES.find(c => c.id === id) || null;
}

// ── the approved metric pool ────────────────────────────────────────────
// `baselinePercent` is the cohort's standing progress before the demo
// participant contributes anything. `target` is what one participant has to
// do for a full personal share of the metric.
//
// `dataAvailable` is the honest one. A metric is only true here if the
// current build has a surface that can actually record it. Metrics marked
// false stay selectable — a program owner should see the full menu — but
// they never show an invented percentage and they are left out of the
// combined figure rather than dragging it down with a fabricated number.
export const METRIC_POOL = [
  {
    id: 'steady-rhythm-three-days',
    name: 'Daily-rhythm practice on three days',
    category: 'daily_rhythm',
    measurementType: 'system_recorded',
    cadence: 'weekly',
    target: 3,
    participantCap: { perDay: 1 },
    baselinePercent: 72,
    dataAvailable: true,
    howMeasured: 'Counted when a Path activity is marked explored. One counts per day.',
  },
  {
    id: 'reset-pause-daily',
    name: 'One focus reset each working day',
    category: 'focus_reset',
    measurementType: 'system_recorded',
    cadence: 'daily',
    target: 5,
    participantCap: { perDay: 1, perWeek: 5 },
    baselinePercent: 0,
    dataAvailable: false,
    dataNote: 'No reset practice surface exists in the current build, so nothing feeds this metric yet.',
    howMeasured: 'Counted when a reset practice is opened and closed in the app.',
  },
  {
    id: 'connection-one-week',
    name: 'One connection practice',
    category: 'connection_work',
    measurementType: 'system_recorded',
    cadence: 'weekly',
    target: 1,
    participantCap: { perWeek: 1 },
    baselinePercent: 0,
    dataAvailable: false,
    dataNote: 'Path activities are not yet tagged by category, so nothing feeds this metric yet.',
    howMeasured: 'Counted when a connection-category Path activity is marked explored.',
  },
  {
    id: 'learning-one-node',
    name: 'Complete one learning activity',
    category: 'learning',
    measurementType: 'system_recorded',
    cadence: 'weekly',
    target: 1,
    participantCap: { perWeek: 2 },
    baselinePercent: 0,
    dataAvailable: false,
    dataNote: 'No destination in the current build supplies Constellation data, so no node can be lit yet.',
    howMeasured: 'Counted when a Constellation node is lit. Two count per week.',
  },
  {
    id: 'knowledge-check-pass',
    name: 'Complete a knowledge check',
    category: 'knowledge_checks',
    measurementType: 'system_recorded',
    cadence: 'weekly',
    target: 1,
    participantCap: { perWeek: 1 },
    baselinePercent: 0,
    dataAvailable: false,
    dataNote: 'Knowledge checks are not built yet, so nothing feeds this metric.',
    howMeasured: 'Counted when a short check that follows a learning node is submitted.',
  },
  {
    id: 'reflection-submitted',
    name: 'Submit one reflection',
    category: 'reflection',
    measurementType: 'system_recorded',
    cadence: 'weekly',
    target: 1,
    participantCap: { perWeek: 1 },
    baselinePercent: 63,
    dataAvailable: true,
    howMeasured: 'Counted when a written response is submitted in the app. Only the completion event leaves the device — never the text.',
  },
  {
    id: 'conversation-checkout',
    name: 'Conversation check-out',
    category: 'conversation_checkout',
    measurementType: 'participant_reported',
    cadence: 'weekly',
    target: 1,
    participantCap: { perWeek: 1 },
    baselinePercent: 44,
    dataAvailable: true,
    howMeasured: 'The app cannot see a conversation held elsewhere. Counted only when the participant answers Yes and submits a check-out.',
  },
  {
    id: 'return-after-absence',
    name: 'Return after an inactive period',
    category: 'return_after_absence',
    measurementType: 'system_recorded',
    cadence: 'once',
    target: 1,
    participantCap: { perChallenge: 1 },
    baselinePercent: 64,
    dataAvailable: true,
    howMeasured: 'Counted once when a participant opens the app after seven or more inactive days.',
    privateCredit: true,
  },
];

export function getMetric(id) {
  return METRIC_POOL.find(m => m.id === id) || null;
}

// Detalytics may only rotate in metrics from this approved list. Nothing
// here reads a check-in answer, a wellbeing response, or an inferred state.
export const DETALYTICS_ROTATION_POOL = [
  'return-after-absence',
  'reset-pause-daily',
  'connection-one-week',
  'knowledge-check-pass',
  'conversation-checkout',
  'reflection-submitted',
];

export const MAX_CLIENT_METRICS = 3;
export const MIN_CLIENT_METRICS = 1;

// ── weekly challenges ───────────────────────────────────────────────────
export const WEEKLY_CHALLENGES = [
  {
    id: 'wk-2026-29',
    week: 29,
    title: 'Come back once',
    description: 'One return, from wherever the week left you.',
    startsAt: '2026-07-13',
    endsAt: '2026-07-19',
    targetPercent: 60,
    clientMetricIds: ['conversation-checkout'],
    detalyticsMetricId: 'return-after-absence',
    status: 'completed',
    finalPercent: 59,
  },
  {
    id: 'wk-2026-30',
    week: 30,
    title: 'Hold one small anchor',
    description: 'One practice, held on more days than not.',
    startsAt: '2026-07-20',
    endsAt: '2026-07-26',
    targetPercent: 65,
    clientMetricIds: ['steady-rhythm-three-days'],
    detalyticsMetricId: 'conversation-checkout',
    status: 'completed',
    finalPercent: 68,
  },
  {
    id: 'wk-2026-31',
    week: 31,
    title: 'Build a steadier week',
    description: 'A steadier week is not a heroic one. It is the same few things, done again.',
    startsAt: '2026-07-27',
    endsAt: '2026-08-02',
    targetPercent: 70,
    // The brief's example week pairs the rhythm metric with a learning one.
    // Learning has no data source in this build, so the demo week ships the
    // reflection metric in its place — every figure on screen is then backed
    // by something the app can genuinely record. Learning stays fully
    // selectable in Program Setup, flagged as not yet recording.
    clientMetricIds: ['steady-rhythm-three-days', 'reflection-submitted'],
    detalyticsMetricId: 'return-after-absence',
    status: 'active',
  },
];

export function getActiveChallenge() {
  return WEEKLY_CHALLENGES.find(c => c.status === 'active') || null;
}

export function getPastChallenges() {
  return WEEKLY_CHALLENGES.filter(c => c.status === 'completed');
}

/**
 * Publish a program owner's draft as the new active week.
 *
 * The week that was active is closed and keeps the figure it had reached.
 * Contributions are keyed by challenge id, so nothing carries across the
 * boundary — the new week starts from its metrics' cohort baselines.
 *
 * Pure — returns a new list.
 */
export function publishChallenge(challenges, draft, { closingPercent = 0 } = {}) {
  const list = Array.isArray(challenges) ? challenges : [];
  const current = list.find(c => c.status === 'active') || null;
  const published = {
    id: `wk-draft-${draft.week}`,
    week: draft.week,
    title: draft.title.trim(),
    description: draft.description?.trim() || 'Set by your program for this week.',
    startsAt: draft.startsAt || null,
    endsAt: draft.endsAt || null,
    targetPercent: draft.targetPercent,
    clientMetricIds: [...draft.clientMetricIds],
    detalyticsMetricId: draft.detalyticsMetricId,
    status: 'active',
  };
  const closed = list.map(c =>
    c.id === current?.id
      ? { ...c, status: 'completed', finalPercent: closingPercent }
      : c
  );
  return [...closed, published];
}

export function activeMetricIds(challenge) {
  if (!challenge) return [];
  const ids = [...(challenge.clientMetricIds || [])];
  if (challenge.detalyticsMetricId) ids.push(challenge.detalyticsMetricId);
  return ids;
}

export function metricSource(challenge, metricId) {
  if (!challenge) return null;
  if (challenge.detalyticsMetricId === metricId) return 'detalytics';
  if ((challenge.clientMetricIds || []).includes(metricId)) return 'client';
  return null;
}

export const SOURCE_LABEL = {
  client: 'Selected by your program',
  detalytics: 'Selected by Detalytics',
};

export const MEASUREMENT_LABEL = {
  system_recorded: 'Recorded in the app',
  participant_reported: 'Participant-reported',
};

// ── milestones ──────────────────────────────────────────────────────────
export const CHALLENGE_MILESTONES = [
  { id: 'ms-25', atPercent: 25, label: 'A quarter of the cohort is moving' },
  { id: 'ms-50', atPercent: 50, label: 'Half the week is carried' },
  { id: 'ms-70', atPercent: 70, label: 'The cohort target is reached' },
  { id: 'ms-90', atPercent: 90, label: 'The week is nearly whole' },
];

// ── contribution events ─────────────────────────────────────────────────
// One entry per thing a participant can do that emits a challenge
// contribution. Caps live here, not in the screens.
export const CONTRIBUTION_EVENTS = {
  path_activity: {
    kind: 'path_activity',
    label: 'Path activity',
    metricId: 'steady-rhythm-three-days',
    verificationType: 'app_event',
    cap: { perDay: 1 },
    capNote: 'One a day counts',
  },
  learning_node: {
    kind: 'learning_node',
    label: 'Learning node',
    metricId: 'learning-one-node',
    verificationType: 'app_event',
    cap: { perWeek: 2 },
    capNote: 'Two a week count',
  },
  reflection: {
    kind: 'reflection',
    label: 'Reflection',
    metricId: 'reflection-submitted',
    verificationType: 'app_event',
    cap: { perWeek: 1 },
    capNote: 'One a week counts',
  },
  conversation_checkout: {
    kind: 'conversation_checkout',
    label: 'Conversation check-out',
    metricId: 'conversation-checkout',
    verificationType: 'participant_reported',
    cap: { perWeek: 1 },
    capNote: 'One a week counts',
  },
  return_after_absence: {
    kind: 'return_after_absence',
    label: 'Return after seven inactive days',
    metricId: 'return-after-absence',
    verificationType: 'app_event',
    cap: { perChallenge: 1 },
    capNote: 'Counts once',
    private: true,
  },
};

export function eventForKind(kind) {
  return CONTRIBUTION_EVENTS[kind] || null;
}

// A conversation held away from the app cannot be observed. It becomes a
// participant-reported completion only on an explicit Yes plus a submitted
// check-out response.
export function isCheckoutCreditable(checkout) {
  if (!checkout) return false;
  if (checkout.answer !== 'yes') return false;
  return typeof checkout.note === 'string' && checkout.note.trim().length > 0;
}

// A reflection counts only once an in-app response has been submitted.
export function isReflectionCreditable(reflection) {
  if (!reflection) return false;
  return reflection.submitted === true
    && typeof reflection.text === 'string'
    && reflection.text.trim().length > 0;
}

/**
 * Append a contribution to the ledger if the caps allow it.
 * Pure — returns a new ledger, never mutates the one passed in.
 *
 * @returns {{ ledger: Array, credited: boolean, reason: string|null }}
 */
export function recordContribution(ledger, { kind, day = 1, participantId = 'demo', challengeId, recordedAt = null }) {
  const list = Array.isArray(ledger) ? ledger : [];
  const spec = eventForKind(kind);
  if (!spec) return { ledger: list, credited: false, reason: 'unknown_event' };

  // Caps are per participant. The ledger is a cohort-wide log, so one
  // person hitting their daily limit must never block anybody else.
  const sameKind = list.filter(
    c => c.sourceEvent === kind
      && c.challengeId === challengeId
      && c.participantId === participantId
  );
  const cap = spec.cap || {};

  if (cap.perChallenge != null && sameKind.length >= cap.perChallenge) {
    return { ledger: list, credited: false, reason: 'cap_reached' };
  }
  if (cap.perWeek != null && sameKind.length >= cap.perWeek) {
    return { ledger: list, credited: false, reason: 'cap_reached' };
  }
  if (cap.perDay != null && sameKind.filter(c => c.day === day).length >= cap.perDay) {
    return { ledger: list, credited: false, reason: 'daily_cap_reached' };
  }

  const contribution = {
    participantId,
    challengeId,
    metricId: spec.metricId,
    day,
    recordedAt,
    sourceEvent: kind,
    verificationType: spec.verificationType,
  };
  return { ledger: [...list, contribution], credited: true, reason: null };
}

// Credits for one metric. `participantId` scopes the count to a single
// person, which is what the participant-share calculation needs; pass null
// to count the whole ledger.
export function creditsForMetric(ledger, challengeId, metricId, participantId = null) {
  return (ledger || []).filter(
    c => c.challengeId === challengeId
      && c.metricId === metricId
      && (participantId === null || c.participantId === participantId)
  ).length;
}

// ── scoring ─────────────────────────────────────────────────────────────
//
// Every active metric that has a data source becomes a 0–100 percentage.
// Those metrics carry equal weight, and overall challenge progress is their
// mean, rounded to a whole percentage. One participant can only ever move a
// metric by their own normalized share — that is what keeps a single very
// active person from dominating the cohort number.
//
// A metric with `dataAvailable: false` gets a null percentage and is left
// out of the mean entirely. It is not scored as a zero: nobody has failed
// at it, the build simply cannot see it yet.

// The mean of a set of metric percentages, rounded. Kept separate so the
// scoring rule can be checked on its own.
export function overallFromPercents(percents) {
  const values = (percents || []).filter(p => typeof p === 'number' && !Number.isNaN(p));
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function participantShare(metric, credits, cohortSize = COHORT_SIZE) {
  if (!metric) return 0;
  const target = Math.max(1, metric.target || 1);
  const counted = Math.min(credits, target);
  return (counted * 100) / (cohortSize * target);
}

export function metricProgress(metric, credits, cohortSize = COHORT_SIZE) {
  if (!metric) return 0;
  const raw = (metric.baselinePercent || 0) + participantShare(metric, credits, cohortSize);
  return Math.max(0, Math.min(100, raw));
}

/**
 * Full derived state for a challenge. This is the single source the
 * scorecard, the dashboard card and the program summary all read.
 */
export function computeChallengeState(challenge, ledger = [], opts = {}) {
  const cohortSize = opts.cohortSize || COHORT_SIZE;
  const participantId = opts.participantId ?? null;
  if (!challenge) {
    return {
      challenge: null, metrics: [], scoredMetrics: [], unscoredMetrics: [],
      overallPercent: 0, overallExact: 0, targetPercent: 0,
      meetsTarget: false, milestones: [], cohortSize,
    };
  }

  const metrics = activeMetricIds(challenge)
    .map(id => getMetric(id))
    .filter(Boolean)
    .map(metric => {
      const scored = metric.dataAvailable !== false;
      const credits = creditsForMetric(ledger, challenge.id, metric.id, participantId);
      const exact = scored ? metricProgress(metric, credits, cohortSize) : null;
      return {
        ...metric,
        source: metricSource(challenge, metric.id),
        participantCredits: credits,
        participantTarget: metric.target,
        scored,
        exactPercent: exact,
        progressPercent: exact === null ? null : Math.round(exact),
      };
    });

  const scoredMetrics = metrics.filter(m => m.scored);
  const unscoredMetrics = metrics.filter(m => !m.scored);

  const overallExact = scoredMetrics.length
    ? scoredMetrics.reduce((sum, m) => sum + m.exactPercent, 0) / scoredMetrics.length
    : 0;
  const overallPercent = overallFromPercents(scoredMetrics.map(m => m.exactPercent));

  const milestones = CHALLENGE_MILESTONES.map(ms => ({
    ...ms,
    reached: overallPercent >= ms.atPercent,
  }));

  return {
    challenge,
    metrics,
    scoredMetrics,
    unscoredMetrics,
    overallPercent,
    overallExact,
    targetPercent: challenge.targetPercent,
    meetsTarget: overallPercent >= challenge.targetPercent,
    milestones,
    cohortSize,
  };
}

/**
 * The participant's own private summary. Never leaves their screen and is
 * never sent to a cohort or program surface.
 */
export function summarizeContribution(challenge, ledger = [], participantId = null) {
  const challengeId = challenge?.id;
  const active = new Set(activeMetricIds(challenge));
  return Object.values(CONTRIBUTION_EVENTS).map(spec => {
    const count = (ledger || []).filter(
      c => c.challengeId === challengeId
        && c.sourceEvent === spec.kind
        && (participantId === null || c.participantId === participantId)
    ).length;
    return {
      kind: spec.kind,
      label: spec.label,
      metricId: spec.metricId,
      count,
      capNote: spec.capNote,
      countsThisWeek: active.has(spec.metricId),
      verificationType: spec.verificationType,
      private: !!spec.private,
    };
  });
}

export function totalCredits(challenge, ledger = []) {
  return (ledger || []).filter(c => c.challengeId === challenge?.id).length;
}

// ── program-owner aggregates ────────────────────────────────────────────
// Static cohort figures for the demo. Every number here is already
// aggregated; nothing is broken down finely enough to identify a person.
export const PROGRAM_SNAPSHOT = {
  programName: 'Detalytics · Pilot cohort',
  enrolled: COHORT_SIZE,
  weeklyParticipationRatePercent: 76,
  returnAfterAbsenceRatePercent: 31,
  minimumGroupSize: 8,
  activityByCategory: [
    { categoryId: 'daily_rhythm',          completionPercent: 72, measurementType: 'system_recorded' },
    { categoryId: 'focus_reset',           completionPercent: 61, measurementType: 'system_recorded' },
    { categoryId: 'connection_work',       completionPercent: 55, measurementType: 'system_recorded' },
    { categoryId: 'reflection',            completionPercent: 63, measurementType: 'system_recorded' },
    { categoryId: 'conversation_checkout', completionPercent: 44, measurementType: 'participant_reported' },
  ],
  learningByTopic: [
    { topic: 'Sleep and circadian rhythm', completionPercent: 64 },
    { topic: 'Attention and recovery',     completionPercent: 52 },
    { topic: 'Boundaries at work',         completionPercent: 47 },
    { topic: 'Movement and energy',        completionPercent: 41 },
  ],
};

export const PRIVACY_NOTICE =
  'Program owners see aggregate participation only. Personal answers and individual wellbeing information are never included.';

export const NORMALIZATION_NOTICE =
  `Every metric is converted to a 0–100% figure and normalized to the cohort of ${COHORT_SIZE}. All active metrics carry equal weight, and each participant’s contribution is capped, so no single person can carry the number.`;

export const REFLECTION_PRIVACY_NOTICE =
  'Only the completion event contributes to the cohort metric. What you wrote stays on your side.';

export const CONVERSATION_PRIVACY_NOTICE =
  'The app cannot see a conversation that happened away from it, so this counts as participant-reported — not as something we measured.';
