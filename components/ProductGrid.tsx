import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { coverImage } from "@/lib/product";
import type { Category, Currency, Product } from "@/lib/types";

type Props = {
  products: Product[];
  categories: Category[];
  filter: string;
  currency: Currency;
  onFilter: (filter: string) => void;
};

export default function ProductGrid({ products, categories, filter, currency, onFilter }: Props) {
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
          {products.map((p) => {
            const img = coverImage(p);
            return (
              <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface-2">
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
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
                {p.colors.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {p.colors.slice(0, 5).map((c) => (
                      <span
                        key={c.name}
                        title={c.name}
                        className="h-3 w-3 rounded-full border border-line"
                        style={{ background: c.hex }}
                      />
                    ))}
                    {p.colors.length > 5 && <span className="text-muted text-xs">+{p.colors.length - 5}</span>}
                  </div>
                )}
                <span className="text-brand-light mt-3 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] transition group-hover:translate-x-1">
                  View product →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}