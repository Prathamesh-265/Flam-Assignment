import { HttpError } from "../middleware/errors.js";

const TIMEOUT_MS = 30_000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// One call to one model. Returns the response, or throws HttpError on network trouble.
async function callGemini(model, prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new HttpError(
        504,
        "TIMEOUT",
        "The AI took too long to answer. Please try again.",
      );
    }
    throw new HttpError(
      502,
      "UPSTREAM_FAILED",
      "Could not reach the AI service.",
    );
  }
}

// Sends the prompt to Gemini and returns the raw text it answered with.
// The API key lives here, on the server, and is never sent to the browser.
export async function askModel(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpError(
      500,
      "SERVER_MISCONFIGURED",
      "The server has no API key configured.",
    );
  }

  // Try the main model first, then the fallback if Google says it is busy.
  const models = [
    process.env.GEMINI_MODEL || "gemini-flash-latest",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite",
  ];

  let response;
  for (const model of models) {
    response = await callGemini(model, prompt, apiKey);
    if (response.ok) break;

    const detail = await response.text().catch(() => "");
    console.error(
      "Gemini status",
      response.status,
      "| model:",
      model,
      "|",
      detail.slice(0, 200),
    );

    const busy = response.status === 503 || response.status === 429;
    if (!busy) break; // a different error, retrying will not help
    await wait(800);
  }

  if (response.status === 503 || response.status === 429) {
    throw new HttpError(
      503,
      "BUSY",
      "The AI service is busy right now. Try again in a moment.",
    );
  }
  if (!response.ok) {
    throw new HttpError(
      502,
      "UPSTREAM_FAILED",
      "The AI service returned an error.",
    );
  }

  const data = await response.json().catch(() => null);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || !text.trim()) {
    throw new HttpError(
      502,
      "EMPTY",
      "The AI sent back an empty answer. Please try again.",
    );
  }
  return text;
}

// Models sometimes wrap JSON in ```json fences even when told not to.
export function extractJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new HttpError(
      502,
      "BAD_OUTPUT",
      "The AI returned something we could not read. Please try again.",
    );
  }
}
