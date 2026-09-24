import { useEffect, useState } from "react";

const MIN_LENGTH = 10;
const MAX_LENGTH = 4000;

// Sample topics. Three are shown at a time, and the set changes every hour.
const POOL = [
  "How REST APIs work",
  "React hooks: useState and useEffect",
  "Git branching and merging",
  "Basics of SQL joins",
  "How JWT authentication works",
  "Big O notation explained",
  "Docker containers vs virtual machines",
  "HTTP status codes",
  "How the JavaScript event loop works",
  "Database indexing and why it speeds up queries",
  "Cross-site scripting (XSS) and how to prevent it",
  "What is a CI/CD pipeline",
  "The causes of World War I",
  "How photosynthesis works",
  "Supply and demand basics",
];

function samplesForHour(date = new Date()) {
  const localMs = date.getTime() - date.getTimezoneOffset() * 60_000;
  const hourIndex = Math.floor(localMs / 3_600_000);
  const start = (hourIndex * 3) % POOL.length;
  return [0, 1, 2].map((i) => POOL[(start + i) % POOL.length]);
}

export default function PromptInput({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [count, setCount] = useState(6);
  const [samples, setSamples] = useState(() => samplesForHour());

 
  useEffect(() => {
    let timer;
    const schedule = () => {
      const now = new Date();
      const msLeft =
        3_600_000 -
        (now.getMinutes() * 60 + now.getSeconds()) * 1000 -
        now.getMilliseconds();
      timer = setTimeout(() => {
        setSamples(samplesForHour());
        schedule();
      }, msLeft);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const tooShort = text.trim().length < MIN_LENGTH;


  const submit = (e) => {
    e?.preventDefault();
    if (tooShort) return;
    onSubmit({ text: text.trim(), count });
  };

  // Ctrl/Cmd + Enter submits without leaving the keyboard.
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
  };

  return (
    <form className="prompt" onSubmit={submit}>
      <h2>Drop your notes</h2>
      <textarea
        id="notes"
        aria-label="Your notes or topic"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MAX_LENGTH}
        rows={6}
        placeholder="Paste lecture notes, or just type a topic..."
      />

      <div className="samples">
        <span>Try:</span>
        {samples.map((s) => (
          <button
            type="button"
            key={s}
            className="chip"
            onClick={() => setText(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="prompt-bar">
        <label className="count">
          Items
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {[4, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span className="hint">
          {text.length}/{MAX_LENGTH}
        </span>
        <button className="btn primary" type="submit" disabled={tooShort}>
          {loading ? "Generating... (click to restart)" : "Generate study set"}
        </button>
      </div>
    </form>
  );
}
