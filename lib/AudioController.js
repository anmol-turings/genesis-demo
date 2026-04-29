"use client";

// ═══════════════════════════════════════════════════════════════════════════
// AudioController — singleton.
//
// Solves four problems at once:
//   1. ONE audio element shared across all screens — eliminates per-screen
//      <audio> elements that don't stop when you navigate.
//   2. stop() is the canonical way to halt playback. Called on every screen
//      transition and at the start of every generateMentor() call.
//   3. In-memory cache keyed by (archetype, day, kind, ctxKey) — so the same
//      situation never burns Mistral + ElevenLabs credits twice.
//   4. Web Audio API AnalyserNode publishes a 0..1 amplitude value at 60fps
//      so Mandala (and anything else) can react to the speaker's voice.
//
// All of this is module-level state — there's exactly one of these per page
// load. Accessing audioController on the server (SSR) returns null.
// ═══════════════════════════════════════════════════════════════════════════

class AudioController {
  constructor() {
    this.audio = null;             // HTMLAudioElement (created lazily)
    this.audioCtx = null;          // Web Audio context
    this.source = null;            // MediaElementSourceNode
    this.analyser = null;          // AnalyserNode
    this.unlocked = false;         // user gesture has happened
    this.amplitude = 0;            // last sampled normalized amplitude (0..1)
    this.rafId = null;
    this.cache = new Map();        // cacheKey → { mentorRaw, audioUrl }
    this.requestId = 0;            // bumped on every navigation; stale results dropped
  }

  // Called on first user gesture — creates audio element, plays a near-silent
  // primer to satisfy iOS/Safari autoplay rules.
  unlock() {
    if (this.unlocked) return;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
    }
    // Tiny silent mp3 (LAME header only) — same primer as the original code.
    const primer = "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADPgBmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmYAAAAATGF2YzYwLjMAAAAAAAAAAAAAAAAkA0AAAAAAAAADPuLxp9QAAAAAAAAAAAAAAAAAAAAA";
    this.audio.src = primer;
    this.audio.volume = 0;
    this.audio.play().then(() => {
      this.audio.volume = 1;
      this.unlocked = true;
    }).catch(() => {
      // Some browsers reject the silent primer; mark unlocked anyway since
      // the user gesture has already occurred.
      this.unlocked = true;
    });
  }

  // Lazily wire up Web Audio. Must be called AFTER the audio element has its
  // first real source set (createMediaElementSource binds to the element).
  _ensureAudioGraph() {
    if (this.audioCtx || !this.audio) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.audioCtx = new Ctx();
      this.source = this.audioCtx.createMediaElementSource(this.audio);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.6;
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      // If the audio element was already used in another graph, this throws.
      // Voice-reactivity will silently degrade; playback still works.
      this.audioCtx = null;
      this.analyser = null;
    }
  }

  _startAmplitudeLoop() {
    if (this.rafId) return;
    const data = this.analyser ? new Uint8Array(this.analyser.frequencyBinCount) : null;
    const tick = () => {
      if (!this.audio || this.audio.paused || !this.analyser || !data) {
        // Decay so visuals settle naturally when audio stops
        this.amplitude *= 0.85;
        if (this.amplitude < 0.001) this.amplitude = 0;
      } else {
        this.analyser.getByteFrequencyData(data);
        // Mean of mid-band bins — voice energy lives roughly here
        let sum = 0;
        const lo = 2, hi = Math.min(data.length, 16);
        for (let i = lo; i < hi; i++) sum += data[i];
        const mean = sum / Math.max(1, hi - lo);
        this.amplitude = Math.min(1, mean / 180);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  // Stop and reset. Call before any new playback or on screen transitions.
  stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        // Don't clear src — leaving it set is fine; pause is enough.
      } catch (e) { /* noop */ }
    }
    // Bump request id so any in-flight generateMentor results are discarded.
    this.requestId++;
  }

  // Begin playing a blob: URL. Pauses any current playback first.
  async play(url) {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
    }
    if (!this.audio.paused) {
      try { this.audio.pause(); } catch (e) {}
    }
    this.audio.src = url;
    try {
      await this.audio.play();
      this._ensureAudioGraph();
      // Resume context if it was suspended (browsers do this aggressively)
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        try { await this.audioCtx.resume(); } catch (e) {}
      }
      this._startAmplitudeLoop();
    } catch (e) {
      // Playback rejected (often: not unlocked yet) — fail silently.
    }
  }

  // Hook into the audio element's "ended" event for UI state.
  onEnded(fn) {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
    }
    this.audio.onended = fn;
  }

  // Public amplitude reader — Mandala calls this every frame.
  getAmplitude() { return this.amplitude; }

  // Cache layer
  hasCached(key) { return this.cache.has(key); }
  getCached(key) { return this.cache.get(key); }
  setCached(key, value) { this.cache.set(key, value); }

  // Request-id helpers (versioning)
  currentRequestId() { return this.requestId; }
  isStale(requestId) { return requestId !== this.requestId; }
  bumpRequestId() { this.requestId++; return this.requestId; }
}

// Module-level singleton. SSR-safe.
let _instance = null;
export function getAudioController() {
  if (typeof window === "undefined") return null;
  if (!_instance) _instance = new AudioController();
  return _instance;
}
