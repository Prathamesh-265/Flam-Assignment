import { useEffect, useState } from "react";

const MESSAGES = [
  "Reading your notes...",
  "Picking out the key ideas...",
  "Writing questions...",
  "Making wrong answers convincing...",
];

export default function LoadingState() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="state loading" role="status">
      <div className="dots">
        <span />
        <span />
        <span />
      </div>
      <h2>{MESSAGES[i]}</h2>
      <div className="skeleton" />
    </div>
  );
}
