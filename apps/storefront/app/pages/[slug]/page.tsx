import { notFound } from "next/navigation";
import { getEditorialPage } from "../../../lib/bff";

type Props = { params: Promise<{ slug: string }> };

export default async function EditorialPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getEditorialPage(slug);
  if (!page) notFound();

  return (
    <main className="shell">
      <header className="page-hero">
        <p className="eyebrow">Dalizebo</p>
        <h1>{page.title}</h1>
      </header>
      <article className="content-body">{page.body}</article>
    </main>
  );
}
