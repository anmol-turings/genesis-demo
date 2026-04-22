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
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT CATEGORIES — what we SHOW on the loading screen
// ═══════════════════════════════════════════════════════════════════════════

export const ASSESSMENT_CATEGORIES = [
  { key: "bat", label: "Burnout Assessment Tool (BAT)", detail: "4 core dimensions · 2 secondary", count: 33 },
  { key: "cognitive_health", label: "Cognitive Health Questionnaire", detail: "Depression · Anxiety · Resilience · Loneliness", count: 47 },
  { key: "metabolic_risk", label: "Metabolic Risk Score", detail: "Computer vision anthropometry", count: 1 },
  { key: "lifestyle", label: "Lifestyle Performance Index (LSPI)", detail: "Sleep · Diet · Activity · Sedentary", count: 46 },
  { key: "alexithymia", label: "Alexithymia (Perth)", detail: "Emotion identification capacity", count: 24 },
  { key: "self_efficacy", label: "Self-Efficacy Scale", detail: "General · Social efficacy beliefs", count: 17 },
  { key: "personality", label: "Personality Inventory", detail: "Big Five + sub-facets", count: 87 },
  { key: "work_conditions", label: "Work Conditions Questionnaire", detail: "Hours · Autonomy · Pressure · Meaning", count: 24 },
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
      desc: "You feel the weight but cannot name it. The body speaks in a language you have forgotten.",
      why: [
        { metric: "Alexithymia", score: alex.toFixed(1), threshold: "3.8+", note: "You struggle to identify emotions from physical sensation" },
        { metric: "Emotional impairment", score: b.emotional.toFixed(1), threshold: "3.5+", note: "Regulation is slipping without clear cause" },
      ],
      rootInsight: "Alexithymia doesn't mean you don't feel. It means the translation layer between body and mind has gone quiet. Recovery begins when the body is given permission to speak.",
    };
  }
  if (b.exhaustion >= 3.8 && b.mental_distance >= 3.8) {
    return {
      name: "The Withdrawn",
      desc: "You are exhausted and pulling away. Your body has begun to refuse what your mind commands.",
      why: [
        { metric: "Exhaustion", score: b.exhaustion.toFixed(1), threshold: "3.8+", note: "Chronic depletion without recovery" },
        { metric: "Mental distance", score: b.mental_distance.toFixed(1), threshold: "3.8+", note: "Cynicism is rising as a protective reflex" },
      ],
      rootInsight: "Mental distance is not indifference. It is your psyche trying to protect itself from what your body can no longer absorb. It is a signal, not a verdict.",
    };
  }
  if (b.cognitive >= 3.8 && b.exhaustion >= 3.5) {
    return {
      name: "The Scattered",
      desc: "Your mind is breaking into fragments. Attention has become a scarce resource.",
      why: [
        { metric: "Cognitive impairment", score: b.cognitive.toFixed(1), threshold: "3.8+", note: "Focus and memory are failing under load" },
        { metric: "Exhaustion", score: b.exhaustion.toFixed(1), threshold: "3.5+", note: "The mind cannot repair without rest" },
      ],
      rootInsight: "A scattered mind is not a broken one. It is a mind that has too many threads and no place to put them down. The path back is not through force. It is through simplification.",
    };
  }
  if (b.exhaustion >= 3.8) {
    return {
      name: "The Depleted",
      desc: "You are running on reserves that have not been replenished in too long.",
      why: [
        { metric: "Exhaustion", score: b.exhaustion.toFixed(1), threshold: "3.8+", note: "Energy debt has accumulated for months" },
        { metric: "Sleep drift", score: persona.lifestyle.sleep.toFixed(1), threshold: "3.5+", note: "The foundation has been missing" },
      ],
      rootInsight: "Depletion is not weakness. It is the honest accounting of what you have been spending without replenishing. The ledger is not a punishment. It is a map back.",
    };
  }
  if (b.mental_distance >= 3.8) {
    return {
      name: "The Cynic",
      desc: "You are distancing from the work to protect yourself. But the distance is costing you meaning.",
      why: [
        { metric: "Mental distance", score: b.mental_distance.toFixed(1), threshold: "3.8+", note: "Cynicism as armor" },
        { metric: "Meaning at work", score: (5 - persona.work_conditions.meaning).toFixed(1), threshold: "3.0+", note: "Purpose has dimmed" },
      ],
      rootInsight: "Cynicism is the exhausted version of caring. You did not stop caring. You started caring without anywhere for the caring to go. The path back is not through more effort. It is through meaning.",
    };
  }
  return {
    name: "The Drift",
    desc: "A quiet erosion. Not yet a crisis.",
    why: [
      { metric: "Composite risk", score: "moderate", threshold: "building", note: "Patterns are forming but not yet entrenched" },
    ],
    rootInsight: "Not everyone who drifts is lost. But every loss begins with drift. You are early. That is the best place to begin.",
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
    desc: "For those who must carry heavy responsibility. The Stoic finds strength not in avoiding the weight, but in accepting it with clarity.",
    bestFor: "High-pressure professionals, leaders, those who feel duty heavier than joy",
    shadow: "Cold detachment. Using discipline to avoid feeling.",
    tonePrompts: {
      simple: "Speak plainly, like an emperor giving a field order. No metaphors. Direct instruction.",
      story: "Speak through Roman imagery — the camp, the march, the cold dawn.",
      philosophical: "Speak like Marcus Aurelius in his Meditations. Contemplative, duty-bound, lucid.",
    },
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
    desc: "For those who need to understand their biology before they can change it. Treats recovery as a careful experiment.",
    bestFor: "Data-driven minds, analytical users, those who need evidence before trust",
    shadow: "Over-analysis that becomes paralysis. Knowing without doing.",
    tonePrompts: {
      simple: "Speak like a researcher reporting findings. Precise, calm, evidence-based.",
      story: "Speak through experimental narrative — hypothesis, trial, observation.",
      philosophical: "Speak like Marie Curie contemplating her work. Curious, rigorous, patient with mystery.",
    },
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
    desc: "For those who feel trapped in the ice of their current life. The Explorer finds the way through.",
    bestFor: "Founders, leaders, those who feel stuck in circumstances they cannot change",
    shadow: "Constant forward motion as avoidance. Never sitting still.",
    tonePrompts: {
      simple: "Speak like an expedition leader giving an order. Calm under pressure, specific direction.",
      story: "Speak through Antarctic imagery — ice, cold, stars, the long patience of winter.",
      philosophical: "Speak like Shackleton in his journals. Steady, honest about the cold, unshakeable in purpose.",
    },
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
    desc: "For those who care for others and forget themselves. The Healer learns to tend the lantern.",
    bestFor: "Healthcare workers, caregivers, parents, anyone in service roles",
    shadow: "Self-neglect framed as virtue. Burning out while believing it's noble.",
    tonePrompts: {
      simple: "Speak warmly but directly, like a senior nurse who has seen this before.",
      story: "Speak through imagery of light, lanterns, tending, warmth.",
      philosophical: "Speak like Nightingale writing to a young nurse. Firm, loving, unsparing.",
    },
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
    desc: "For those who feel the weight in their body but cannot name what it is. The Monk teaches the naming begins with the breath.",
    bestFor: "Users high in alexithymia, overwhelmed, dissociated, feeling numb",
    shadow: "Retreat disguised as practice. Using stillness to avoid life.",
    tonePrompts: {
      simple: "Speak slowly, simply, with space. Short sentences. Lots of pause.",
      story: "Speak through imagery of water, breath, bells, the pine tree in wind.",
      philosophical: "Speak like Thich Nhat Hanh in his dharma talks. Gentle, precise, poetic in simplicity.",
    },
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
    desc: "For those who have lost meaning in their work. The Craftsman remembers that joy returns when the hands find something worth making.",
    bestFor: "Professionals who feel their work has become hollow, creative block",
    shadow: "Hyperfocus on craft as escape from relationships and body.",
    tonePrompts: {
      simple: "Speak with curiosity and play, like Feynman explaining a puzzle.",
      story: "Speak through stories of workshops, puzzles, discoveries.",
      philosophical: "Speak like Feynman in his lectures. Playful, direct, in love with the world.",
    },
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
    example: "Your exhaustion scored high. Tonight: phone off by 10. Lights off by 11.",
  },
  {
    id: "story",
    label: "Storyteller",
    icon: "◐",
    desc: "Lessons wrapped in imagery and narrative.",
    example: "Every warrior has a night when the body refuses. The wise ones listen.",
  },
  {
    id: "philosophical",
    label: "Sage Wisdom",
    icon: "◉",
    desc: "Deep, reflective, ancient. Your archetype speaks like a guru.",
    example: "The body is not separate from the soul. When one is exhausted, the other grows cynical.",
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
    name: "The Body Under Siege",
    sub: "Exhaustion · Sleep · Allostatic Load",
    color: "#c9a84c",
    icon: "⚕",
    targetDimensions: ["exhaustion", "sleep", "metabolic"],
    quests: [
      { id: "sleep_7h", title: "Sleep 7 hours tonight — screens off by 10", time: 5, points: 14, why: "Exhaustion is the engine of every other burnout dimension.", animConcept: "rest", storyboardScene: "rest", targetDim: "exhaustion" },
      { id: "morning_walk", title: "15-minute walk within 1 hour of waking", time: 15, points: 10, why: "Morning light anchors your circadian clock.", animConcept: "path", storyboardScene: "morning_walk", targetDim: "exhaustion" },
      { id: "no_caffeine", title: "No caffeine after 2 PM today", time: 0, points: 8, why: "Caffeine's half-life is 5-6 hours.", animConcept: "cup", storyboardScene: "rest", targetDim: "sleep" },
    ],
  },
  {
    id: "withdrawn",
    label: "Realm II",
    name: "The Withdrawn Self",
    sub: "Mental Distance · Cynicism · Disengagement",
    color: "#5fa0d4",
    icon: "⊘",
    targetDimensions: ["mental_distance", "loneliness"],
    quests: [
      { id: "undivided_conv", title: "One conversation with undivided attention — 10 min", time: 10, points: 12, why: "Mental distance repairs through moments of real presence.", animConcept: "connection", storyboardScene: "connection", targetDim: "mental_distance" },
      { id: "name_avoidance", title: "Name one thing you've been avoiding at work", time: 3, points: 8, why: "The thing you're avoiding consumes more energy than the thing itself.", animConcept: "avoidance", storyboardScene: "avoidance", targetDim: "mental_distance" },
      { id: "intrinsic_work", title: "Do one piece of work for its intrinsic reward only", time: 20, points: 14, why: "Meaning returns through purposeless work.", animConcept: "work", storyboardScene: "teach", targetDim: "meaning" },
    ],
  },
  {
    id: "unnamed",
    label: "Realm III",
    name: "The Unnamed Heart",
    sub: "Emotional Regulation · Alexithymia",
    color: "#7abcae",
    icon: "◉",
    targetDimensions: ["emotional", "alexithymia"],
    quests: [
      { id: "body_scan", title: "3-minute body scan — notice sensation without naming", time: 3, points: 10, why: "Alexithymia is disconnection from sensation. Start at the body.", animConcept: "body_listen", storyboardScene: "body_listen", targetDim: "alexithymia" },
      { id: "name_emotion", title: "Name one emotion you felt today — out loud", time: 1, points: 8, why: "Naming activates the prefrontal cortex. Labeling IS regulation.", animConcept: "naming", storyboardScene: "body_listen", targetDim: "emotional" },
      { id: "two_sentences", title: "Write 2 sentences about how you actually feel", time: 5, points: 10, why: "Writing bypasses the internal editor.", animConcept: "writing", storyboardScene: "writing", targetDim: "emotional" },
    ],
  },
  {
    id: "scattered",
    label: "Realm IV",
    name: "The Scattered Mind",
    sub: "Cognitive Impairment · Attention · Focus",
    color: "#a06ac4",
    icon: "◈",
    targetDimensions: ["cognitive"],
    quests: [
      { id: "single_task", title: "20-minute single-task block — phone in another room", time: 20, points: 14, why: "Every context-switch costs 23 minutes of recovery.", animConcept: "focus", storyboardScene: "focus", targetDim: "cognitive" },
      { id: "no_phone_meal", title: "Eat one meal without your phone", time: 20, points: 10, why: "Divided attention trains the mind to fragment.", animConcept: "focus", storyboardScene: "focus", targetDim: "cognitive" },
      { id: "one_task", title: "Write tomorrow's ONE most important task — no more", time: 2, points: 8, why: "The scattered mind tries to hold 40 tasks. Pick the one.", animConcept: "single_point", storyboardScene: "focus", targetDim: "cognitive" },
    ],
  },
  {
    id: "purpose",
    label: "Realm V",
    name: "The Lost Purpose",
    sub: "Meaning · Self-Efficacy · Engagement",
    color: "#c4884a",
    icon: "✦",
    targetDimensions: ["meaning", "self_efficacy"],
    quests: [
      { id: "small_craft", title: "Do one small act of your craft — for its own sake", time: 20, points: 14, why: "Self-efficacy is the strongest predictor of behavior change.", animConcept: "work", storyboardScene: "teach", targetDim: "meaning" },
      { id: "teach_small", title: "Teach someone something small today", time: 10, points: 12, why: "Teaching creates meaning by making your knowledge visible.", animConcept: "connection", storyboardScene: "teach", targetDim: "meaning" },
      { id: "why_it_matters", title: "Write one sentence about why your work matters", time: 3, points: 8, why: "Meaning is a physiological variable, not a decoration.", animConcept: "writing", storyboardScene: "writing", targetDim: "meaning" },
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
    level: 1, title: "Awareness", threshold: 0, color: "#c9a84c", icon: "○",
    desc: "You can see the Shadow now.",
    forYou: "You are beginning to see the pattern that has been pulling on you. Awareness is not change, but nothing changes without it.",
    forOthers: "The people around you may not notice yet. But they will. Your steadiness begins before anyone can see it.",
  },
  {
    level: 2, title: "Re-regulation", threshold: 100, color: "#7abcae", icon: "◐",
    desc: "Your nervous system is steadying.",
    forYou: "Sleep. Breath. Basic rhythms. Your body is beginning to trust that rest is allowed.",
    forOthers: "Colleagues and family sense a shift. You are more present in small ways.",
  },
  {
    level: 3, title: "Re-engagement", threshold: 300, color: "#5fa0d4", icon: "◉",
    desc: "Meaningful activity returns.",
    forYou: "You are not just recovering. You are re-entering your life with new calibration.",
    forOthers: "Your presence becomes more reliable. People begin to bring their real problems to you again.",
  },
  {
    level: 4, title: "Integration", threshold: 600, color: "#a06ac4", icon: "◈",
    desc: "Shadow and Twin are speaking to each other.",
    forYou: "You are no longer fighting the part of you that wanted you to stop. You have listened.",
    forOthers: "You are the person in the room who holds the weight without transferring it.",
  },
  {
    level: 5, title: "Flourishing", threshold: 1000, color: "#c4884a", icon: "✦",
    desc: "You are recovered and building outward.",
    forYou: "You are not the same person who took the assessment. You are a different kind of functioning.",
    forOthers: "You are now the person others come to when they are where you used to be.",
  },
];

export function getStage(totalPoints) {
  let current = RECOVERY_STAGES[0];
  for (const s of RECOVERY_STAGES) if (totalPoints >= s.threshold) current = s;
  return current;
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
  body: "physical competence — steady hands, clear judgment, a body that can hold the work without collapsing",
  withdrawn: "the will to engage — wanting to solve hard problems, caring about the outcome, being reachable again",
  unnamed: "emotional literacy — knowing what your body is telling you in the moments it matters, being able to act on it",
  scattered: "sustained attention — the ability to see one thing through to the end without losing the thread",
  purpose: "desire to begin — the pleasure of the work returning, catching yourself wanting to start",
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

You are guiding ${userName}, a ${persona.context}, in burnout recovery.
Their Shadow: ${profile.shadow.name} — ${profile.shadow.desc}
Key scores: BAT composite ${profile.batComposite} · Risk: ${profile.risk} · Exhaustion ${persona.bat.exhaustion.toFixed(1)} · Alexithymia ${persona.alexithymia.toFixed(1)} · Meaning ${persona.work_conditions.meaning.toFixed(1)}
Day ${day} of 90 · Recovery Score: ${recoveryScore}/100 · Stage: ${stage.title}

SPEAKING STYLE:
${toneInstructions}

ABSOLUTE RULES:
- Wrap 2-3 KEY words in asterisks like *this* to mark emphasis.
- No emojis, no casual language ("hey", "great job", "awesome"), no tactical instructions, no quest titles.
- Speak with the gravitas of ${archetype.figure}.
- Do NOT use any physical metaphors (no reservoirs, fires, radios, lighthouses, glasses). The animation handles that silently; your words do the conscious explanation.
- The specific prompt below will tell you what to write. Follow its beats exactly.`;
}

// Prompt for the dashboard/realm briefing — four beats including the "so that..." reward
export function buildRealmBriefingPrompt(realm, persona, profile, day) {
  const capability = REALM_CAPABILITIES[realm.id];
  return `TASK: Generate a 3-4 sentence mentor message for TODAY'S REALM: "${realm.name}" (${realm.sub}).

This realm restores this capability for them: ${capability}

Their relevant dimensions for this realm:
${realm.targetDimensions.map(d => `- ${d}`).join("\n")}

Speak in EXACTLY these four beats, in order:

1. NAME THE PATTERN — Describe in strategic language what has been happening to them (not as a list of scores, but as a PATTERN of living). Speak to what they are doing day after day that has led them here.

2. REFRAME — Say what this pattern is NOT (not weakness, not character flaw, not mood). Then say what it ACTUALLY is — a specific system dynamic (ledger, rationing, signal loss, fragmentation, dimming, etc. — pick one that fits).

3. EXPLAIN THE REALM — Say why THIS realm is the priority for them specifically, at the level of principle. Not "because your score is 4.4." Because of what this realm restores that the others depend on.

4. PROMISE THE REWARD — Use "so that..." or equivalent. Describe a CONCRETE imaginable moment specific to their profession (${persona.context}) after this realm's work is done. Not "you will feel better." An actual capability they can picture themselves using tomorrow.

End with tag: [concept:${realm.id}]`;
}

// Prompt for quest completion — three beats, reward-focused
export function buildQuestDonePrompt(quest, realm, persona) {
  const capability = REALM_CAPABILITIES[realm.id];
  return `TASK: The user has just completed an action in the realm "${realm.name}". The action restored something specific to the realm's cure.

Action concept: ${quest.why}

Speak in EXACTLY these three beats:

1. ACKNOWLEDGE THE ACT — Name the principle of what they did (e.g., "you returned something", "you opened a valve", "you named something that was unnamed") but do NOT quote the quest title literally and do NOT reference any physical metaphor.

2. CONNECT TO THE CURE — Say what this action adds to the ongoing work of this realm (which restores: ${capability}).

3. REINFORCE — Use "so that..." with a specific, imaginable next-time moment in the life of a ${persona.context}.

Keep it 2-3 sentences total. Wrap 2-3 key words in asterisks. Speak with the gravitas of the archetype.

End with tag: [concept:${realm.id}]`;
}

// Prompt for quest skip — three beats, no judgment
export function buildQuestSkipPrompt(quest, realm, profile) {
  return `TASK: The user skipped an action in the realm "${realm.name}". The Shadow "${profile.shadow.name}" gained strength.

Speak in EXACTLY these three beats:

1. ACKNOWLEDGE — Without judgment. Note that the action was not taken.

2. NAME WHAT THE SHADOW GAINED — Say what the Shadow (${profile.shadow.name}) now has that it would not have had. Speak honestly but without shame.

3. LEAVE THE DOOR OPEN — Not a demand. Not a plea. A simple observation that they can return when they are ready.

Keep it 2-3 sentences total. Wrap 2-3 key words in asterisks. Speak with the gravitas of the archetype.

End with tag: [concept:shadow]`;
}

// Prompt for shadow encounter response — four beats, integration not conquest
export function buildShadowEncounterPrompt(namingText, profile, persona) {
  return `TASK: The user has named what their Shadow ("${profile.shadow.name}") is asking them to see: "${namingText}"

Respond in EXACTLY these four beats:

1. RECEIVE — Do not dismiss. Do not solve. Acknowledge what they named.

2. REFRAME THE SHADOW AS PROTECTIVE — The Shadow was trying to preserve something. Say what it was trying to protect in them.

3. OFFER INTEGRATION — Not conquest. Not defeat. The Shadow becomes a companion, not a captive. Say this.

4. A CONCRETE INTEGRATED MOMENT — Use "so that..." with an imaginable moment in the life of a ${persona.context} when Shadow and self move as one.

3-4 sentences total. Wrap 2-3 key words in asterisks.

End with tag: [concept:integration]`;
}

// Prompt for aspirational self (broad — before they enter day 1)
export function buildAspirationalPrompt(userName, persona, profile, archetype) {
  return `TASK: Introduce yourself to ${userName}, a ${persona.context}, as their guide for the next 90 days of burnout recovery.

Their Shadow: ${profile.shadow.name} — ${profile.shadow.desc}

Speak in EXACTLY these three beats:

1. ACKNOWLEDGE WHERE THEY ARE — Name the broad state they are in, without listing scores.

2. POSITION YOURSELF AS GUIDE — Briefly, in the voice of ${archetype.figure}, say what you are here to do. Not to fix them. To walk beside them.

3. PROMISE THE ARC — In one sentence, describe who they could be by Day 90. Specific to a ${persona.context}. Something they can picture.

2-3 sentences total. Wrap 2-3 key words in asterisks.

End with tag: [concept:aspirational]`;
}
