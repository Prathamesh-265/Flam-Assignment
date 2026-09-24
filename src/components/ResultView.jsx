import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import FlashcardDeck from "./FlashcardDeck";
import Quiz from "./Quiz";

export default function ResultView({ data }) {
  const { title, cards, quiz } = data;
  const root = useRef(null);

  // Only offer tabs for what the model actually gave us.
  const tabs = [
    cards.length > 0 && { id: "cards", label: `Flashcards (${cards.length})` },
    quiz.length > 0 && { id: "quiz", label: `Quiz (${quiz.length})` },
  ].filter(Boolean);
  const [active, setActive] = useState(tabs[0].id);

  // gsap.context puts the element back to normal if React re-runs the effect.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(root.current, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="result" ref={root}>
      <h2 className="result-title">{title}</h2>

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={active} className="tab-panel">
        {active === "cards" ? (
          <FlashcardDeck cards={cards} />
        ) : (
          <Quiz questions={quiz} />
        )}
      </div>
    </div>
  );
}
