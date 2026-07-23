# Detalytics Screen-Flow Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an editable stakeholder-review board showing the complete current Detalytics demo flow and the proposed cohort-game changes, with PNG and PDF exports.

**Architecture:** Capture the current interface as thirteen screen images from one representative journey. Assemble those images and three new HTML/CSS wireframes into a single static board driven by a manifest, with SVG connectors and concise annotations. Export the board as a full-resolution PNG and landscape PDF; no clickable prototype or product-code change is required.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, in-app browser capture tools, browser full-page screenshot, PDF conversion and visual QA.

## Global Constraints

- The deliverable is a screen map, not a clickable prototype.
- Existing screens use screenshots from the current running demo.
- Proposed screens use low-fidelity wireframes consistent with the current dark visual language.
- The board contains exactly 16 representative frames.
- Repeated questions and activity variants are documented as states, not duplicated as screens.
- Do not change onboarding routing, mentor selection, audio, private wellbeing logic, `lib/AudioController.js`, `lib/Mandala.js`, or `lib/quotes.js`.
- Never show participant ranking, names of other participants, individual wellbeing answers, raw health scores, or diagnostic scores.
- Only aggregate cohort data is visible outside the participant’s private view.
- Final outputs: editable HTML source, full-resolution PNG, and landscape PDF.

---

## File structure

Create:

- `design/flow-board/index.html` — board structure, lanes, frames, annotations, connectors, and proposed wireframes.
- `design/flow-board/styles.css` — print-safe board layout and current/revised/new visual states.
- `design/flow-board/board-data.js` — canonical 16-frame manifest and connector definitions.
- `design/flow-board/assets/current/` — thirteen captured current-demo screens.
- `design/flow-board/assets/exports/detalytics-screen-flow-board.png` — full-resolution stakeholder export.
- `design/flow-board/assets/exports/detalytics-screen-flow-board.pdf` — landscape stakeholder export.
- `tests/flow-board.test.mjs` — structural and privacy assertions for the design board.

Do not modify application source files for this deliverable.

---

### Task 1: Define and test the canonical screen manifest

**Files:**

- Create: `tests/flow-board.test.mjs`
- Create: `design/flow-board/board-data.js`

**Interfaces:**

- Produces: `window.FLOW_BOARD` with `{ frames, connectors }`.
- `frames` is an array of `{ id, lane, title, status, purpose, entry, action, exit, asset }`.
- `connectors` is an array of `{ from, to, kind }`, where `kind` is `current`, `proposed`, or `return`.
- Later tasks consume frame IDs and asset paths from this manifest.

- [ ] **Step 1: Write the failing manifest test**

Create `tests/flow-board.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadBoardData() {
  const source = fs.readFileSync("design/flow-board/board-data.js", "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.FLOW_BOARD;
}

test("manifest contains the approved 16 frames", () => {
  const board = loadBoardData();
  assert.equal(board.frames.length, 16);
  assert.deepEqual(
    [...new Set(board.frames.map((frame) => frame.lane))],
    ["entry", "setup", "daily", "cohort"],
  );
  assert.equal(new Set(board.frames.map((frame) => frame.id)).size, 16);
});

test("current and proposed frames are correctly separated", () => {
  const board = loadBoardData();
  assert.equal(board.frames.filter((frame) => frame.status === "current").length, 13);
  assert.equal(board.frames.filter((frame) => frame.status === "revised").length, 1);
  assert.equal(board.frames.filter((frame) => frame.status === "new").length, 2);
});

test("manifest contains the required cohort screens", () => {
  const board = loadBoardData();
  const ids = new Set(board.frames.map((frame) => frame.id));
  for (const id of ["dashboard-cohort", "cohort-progress", "program-summary"]) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});

test("all current frames reference captured assets", () => {
  const board = loadBoardData();
  for (const frame of board.frames.filter((item) => item.status === "current")) {
    assert.match(frame.asset, /^assets\/current\/.+\.png$/);
  }
});

test("connectors reference valid frames", () => {
  const board = loadBoardData();
  const ids = new Set(board.frames.map((frame) => frame.id));
  for (const connector of board.connectors) {
    assert.ok(ids.has(connector.from), `unknown connector source ${connector.from}`);
    assert.ok(ids.has(connector.to), `unknown connector target ${connector.to}`);
    assert.ok(["current", "proposed", "return"].includes(connector.kind));
  }
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
npm test -- --test-name-pattern="manifest|current and proposed|required cohort|connectors"
```

Expected: FAIL because `design/flow-board/board-data.js` does not exist.

- [ ] **Step 3: Create the 16-frame manifest**

Create `design/flow-board/board-data.js` with these exact frame IDs and statuses:

```js
window.FLOW_BOARD = {
  frames: [
    { id: "landing", lane: "entry", title: "Landing and login", status: "current", purpose: "Identify the participant and begin the journey.", entry: "Open demo", action: "Enter participant name", exit: "Domain selection", asset: "assets/current/01-landing.png" },
    { id: "domain", lane: "entry", title: "Domain selection", status: "current", purpose: "Choose the area to explore.", entry: "Login submitted", action: "Choose one domain", exit: "Intent selection", asset: "assets/current/02-domain.png" },
    { id: "intent", lane: "entry", title: "Intent selection", status: "current", purpose: "Choose whether to take stock, steady strain, or build forward.", entry: "Domain selected", action: "Choose one intent", exit: "Check-in questions", asset: "assets/current/03-intent.png" },
    { id: "question", lane: "entry", title: "Representative check-in question", status: "current", purpose: "Collect one response in the five-question sequence.", entry: "Intent selected", action: "Choose an answer or opt out", exit: "Next question or starting point", asset: "assets/current/04-question.png" },
    { id: "starting-point", lane: "entry", title: "Suggested starting point", status: "current", purpose: "Explain the suggested path without diagnostic framing.", entry: "Five questions completed", action: "Accept path or choose another area", exit: "Mentor selection", asset: "assets/current/05-starting-point.png" },
    { id: "mentor", lane: "setup", title: "Mentor selection", status: "current", purpose: "Choose the guide and archetype.", entry: "Path accepted", action: "Choose mentor", exit: "Voice selection", asset: "assets/current/06-mentor.png" },
    { id: "voice", lane: "setup", title: "Voice selection", status: "current", purpose: "Choose the mentor voice.", entry: "Mentor selected", action: "Preview and select voice", exit: "Tone selection", asset: "assets/current/07-voice.png" },
    { id: "tone", lane: "setup", title: "Tone selection", status: "current", purpose: "Choose the communication style.", entry: "Voice selected", action: "Choose tone", exit: "Journey introduction", asset: "assets/current/08-tone.png" },
    { id: "introduction", lane: "setup", title: "Journey introduction", status: "current", purpose: "Introduce the chosen guide and first message.", entry: "Tone selected", action: "Continue", exit: "Main dashboard", asset: "assets/current/09-introduction.png" },
    { id: "dashboard", lane: "daily", title: "Main dashboard", status: "current", purpose: "Show the active focus, mentor, activities, learning, and personal progress.", entry: "Setup completed or returning visit", action: "Choose activity, learning, or reflection", exit: "Selected daily-use state", asset: "assets/current/10-dashboard.png" },
    { id: "path", lane: "daily", title: "Path activity state", status: "current", purpose: "Complete one recommended practice.", entry: "Path activity selected", action: "Mark activity explored", exit: "Dashboard", asset: "assets/current/11-path.png" },
    { id: "constellation", lane: "daily", title: "Constellation learning state", status: "current", purpose: "Explore and complete a learning node.", entry: "Constellation selected", action: "Open or complete node", exit: "Dashboard", asset: "assets/current/12-constellation.png" },
    { id: "reflection", lane: "daily", title: "Reflection or conversation", status: "current", purpose: "Name what the participant is noticing.", entry: "Conversation selected", action: "Submit reflection or return", exit: "Dashboard", asset: "assets/current/13-reflection.png" },
    { id: "dashboard-cohort", lane: "cohort", title: "Participant dashboard with cohort meter", status: "revised", purpose: "Add aggregate cohort progress to the existing dashboard.", entry: "Setup completed or returning visit", action: "Review contribution and open cohort progress", exit: "Shared cohort progress", asset: null },
    { id: "cohort-progress", lane: "cohort", title: "Shared cohort progress", status: "new", purpose: "Show aggregate weekly progress and milestones.", entry: "Cohort meter selected", action: "Review breadth, consistency, learning, and milestones", exit: "Dashboard", asset: null },
    { id: "program-summary", lane: "cohort", title: "Program aggregate summary", status: "new", purpose: "Show employer or school program engagement without personal data.", entry: "Program-owner access", action: "Review aggregate participation and content completion", exit: "Program navigation", asset: null },
  ],
  connectors: [
    { from: "landing", to: "domain", kind: "current" },
    { from: "domain", to: "intent", kind: "current" },
    { from: "intent", to: "question", kind: "current" },
    { from: "question", to: "starting-point", kind: "current" },
    { from: "starting-point", to: "mentor", kind: "current" },
    { from: "mentor", to: "voice", kind: "current" },
    { from: "voice", to: "tone", kind: "current" },
    { from: "tone", to: "introduction", kind: "current" },
    { from: "introduction", to: "dashboard", kind: "current" },
    { from: "dashboard", to: "path", kind: "current" },
    { from: "path", to: "dashboard", kind: "return" },
    { from: "dashboard", to: "constellation", kind: "current" },
    { from: "constellation", to: "dashboard", kind: "return" },
    { from: "dashboard", to: "reflection", kind: "current" },
    { from: "reflection", to: "dashboard", kind: "return" },
    { from: "dashboard", to: "dashboard-cohort", kind: "proposed" },
    { from: "dashboard-cohort", to: "cohort-progress", kind: "proposed" },
  ],
};
```

- [ ] **Step 4: Run the manifest tests**

Run:

```bash
npm test -- --test-name-pattern="manifest|current and proposed|required cohort|connectors"
```

Expected: all five tests PASS.

- [ ] **Step 5: Commit the manifest**

```bash
git add design/flow-board/board-data.js tests/flow-board.test.mjs
git commit -m "Add screen-flow board manifest"
```

---

### Task 2: Capture the thirteen current screens

**Files:**

- Create: `design/flow-board/assets/current/01-landing.png`
- Create: `design/flow-board/assets/current/02-domain.png`
- Create: `design/flow-board/assets/current/03-intent.png`
- Create: `design/flow-board/assets/current/04-question.png`
- Create: `design/flow-board/assets/current/05-starting-point.png`
- Create: `design/flow-board/assets/current/06-mentor.png`
- Create: `design/flow-board/assets/current/07-voice.png`
- Create: `design/flow-board/assets/current/08-tone.png`
- Create: `design/flow-board/assets/current/09-introduction.png`
- Create: `design/flow-board/assets/current/10-dashboard.png`
- Create: `design/flow-board/assets/current/11-path.png`
- Create: `design/flow-board/assets/current/12-constellation.png`
- Create: `design/flow-board/assets/current/13-reflection.png`

**Interfaces:**

- Consumes: asset paths from `window.FLOW_BOARD.frames`.
- Produces: thirteen readable PNG screenshots with identical viewport dimensions.

- [ ] **Step 1: Start the current demo**

Run:

```bash
npm run dev
```

Expected: Next.js reports a local URL and the app loads without a compile error.

- [ ] **Step 2: Capture one representative journey**

Use the in-app browser control skill with a fixed mobile viewport of 430 × 932. Navigate one continuous path:

```text
Landing → Body → Take Stock → five answers → suggested starting point
→ recommended mentor → recommended voice → recommended tone
→ journey introduction → dashboard → first Path activity
→ Constellation → reflection
```

At each of the thirteen named states, save a full-viewport PNG to the exact asset path listed above. Use the same participant identity and chosen path throughout.

- [ ] **Step 3: Verify dimensions and file presence**

Run:

```bash
node -e '
const fs = require("fs");
for (let i = 1; i <= 13; i++) {
  const prefix = String(i).padStart(2, "0");
  const match = fs.readdirSync("design/flow-board/assets/current").find((name) => name.startsWith(prefix + "-"));
  if (!match) throw new Error("missing screenshot " + prefix);
  if (fs.statSync("design/flow-board/assets/current/" + match).size < 20000) {
    throw new Error("screenshot too small " + match);
  }
}
console.log("13 screenshots present");
'
```

Expected: `13 screenshots present`.

- [ ] **Step 4: Inspect every screenshot**

Open all thirteen images at full size. Confirm:

- no browser chrome;
- no loading spinner;
- readable copy;
- no clipped controls;
- consistent viewport;
- no accidental personal information.

Recapture any screen that fails.

- [ ] **Step 5: Commit the screenshots**

```bash
git add design/flow-board/assets/current
git commit -m "Capture current Detalytics demo flow"
```

---

### Task 3: Build the editable board and proposed wireframes

**Files:**

- Create: `design/flow-board/index.html`
- Create: `design/flow-board/styles.css`
- Modify: `tests/flow-board.test.mjs`

**Interfaces:**

- Consumes: `window.FLOW_BOARD` and thirteen screenshot asset paths.
- Produces: a static, editable board with four lanes and exactly sixteen `.flow-frame` elements.

- [ ] **Step 1: Add failing board-structure and privacy tests**

Append to `tests/flow-board.test.mjs`:

```js
test("board renders the required structure and privacy statements", () => {
  const html = fs.readFileSync("design/flow-board/index.html", "utf8");
  assert.match(html, /id="flow-board"/);
  assert.match(html, /data-frame-id="dashboard-cohort"/);
  assert.match(html, /data-frame-id="cohort-progress"/);
  assert.match(html, /data-frame-id="program-summary"/);
  assert.match(html, /No participant ranking/i);
  assert.match(html, /No personal answers or individual wellbeing scores/i);
});

test("board styles include screen and print layouts", () => {
  const css = fs.readFileSync("design/flow-board/styles.css", "utf8");
  assert.match(css, /\.flow-frame/);
  assert.match(css, /\.status-new/);
  assert.match(css, /@media print/);
  assert.match(css, /size:\s*A1 landscape/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- --test-name-pattern="board renders|board styles"
```

Expected: FAIL because `index.html` and `styles.css` do not exist.

- [ ] **Step 3: Create the board stylesheet**

Create `design/flow-board/styles.css` with:

```css
:root {
  --canvas: #f4f5f7;
  --ink: #111318;
  --muted: #62666d;
  --rule: #b8bcc4;
  --blue: #3d8dff;
  --blue-soft: #e8f3ff;
  --amber: #f4b548;
  --dark: #111318;
  --frame-w: 300px;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--canvas); color: var(--ink); font-family: Arial, sans-serif; }
#flow-board { width: 5200px; min-height: 2850px; padding: 80px; position: relative; background: var(--canvas); }
.board-title { font-size: 52px; margin: 0 0 12px; }
.board-subtitle { color: var(--muted); font-size: 24px; margin-bottom: 64px; }
.lane { display: grid; grid-template-columns: 260px 1fr; gap: 32px; margin-bottom: 76px; position: relative; }
.lane-heading { border-top: 4px solid var(--ink); padding-top: 16px; }
.lane-heading h2 { margin: 0 0 8px; font-size: 26px; }
.lane-heading p { margin: 0; color: var(--muted); line-height: 1.5; }
.lane-frames { display: flex; gap: 40px; align-items: flex-start; }
.flow-frame { width: var(--frame-w); background: #fff; border: 1px solid var(--rule); padding: 14px; position: relative; }
.flow-frame.status-revised, .flow-frame.status-new { border: 3px dashed var(--blue); background: var(--blue-soft); }
.frame-badge { font-size: 12px; font-weight: 700; letter-spacing: .14em; color: var(--muted); margin-bottom: 10px; }
.status-revised .frame-badge, .status-new .frame-badge { color: var(--blue); }
.screen-image, .screen-wireframe { width: 100%; aspect-ratio: 430 / 932; object-fit: cover; object-position: top; background: var(--dark); display: block; }
.annotation { border-top: 1px solid var(--rule); margin-top: 14px; padding-top: 12px; font-size: 13px; line-height: 1.45; }
.annotation dt { font-weight: 700; }
.annotation dd { margin: 0 0 8px; color: var(--muted); }
.wire-card { margin: 16px; padding: 14px; border: 1px solid #39404a; color: #f5f1e8; }
.wire-meter { height: 10px; background: #303640; margin: 12px 0; }
.wire-meter span { display: block; width: 64%; height: 100%; background: var(--blue); }
.privacy-note { background: #191d23; color: #bfc3ca; padding: 12px; font-size: 12px; }
.board-rule { margin: 30px 0; border: 0; border-top: 1px solid var(--rule); }
@page { size: A1 landscape; margin: 8mm; }
@media print {
  body { background: #fff; }
  #flow-board { transform-origin: top left; }
}
```

- [ ] **Step 4: Create the editable board markup**

Create `design/flow-board/index.html` as a complete HTML document that:

1. loads `styles.css` and `board-data.js`;
2. contains `<main id="flow-board">`;
3. renders four lane containers in this order: `entry`, `setup`, `daily`, `cohort`;
4. renders existing frames as `<img class="screen-image">`;
5. renders `dashboard-cohort`, `cohort-progress`, and `program-summary` as HTML wireframes;
6. includes the exact statements:
   - `No participant ranking`
   - `No personal answers or individual wellbeing scores`
7. creates annotations from each manifest object;
8. includes an SVG overlay whose lines use `current`, `proposed`, and `return` classes.

Use this rendering pattern:

```html
<script src="board-data.js"></script>
<script>
  const board = window.FLOW_BOARD;
  const laneNames = {
    entry: ["1. Entry and check-in", "Login through suggested starting point"],
    setup: ["2. Mentor setup", "Mentor, voice, tone, and introduction"],
    daily: ["3. Daily use", "Dashboard, Path, Constellation, and reflection"],
    cohort: ["4. Proposed cohort layer", "Revised participant view and aggregate views"],
  };

  function wireframe(frame) {
    if (frame.id === "dashboard-cohort") {
      return `<div class="screen-wireframe">
        <div class="wire-card"><strong>Your cohort this week</strong><div class="wire-meter"><span></span></div><small>64% toward the weekly milestone</small></div>
        <div class="wire-card"><strong>Your contribution</strong><p>1 practice and 1 learning node</p></div>
        <div class="privacy-note">No participant ranking. Your details remain private.</div>
      </div>`;
    }
    if (frame.id === "cohort-progress") {
      return `<div class="screen-wireframe">
        <div class="wire-card"><strong>Weekly cohort progress</strong><div class="wire-meter"><span></span></div></div>
        <div class="wire-card">Breadth 72% · Consistency 58% · Learning 64%</div>
        <div class="wire-card">Current milestone: 60% reached</div>
        <div class="privacy-note">Aggregate progress only.</div>
      </div>`;
    }
    return `<div class="screen-wireframe">
      <div class="wire-card"><strong>Program summary</strong></div>
      <div class="wire-card">Weekly participation · Return rate · Activity completion · Learning completion</div>
      <div class="privacy-note">No personal answers or individual wellbeing scores.</div>
    </div>`;
  }

  function frameMarkup(frame) {
    const visual = frame.asset
      ? `<img class="screen-image" src="${frame.asset}" alt="${frame.title}">`
      : wireframe(frame);
    return `<article class="flow-frame status-${frame.status}" data-frame-id="${frame.id}">
      <div class="frame-badge">${frame.status.toUpperCase()}</div>
      <h3>${frame.title}</h3>
      ${visual}
      <dl class="annotation">
        <dt>Purpose</dt><dd>${frame.purpose}</dd>
        <dt>Entry</dt><dd>${frame.entry}</dd>
        <dt>Action</dt><dd>${frame.action}</dd>
        <dt>Exit</dt><dd>${frame.exit}</dd>
      </dl>
    </article>`;
  }

  const root = document.getElementById("flow-board");
  root.insertAdjacentHTML("beforeend", `<h1 class="board-title">Detalytics complete demo flow</h1>
    <p class="board-subtitle">Current experience and proposed cohort-game changes</p>`);
  for (const laneId of Object.keys(laneNames)) {
    const [title, description] = laneNames[laneId];
    const frames = board.frames.filter((frame) => frame.lane === laneId);
    root.insertAdjacentHTML("beforeend", `<section class="lane" data-lane="${laneId}">
      <header class="lane-heading"><h2>${title}</h2><p>${description}</p></header>
      <div class="lane-frames">${frames.map(frameMarkup).join("")}</div>
    </section>`);
  }
</script>
```

- [ ] **Step 5: Run board tests**

Run:

```bash
npm test -- --test-name-pattern="board renders|board styles"
```

Expected: both tests PASS.

- [ ] **Step 6: Open and visually inspect the board**

Open `design/flow-board/index.html` in the in-app browser. Verify:

- all sixteen frames render;
- all thirteen screenshots load;
- all proposed wireframes are readable;
- four lanes are visually distinct;
- no annotation overlaps its screen;
- statuses are unambiguous.

- [ ] **Step 7: Commit the board source**

```bash
git add design/flow-board/index.html design/flow-board/styles.css tests/flow-board.test.mjs
git commit -m "Build editable Detalytics screen-flow board"
```

---

### Task 4: Add connectors and proposed-state variants

**Files:**

- Modify: `design/flow-board/index.html`
- Modify: `design/flow-board/styles.css`
- Modify: `tests/flow-board.test.mjs`

**Interfaces:**

- Consumes: `window.FLOW_BOARD.connectors`.
- Produces: visible current, proposed, and return connectors plus comeback, milestone, and final-target variants.

- [ ] **Step 1: Add failing connector and state tests**

Append:

```js
test("board includes connector and proposed-state hooks", () => {
  const html = fs.readFileSync("design/flow-board/index.html", "utf8");
  for (const token of [
    "connector-layer",
    "state-comeback",
    "state-milestone",
    "state-final-target",
    "data-connector-kind",
  ]) {
    assert.match(html, new RegExp(token));
  }
});
```

- [ ] **Step 2: Run test and verify failure**

Run:

```bash
npm test -- --test-name-pattern="connector and proposed-state"
```

Expected: FAIL because the hooks are absent.

- [ ] **Step 3: Implement connectors**

Add `<svg id="connector-layer" aria-label="Screen connections"></svg>` as the first child of `#flow-board`. After all frames render:

```js
function drawConnectors() {
  const rootRect = root.getBoundingClientRect();
  const svg = document.getElementById("connector-layer");
  svg.setAttribute("viewBox", `0 0 ${root.scrollWidth} ${root.scrollHeight}`);
  svg.innerHTML = board.connectors.map((connector) => {
    const from = document.querySelector(`[data-frame-id="${connector.from}"]`).getBoundingClientRect();
    const to = document.querySelector(`[data-frame-id="${connector.to}"]`).getBoundingClientRect();
    const x1 = from.right - rootRect.left;
    const y1 = from.top + from.height / 2 - rootRect.top;
    const x2 = to.left - rootRect.left;
    const y2 = to.top + to.height / 2 - rootRect.top;
    return `<path data-connector-kind="${connector.kind}" class="connector ${connector.kind}"
      d="M ${x1} ${y1} C ${x1 + 28} ${y1}, ${x2 - 28} ${y2}, ${x2} ${y2}" />`;
  }).join("");
}
requestAnimationFrame(drawConnectors);
```

Add:

```css
#connector-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.connector { fill: none; stroke: var(--rule); stroke-width: 3; }
.connector.proposed { stroke: var(--blue); stroke-dasharray: 10 8; }
.connector.return { stroke: var(--muted); stroke-dasharray: 4 6; }
```

- [ ] **Step 4: Add the three proposed-state variants**

Inside the revised participant and cohort frames, include:

```html
<div class="state-variant state-comeback">
  <strong>Comeback credit</strong>
  <span>Your first contribution after seven inactive days receives one private extra credit.</span>
</div>
<div class="state-variant state-milestone">
  <strong>Weekly milestone reached</strong>
  <span>The cohort unlocks the next shared content item.</span>
</div>
<div class="state-variant state-final-target">
  <strong>Final cohort target reached</strong>
  <span>The cohort receives one shared completion marker. No winner is named.</span>
</div>
```

Add:

```css
.state-variant { margin: 12px 16px; padding: 12px; border-left: 3px solid var(--blue); background: #202630; color: #f5f1e8; font-size: 12px; }
.state-variant strong, .state-variant span { display: block; }
.state-variant span { color: #bcc3ce; margin-top: 5px; line-height: 1.4; }
```

- [ ] **Step 5: Run all tests**

Run:

```bash
npm test
```

Expected: all project and flow-board tests PASS.

- [ ] **Step 6: Inspect connector routing at full board size**

Open the board and confirm:

- connectors terminate at frame edges;
- lines do not cross frame text;
- return connectors are visually distinct;
- proposed connectors are blue and dotted;
- program summary remains separate from participant navigation.

- [ ] **Step 7: Commit connectors and state variants**

```bash
git add design/flow-board/index.html design/flow-board/styles.css tests/flow-board.test.mjs
git commit -m "Add flow connectors and cohort state variants"
```

---

### Task 5: Export and verify stakeholder deliverables

**Files:**

- Create: `design/flow-board/assets/exports/detalytics-screen-flow-board.png`
- Create: `design/flow-board/assets/exports/detalytics-screen-flow-board.pdf`
- Create: `design/flow-board/README.md`

**Interfaces:**

- Consumes: final `index.html`, stylesheet, manifest, screenshots, and wireframes.
- Produces: editable source, full-resolution PNG, landscape PDF, and usage notes.

- [ ] **Step 1: Create the README**

Create `design/flow-board/README.md`:

```md
# Detalytics screen-flow board

Open `index.html` to inspect the editable stakeholder-review board.

## Exports

- `assets/exports/detalytics-screen-flow-board.png`
- `assets/exports/detalytics-screen-flow-board.pdf`

## Status key

- Current: screenshot from the working demo
- Revised: existing screen with proposed cohort additions
- New: proposed screen

The board is not a clickable prototype. It documents navigation, screen purpose, proposed changes, progress calculation, and privacy boundaries.
```

- [ ] **Step 2: Capture the full board as PNG**

Serve the directory:

```bash
python3 -m http.server 4173 --directory design/flow-board
```

Open `http://localhost:4173/` with the browser control skill and capture a full-page screenshot at the board’s native width. Save it to:

```text
design/flow-board/assets/exports/detalytics-screen-flow-board.png
```

Expected: one image containing all four lanes and all sixteen frames.

- [ ] **Step 3: Create the landscape PDF**

Use the PDF skill to place the full board on a landscape page without cropping. Preserve the aspect ratio and create:

```text
design/flow-board/assets/exports/detalytics-screen-flow-board.pdf
```

The page may be A1 landscape or a custom landscape page matching the board aspect ratio. Do not split a lane across pages.

- [ ] **Step 4: Verify the PNG and PDF visually**

Inspect:

- the full PNG;
- the rendered PDF page;
- each proposed screen at original size.

Confirm:

- all sixteen frames are present;
- text is readable at 100% zoom;
- no connectors are clipped;
- status badges are visible;
- no screenshot is stretched;
- privacy notes are visible;
- PDF margins are consistent.

- [ ] **Step 5: Verify source and exports**

Run:

```bash
npm test
npm run build
node -e '
const fs = require("fs");
for (const path of [
  "design/flow-board/index.html",
  "design/flow-board/board-data.js",
  "design/flow-board/styles.css",
  "design/flow-board/assets/exports/detalytics-screen-flow-board.png",
  "design/flow-board/assets/exports/detalytics-screen-flow-board.pdf",
]) {
  if (!fs.existsSync(path) || fs.statSync(path).size === 0) throw new Error("missing " + path);
}
console.log("flow-board deliverables verified");
'
```

Expected:

- all tests PASS;
- production build succeeds;
- `flow-board deliverables verified`.

- [ ] **Step 6: Commit final deliverables**

```bash
git add design/flow-board tests/flow-board.test.mjs
git commit -m "Deliver Detalytics stakeholder screen-flow board"
```
