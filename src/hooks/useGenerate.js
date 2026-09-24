import { useCallback, useRef, useState } from "react";
import { generateStudySet } from "../lib/api";
import { validateResult } from "../lib/validateResult";

const TIMEOUT_MS = 40_000;

// Owns the request lifecycle: idle -> loading -> success | error.
export function useGenerate() {
  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null,
    version: 0,
  });

  const requestId = useRef(0); // lets us ignore answers from older requests
  const controller = useRef(null);
  const lastInput = useRef(null);

  const run = useCallback(async (input) => {
    lastInput.current = input;

    // A newer request cancels the one still in flight.
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    const id = ++requestId.current;

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, TIMEOUT_MS);

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const raw = await generateStudySet(input, ctrl.signal);
      if (id !== requestId.current) return; // stale response, drop it

      const checked = validateResult(raw);
      if (!checked.ok) {
        setState((prev) => ({
          ...prev,
          status: "error",
          data: null,
          error: checked.message,
        }));
        return;
      }
      setState((prev) => ({
        status: "success",
        data: checked.data,
        error: null,
        version: prev.version + 1,
      }));
    } catch (err) {
      if (id !== requestId.current) return;
      const message = timedOut
        ? "This is taking too long. Try again in a moment."
        : err.message;
      setState((prev) => ({
        ...prev,
        status: "error",
        data: null,
        error: message,
      }));
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastInput.current) run(lastInput.current);
  }, [run]);

  return { ...state, run, retry };
}
