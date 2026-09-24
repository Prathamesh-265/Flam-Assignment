export default function EmptyState() {
  return (
    <div className="state empty">
      <div className="ghost-cards" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h2>Your study set will show up here</h2>
      <p>Add notes above and press Generate.</p>
    </div>
  );
}
