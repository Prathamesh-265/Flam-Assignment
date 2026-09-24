import { useState } from "react";

export default function Quiz({ questions }) {
  const [round, setRound] = useState(questions); // the questions in play right now
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);

  const start = (list) => {
    setRound(list);
    setCurrent(0);
    setPicked(null);
    setScore(0);
    setWrong([]);
    setDone(false);
  };

  const choose = (i) => {
    if (picked !== null) return; // already answered
    setPicked(i);
    if (i === round[current].answerIndex) setScore((s) => s + 1);
    else setWrong((w) => [...w, round[current]]);
  };

  const next = () => {
    if (current + 1 < round.length) {
      setCurrent((c) => c + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="quiz-done">
        <p className="big-score">
          {score}
          <span>/{round.length}</span>
        </p>
        <p>
          {wrong.length === 0
            ? "Clean sweep. Nothing left to retest."
            : `${wrong.length} to go over again.`}
        </p>
        <div className="deck-controls">
          {wrong.length > 0 && (
            <button className="btn pink" onClick={() => start(wrong)}>
              Retest {wrong.length} wrong
            </button>
          )}
          <button className="btn" onClick={() => start(questions)}>
            Restart full quiz
          </button>
        </div>
      </div>
    );
  }

  const q = round[current];

  return (
    <div className="quiz">
      <div className="bar">
        <div
          className="bar-fill"
          style={{
            width: `${((current + (picked !== null ? 1 : 0)) / round.length) * 100}%`,
          }}
        />
      </div>
      <p className="deck-meta">
        <span>
          Question {current + 1} of {round.length}
        </span>
      </p>
      {/* key restarts the entrance animation for every new question */}
      <div key={`${round.length}-${current}`} className="question">
        <h3>{q.question}</h3>
        <div className="options">
          {q.options.map((opt, i) => {
            let cls = "option";
            if (picked !== null && i === q.answerIndex) cls += " correct";
            else if (picked === i) cls += " wrong";
            return (
              <button
                key={i}
                className={cls}
                onClick={() => choose(i)}
                disabled={picked !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="feedback">
            <p>
              <strong>
                {picked === q.answerIndex ? "Correct." : "Not quite."}
              </strong>{" "}
              {q.explanation}
            </p>
            <button className="btn primary" onClick={next}>
              {current + 1 < round.length ? "Next question" : "See results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
