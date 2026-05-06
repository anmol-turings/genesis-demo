"use client";
import { useState, useEffect, useRef } from "react";
import Mandala from "../lib/Mandala";
import RealmAnimation from "../lib/RealmAnimation";
import { getAudioController } from "../lib/AudioController";
import { selectQuote, formatQuoteForSpeech } from "../lib/quotes";
import {
  PERSONAS, ASSESSMENT_CATEGORIES, usernameToPersona, computeProfile,
  ARCHETYPES, TONE_STYLES, REALMS, RECOVERY_STAGES,
  recommendArchetype, recommendTone, getStage, buildMentorPrompt,
  orderedRealmsByPriority, generateShadowNaming,
  buildRealmBriefingPrompt, buildQuestDonePrompt, buildQuestSkipPrompt,
  buildShadowEncounterPrompt, buildAspirationalPrompt,
  passagePhrase, recoveryBandPhrase,
} from "../lib/constants";

async function fetchMentor(systemPrompt, userPrompt) {
  try {
    const res = await fetch("/api/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt }),
    });
    const d = await res.json();
    return d.text || "";
  } catch { return "The guide is contemplating..."; }
}

async function fetchVoice(text, voiceId) {
  try {
    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
    });
    const d = await res.json();
    if (!d.audio) return null;
    const byteString = atob(d.audio);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  } catch { return null; }
}

function parseMentorMessage(raw) {
  if (!raw) return { text: "", speakingText: "", concept: "default", quote: null, author: null };
  const conceptMatch = raw.match(/\[concept:(\w+)\]/);
  const concept = conceptMatch ? conceptMatch[1] : "default";
  const quoteMatch = raw.match(/\[quote\]([\s\S]*?)\[\/quote\]/);
  const authorMatch = raw.match(/\[author\]([\s\S]*?)\[\/author\]/);
  const quote = quoteMatch ? quoteMatch[1].trim() : null;
  const author = authorMatch ? authorMatch[1].trim() : null;

  // The mentor's own bridge — strip all tags
  let bridge = raw
    .replace(/\[concept:\w+\]/g, "")
    .replace(/\[quote\][\s\S]*?\[\/quote\]/g, "")
    .replace(/\[author\][\s\S]*?\[\/author\]/g, "")
    .trim();

  // Spoken form: bridge + natural attribution + quote (no markdown asterisks aloud)
  const bridgeForSpeech = bridge.replace(/\*([^*]+)\*/g, "$1");
  let speakingText = bridgeForSpeech;
  if (quote && author) {
    // Ensure the bridge terminates with a sentence-ending punct mark before
    // we attach the attribution — keeps speech cadence natural.
    const bridgePunct = /[.!?]\s*$/.test(bridgeForSpeech) ? bridgeForSpeech : `${bridgeForSpeech}.`;
    speakingText = `${bridgePunct} As ${author} put it: "${quote}"`;
  }

  return { text: bridge, speakingText, concept, quote, author };
}

// Truncate the mentor's bridge to at most 2 sentences. We split on ./?/!
// followed by a space or end-of-string. Asterisks for emphasis are ignored
// for the purpose of finding sentence boundaries.
function truncateToSentences(text, maxSentences = 2) {
  if (!text) return text;
  const stripped = text.replace(/\s+/g, " ").trim();
  // Greedy match of up to N sentences ending with .?! followed by space/EOL
  const re = /([^.!?]+[.!?]+)(?:\s+|$)/g;
  const sentences = [];
  let m;
  while ((m = re.exec(stripped)) !== null && sentences.length < maxSentences) {
    sentences.push(m[1].trim());
  }
  if (sentences.length === 0) return stripped; // no sentence boundary found
  return sentences.join(" ");
}

function AnimatedText({ text, color }) {
  if (!text) return null;
  const tokens = text.split(/(\s+)/).filter(Boolean);
  return (
    <div className="mentor-text" style={{ "--archetype-color": color }}>
      {tokens.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
        const trimmed = w.trim();
        const match = trimmed.match(/^([^\w*]*)\*([^*]+)\*([^\w*]*)$/);
        if (match) {
          return (
            <span key={i}>
              {match[1]}
              <span className="word emphasis" style={{ animationDelay: `${i * 55}ms` }}>{match[2]}</span>
              {match[3]}
            </span>
          );
        }
        return (
          <span key={i} className="word" style={{ animationDelay: `${i * 55}ms` }}>{w}</span>
        );
      })}
    </div>
  );
}

// Distinct visual treatment for the quote that follows the mentor's bridge.
// Renders as italic serif with a subtle gold rule and attribution.
function QuoteBlock({ quote, author, color }) {
  if (!quote) return null;
  return (
    <div
      className="animate-fadeUp"
      style={{
        marginTop: 12,
        paddingLeft: 14,
        borderLeft: `1px solid ${color}40`,
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -6, left: -2,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.6rem",
          color: color,
          opacity: 0.45,
          lineHeight: 1,
        }}
      >“</span>
      <p
        className="serif"
        style={{
          fontStyle: "italic",
          fontSize: "0.92rem",
          lineHeight: 1.55,
          color: "var(--cream)",
          margin: 0,
          opacity: 0.95,
        }}
      >
        {quote}
      </p>
      <div
        className="mono"
        style={{
          marginTop: 6,
          fontSize: "8px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: color,
          opacity: 0.75,
        }}
      >
        — {author}
      </div>
    </div>
  );
}

function ShadowIndicator({ recoveryScore, shadowName, onClick }) {
  const opacity = Math.max(0.25, 0.95 - (recoveryScore / 100) * 0.7);
  return (
    <div onClick={onClick} style={{
      cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px",
      background: `rgba(139, 58, 58, ${opacity * 0.25})`,
      border: `1px solid rgba(139, 58, 58, ${opacity * 0.9})`,
      flex: 1,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#8b3a3a",
        opacity: opacity,
        boxShadow: `0 0 ${6 + opacity * 10}px #8b3a3a`,
      }} />
      <div style={{ flex: 1 }}>
        <div className="mono" style={{ fontSize: "7px", color: "#c97575", letterSpacing: "0.2em", textTransform: "uppercase" }}>WHAT IS PULLING</div>
        <div className="serif" style={{ fontSize: "0.78rem", color: "#d4aaaa", fontStyle: "italic" }}>{shadowName}</div>
      </div>
    </div>
  );
}

const REALM_VIDEO = {
  withdrawn: "/scenes/embers.mp4",
};

export default function BurnoutDemo() {
  const [screen, setScreen] = useState("hero");

  const [username, setUsername] = useState("");
  const [persona, setPersona] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState("");

  const [loadedCategories, setLoadedCategories] = useState(0);
  const [loadingCategoryIdx, setLoadingCategoryIdx] = useState(-1);
  const [loadComplete, setLoadComplete] = useState(false);

  const [archetype, setArchetype] = useState(null);
  const [recommendedArchetype, setRecommendedArchetype] = useState(null);
  const [archetypeReasons, setArchetypeReasons] = useState([]);
  const [tone, setTone] = useState(null);
  const [recommendedTone, setRecommendedTone] = useState(null);
  const [toneReasons, setToneReasons] = useState([]);
  const [expandedWhy, setExpandedWhy] = useState({});

  const [recoveryScore, setRecoveryScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [day, setDay] = useState(1);
  const [activeRealmIdx, setActiveRealmIdx] = useState(0);
  const [completedByRealm, setCompletedByRealm] = useState({}); // {realmId: ['0','1']}
  const [history, setHistory] = useState([]);
  const [expandedStage, setExpandedStage] = useState(null);
  const [orderedRealms, setOrderedRealms] = useState([]);

  const [mentorRaw, setMentorRaw] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const [shadowEncounterText, setShadowEncounterText] = useState("");
  const [quoteHistory, setQuoteHistory] = useState({});
  const [returnTier, setReturnTier] = useState(null);
  const [returnDismissed, setReturnDismissed] = useState(false);

  // Centralized audio — singleton across all screens. See lib/AudioController.
  const audio = getAudioController();
  const mentorParsed = parseMentorMessage(mentorRaw);
  const stage = getStage(totalPoints);

  // Wire onEnded once, when controller becomes available.
  useEffect(() => {
    if (!audio) return;
    audio.onEnded(() => setIsPlaying(false));
  }, [audio]);

  // Cache key builder. The same (archetype, day, kind, ctxKey) tuple should
  // never trigger Mistral or ElevenLabs twice.
  const cacheKeyFor = (kind, ctx) => {
    const arch = archetype?.id || "_";
    const t = tone || "_";
    if (kind === "realm_briefing") {
      return `${arch}|${t}|d${day}|realm_briefing|${(ctx?.realm || orderedRealms[activeRealmIdx])?.id || "_"}`;
    }
    if (kind === "quest_done") {
      return `${arch}|${t}|d${day}|quest_done|${ctx?.realm?.id || "_"}|${ctx?.quest?.title || "_"}`;
    }
    if (kind === "quest_skipped") {
      return `${arch}|${t}|d${day}|quest_skipped|${ctx?.realm?.id || "_"}|${ctx?.quest?.title || "_"}`;
    }
    if (kind === "shadow_encounter") {
      return `${arch}|${t}|d${day}|shadow|${(ctx?.namingText || "").slice(0, 80)}`;
    }
    if (kind === "aspirational") {
      return `${arch}|${t}|aspirational`;
    }
    return `${arch}|${t}|d${day}|${kind}`;
  };

  // Generic mentor dispatcher — quote-aware, cached, request-versioned.
  // Flow:
  //   1. Stop any current audio immediately.
  //   2. Bump requestId so any in-flight prior request becomes stale.
  //   3. Compute cache key. Hit → set state + play, no API calls, return.
  //   4. Pick a deterministic quote (by archetype/tone/kind/realm + ctxKey).
  //   5. Build the prompt WITH that quote so Mistral writes a bridge to it.
  //   6. Mistral returns 1-2 sentences. Truncate hard if it overran.
  //   7. Compose the final mentorRaw with [quote] and [author] tags appended.
  //   8. Speak the bridge + "As X put it: ..." via ElevenLabs.
  //   9. Cache the (mentorRaw, audioUrl) pair.
  const generateMentor = async (kind, ctx = {}) => {
    if (!archetype || !persona || !profile) return;

    if (audio) audio.stop();
    const myReqId = audio ? audio.bumpRequestId() : 0;

    const key = cacheKeyFor(kind, ctx);

    const realm = orderedRealms[activeRealmIdx] || REALMS[0];
    const ctxRealmId = (ctx.realm || realm)?.id || null;
    const quote = selectQuote({
      archetype: archetype.id, tone, kind, realmId: ctxRealmId, ctxKey: key,
    });
    const authorSlug = quote?.author ? quote.author.toLowerCase().replace(/[^a-z]/g,"") : "";
    const priorCount = authorSlug ? (quoteHistory[authorSlug] || 0) : 0;
    if (authorSlug) {
      setQuoteHistory(h => ({ ...h, [authorSlug]: (h[authorSlug] || 0) + 1 }));
    }

    if (audio && audio.hasCached(key)) {
      const cached = audio.getCached(key);
      setMentorRaw(cached.mentorRaw || "");
      setMentorLoading(false);
      if (cached.audioUrl && !muted) {
        await audio.play(cached.audioUrl);
        setIsPlaying(true);
      }
      return;
    }

    setMentorLoading(true);
    setMentorRaw("");

    const ackPrefix = (authorSlug && priorCount === 2 && archetype?.returningQuoteAck)
      ? archetype.returningQuoteAck.replace(/\{author\}/gi, quote.author)
      : "";

    // Step 5: build the system + user prompts. Pass quote into the user prompt.
    const systemPrompt = buildMentorPrompt({
      archetype, tone, userName, persona, profile, recoveryScore, stage, day,
    });

    let userPrompt = "";
    if (kind === "realm_briefing") {
      userPrompt = buildRealmBriefingPrompt(ctx.realm || realm, persona, profile, day, quote);
    } else if (kind === "quest_done") {
      userPrompt = buildQuestDonePrompt(ctx.quest, ctx.realm || realm, persona, quote);
    } else if (kind === "quest_skipped") {
      userPrompt = buildQuestSkipPrompt(ctx.quest, ctx.realm || realm, profile, quote);
    } else if (kind === "shadow_encounter") {
      userPrompt = buildShadowEncounterPrompt(ctx.namingText, profile, persona, quote);
    } else if (kind === "aspirational") {
      userPrompt = buildAspirationalPrompt(userName, persona, profile, archetype, quote);
    }

    // Step 6: get Mistral's bridge sentences.
    const mistralRaw = await fetchMentor(systemPrompt, userPrompt);
    if (audio && audio.isStale(myReqId)) return;

    // Pull out the [concept:xxx] tag, truncate the prose to <=2 sentences,
    // then re-attach the tag and the quote/author tags.
    const conceptMatch = mistralRaw.match(/\[concept:(\w+)\]/);
    const concept = conceptMatch ? conceptMatch[0] : "[concept:default]";
    let bridge = mistralRaw.replace(/\[concept:\w+\]/g, "").trim();
    bridge = truncateToSentences(bridge, 2);

    const bridgeWithAck = ackPrefix ? `${ackPrefix} ${bridge}` : bridge;
    const finalRaw = quote
      ? `${bridgeWithAck} ${concept}[quote]${quote.text}[/quote][author]${quote.author}[/author]`
      : `${bridgeWithAck} ${concept}`;

    setMentorRaw(finalRaw);
    setMentorLoading(false);

    // Step 8: speak via ElevenLabs.
    let audioUrl = null;
    let { speakingText } = parseMentorMessage(finalRaw);
    if (kind === "aspirational" && archetype?.promise) {
      const promiseSpoken = archetype.promise.replace(/\*([^*]+)\*/g, "$1");
      const punct = /[.!?]\s*$/.test(speakingText) ? speakingText : `${speakingText}.`;
      speakingText = `${punct} ${promiseSpoken}`;
    }
    if (archetype?.voiceId && !muted) {
      audioUrl = await fetchVoice(speakingText, archetype.voiceId);
      if (audio && audio.isStale(myReqId)) return;
    }

    if (audio) {
      audio.setCached(key, { mentorRaw: finalRaw, audioUrl });
      if (audioUrl && !muted) {
        await audio.play(audioUrl);
        setIsPlaying(true);
      }
    }
  };

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

  useEffect(() => {
    if (screen !== "loading") return;
    if (loadingCategoryIdx >= ASSESSMENT_CATEGORIES.length) {
      setLoadComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setLoadedCategories(loadingCategoryIdx + 1);
      setLoadingCategoryIdx(loadingCategoryIdx + 1);
    }, 1100);
    return () => clearTimeout(timer);
  }, [screen, loadingCategoryIdx]);

  const handleGoToArchetype = () => {
    const rec = recommendArchetype(persona);
    setRecommendedArchetype(rec.archetype);
    setArchetype(rec.archetype);
    setArchetypeReasons(rec.reasons);
    setScreen("archetype");
  };

  const handleConfirmArchetype = () => {
    const rec = recommendTone(persona);
    setRecommendedTone(rec.tone);
    setTone(rec.tone.id);
    setToneReasons(rec.reasons);
    setScreen("tone");
  };

  const handleGoToAspirational = async () => {
    if (audio) audio.stop();
    setIsPlaying(false);
    setMentorRaw("");
    setScreen("aspirational");
    setTimeout(() => generateMentor("aspirational"), 400);
  };

  const handleEnterDashboard = async () => {
    if (audio) audio.stop();
    setIsPlaying(false);
    setMentorRaw("");
    setScreen("dashboard");
    setTimeout(() => generateMentor("realm_briefing"), 400);
  };

  const completeQuest = async (quest, realmIdx, questIdx) => {
    const realm = orderedRealms[realmIdx];
    const pts = quest.points;
    setRecoveryScore(s => Math.min(100, s + Math.floor(pts / 3)));
    setTotalPoints(t => t + pts);
    setCompletedByRealm(c => ({ ...c, [realm.id]: [...(c[realm.id] || []), `${questIdx}`] }));
    setHistory(h => [...h, { day, quest: quest.title, status: "done", points: pts, realm: realm.id }]);
    await generateMentor("quest_done", { quest, realm });
  };

  const skipQuest = async (quest, realmIdx, questIdx) => {
    const realm = orderedRealms[realmIdx];
    setRecoveryScore(s => Math.max(0, s - 3));
    setCompletedByRealm(c => ({ ...c, [realm.id]: [...(c[realm.id] || []), `${questIdx}`] }));
    setHistory(h => [...h, { day, quest: quest.title, status: "skipped", points: -3, realm: realm.id }]);
    await generateMentor("quest_skipped", { quest, realm });
  };

  const nextDay = async () => {
    if (audio) audio.stop();
    setIsPlaying(false);
    setDay(d => d + 1);
    setActiveRealmIdx(r => (r + 1) % orderedRealms.length);
    setCompletedByRealm({}); // reset for new day (simplified — each day is a fresh slate)
    const nextRealm = orderedRealms[(activeRealmIdx + 1) % orderedRealms.length];
    await generateMentor("realm_briefing", { realm: nextRealm });
  };

  const switchRealm = async (idx) => {
    if (idx === activeRealmIdx) return;
    if (audio) audio.stop();
    setIsPlaying(false);
    setActiveRealmIdx(idx);
    await generateMentor("realm_briefing", { realm: orderedRealms[idx] });
  };

  const openShadowEncounter = () => {
    if (audio) audio.stop();
    setIsPlaying(false);
    const naming = generateShadowNaming(persona, profile);
    setShadowEncounterText(naming);
    setMentorRaw("");
    setScreen("shadow_encounter");
  };

  // Always-available back-to-dashboard for the shadow page (Bug #6).
  const exitShadowEncounter = () => {
    if (audio) audio.stop();
    setIsPlaying(false);
    setMentorRaw("");
    setShadowEncounterText("");
    setScreen("dashboard");
  };

  const submitShadowEncounter = async () => {
    await generateMentor("shadow_encounter", { namingText: shadowEncounterText });
    setRecoveryScore(s => Math.min(100, s + 8));
    setTotalPoints(t => t + 30);
    setHistory(h => [...h, { day, quest: "Shadow Encounter", status: "integrated", points: 30 }]);
  };

  const toggleWhy = (key) => setExpandedWhy(w => ({ ...w, [key]: !w[key] }));

  // ═══════════════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════════════

  if (screen === "hero") {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", padding: "2.5rem 2rem" }}>
        <div className="section-label">THE RIDE OF YOUR LIFE</div>
        <h1 className="serif" style={{ fontSize: "clamp(42px, 11vw, 66px)", color: "var(--cream)", lineHeight: 0.95, marginBottom: 8 }}>THE RIDE</h1>
        <p className="serif" style={{ fontSize: "1.05rem", fontStyle: "italic", color: "var(--gold-light)", marginBottom: 28 }}>
          Before the body breaks, it begins to drift.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Mandala archetypeId="stoic" color="#c9a84c" concept="still" size={180} />
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--silver)", lineHeight: 1.8, marginBottom: 28 }}>
          Ninety days. One mentor — chosen from those who have walked it before. The terrain is read from your 42 app readings. The walk is yours.
        </p>

        <div className="gold-rule" />

        <div style={{ marginTop: 20 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>ENTER WITH YOUR 42 ACCOUNT</div>
          <input
            className="input"
            placeholder="Your 42 username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && username.trim() && handleLoginSubmit()}
          />
          <button className="btn-gold" disabled={!username.trim()} onClick={handleLoginSubmit} style={{ marginTop: 10 }}>
            STEP IN →
          </button>
          <p style={{ fontSize: "0.68rem", color: "var(--gold-dim)", marginTop: 10, fontStyle: "italic", textAlign: "center" }}>
            Demo: your readings are simulated based on your username
          </p>
        </div>

      </div>
    );
  }

  // ─── LOADING ───────────────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="shell" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="section-label">Reading what you have been carrying</div>
        <h2 className="serif" style={{ fontSize: "1.5rem", color: "var(--cream)", marginBottom: 4 }}>{userName}.</h2>
        <p style={{ fontSize: "0.82rem", color: "var(--silver)", marginBottom: 22 }}>
          Drawing what we know of you. A few moments.
        </p>

        {ASSESSMENT_CATEGORIES.map((c, i) => {
          const done = i < loadedCategories - 1 || (i === ASSESSMENT_CATEGORIES.length - 1 && loadComplete);
          const loading = !loadComplete && i === loadedCategories - 1;
          const visible = i < loadedCategories;

          let finding = "";
          if (done && persona) {
            if (c.key === "bat") {
              const ex = persona.bat.exhaustion, md = persona.bat.mental_distance, cg = persona.bat.cognitive, em = persona.bat.emotional;
              if (ex >= 4.0) finding = "the body is signaling deep fatigue";
              else if (md >= 4.0) finding = "distance is hardening into armor";
              else if (cg >= 4.0) finding = "the mind is fragmenting under load";
              else if (em >= 4.0) finding = "the heart is showing strain";
              else finding = "patterns are surfacing";
            }
            else if (c.key === "cognitive_health") {
              finding = persona.cognitive_health.loneliness >= 3.8 ? "the alone shows" : persona.cognitive_health.anxiety >= 3.8 ? "the racing shows" : "the holding is uneven";
            }
            else if (c.key === "metabolic_risk") finding = persona.metabolic_risk >= 3.5 ? "the form runs warm" : persona.metabolic_risk >= 2.5 ? "the form runs steady" : "the form runs cool";
            else if (c.key === "lifestyle") finding = persona.lifestyle.sleep >= 4.0 ? "sleep is thinner than it knows" : "the rhythms are uneven";
            else if (c.key === "alexithymia") finding = persona.alexithymia >= 3.8 ? "the translation has gone quiet" : "the translation is uneven";
            else if (c.key === "self_efficacy") finding = persona.self_efficacy >= 3.5 ? "agency is intact" : "agency is thinning";
            else if (c.key === "personality") finding = "the shape is steady";
            else if (c.key === "work_conditions") finding = persona.work_conditions.meaning >= 3.5 ? "the demands have grown · the work still means" : "the work has gone hollow · the demands have not";
          }

          return (
            <div key={c.key} className={`load-row ${visible ? "visible" : ""}`}>
              <div className={`load-check ${done ? "done" : loading ? "loading" : ""}`}>
                {done ? "✓" : loading ? "·" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", color: done ? "var(--cream)" : "var(--mist)" }}>{c.label}</div>
                <div className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
                  {c.detail} · {c.count} items
                </div>
                {done && finding && (
                  <div className="mono animate-fadeIn" style={{ fontSize: "9px", color: "var(--gold)", marginTop: 4, letterSpacing: "0.08em" }}>
                    → {finding}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loadComplete && (
          <div className="animate-fadeUp" style={{ marginTop: 24 }}>
            <div style={{ padding: "0.9rem 1.1rem", background: "var(--deep)", border: "1px solid var(--gold-dim)", marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: "9px", color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                The pattern is visible
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--mist)", lineHeight: 1.6 }}>
                What has been pulling on you is called <span style={{ color: "#c97575", fontStyle: "italic" }}>{profile.shadow.name}</span>. It has been with you longer than this assessment. We have read {ASSESSMENT_CATEGORIES.reduce((s, c) => s + c.count, 0)} signals across {ASSESSMENT_CATEGORIES.length} dimensions of who you are.
              </p>
            </div>
            <button className="btn-gold" onClick={() => setScreen("profile")}>
              SEE WHAT THE READING SHOWS →
            </button>
          </div>
        )}

      </div>
    );
  }

  // ─── PROFILE + SHADOW REVEAL (iceberg animation) ───────────────────
  if (screen === "profile") {
    const shadowLabels = [
      { name: "exhaustion",    value: persona.bat.exhaustion.toFixed(1),         x: -110, y: 100 },
      { name: "sleep_drift",   value: persona.lifestyle.sleep.toFixed(1),         x:  100, y: 130 },
      { name: "alexithymia",   value: persona.alexithymia.toFixed(1),             x:  -30, y: 200 },
      { name: "work_pressure", value: persona.work_conditions.pressure.toFixed(1), x:  130, y: 250 },
      { name: "loneliness",    value: persona.cognitive_health.loneliness.toFixed(1), x: -130, y: 290 },
    ];

    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">WHAT WE READ OF YOU</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>We have read your terrain, {userName}.</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--silver)", marginBottom: 18 }}>{persona.context}</p>

        {/* ONE animation per page — Iceberg reveals the Shadow */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ position: "relative", width: 420, height: 340 }}>
            <video
              src="/scenes/iceberg-bare.mp4"
              autoPlay loop muted playsInline
              style={{ width: 420, height: 340, display: "block", background: "#06060a" }}
            />
            {shadowLabels.map((lbl, i) => {
              const left = 210 + lbl.x * 0.5 - 70;
              const top  = 191 + lbl.y * 0.5 - 12;
              return (
                <div key={lbl.name} className="animate-fadeUp" style={{
                  position: "absolute", left, top, width: 140, textAlign: "center",
                  animationDelay: `${1.5 + i * 0.25}s`, opacity: 0,
                  animationFillMode: "forwards",
                  pointerEvents: "none",
                }}>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--gold-light)", textShadow: "0 0 8px rgba(232,200,140,0.75)" }}>
                    {lbl.name}
                  </div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--cream)", marginTop: 2, textShadow: "0 0 6px rgba(232,200,140,0.9), 0 0 16px rgba(201,168,76,0.5)" }}>
                    {lbl.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shadow name — big, serif, beneath the animation */}
        <div style={{ padding: "1rem 1.2rem", background: "var(--deep)", borderLeft: "2px solid var(--shadow-red)", marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#c97575", textTransform: "uppercase", marginBottom: 4 }}>
            WHAT HAS BEEN PULLING ON YOU
          </div>
          <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--cream)", marginBottom: 6 }}>{profile.shadow.name}</h3>
          <p className="serif" style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--gold-light)", marginBottom: 12, lineHeight: 1.6 }}>
            {profile.shadow.desc}
          </p>

          <div onClick={() => toggleWhy("shadow")} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.72rem", color: "var(--gold)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <span>WHY THIS NAME</span>
            <span>{expandedWhy.shadow ? "−" : "+"}</span>
          </div>

          {expandedWhy.shadow && (
            <div className="animate-fadeUp" style={{ marginTop: 6 }}>
              {profile.shadow.why.map((w, i) => (
                <div key={i} className="why-card">
                  <div style={{ fontSize: "0.78rem", color: "var(--silver)", fontStyle: "italic", lineHeight: 1.5 }}>· {w.note}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(139,58,58,0.1)", borderLeft: "2px solid var(--shadow-red)", fontSize: "0.78rem", fontStyle: "italic", color: "var(--mist)", lineHeight: 1.6 }}>
                {profile.shadow.rootInsight}
              </div>
            </div>
          )}
        </div>

        {/* Collapsed score summary */}
        <div onClick={() => toggleWhy("scores")} style={{ cursor: "pointer", padding: "8px 12px", background: "var(--slate)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 14, display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--silver)" }}>
          <span style={{ fontStyle: "italic", color: "var(--silver)" }}>see the data</span>
          <span>{expandedWhy.scores ? "−" : "+ scores"}</span>
        </div>

        {expandedWhy.scores && (
          <div className="animate-fadeUp" style={{ marginBottom: 14 }}>
            {[
              { key: "exhaustion", label: "Exhaustion", color: "#c9a84c" },
              { key: "mental_distance", label: "Mental Distance", color: "#5fa0d4" },
              { key: "cognitive", label: "Cognitive Impairment", color: "#a06ac4" },
              { key: "emotional", label: "Emotional Impairment", color: "#7abcae" },
            ].map(d => {
              const score = persona.bat[d.key];
              const pct = (score / 5) * 100;
              return (
                <div key={d.key} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 2 }}>
                    <span style={{ color: "var(--mist)" }}>{d.label}</span>
                    <span style={{ color: d.color, fontFamily: "'Space Mono', monospace", fontSize: "0.7rem" }}>{score.toFixed(1)}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: d.color }} /></div>
                </div>
              );
            })}
          </div>
        )}

        <button className="btn-gold" onClick={handleGoToArchetype}>MEET WHO WALKS WITH YOU →</button>
      </div>
    );
  }

  // ─── ARCHETYPE ─────────────────────────────────────────────────────
  if (screen === "archetype") {
    const isRecSelected = archetype?.id === recommendedArchetype.id;
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">WHO SHOWS UP FOR YOU</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>These are the ones who walk with people like you.</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--silver)", marginBottom: 18 }}>
          Drawn from what we read of you — temperament, terrain, the work you do.
        </p>

        {/* Recommended card — now clickable to re-select after picking another */}
        <div
          onClick={() => setArchetype(recommendedArchetype)}
          style={{
            cursor: "pointer",
            padding: "1.2rem",
            background: recommendedArchetype.color + (isRecSelected ? "25" : "15"),
            border: `${isRecSelected ? "2px" : "1px"} solid ${recommendedArchetype.color}`,
            marginBottom: 16,
            position: "relative",
            transition: "background 0.2s, border-color 0.2s",
          }}>
          <div className="mono" style={{ position: "absolute", top: -8, right: 12, padding: "2px 10px", background: recommendedArchetype.color, color: "var(--void)", fontSize: "8px", letterSpacing: "0.2em", fontWeight: 700 }}>
            {isRecSelected ? "FIRST CHOICE · CHOSEN" : "FIRST CHOICE"}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Mandala archetypeId={recommendedArchetype.id} color={recommendedArchetype.color} concept="still" size={140} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <h3 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)" }}>{recommendedArchetype.name}</h3>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: recommendedArchetype.color, textTransform: "uppercase" }}>{recommendedArchetype.figure}</div>
            <div className="serif" style={{ fontSize: "0.88rem", fontStyle: "italic", color: "var(--gold-light)", marginTop: 2 }}>{recommendedArchetype.epithet}</div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--mist)", lineHeight: 1.6, marginBottom: 10, textAlign: "center" }}>{recommendedArchetype.desc}</p>

          <div onClick={(e) => { e.stopPropagation(); toggleWhy("arch_rec"); }} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.72rem", color: recommendedArchetype.color, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <span>WHY {recommendedArchetype.name.toUpperCase()} COMES TO YOU</span>
            <span>{expandedWhy.arch_rec ? "−" : "+"}</span>
          </div>

          {expandedWhy.arch_rec && (
            <div className="animate-fadeUp" style={{ marginTop: 8 }}>
              {archetypeReasons.map((r, i) => (
                <div key={i} className="why-card">
                  <div style={{ fontSize: "0.78rem", color: "var(--silver)", fontStyle: "italic", lineHeight: 1.5 }}>· {r.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-label">OR CHOOSE A DIFFERENT WALKER</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }}>
          {ARCHETYPES.map(a => {
            const isSel = archetype?.id === a.id;
            const isRec = a.id === recommendedArchetype.id;
            return (
              <div key={a.id} onClick={() => setArchetype(a)} style={{
                padding: "10px", cursor: "pointer",
                background: isSel ? a.color + "25" : "var(--slate)",
                border: `1px solid ${isSel ? a.color : a.color + "30"}`,
                position: "relative",
              }}>
                {isRec && <div style={{ position: "absolute", top: 4, right: 6, fontSize: "7px", color: a.color, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em" }}>★</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                  <div className="serif" style={{ fontSize: "0.9rem", color: "var(--cream)" }}>{a.name}</div>
                </div>
                <div className="mono" style={{ fontSize: "7px", letterSpacing: "0.15em", color: a.color, textTransform: "uppercase" }}>{a.figure}</div>
              </div>
            );
          })}
        </div>

        <button className="btn-gold" onClick={handleConfirmArchetype}>WALK WITH {archetype.name.toUpperCase()} →</button>
      </div>
    );
  }

  // ─── TONE ──────────────────────────────────────────────────────────
  if (screen === "tone") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">How should {archetype.name} speak?</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>Choose Your Voice</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--silver)", marginBottom: 18 }}>Same archetype. Three registers.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TONE_STYLES.map(t => {
            const isRec = recommendedTone?.id === t.id;
            return (
              <div key={t.id} onClick={() => setTone(t.id)} style={{
                padding: "0.95rem",
                background: tone === t.id ? "var(--charcoal)" : "var(--slate)",
                border: tone === t.id ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer", position: "relative",
              }}>
                {isRec && <div className="mono" style={{ position: "absolute", top: -8, right: 10, padding: "2px 8px", background: "var(--gold)", color: "var(--void)", fontSize: "7px", letterSpacing: "0.2em", fontWeight: 700 }}>BEST FIT</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span className="serif" style={{ fontSize: "1.2rem", color: tone === t.id ? "var(--gold)" : "var(--silver)" }}>{t.icon}</span>
                  <span className="mono" style={{ fontSize: "10px", letterSpacing: "0.15em", color: tone === t.id ? "var(--gold)" : "var(--mist)", textTransform: "uppercase" }}>{t.label}</span>
                </div>
                <p style={{ fontSize: "0.76rem", color: "var(--silver)", marginBottom: 8 }}>{t.desc}</p>
                <div style={{ padding: "0.6rem", background: "rgba(0,0,0,0.3)", borderLeft: `2px solid ${archetype.color}`, fontSize: "0.76rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "var(--cream)" }}>
                  "{t.example}"
                </div>
                {isRec && (
                  <div onClick={(e) => { e.stopPropagation(); toggleWhy("tone"); }} style={{ cursor: "pointer", marginTop: 8, padding: "4px 0", fontSize: "0.68rem", color: "var(--gold)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {expandedWhy.tone ? "− hide reasoning" : "+ WHY THIS REGISTER FOR YOU"}
                  </div>
                )}
                {isRec && expandedWhy.tone && (
                  <div className="animate-fadeUp">
                    {toneReasons.map((r, i) => (
                      <div key={i} className="why-card">
                        <div style={{ fontSize: "0.78rem", color: "var(--silver)", fontStyle: "italic", lineHeight: 1.5 }}>· {r.note}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {tone && (
          <button className="btn-gold" style={{ marginTop: 16 }} onClick={handleGoToAspirational}>
            MEET WHAT YOU COULD BECOME →
          </button>
        )}

      </div>
    );
  }

  // ─── ASPIRATIONAL ──────────────────────────────────────────────────
  if (screen === "aspirational") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">Who You Could Become</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 12 }}>
          {archetype.name} speaks.
        </h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Mandala archetypeId={archetype.id} color={archetype.color} concept={mentorParsed.concept} size={220} />
        </div>

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

        {!mentorLoading && mentorRaw && archetype?.promise && (
          <div className="animate-fadeUp" style={{ padding: "1.2rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}`, marginBottom: 16 }}>
            <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              The Promise
            </div>
            <AnimatedText text={archetype.promise} color={archetype.color} />
          </div>
        )}

        <button className="btn-gold" onClick={handleEnterDashboard}>BEGIN →</button>
      </div>
    );
  }

  // ─── DASHBOARD — ONE hero animation per page ──────────────────────
  if (screen === "dashboard") {
    const realm = orderedRealms[activeRealmIdx];
    const completedCount = (completedByRealm[realm.id] || []).length;
    const isTopPriority = activeRealmIdx === 0;

    return (
      <div className="shell" style={{ padding: "1.2rem 1.4rem 2rem" }}>
        {returnTier && archetype?.returnCopy && !returnDismissed && (
          <div style={{ padding: "0.8rem 1rem", background: archetype.color + "10", borderLeft: `2px solid ${archetype.color}`, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div className="serif" style={{ fontSize: "0.85rem", fontStyle: "italic", color: "var(--cream)", flex: 1, lineHeight: 1.5 }}>
              <AnimatedText text={archetype.returnCopy[returnTier]} color={archetype.color} />
            </div>
            <span onClick={() => setReturnDismissed(true)} style={{ cursor: "pointer", color: "var(--silver)", fontSize: "0.8rem", padding: "0 4px", lineHeight: 1 }}>✕</span>
          </div>
        )}
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <h2 className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)" }}>The Ride</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: "8px", color: stage.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{passagePhrase(stage, day)}</div>
            <div className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)" }}>{archetype.name}</div>
          </div>
        </div>

        {/* Shadow + mute */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <ShadowIndicator recoveryScore={recoveryScore} shadowName={profile.shadow.name} onClick={openShadowEncounter} />
          <span onClick={() => setMuted(m => !m)} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.7rem", color: "var(--silver)", display: "flex", alignItems: "center" }}>
            {muted ? "🔇" : "🔊"}
          </span>
        </div>

        {/* Realm Banner */}
        <div style={{ marginBottom: 10, padding: "0.8rem 1rem", background: realm.color + "10", border: `1px solid ${realm.color}40` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: realm.color, textTransform: "uppercase" }}>TODAY'S TERRAIN</div>
              <div className="serif" style={{ fontSize: "1.2rem", color: "var(--cream)" }}>{realm.icon} {realm.name}</div>
              <div style={{ fontSize: "0.72rem", color: realm.color, marginTop: 1 }}>{realm.sub}</div>
            </div>
            {isTopPriority && <div className="mono" style={{ fontSize: "7px", padding: "2px 8px", background: "var(--gold)", color: "var(--void)", letterSpacing: "0.15em", fontWeight: 700 }}>BEGIN HERE</div>}
          </div>
        </div>

        {/* THE ONE HERO ANIMATION — physics metaphor, state-driven */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, background: "#06060a", border: `1px solid ${realm.color}20` }}>
          {REALM_VIDEO[realm.id] ? (
            <video
              key={realm.id}
              src={REALM_VIDEO[realm.id]}
              autoPlay loop muted playsInline
              style={{ width: 420, height: 340, display: "block" }}
            />
          ) : (
            <RealmAnimation scene={realm.id} color={realm.color} state={completedCount} size={{ w: 420, h: 340 }} />
          )}
        </div>

        {/* Mentor message — bridge text + quote — with the archetype mandala beside it */}
        <div style={{ padding: "0.9rem 1rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}`, marginBottom: 14, minHeight: 80, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <Mandala archetypeId={archetype.id} color={archetype.color} concept={mentorParsed.concept} size={88} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
              {archetype.name} · {archetype.figure}
            </div>
            {mentorLoading ? (
              <div className="serif" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--silver)" }}>
                {archetype.name} is contemplating...
              </div>
            ) : (
              <>
                <AnimatedText text={mentorParsed.text} color={archetype.color} />
                <QuoteBlock quote={mentorParsed.quote} author={mentorParsed.author} color={archetype.color} />
              </>
            )}
          </div>
        </div>

        {/* Realm navigation — 5 realms as tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {orderedRealms.map((r, i) => (
            <div key={i} onClick={() => switchRealm(i)}
              style={{
                flex: 1, padding: "8px 4px", textAlign: "center", cursor: "pointer",
                background: i === activeRealmIdx ? r.color + "20" : "var(--slate)",
                border: `1px solid ${i === activeRealmIdx ? r.color : "rgba(255,255,255,0.04)"}`,
                position: "relative",
              }}>
              {i === 0 && <div style={{ position: "absolute", top: -4, right: -2, width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />}
              <div style={{ fontSize: "1rem", color: r.color }}>{r.icon}</div>
              <div className="mono" style={{ fontSize: "6px", color: i === activeRealmIdx ? r.color : "var(--silver)", letterSpacing: "0.1em" }}>{r.label.split(" ")[1]}</div>
            </div>
          ))}
        </div>

        {/* Quest cards — NO mini-animations. Just text + actions */}
        <div style={{ marginBottom: 12 }}>
          {realm.quests.map((quest, qi) => {
            const done = (completedByRealm[realm.id] || []).includes(`${qi}`);
            return (
              <div key={qi} style={{
                padding: "0.85rem 1rem",
                background: done ? "rgba(201,168,76,0.05)" : "var(--slate)",
                border: `1px solid ${done ? "var(--gold-dim)" : "rgba(255,255,255,0.04)"}`,
                marginBottom: 4, opacity: done ? 0.65 : 1,
              }}>
                <div style={{ fontSize: "0.88rem", color: "var(--cream)", marginBottom: 4, lineHeight: 1.3 }}>{quest.title}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--silver)", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>{quest.why}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)" }}>⏱ {quest.time}m</span>
                  </div>
                  {!done && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => completeQuest(quest, activeRealmIdx, qi)}
                        style={{ padding: "5px 12px", border: `1px solid ${realm.color}`, background: "transparent", color: realm.color, fontSize: "0.7rem", fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>DONE</button>
                      <button onClick={() => skipQuest(quest, activeRealmIdx, qi)}
                        style={{ padding: "5px 12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--silver)", fontSize: "0.7rem", fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>SKIP</button>
                    </div>
                  )}
                  {done && <span className="mono" style={{ fontSize: "9px", color: "var(--gold)" }}>✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn-gold" onClick={nextDay} style={{ flex: 1 }}>RIDE ON →</button>
          <button className="btn-ghost" onClick={openShadowEncounter} style={{ flex: 1 }}>FACE THE SHADOW</button>
        </div>

        {/* Compressed score + progression */}
        <div style={{ padding: "0.7rem 1rem", border: "1px solid var(--gold-dim)", background: "var(--deep)", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Where you are</div>
            <div className="serif" style={{ fontSize: "0.95rem", color: archetype.color, fontStyle: "italic" }}>{recoveryBandPhrase(recoveryScore)}</div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 8, left: 4, right: 4, height: 2, background: "var(--charcoal)" }} />
            <div style={{ position: "absolute", top: 8, left: 4, height: 2, background: `linear-gradient(90deg, ${stage.color}, ${archetype.color})`, width: `${Math.min(100, (totalPoints / 1000) * 100)}%`, transition: "width 0.8s ease" }} />
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {RECOVERY_STAGES.map((s, i) => {
                const isActive = stage.level >= s.level;
                const isCurrent = stage.level === s.level;
                const isExp = expandedStage === i;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", zIndex: isExp ? 10 : 1 }}
                    onClick={() => setExpandedStage(isExp ? null : i)}>
                    <div style={{
                      width: isCurrent ? 18 : 14, height: isCurrent ? 18 : 14,
                      borderRadius: "50%",
                      background: isActive ? s.color : "var(--charcoal)",
                      border: `2px solid ${isActive ? s.color : "rgba(255,255,255,0.1)"}`,
                      fontSize: isCurrent ? "8px" : "6px",
                      color: isActive ? "var(--void)" : "var(--silver)",
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: isCurrent ? `0 0 8px ${s.color}80` : "none",
                    }}>{s.icon}</div>
                    <div className="mono" style={{ marginTop: 3, fontSize: "5px", letterSpacing: "0.1em", color: isActive ? s.color : "var(--silver)", opacity: isActive ? 1 : 0.5, textAlign: "center", maxWidth: 56 }}>
                      {s.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expandedStage !== null && (
            <div className="animate-fadeUp" style={{
              marginTop: 10, padding: "0.8rem",
              background: RECOVERY_STAGES[expandedStage].color + "10",
              border: `1px solid ${RECOVERY_STAGES[expandedStage].color}30`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <div className="serif" style={{ fontSize: "1rem", color: "var(--cream)" }}>{RECOVERY_STAGES[expandedStage].title}</div>
                </div>
                <span onClick={(e) => { e.stopPropagation(); setExpandedStage(null); }} style={{ cursor: "pointer", color: "var(--silver)", fontSize: "0.8rem" }}>✕</span>
              </div>
              <p style={{ fontSize: "0.73rem", color: "var(--silver)", fontStyle: "italic", marginBottom: 6 }}>{RECOVERY_STAGES[expandedStage].desc}</p>
              <div style={{ padding: "0.4rem 0.6rem", background: "rgba(0,0,0,0.3)", marginBottom: 3 }}>
                <div className="mono" style={{ fontSize: "6px", letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 2 }}>For You</div>
                <p style={{ fontSize: "0.7rem", color: "var(--mist)", lineHeight: 1.5 }}>{RECOVERY_STAGES[expandedStage].forYou}</p>
              </div>
              <div style={{ padding: "0.4rem 0.6rem", background: "rgba(0,0,0,0.3)" }}>
                <div className="mono" style={{ fontSize: "6px", letterSpacing: "0.2em", color: RECOVERY_STAGES[expandedStage].color, textTransform: "uppercase", marginBottom: 2 }}>For Those Around You</div>
                <p style={{ fontSize: "0.7rem", color: "var(--mist)", lineHeight: 1.5 }}>{RECOVERY_STAGES[expandedStage].forOthers}</p>
              </div>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div className="section-label">Chronicle</div>
            {history.slice(-5).reverse().map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.7rem" }}>
                <span style={{ color: "var(--silver)" }}>{h.status === "done" ? "◈" : h.status === "integrated" ? "✦" : "○"} {h.quest.slice(0, 40)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // ─── SHADOW ENCOUNTER ──────────────────────────────────────────────
  if (screen === "shadow_encounter") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        {/* Always-available exit — does NOT require offering to leave (Bug #6) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>MEET THE SHADOW</div>
          <span onClick={exitShadowEncounter} style={{ cursor: "pointer", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.65rem", color: "var(--silver)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            ← BACK TO THE TRAIL
          </span>
        </div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 6 }}>
          The Shadow has grown.
        </h2>
        <p className="serif" style={{ color: "var(--silver)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
          {profile.shadow.name} has been with you a long time. To see it now is to begin the bargain.
        </p>

        {/* Shadow integration physics animation */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <RealmAnimation scene="integration" color={archetype.color} size={{ w: 420, h: 320 }} />
        </div>

        <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
          WHAT THE SHADOW IS ASKING:
        </div>

        <div style={{ padding: "1rem", background: "var(--deep)", border: `1px solid ${archetype.color}30`, marginBottom: 14 }}>
          <p className="serif" style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.6 }}>
            "{shadowEncounterText}"
          </p>
          <div className="mono" style={{ fontSize: "7px", color: "var(--gold-dim)", letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>
            Drawn from what you have been carrying
          </div>
        </div>

        <div style={{ padding: "1rem", background: "rgba(139,58,58,0.06)", borderLeft: "2px solid var(--shadow-red)", marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#c97575", textTransform: "uppercase", marginBottom: 6 }}>
            The Shadow's Origin
          </div>
          <p className="serif" style={{ fontSize: "0.92rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.7 }}>
            {profile.shadow.mythicNaming}
          </p>
        </div>

        <button
          className="btn-gold"
          onClick={submitShadowEncounter}
          disabled={mentorLoading || mentorRaw}
        >
          {mentorRaw ? "RECEIVED" : mentorLoading ? `${archetype.name} listens...` : `OFFER IT TO ${archetype.name.toUpperCase()} →`}
        </button>

        {(mentorLoading || mentorRaw) && (
          <div className="animate-fadeUp" style={{ marginTop: 18, padding: "1rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              <Mandala archetypeId={archetype.id} color={archetype.color} concept={mentorParsed.concept || "integration"} size={88} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                {archetype.name} answers
              </div>
              {mentorLoading ? (
                <div className="serif" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--silver)" }}>
                  {archetype.name} is listening...
                </div>
              ) : (
                <>
                  <AnimatedText text={mentorParsed.text} color={archetype.color} />
                  <QuoteBlock quote={mentorParsed.quote} author={mentorParsed.author} color={archetype.color} />
                </>
              )}
            </div>
          </div>
        )}

        {mentorRaw && (
          <button className="btn-ghost" style={{ marginTop: 12, width: "100%" }} onClick={exitShadowEncounter}>
            BACK TO THE TRAIL
          </button>
        )}

      </div>
    );
  }

  return null;
}
