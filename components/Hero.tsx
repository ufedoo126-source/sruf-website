export default function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <section
      className="relative flex min-h-[85vh] items-end bg-cover bg-center"
      style={{ backgroundImage: "url(/background.jpeg)", color: "#fff" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/50 to-[#07090f]/30" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
        <span className="mb-5 inline-block border border-white/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] backdrop-blur">
          Becoming Collection 2026 Out Now!!
        </span>
        <h1 className="font-display text-[13vw] leading-[0.85] md:text-[9vw] lg:text-[8.5rem]">
          RESILIENCE
          <br />
          IN STYLE
        </h1>
        <button onClick={onExplore} className="btn-primary mt-8">
          Explore Collection
        </button>
      </div>
    </section>
  );
}