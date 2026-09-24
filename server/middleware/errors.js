// A small error type so routes can say what went wrong and which status code the client should see.
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(_req, _res, next) {
  next(new HttpError(404, "NOT_FOUND", "That route does not exist."));
}

// send a safe message to the client (no stack traces, no provider details).
export function errorHandler(err, _req, res, _next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Request body is not valid JSON.",
      code: "INVALID_INPUT",
    });
  }
  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ error: "Request is too large.", code: "INVALID_INPUT" });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  console.error("Unexpected error:", err.message);
  res
    .status(500)
    .json({ error: "Something went wrong on our side.", code: "SERVER_ERROR" });
}
