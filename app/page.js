"use client";
import { useState, useEffect, useRef } from "react";
import Mandala from "../lib/Mandala";
import SignatureScene from "../lib/SignatureScene";
import { getAudioController } from "../lib/AudioController";
import { selectQuote, selectQuoteByTags, formatQuoteForSpeech } from "../lib/quotes";
import {
  PERSONAS, ASSESSMENT_CATEGORIES, usernameToPersona, computeProfile,
  ARCHETYPES, TONE_STYLES, REALMS, RECOVERY_STAGES,
  recommendArchetype, recommendTone, getStage, buildMentorPrompt,
  orderedRealmsByPriority, generateShadowNaming,
  buildRealmBriefingPrompt, buildQuestDonePrompt, buildQuestSkipPrompt,
  buildShadowEncounterPrompt, buildAspirationalPrompt,
  passagePhrase, recoveryBandPhrase,
} from "../lib/constants";
import {
  DOMAINS,
  getDomain,
  getDomainList,
  getQuestions,
  diagnoseProblem,
  getProblem,
  getFirstMessage,
  getActivities,
  getHeroScene,
  getJourney,
  getQuoteTags,
} from "../lib/config/onboarding";
import {
  VOICES,
  getVoice,
  getRecommendedVoice,
  ARCHETYPE_VOICE_SUGGESTION,
} from "../lib/config/voices";

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

// Card component for the recommended-only mentor selection screen.
// "Who" decision — mandala + name + figure + first-message preview text.
// No audio: voice is its own screen now.
function ArchetypeCard({ archetype, recommended, firstMessage, selected, onPick, compact }) {
  const previewLine = firstMessage
    ? firstMessage.split(/\.\s+/)[0].replace(/\.$/, "") + "."
    : null;
  return (
    <div
      onClick={onPick}
      style={{
        padding: compact ? "0.85rem 1rem" : "1.1rem 1.2rem",
        background: selected ? `${archetype.color}25` : "var(--deep)",
        border: `1px solid ${selected ? archetype.color : "rgba(255,255,255,0.06)"}`,
        cursor: "pointer",
        marginBottom: compact ? 0 : 8,
        transition: "background 0.2s, border-color 0.2s",
        display: "flex",
        gap: compact ? 10 : 14,
        alignItems: "flex-start",
      }}
    >
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <Mandala
          archetypeId={archetype.id}
          color={archetype.color}
          concept="opening"
          size={compact ? 56 : 88}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="mono"
          style={{
            fontSize: "8px",
            letterSpacing: "0.2em",
            color: archetype.color,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {archetype.figure}
          {recommended && (
            <span style={{ marginLeft: 8, color: "var(--gold)" }}>★ RECOMMENDED</span>
          )}
        </div>
        <div
          className="serif"
          style={{
            fontSize: compact ? "1rem" : "1.25rem",
            color: "var(--cream)",
            marginBottom: 4,
          }}
        >
          {archetype.name}
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--silver)",
            marginBottom: compact ? 0 : 8,
            lineHeight: 1.5,
          }}
        >
          {archetype.desc}
        </div>
        {!compact && previewLine && (
          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--cream)",
              fontStyle: "italic",
              borderLeft: `2px solid ${archetype.color}`,
              paddingLeft: 10,
              marginTop: 10,
              lineHeight: 1.55,
            }}
          >
            "{previewLine}"
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceCard({ voice, recommended, selected, onPick, onPlay, compact }) {
  return (
    <div
      onClick={onPick}
      style={{
        padding: compact ? "0.85rem 1rem" : "1.1rem 1.2rem",
        background: selected ? "rgba(201,168,76,0.12)" : "var(--deep)",
        border: `1px solid ${selected ? "var(--gold)" : "rgba(255,255,255,0.06)"}`,
        cursor: "pointer",
        marginBottom: compact ? 0 : 8,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: "8px",
          letterSpacing: "0.2em",
          color: "var(--silver)",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {voice.gender} · {voice.pace}
        {recommended && (
          <span style={{ marginLeft: 8, color: "var(--gold)" }}>★ RECOMMENDED</span>
        )}
      </div>
      <div
        className="serif"
        style={{
          fontSize: compact ? "1rem" : "1.2rem",
          color: "var(--cream)",
          marginBottom: 4,
        }}
      >
        {voice.name}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--silver)",
          marginBottom: 8,
          lineHeight: 1.45,
        }}
      >
        {voice.description}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "var(--cream)",
          padding: "5px 12px",
          fontSize: "0.7rem",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "0.12em",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        ▶ Hear it
      </button>
    </div>
  );
}

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

  // Onboarding v2 — domain pick, scenario answers, problem diagnosis
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [scenarioAnswers, setScenarioAnswers] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [showOtherMentors, setShowOtherMentors] = useState(false);
  const [showOtherTones, setShowOtherTones] = useState(false);
  // Voice (decoupled from mentor): independent picker between archetype + tone
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showOtherVoices, setShowOtherVoices] = useState(false);
  // voiceId-keyed cache of TTS for the diagnosed first message in each voice
  const [voicePreviews, setVoicePreviews] = useState({});
  // Aspirational screen content — first message, quote, promise rendered as
  // three blocks; the same three are voiced as one continuous TTS read.
  const [aspirationalPromise, setAspirationalPromise] = useState("");
  const [aspirationalQuote, setAspirationalQuote] = useState(null);
  // Activities use problemId-keyed completion (analog of completedByRealm).
  const [completedByProblem, setCompletedByProblem] = useState({});

  // Centralized audio — singleton across all screens. See lib/AudioController.
  const audio = getAudioController();
  const mentorParsed = parseMentorMessage(mentorRaw);
  const stage = getStage(totalPoints);

  // Wire onEnded once, when controller becomes available.
  useEffect(() => {
    if (!audio) return;
    audio.onEnded(() => setIsPlaying(false));
  }, [audio]);

  // Aspirational is now driven by the lookup-table first-message, not the
  // Mistral pipeline — no prewarm needed.

  // (Mentor previews removed — voice is its own screen now.)

  // Voice screen: preload recommended voice on mount, lazy-load others
  // when the "Try other voices" disclosure opens.
  useEffect(() => {
    if (screen === "voice" && archetype && diagnosis) {
      const recId = ARCHETYPE_VOICE_SUGGESTION[archetype.id] || "steady-bass";
      preloadVoicePreview(recId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, archetype, diagnosis]);

  useEffect(() => {
    if (showOtherVoices && archetype && diagnosis) {
      const recId = ARCHETYPE_VOICE_SUGGESTION[archetype.id] || "steady-bass";
      VOICES.forEach(v => {
        if (v.id !== recId && !voicePreviews[v.id]) {
          preloadVoicePreview(v.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOtherVoices]);

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
  const generateMentor = async (kind, ctx = {}, prewarm = false) => {
    if (!archetype || !persona || !profile) return;

    if (!prewarm && audio) audio.stop();
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
      if (prewarm) return;
      const cached = audio.getCached(key);
      setMentorRaw(cached.mentorRaw || "");
      setMentorLoading(false);
      if (cached.audioUrl && !muted) {
        await audio.play(cached.audioUrl);
        setIsPlaying(true);
      }
      return;
    }

    if (!prewarm) {
      setMentorLoading(true);
      setMentorRaw("");
    }

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
    if (!prewarm && audio && audio.isStale(myReqId)) return;

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

    if (!prewarm) {
      setMentorRaw(finalRaw);
      setMentorLoading(false);
    }

    // Step 8: speak via ElevenLabs.
    let audioUrl = null;
    let { speakingText } = parseMentorMessage(finalRaw);
    if (kind === "aspirational" && archetype?.promise) {
      const promiseSpoken = archetype.promise.replace(/\*([^*]+)\*/g, "$1");
      const punct = /[.!?]\s*$/.test(speakingText) ? speakingText : `${speakingText}.`;
      speakingText = `${punct} ${promiseSpoken}`;
    }
    // Route TTS through the user-picked voice (decoupled from mentor in
    // onboarding v2.1). Falls back to the archetype's default voice if the
    // user hasn't reached the voice screen yet.
    const ttsVoiceId = selectedVoice?.voiceId || archetype?.voiceId;
    if (ttsVoiceId && !muted) {
      audioUrl = await fetchVoice(speakingText, ttsVoiceId);
      if (!prewarm && audio && audio.isStale(myReqId)) return;
    }

    if (audio) {
      audio.setCached(key, { mentorRaw: finalRaw, audioUrl });
      if (!prewarm && audioUrl && !muted) {
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

    // Skip the legacy "scanning 42 apps" loader. Go straight to domain pick.
    setSelectedDomain(null);
    setScenarioIdx(0);
    setScenarioAnswers([]);
    setDiagnosis(null);
    setShowOtherMentors(false);
    setShowOtherTones(false);
    setScreen("domain-pick");
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

  // ─── Onboarding v2 handlers ────────────────────────────────────────
  const handleDomainPick = (domainId) => {
    if (audio) audio.unlock();
    setSelectedDomain(domainId);
    setScenarioIdx(0);
    setScenarioAnswers([]);
    setScreen("scenario");
  };

  const handleScenarioAnswer = (optionId) => {
    if (audio) audio.unlock();
    const questions = getQuestions(selectedDomain);
    const currentQ = questions[scenarioIdx];
    const newAnswers = [...scenarioAnswers, { questionId: currentQ.id, optionId }];
    setScenarioAnswers(newAnswers);

    if (scenarioIdx + 1 < questions.length) {
      setScenarioIdx(scenarioIdx + 1);
    } else {
      const result = diagnoseProblem(selectedDomain, newAnswers);
      setDiagnosis(result);
      setScreen("problem-reveal");
    }
  };

  const handleAcceptProblem = () => {
    if (audio) audio.unlock();
    // For v1 the lookup table doesn't yet store "best archetype for this problem",
    // so we fall back to the persona-based recommendation if we have one,
    // otherwise the first archetype.
    const rec = persona
      ? recommendArchetype(persona)
      : { archetype: ARCHETYPES[0], reasons: [] };
    setRecommendedArchetype(rec.archetype);
    setArchetype(rec.archetype);
    setArchetypeReasons(rec.reasons);
    setShowOtherMentors(false);
    setScreen("archetype");
  };

  // After picking the mentor, route to the voice picker (decoupled from
  // mentor in onboarding v2.1). Tone follows after voice.
  const handleConfirmArchetype = () => {
    if (audio) audio.unlock();
    if (!archetype) return;
    const recVoice = getRecommendedVoice(archetype.id);
    setSelectedVoice(recVoice);
    setShowOtherVoices(false);
    setVoicePreviews({});
    setScreen("voice");
  };

  const handleConfirmVoice = () => {
    if (audio) audio.unlock();
    const rec = persona
      ? recommendTone(persona)
      : { tone: TONE_STYLES[0], reasons: [] };
    setRecommendedTone(rec.tone);
    setTone(rec.tone.id);
    setToneReasons(rec.reasons);
    setShowOtherTones(false);
    setScreen("tone");
  };

  // Voice preview = the diagnosed first message TTS'd in this voice. Same
  // text across all six voices, so the comparison is meaningful.
  const preloadVoicePreview = async (voiceId) => {
    if (!selectedDomain || !diagnosis || !archetype) return;
    if (voicePreviews[voiceId]) return;
    const voice = getVoice(voiceId);
    const text = getFirstMessage(selectedDomain, diagnosis.problemId, archetype.id);
    if (!voice || !text) return;
    const audioUrl = await fetchVoice(text, voice.voiceId);
    if (!audioUrl) return;
    setVoicePreviews(prev => ({ ...prev, [voiceId]: audioUrl }));
  };

  const playVoicePreview = (voiceId) => {
    if (audio) audio.unlock();
    const url = voicePreviews[voiceId];
    if (!url) {
      preloadVoicePreview(voiceId).then(() => {
        const fresh = voicePreviews[voiceId];
        if (fresh && audio) audio.play(fresh);
      });
      return;
    }
    if (audio) {
      audio.stop();
      audio.play(url);
      setIsPlaying(true);
    }
  };

  // Aspirational shows three blocks — first message, quote, promise — and
  // voices all three as a single continuous TTS read. Routed through
  // selectedVoice so the user hears the voice they picked.
  const handleGoToAspirational = async () => {
    if (audio) { audio.unlock(); audio.stop(); }
    setIsPlaying(false);
    setMentorRaw("");
    setAspirationalPromise("");
    setAspirationalQuote(null);
    setScreen("aspirational");
    if (!selectedDomain || !diagnosis || !archetype) return;

    const firstMsg = getFirstMessage(selectedDomain, diagnosis.problemId, archetype.id);
    if (!firstMsg) return;

    const promiseSpoken = archetype.promise
      ? archetype.promise.replace(/\*([^*]+)\*/g, "$1")
      : "";
    const quote = selectQuoteByTags(
      getQuoteTags(selectedDomain, diagnosis.problemId),
      `aspirational-${diagnosis.problemId}-${archetype.id}`
    );

    // Display state — three independent blocks.
    setMentorRaw(firstMsg);
    setAspirationalPromise(archetype.promise || "");
    setAspirationalQuote(quote);

    const voiceForTts = selectedVoice?.voiceId || archetype.voiceId;
    if (muted || !voiceForTts) return;

    // Voiced read: first message → quote → promise. Line breaks coax the
    // TTS engine into natural pauses between sections.
    const parts = [firstMsg];
    if (quote) parts.push(`As ${quote.author} put it: "${quote.text}"`);
    if (promiseSpoken) parts.push(promiseSpoken);
    const fullText = parts.join("\n\n");

    const audioUrl = await fetchVoice(fullText, voiceForTts);
    if (audioUrl && audio) {
      await audio.play(audioUrl);
      setIsPlaying(true);
    }
  };

  const handleEnterDashboard = async () => {
    if (audio) { audio.unlock(); audio.stop(); }
    setIsPlaying(false);
    setMentorRaw("");
    setScreen("dashboard");
    setTimeout(() => generateMentor("realm_briefing"), 400);
  };

  // Activity completion (lookup-table driven, keyed off problemId).
  const completeActivity = (activity, idx) => {
    if (!diagnosis) return;
    const pid = diagnosis.problemId;
    const pts = 10;
    setRecoveryScore(s => Math.min(100, s + 3));
    setTotalPoints(t => t + pts);
    setCompletedByProblem(c => ({
      ...c,
      [pid]: [...(c[pid] || []), `${idx}`],
    }));
    setHistory(h => [...h, {
      day, quest: activity.name, status: "done", points: pts, realm: pid,
    }]);
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
          There is a version of you the world has not yet met.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Mandala archetypeId="stoic" color="#c9a84c" concept="still" size={180} />
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--silver)", lineHeight: 1.8, marginBottom: 28 }}>
          Ninety days. One mentor — chosen from those who have walked it before. The terrain is read from your 42 app readings. The walk is yours, and there is a version of you the world has not yet met.
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

  // ─── DOMAIN PICK (onboarding v2 step 1) ────────────────────────────
  if (screen === "domain-pick") {
    const domains = getDomainList();
    return (
      <div className="shell" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="section-label">FIRST QUESTION</div>
        <h2 className="serif" style={{ fontSize: "1.5rem", color: "var(--cream)", marginBottom: 8 }}>
          {userName}, where do you want help?
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--silver)", marginBottom: 22, lineHeight: 1.5 }}>
          Pick the area that's heaviest. We'll narrow from there.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {domains.map(d => (
            <button
              key={d.id}
              onClick={() => handleDomainPick(d.id)}
              style={{
                padding: "1.1rem 1rem",
                background: "var(--deep)",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "inherit",
              }}
            >
              <div className="serif" style={{ fontSize: "1.05rem", color: "var(--cream)", marginBottom: 4 }}>
                {d.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--silver)", lineHeight: 1.45 }}>
                {d.blurb}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── SCENARIO QUESTIONS (onboarding v2 step 2) ─────────────────────
  if (screen === "scenario") {
    const questions = getQuestions(selectedDomain);
    const q = questions[scenarioIdx];
    const domain = getDomain(selectedDomain);
    const total = questions.length;
    if (!q || !domain) return null;
    return (
      <div className="shell" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="section-label">
          {domain.name.toUpperCase()} · {scenarioIdx + 1} OF {total}
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", marginBottom: 22 }}>
          <div style={{
            width: `${(scenarioIdx / total) * 100}%`,
            height: "100%",
            background: "var(--gold)",
            transition: "width 0.4s",
          }} />
        </div>
        <h2 className="serif" style={{ fontSize: "1.2rem", color: "var(--cream)", marginBottom: 20, lineHeight: 1.45 }}>
          {q.prompt}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleScenarioAnswer(opt.id)}
              style={{
                padding: "1rem 1.1rem",
                background: "var(--deep)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "var(--cream)",
                fontSize: "0.9rem",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                lineHeight: 1.4,
              }}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── PROBLEM REVEAL (THE RIDE AHEAD) ───────────────────────────────
  if (screen === "problem-reveal") {
    const problem = diagnosis ? getProblem(selectedDomain, diagnosis.problemId) : null;
    const journey = diagnosis ? getJourney(selectedDomain, diagnosis.problemId) : null;
    const runnerUp = diagnosis?.runnerUpId
      ? getProblem(selectedDomain, diagnosis.runnerUpId)
      : null;
    const runnerJourney = diagnosis?.runnerUpId
      ? getJourney(selectedDomain, diagnosis.runnerUpId)
      : null;
    if (!problem || !journey) return null;
    const openingQuote = selectQuoteByTags(
      problem.quoteTags,
      `reveal-${selectedDomain}-${diagnosis.problemId}`
    );
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">THE RIDE AHEAD</div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <SignatureScene sceneId="who-stays" size={300} />
        </div>

        <h2 className="serif" style={{ fontSize: "1.5rem", color: "var(--cream)", marginBottom: 12, lineHeight: 1.3 }}>
          {journey.title}
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--silver)", marginBottom: 22, lineHeight: 1.55 }}>
          {journey.opening}
        </p>

        {openingQuote && (
          <div style={{ borderLeft: "2px solid var(--gold)", paddingLeft: 14, marginBottom: 22 }}>
            <p className="serif" style={{ fontSize: "0.95rem", color: "var(--cream)", fontStyle: "italic", lineHeight: 1.55, marginBottom: 6 }}>
              "{openingQuote.text}"
            </p>
            <p className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              — {openingQuote.author}
            </p>
          </div>
        )}

        {runnerUp && (
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginBottom: 22, fontStyle: "italic", lineHeight: 1.5 }}>
            You may also be carrying — {(runnerJourney?.title || runnerUp.name).toLowerCase().replace(/^from\s+/, "")}.
          </p>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn-gold" onClick={handleAcceptProblem}>
            BEGIN THE RIDE →
          </button>
          <button
            onClick={() => {
              setScenarioIdx(0);
              setScenarioAnswers([]);
              setDiagnosis(null);
              setScreen("domain-pick");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--silver)",
              fontSize: "0.78rem",
              fontFamily: "inherit",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Pick a different area
          </button>
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
            let pulled, intact;

            if (persona.personality.conscientiousness >= 4.0) intact = "the discipline is intact";
            else if (persona.self_efficacy >= 3.5)             intact = "the agency is still yours";
            else if (persona.work_conditions.meaning >= 3.5)   intact = "the meaning has not gone out";
            else if (persona.personality.openness >= 4.0)      intact = "the curiosity remains";
            else                                                intact = "the will is still here";

            if (c.key === "bat") {
              const ex = persona.bat.exhaustion, md = persona.bat.mental_distance, cg = persona.bat.cognitive, em = persona.bat.emotional;
              if (ex >= 4.0)      pulled = "the body is tired";
              else if (md >= 4.0) pulled = "distance is hardening";
              else if (cg >= 4.0) pulled = "the mind is holding too much";
              else if (em >= 4.0) pulled = "the heart is signaling strain";
              else                pulled = "patterns are surfacing";
              finding = `${pulled} · ${intact}`;
            }
            else if (c.key === "cognitive_health") {
              if (persona.cognitive_health.loneliness >= 3.8) pulled = "the alone shows";
              else if (persona.cognitive_health.anxiety >= 3.8) pulled = "the racing shows";
              else pulled = "the holding is uneven";
              finding = `${pulled} · ${intact}`;
            }
            else if (c.key === "metabolic_risk") {
              finding = persona.metabolic_risk >= 3.5 ? "the form runs warm · the strength is there" : persona.metabolic_risk >= 2.5 ? "the form runs steady" : "the form runs cool";
            }
            else if (c.key === "lifestyle") {
              finding = persona.lifestyle.sleep >= 4.0 ? "sleep is thinner than it knows · rhythm can return" : "the rhythms are uneven";
            }
            else if (c.key === "alexithymia") {
              finding = persona.alexithymia >= 3.8 ? "the translation has gone quiet · the precision has not" : "the translation is uneven";
            }
            else if (c.key === "self_efficacy") {
              finding = persona.self_efficacy >= 3.5 ? "agency is intact" : "agency is thinning · the will is here";
            }
            else if (c.key === "personality") {
              finding = "the shape is yours";
            }
            else if (c.key === "work_conditions") {
              finding = persona.work_conditions.meaning >= 3.5 ? "the demands have grown · the work still means" : "the work has gone hollow · what you trust yourself to do is not lost";
            }
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
                The reading
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--mist)", lineHeight: 1.6, marginBottom: 8 }}>
                <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>What you bring:</span> {persona.gifts}.
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--mist)", lineHeight: 1.6 }}>
                <span style={{ color: "#c97575", fontStyle: "italic" }}>What walks with you:</span> a part of you called {profile.shadow.name}. It will not walk in front of you.
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
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">WHAT WE READ OF YOU</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>{userName}, this is what we read.</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--silver)", marginBottom: 18 }}>{persona.context}</p>

        {/* Signature scene — who-stays */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <SignatureScene id="profile" size={360} />
        </div>

        {/* What You Bring panel — strengths first, before the shadow */}
        <div style={{ padding: "1rem 1.2rem", background: "var(--deep)", borderLeft: `2px solid ${recommendedArchetype?.color || "var(--gold)"}`, marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: recommendedArchetype?.color || "var(--gold)", textTransform: "uppercase", marginBottom: 6 }}>
            What You Bring
          </div>
          <p className="serif" style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.65 }}>
            {persona.gifts}
          </p>
        </div>

        {/* Shadow name — big, serif, beneath the animation */}
        <div style={{ padding: "1rem 1.2rem", background: "var(--deep)", borderLeft: "2px solid var(--shadow-red)", marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#c97575", textTransform: "uppercase", marginBottom: 4 }}>
            What Walks With You
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

  // ─── ARCHETYPE (recommended-only with progressive disclosure) ──────
  if (screen === "archetype") {
    if (!recommendedArchetype) return null;
    const others = ARCHETYPES.filter(a => a.id !== recommendedArchetype.id);
    const firstMsgFor = (aid) =>
      diagnosis ? getFirstMessage(selectedDomain, diagnosis.problemId, aid) : "";
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">YOUR GUIDE</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 14 }}>
          We suggest {recommendedArchetype.name}.
        </h2>

        <ArchetypeCard
          archetype={recommendedArchetype}
          recommended
          firstMessage={firstMsgFor(recommendedArchetype.id)}
          selected={archetype?.id === recommendedArchetype.id}
          onPick={() => setArchetype(recommendedArchetype)}
        />

        {!showOtherMentors && (
          <button
            onClick={() => setShowOtherMentors(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--silver)",
              fontSize: "0.85rem",
              textDecoration: "underline",
              margin: "16px 0",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            ▼  Explore other guides
          </button>
        )}

        {showOtherMentors && (
          <>
            <div className="section-label" style={{ marginTop: 22 }}>OTHER GUIDES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {others.map(a => (
                <ArchetypeCard
                  key={a.id}
                  archetype={a}
                  recommended={false}
                  firstMessage={firstMsgFor(a.id)}
                  selected={archetype?.id === a.id}
                  onPick={() => setArchetype(a)}
                  compact
                />
              ))}
            </div>
          </>
        )}

        <button className="btn-gold" onClick={handleConfirmArchetype} style={{ marginTop: 22 }}>
          BEGIN WITH {(archetype?.name || recommendedArchetype.name).toUpperCase()} →
        </button>
      </div>
    );
  }

  // ─── VOICE (decoupled from mentor; recommended-only + disclosure) ──
  if (screen === "voice") {
    if (!archetype) return null;
    const recVoiceId = ARCHETYPE_VOICE_SUGGESTION[archetype.id] || "steady-bass";
    const recVoice = getVoice(recVoiceId);
    const others = VOICES.filter(v => v.id !== recVoiceId);
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">THE VOICE</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 14 }}>
          How should {archetype.name} sound?
        </h2>

        <VoiceCard
          voice={recVoice}
          recommended
          selected={selectedVoice?.id === recVoice.id}
          onPick={() => setSelectedVoice(recVoice)}
          onPlay={() => playVoicePreview(recVoice.id)}
        />

        {!showOtherVoices && (
          <button
            onClick={() => setShowOtherVoices(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--silver)",
              fontSize: "0.85rem",
              textDecoration: "underline",
              margin: "16px 0",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            ▼  Try other voices
          </button>
        )}

        {showOtherVoices && (
          <>
            <div className="section-label" style={{ marginTop: 22 }}>OTHER VOICES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {others.map(v => (
                <VoiceCard
                  key={v.id}
                  voice={v}
                  recommended={false}
                  selected={selectedVoice?.id === v.id}
                  onPick={() => setSelectedVoice(v)}
                  onPlay={() => playVoicePreview(v.id)}
                  compact
                />
              ))}
            </div>
          </>
        )}

        <button className="btn-gold" onClick={handleConfirmVoice} style={{ marginTop: 22 }}>
          CONTINUE WITH {(selectedVoice?.name || recVoice.name).toUpperCase()} →
        </button>
      </div>
    );
  }

  // ─── TONE (recommended-only with progressive disclosure) ───────────
  if (screen === "tone") {
    if (!recommendedTone) return null;
    const others = TONE_STYLES.filter(t => t.id !== recommendedTone.id);

    const renderToneCard = (t, { recommended, compact }) => {
      const isSel = tone === t.id;
      return (
        <div
          key={t.id}
          onClick={() => setTone(t.id)}
          style={{
            padding: compact ? "0.85rem 1rem" : "1rem 1.1rem",
            background: isSel ? "var(--charcoal)" : "var(--deep)",
            border: `1px solid ${isSel ? archetype.color : "rgba(255,255,255,0.06)"}`,
            cursor: "pointer",
            position: "relative",
            marginBottom: compact ? 0 : 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="serif" style={{ fontSize: "1.15rem", color: isSel ? archetype.color : "var(--silver)" }}>{t.icon}</span>
            <span className="mono" style={{ fontSize: "9px", letterSpacing: "0.18em", color: isSel ? archetype.color : "var(--mist)", textTransform: "uppercase" }}>{t.label}</span>
            {recommended && (
              <span className="mono" style={{ marginLeft: "auto", fontSize: "8px", letterSpacing: "0.18em", color: "var(--gold)" }}>★ RECOMMENDED</span>
            )}
          </div>
          <p style={{ fontSize: "0.76rem", color: "var(--silver)", marginBottom: 8, lineHeight: 1.45 }}>{t.desc}</p>
          {!compact && (
            <div style={{
              padding: "0.6rem",
              background: "rgba(0,0,0,0.3)",
              borderLeft: `2px solid ${archetype.color}`,
              fontSize: "0.78rem",
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "var(--cream)",
              lineHeight: 1.5,
            }}>
              "{t.example}"
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">YOUR VOICE</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 14 }}>
          We suggest the {recommendedTone.label?.toLowerCase() || recommendedTone.id} register.
        </h2>

        {renderToneCard(recommendedTone, { recommended: true, compact: false })}

        {!showOtherTones && (
          <button
            onClick={() => setShowOtherTones(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--silver)",
              fontSize: "0.85rem",
              textDecoration: "underline",
              margin: "16px 0",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            ▼  Explore other voices
          </button>
        )}

        {showOtherTones && (
          <>
            <div className="section-label" style={{ marginTop: 22 }}>OTHER VOICES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {others.map(t => renderToneCard(t, { recommended: false, compact: true }))}
            </div>
          </>
        )}

        {tone && (
          <button className="btn-gold" style={{ marginTop: 22 }} onClick={handleGoToAspirational}>
            MEET WHAT YOU COULD BECOME →
          </button>
        )}
      </div>
    );
  }

  // ─── ASPIRATIONAL — three blocks (first message, quote, promise) ───
  if (screen === "aspirational") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">WHO YOU COULD BECOME</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 18 }}>
          {archetype.name} speaks.
        </h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Mandala archetypeId={archetype.id} color={archetype.color} concept="opening" size={220} />
        </div>

        {/* First message */}
        <div style={{ padding: "1rem 1.2rem", background: "var(--deep)", border: `1px solid ${archetype.color}30`, marginBottom: 14, minHeight: 90 }}>
          {mentorRaw ? (
            <p className="serif" style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.65, margin: 0 }}>
              {mentorRaw}
            </p>
          ) : (
            <div className="serif" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--silver)", textAlign: "center" }}>
              {archetype.name} is contemplating...
            </div>
          )}
        </div>

        {/* Quote */}
        {aspirationalQuote && (
          <div style={{ borderLeft: "2px solid var(--gold)", paddingLeft: 14, marginBottom: 14 }}>
            <p className="serif" style={{ fontSize: "0.95rem", color: "var(--cream)", fontStyle: "italic", lineHeight: 1.55, marginBottom: 6 }}>
              "{aspirationalQuote.text}"
            </p>
            <p className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              — {aspirationalQuote.author}
            </p>
          </div>
        )}

        {/* Promise */}
        {aspirationalPromise && (
          <div className="animate-fadeUp" style={{ padding: "1rem 1.2rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}`, marginBottom: 18 }}>
            <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              The Promise
            </div>
            <AnimatedText text={aspirationalPromise} color={archetype.color} />
          </div>
        )}

        <button className="btn-gold" onClick={handleEnterDashboard}>BEGIN →</button>
      </div>
    );
  }

  // ─── DASHBOARD — ONE hero animation per page ──────────────────────
  if (screen === "dashboard") {
    // Onboarding-v2 dashboard is driven by the diagnosed problem, not the
    // realm cycle. We still resolve `realm` so the existing mentor-briefing
    // pipeline keeps working (it builds prompts from realm metadata).
    const realm = orderedRealms[activeRealmIdx] || REALMS[0];
    const isTopPriority = activeRealmIdx === 0;
    const heroSceneId = (selectedDomain && diagnosis)
      ? getHeroScene(selectedDomain, diagnosis.problemId)
      : null;
    const activities = (selectedDomain && diagnosis)
      ? getActivities(selectedDomain, diagnosis.problemId)
      : [];
    const problem = (selectedDomain && diagnosis)
      ? getProblem(selectedDomain, diagnosis.problemId)
      : null;
    const problemDoneIdx = problem ? (completedByProblem[problem.id] || []) : [];

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

        {/* Stage band + mute */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, padding: "6px 10px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, boxShadow: `0 0 ${4 + (totalPoints/1000)*8}px ${stage.color}` }} />
            <div className="serif" style={{ fontSize: "0.78rem", color: "var(--cream)", flex: 1, fontStyle: "italic" }}>
              {recoveryBandPhrase(recoveryScore)}
            </div>
            <div className="mono" style={{ fontSize: "7px", color: "var(--gold-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {stage.title}
            </div>
          </div>
          <span onClick={() => setMuted(m => !m)} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.7rem", color: "var(--silver)", display: "flex", alignItems: "center" }}>
            {muted ? "🔇" : "🔊"}
          </span>
        </div>

        {/* Problem banner — driven by diagnosis, not realm cycle */}
        {problem && (
          <div style={{ marginBottom: 10, padding: "0.8rem 1rem", background: archetype.color + "10", border: `1px solid ${archetype.color}40` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: archetype.color, textTransform: "uppercase" }}>YOUR PRACTICE</div>
                <div className="serif" style={{ fontSize: "1.2rem", color: "var(--cream)" }}>{problem.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--silver)", marginTop: 2, lineHeight: 1.45 }}>{problem.shortDescription}</div>
              </div>
              {isTopPriority && <div className="mono" style={{ fontSize: "7px", padding: "2px 8px", background: "var(--gold)", color: "var(--void)", letterSpacing: "0.15em", fontWeight: 700, whiteSpace: "nowrap" }}>BEGIN HERE</div>}
            </div>
          </div>
        )}

        {/* THE ONE HERO ANIMATION — signature scene for the diagnosed problem */}
        {heroSceneId && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <SignatureScene sceneId={heroSceneId} size={360} />
          </div>
        )}

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

        {/* Activities — config-driven, keyed by diagnosed problem */}
        {activities.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div className="section-label">YOUR PRACTICE</div>
            {activities.map((a, i) => {
              const done = problemDoneIdx.includes(`${i}`);
              return (
                <div key={a.id} style={{
                  padding: "0.85rem 1rem",
                  background: done ? "rgba(201,168,76,0.05)" : "var(--slate)",
                  border: `1px solid ${done ? "var(--gold-dim)" : "rgba(255,255,255,0.04)"}`,
                  marginBottom: 4, opacity: done ? 0.65 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <div className="serif" style={{ color: "var(--cream)", fontSize: "0.95rem", lineHeight: 1.3 }}>
                      {done ? "✓ " : ""}{a.name}
                    </div>
                    <div className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {a.cadence}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--silver)", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>{a.description}</div>
                  {!done && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      <button onClick={() => completeActivity(a, i)}
                        style={{ padding: "5px 12px", border: `1px solid ${archetype.color}`, background: "transparent", color: archetype.color, fontSize: "0.7rem", fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>DONE</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn-gold" onClick={nextDay} style={{ flex: 1 }}>RIDE ON →</button>
          <button className="btn-ghost" onClick={openShadowEncounter} style={{ flex: 1 }}>THE CONVERSATION</button>
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
          <div className="section-label" style={{ marginBottom: 0 }}>THE CONVERSATION</div>
          <span onClick={exitShadowEncounter} style={{ cursor: "pointer", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.65rem", color: "var(--silver)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            ← BACK TO THE TRAIL
          </span>
        </div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 6 }}>
          There is a part of you we should talk to.
        </h2>
        <p className="serif" style={{ color: "var(--silver)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
          {profile.shadow.name} has been with you a long time. Today we listen to what it has been protecting.
        </p>

        {/* Shadow integration — signature scene */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <SignatureScene id="shadow" size={360} />
        </div>

        <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
          WHAT IT IS ASKING:
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
            WHERE IT CAME FROM
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
          {mentorRaw ? "RECEIVED" : mentorLoading ? `${archetype.name} listens...` : `BRING IT TO ${archetype.name.toUpperCase()} →`}
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
