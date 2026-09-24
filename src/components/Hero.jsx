import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const SAMPLES = [
  {
    q: "Why does ice float on water?",
    a: "Frozen water is less dense than liquid water.",
    color: "pink",
  },
  {
    q: "What does a SQL JOIN do?",
    a: "Combines rows from two tables using a shared column.",
    color: "lime",
  },
  {
    q: "What set off World War I?",
    a: "The 1914 assassination of Archduke Franz Ferdinand.",
    color: "sun",
  },
];

const TILTS = [-7, 4, -3];

export default function Hero() {
  const root = useRef(null);

  // One orchestrated entrance: headline rises, cards deal out like a hand.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-line", { yPercent: 115, duration: 1, stagger: 0.12 })
        .from(
          ".hero-sub, .hero-cta",
          { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 },
          "-=0.5",
        )
        .fromTo(
          ".hero-card",
          { y: 120, opacity: 0, rotate: 0 },
          {
            y: 0,
            opacity: 1,
            rotate: (i) => TILTS[i],
            duration: 0.9,
            stagger: 0.14,
            ease: "back.out(1.5)",
          },
          0.3,
        );
    }, root);
    return () => ctx.revert();
  }, []);

  const flip = (e) => {
    const card = e.currentTarget;
    const flipped = card.dataset.flipped === "true";
    card.dataset.flipped = String(!flipped);
    gsap.to(card.querySelector(".flip-inner"), {
      rotationY: flipped ? 0 : 180,
      duration: 0.6,
      ease: "power3.inOut",
    });
  };

  const goToInput = () => {
    const box = document.getElementById("notes");
    box?.scrollIntoView({ behavior: "smooth", block: "center" });
    box?.focus({ preventScroll: true });
  };

  return (
    <header className="hero" ref={root}>
      <div className="hero-copy">
        <p className="brand">Recall</p>
        <h1>
          <span className="line-mask">
            <span className="hero-line">Notes in.</span>
          </span>
          <span className="line-mask">
            <span className="hero-line">Practice out.</span>
          </span>
        </h1>
        <p className="hero-sub">
          Paste what you are studying. Get flashcards to flip, a quiz to take,
          and a retest on everything you missed.
        </p>
        <button className="btn primary hero-cta" onClick={goToInput}>
          Start studying
        </button>
      </div>

      <div className="hero-stack" aria-label="Sample flashcards, click to flip">
        {SAMPLES.map((s) => (
          <button
            key={s.q}
            className={`hero-card flip-scene ${s.color}`}
            onClick={flip}
            data-flipped="false"
          >
            <div className="flip-inner">
              <div className="face front">
                <span>{s.q}</span>
              </div>
              <div className="face back">
                <span>{s.a}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </header>
  );
}
