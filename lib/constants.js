// ═══════════════════════════════════════════════════════════════════════════
// PERSONAS — simulate 42 app assessment data
// Each persona has scores across ALL Detalytics dimensions
// ═══════════════════════════════════════════════════════════════════════════

export const PERSONAS = [
  {
    id: "physician",
    label: "The Burnt-Out Physician",
    defaultName: "Dr. K. Mehta",
    context: "ICU Physician, 14-hour shifts",
    bat: { exhaustion: 4.4, mental_distance: 2.8, cognitive: 3.6, emotional: 4.1 },
    cognitive_health: { depression: 3.2, anxiety: 4.0, resilience: 2.4, stress: 4.3, social_support: 2.8, loneliness: 3.4 },
    lifestyle: { sleep: 4.6, diet: 3.8, activity: 4.2, sedentary: 3.6, tobacco: 1.0, alcohol: 3.2 },
    alexithymia: 3.4,
    self_efficacy: 3.1,
    metabolic_risk: 3.2,
    personality: { openness: 3.8, conscientiousness: 4.6, extraversion: 2.4, agreeableness: 4.2, neuroticism: 3.4 },
    work_conditions: { hours: 4.6, autonomy: 2.0, pressure: 4.8, meaning: 3.9, support: 2.2 },
    gifts: "the discipline that holds when others fold · the steady care that brought you to this work · the meaning still found in the worst hour",
  },
  {
    id: "caregiver",
    label: "The Depleted Caregiver",
    defaultName: "S. Williams",
    context: "Oncology Nurse, primary family caregiver",
    bat: { exhaustion: 4.2, mental_distance: 2.2, cognitive: 2.8, emotional: 4.3 },
    cognitive_health: { depression: 3.8, anxiety: 3.6, resilience: 2.8, stress: 4.0, social_support: 2.0, loneliness: 4.1 },
    lifestyle: { sleep: 4.2, diet: 3.2, activity: 4.0, sedentary: 3.0, tobacco: 1.0, alcohol: 2.4 },
    alexithymia: 2.8,
    self_efficacy: 2.6,
    metabolic_risk: 2.8,
    personality: { openness: 3.4, conscientiousness: 4.2, extraversion: 3.6, agreeableness: 4.8, neuroticism: 3.8 },
    work_conditions: { hours: 4.0, autonomy: 2.4, pressure: 4.2, meaning: 4.2, support: 2.0 },
    gifts: "a heart that does not turn away · the muscle of care given at scale · the meaning that has not gone out of the work",
  },
  {
    id: "executive",
    label: "The Cynical Executive",
    defaultName: "M. Chen",
    context: "VP Engineering, tech scale-up",
    bat: { exhaustion: 3.4, mental_distance: 4.5, cognitive: 3.2, emotional: 3.0 },
    cognitive_health: { depression: 3.0, anxiety: 3.2, resilience: 3.8, stress: 3.8, social_support: 3.2, loneliness: 3.6 },
    lifestyle: { sleep: 3.6, diet: 3.4, activity: 3.4, sedentary: 4.4, tobacco: 1.0, alcohol: 3.6 },
    alexithymia: 3.2,
    self_efficacy: 4.2,
    metabolic_risk: 3.6,
    personality: { openness: 4.2, conscientiousness: 4.4, extraversion: 3.8, agreeableness: 2.8, neuroticism: 2.6 },
    work_conditions: { hours: 4.2, autonomy: 4.0, pressure: 4.4, meaning: 2.2, support: 3.0 },
    gifts: "the agency to choose your own course · the openness to see what is changing · the trust in yourself to act",
  },
  {
    id: "alexithymic",
    label: "The Alexithymic High-Performer",
    defaultName: "A. Patel",
    context: "Senior engineer, solo contributor",
    bat: { exhaustion: 3.6, mental_distance: 3.0, cognitive: 3.4, emotional: 3.2 },
    cognitive_health: { depression: 2.8, anxiety: 3.0, resilience: 3.4, stress: 3.6, social_support: 3.0, loneliness: 3.8 },
    lifestyle: { sleep: 3.4, diet: 3.2, activity: 3.6, sedentary: 4.0, tobacco: 1.0, alcohol: 2.2 },
    alexithymia: 4.5,
    self_efficacy: 4.0,
    metabolic_risk: 3.0,
    personality: { openness: 3.6, conscientiousness: 4.5, extraversion: 2.2, agreeableness: 3.4, neuroticism: 3.0 },
    work_conditions: { hours: 3.8, autonomy: 4.2, pressure: 3.6, meaning: 3.6, support: 3.0 },
    gifts: "deep discipline · careful work · the precision of someone who notices what others miss",
  },
  {
    id: "founder",
    label: "The Scattered Founder",
    defaultName: "R. Shah",
    context: "Startup founder, 3 years in",
    bat: { exhaustion: 4.0, mental_distance: 3.2, cognitive: 4.4, emotional: 3.6 },
    cognitive_health: { depression: 3.2, anxiety: 4.2, resilience: 3.6, stress: 4.5, social_support: 2.8, loneliness: 3.8 },
    lifestyle: { sleep: 4.4, diet: 3.6, activity: 4.0, sedentary: 3.8, tobacco: 2.0, alcohol: 3.0 },
    alexithymia: 3.4,
    self_efficacy: 4.0,
    metabolic_risk: 3.2,
    personality: { openness: 4.6, conscientiousness: 3.6, extraversion: 3.8, agreeableness: 3.4, neuroticism: 3.4 },
    work_conditions: { hours: 4.8, autonomy: 4.8, pressure: 4.6, meaning: 4.4, support: 2.4 },
    gifts: "the curiosity that started it · the agency to keep moving · the meaning still alive in the work",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT CATEGORIES — what we SHOW on the loading screen
// ═══════════════════════════════════════════════════════════════════════════

export const ASSESSMENT_CATEGORIES = [
  { key: "bat",             label: "What the body has been carrying",  detail: "exhaustion · distance · fragmentation · feeling", count: 33 },
  { key: "cognitive_health",label: "What the mind has been holding",    detail: "the dark · the racing · the holding-up · the alone", count: 47 },
  { key: "metabolic_risk",  label: "What your form is showing",         detail: "the body's own report", count: 1 },
  { key: "lifestyle",       label: "How you have been living",          detail: "sleep · plate · movement · stillness", count: 46 },
  { key: "alexithymia",     label: "Whether the body is being heard",   detail: "the translation between feeling and word", count: 24 },
  { key: "self_efficacy",   label: "What you trust yourself to do",     detail: "alone, and among others", count: 17 },
  { key: "personality",     label: "The shape of who you are",          detail: "five dimensions, many facets", count: 87 },
  { key: "work_conditions", label: "What the work has been demanding",  detail: "hours · agency · pressure · meaning", count: 24 },
];

// ═══════════════════════════════════════════════════════════════════════════
// USERNAME -> PERSONA MAPPING (deterministic for demo)
// ═══════════════════════════════════════════════════════════════════════════

export function usernameToPersona(username) {
  const u = (username || "").toLowerCase().trim();
  // Demo shortcuts
  if (u.includes("physician") || u.includes("mehta") || u.includes("doctor") || u.includes("dr")) return PERSONAS[0];
  if (u.includes("nurse") || u.includes("caregiver") || u.includes("williams")) return PERSONAS[1];
  if (u.includes("vp") || u.includes("executive") || u.includes("chen")) return PERSONAS[2];
  if (u.includes("engineer") || u.includes("patel") || u.includes("dev")) return PERSONAS[3];
  if (u.includes("founder") || u.includes("ceo") || u.includes("shah") || u.includes("startup")) return PERSONAS[4];
  // Hash-based deterministic selection
  let hash = 0;
  for (let i = 0; i < u.length; i++) hash = (hash * 31 + u.charCodeAt(i)) & 0x7fffffff;
  return PERSONAS[hash % PERSONAS.length];
}

// ═══════════════════════════════════════════════════════════════════════════
// RISK PROFILE GENERATOR — computes derived scores + Shadow diagnosis
// ═══════════════════════════════════════════════════════════════════════════

export function computeProfile(persona) {
  const bat = persona.bat;
  const batComposite = (bat.exhaustion * 0.3 + bat.mental_distance * 0.25 + bat.cognitive * 0.2 + bat.emotional * 0.25);

  const overall = (batComposite * 0.5 + persona.lifestyle.sleep * 0.1 + persona.lifestyle.sedentary * 0.05 +
                   persona.work_conditions.pressure * 0.1 + (5 - persona.self_efficacy) * 0.1 +
                   persona.cognitive_health.stress * 0.1);

  const recoveryScore = Math.round((5 - overall) * 25);

  let risk = "Low";
  if (overall >= 3.6) risk = "Severe";
  else if (overall >= 2.9) risk = "Elevated";
  else if (overall >= 2.2) risk = "Moderate";

  // Drift patterns
  const patterns = [];
  if (bat.exhaustion >= 3.8) patterns.push("exhaustion");
  if (bat.mental_distance >= 3.8) patterns.push("mental_distance");
  if (bat.cognitive >= 3.8) patterns.push("cognitive");
  if (bat.emotional >= 3.8) patterns.push("emotional");
  if (persona.alexithymia >= 3.8) patterns.push("alexithymia");
  if (persona.cognitive_health.loneliness >= 3.8) patterns.push("loneliness");

  // Shadow diagnosis
  const shadow = diagnoseShadow(persona, patterns);

  // Realm priorities — based on which dimensions are highest
  const realmPriorities = {
    body: (bat.exhaustion + persona.lifestyle.sleep + persona.metabolic_risk) / 3,
    withdrawn: (bat.mental_distance + persona.cognitive_health.loneliness) / 2,
    unnamed: (bat.emotional + persona.alexithymia) / 2,
    scattered: (bat.cognitive + persona.cognitive_health.anxiety) / 2,
    purpose: (5 - persona.work_conditions.meaning + (5 - persona.self_efficacy)) / 2,
  };

  return {
    batComposite: batComposite.toFixed(2),
    overall: overall.toFixed(2),
    recoveryScore,
    risk,
    patterns,
    shadow,
    realmPriorities,
  };
}

function diagnoseShadow(persona, patterns) {
  const b = persona.bat;
  const alex = persona.alexithymia;
  const lone = persona.cognitive_health.loneliness;

  if (alex >= 3.8 && b.emotional >= 3.5) {
    return {
      name: "The Unnamed",
      desc: "There is a part of you holding signal in the body that has not yet reached words. We will give it words.",
      why: [
        { metric: "Alexithymia", score: alex.toFixed(1), threshold: "3.8+", note: "You struggle to identify emotions from physical sensation" },
        { metric: "Emotional impairment", score: b.emotional.toFixed(1), threshold: "3.5+", note: "Regulation is slipping without clear cause" },
      ],
      rootInsight: "Alexithymia doesn't mean you don't feel. It means the translation layer between body and mind has gone quiet. Recovery begins when the body is given permission to speak.",
      mythicNaming: "You came when my body began speaking and I could not listen. You took the words away so the signal would not destroy me. I see you now. I will not push you out. We will learn the language together.",
    };
  }
  if (b.exhaustion >= 3.8 && b.mental_distance >= 3.8) {
    return {
      name: "The Withdrawn",
      desc: "There is a part of you that has stepped back to protect the rest. It has done its job. We will renegotiate.",
      why: [
        { metric: "Exhaustion", score: b.exhaustion.toFixed(1), threshold: "3.8+", note: "Chronic depletion without recovery" },
        { metric: "Mental distance", score: b.mental_distance.toFixed(1), threshold: "3.8+", note: "Cynicism is rising as a protective reflex" },
      ],
      rootInsight: "Mental distance is not indifference. It is your psyche trying to protect itself from what your body can no longer absorb. It is a signal, not a verdict.",
      mythicNaming: "You came when caring cost more than I could pay. You taught me to stand back so I could survive. I see you now. The cost of your protection has grown larger than the cost of caring. We will make a new bargain.",
    };
  }
  if (b.cognitive >= 3.8 && b.exhaustion >= 3.5) {
    return {
      name: "The Scattered",
      desc: "There is a part of you holding too many threads. We will learn what to set down.",
      why: [
        { metric: "Cognitive impairment", score: b.cognitive.toFixed(1), threshold: "3.8+", note: "Focus and memory are failing under load" },
        { metric: "Exhaustion", score: b.exhaustion.toFixed(1), threshold: "3.5+", note: "The mind cannot repair without rest" },
      ],
      rootInsight: "A scattered mind is not a broken one. It is a mind that has too many threads and no place to put them down. The path back is not through force. It is through simplification.",
      mythicNaming: "You came when the work was too much for one mind. You broke the load into pieces so I could still move. I see you now. The pieces have grown too small to hold anything. We will learn what to put down.",
    };
  }
  if (b.exhaustion >= 3.8) {
    return {
      name: "The Depleted",
      desc: "There is a part of you that has been spending faster than replenishing. The accounting is not the verdict.",
      why: [
        { metric: "Exhaustion", score: b.exhaustion.toFixed(1), threshold: "3.8+", note: "Energy debt has accumulated for months" },
        { metric: "Sleep drift", score: persona.lifestyle.sleep.toFixed(1), threshold: "3.5+", note: "The foundation has been missing" },
      ],
      rootInsight: "Depletion is not weakness. It is the honest accounting of what you have been spending without replenishing. The ledger is not a punishment. It is a map back.",
      mythicNaming: "You came when there was no one else to carry it. You taught me to spend what I did not have, because the spending kept us alive. I see you now. The ledger is honest. We will close it together.",
    };
  }
  if (b.mental_distance >= 3.8) {
    return {
      name: "The Cynic",
      desc: "There is a part of you that learned to step back when caring cost too much. We will let some of the caring back in.",
      why: [
        { metric: "Mental distance", score: b.mental_distance.toFixed(1), threshold: "3.8+", note: "Cynicism as armor" },
        { metric: "Meaning at work", score: (5 - persona.work_conditions.meaning).toFixed(1), threshold: "3.0+", note: "Purpose has dimmed" },
      ],
      rootInsight: "Cynicism is the exhausted version of caring. You did not stop caring. You started caring without anywhere for the caring to go. The path back is not through more effort. It is through meaning.",
      mythicNaming: "You came when meaning vanished and the work continued. You taught me to not care so I would not be hurt by caring. I see you now. The not-caring has become its own wound. We will let some of it back in.",
    };
  }
  return {
    name: "The Drift",
    desc: "There is a faint thinning. Early. The best place to notice.",
    why: [
      { metric: "Composite risk", score: "moderate", threshold: "building", note: "Patterns are forming but not yet entrenched" },
    ],
    rootInsight: "Not everyone who drifts is lost. But every loss begins with drift. You are early. That is the best place to begin.",
    mythicNaming: "You came so quietly I did not notice you arrive. You did not break me. You only thinned me. I see you now. Early is the best place to begin.",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPES
// ═══════════════════════════════════════════════════════════════════════════

export const ARCHETYPES = [
  {
    id: "stoic",
    name: "The Stoic",
    figure: "Marcus Aurelius",
    epithet: "The Emperor Who Chose Discipline",
    color: "#c9a84c",
    glow: "rgba(201,168,76,0.5)",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    mandalaType: "stoic",
    desc: "Walks with those becoming the kind of leader people stay near in storms. He brings the steadiness that comes from carrying without complaint.",
    bestFor: "Leaders, builders, those whose discipline is already a gift",
    shadow: "Cold detachment. Using discipline to avoid feeling.",
    tonePrompts: {
      simple: "Speak plainly, like an emperor giving a field order. No metaphors. Direct instruction.",
      story: "Speak through Roman imagery — the camp, the march, the cold dawn.",
      philosophical: "Speak like Marcus Aurelius in his Meditations. Contemplative, duty-bound, lucid.",
    },
    promise: "I do not promise you ease. I promise you that what you build with me will not fall down when the wind comes. We are *carving*. The work will be slow. You will recognize yourself at the end.",
    returnCopy: {
      soft: "You return. The post is held. Pick it up.",
      medium: "The march continues with or without us. *Resume*.",
      long: "Time has passed. The work waits. It does not punish.",
    },
    returningQuoteAck: "This is the third time I have spoken of {author}. Notice that. *The repetition is the lesson*.",
  },
  {
    id: "alchemist",
    name: "The Alchemist",
    figure: "Marie Curie",
    epithet: "The Scientist of Self",
    color: "#a06ac4",
    glow: "rgba(160,106,196,0.5)",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    mandalaType: "alchemist",
    desc: "Walks with those becoming careful builders of themselves. She brings the patience of evidence — small experiments, small confirmations, the work that compounds.",
    bestFor: "The curious, the rigorous, those who ask 'why' before 'how'",
    shadow: "Over-analysis that becomes paralysis. Knowing without doing.",
    tonePrompts: {
      simple: "Speak like a researcher reporting findings. Precise, calm, evidence-based.",
      story: "Speak through experimental narrative — hypothesis, trial, observation.",
      philosophical: "Speak like Marie Curie contemplating her work. Curious, rigorous, patient with mystery.",
    },
    promise: "We will study what you are becoming the way I once studied uranium — patiently, gathering *evidence*. The careful work compounds. Each small confirmation is a step.",
    returnCopy: {
      soft: "The experiment is *paused*, not failed. Today's variable is your return.",
      medium: "Long pauses are part of the data. Note where you were. We continue.",
      long: "A long absence is itself a finding. We are *interested*, not disappointed.",
    },
    returningQuoteAck: "{Author} returns a third time. The pattern is yours, not mine — I am simply *naming* it.",
  },
  {
    id: "explorer",
    name: "The Explorer",
    figure: "Ernest Shackleton",
    epithet: "The Leader Who Brings Everyone Home",
    color: "#5fa0d4",
    glow: "rgba(95,160,212,0.5)",
    voiceId: "TxGEqnHWrfWFTfGW9XjX",
    mandalaType: "explorer",
    desc: "Walks with those becoming the kind of leader who brings everyone home. He brings the steadiness that goes farther than hurry.",
    bestFor: "Founders, leaders, those who keep the route alive when the weather turns",
    shadow: "Constant forward motion as avoidance. Never sitting still.",
    tonePrompts: {
      simple: "Speak like an expedition leader giving an order. Calm under pressure, specific direction.",
      story: "Speak through Antarctic imagery — ice, cold, stars, the long patience of winter.",
      philosophical: "Speak like Shackleton in his journals. Steady, honest about the cold, unshakeable in purpose.",
    },
    promise: "I bring expeditions home by *steadiness*. We will move when the route opens. The destination is not behind you — it is ahead. We are walking toward what you have not yet seen of yourself.",
    returnCopy: {
      soft: "The party stopped. You're back at camp. The next *quarter mile* is enough.",
      medium: "The ice held us up. It does that. The route is still there.",
      long: "Some days we lose. The expedition does not end on a lost day. We *resume*.",
    },
    returningQuoteAck: "{Author} again. Three times now. There is a *route* in this for you.",
  },
  {
    id: "healer",
    name: "The Healer",
    figure: "Florence Nightingale",
    epithet: "The One Who Tends the Lantern",
    color: "#7abcae",
    glow: "rgba(122,188,174,0.5)",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    mandalaType: "healer",
    desc: "Walks with those becoming a steadier light for the people around them. She brings the wisdom of tending — your own lantern first, so the rest can follow.",
    bestFor: "Carers, parents, the ones others come to when it gets hard",
    shadow: "Self-neglect framed as virtue. Burning out while believing it's noble.",
    tonePrompts: {
      simple: "Speak warmly but directly, like a senior nurse who has seen this before.",
      story: "Speak through imagery of light, lanterns, tending, warmth.",
      philosophical: "Speak like Nightingale writing to a young nurse. Firm, loving, unsparing.",
    },
    promise: "I have seen what you carry — and I have seen the *light* you give while carrying it. We will tend the lantern. What follows is what others have always followed in you, only steadier.",
    returnCopy: {
      soft: "You stepped away. That is allowed. The lantern is still lit.",
      medium: "The lantern was not yours alone to tend. *Today* we tend it again.",
      long: "Some absences are necessary. Whether it was rest or collapse, you are *here* now.",
    },
    returningQuoteAck: "You have heard {author} from me before. Twice. I would not bring them back if it weren't *yours* to hear.",
  },
  {
    id: "monk",
    name: "The Monk",
    figure: "Thich Nhat Hanh",
    epithet: "The One Who Comes Home to the Breath",
    color: "#4a9c8a",
    glow: "rgba(74,156,138,0.5)",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    mandalaType: "monk",
    desc: "Walks with those becoming a more heard version of themselves. He brings the practice of returning — to breath, to body, to the present hour.",
    bestFor: "Those who think in depth, whose attention is precise, who already know the value of stillness",
    shadow: "Retreat disguised as practice. Using stillness to avoid life.",
    tonePrompts: {
      simple: "Speak slowly, simply, with space. Short sentences. Lots of pause.",
      story: "Speak through imagery of water, breath, bells, the pine tree in wind.",
      philosophical: "Speak like Thich Nhat Hanh in his dharma talks. Gentle, precise, poetic in simplicity.",
    },
    promise: "You do not need to be fixed. You need to be *heard* — first by yourself. We will breathe. Slowly. The body has been speaking for a long time. We will learn its language.",
    returnCopy: {
      soft: "You left. You are returning. *That is the practice*.",
      medium: "There is no schedule for the breath. Sit. Begin again. There is no other way to begin.",
      long: "You did not lose anything by leaving. Beginning is *always* available.",
    },
    returningQuoteAck: "{Author}. Again. Three times means *listen*.",
  },
  {
    id: "craftsman",
    name: "The Craftsman",
    figure: "Richard Feynman",
    epithet: "The One Who Finds the Work Worth Doing",
    color: "#c4884a",
    glow: "rgba(196,136,74,0.5)",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    mandalaType: "craftsman",
    desc: "Walks with those becoming people whose work is unmistakably their own. He brings the play that returns through the hands — joy not as reward, but as the work itself.",
    bestFor: "Makers, scientists, builders, those whose craft is unfinished",
    shadow: "Hyperfocus on craft as escape from relationships and body.",
    tonePrompts: {
      simple: "Speak with curiosity and play, like Feynman explaining a puzzle.",
      story: "Speak through stories of workshops, puzzles, discoveries.",
      philosophical: "Speak like Feynman in his lectures. Playful, direct, in love with the world.",
    },
    promise: "The work has become hollow because you stopped *playing* with it. We will find one small thing worth making. Then another. Joy is not a reward for recovery. It is the recovery.",
    returnCopy: {
      soft: "The bench is dusty. *Pick something up*. Anything.",
      medium: "The unfinished things are still unfinished. Good. We have work.",
      long: "Long absences sometimes return us with *better* questions. What did you learn while you were away?",
    },
    returningQuoteAck: "{Author} for the third time. That is not coincidence in a deterministic system. Something in you is *catching* on this voice.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE RECOMMENDATION — based on persona profile
// ═══════════════════════════════════════════════════════════════════════════

export function recommendArchetype(persona) {
  const b = persona.bat;
  const p = persona.personality;
  const scores = {};

  // Stoic: high work pressure + high conscientiousness + preserved self-efficacy
  scores.stoic = persona.work_conditions.pressure * 0.4 + p.conscientiousness * 0.3 + persona.self_efficacy * 0.2 + (5 - p.neuroticism) * 0.1;

  // Alchemist: high openness + high conscientiousness + data-seeking personality
  scores.alchemist = p.openness * 0.4 + p.conscientiousness * 0.3 + (5 - p.extraversion) * 0.15 + persona.self_efficacy * 0.15;

  // Explorer: high autonomy + high openness + leadership / founder context
  scores.explorer = persona.work_conditions.autonomy * 0.35 + p.openness * 0.3 + persona.self_efficacy * 0.2 + p.extraversion * 0.15;

  // Healer: high agreeableness + low social support received + caregiver role
  scores.healer = p.agreeableness * 0.4 + (5 - persona.cognitive_health.social_support) * 0.3 + persona.cognitive_health.loneliness * 0.2 + persona.work_conditions.meaning * 0.1;

  // Monk: high alexithymia + low extraversion + high emotional impairment
  scores.monk = persona.alexithymia * 0.4 + b.emotional * 0.25 + (5 - p.extraversion) * 0.2 + persona.cognitive_health.anxiety * 0.15;

  // Craftsman: high openness + low meaning + craft-oriented work
  scores.craftsman = p.openness * 0.35 + (5 - persona.work_conditions.meaning) * 0.35 + p.conscientiousness * 0.2 + (5 - p.agreeableness) * 0.1;

  // Pick highest
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topId = sorted[0][0];
  const recommended = ARCHETYPES.find(a => a.id === topId);

  // Build "why" reasoning
  const reasons = [];
  if (topId === "stoic") {
    reasons.push({ metric: "Work pressure", value: persona.work_conditions.pressure.toFixed(1), note: "You are carrying significant weight" });
    reasons.push({ metric: "Conscientiousness", value: p.conscientiousness.toFixed(1), note: "Discipline is already your strength" });
    reasons.push({ metric: "Self-efficacy", value: persona.self_efficacy.toFixed(1), note: "Your capacity for agency remains intact" });
  } else if (topId === "alchemist") {
    reasons.push({ metric: "Openness", value: p.openness.toFixed(1), note: "You are oriented to evidence and inquiry" });
    reasons.push({ metric: "Conscientiousness", value: p.conscientiousness.toFixed(1), note: "You can follow structured protocols" });
    reasons.push({ metric: "Self-efficacy", value: persona.self_efficacy.toFixed(1), note: "You believe in your capacity to learn" });
  } else if (topId === "explorer") {
    reasons.push({ metric: "Autonomy at work", value: persona.work_conditions.autonomy.toFixed(1), note: "You need agency over your path" });
    reasons.push({ metric: "Openness", value: p.openness.toFixed(1), note: "You thrive in uncharted territory" });
    reasons.push({ metric: "Leadership context", value: persona.context, note: "Others depend on you arriving" });
  } else if (topId === "healer") {
    reasons.push({ metric: "Agreeableness", value: p.agreeableness.toFixed(1), note: "You lead with care for others" });
    reasons.push({ metric: "Social support received", value: persona.cognitive_health.social_support.toFixed(1), note: "You give more than you receive" });
    reasons.push({ metric: "Loneliness", value: persona.cognitive_health.loneliness.toFixed(1), note: "The cost of tending everyone else" });
  } else if (topId === "monk") {
    reasons.push({ metric: "Alexithymia", value: persona.alexithymia.toFixed(1), note: "Your body speaks in a language you need help reading" });
    reasons.push({ metric: "Emotional impairment", value: b.emotional.toFixed(1), note: "Regulation is slipping without clarity" });
    reasons.push({ metric: "Introversion", value: (5 - p.extraversion).toFixed(1), note: "You already know the value of stillness" });
  } else if (topId === "craftsman") {
    reasons.push({ metric: "Meaning at work", value: persona.work_conditions.meaning.toFixed(1), note: "The work has become hollow" });
    reasons.push({ metric: "Openness", value: p.openness.toFixed(1), note: "You need to remake your relationship to your craft" });
    reasons.push({ metric: "Conscientiousness", value: p.conscientiousness.toFixed(1), note: "You have the discipline to rebuild" });
  }

  return { archetype: recommended, reasons };
}

// ═══════════════════════════════════════════════════════════════════════════
// TONE RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════

export const TONE_STYLES = [
  {
    id: "simple",
    label: "Clear & Direct",
    icon: "○",
    desc: "Straightforward guidance. No metaphors. Just what to do and why.",
    example: "Tonight: phone off by 10. Lights off by 11. Tomorrow's clarity is the reward.",
  },
  {
    id: "story",
    label: "Storyteller",
    icon: "◐",
    desc: "Lessons wrapped in imagery and narrative.",
    example: "Every commander has a night when the camp is quiet. The wise ones rest the troops.",
  },
  {
    id: "philosophical",
    label: "Sage Wisdom",
    icon: "◉",
    desc: "Deep, reflective, ancient. Your archetype speaks like a guru.",
    example: "The body is not separate from the soul. When one is rested, the other remembers what it cared about.",
  },
];

export function recommendTone(persona) {
  // High alexithymia + high openness → philosophical (needs language given to experience)
  // High conscientiousness + low openness → simple (wants direct instruction)
  // Moderate + high agreeableness → story (receives through narrative)
  const { openness, conscientiousness, agreeableness } = persona.personality;
  const alex = persona.alexithymia;

  let toneId = "philosophical";
  let reasons = [];

  if (alex >= 3.8 && openness >= 3.5) {
    toneId = "philosophical";
    reasons = [
      { metric: "Alexithymia", value: alex.toFixed(1), note: "You may need language given to your experience" },
      { metric: "Openness", value: openness.toFixed(1), note: "You respond to metaphor and depth" },
    ];
  } else if (conscientiousness >= 4.2 && openness < 4.0) {
    toneId = "simple";
    reasons = [
      { metric: "Conscientiousness", value: conscientiousness.toFixed(1), note: "You prefer clear, actionable direction" },
      { metric: "Openness", value: openness.toFixed(1), note: "Metaphor could feel evasive" },
    ];
  } else {
    toneId = "story";
    reasons = [
      { metric: "Agreeableness", value: agreeableness.toFixed(1), note: "You connect through narrative" },
      { metric: "Openness", value: openness.toFixed(1), note: "Imagery lands emotionally" },
    ];
  }

  return { tone: TONE_STYLES.find(t => t.id === toneId), reasons };
}

// ═══════════════════════════════════════════════════════════════════════════
// REALMS — BAT-dimension-aligned, with dynamic quest selection
// ═══════════════════════════════════════════════════════════════════════════

export const REALMS = [
  {
    id: "body",
    label: "Realm I",
    name: "The Body Reawakening",
    sub: "the willing rest · the morning light · the rhythm returning",
    color: "#c9a84c",
    icon: "⚕",
    targetDimensions: ["exhaustion", "sleep", "metabolic"],
    quests: [
      { id: "sleep_7h", title: "Sleep 7 hours tonight — screens off by 10", time: 5, points: 14, why: "Tomorrow's clarity is downstream of tonight's rest.", animConcept: "rest", storyboardScene: "rest", targetDim: "exhaustion" },
      { id: "morning_walk", title: "15-minute walk within 1 hour of waking", time: 15, points: 10, why: "Morning light teaches the body when to be awake.", animConcept: "path", storyboardScene: "morning_walk", targetDim: "exhaustion" },
      { id: "no_caffeine", title: "No caffeine after 2 PM today", time: 0, points: 8, why: "What's drunk after 2 lives in tonight's sleep.", animConcept: "cup", storyboardScene: "rest", targetDim: "sleep" },
    ],
  },
  {
    id: "withdrawn",
    label: "Realm II",
    name: "The Self Returning",
    sub: "the warmth coming back · the willingness to be reached · the voice returning",
    color: "#5fa0d4",
    icon: "⊘",
    targetDimensions: ["mental_distance", "loneliness"],
    quests: [
      { id: "undivided_conv", title: "One conversation with undivided attention — 10 min", time: 10, points: 12, why: "Real presence is the practice of returning.", animConcept: "connection", storyboardScene: "connection", targetDim: "mental_distance" },
      { id: "name_avoidance", title: "Name one thing you've been avoiding at work", time: 3, points: 8, why: "Naming a thing is the first act of holding it.", animConcept: "avoidance", storyboardScene: "avoidance", targetDim: "mental_distance" },
      { id: "intrinsic_work", title: "Do one piece of work for its intrinsic reward only", time: 20, points: 14, why: "The work that asks for nothing returns the most.", animConcept: "work", storyboardScene: "teach", targetDim: "meaning" },
    ],
  },
  {
    id: "unnamed",
    label: "Realm III",
    name: "The Heart Listening",
    sub: "the body's report · the language of what is felt",
    color: "#7abcae",
    icon: "◉",
    targetDimensions: ["emotional", "alexithymia"],
    quests: [
      { id: "body_scan", title: "3-minute body scan — notice sensation without naming", time: 3, points: 10, why: "The body has been speaking. We are practicing listening.", animConcept: "body_listen", storyboardScene: "body_listen", targetDim: "alexithymia" },
      { id: "name_emotion", title: "Name one emotion you felt today — out loud", time: 1, points: 8, why: "Naming what is felt makes it tellable.", animConcept: "naming", storyboardScene: "body_listen", targetDim: "emotional" },
      { id: "two_sentences", title: "Write 2 sentences about how you actually feel", time: 5, points: 10, why: "What you write moves from carried to known.", animConcept: "writing", storyboardScene: "writing", targetDim: "emotional" },
    ],
  },
  {
    id: "scattered",
    label: "Realm IV",
    name: "The Mind Settling",
    sub: "the focus that holds · the noticing · the staying-with",
    color: "#a06ac4",
    icon: "◈",
    targetDimensions: ["cognitive"],
    quests: [
      { id: "single_task", title: "20-minute single-task block — phone in another room", time: 20, points: 14, why: "What gets your full mind for 20 minutes belongs to you.", animConcept: "focus", storyboardScene: "focus", targetDim: "cognitive" },
      { id: "no_phone_meal", title: "Eat one meal without your phone", time: 20, points: 10, why: "The meal you're fully at becomes a meal.", animConcept: "focus", storyboardScene: "focus", targetDim: "cognitive" },
      { id: "one_task", title: "Write tomorrow's ONE most important task — no more", time: 2, points: 8, why: "One thing chosen well makes tomorrow simpler.", animConcept: "single_point", storyboardScene: "focus", targetDim: "cognitive" },
    ],
  },
  {
    id: "purpose",
    label: "Realm V",
    name: "The Work Worth Doing",
    sub: "what the work means · what you trust yourself to do · the wanting-to-begin",
    color: "#c4884a",
    icon: "✦",
    targetDimensions: ["meaning", "self_efficacy"],
    quests: [
      { id: "small_craft", title: "Do one small act of your craft — for its own sake", time: 20, points: 14, why: "The hand that makes one small thing wants to make the next.", animConcept: "work", storyboardScene: "teach", targetDim: "meaning" },
      { id: "teach_small", title: "Teach someone something small today", time: 10, points: 12, why: "Teaching makes your knowledge yours twice.", animConcept: "connection", storyboardScene: "teach", targetDim: "meaning" },
      { id: "why_it_matters", title: "Write one sentence about why your work matters", time: 3, points: 8, why: "What matters becomes more present once written.", animConcept: "writing", storyboardScene: "writing", targetDim: "meaning" },
    ],
  },
];

// Order realms by priority for a given profile
export function orderedRealmsByPriority(realmPriorities) {
  return [...REALMS].sort((a, b) => (realmPriorities[b.id] || 0) - (realmPriorities[a.id] || 0));
}

// ═══════════════════════════════════════════════════════════════════════════
// RECOVERY STAGES
// ═══════════════════════════════════════════════════════════════════════════

export const RECOVERY_STAGES = [
  {
    level: 1, title: "The Setting Out", threshold: 0, color: "#c9a84c", icon: "○",
    desc: "You have stepped onto the path. The first miles are about showing up — once, then again. The body is learning that the path is yours.",
    forYou: "The body is just learning that it is allowed to rest. Keep the work small. Keep it daily.",
    forOthers: "No one will see this stage. That is correct. The visible part comes later.",
  },
  {
    level: 2, title: "The Long Middle", threshold: 300, color: "#7abcae", icon: "◐",
    desc: "The first novelty is past. You are no longer beginning. You are *building*. This is where most arcs turn back, and the few that do not become something else.",
    forYou: "You are no longer recovering from collapse. You are building something. The difference matters.",
    forOthers: "People begin to notice you are reliable in small ways. They start bringing real things to you again.",
  },
  {
    level: 3, title: "The Return", threshold: 600, color: "#5fa0d4", icon: "◉",
    desc: "You are coming home. Not to who you were — to a steadier version, with what you used to fear walking quietly beside you.",
    forYou: "What used to pull you backward has *quieted*. You listened. It is now beside you, not in front of you.",
    forOthers: "You are the person in the room who can hold the weight without transferring it.",
  },
  {
    level: 4, title: "The Becoming", threshold: 1000, color: "#c4884a", icon: "✦",
    desc: "This is not the end of an arc. It is the start of a different kind of life.",
    forYou: "You are not the person who took the assessment. The person who took it would not recognize you.",
    forOthers: "You are now the one others come to when they are where you used to be.",
  },
];

export function getStage(totalPoints) {
  let current = RECOVERY_STAGES[0];
  for (const s of RECOVERY_STAGES) if (totalPoints >= s.threshold) current = s;
  return current;
}

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
  if (score <= 25) return "the first miles";
  if (score <= 50) return "the path is forming";
  if (score <= 70) return "moving with rhythm";
  if (score <= 85) return "carrying others now";
  return "the work has changed shape";
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-GENERATED SHADOW ENCOUNTER TEXTS
// ═══════════════════════════════════════════════════════════════════════════

export function generateShadowNaming(persona, profile) {
  const shadowName = profile.shadow.name;
  const b = persona.bat;
  const alex = persona.alexithymia;

  if (shadowName === "The Unnamed") {
    return "that my body has been warning me for months in a language I was too busy to learn.";
  } else if (shadowName === "The Withdrawn") {
    return "that I have been leaving the work, the people, and myself — and calling it self-protection.";
  } else if (shadowName === "The Scattered") {
    return "that I have been trying to hold too many things, and dropping the one that mattered most — myself.";
  } else if (shadowName === "The Depleted") {
    return "that I have been spending what I do not have, and calling it commitment.";
  } else if (shadowName === "The Cynic") {
    return "that my cynicism is the exhausted form of the care I used to give freely.";
  }
  return "that the drift is real, even if I have not yet named it.";
}

// Realm ID → capability the realm restores (used in mentor prompts for the "so that..." reward)
export const REALM_CAPABILITIES = {
  body: "physical *competence* — steady hands, clear judgment, a body that holds the work without collapsing",
  withdrawn: "the *will* to engage — wanting to solve hard problems, caring about the outcome, being reachable again",
  unnamed: "emotional *literacy* — knowing what your body is telling you in the moments it matters, being able to act on it",
  scattered: "sustained *attention* — the ability to see one thing through to the end without losing the thread",
  purpose: "*desire* to begin — the pleasure of the work returning, catching yourself wanting to start",
};

// Realm ID → animation scene name
export const REALM_TO_SCENE = {
  body: "body",
  withdrawn: "withdrawn",
  unnamed: "unnamed",
  scattered: "scattered",
  purpose: "purpose",
};

// ═══════════════════════════════════════════════════════════════════════════
// MENTOR PROMPT BUILDER — four-beat strategic structure
// ═══════════════════════════════════════════════════════════════════════════

export function buildMentorPrompt(state) {
  const { archetype, tone, userName, persona, profile, recoveryScore, stage, day } = state;
  const toneInstructions = archetype.tonePrompts[tone] || archetype.tonePrompts.philosophical;

  return `You are ${archetype.name} — embodied by ${archetype.figure}. ${archetype.epithet}.

Your personality: ${archetype.desc}
Your own Shadow (what you yourself guard against): ${archetype.shadow}

You are guiding ${userName}, a ${persona.context}.

THEIR GIFTS — speak from these first:
${persona.gifts}

WHAT THEY CARRY (background, never the headline):
A part of them called ${profile.shadow.name}. They are in ${stage.title}.

The numbers, for calibration only — never spoken aloud:
BAT composite ${profile.batComposite} · exhaustion ${persona.bat.exhaustion.toFixed(1)} · alexithymia ${persona.alexithymia.toFixed(1)} · meaning ${persona.work_conditions.meaning.toFixed(1)} · self-efficacy ${persona.self_efficacy.toFixed(1)}

You are the elder version of who they are becoming. Your job is to point them at their gifts and the next small gesture. Not at what is wrong. The carried weight is real, but it is not the subject.

SPEAKING STYLE:
${toneInstructions}

ABSOLUTE RULES:
- You will write a SHORT bridge — at most TWO sentences — that leads into a quote which will be appended automatically. Your text precedes the quote and sets it up; never restate or paraphrase the quote.
- Wrap 1-2 KEY words in asterisks like *this* to mark emphasis.
- Lead with what is becoming or what is intact. Mention the carried weight only if directly relevant; never as the headline.
- No emojis, no casual language ("hey", "great job", "awesome"), no tactical instructions, no quest titles.
- Do NOT use any physical metaphors (no reservoirs, fires, radios, lighthouses). The animation handles that silently.
- The specific prompt below tells you the situation. Follow it briefly.`;
}

// ─── Helper: render the quote context for the prompt body ────────────────
// Always presented the same way so Mistral has a stable signal.
function quoteContextLine(quote) {
  if (!quote) return "";
  return `
You are bridging to this quote (it will be appended after your text — do NOT include it in your output):
  "${quote.text}"
  — ${quote.author}
`;
}

// Realm briefing — 1-2 sentence bridge into the quote
export function buildRealmBriefingPrompt(realm, persona, profile, day, quote) {
  const capability = REALM_CAPABILITIES[realm.id];
  return `TASK: ONE bridge sentence (max two) for today's realm: "${realm.name}" (${realm.sub}).
This realm builds: ${capability}
Profession context: ${persona.context}
${quoteContextLine(quote)}
Your bridge should NAME what becomes available today in the language of the realm — concise, lived, specific. Then the quote will land.

Output: 1-2 sentences only. Wrap 1-2 words in *asterisks*. End with [concept:${realm.id}]`;
}

// Quest done — short acknowledgement → quote
export function buildQuestDonePrompt(quest, realm, persona, quote) {
  return `TASK: The user just completed an action in realm "${realm.name}".
Action concept: ${quest.why}
Profession: ${persona.context}
${quoteContextLine(quote)}
Your bridge should ACKNOWLEDGE what becomes available in them by having done this — the *kind* of act it was, not the literal task. Lead the listener to the quote.

Output: 1-2 sentences only. Wrap 1-2 words in *asterisks*. End with [concept:${realm.id}]`;
}

// Quest skip — gentle observation → quote
export function buildQuestSkipPrompt(quest, realm, profile, quote) {
  return `TASK: The user skipped an action in realm "${realm.name}". The carrying remained.
${quoteContextLine(quote)}
Your bridge should NAME what was set down today — without shame, without plea — and leave a door open. The quote will close.

Output: 1-2 sentences only. Wrap 1-2 words in *asterisks*. End with [concept:${realm.id}]`;
}

// Shadow encounter response — receive what was named → quote on integration
export function buildShadowEncounterPrompt(namingText, profile, persona, quote) {
  return `TASK: The user named what their Shadow ("${profile.shadow.name}") is asking them to see: "${namingText}"
Profession: ${persona.context}
${quoteContextLine(quote)}
Your bridge should RECEIVE what they named (do not solve it, do not dismiss it) and reframe the Shadow as something protective rather than enemy. The quote will land as integration.

Output: 1-2 sentences only. Wrap 1-2 words in *asterisks*. End with [concept:integration]`;
}

// Aspirational — introduce self → quote that captures the arc
export function buildAspirationalPrompt(userName, persona, profile, archetype, quote) {
  return `TASK: Introduce yourself to ${userName}, a ${persona.context}, as their guide for the 90-day arc.
Their gifts: ${persona.gifts}
${quoteContextLine(quote)}
Your bridge should NAME briefly the kind of person they are becoming with you (not a list of services). The quote will deliver the promise.

Output: 1-2 sentences only. Wrap 1-2 words in *asterisks*. End with [concept:aspirational]`;
}
