import { inputSchema, outputSchema } from "../server/lib/schemas.js";
import { buildPrompt } from "../server/lib/prompt.js";
import { askModel, extractJson } from "../server/lib/llm.js";
import { HttpError } from "../server/middleware/errors.js";

// Vercel serverless version of POST /api/generate.
// It reuses the exact same validation, prompt and model code as the
// Express server, so behaviour is identical in both places.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed.", code: "METHOD_NOT_ALLOWED" });
  }

  try {
    const input = inputSchema.safeParse(req.body);
    if (!input.success) {
      throw new HttpError(400, "INVALID_INPUT", input.error.issues[0].message);
    }

    const { text, count } = input.data;
    const raw = await askModel(buildPrompt(text, count));
    const json = extractJson(raw);

    const result = outputSchema.safeParse(json);
    if (!result.success) {
      console.error("Model output rejected:", JSON.stringify(result.error.issues[0]));
      throw new HttpError(502, "BAD_OUTPUT", "The AI answered in an unexpected format. Please try again.");
    }

    return res.status(200).json(result.data);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ error: "Something went wrong on our side.", code: "SERVER_ERROR" });
  }
}