import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const TOPICS = [
  "Biology",
  "World history",
  "SQL joins",
  "Physics",
  "Spanish verbs",
  "Statistics",
  "Organic chemistry",
  "Marketing",
  "Geography",
  "Algorithms",
];
const COLORS = ["pink", "lime", "sun", "sky"];

// A slow endless ticker of things you could study. The track holds two
// copies of the list, so sliding it by 50% loops seamlessly.
export default function Marquee() {
  const track = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.to(track.current, {
        xPercent: -50,
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  const items = [...TOPICS, ...TOPICS];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={track}>
        {items.map((t, i) => (
          <span key={i} className={`pill ${COLORS[i % COLORS.length]}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
