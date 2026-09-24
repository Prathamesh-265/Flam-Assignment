// The only file that talks to our backend. The browser never calls the
// AI provider directly, so the API key stays on the server.
export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export async function generateStudySet({ text, count }, signal) {
  let res;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, count }),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK",
    );
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      body?.error || "Something went wrong. Please try again.",
      body?.code || "FAILED",
    );
  }
  return body;
}
