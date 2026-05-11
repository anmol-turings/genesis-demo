"use client";
import { useEffect, useRef } from "react";

// Legacy realm-id → scene path (kept so the shadow_encounter screen and any
// other realm-keyed callers keep working unchanged).
const SCENE_MAP = {
  profile:   "/scenes/who-stays.mp4",
  body:      "/scenes/rest-multiplier.mp4",
  withdrawn: "/scenes/reach-stay.mp4",
  unnamed:   "/scenes/felt-named-free.mp4",
  scattered: "/scenes/focus-burns.mp4",
  purpose:   "/scenes/stop-preparing.mp4",
  shadow:    "/scenes/walks-lighter.mp4",
};

// Direct sceneId → scene path (used by the dashboard via getHeroScene).
const SCENE_PATH = {
  "who-stays":       "/scenes/who-stays.mp4",
  "rest-multiplier": "/scenes/rest-multiplier.mp4",
  "reach-stay":      "/scenes/reach-stay.mp4",
  "felt-named-free": "/scenes/felt-named-free.mp4",
  "focus-burns":     "/scenes/focus-burns.mp4",
  "stop-preparing":  "/scenes/stop-preparing.mp4",
  "walks-lighter":   "/scenes/walks-lighter.mp4",
};

export default function SignatureScene({ id, sceneId, size = 480 }) {
  const src = (sceneId && SCENE_PATH[sceneId]) || (id && SCENE_MAP[id]);
  const ref = useRef(null);

  // Browsers cache loaded media, so a plain src-prop swap can keep the old
  // video playing. Force a reload whenever the resolved src changes.
  useEffect(() => {
    if (ref.current) {
      ref.current.load();
      const p = ref.current.play();
      if (p && p.catch) p.catch(() => {});
    }
  }, [src]);

  if (!src) return null;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#F2EDE3",
        borderRadius: 0,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(11, 18, 32, 0.35)",
      }}
    >
      <video
        key={src} /* remount the element when the source changes */
        ref={ref}
        src={src}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
