// The server already validates, but the browser should never trust a
// response blindly either. This checks the shape and drops broken items,
// so a single bad card cannot crash the whole screen.
const isText = (v) => typeof v === "string" && v.trim().length > 0;

const fail = (message) => ({ ok: false, message });

export function validateResult(raw) {
  if (!raw || typeof raw !== "object") {
    return fail("The AI sent back an empty response. Try again.");
  }

  const cards = (Array.isArray(raw.cards) ? raw.cards : [])
    .filter((c) => c && isText(c.question) && isText(c.answer))
    .map((c, i) => ({
      id: `card-${i}`,
      question: c.question.trim(),
      answer: c.answer.trim(),
    }));

  const quiz = (Array.isArray(raw.quiz) ? raw.quiz : [])
    .filter(
      (q) =>
        q &&
        isText(q.question) &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every(isText) &&
        Number.isInteger(q.answerIndex) &&
        q.answerIndex >= 0 &&
        q.answerIndex < 4,
    )
    .map((q, i) => ({
      id: `q-${i}`,
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      answerIndex: q.answerIndex,
      explanation: isText(q.explanation) ? q.explanation.trim() : "",
    }));

  if (cards.length === 0 && quiz.length === 0) {
    return fail(
      "The AI answered, but nothing in it was usable. Try again or rephrase your notes.",
    );
  }

  return {
    ok: true,
    data: {
      title: isText(raw.title) ? raw.title.trim() : "Your study set",
      cards,
      quiz,
    },
  };
}
