# Recall - notes to flashcards and quizzes

Paste notes or a topic. An AI model turns them into structured JSON, and the app renders that as flip-through flashcards and a quiz with a "retest what I got wrong" round. It is not a chatbot: the model never talks back in text, it only returns data that the UI is built from.

## Setup

You need Node.js 18 or newer.

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
```

Open `.env` and paste a free Gemini key (https://aistudio.google.com/app/apikey) after `GEMINI_API_KEY=`.

```bash
npm start
```

This starts the Express API on http://localhost:3001 and the Vite dev server on http://localhost:5173. Open the second one.

## How to use it

1. Type or paste notes (10 to 4000 characters), or click a sample topic.
2. Pick how many items you want and press Generate (Ctrl/Cmd + Enter also works).
3. Flip cards with click or Space, move with the arrow keys.
4. Take the quiz, then press "Retest wrong" to go over only the questions you missed.

## Project structure

```
server/
  index.js              app setup: helmet, CORS, rate limit, body limit
  routes/generate.js    POST /api/generate
  lib/prompt.js         builds the strict JSON prompt
  lib/llm.js            calls Gemini (timeout, error mapping, JSON extraction)
  lib/schemas.js        zod schemas for the request and the model's answer
  middleware/errors.js  safe error responses, no stack traces
src/
  hooks/useGenerate.js  request lifecycle, cancellation, stale-response guard
  lib/api.js            the only place the browser talks to our server
  lib/validateResult.js checks the shape before anything renders
  components/           Hero, PromptInput, FlashcardDeck, Quiz, Loading/Error/Empty states, SmoothScroll
```

## Handling bad AI output

| Problem           | What happens                                                              |
| ----------------- | ------------------------------------------------------------------------- |
| Malformed JSON    | Server fails to parse it, returns a clear error, UI shows Retry           |
| Wrong shape       | zod on the server and `validateResult` in the browser reject it           |
| Some items broken | Broken cards or questions are dropped, the rest still render              |
| Empty answer      | Treated as a failure, not an empty result                                 |
| Slow answer       | 30s timeout on the server, 40s on the client, both show an error          |
| Failed request    | Network and provider errors map to readable messages with Retry           |
| Stale response    | Each request gets an id and an AbortController; older answers are ignored |

## Security notes

- API key stays in `.env` on the server and is never sent to the browser.
- `helmet` security headers, CORS limited to the client origin, 16kb body limit.
- Rate limit of 10 requests per minute per IP on `/api`.
- All input validated with zod. User notes are wrapped in tags and labelled as data in the prompt to blunt prompt injection.
- Errors are logged on the server but only generic messages go to the client.
- No login, since the assignment says authentication is not needed.

## AI usage note

I used Claude to help scaffold the project and draft the initial code. I read through and tested everything, and I can explain the request flow, the validation, and the stale-response guard.

## Known limitations

- No streaming; the whole set arrives at once.
- Sessions are not saved, refreshing loses the current set.
- Rate limiting is per IP and in memory, so it resets when the server restarts.
- Quality depends on the model; very short topics give shallower questions.

## Time spent

4 hours

## What I would do next

Streaming the result, follow-up prompts that edit the set, saving sessions to localStorage, dark/light toggle, and tests for `validateResult`.

## Troubleshooting

- **Gemini 404:** the model name is wrong or retired. Set `GEMINI_MODEL` in `.env` (for example `gemini-flash-latest`) and restart.
- **Gemini 503 "high demand":** temporary. The server retries once with `GEMINI_FALLBACK_MODEL`, then shows a "busy" message with Retry.
- **Changes to `.env` are ignored:** restart `npm start`; the server only reads it on startup.
