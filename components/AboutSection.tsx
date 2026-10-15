import { aboutParagraphs, aboutTitle } from "@/lib/about";

// Turns **bold** markers into real bold text
function withBold(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold" style={{ color: "var(--text)" }}>
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 border-y border-line bg-surface px-4 py-24 md:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-brand-light mb-4 text-[11px] font-semibold uppercase tracking-[0.3em]">About SRUF</p>
        <h2 className="font-display mb-8 text-5xl md:text-7xl">{aboutTitle}</h2>
        <div className="text-muted flex flex-col gap-5 text-lg leading-relaxed">
          {aboutParagraphs.map((p, i) => (
            <p key={i}>{withBold(p)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}