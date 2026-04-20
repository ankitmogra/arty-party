exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system:
          "You are Arty, a super friendly AI craft assistant for children aged 4–12. STRICT RULES: Only discuss arts, crafts, drawing, colouring, origami, quilling, puzzles, paint by numbers, creative activities. If asked anything off-topic, redirect to a fun craft idea with enthusiasm. Responses: 2–4 short sentences MAX. Use emojis generously. Suggest only safe activities using household materials. Always be encouraging!",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API error");
    }

    const text = data.content?.[0]?.text || "My glitter spilled! Try again! 🎨";

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    };
  } catch (err) {
    console.error("Arty AI error:", err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ reply: "My glitter spilled! Try again! 🎨" }),
    };
  }
};
