import { formatPrice } from "@/lib/format";
import type { Category, Currency, Product } from "@/lib/types";

type Props = {
  products: Product[];
  categories: Category[];
  filter: string;
  currency: Currency;
  onFilter: (filter: string) => void;
  onPick: (product: Product) => void;
};

export default function ProductGrid({ products, categories, filter, currency, onFilter, onPick }: Props) {
  const pills = [{ id: "all", name: "All" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <section id="shop" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 md:px-8">
      <h2 className="font-display mb-6 text-5xl md:text-6xl">The Shop</h2>

      <div className="mb-8 flex flex-wrap gap-2">
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => onFilter(p.id)}
            className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
              filter === p.id ? "bg-brand text-white" : "border border-line text-muted hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-muted py-16 text-center">Nothing here yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
          {products.map((p) => (
            <article key={p.id}>
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface-2">
                {p.image_urls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_urls[0]} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-7xl text-white/10">SRUF</span>
                )}
                {p.tag && (
                  <span className="bg-brand absolute left-2 top-2 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {p.tag}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold">{p.name}</h3>
              <p className="text-muted text-sm">{formatPrice(p.price_ngn, currency)}</p>
              <button onClick={() => onPick(p)} className="btn-outline btn-sm mt-3 w-full">
                Add to bag
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}