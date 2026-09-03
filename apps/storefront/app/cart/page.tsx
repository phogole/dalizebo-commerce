export default function Page() {
  return (
    <main className="shell">
      <header className="page-hero">
        <p className="eyebrow">Your selection</p>
        <h1>Cart</h1>
        <p>
          The server-side cart boundary is ready. Persistent browser cart state
          is the next checkout slice.
        </p>
      </header>
      <div className="empty-state" style={{ marginBottom: 86 }}>
        <h3>Your cart is empty</h3>
        <p>Browse the catalogue to find something worth keeping.</p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <a className="button button-primary" href="/search">
            Browse products
          </a>
        </div>
      </div>
    </main>
  );
}
