import { getFaqs } from "../../lib/bff";

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <main className="shell">
      <header className="page-hero">
        <p className="eyebrow">Help centre</p>
        <h1>Frequently asked questions</h1>
        <p>
          Clear answers about ordering, delivery and the Dalizebo experience.
        </p>
      </header>
      {faqs.length > 0 ? (
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.id}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginBottom: 86 }}>
          <h3>Help content is reconnecting</h3>
          <p>Please check again shortly.</p>
        </div>
      )}
    </main>
  );
}
