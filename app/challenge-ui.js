"use client";
//
// Cohort challenge surfaces. Presentation only — every number arrives
// already computed from lib/config/challenge.mjs, so nothing here decides
// what counts.
//
// House rules for this file:
//   · metrics are compared, participants never are
//   · no personal text ever crosses into a cohort or program surface
//   · the blue accent marks "shared"; gold still marks "yours"
//
import { useState } from "react";
import {
  METRIC_CATEGORIES,
  METRIC_POOL,
  DETALYTICS_ROTATION_POOL,
  MAX_CLIENT_METRICS,
  MIN_CLIENT_METRICS,
  SOURCE_LABEL,
  MEASUREMENT_LABEL,
  CONTRIBUTION_EVENTS,
  PROGRAM_SNAPSHOT,
  PRIVACY_NOTICE,
  NORMALIZATION_NOTICE,
  REFLECTION_PRIVACY_NOTICE,
  CONVERSATION_PRIVACY_NOTICE,
  getCategory,
  getMetric,
  isCategoryRecording,
  activeMetricIds,
  computeChallengeState,
} from "../lib/config/challenge.mjs";

const COHORT = "#5f86b8";
const COHORT_LIGHT = "#8fb0d8";

// ── small shared pieces ──────────────────────────────────────────────────

function Eyebrow({ children, color }) {
  return (
    <div
      className="mono"
      style={{
        fontSize: "10px",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: color || "var(--gold-dim)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SourceTag({ source }) {
  if (!source) return null;
  return (
    <span className={source === "detalytics" ? "tag tag-detalytics" : "tag tag-client"}>
      {SOURCE_LABEL[source]}
    </span>
  );
}

function MeasurementTag({ measurementType }) {
  const reported = measurementType === "participant_reported";
  return (
    <span className={reported ? "tag tag-reported" : "tag tag-recorded"}>
      {MEASUREMENT_LABEL[measurementType]}
    </span>
  );
}

function Meter({ percent, targetPercent }) {
  return (
    <div className="meter">
      <div className="meter-fill" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      {targetPercent != null && (
        <div className="meter-target" style={{ left: `${Math.max(0, Math.min(100, targetPercent))}%` }} />
      )}
    </div>
  );
}

// True when the build has no way to observe this metric yet.
function notRecording(metric) {
  return metric.scored === false || metric.dataAvailable === false;
}

// A metric with no data source shows no number at all. Inventing one would
// read as "the cohort is at 58%" when the app cannot see the activity.
function MetricFigure({ metric, size = "1.5rem" }) {
  if (notRecording(metric)) {
    return (
      <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--silver)", whiteSpace: "nowrap" }}>
        Not yet recording
      </span>
    );
  }
  return (
    <span className="serif" style={{ fontSize: size, color: COHORT_LIGHT, lineHeight: 1 }}>
      {metric.progressPercent}%
    </span>
  );
}

function MetricMeter({ metric }) {
  if (notRecording(metric)) {
    return <div className="meter" style={{ opacity: 0.35 }}><div className="meter-fill" style={{ width: 0 }} /></div>;
  }
  return <Meter percent={metric.progressPercent} />;
}

function NoDataNote({ metric }) {
  if (!notRecording(metric)) return null;
  return (
    <p style={{ fontSize: "0.76rem", color: "var(--silver)", lineHeight: 1.55, marginTop: 8, fontStyle: "italic" }}>
      {metric.dataNote} It is left out of the combined figure rather than
      counted as a zero.
    </p>
  );
}

function MeasurementOrNotRecording({ metric }) {
  if (notRecording(metric)) return <span className="tag tag-recorded">Not yet recording</span>;
  return <MeasurementTag measurementType={metric.measurementType} />;
}

function BackLink({ label, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "4px 10px",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: "0.65rem",
        color: "var(--silver)",
        fontFamily: "'Space Mono', monospace",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function PrivacyNote({ children }) {
  return <div className="privacy-note">{children}</div>;
}

// ── 1. Weekly challenge reveal ───────────────────────────────────────────

export function ChallengeReveal({ state, onEnter }) {
  const { challenge, metrics, scoredMetrics, targetPercent } = state;
  if (!challenge) return null;
  const clientMetrics = metrics.filter(m => m.source === "client");
  const detalyticsMetric = metrics.find(m => m.source === "detalytics");
  // Only the metrics the app can record today are listed as ways to add —
  // offering an action that cannot be counted would be a false promise.
  const scoredIds = new Set(scoredMetrics.map(m => m.id));
  const ways = Object.values(CONTRIBUTION_EVENTS).filter(e => scoredIds.has(e.metricId));
  const unscoredCount = metrics.length - scoredMetrics.length;

  return (
    <div className="shell" style={{ padding: "2.5rem 1.6rem 2rem" }}>
      <Eyebrow>THIS WEEK’S CHALLENGE</Eyebrow>
      <h2 className="serif" style={{ fontSize: "1.95rem", color: "var(--cream)", lineHeight: 1.2, marginBottom: 10 }}>
        {challenge.title}
      </h2>
      <p style={{ fontSize: "1.02rem", color: "var(--silver)", lineHeight: 1.65, marginBottom: 6 }}>
        {challenge.description}
      </p>
      <div className="gold-rule" />

      <div className="challenge-panel" style={{ borderLeft: `2px solid ${COHORT}`, marginTop: 18 }}>
        <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: COHORT_LIGHT, marginBottom: 10 }}>
          {SOURCE_LABEL.client}
        </div>
        {clientMetrics.map(m => (
          <MetricLine key={m.id} metric={m} />
        ))}
      </div>

      {detalyticsMetric && (
        <div className="challenge-panel" style={{ borderLeft: "2px solid var(--gold)" }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            {SOURCE_LABEL.detalytics} · rotates each week
          </div>
          <MetricLine metric={detalyticsMetric} />
        </div>
      )}

      <div className="challenge-panel" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--silver)" }}>
          Weekly cohort target
        </div>
        <div className="serif" style={{ fontSize: "2rem", color: COHORT_LIGHT, lineHeight: 1 }}>
          {targetPercent}%
        </div>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--silver)", lineHeight: 1.6, marginBottom: 18 }}>
        Combined progress across the {scoredMetrics.length}{" "}
        {scoredMetrics.length === 1 ? "metric" : "metrics"} the app can record
        today, carried by everyone in the cohort together.
        {unscoredCount > 0 && (
          <>
            {" "}The {unscoredCount === 1 ? "other one is" : `other ${unscoredCount} are`}{" "}
            marked below — nothing feeds {unscoredCount === 1 ? "it" : "them"} yet, so{" "}
            {unscoredCount === 1 ? "it is" : "they are"} left out of the figure.
          </>
        )}
      </p>

      <div className="section-label">HOW YOU ADD TO IT</div>
      <div style={{ marginBottom: 18 }}>
        {ways.map(w => (
          <div
            key={w.kind}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "0.55rem 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontSize: "0.85rem",
              color: "var(--mist)",
            }}
          >
            <span>{w.label}</span>
            <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--silver)", whiteSpace: "nowrap" }}>
              {w.capNote}
            </span>
          </div>
        ))}
      </div>

      <PrivacyNote>
        Your part stays yours. The cohort sees one combined figure per metric —
        never your answers, never your name, never a comparison between people.
      </PrivacyNote>

      <button className="btn-gold" style={{ marginTop: 20 }} onClick={onEnter}>
        ENTER THIS WEEK’S CHALLENGE →
      </button>
    </div>
  );
}

function MetricLine({ metric }) {
  const unscored = notRecording(metric);
  return (
    <div style={{ marginBottom: 12, opacity: unscored ? 0.6 : 1 }}>
      <div className="serif" style={{ fontSize: "1.05rem", color: "var(--cream)", lineHeight: 1.35, marginBottom: 5 }}>
        {metric.name}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <MeasurementOrNotRecording metric={metric} />
        <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--silver)", padding: "2px 0" }}>
          {getCategory(metric.category)?.name}
        </span>
      </div>
    </div>
  );
}

// ── 2. Dashboard card ────────────────────────────────────────────────────

export function DashboardChallengeCard({ state, summary, recommended, onOpenScorecard }) {
  const { challenge, overallPercent, targetPercent } = state;
  if (!challenge) return null;
  const counted = summary.filter(s => s.countsThisWeek);
  // Recorded, but for a metric that is not in rotation this week. Shown so
  // the count is never silently swallowed.
  const alsoRecorded = summary.filter(s => !s.countsThisWeek && s.count > 0);

  return (
    <div className="challenge-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.24em", textTransform: "uppercase", color: COHORT_LIGHT }}>
          THIS WEEK’S CHALLENGE
        </div>
        <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--silver)" }}>
          Week {challenge.week}
        </div>
      </div>

      <div className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)", lineHeight: 1.25, marginBottom: 12 }}>
        {challenge.title}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <div className="serif" style={{ fontSize: "2.1rem", color: COHORT_LIGHT, lineHeight: 1 }}>
          {overallPercent}%
        </div>
        <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--silver)" }}>
          combined · target {targetPercent}%
        </div>
      </div>
      <Meter percent={overallPercent} targetPercent={targetPercent} />

      <div style={{ marginTop: 16 }}>
        <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}>
          Yours this week · private
        </div>
        {counted.map(s => (
          <div
            key={s.kind}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              fontSize: "0.8rem",
              color: s.count > 0 ? "var(--cream)" : "var(--silver)",
              padding: "3px 0",
            }}
          >
            <span>{s.count > 0 ? "◈" : "○"} {s.label}</span>
            <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap", color: "var(--silver)" }}>
              {s.count} · {s.capNote}
            </span>
          </div>
        ))}
      </div>

      {alsoRecorded.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 6 }}>
            Also recorded · does not affect this week’s score
          </div>
          {alsoRecorded.map(s => (
            <div
              key={s.kind}
              style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: "0.8rem", color: "var(--silver)", padding: "3px 0" }}
            >
              <span>◈ {s.label}</span>
              <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {s.count} · {MEASUREMENT_LABEL[s.verificationType === "participant_reported" ? "participant_reported" : "system_recorded"]}
              </span>
            </div>
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}>
            Three from the Path
          </div>
          {recommended.slice(0, 3).map(a => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                padding: "0.4rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "0.85rem",
                color: "var(--mist)",
              }}
            >
              <span className="serif" style={{ fontSize: "0.98rem", color: "var(--cream)" }}>{a.name}</span>
              <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--silver)", whiteSpace: "nowrap" }}>
                {a.cadence}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onOpenScorecard}
        className="mono"
        style={{
          marginTop: 16,
          width: "100%",
          padding: "10px 12px",
          background: "transparent",
          border: `1px solid ${COHORT}55`,
          color: COHORT_LIGHT,
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        OPEN SHARED CHALLENGE PROGRESS →
      </button>
    </div>
  );
}

// ── 3. Shared cohort challenge scorecard ─────────────────────────────────

export function ChallengeScorecard({ state, onBack }) {
  const { challenge, metrics, overallPercent, targetPercent, milestones, cohortSize } = state;
  if (!challenge) return null;
  const reached = milestones.filter(m => m.reached);

  return (
    <div className="shell" style={{ padding: "2rem 1.6rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: COHORT_LIGHT }}>
          CHALLENGE SCORECARD
        </div>
        <BackLink label="← BACK TO THE TRAIL" onClick={onBack} />
      </div>

      <h2 className="serif" style={{ fontSize: "1.75rem", color: "var(--cream)", lineHeight: 1.25, marginBottom: 4 }}>
        {challenge.title}
      </h2>
      <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 20 }}>
        Week {challenge.week} · {challenge.startsAt} → {challenge.endsAt}
      </div>

      <div className="challenge-panel" style={{ borderLeft: `2px solid ${COHORT}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div>
            <div className="serif" style={{ fontSize: "3rem", color: COHORT_LIGHT, lineHeight: 1 }}>
              {overallPercent}%
            </div>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)", marginTop: 4 }}>
              Combined challenge progress
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="serif" style={{ fontSize: "1.4rem", color: "var(--gold)", lineHeight: 1 }}>{targetPercent}%</div>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-dim)", marginTop: 4 }}>
              Weekly target
            </div>
          </div>
        </div>
        <Meter percent={overallPercent} targetPercent={targetPercent} />
      </div>

      <div className="section-label" style={{ marginTop: 22 }}>ACTIVE METRICS</div>
      {metrics.map(m => (
        <div key={m.id} className="challenge-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <div className="serif" style={{ fontSize: "1.08rem", color: "var(--cream)", lineHeight: 1.3 }}>
              {m.name}
            </div>
            <MetricFigure metric={m} />
          </div>
          <MetricMeter metric={m} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <SourceTag source={m.source} />
            <MeasurementOrNotRecording metric={m} />
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--silver)", lineHeight: 1.55, marginTop: 10 }}>
            {m.howMeasured}
          </p>
          <NoDataNote metric={m} />
        </div>
      ))}

      <div className="section-label" style={{ marginTop: 22 }}>MILESTONES</div>
      <div className="challenge-panel">
        {milestones.map(ms => (
          <div
            key={ms.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "0.45rem 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontSize: "0.85rem",
              color: ms.reached ? "var(--cream)" : "var(--silver)",
              opacity: ms.reached ? 1 : 0.6,
            }}
          >
            <span className="serif" style={{ fontSize: "1rem" }}>
              {ms.reached ? "◈" : "○"} {ms.label}
            </span>
            <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", color: ms.reached ? COHORT_LIGHT : "var(--silver)" }}>
              {ms.atPercent}%
            </span>
          </div>
        ))}
        <div className="mono" style={{ marginTop: 10, fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
          {reached.length} of {milestones.length} reached · final cohort target {targetPercent}%
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <PrivacyNote>
          <p style={{ margin: 0, marginBottom: 6 }}>{NORMALIZATION_NOTICE}</p>
          <p style={{ margin: 0 }}>
            Metrics are compared here, people are not. Nobody’s individual
            contribution, answers or standing appears on this page — not yours,
            not anyone else’s. Cohort of {cohortSize}.
          </p>
        </PrivacyNote>
      </div>

      <button className="btn-ghost" style={{ marginTop: 18, width: "100%" }} onClick={onBack}>
        BACK TO THE TRAIL
      </button>
    </div>
  );
}


// Program-owner surfaces are not part of the participant journey. In the
// demo they are reachable from a separate entry, and every one of them says
// so at the top.
function ProgramRoleBanner() {
  return (
    <div
      style={{
        padding: "0.6rem 0.9rem",
        marginBottom: 14,
        background: "var(--cohort-wash)",
        border: `1px solid ${COHORT}44`,
        borderLeft: `2px solid ${COHORT}`,
      }}
    >
      <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: COHORT_LIGHT, marginBottom: 4 }}>
        Program-owner view · demo
      </div>
      <div style={{ fontSize: "0.76rem", color: "var(--silver)", lineHeight: 1.55 }}>
        Aggregate participation only. Participants never see this screen.
      </div>
    </div>
  );
}

// ── 4. Program challenge setup ───────────────────────────────────────────

export function ProgramChallengeSetup({ draft, onChange, onPublish, onBack, onOpenSummary }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const selected = draft.clientMetricIds;
  const detalyticsMetric = getMetric(draft.detalyticsMetricId);
  const valid =
    draft.title.trim().length > 0 &&
    selected.length >= MIN_CLIENT_METRICS &&
    selected.length <= MAX_CLIENT_METRICS;

  const toggleMetric = (id) => {
    if (id === draft.detalyticsMetricId) return;
    const next = selected.includes(id)
      ? selected.filter(x => x !== id)
      : selected.length >= MAX_CLIENT_METRICS
        ? selected
        : [...selected, id];
    onChange({ ...draft, clientMetricIds: next });
  };

  const previewState = computeChallengeState(
    {
      id: "preview",
      week: draft.week,
      title: draft.title,
      targetPercent: draft.targetPercent,
      clientMetricIds: selected,
      detalyticsMetricId: draft.detalyticsMetricId,
    },
    []
  );

  return (
    <div className="shell" style={{ padding: "2rem 1.6rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: COHORT_LIGHT }}>
          PROGRAM CHALLENGE SETUP
        </div>
        <BackLink label="← EXIT PROGRAM VIEW" onClick={onBack} />
      </div>

      <ProgramRoleBanner />

      <h2 className="serif" style={{ fontSize: "1.7rem", color: "var(--cream)", lineHeight: 1.25, marginBottom: 6 }}>
        Set the week for your cohort.
      </h2>
      <p style={{ fontSize: "0.92rem", color: "var(--silver)", lineHeight: 1.6, marginBottom: 18 }}>
        Choose one to three metrics. Detalytics adds one rotating metric each
        week, so the shape of the challenge keeps moving.
      </p>

      <div className="section-label">CHALLENGE NAME</div>
      <input
        className="input"
        value={draft.title}
        placeholder="Name this week’s challenge"
        onChange={e => onChange({ ...draft, title: e.target.value })}
      />

      <div className="section-label" style={{ marginTop: 22 }}>
        YOUR METRICS · {selected.length} OF {MAX_CLIENT_METRICS}
      </div>
      {METRIC_CATEGORIES.map(cat => {
        const inCategory = METRIC_POOL.filter(m => m.category === cat.id);
        if (inCategory.length === 0) return null;
        const open = expandedCategory === cat.id;
        return (
          <div key={cat.id} style={{ marginBottom: 8 }}>
            <div
              onClick={() => setExpandedCategory(open ? null : cat.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "0.7rem 0.9rem",
                background: "var(--slate)",
                border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
            >
              <div>
                <div className="serif" style={{ fontSize: "1rem", color: "var(--cream)" }}>{cat.name}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--silver)", lineHeight: 1.4 }}>{cat.blurb}</div>
              </div>
              <span className="mono" style={{ fontSize: "0.8rem", color: "var(--silver)" }}>{open ? "−" : "+"}</span>
            </div>

            {open && inCategory.map(m => {
              const isSelected = selected.includes(m.id);
              const isDetalytics = m.id === draft.detalyticsMetricId;
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMetric(m.id)}
                  style={{
                    padding: "0.8rem 0.95rem",
                    background: "var(--deep)",
                    borderTop: "none",
                    borderRight: `1px solid ${isSelected ? COHORT : "rgba(255,255,255,0.06)"}`,
                    borderBottom: `1px solid ${isSelected ? COHORT : "rgba(255,255,255,0.06)"}`,
                    borderLeft: `1px solid ${isSelected ? COHORT : "rgba(255,255,255,0.06)"}`,
                    cursor: isDetalytics ? "default" : "pointer",
                    opacity: isDetalytics ? 0.55 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div
                      style={{
                        width: 13, height: 13, flexShrink: 0, marginTop: 4,
                        border: `1.5px solid ${isSelected ? COHORT : "rgba(255,255,255,0.25)"}`,
                        background: isSelected ? COHORT : "transparent",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="serif" style={{ fontSize: "1rem", color: "var(--cream)", lineHeight: 1.3, marginBottom: 5 }}>
                        {m.name}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                        <MeasurementOrNotRecording metric={m} />
                        {isDetalytics && <SourceTag source="detalytics" />}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--silver)", lineHeight: 1.5 }}>
                        {m.howMeasured}
                      </div>
                      <NoDataNote metric={m} />
                      <div className="mono" style={{ marginTop: 6, fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
                        Credit cap: {capText(m)} · {m.cadence}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="section-label" style={{ marginTop: 22 }}>THE ROTATING METRIC</div>
      <div className="challenge-panel" style={{ borderLeft: "2px solid var(--gold)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <SourceTag source="detalytics" />
          {detalyticsMetric && <MeasurementTag measurementType={detalyticsMetric.measurementType} />}
        </div>
        <div className="serif" style={{ fontSize: "1.1rem", color: "var(--cream)", marginBottom: 6 }}>
          {detalyticsMetric?.name}
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--silver)", lineHeight: 1.55, marginBottom: 8 }}>
          {detalyticsMetric?.howMeasured}
        </p>
        <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
          Drawn from an approved pool of {DETALYTICS_ROTATION_POOL.length} participation metrics · not editable by the program
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 22 }}>WEEKLY COHORT TARGET</div>
      <div className="challenge-panel">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)" }}>
            Combined progress to aim for
          </div>
          <div className="serif" style={{ fontSize: "1.9rem", color: COHORT_LIGHT, lineHeight: 1 }}>
            {draft.targetPercent}%
          </div>
        </div>
        <input
          type="range"
          min="40"
          max="95"
          step="5"
          value={draft.targetPercent}
          onChange={e => onChange({ ...draft, targetPercent: Number(e.target.value) })}
          style={{ width: "100%", accentColor: COHORT }}
        />
      </div>

      <div className="section-label" style={{ marginTop: 22 }}>REVIEW BEFORE PUBLISHING</div>
      <div className="challenge-panel">
        <div className="serif" style={{ fontSize: "1.25rem", color: "var(--cream)", marginBottom: 10 }}>
          {draft.title || "Untitled challenge"}
        </div>
        {previewState.metrics.length === 0 && (
          <p style={{ fontSize: "0.82rem", color: "var(--silver)" }}>Choose at least one metric to preview the week.</p>
        )}
        {previewState.metrics.map(m => (
          <div key={m.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: "0.86rem", color: "var(--cream)" }}>{m.name}</span>
              <MetricFigure metric={m} size="1rem" />
            </div>
            <MetricMeter metric={m} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              <SourceTag source={m.source} />
              <MeasurementOrNotRecording metric={m} />
            </div>
          </div>
        ))}
        {previewState.unscoredMetrics.length > 0 && (
          <p style={{ fontSize: "0.76rem", color: "var(--silver)", lineHeight: 1.55, marginBottom: 8, fontStyle: "italic" }}>
            {previewState.unscoredMetrics.length === 1 ? "One metric has" : `${previewState.unscoredMetrics.length} metrics have`}{" "}
            no data source yet. Participants see them marked, and they are left
            out of the combined figure until something feeds them.
          </p>
        )}
        {previewState.metrics.length > 0 && (
          <div className="mono" style={{ marginTop: 6, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
            Combined today {previewState.overallPercent}% · target {draft.targetPercent}%
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <PrivacyNote>{PRIVACY_NOTICE}</PrivacyNote>
      </div>

      <button className="btn-gold" style={{ marginTop: 18 }} disabled={!valid} onClick={onPublish}>
        PUBLISH THIS WEEK →
      </button>
      <button className="btn-ghost" style={{ marginTop: 10, width: "100%" }} onClick={onOpenSummary}>
        SEE THE PROGRAM SUMMARY
      </button>
    </div>
  );
}

function capText(metric) {
  const cap = metric.participantCap || {};
  const parts = [];
  if (cap.perDay) parts.push(`${cap.perDay} a day`);
  if (cap.perWeek) parts.push(`${cap.perWeek} a week`);
  if (cap.perChallenge) parts.push(`${cap.perChallenge} per challenge`);
  return parts.join(" · ") || "uncapped";
}

// ── 5. Program aggregate summary ─────────────────────────────────────────

export function ProgramSummary({ state, challenges, onBack, onOpenSetup }) {
  const { challenge, metrics, overallPercent, targetPercent, milestones } = state;
  const past = (challenges || []).filter(c => c.status === "completed");
  const learningRecording = isCategoryRecording("learning");
  const recorded = PROGRAM_SNAPSHOT.activityByCategory.filter(r => r.measurementType === "system_recorded");
  const reported = PROGRAM_SNAPSHOT.activityByCategory.filter(r => r.measurementType === "participant_reported");

  return (
    <div className="shell" style={{ padding: "2rem 1.6rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: COHORT_LIGHT }}>
          PROGRAM SUMMARY
        </div>
        <BackLink label="← EXIT PROGRAM VIEW" onClick={onBack} />
      </div>

      <ProgramRoleBanner />

      <h2 className="serif" style={{ fontSize: "1.7rem", color: "var(--cream)", lineHeight: 1.25, marginBottom: 18 }}>
        {PROGRAM_SNAPSHOT.programName}
      </h2>

      <div className="cohort-grid" style={{ marginBottom: 18 }}>
        <StatTile label="Enrolled participants" value={PROGRAM_SNAPSHOT.enrolled} />
        <StatTile label="Weekly participation" value={`${PROGRAM_SNAPSHOT.weeklyParticipationRatePercent}%`} />
        <StatTile label="Return after absence" value={`${PROGRAM_SNAPSHOT.returnAfterAbsenceRatePercent}%`} />
        <StatTile label="Challenge progress" value={`${overallPercent}%`} accent />
      </div>

      <div className="section-label">THIS WEEK · {challenge?.title}</div>
      <div className="challenge-panel" style={{ borderLeft: `2px solid ${COHORT}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="serif" style={{ fontSize: "2.2rem", color: COHORT_LIGHT, lineHeight: 1 }}>{overallPercent}%</div>
          <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
            target {targetPercent}%
          </div>
        </div>
        <Meter percent={overallPercent} targetPercent={targetPercent} />
        <div style={{ marginTop: 16 }}>
          {metrics.map(m => (
            <div key={m.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: "0.86rem", color: "var(--cream)" }}>{m.name}</span>
                <MetricFigure metric={m} size="1rem" />
              </div>
              <MetricMeter metric={m} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                <SourceTag source={m.source} />
                <MeasurementOrNotRecording metric={m} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 22 }}>ACTIVITY BY CATEGORY · RECORDED IN THE APP</div>
      <div className="challenge-panel">
        {recorded.map(row => (
          <PercentRow key={row.categoryId} label={getCategory(row.categoryId)?.name} percent={row.completionPercent} />
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 18 }}>ACTIVITY BY CATEGORY · PARTICIPANT-REPORTED</div>
      <div className="challenge-panel">
        {reported.map(row => (
          <PercentRow key={row.categoryId} label={getCategory(row.categoryId)?.name} percent={row.completionPercent} />
        ))}
        <div className="mono" style={{ marginTop: 8, fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
          Reported by participants · not observed by the app
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 18 }}>
        LEARNING COMPLETION BY TOPIC{learningRecording ? "" : " · NOT YET RECORDING"}
      </div>
      <div className="challenge-panel">
        {!learningRecording && (
          <p style={{ fontSize: "0.78rem", color: "var(--silver)", lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
            {PROGRAM_SNAPSHOT.learningDataNote}
          </p>
        )}
        {PROGRAM_SNAPSHOT.learningByTopic.map(row => (
          <PercentRow key={row.topic} label={row.topic} percent={row.completionPercent} />
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 18 }}>MILESTONES COMPLETED</div>
      <div className="challenge-panel">
        {milestones.map(ms => (
          <div
            key={ms.id}
            style={{
              display: "flex", justifyContent: "space-between", gap: 10,
              padding: "0.4rem 0", fontSize: "0.84rem",
              color: ms.reached ? "var(--cream)" : "var(--silver)",
              opacity: ms.reached ? 1 : 0.55,
            }}
          >
            <span>{ms.reached ? "◈" : "○"} {ms.label}</span>
            <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em" }}>{ms.atPercent}%</span>
          </div>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 18 }}>PREVIOUS WEEKLY CHALLENGES</div>
      <div className="challenge-panel">
        {past.slice().reverse().map(c => (
          <div key={c.id} style={{ padding: "0.55rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
              <span className="serif" style={{ fontSize: "1rem", color: "var(--cream)" }}>
                Week {c.week} · {c.title}
              </span>
              <span className="mono" style={{ fontSize: "0.8rem", color: c.finalPercent >= c.targetPercent ? COHORT_LIGHT : "var(--silver)" }}>
                {c.finalPercent}%
              </span>
            </div>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
              target {c.targetPercent}% · {activeMetricIds(c).length} metrics · {c.finalPercent >= c.targetPercent ? "target reached" : "target not reached"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <PrivacyNote>
          <p style={{ margin: 0, marginBottom: 6 }}>{PRIVACY_NOTICE}</p>
          <p style={{ margin: 0 }}>
            Figures are shown for the whole cohort only. Groups smaller than{" "}
            {PROGRAM_SNAPSHOT.minimumGroupSize} are never broken out, and there is
            no per-person history, standing or comparison anywhere in this view.
          </p>
        </PrivacyNote>
      </div>

      <button className="btn-ghost" style={{ marginTop: 18, width: "100%" }} onClick={onOpenSetup}>
        SET UP NEXT WEEK’S CHALLENGE
      </button>
      <button className="btn-ghost" style={{ marginTop: 10, width: "100%" }} onClick={onBack}>
        BACK TO THE TRAIL
      </button>
    </div>
  );
}

function StatTile({ label, value, accent }) {
  return (
    <div
      style={{
        padding: "0.9rem 1rem",
        background: "var(--deep)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `2px solid ${accent ? COHORT : "var(--gold-dim)"}`,
      }}
    >
      <div className="serif" style={{ fontSize: "1.8rem", color: accent ? COHORT_LIGHT : "var(--cream)", lineHeight: 1 }}>
        {value}
      </div>
      <div className="mono" style={{ marginTop: 6, fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)" }}>
        {label}
      </div>
    </div>
  );
}

function PercentRow({ label, percent }) {
  const missing = percent === null || percent === undefined;
  return (
    <div style={{ marginBottom: 10, opacity: missing ? 0.55 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4, alignItems: "baseline" }}>
        <span style={{ fontSize: "0.84rem", color: "var(--mist)" }}>{label}</span>
        {missing ? (
          <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--silver)", whiteSpace: "nowrap" }}>
            Not yet recording
          </span>
        ) : (
          <span className="mono" style={{ fontSize: "0.78rem", color: COHORT_LIGHT }}>{percent}%</span>
        )}
      </div>
      {missing
        ? <div className="meter" style={{ opacity: 0.35 }}><div className="meter-fill" style={{ width: 0 }} /></div>
        : <Meter percent={percent} />}
    </div>
  );
}

// ── 6. Reflection + conversation completion ──────────────────────────────

export function ReflectionPanel({ text, onChangeText, onSubmit, submitted, credited, countsThisWeek, archetypeColor }) {
  return (
    <div style={{ marginTop: 18 }}>
      {submitted ? (
        <div className="challenge-panel" style={{ borderLeft: `2px solid ${COHORT}` }}>
          <div className="serif" style={{ fontSize: "1.15rem", color: "var(--cream)", marginBottom: 6 }}>
            Reflection recorded privately
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--silver)", lineHeight: 1.6, marginBottom: 10 }}>
            {REFLECTION_PRIVACY_NOTICE}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <MeasurementTag measurementType="system_recorded" />
            <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: credited && countsThisWeek ? COHORT_LIGHT : "var(--silver)", padding: "2px 0" }}>
              {!credited
                ? "Already counted this week"
                : countsThisWeek
                  ? "1 credit added this week"
                  : "Counted when this metric is in the week"}
            </span>
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--silver)", lineHeight: 1.6, marginBottom: 10 }}>
            Write what you are noticing. Nobody reads this — only the fact that
            you wrote something reaches the weekly challenge.
          </p>
          <textarea
            className="private-field"
            value={text}
            onChange={e => onChangeText(e.target.value)}
            placeholder="What is true this week that was not true last week?"
          />
          <button
            className="btn-gold"
            style={{ marginTop: 10, borderColor: archetypeColor, color: archetypeColor }}
            disabled={!text.trim()}
            onClick={onSubmit}
          >
            RECORD IT PRIVATELY →
          </button>
        </>
      )}
    </div>
  );
}

const CHECKOUT_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "not_yet", label: "Not yet" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

export function ConversationCheckout({ checkout, onChange, onSubmit, submitted, credited, countsThisWeek }) {
  const canSubmit = checkout.answer && (checkout.answer !== "yes" || checkout.note.trim().length > 0);

  if (submitted) {
    return (
      <div className="challenge-panel" style={{ marginTop: 18, borderLeft: `2px solid ${credited ? COHORT : "rgba(255,255,255,0.12)"}` }}>
        <div className="serif" style={{ fontSize: "1.15rem", color: "var(--cream)", marginBottom: 8 }}>
          {credited ? "Check-out recorded" : "Nothing counted — and that is fine"}
        </div>
        {credited ? (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <MeasurementTag measurementType="participant_reported" />
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--silver)", lineHeight: 1.6 }}>
              {CONVERSATION_PRIVACY_NOTICE} What you wrote stays with you; only
              the completion count leaves this screen.
              {!countsThisWeek && " This metric is not in this week’s challenge, so it does not move this week’s score."}
            </p>
          </>
        ) : (
          <p style={{ fontSize: "0.82rem", color: "var(--silver)", lineHeight: 1.6 }}>
            No contribution was added. You can check out again whenever the
            conversation actually happens.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="challenge-panel" style={{ marginTop: 18, borderLeft: `2px solid ${COHORT}` }}>
      <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.24em", textTransform: "uppercase", color: COHORT_LIGHT, marginBottom: 10 }}>
        CHECK OUT
      </div>
      <div className="serif" style={{ fontSize: "1.15rem", color: "var(--cream)", marginBottom: 10 }}>
        Did the conversation happen?
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {CHECKOUT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            className="checkout-option"
            data-selected={checkout.answer === opt.id}
            onClick={() => onChange({ ...checkout, answer: opt.id })}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {checkout.answer === "yes" && (
        <div className="animate-fadeUp">
          <div className="serif" style={{ fontSize: "1.05rem", color: "var(--cream)", marginBottom: 8 }}>
            What changed after the conversation?
          </div>
          <textarea
            className="private-field"
            style={{ minHeight: 76 }}
            value={checkout.note}
            onChange={e => onChange({ ...checkout, note: e.target.value })}
            placeholder="A line is enough. This stays private."
          />
        </div>
      )}

      <p style={{ fontSize: "0.78rem", color: "var(--silver)", lineHeight: 1.6, marginTop: 12 }}>
        {CONVERSATION_PRIVACY_NOTICE}
      </p>

      <button className="btn-ghost" style={{ marginTop: 12, width: "100%" }} disabled={!canSubmit} onClick={onSubmit}>
        SUBMIT CHECK-OUT
      </button>
    </div>
  );
}
