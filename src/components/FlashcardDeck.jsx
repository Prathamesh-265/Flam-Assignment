import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(() => new Set());

  const scene = useRef(null);
  const inner = useRef(null);
  const direction = useRef(1);

  useEffect(() => {
    gsap.to(inner.current, {
      rotationY: flipped ? 180 : 0,
      duration: 0.6,
      ease: "power3.inOut",
    });
  }, [flipped]);

  // Slide the new card in from the side we are moving towards.
  useEffect(() => {
    gsap.fromTo(
      scene.current,
      { x: direction.current * 70, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
    );
  }, [index]);

  const go = useCallback(
    (step) => {
      direction.current = step;
      gsap.set(inner.current, { rotationY: 0 }); // never flash the next answer
      setFlipped(false);
      setIndex((i) => (i + step + cards.length) % cards.length);
    },
    [cards.length],
  );

  const mark = (isKnown) => {
    const id = cards[index].id;
    setKnown((prev) => {
      const next = new Set(prev);
      if (isKnown) next.add(id);
      else next.delete(id);
      return next;
    });
    go(1);
  };

  // Arrow keys move between cards, space or enter flips.
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  };

  const card = cards[index];

  return (
    <div
      className="deck"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Flashcards. Arrow keys to move, space to flip."
    >
      <div className="deck-meta">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span className="score-chip">
          Known {known.size}/{cards.length}
        </span>
      </div>

      <div className="deck-slide" ref={scene}>
        <div className="flip-scene big" onClick={() => setFlipped((f) => !f)}>
          <div className="flip-inner" ref={inner}>
            <div className="face front">
              <span>{card.question}</span>
              <small>Click or press space to flip</small>
            </div>
            <div className="face back">
              <span>{card.answer}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="deck-controls">
        <button className="btn" onClick={() => go(-1)}>
          Previous
        </button>
        <button className="btn pink" onClick={() => mark(false)}>
          Review again
        </button>
        <button className="btn lime" onClick={() => mark(true)}>
          Got it
        </button>
        <button className="btn" onClick={() => go(1)}>
          Next
        </button>
      </div>
    </div>
  );
}
