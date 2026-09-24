import { useEffect, useRef } from "react";
import { useGenerate } from "./hooks/useGenerate";
import SmoothScroll from "./components/SmoothScroll";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import PromptInput from "./components/PromptInput";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import ResultView from "./components/ResultView";
import HowItWorks from "./components/HowItWorks";

export default function App() {
  const { status, data, error, version, run, retry } = useGenerate();
  const loading = status === "loading";
  const resultsRef = useRef(null);

  // Bring the results into view as soon as a request starts.
  useEffect(() => {
    if (loading)
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [loading]);

  return (
    <>
      <SmoothScroll />
      <div className="page">
        <Hero />
      </div>
      <Marquee />

      <main className="page">
        <PromptInput onSubmit={run} loading={loading} />

        <section className="results" ref={resultsRef} aria-live="polite">
          {status === "idle" && <EmptyState />}
          {loading && <LoadingState />}
          {status === "error" && <ErrorState message={error} onRetry={retry} />}
          {status === "success" && <ResultView key={version} data={data} />}
        </section>

        <HowItWorks />
        <footer className="footer">
          Answers come from an AI model, so double-check anything important.
        </footer>
      </main>
    </>
  );
}
