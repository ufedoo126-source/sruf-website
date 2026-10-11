import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  onSelect: (filter: string) => void;
};

export default function CategoryTiles({ categories, onSelect }: Props) {
  if (categories.length === 0) return null;

  return (
    <section id="collections" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
      <h2 className="font-display text-5xl md:text-6xl">Collections</h2>
      <p className="text-muted mb-10 mt-2">Shop by category.</p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden border border-line bg-surface-2 p-4 text-left"
          >
            <span className="font-display pointer-events-none absolute -right-2 top-2 text-8xl leading-none text-white/5 transition group-hover:text-white/10">
              SRUF
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-[#27479e]/40 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative">
              <h3 className="font-display text-3xl leading-none">{c.name}</h3>
              {c.blurb && <p className="text-muted mt-1 text-sm">{c.blurb}</p>}
              <span className="text-brand-light mt-3 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] transition group-hover:translate-x-1">
                Shop now →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}