# Detalytics complete demo screen-flow board

Date: 2026-07-23

## Purpose

Create a stakeholder-review design showing the full Detalytics demo flow and the proposed cohort-game changes.

The deliverable is a screen map, not a clickable prototype. It must let a reviewer understand:

- every major step in the current experience;
- how screens connect;
- which screens already exist;
- which screens will change;
- which cohort screens are new;
- what information remains private;
- how participant activity contributes to cohort progress.

## Recommended format

Create one Figma-style master board composed of:

1. screenshots from the working demo for existing screens;
2. low-fidelity but visually consistent wireframes for proposed screens;
3. connectors showing navigation and return paths;
4. concise annotations beside each screen;
5. explicit badges for `CURRENT`, `REVISED`, and `NEW`;
6. a PDF export for circulation.

If direct Figma authoring is unavailable, create an editable equivalent with the same board structure and provide assets that can be imported or recreated in Figma without redesigning the information architecture.

## Board organization

The master board is divided into four horizontal lanes.

### Lane 1: Entry and check-in

1. Landing and login
2. Domain selection
3. Intent selection
4. Representative check-in question
5. Suggested starting point

The representative question frame documents the repeated-question pattern. The board does not duplicate all five questions.

### Lane 2: Mentor setup

6. Mentor selection
7. Voice selection
8. Tone selection
9. Journey introduction

### Lane 3: Daily use

10. Main dashboard
11. Path activity state
12. Constellation learning state
13. Reflection or conversation state

The dashboard is the central hub. Connectors show that Path, Constellation, and reflection actions return to it.

### Lane 4: Proposed cohort layer

14. Participant dashboard with cohort meter
15. Shared cohort progress and weekly milestone view
16. Program-level aggregate summary

Additional states are shown as variants within frames 14 and 15:

- comeback bonus after seven or more inactive days;
- weekly milestone reached;
- final cohort target reached.

## Existing-screen treatment

Existing screens use screenshots captured from the current running demo.

Each screenshot must:

- use the same representative participant journey;
- show realistic content rather than placeholder text;
- crop out browser chrome unless the browser context matters;
- retain the existing visual design;
- include a short note only where wording or behavior has changed;
- be large enough for stakeholders to read without opening a separate file.

The design board does not redesign existing screens unless the proposal specifically requires a change.

## Proposed cohort screens

### Participant dashboard with cohort meter

This is a revision of the existing dashboard, not a separate home screen.

Add:

- a shared cohort-progress meter;
- the current weekly milestone;
- a short explanation of how the participant contributed;
- a private comeback-bonus state;
- a link to the detailed shared-progress view.

Keep:

- the active focus area;
- mentor message;
- Path activities;
- Constellation;
- personal journey progress;
- reflection or conversation entry.

Do not show:

- participant ranking;
- names of other participants;
- individual wellbeing answers;
- raw health or diagnostic scores;
- team-versus-team competition.

### Shared cohort progress and weekly milestone view

Show:

- one aggregate progress meter;
- participation breadth;
- aggregate consistency;
- learning completion;
- current weekly target;
- completed milestones;
- final cohort target;
- a short explanation that progress is normalized to cohort size.

Do not show individual-level contribution data.

### Program-level aggregate summary

This is intended for the employer or school program owner.

Show:

- enrolled participant count;
- weekly participation rate;
- return-after-absence rate;
- activity completion by category;
- learning completion by topic;
- milestone history.

Do not show:

- individual answers;
- individual inferred states;
- participant wellbeing scores;
- individual activity histories;
- small-group breakdowns that could identify participants.

## Activity model shown in the designs

The board uses activities already present in the demo.

### Daily rhythm

- fixed or consistent wake time;
- wind-down hour;
- morning light;
- twenty minutes outside.

### Focus and reset

- physiological sigh;
- name three things;
- two-minute rule;
- deep-work block.

### Connection and work

- one real question;
- voice note instead of text;
- one real delegation;
- sunset shutdown.

### Learning and reflection

- Constellation node;
- active recall;
- spaced review;
- short reflection or conversation.

The participant dashboard shows three recommended Path activities at a time. Learning and reflection are optional additional contribution types.

## Progress model shown in the designs

### Individual contribution credits

- Complete one Path activity: 1 credit, capped at one credited activity per day.
- Complete one learning node: 1 credit, capped at two credited nodes per week.
- Complete one reflection or conversation: 1 credit, capped at one credited reflection per week.
- Return after seven or more inactive days: one private extra credit, applied once.

### Weekly cohort score

- 50% participation breadth: percentage of enrolled participants contributing at least once.
- 30% consistency: percentage of enrolled participants active on three or more distinct days.
- 20% learning: completion against the weekly cohort learning target.

All measures are normalized to cohort size. Daily and weekly caps prevent a small number of highly active participants from carrying the cohort.

## Annotation system

Every screen card contains:

- **Screen name**
- **Purpose**
- **Entry**: how the participant arrives
- **Primary action**
- **Exit**: where the action leads
- **Status**: current, revised, or new
- **Change note**: one concise description of the proposed change

Connector conventions:

- solid gray arrow: current navigation;
- blue arrow: proposed or revised navigation;
- returning arrow: action returns to the dashboard;
- dotted blue boundary: proposed screen;
- amber note: program-owner-only view.

## Component conventions

Use a small shared component set across proposed wireframes:

- screen header;
- current passage or week label;
- cohort-progress meter;
- milestone marker;
- Path activity card;
- Constellation summary;
- comeback note;
- privacy note;
- aggregate metric block.

Proposed components should reflect the current demo’s dark, mythic visual language without introducing a separate design system.

## Deliverable package

1. Master screen-flow board containing all 16 representative frames.
2. Detailed current-versus-proposed section at readable size.
3. PDF export for stakeholder circulation.
4. Source design file or editable equivalent.
5. Folder of source screenshots and proposed-screen exports.

No clickable prototype is required.

## Review criteria

The deliverable is complete when a stakeholder can answer:

- What happens from login to daily use?
- Which screens already exist?
- Which screens change?
- What new cohort screens are proposed?
- What activities contribute to progress?
- How is progress calculated?
- What does a participant see?
- What does the cohort see?
- What does a program owner see?
- Which information remains private?

## Out of scope

- redesigning the full visual identity;
- implementing cohort data storage;
- creating employer or school administration workflows beyond the aggregate summary;
- producing all question and activity variants as separate frames;
- building a clickable prototype;
- modifying onboarding routing, mentor selection, audio, or private wellbeing logic.
