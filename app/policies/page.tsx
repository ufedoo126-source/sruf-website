import Link from "next/link";
import type { Metadata } from "next";
import { policies, policiesUpdated } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Policies — SRUF",
};

export default function PoliciesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <Link href="/" className="text-muted text-xs uppercase tracking-[0.2em] hover:text-white">
        ← Back to shop
      </Link>

      <h1 className="font-display mt-8 text-6xl md:text-7xl">Policies</h1>
      <p className="text-muted mt-2 text-sm">Last updated {policiesUpdated}</p>

      <nav className="my-10 flex flex-wrap gap-2">
        {policies.map((p) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className="border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted transition hover:text-white"
          >
            {p.title}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-12">
        {policies.map((p) => (
          <section key={p.id} id={p.id} className="scroll-mt-20">
            <h2 className="font-display mb-4 text-4xl">{p.title}</h2>
            <div className="text-muted flex flex-col gap-3 leading-relaxed">
              {p.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}