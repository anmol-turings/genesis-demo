"use client";

const SCENE_MAP = {
  profile:   "/scenes/who-stays.mp4",
  body:      "/scenes/rest-multiplier.mp4",
  withdrawn: "/scenes/reach-stay.mp4",
  unnamed:   "/scenes/felt-named-free.mp4",
  scattered: "/scenes/focus-burns.mp4",
  purpose:   "/scenes/stop-preparing.mp4",
  shadow:    "/scenes/walks-lighter.mp4",
};

export default function SignatureScene({ id, size = 360 }) {
  const src = SCENE_MAP[id];
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
