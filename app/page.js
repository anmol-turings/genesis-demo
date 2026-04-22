"use client";
import { useState, useEffect, useRef } from "react";
import Mandala from "../lib/Mandala";
import RealmAnimation from "../lib/RealmAnimation";
import {
  PERSONAS, ASSESSMENT_CATEGORIES, usernameToPersona, computeProfile,
  ARCHETYPES, TONE_STYLES, REALMS, RECOVERY_STAGES,
  recommendArchetype, recommendTone, getStage, buildMentorPrompt,
  orderedRealmsByPriority, generateShadowNaming,
  buildRealmBriefingPrompt, buildQuestDonePrompt, buildQuestSkipPrompt,
  buildShadowEncounterPrompt, buildAspirationalPrompt,
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
  const conceptMatch = raw.match(/\[concept:(\w+)\]/);
  const concept = conceptMatch ? conceptMatch[1] : "default";
  const text = raw.replace(/\[concept:\w+\]/, "").trim();
  const speakingText = text.replace(/\*([^*]+)\*/g, "$1");
  return { text, speakingText, concept };
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
        <div className="mono" style={{ fontSize: "7px", color: "#c97575", letterSpacing: "0.2em", textTransform: "uppercase" }}>Shadow Present</div>
        <div className="serif" style={{ fontSize: "0.78rem", color: "#d4aaaa", fontStyle: "italic" }}>{shadowName}</div>
      </div>
      <div className="mono" style={{ fontSize: "7px", color: "#c97575", letterSpacing: "0.15em" }}>
        {Math.round(opacity * 100)}%
      </div>
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
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  const [shadowEncounterText, setShadowEncounterText] = useState("");

  const audioRef = useRef(null);
  const mentorParsed = parseMentorMessage(mentorRaw);
  const stage = getStage(totalPoints);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const audio = audioRef.current;
    if (audio) {
      audio.src = "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADPgBmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmYAAAAATGF2YzYwLjMAAAAAAAAAAAAAAAAkA0AAAAAAAAADPuLxp9QAAAAAAAAAAAAAAAAAAAAA";
      audio.volume = 0;
      audio.play().then(() => {
        audio.volume = 1;
        setAudioUnlocked(true);
      }).catch(() => setAudioUnlocked(true));
    }
  };

  useEffect(() => {
    if (!audioUrl || !audioUnlocked || muted || !audioRef.current) return;
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [audioUrl, audioUnlocked, muted]);

  // Generic mentor dispatcher
  const generateMentor = async (kind, ctx = {}) => {
    if (!archetype || !persona || !profile) return;
    setMentorLoading(true);
    setAudioUrl(null);
    setMentorRaw("");

    const systemPrompt = buildMentorPrompt({
      archetype, tone, userName, persona, profile, recoveryScore, stage, day,
    });

    let userPrompt = "";
    const realm = orderedRealms[activeRealmIdx] || REALMS[0];

    if (kind === "realm_briefing") {
      userPrompt = buildRealmBriefingPrompt(ctx.realm || realm, persona, profile, day);
    } else if (kind === "quest_done") {
      userPrompt = buildQuestDonePrompt(ctx.quest, ctx.realm || realm, persona);
    } else if (kind === "quest_skipped") {
      userPrompt = buildQuestSkipPrompt(ctx.quest, ctx.realm || realm, profile);
    } else if (kind === "shadow_encounter") {
      userPrompt = buildShadowEncounterPrompt(ctx.namingText, profile, persona);
    } else if (kind === "aspirational") {
      userPrompt = buildAspirationalPrompt(userName, persona, profile, archetype);
    }

    const raw = await fetchMentor(systemPrompt, userPrompt);
    setMentorRaw(raw);
    setMentorLoading(false);

    const { speakingText } = parseMentorMessage(raw);
    if (archetype?.voiceId && !muted) {
      const audio = await fetchVoice(speakingText, archetype.voiceId);
      if (audio) setAudioUrl(audio);
    }
  };

  const handleLoginSubmit = () => {
    unlockAudio();
    const p = usernameToPersona(username);
    setPersona(p);
    setUserName(p.defaultName);
    const computed = computeProfile(p);
    setProfile(computed);
    setRecoveryScore(computed.recoveryScore);
    setOrderedRealms(orderedRealmsByPriority(computed.realmPriorities));
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
    setScreen("aspirational");
    setTimeout(() => generateMentor("aspirational"), 400);
  };

  const handleEnterDashboard = async () => {
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
    setDay(d => d + 1);
    setActiveRealmIdx(r => (r + 1) % orderedRealms.length);
    setCompletedByRealm({}); // reset for new day (simplified — each day is a fresh slate)
    const nextRealm = orderedRealms[(activeRealmIdx + 1) % orderedRealms.length];
    await generateMentor("realm_briefing", { realm: nextRealm });
  };

  const switchRealm = async (idx) => {
    if (idx === activeRealmIdx) return;
    setActiveRealmIdx(idx);
    await generateMentor("realm_briefing", { realm: orderedRealms[idx] });
  };

  const openShadowEncounter = () => {
    const naming = generateShadowNaming(persona, profile);
    setShadowEncounterText(naming);
    setMentorRaw("");
    setScreen("shadow_encounter");
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
        <div className="section-label">A Burnout Prevention Program</div>
        <h1 className="serif" style={{ fontSize: "clamp(42px, 11vw, 66px)", color: "var(--cream)", lineHeight: 0.95, marginBottom: 8 }}>RECOVERY</h1>
        <p className="serif" style={{ fontSize: "1.05rem", fontStyle: "italic", color: "var(--gold-light)", marginBottom: 28 }}>
          Before burnout becomes a diagnosis, it becomes a drift.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Mandala archetypeId="stoic" color="#c9a84c" concept="still" size={180} />
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--silver)", lineHeight: 1.8, marginBottom: 28 }}>
          A 90-day recovery journey guided by an archetype — Marcus Aurelius, Marie Curie, Shackleton — grounded in your 42 app clinical data.
        </p>

        <div className="gold-rule" />

        <div style={{ marginTop: 20 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Sign in with your 42 app account</div>
          <input
            className="input"
            placeholder="Your 42 username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && username.trim() && handleLoginSubmit()}
          />
          <button className="btn-gold" disabled={!username.trim()} onClick={handleLoginSubmit} style={{ marginTop: 10 }}>
            CONTINUE →
          </button>
          <p style={{ fontSize: "0.68rem", color: "var(--gold-dim)", marginTop: 10, fontStyle: "italic", textAlign: "center" }}>
            Demo: assessment data will be simulated based on your username
          </p>
        </div>

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    );
  }

  // ─── LOADING ───────────────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="shell" style={{ padding: "2.5rem 1.5rem" }}>
        <div className="section-label">Syncing from 42 app</div>
        <h2 className="serif" style={{ fontSize: "1.5rem", color: "var(--cream)", marginBottom: 4 }}>Welcome back, {userName}.</h2>
        <p style={{ fontSize: "0.82rem", color: "var(--silver)", marginBottom: 22 }}>
          Loading your clinical assessment profile from the 42 app...
        </p>

        {ASSESSMENT_CATEGORIES.map((c, i) => {
          const done = i < loadedCategories - 1 || (i === ASSESSMENT_CATEGORIES.length - 1 && loadComplete);
          const loading = !loadComplete && i === loadedCategories - 1;
          const visible = i < loadedCategories;

          let finding = "";
          if (done && persona) {
            if (c.key === "bat") finding = `Composite: ${profile.batComposite} · ${profile.risk} risk`;
            else if (c.key === "cognitive_health") finding = `Loneliness: ${persona.cognitive_health.loneliness.toFixed(1)} · Anxiety: ${persona.cognitive_health.anxiety.toFixed(1)}`;
            else if (c.key === "metabolic_risk") finding = `${persona.metabolic_risk.toFixed(1)}/5 · ${persona.metabolic_risk >= 3.5 ? "Elevated" : persona.metabolic_risk >= 2.5 ? "Moderate" : "Low"}`;
            else if (c.key === "lifestyle") finding = `Sleep: ${persona.lifestyle.sleep.toFixed(1)} · Sedentary: ${persona.lifestyle.sedentary.toFixed(1)}`;
            else if (c.key === "alexithymia") finding = `${persona.alexithymia.toFixed(1)}/5 · ${persona.alexithymia >= 3.8 ? "High" : "Moderate"}`;
            else if (c.key === "self_efficacy") finding = `General: ${persona.self_efficacy.toFixed(1)}/5`;
            else if (c.key === "personality") finding = `Conscientious: ${persona.personality.conscientiousness.toFixed(1)}`;
            else if (c.key === "work_conditions") finding = `Pressure: ${persona.work_conditions.pressure.toFixed(1)} · Meaning: ${persona.work_conditions.meaning.toFixed(1)}`;
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
                Profile Synthesis Complete
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--mist)", lineHeight: 1.6 }}>
                Your data reveals a pattern we call <span style={{ color: "#c97575", fontStyle: "italic" }}>{profile.shadow.name}</span>. We analyzed {ASSESSMENT_CATEGORIES.reduce((s, c) => s + c.count, 0)} data points across {ASSESSMENT_CATEGORIES.length} clinical dimensions.
              </p>
            </div>
            <button className="btn-gold" onClick={() => setScreen("profile")}>
              SEE MY PROFILE →
            </button>
          </div>
        )}

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    );
  }

  // ─── PROFILE + SHADOW REVEAL (iceberg animation) ───────────────────
  if (screen === "profile") {
    const shadowLabels = [
      { name: "exhaustion", value: persona.bat.exhaustion.toFixed(1) },
      { name: "sleep_drift", value: persona.lifestyle.sleep.toFixed(1) },
      { name: "alexithymia", value: persona.alexithymia.toFixed(1) },
      { name: "work_pressure", value: persona.work_conditions.pressure.toFixed(1) },
      { name: "loneliness", value: persona.cognitive_health.loneliness.toFixed(1) },
    ];

    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">Your Burnout Risk Profile</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>The data speaks, {userName}.</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--silver)", marginBottom: 18 }}>Profession: {persona.context}</p>

        {/* ONE animation per page — Iceberg reveals the Shadow */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <RealmAnimation scene="iceberg" color="#c9a84c" size={{ w: 420, h: 340 }} extra={{ shadowLabels }} />
        </div>

        {/* Shadow name — big, serif, beneath the animation */}
        <div style={{ padding: "1rem 1.2rem", background: "var(--deep)", borderLeft: "2px solid var(--shadow-red)", marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#c97575", textTransform: "uppercase", marginBottom: 4 }}>
            Your Shadow
          </div>
          <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--cream)", marginBottom: 6 }}>{profile.shadow.name}</h3>
          <p className="serif" style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--gold-light)", marginBottom: 12, lineHeight: 1.6 }}>
            {profile.shadow.desc}
          </p>

          <div onClick={() => toggleWhy("shadow")} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.72rem", color: "var(--gold)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <span>Why this Shadow</span>
            <span>{expandedWhy.shadow ? "−" : "+"}</span>
          </div>

          {expandedWhy.shadow && (
            <div className="animate-fadeUp" style={{ marginTop: 6 }}>
              {profile.shadow.why.map((w, i) => (
                <div key={i} className="why-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--mist)" }}>{w.metric}</span>
                    <span className="mono" style={{ fontSize: "0.72rem", color: "var(--gold)" }}>{w.score}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--silver)", fontStyle: "italic" }}>{w.note}</div>
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
          <span>BAT Composite <span className="mono" style={{ color: "var(--gold)" }}>{profile.batComposite}</span> · Risk <span style={{ color: "var(--gold-light)" }}>{profile.risk}</span></span>
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

        <button className="btn-gold" onClick={handleGoToArchetype}>MEET YOUR GUIDE →</button>
      </div>
    );
  }

  // ─── ARCHETYPE ─────────────────────────────────────────────────────
  if (screen === "archetype") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">Your Recommended Archetype</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>Based on your profile...</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--silver)", marginBottom: 18 }}>
          Analyzed from your personality, work conditions, and clinical scores.
        </p>

        {/* ONE animation — the mandala of the recommended archetype */}
        <div style={{ padding: "1.2rem", background: recommendedArchetype.color + "15", border: `1px solid ${recommendedArchetype.color}`, marginBottom: 16, position: "relative" }}>
          <div className="mono" style={{ position: "absolute", top: -8, right: 12, padding: "2px 10px", background: recommendedArchetype.color, color: "var(--void)", fontSize: "8px", letterSpacing: "0.2em", fontWeight: 700 }}>RECOMMENDED</div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Mandala archetypeId={recommendedArchetype.id} color={recommendedArchetype.color} concept="still" size={140} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <h3 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)" }}>{recommendedArchetype.name}</h3>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: recommendedArchetype.color, textTransform: "uppercase" }}>{recommendedArchetype.figure}</div>
            <div className="serif" style={{ fontSize: "0.88rem", fontStyle: "italic", color: "var(--gold-light)", marginTop: 2 }}>{recommendedArchetype.epithet}</div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--mist)", lineHeight: 1.6, marginBottom: 10, textAlign: "center" }}>{recommendedArchetype.desc}</p>

          <div onClick={() => toggleWhy("arch_rec")} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.72rem", color: recommendedArchetype.color, fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <span>Why {recommendedArchetype.name} for you</span>
            <span>{expandedWhy.arch_rec ? "−" : "+"}</span>
          </div>

          {expandedWhy.arch_rec && (
            <div className="animate-fadeUp" style={{ marginTop: 8 }}>
              {archetypeReasons.map((r, i) => (
                <div key={i} className="why-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--mist)" }}>{r.metric}</span>
                    <span className="mono" style={{ fontSize: "0.72rem", color: recommendedArchetype.color }}>{r.value}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--silver)", fontStyle: "italic" }}>{r.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-label">Or choose a different guide</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }}>
          {ARCHETYPES.filter(a => a.id !== recommendedArchetype.id).map(a => (
            <div key={a.id} onClick={() => setArchetype(a)} style={{
              padding: "10px", cursor: "pointer",
              background: archetype?.id === a.id ? a.color + "25" : "var(--slate)",
              border: `1px solid ${archetype?.id === a.id ? a.color : a.color + "30"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                <div className="serif" style={{ fontSize: "0.9rem", color: "var(--cream)" }}>{a.name}</div>
              </div>
              <div className="mono" style={{ fontSize: "7px", letterSpacing: "0.15em", color: a.color, textTransform: "uppercase" }}>{a.figure}</div>
            </div>
          ))}
        </div>

        <button className="btn-gold" onClick={handleConfirmArchetype}>CONTINUE WITH {archetype.name.toUpperCase()} →</button>
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    );
  }

  // ─── TONE ──────────────────────────────────────────────────────────
  if (screen === "tone") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">How should {archetype.name} speak?</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 4 }}>Choose Your Voice</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--silver)", marginBottom: 18 }}>Same wisdom, different delivery.</p>

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
                {isRec && <div className="mono" style={{ position: "absolute", top: -8, right: 10, padding: "2px 8px", background: "var(--gold)", color: "var(--void)", fontSize: "7px", letterSpacing: "0.2em", fontWeight: 700 }}>RECOMMENDED</div>}
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
                    {expandedWhy.tone ? "− hide reasoning" : "+ why this tone for you"}
                  </div>
                )}
                {isRec && expandedWhy.tone && (
                  <div className="animate-fadeUp">
                    {toneReasons.map((r, i) => (
                      <div key={i} className="why-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--mist)" }}>{r.metric}</span>
                          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--gold)" }}>{r.value}</span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--silver)", fontStyle: "italic" }}>{r.note}</div>
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
            SEE YOUR ASPIRATIONAL SELF →
          </button>
        )}

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
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
            <AnimatedText text={mentorParsed.text} color={archetype.color} />
          )}
        </div>

        <button className="btn-gold" onClick={handleEnterDashboard}>BEGIN DAY 1 →</button>
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Day {day} of 90</div>
            <h2 className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)" }}>Recovery</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: "8px", color: stage.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{stage.title}</div>
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
              <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: realm.color, textTransform: "uppercase" }}>Today's Realm</div>
              <div className="serif" style={{ fontSize: "1.2rem", color: "var(--cream)" }}>{realm.icon} {realm.name}</div>
              <div style={{ fontSize: "0.72rem", color: realm.color, marginTop: 1 }}>{realm.sub}</div>
            </div>
            {isTopPriority && <div className="mono" style={{ fontSize: "7px", padding: "2px 8px", background: "var(--gold)", color: "var(--void)", letterSpacing: "0.15em", fontWeight: 700 }}>PRIORITY</div>}
          </div>
        </div>

        {/* THE ONE HERO ANIMATION — physics metaphor, state-driven */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, background: "#06060a", border: `1px solid ${realm.color}20` }}>
          <RealmAnimation scene={realm.id} color={realm.color} state={completedCount} size={{ w: 420, h: 340 }} />
        </div>

        {/* Mentor four-beat strategic message */}
        <div style={{ padding: "1rem 1.2rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}`, marginBottom: 14, minHeight: 80 }}>
          <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            {archetype.name} · {archetype.figure}
          </div>
          {mentorLoading ? (
            <div className="serif" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--silver)" }}>
              {archetype.name} is contemplating...
            </div>
          ) : (
            <AnimatedText text={mentorParsed.text} color={archetype.color} />
          )}
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
                    <span className="mono" style={{ fontSize: "8px", color: realm.color }}>+{quest.points}</span>
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
          <button className="btn-gold" onClick={nextDay} style={{ flex: 1 }}>NEXT DAY →</button>
          <button className="btn-ghost" onClick={openShadowEncounter} style={{ flex: 1 }}>SHADOW ENCOUNTER</button>
        </div>

        {/* Compressed score + progression */}
        <div style={{ padding: "0.7rem 1rem", border: "1px solid var(--gold-dim)", background: "var(--deep)", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Recovery Score</div>
            <div className="serif" style={{ fontSize: "1.3rem", color: archetype.color }}>{recoveryScore}</div>
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
                  <div className="mono" style={{ fontSize: "7px", letterSpacing: "0.2em", color: RECOVERY_STAGES[expandedStage].color, textTransform: "uppercase" }}>
                    Stage {RECOVERY_STAGES[expandedStage].level}
                  </div>
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
                <span style={{ color: "var(--silver)" }}>D{h.day} {h.status === "done" ? "◈" : h.status === "integrated" ? "✦" : "○"} {h.quest.slice(0, 36)}...</span>
                <span style={{ color: h.points > 0 ? "var(--gold)" : "#DC2626", fontFamily: "'Space Mono', monospace", fontSize: "9px" }}>{h.points > 0 ? "+" : ""}{h.points}</span>
              </div>
            ))}
          </div>
        )}

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    );
  }

  // ─── SHADOW ENCOUNTER ──────────────────────────────────────────────
  if (screen === "shadow_encounter") {
    return (
      <div className="shell" style={{ padding: "2rem 1.5rem" }}>
        <div className="section-label">Weekly Shadow Encounter</div>
        <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--cream)", marginBottom: 6 }}>
          Your Shadow has grown this week.
        </h2>
        <p style={{ color: "var(--silver)", fontSize: "0.8rem", marginBottom: 14 }}>
          {profile.shadow.name}. The data has surfaced a pattern. Naming it transfers its energy back to you.
        </p>

        {/* ONE animation — shadow integration physics (figure + shadow rejoining) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <RealmAnimation scene="integration" color={archetype.color} size={{ w: 420, h: 320 }} />
        </div>

        <div className="mono" style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
          Your Shadow is asking you to see:
        </div>

        <div style={{ padding: "1rem", background: "var(--deep)", border: `1px solid ${archetype.color}30`, marginBottom: 14 }}>
          <p className="serif" style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.6 }}>
            "{shadowEncounterText}"
          </p>
          <div className="mono" style={{ fontSize: "7px", color: "var(--gold-dim)", letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>
            Auto-generated from your drift patterns
          </div>
        </div>

        <button
          className="btn-gold"
          onClick={submitShadowEncounter}
          disabled={mentorLoading || mentorRaw}
        >
          {mentorRaw ? "INTEGRATED" : mentorLoading ? "LISTENING..." : `OFFER THIS TO ${archetype.name.toUpperCase()} →`}
        </button>

        {mentorRaw && (
          <>
            <div className="animate-fadeUp" style={{ marginTop: 18, padding: "1.1rem", background: "var(--deep)", borderLeft: `2px solid ${archetype.color}` }}>
              <div className="mono" style={{ fontSize: "8px", color: archetype.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                {archetype.name} responds
              </div>
              <AnimatedText text={mentorParsed.text} color={archetype.color} />
            </div>
            <button className="btn-ghost" style={{ marginTop: 12, width: "100%" }} onClick={() => { setMentorRaw(""); setShadowEncounterText(""); setScreen("dashboard"); }}>
              RETURN TO DASHBOARD
            </button>
          </>
        )}

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    );
  }

  return null;
}
