import { z } from "zod";

// What the browser is allowed to send us.
export const inputSchema = z.object({
  text: z
    .string({ required_error: "Add some notes or a topic first." })
    .trim()
    .min(10, "Add a bit more (at least 10 characters).")
    .max(4000, "Keep it under 4000 characters."),
  count: z.number().int().min(3).max(12).default(6),
});

// What we accept back from the model. Anything else is treated as a failure.
const card = z.object({
  question: z.string().trim().min(1).max(400),
  answer: z.string().trim().min(1).max(800),
});

const quizQuestion = z.object({
  question: z.string().trim().min(1).max(400),
  options: z.array(z.string().trim().min(1).max(300)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().max(600).default(""),
});

export const outputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  cards: z.array(card).min(1).max(20),
  quiz: z.array(quizQuestion).min(1).max(20),
});
