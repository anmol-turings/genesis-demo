# ZED INSTRUCTIONS — Mythic tone pass

Hand the prompt below to Zed's Claude. It is self-contained: file paths,
exact replacements, scope guardrails. Then run the deploy block at the
bottom.

## Scope (read this first)

This pass implements a SUBSET of STRATEGY.md. The subset is everything
that is copy-only or small-state. Visual/animation work is excluded
because it deserves its own pass.

**IN this pass:**
- §1 — full tone overhaul (stages, day phrasing, score hiding, aspirational promises, shadow naming)
- §2a — return mechanic (per-archetype copy)
- §2b — returning quote acknowledgment (3rd-author trigger)
- §5 — iceberg swap (RealmAnimation → MP4)

**OUT of this pass (separate work):**
- §2c — mandala evolution stages 2–4 (needs visual review; demo users won't reach the thresholds anyway)
- §3 — constellation tracker (Detalytics topology unconfirmed)
- §4 — five new Remotion scenes (each is hours of authoring)

## Hard guardrails

Do not modify, refactor, or "clean up":
- `lib/AudioController.js`
- `lib/Mandala.js`
- `lib/quotes.js`
- `lib/RealmAnimation.js` (still used by dashboard hero + integration scene)
- `app/api/mentor/route.js`
- `app/api/voice/route.js`
- The 6-bug-fix invariants in `app/page.js` (recommended-card click, all-archetypes grid, audio.stop() on every screen handler, always-available "← Dashboard" on shadow encounter, etc.)
- The cacheKeyFor builder structure
- Anything not explicitly listed below

If a change requires touching something outside this list, STOP and
report it instead of editing.

---

## ═══ PASTE THIS PROMPT TO ZED'S CLAUDE ═══

> Implement the changes specified in `ZED_INSTRUCTIONS.md` in this repo.
> Read it fully before editing. Make the file-by-file changes exactly as
> written. Do not modify anything not listed. Do not refactor. Do not
> add comments. After all edits, run `npm run build` to verify the app
> compiles, then stop. Do not start the dev server. Do not commit.

---

## File 1: `lib/constants.js`

### 1A — replace the `RECOVERY_STAGES` export

Find the `RECOVERY_STAGES` array (currently 5 entries: Awareness,
Re-regulation, Re-engagement, Integration, Flourishing). Replace the
ENTIRE array with this 4-entry version:

```js
export const RECOVERY_STAGES = [
  {
    level: 1, title: "The Setting Out", threshold: 0, color: "#c9a84c", icon: "○",
    desc: "You have chosen to walk. The first miles are not about strength. They are about showing up to the same path twice.",
    forYou: "The body is just learning that it is allowed to rest. Keep the work small. Keep it daily.",
    forOthers: "No one will see this stage. That is correct. The visible part comes later.",
  },
  {
    level: 2, title: "The Long Middle", threshold: 300, color: "#7abcae", icon: "◐",
    desc: "The first novelty is gone. The destination is not visible. This is where most travelers turn back.",
    forYou: "You are no longer recovering from collapse. You are building something. The difference matters.",
    forOthers: "People begin to notice you are reliable in small ways. They start bringing real things to you again.",
  },
  {
    level: 3, title: "The Return", threshold: 600, color: "#5fa0d4", icon: "◉",
    desc: "You are coming home — not to who you were, but to yourself with the Shadow walking beside you.",
    forYou: "The part of you that wanted you to stop is no longer the enemy. You have listened. It has quieted.",
    forOthers: "You are the person in the room who can hold the weight without transferring it.",
  },
  {
    level: 4, title: "The Becoming", threshold: 1000, color: "#c4884a", icon: "✦",
    desc: "This is not the end of an arc. It is the start of a different kind of life.",
    forYou: "You are not the person who took the assessment. The person who took it would not recognize you.",
    forOthers: "You are now the one others come to when they are where you used to be.",
  },
];
```

### 1B — add two helpers after `getStage`

Find `export function getStage(totalPoints)`. Immediately AFTER it
(before the next `// ═══...` divider), add:

```js
export function passagePhrase(stage, day) {
  if (!stage) return "";
  if (stage.title === "The Becoming") return stage.title;
  let weekInPassage;
  if (stage.level === 1) weekInPassage = Math.ceil(day / 7);
  else if (stage.level === 2) weekInPassage = Math.ceil((day - 30) / 7);
  else if (stage.level === 3) weekInPassage = Math.ceil((day - 60) / 7);
  else weekInPassage = 1;
  if (weekInPassage < 1) weekInPassage = 1;
  const ordinals = ["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelfth"];
  const ord = ordinals[weekInPassage - 1] || `${weekInPassage}th`;
  return `${stage.title} · the ${ord} week`;
}

export function recoveryBandPhrase(score) {
  if (score <= 25) return "still in the cold dawn";
  if (score <= 50) return "the path is forming";
  if (score <= 70) return "moving with rhythm";
  if (score <= 85) return "carrying others now";
  return "the work has changed shape";
}
```

### 1C — add three fields to each ARCHETYPE entry

For each of the six entries in the `ARCHETYPES` array, ADD three new
fields (do not modify existing fields). Field values per archetype:

**stoic:**
```js
promise: "I do not promise you ease. I promise you that what you build with me will not fall down when the wind comes. We are *carving*. The work will be slow. You will recognize yourself at the end.",
returnCopy: {
  soft: "You return. The post is held. Pick it up.",
  medium: "The march continues with or without us. *Resume*.",
  long: "Time has passed. The work waits. It does not punish.",
},
returningQuoteAck: "This is the third time I have spoken of {author}. Notice that. *The repetition is the lesson*.",
```

**alchemist:**
```js
promise: "We will study you the way I once studied uranium — patiently, without flinching at what we find. Recovery is not a faith. It is *evidence*. We will gather it together.",
returnCopy: {
  soft: "The experiment is *paused*, not failed. Today's variable is your return.",
  medium: "Long pauses are part of the data. Note where you were. We continue.",
  long: "A long absence is itself a finding. We are *interested*, not disappointed.",
},
returningQuoteAck: "{Author} returns a third time. The pattern is yours, not mine — I am simply *naming* it.",
```

**explorer:**
```js
promise: "I have brought every man home before. Not by hurry. By *steadiness*. The ice will not lift on a schedule. We move when it moves. You will be home.",
returnCopy: {
  soft: "The party stopped. You're back at camp. The next *quarter mile* is enough.",
  medium: "The ice held us up. It does that. The route is still there.",
  long: "Some days we lose. The expedition does not end on a lost day. We *resume*.",
},
returningQuoteAck: "{Author} again. Three times now. There is a *route* in this for you.",
```

**healer:**
```js
promise: "I have seen what you carry. You give light without tending the lantern that gives it. *Tonight* the lantern is the work. The rest is downstream of that.",
returnCopy: {
  soft: "You stepped away. That is allowed. The lantern is still lit.",
  medium: "The lantern was not yours alone to tend. *Today* we tend it again.",
  long: "Some absences are necessary. Whether it was rest or collapse, you are *here* now.",
},
returningQuoteAck: "You have heard {author} from me before. Twice. I would not bring them back if it weren't *yours* to hear.",
```

**monk:**
```js
promise: "You do not need to be fixed. You need to be *heard* — first by yourself. We will breathe. Slowly. The body has been speaking for a long time. We will learn its language.",
returnCopy: {
  soft: "You left. You are returning. *That is the practice*.",
  medium: "There is no schedule for the breath. Sit. Begin again. There is no other way to begin.",
  long: "You did not lose anything by leaving. Beginning is *always* available.",
},
returningQuoteAck: "{Author}. Again. Three times means *listen*.",
```

**craftsman:**
```js
promise: "The work has become hollow because you stopped *playing* with it. We will find one small thing worth making. Then another. Joy is not a reward for recovery. It is the recovery.",
returnCopy: {
  soft: "The bench is dusty. *Pick something up*. Anything.",
  medium: "The unfinished things are still unfinished. Good. We have work.",
  long: "Long absences sometimes return us with *better* questions. What did you learn while you were away?",
},
returningQuoteAck: "{Author} for the third time. That is not coincidence in a deterministic system. Something in you is *catching* on this voice.",
```

### 1D — add `mythicNaming` to each shadow

In `diagnoseShadow`, ADD a `mythicNaming` field to each of the six
return objects (alongside existing `rootInsight`; do NOT remove
`rootInsight`).

| Shadow         | mythicNaming                                                                                                                                                                                                                                                              |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The Unnamed    | "You came when my body began speaking and I could not listen. You took the words away so the signal would not destroy me. I see you now. I will not push you out. We will learn the language together."                                                                  |
| The Withdrawn  | "You came when caring cost more than I could pay. You taught me to stand back so I could survive. I see you now. The cost of your protection has grown larger than the cost of caring. We will make a new bargain."                                                      |
| The Scattered  | "You came when the work was too much for one mind. You broke the load into pieces so I could still move. I see you now. The pieces have grown too small to hold anything. We will learn what to put down."                                                               |
| The Depleted   | "You came when there was no one else to carry it. You taught me to spend what I did not have, because the spending kept us alive. I see you now. The ledger is honest. We will close it together."                                                                       |
| The Cynic      | "You came when meaning vanished and the work continued. You taught me to not care so I would not be hurt by caring. I see you now. The not-caring has become its own wound. We will let some of it back in."                                                              |
| The Drift      | "You came so quietly I did not notice you arrive. You did not break me. You only thinned me. I see you now. Early is the best place to begin."                                                                                                                            |

---

## File 2: `app/page.js`

### 2A — extend the constants import

Find this line near the top:

```js
import {
  PERSONAS, ASSESSMENT_CATEGORIES, usernameToPersona, computeProfile,
  ARCHETYPES, TONE_STYLES, REALMS, RECOVERY_STAGES,
  recommendArchetype, recommendTone, getStage, buildMentorPrompt,
  orderedRealmsByPriority, generateShadowNaming,
  buildRealmBriefingPrompt, buildQuestDonePrompt, buildQuestSkipPrompt,
  buildShadowEncounterPrompt, buildAspirationalPrompt,
} from "../lib/constants";
```

Add `passagePhrase, recoveryBandPhrase` to the import list.

### 2B — add session state

Find the line `const [shadowEncounterText, setShadowEncounterText] = useState("");`

Immediately AFTER that line, add:

```js
const [quoteHistory, setQuoteHistory] = useState({});
const [returnTier, setReturnTier] = useState(null);
const [returnDismissed, setReturnDismissed] = useState(false);
```

### 2C — read/write `lastVisit` in `handleLoginSubmit`

Find `handleLoginSubmit`. Replace its body with:

```js
const handleLoginSubmit = () => {
  if (audio) audio.unlock();
  const p = usernameToPersona(username);
  setPersona(p);
  setUserName(p.defaultName);
  const computed = computeProfile(p);
  setProfile(computed);
  setRecoveryScore(computed.recoveryScore);
  setOrderedRealms(orderedRealmsByPriority(computed.realmPriorities));

  // Return mechanic — diff lastVisit from localStorage
  if (typeof window !== "undefined") {
    const key = `bd_lastVisit_${username.toLowerCase().trim()}`;
    const stored = window.localStorage.getItem(key);
    if (stored) {
      const today = new Date();
      const last = new Date(stored);
      const days = Math.floor((today - last) / 86400000);
      if (days >= 2) setReturnTier(days <= 4 ? "soft" : days <= 14 ? "medium" : "long");
    }
    window.localStorage.setItem(key, new Date().toISOString().slice(0,10));
  }

  setScreen("loading");
  setLoadedCategories(0);
  setLoadingCategoryIdx(0);
  setLoadComplete(false);
};
```

### 2D — returning-quote ack inside `generateMentor`

Find this block in `generateMentor`:

```js
const quote = selectQuote({
  archetype: archetype.id,
  tone,
  kind,
  realmId: ctxRealmId,
  ctxKey: key,
});
```

Immediately AFTER it, add:

```js
const authorSlug = quote?.author ? quote.author.toLowerCase().replace(/[^a-z]/g,"") : "";
const priorCount = authorSlug ? (quoteHistory[authorSlug] || 0) : 0;
const ackPrefix = (authorSlug && priorCount === 2 && archetype?.returningQuoteAck)
  ? archetype.returningQuoteAck.replace(/\{author\}/gi, quote.author)
  : "";
if (authorSlug) {
  setQuoteHistory(h => ({ ...h, [authorSlug]: (h[authorSlug] || 0) + 1 }));
}
```

Then find this block (a few lines down):

```js
const finalRaw = quote
  ? `${bridge} ${concept}[quote]${quote.text}[/quote][author]${quote.author}[/author]`
  : `${bridge} ${concept}`;
```

Replace with:

```js
const bridgeWithAck = ackPrefix ? `${ackPrefix} ${bridge}` : bridge;
const finalRaw = quote
  ? `${bridgeWithAck} ${concept}[quote]${quote.text}[/quote][author]${quote.author}[/author]`
  : `${bridgeWithAck} ${concept}`;
```

### 2E — speak the canonical promise on aspirational

In `generateMentor`, find:

```js
let audioUrl = null;
const { speakingText } = parseMentorMessage(finalRaw);
```

Replace those two lines with:

```js
let audioUrl = null;
let { speakingText } = parseMentorMessage(finalRaw);
if (kind === "aspirational" && archetype?.promise) {
  const promiseSpoken = archetype.promise.replace(/\*([^*]+)\*/g, "$1");
  const punct = /[.!?]\s*$/.test(speakingText) ? speakingText : `${speakingText}.`;
  speakingText = `${punct} ${promiseSpoken}`;
}
```

### 2F — profile reveal screen: drop shadowLabels, swap iceberg

Find this block in the `screen === "profile"` branch:

```js
const shadowLabels = [
  { name: "exhaustion", value: persona.bat.exhaustion.toFixed(1) },
  { name: "sleep_drift", value: persona.lifestyle.sleep.toFixed(1) },
  { name: "alexithymia", value: persona.alexithymia.toFixed(1) },
  { name: "work_pressure", value: persona.work_conditions.pressure.toFixed(1) },
  { name: "loneliness", value: persona.cognitive_health.loneliness.toFixed(1) },
];
```

DELETE the entire block.

Then find:

```jsx
<div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
  <RealmAnimation scene="iceberg" color="#c9a84c" size={{ w: 420, h: 340 }} extra={{ shadowLabels }} />
</div>
```

Replace with:

```jsx
<div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
  <video
    src="/scenes/iceberg.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{ width: 420, height: 340, maxWidth: "100%", display: "block", background: "#06060a" }}
  />
</div>
```

### 2G — profile reveal: hide composite/risk in collapsed score row

Find:

```jsx
<span>BAT Composite <span className="mono" style={{ color: "var(--gold)" }}>{profile.batComposite}</span> · Risk <span style={{ color: "var(--gold-light)" }}>{profile.risk}</span></span>
```

Replace with:

```jsx
<span style={{ fontStyle: "italic", color: "var(--silver)" }}>see the data</span>
```

(The expanded panel below — `expandedWhy.scores` — keeps the BAT bars
unchanged. The number is now one tap away by default-collapsed.)

### 2H — dashboard header: drop "Day X of 90", swap stage.title for passagePhrase

Find this block:

```jsx
<div>
  <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Day {day} of 90</div>
  <h2 className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)" }}>Recovery</h2>
</div>
<div style={{ textAlign: "right" }}>
  <div className="mono" style={{ fontSize: "8px", color: stage.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{stage.title}</div>
  <div className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)" }}>{archetype.name}</div>
</div>
```

Replace with:

```jsx
<div>
  <h2 className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)" }}>Recovery</h2>
</div>
<div style={{ textAlign: "right" }}>
  <div className="mono" style={{ fontSize: "8px", color: stage.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{passagePhrase(stage, day)}</div>
  <div className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)" }}>{archetype.name}</div>
</div>
```

### 2I — dashboard score panel: hide number, show band phrase

Find:

```jsx
<div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Recovery Score</div>
<div className="serif" style={{ fontSize: "1.3rem", color: archetype.color }}>{recoveryScore}</div>
```

Replace with:

```jsx
<div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Where you are</div>
<div className="serif" style={{ fontSize: "0.95rem", color: archetype.color, fontStyle: "italic" }}>{recoveryBandPhrase(recoveryScore)}</div>
```

### 2J — dashboard: render return greeting banner

In the `screen === "dashboard"` branch, find the opening:

```jsx
return (
  <div className="shell" style={{ padding: "1.2rem 1.4rem 2rem" }}>
    {/* Header */}
```

Insert this block IMMEDIATELY after the opening `<div className="shell"...>`
and BEFORE the `{/* Header */}` comment:

```jsx
{returnTier && archetype?.returnCopy && !returnDismissed && (
  <div style={{ padding: "0.8rem 1rem", background: archetype.color + "10", borderLeft: `2px solid ${archetype.color}`, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
    <div className="serif" style={{ fontSize: "0.85rem", fontStyle: "italic", color: "var(--cream)", flex: 1, lineHeight: 1.5 }}>
      <AnimatedText text={archetype.returnCopy[returnTier]} color={archetype.color} />
    </div>
    <span onClick={() => setReturnDismissed(true)} style={{ cursor: "pointer", color: "var(--silver)", fontSize: "0.8rem", padding: "0 4px", lineHeight: 1 }}>✕</span>
  </div>
)}
```

### 2K — aspirational screen: append "The Promise" panel

In the `screen === "aspirational"` branch, find the closing of the
mentor message block (the `<div>` containing AnimatedText + QuoteBlock)
— it ends with `</div>` immediately before the screen's closing
elements (e.g., before any back button).

Specifically locate this block:

```jsx
<div style={{ padding: "1.2rem", background: "var(--deep)", border: `1px solid ${archetype.color}30`, marginBottom: 16, minHeight: 120 }}>
  {mentorLoading ? (
    <div className="serif" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--silver)", textAlign: "center" }}>
      {archetype.name} is contemplating...
    </div>
  ) : (
    <>
      <AnimatedText text={mentorParsed.text} color={archetype.color} />
      <QuoteBlock quote={mentorParsed.quote} author={mentorParsed.author} color={archetype.color} />
    </>
  )}
</div>
```

Immediately AFTER that closing `</div>`, insert:

```jsx
{!mentorLoading && mentorRaw && archetype?.promise && (
  <div className="animate-fadeUp" style={{ padding: "1.2rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}`, marginBottom: 16 }}>
    <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
      The Promise
    </div>
    <AnimatedText text={archetype.promise} color={archetype.color} />
  </div>
)}
```

### 2L — shadow encounter: replace pattern-language paragraph

Find:

```jsx
<p style={{ color: "var(--silver)", fontSize: "0.8rem", marginBottom: 14 }}>
  {profile.shadow.name}. The data has surfaced a pattern. Naming it transfers its energy back to you.
</p>
```

Replace with:

```jsx
<p className="serif" style={{ color: "var(--silver)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
  {profile.shadow.name} has been with you a long time. To see it now is to begin the bargain.
</p>
```

### 2M — shadow encounter: replace clinical caption

Find:

```jsx
<div className="mono" style={{ fontSize: "7px", color: "var(--gold-dim)", letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>
  Auto-generated from your drift patterns
</div>
```

Replace with:

```jsx
<div className="mono" style={{ fontSize: "7px", color: "var(--gold-dim)", letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>
  Drawn from what you have been carrying
</div>
```

### 2N — shadow encounter: insert mythic-naming panel

Find the closing of the namingText panel — the `</div>` that closes the
block whose immediate next sibling is the `<button className="btn-gold" onClick={submitShadowEncounter}` button.

Specifically, find:

```jsx
<button
  className="btn-gold"
  onClick={submitShadowEncounter}
  disabled={mentorLoading || mentorRaw}
>
```

IMMEDIATELY BEFORE that `<button>`, insert:

```jsx
<div style={{ padding: "1rem", background: "rgba(139,58,58,0.06)", borderLeft: "2px solid var(--shadow-red)", marginBottom: 14 }}>
  <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#c97575", textTransform: "uppercase", marginBottom: 6 }}>
    The Shadow's Origin
  </div>
  <p className="serif" style={{ fontSize: "0.92rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.7 }}>
    {profile.shadow.mythicNaming}
  </p>
</div>
```

---

## Verification

After all edits, in Zed's terminal:

```bash
npm run build
```

Build must succeed with no errors. If a build error mentions any file
not in the change list, you've drifted out of scope — revert and report.

If the build is green, manual smoke check (`npm run dev`):

1. Login as `physician` → loading screen still shows clinical findings (those are scoped to the assessment screen, kept as-is) → profile reveal shows ICEBERG VIDEO (not pentagon) and "see the data" instead of BAT composite.
2. Dashboard header: NO "Day X of 90". Right side shows "The Setting Out · the first week".
3. Dashboard score panel: shows "still in the cold dawn" (or band-appropriate phrase), not a number.
4. Click NEXT DAY several times → score still hidden, phrase updates as score crosses bands.
5. Stage hover/click on dashboard pips: shows passage names.
6. Aspirational screen: shows mentor bridge + quote, then a separate "The Promise" panel with the canonical archetype text. Voice speaks both.
7. Shadow encounter: opens to mythic intro paragraph, namingText panel, NEW "The Shadow's Origin" panel with the four-beat text, then the OFFER button.
8. In the dev console, run `localStorage.setItem('bd_lastVisit_physician', '2026-04-25')` then reload (or close-and-reopen) and log in as `physician` again → dashboard shows the SOFT return banner from The Stoic. Click ✕ → banner dismisses for the session.

All eight pass → commit + push.

---

## Commit + push

```bash
git checkout -b mythic-tone-pass
git add lib/constants.js app/page.js
git commit -m "Mythic tone pass — stages, hide scores, return mechanic, returning-quote ack, iceberg video"
git push -u origin mythic-tone-pass
```

Open the Vercel preview URL for this branch. Verify the same 8 smoke
checks. If green, merge:

```bash
git checkout main
git merge --ff-only mythic-tone-pass
git push origin main
```

Vercel will autodeploy `main` to the production domain.

---

## Replacing the old demo on Vercel

Per CLAUDE.md, there was a known domain split — a new Vercel project got
created instead of replacing the old one. Resolution steps (do these in
the Vercel UI; they cannot be scripted from Claude):

1. Vercel dashboard → list projects. Identify which project the
   shareable demo URL currently points at (the Detalytics-facing URL).
2. If that project IS the one with this repo on `main` → pushing to
   main (above) is the deploy. Done.
3. If the demo URL points at a STALE project (the one created during
   the split):
   a. Open the stale project → Settings → Domains. Remove the demo
      domain from it.
   b. Open the live project (the one this repo is connected to) →
      Settings → Domains → add the demo domain there.
   c. Vercel will move the domain over after DNS validation
      (usually < 1 minute since DNS already resolves to Vercel).
   d. Verify the demo URL now serves the latest commit.
4. Optional: delete the stale project once the domain has migrated and
   the new one is verified working.

Verify env vars on the live project before merging:

- `MISTRAL_API_KEY` — required for mentor bridges
- `ELEVENLABS_API_KEY` — required for voice; missing key was a
  diagnosed-but-unresolved issue per CLAUDE.md, so confirm it's set
  before declaring the deploy done.

After merge: open the demo URL, run the 8 smoke checks one more time on
the live domain. Voice playing on the new project URL is the
must-confirm — the prior diagnosis stalled there.

---

## Out-of-scope items (do not touch in this pass)

If Zed's Claude proposes any of the following, REJECT — these are
separate passes:

- Any change to `lib/Mandala.js` (mandala stage 2/3/4 evolution)
- Any new files in `scenes/src/` (embers, weight, drift, fragments, forge)
- Any new component for a constellation tracker
- Refactoring `RealmAnimation.js` to a video element on screens other than profile reveal (dashboard hero + integration scene continue using canvas — they are working)
- Adding TypeScript, removing React strict mode, changing the build setup
- "Cleaning up" `lib/quotes.js` or its tagging
- Changing the cacheKeyFor structure
