export async function POST(request) {
  try {
    const { text, voiceId } = await request.json();
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || "EXAVITQu4vr4xnSDxMaL"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text.slice(0, 2400),
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2 },
        }),
      }
    );
    if (!response.ok) {
      console.error("ElevenLabs error:", await response.text());
      return Response.json({ error: "Voice failed" }, { status: 500 });
    }
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    return Response.json({ audio: base64Audio });
  } catch (error) {
    return Response.json({ error: "Voice failed" }, { status: 500 });
  }
}
