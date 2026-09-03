import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <div className="empty-state" style={{ marginBlock: 100 }}>
        <p className="eyebrow">404</p>
        <h3>We could not find that page</h3>
        <p>The item may have moved or may no longer be available.</p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <Link className="button button-primary" href="/">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
