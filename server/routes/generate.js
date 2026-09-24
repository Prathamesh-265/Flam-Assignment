import { Router } from "express";
import { inputSchema, outputSchema } from "../lib/schemas.js";
import { buildPrompt } from "../lib/prompt.js";
import { askModel, extractJson } from "../lib/llm.js";
import { HttpError } from "../middleware/errors.js";

const router = Router();

// POST /api/generate  { text, count? }  ->  { title, cards, quiz }
router.post("/", async (req, res, next) => {
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
      // Log which field failed so bad model output is easy to debug.
      console.error(
        "Model output rejected:",
        JSON.stringify(result.error.issues[0]),
      );
      throw new HttpError(
        502,
        "BAD_OUTPUT",
        "The AI answered in an unexpected format. Please try again.",
      );
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

export default router;
