"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import SacredGeometry from "../lib/SacredGeometry";
import {
  TONE_STYLES, ARCHETYPES, REALMS, LEVELS, CALIBRATION_QUESTIONS,
  ASSESSMENT_CATEGORIES, getLevel, buildMentorPrompt,
} from "../lib/constants";

// ─── API HELPERS ────────────────────────────────────────────────────────────

async function fetchMentor(systemPrompt, userPrompt) {
  try {
    const res = await fetch("/api/mentor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemPrompt, userPrompt }) });
    const d = await res.json();
    return d.text || "";
  } catch { return "The guide is contemplating..."; }
}

async function fetchVoice(text, voiceId) {
  try {
    console.log("[voice] requesting...", voiceId);
    const res = await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voiceId }) });
    const d = await res.json();
    if (!d.audio) { console.error("[voice] no audio in response"); return null; }
    console.log("[voice] got audio, length:", d.audio.length);
    // Convert base64 to Blob URL — more reliable than data URI
    const byteString = atob(d.audio);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    console.log("[voice] blob URL created:", url);
    return url;
  } catch (err) { console.error("[voice] error:", err); return null; }
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function Genesis() {
  const [screen, setScreen] = useState("hero");
  const [userName, setUserName] = useState("");
  const [kidsCount, setKidsCount] = useState("");
  const [kidsAges, setKidsAges] = useState("");
  const [gender, setGender] = useState(null);
  const [archetype, setArchetype] = useState(null);
  const [tone, setTone] = useState(null);
  const [calStep, setCalStep] = useState(0);
  const [calibration, setCalibration] = useState({});
  const [assessScores, setAssessScores] = useState(null);
  const [assessing, setAssessing] = useState(false);

  // Game state
  const [rippleScore, setRippleScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [day, setDay] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeRealm, setActiveRealm] = useState(0);
  const [completedToday, setCompletedToday] = useState([]);
  const [history, setHistory] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(null);

  // Mentor
  const [mentorMsg, setMentorMsg] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const level = getLevel(totalPoints);
  const kidsInfo = `${kidsCount} kid${kidsCount > 1 ? "s" : ""} (ages: ${kidsAges})`;

  const getProfile = useCallback(() => ({
    archetype, tone, userName, kidsInfo, calibration, rippleScore, level, streak, day,
  }), [archetype, tone, userName, kidsInfo, calibration, rippleScore, level, streak, day]);

  // ─── MENTOR GENERATION ──────────────────────────────────────────────────

  const generateMentor = async (event, context = "") => {
    if (!archetype) return;
    setMentorLoading(true);
    setAudioUrl(null);
    const systemPrompt = buildMentorPrompt(getProfile());
    let userPrompt = "";

    if (event === "morning") {
      const realm = REALMS[activeRealm];
      userPrompt = `Generate a morning message for day ${day}. Active realm: "${realm.name}" (${realm.sub}). Today's quests include: "${realm.quests[0]?.title}". Speak to their struggle (${calibration.biggest_struggle}) and connect to their child. Remember your speaking style instructions.`;
    } else if (event === "quest_done") {
      userPrompt = `They just completed a quest: ${context}. Celebrate this in your unique voice. Connect it to their child's future. Remind them why this matters across generations. Remember your speaking style.`;
    } else if (event === "quest_skipped") {
      userPrompt = `They skipped a quest: ${context}. The Ripple Score dropped. Speak truth without cruelty. Make the cost real but leave the door open. Remember your speaking style.`;
    } else if (event === "level_up") {
      userPrompt = `They just reached a new level: ${context}. This is a milestone. Speak with ceremony and weight. This is not a game notification — it is a threshold crossed. Remember your speaking style.`;
    }

    const text = await fetchMentor(systemPrompt, userPrompt);
    setMentorMsg(text);
    setMentorLoading(false);

    if (archetype?.voiceId) {
      const audio = await fetchVoice(text, archetype.voiceId);
      if (audio) {
        setAudioUrl(audio);
        // Don't autoplay — browser blocks it. User clicks LISTEN.
      }
    }
  };

  // ─── QUEST HANDLERS ─────────────────────────────────────────────────────

  const completeQuest = async (quest, realmIdx, questIdx) => {
    const pts = quest.points;
    setRippleScore(s => s + pts);
    setTotalPoints(t => t + pts);
    setStreak(s => s + 1);
    setCompletedToday(c => [...c, `${realmIdx}-${questIdx}`]);
    setHistory(h => [...h, { day, quest: quest.title, status: "done", points: pts }]);

    const newTotal = totalPoints + pts;
    const newLevel = getLevel(newTotal);
    if (newLevel.level > level.level) {
      await generateMentor("level_up", newLevel.title);
    } else {
      await generateMentor("quest_done", `"${quest.title}" (+${pts} Ripple). Why it matters: ${quest.why}`);
    }
  };

  const skipQuest = async (quest, realmIdx, questIdx) => {
    setRippleScore(s => Math.max(0, s - 5));
    setCompletedToday(c => [...c, `${realmIdx}-${questIdx}`]);
    setHistory(h => [...h, { day, quest: quest.title, status: "skipped", points: -5 }]);
    await generateMentor("quest_skipped", `"${quest.title}". Ripple Score dropped by 5.`);
  };

  const nextDay = async () => {
    setDay(d => d + 1);
    setCompletedToday([]);
    setActiveRealm(r => (r + 1) % REALMS.length);
    await generateMentor("morning");
  };

  // ─── ARCHETYPE SPEAKER ──────────────────────────────────────────────────

  function ArchetypeSpeaker() {
    if (!archetype) return null;

    const handlePlay = () => {
      if (!audioRef.current || !audioUrl) { console.log("[play] no ref or url"); return; }
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      console.log("[play] setting src and playing...");
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => { console.log("[play] playing!"); setIsPlaying(true); })
        .catch(e => { console.error("[play] failed:", e); setIsPlaying(false); });
    };

    return (
      <div style={{ background: "var(--deep)", border: `1px solid ${archetype.color}30`, padding: "1.2rem", marginBottom: 16 }}>
        {/* Sacred Geometry + Name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <SacredGeometry
            archetypeId={archetype.id}
            color={archetype.color}
            speaking={isPlaying}
            size={160}
          />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "var(--cream)" }}>{archetype.name}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", letterSpacing: "0.2em", color: archetype.color, textTransform: "uppercase" }}>{archetype.epithet}</div>
          </div>
        </div>

        {/* Message */}
        {mentorLoading ? (
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", fontStyle: "italic", color: "var(--silver)" }}>
              {archetype.name} is contemplating...
            </div>
          </div>
        ) : mentorMsg && (
          <div style={{ borderLeft: `2px solid ${archetype.color}40`, paddingLeft: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.7 }}>
              "{mentorMsg}"
            </div>
          </div>
        )}

        {/* Listen Button */}
        {audioUrl && !mentorLoading && (
          <button onClick={handlePlay}
            style={{
              width: "100%", padding: "10px", marginTop: 4,
              background: isPlaying ? archetype.color + "20" : "transparent",
              border: `1px solid ${archetype.color}50`,
              color: archetype.color,
              fontSize: "0.75rem", fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.3s",
            }}>
            {isPlaying ? "◉ SPEAKING..." : "▶ HEAR YOUR GUIDE"}
          </button>
        )}

        {!audioUrl && !mentorLoading && mentorMsg && (
          <div style={{ textAlign: "center", padding: "6px 0" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", color: "var(--gold-dim)", letterSpacing: "0.15em" }}>
              PREPARING VOICE...
            </span>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── HERO ───────────────────────────────────────────────────────────────

  if (screen === "hero") {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", padding: "3rem 2rem" }}>
        <div className="section-label" style={{ marginBottom: 24 }}>The Parent Evolution Program</div>
        <h1 className="serif" style={{ fontSize: "clamp(48px, 12vw, 72px)", color: "var(--cream)", lineHeight: 0.9, marginBottom: 8 }}>GENESIS</h1>
        <p className="serif" style={{ fontSize: "1.1rem", fontStyle: "italic", color: "var(--gold-light)", marginBottom: 24 }}>Your health is their inheritance.</p>
        <p style={{ fontSize: "0.85rem", color: "var(--silver)", maxWidth: 340, lineHeight: 1.7, marginBottom: 32 }}>
          A gamified transformation journey for parents — using science, psychology, and archetype wisdom to illuminate how your daily choices become your child's lifelong foundation.
        </p>
        <div className="gold-rule" />
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} />
          <input className="input" placeholder="Number of children" value={kidsCount} onChange={e => setKidsCount(e.target.value)} />
          <input className="input" placeholder="Children's ages (e.g. 4 and 7)" value={kidsAges} onChange={e => setKidsAges(e.target.value)} />
          <button className="btn-gold" disabled={!userName || !kidsCount || !kidsAges} onClick={() => setScreen("gender")} style={{ marginTop: 8 }}>
            BEGIN YOUR EVOLUTION →
          </button>
        </div>
      </div>
    );
  }

  // ─── GENDER ─────────────────────────────────────────────────────────────

  if (screen === "gender") {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", padding: "3rem 2rem" }}>
        <div className="section-label">Step 1 of 4</div>
        <h2 className="serif" style={{ fontSize: "2rem", color: "var(--cream)", marginBottom: 8 }}>Choose Your Guides</h2>
        <p style={{ color: "var(--silver)", fontSize: "0.85rem", marginBottom: 32 }}>Each tradition carries its own wisdom. Both lead to transformation.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { g: "m", label: "Masculine Archetypes", names: "Archos · Leonidas · Rafael · Atlas · Hermes · Sovereign" },
            { g: "f", label: "Feminine Archetypes", names: "Sophia · Artemis · Iris · Nova · Kira · Gaia" },
          ].map(opt => (
            <div key={opt.g} onClick={() => { setGender(opt.g); setScreen("archetype"); }}
              style={{ padding: "1.5rem", border: "1px solid rgba(201,168,76,0.2)", background: "var(--slate)", cursor: "pointer", transition: "all 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8 }}>{opt.label}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--silver)" }}>{opt.names}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── ARCHETYPE SELECTION ────────────────────────────────────────────────

  if (screen === "archetype") {
    const list = ARCHETYPES[gender] || [];
    return (
      <div className="shell" style={{ padding: "1.5rem" }}>
        <div className="section-label">Step 2 of 4</div>
        <h2 className="serif" style={{ fontSize: "1.8rem", color: "var(--cream)", marginBottom: 4 }}>Choose Your Guide</h2>
        <p style={{ color: "var(--silver)", fontSize: "0.82rem", marginBottom: 20 }}>Your archetype interprets your data, challenges your assumptions, and celebrates your growth.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map(a => (
            <div key={a.id} onClick={() => { setArchetype(a); setScreen("tone"); }}
              style={{
                padding: "1rem 1.2rem", background: archetype?.id === a.id ? a.color + "20" : "var(--slate)",
                border: `1px solid ${a.color}30`, cursor: "pointer", transition: "all 0.3s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = a.color + "30"}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: a.color + "15", border: `1px solid ${a.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{a.symbol}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", letterSpacing: "0.2em", color: a.color, textTransform: "uppercase" }}>{a.role}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--cream)" }}>{a.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.75rem", fontStyle: "italic", color: a.color }}>{a.epithet}</div>
                </div>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--silver)", marginTop: 10, lineHeight: 1.6 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── TONE SELECTION ─────────────────────────────────────────────────────

  if (screen === "tone") {
    return (
      <div className="shell" style={{ padding: "1.5rem" }}>
        <div className="section-label">Step 3 of 4 — How should {archetype?.name} speak?</div>
        <h2 className="serif" style={{ fontSize: "1.6rem", color: "var(--cream)", marginBottom: 4 }}>Choose Your Voice</h2>
        <p style={{ color: "var(--silver)", fontSize: "0.82rem", marginBottom: 20 }}>Same wisdom, different delivery. You can change this anytime.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TONE_STYLES.map(t => (
            <div key={t.id} onClick={() => setTone(t.id)}
              style={{
                padding: "1.2rem", background: tone === t.id ? "var(--charcoal)" : "var(--slate)",
                border: tone === t.id ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer", transition: "all 0.3s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: tone === t.id ? "var(--gold)" : "var(--silver)" }}>{t.icon}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.15em", color: tone === t.id ? "var(--gold)" : "var(--mist)", textTransform: "uppercase" }}>{t.label}</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--silver)", marginBottom: 8 }}>{t.desc}</p>
              <div style={{ padding: "0.7rem", background: "rgba(0,0,0,0.3)", borderLeft: `2px solid ${archetype?.color || "var(--gold)"}`, fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "var(--cream)", lineHeight: 1.5 }}>
                "{t.example}"
              </div>
            </div>
          ))}
        </div>

        {tone && (
          <button className="btn-gold" onClick={() => { setCalStep(0); setScreen("calibration"); }} style={{ marginTop: 16 }}>
            CONTINUE →
          </button>
        )}
      </div>
    );
  }

  // ─── CALIBRATION ────────────────────────────────────────────────────────

  if (screen === "calibration") {
    const q = CALIBRATION_QUESTIONS[calStep];
    const selected = calibration[q.id];
    return (
      <div className="shell" style={{ padding: "1.5rem" }}>
        <div className="section-label">Step 4 of 4 — Calibration {calStep + 1}/{CALIBRATION_QUESTIONS.length}</div>
        <div style={{ display: "flex", gap: 4, margin: "8px 0 20px" }}>
          {CALIBRATION_QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, background: i <= calStep ? "var(--gold)" : "var(--charcoal)" }} />
          ))}
        </div>

        {/* Archetype asking */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.8rem", background: archetype?.color + "10", border: `1px solid ${archetype?.color}20`, marginBottom: 20 }}>
          <span style={{ fontSize: "1.3rem" }}>{archetype?.symbol}</span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "var(--cream)", fontSize: "0.9rem" }}>
            {archetype?.name} asks...
          </span>
        </div>

        <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)", marginBottom: 16 }}>{q.question}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.options.map(opt => (
            <div key={opt.value} onClick={() => setCalibration({ ...calibration, [q.id]: opt.value })}
              style={{
                padding: "1rem", cursor: "pointer", transition: "all 0.2s",
                border: selected === opt.value ? `1px solid var(--gold)` : "1px solid rgba(255,255,255,0.06)",
                background: selected === opt.value ? "var(--charcoal)" : "var(--slate)",
              }}>
              <span style={{ fontSize: "0.88rem", color: selected === opt.value ? "var(--gold)" : "var(--mist)" }}>{opt.label}</span>
            </div>
          ))}
        </div>

        {selected && (
          <button className="btn-gold" onClick={() => {
            if (calStep < CALIBRATION_QUESTIONS.length - 1) setCalStep(calStep + 1);
            else setScreen("assessment");
          }} style={{ marginTop: 16 }}>
            {calStep < CALIBRATION_QUESTIONS.length - 1 ? "NEXT →" : "BEGIN ASSESSMENT →"}
          </button>
        )}
      </div>
    );
  }

  // ─── ASSESSMENT ─────────────────────────────────────────────────────────

  if (screen === "assessment") {
    const runAssessment = () => {
      setAssessing(true);
      setTimeout(() => {
        const scores = {};
        ASSESSMENT_CATEGORIES.forEach(c => { scores[c.key] = Math.floor(Math.random() * 55) + 25; });
        setAssessScores(scores);
        const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
        setRippleScore(Math.round(avg * 1.5));
        setTotalPoints(Math.round(avg));
        setAssessing(false);
      }, 2000);
    };

    return (
      <div className="shell" style={{ padding: "1.5rem" }}>
        <div className="section-label">Baseline Assessment</div>
        <h2 className="serif" style={{ fontSize: "1.6rem", color: "var(--cream)", marginBottom: 4 }}>Reading Your Foundation</h2>
        <p style={{ color: "var(--silver)", fontSize: "0.82rem", marginBottom: 20 }}>Your archetype guide needs data to begin.</p>

        {!assessScores && !assessing && (
          <>
            {ASSESSMENT_CATEGORIES.map(c => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.7rem 1rem", background: "var(--slate)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 4 }}>
                <span style={{ fontSize: "1rem" }}>{c.icon}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--mist)" }}>{c.label}</span>
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--silver)", fontFamily: "'Space Mono', monospace" }}>PENDING</span>
              </div>
            ))}
            <button className="btn-gold" onClick={runAssessment} style={{ marginTop: 16 }}>GENERATE ASSESSMENT DATA →</button>
            <p style={{ fontSize: "0.7rem", color: "var(--gold-dim)", marginTop: 8, textAlign: "center", fontFamily: "'Space Mono', monospace" }}>Demo: scores are randomly generated</p>
          </>
        )}

        {assessing && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: "2rem", animation: "pulse 1.5s infinite" }}>{archetype?.symbol}</div>
            <p style={{ color: "var(--silver)", marginTop: 12 }}>{archetype?.name} is reading your data...</p>
          </div>
        )}

        {assessScores && (
          <div className="animate-fadeUp">
            {ASSESSMENT_CATEGORIES.map(c => (
              <div key={c.key} style={{ padding: "0.6rem 1rem", background: "var(--slate)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--mist)" }}>{c.icon} {c.label}</span>
                  <span style={{ color: c.color, fontWeight: 600 }}>{assessScores[c.key]}/100</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${assessScores[c.key]}%`, background: c.color }} /></div>
              </div>
            ))}

            <div style={{ textAlign: "center", margin: "24px 0", padding: "1.5rem", border: "1px solid var(--gold-dim)", background: "var(--deep)" }}>
              <div className="section-label">Your Family Ripple Score</div>
              <div className="serif" style={{ fontSize: "3rem", color: "var(--gold)", lineHeight: 1 }}>{rippleScore}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--silver)", marginTop: 4 }}>Level: {level.title}</div>
            </div>

            <button className="btn-gold" onClick={async () => { setScreen("dashboard"); await generateMentor("morning"); }}>
              ENTER GENESIS →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────────────

  if (screen === "dashboard") {
    const realm = REALMS[activeRealm];
    const nextLevel = LEVELS.find(l => l.threshold > totalPoints) || LEVELS[LEVELS.length - 1];
    const progress = nextLevel.threshold > 0 ? Math.min(100, (totalPoints / nextLevel.threshold) * 100) : 100;

    return (
      <div className="shell" style={{ padding: "1.2rem 1.5rem 2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>Day {day} of 90</div>
            <h2 className="serif" style={{ fontSize: "1.3rem", color: "var(--cream)" }}>GENESIS</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: "8px", color: level.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{level.title}</div>
            <div className="mono" style={{ fontSize: "8px", color: "var(--gold-dim)" }}>🔥 {streak}d streak</div>
          </div>
        </div>

        {/* Ripple Score + Progression */}
        <div style={{ padding: "1.2rem", border: "1px solid var(--gold-dim)", background: "var(--deep)", marginBottom: 12 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div className="section-label">Family Ripple Score</div>
            <div className="serif" style={{ fontSize: "2.8rem", color: "var(--gold)", lineHeight: 1 }}>{rippleScore}</div>
          </div>

          {/* Progression Line */}
          <div style={{ position: "relative", padding: "0 4px" }}>
            {/* Background track */}
            <div style={{ position: "absolute", top: 12, left: 4, right: 4, height: 2, background: "var(--charcoal)" }} />
            {/* Filled track */}
            <div style={{ position: "absolute", top: 12, left: 4, height: 2, background: `linear-gradient(90deg, ${level.color}, var(--gold))`, width: `${Math.min(100, (totalPoints / 1000) * 100)}%`, transition: "width 0.8s ease" }} />

            {/* Level dots */}
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {LEVELS.map((l, i) => {
                const isActive = level.level >= l.level;
                const isCurrent = level.level === l.level;
                const isExpanded = expandedLevel === i;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", zIndex: isExpanded ? 10 : 1 }}
                    onClick={() => setExpandedLevel(isExpanded ? null : i)}>
                    {/* Dot */}
                    <div style={{
                      width: isCurrent ? 26 : 20, height: isCurrent ? 26 : 20,
                      borderRadius: "50%",
                      background: isActive ? l.color : "var(--charcoal)",
                      border: `2px solid ${isActive ? l.color : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isCurrent ? "10px" : "8px", color: isActive ? "var(--void)" : "var(--silver)",
                      fontFamily: "'Space Mono', monospace", fontWeight: 700,
                      transition: "all 0.3s",
                      boxShadow: isCurrent ? `0 0 12px ${l.color}60` : "none",
                    }}>
                      {l.icon}
                    </div>
                    {/* Label */}
                    <div style={{
                      marginTop: 6, fontSize: "7px", textAlign: "center",
                      fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em",
                      color: isActive ? l.color : "var(--silver)",
                      opacity: isActive ? 1 : 0.5,
                      maxWidth: 55, lineHeight: 1.3,
                    }}>
                      {l.title.replace("The ", "")}
                    </div>
                    {/* Points needed */}
                    <div style={{ fontSize: "6px", fontFamily: "'Space Mono', monospace", color: "var(--gold-dim)", marginTop: 2 }}>
                      {l.threshold}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expanded Level Detail — tap to show */}
          {expandedLevel !== null && (
            <div className="animate-fadeUp" style={{
              marginTop: 14, padding: "1rem",
              background: LEVELS[expandedLevel].color + "10",
              border: `1px solid ${LEVELS[expandedLevel].color}30`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span className="mono" style={{ fontSize: "8px", letterSpacing: "0.2em", color: LEVELS[expandedLevel].color, textTransform: "uppercase" }}>
                    Level {LEVELS[expandedLevel].level}
                  </span>
                  <div className="serif" style={{ fontSize: "1.1rem", color: "var(--cream)" }}>
                    {LEVELS[expandedLevel].title}
                  </div>
                </div>
                <span onClick={() => setExpandedLevel(null)} style={{ cursor: "pointer", color: "var(--silver)", fontSize: "0.8rem" }}>✕</span>
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--silver)", marginBottom: 10, fontStyle: "italic" }}>
                {LEVELS[expandedLevel].desc}
              </p>

              {/* For You */}
              <div style={{ padding: "0.7rem", background: "rgba(0,0,0,0.3)", marginBottom: 6 }}>
                <div className="mono" style={{ fontSize: "7px", letterSpacing: "0.2em", color: "var(--gold)", marginBottom: 4, textTransform: "uppercase" }}>
                  What this means for you
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--mist)", lineHeight: 1.6 }}>
                  {LEVELS[expandedLevel].forYou}
                </p>
              </div>

              {/* For Your Child */}
              <div style={{ padding: "0.7rem", background: "rgba(0,0,0,0.3)" }}>
                <div className="mono" style={{ fontSize: "7px", letterSpacing: "0.2em", color: LEVELS[expandedLevel].color, marginBottom: 4, textTransform: "uppercase" }}>
                  What your child experiences
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--mist)", lineHeight: 1.6 }}>
                  {LEVELS[expandedLevel].forChild}
                </p>
              </div>

              {level.level < LEVELS[expandedLevel].level && (
                <div style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--gold-dim)", fontFamily: "'Space Mono', monospace", textAlign: "center" }}>
                  {LEVELS[expandedLevel].threshold - totalPoints} ripple points to unlock
                </div>
              )}
            </div>
          )}
        </div>

        {/* Archetype Speaker */}
        <ArchetypeSpeaker />

        {/* Active Realm */}
        <div style={{ marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Active Realm — {realm.label}</div>
          <div style={{ padding: "0.8rem 1rem", background: "var(--slate)", border: `1px solid ${realm.color}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: "1.2rem" }}>{realm.icon}</span>
              <div>
                <div className="serif" style={{ fontSize: "1.1rem", color: "var(--cream)" }}>{realm.name}</div>
                <div style={{ fontSize: "0.7rem", color: realm.color }}>{realm.sub}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Quests */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Daily Quests</div>
          {realm.quests.map((quest, qi) => {
            const done = completedToday.includes(`${activeRealm}-${qi}`);
            return (
              <div key={qi} style={{ padding: "0.85rem 1rem", background: done ? "rgba(201,168,76,0.05)" : "var(--slate)", border: `1px solid ${done ? "var(--gold-dim)" : "rgba(255,255,255,0.04)"}`, marginBottom: 4, opacity: done ? 0.6 : 1 }}>
                <div style={{ fontSize: "0.85rem", color: "var(--cream)", marginBottom: 4, fontWeight: 400 }}>{quest.title}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--silver)", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>{quest.why}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="mono" style={{ fontSize: "9px", color: "var(--gold-dim)" }}>⏱ {quest.time} min</span>
                    <span className="mono" style={{ fontSize: "9px", color: realm.color }}>+{quest.points} ripple</span>
                  </div>
                  {!done && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => completeQuest(quest, activeRealm, qi)}
                        style={{ padding: "5px 12px", border: `1px solid ${realm.color}`, background: "transparent", color: realm.color, fontSize: "0.7rem", fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>DONE</button>
                      <button onClick={() => skipQuest(quest, activeRealm, qi)}
                        style={{ padding: "5px 12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--silver)", fontSize: "0.7rem", fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>SKIP</button>
                    </div>
                  )}
                  {done && <span className="mono" style={{ fontSize: "9px", color: "var(--gold)" }}>✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Realm Selector */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {REALMS.map((r, i) => (
            <div key={i} onClick={() => setActiveRealm(i)}
              style={{
                flex: 1, padding: "8px 4px", textAlign: "center", cursor: "pointer",
                background: i === activeRealm ? r.color + "20" : "var(--slate)",
                border: `1px solid ${i === activeRealm ? r.color : "rgba(255,255,255,0.04)"}`,
              }}>
              <div style={{ fontSize: "1rem" }}>{r.icon}</div>
              <div className="mono" style={{ fontSize: "7px", color: i === activeRealm ? r.color : "var(--silver)", letterSpacing: "0.1em" }}>{r.label.split(" ")[1]}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button className="btn-gold" onClick={nextDay}>NEXT DAY →</button>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>Chronicle</div>
            {history.slice(-5).reverse().map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.72rem" }}>
                <span style={{ color: "var(--silver)" }}>D{h.day} {h.status === "done" ? "◈" : "○"} {h.quest.slice(0, 35)}...</span>
                <span style={{ color: h.points > 0 ? "var(--gold)" : "#DC2626", fontFamily: "'Space Mono', monospace", fontSize: "9px" }}>{h.points > 0 ? "+" : ""}{h.points}</span>
              </div>
            ))}
          </div>
        )}

        {/* Audio element lives here — outside ArchetypeSpeaker to survive re-renders */}
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    );
  }

  return null;
}
