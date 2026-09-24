export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state error" role="alert">
      <h2>That did not work</h2>
      <p>{message}</p>
      <button className="btn primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
