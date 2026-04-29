export async function POST(request) {
  try {
    const { systemPrompt, userPrompt } = await request.json();
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 110,
        temperature: 0.85,
      }),
    });
    if (!response.ok) return Response.json({ text: "The guide is contemplating... [concept:default]" });
    const data = await response.json();
    return Response.json({ text: data.choices?.[0]?.message?.content || "Silence speaks louder than haste... [concept:default]" });
  } catch (error) {
    return Response.json({ text: "The guide is contemplating... [concept:default]" });
  }
}
