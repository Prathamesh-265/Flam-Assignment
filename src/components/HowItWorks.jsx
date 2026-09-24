import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    title: "Paste",
    text: "Drop in lecture notes, a chapter, or just a topic name.",
    color: "pink",
  },
  {
    title: "Generate",
    text: "The AI builds flashcards and quiz questions from what you wrote.",
    color: "lime",
  },
  {
    title: "Practise",
    text: "Flip cards, take the quiz, then retest only what you got wrong.",
    color: "sun",
  },
];

export default function HowItWorks() {
  const root = useRef(null);

  // Steps slide up as the section scrolls into view.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".step", {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="how" ref={root}>
      <h2>How it works</h2>
      <div className="steps">
        {STEPS.map((s, i) => (
          <article key={s.title} className={`step ${s.color}`}>
            <span className="step-num">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
