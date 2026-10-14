"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreShell";
import { formatPrice } from "@/lib/format";
import { coverImage, isSoldOut } from "@/lib/product";
import type { Category, Product } from "@/lib/types";

type Props = {
  product: Product;
  category: Category | null;
  related: Product[];
};

export default function ProductView({ product, category, related }: Props) {
  const { currency, addToCart } = useStore();

  const hasColors = product.colors.length > 0;
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const color = hasColors ? product.colors[colorIdx] : null;
  // Show the chosen colour's photos, or the main photos if that colour has none
  const gallery = color && color.images.length > 0 ? color.images : product.image_urls;
  const current = gallery[imgIdx] ?? gallery[0] ?? null;

  const paragraphs = (product.description ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const soldOut = isSoldOut(product);
  const canAdd = !soldOut && size !== "";

  function add() {
    if (!canAdd) return;
    addToCart(product, size, color ? color.name : null, qty);
  }

  const labelClass = "text-muted mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em]";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <Link
        href={category ? `/?cat=${category.id}#shop` : "/#shop"}
        className="text-muted text-xs uppercase tracking-[0.2em] hover:text-white"
      >
        ← {category ? category.name : "Back to shop"}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface-2">
            {current ? (
              <img src={current} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-8xl text-white/10">SRUF</span>
            )}
            {product.tag && (
              <span className="bg-brand absolute left-3 top-3 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                {product.tag}
              </span>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {gallery.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`h-20 w-16 overflow-hidden border-2 ${
                    (gallery[imgIdx] ?? gallery[0]) === url ? "border-[var(--text)]" : "border-line"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="font-display text-5xl leading-none md:text-6xl">{product.name}</h1>
          <p className="mt-3 text-xl">{formatPrice(product.price_ngn, currency)}</p>

          {hasColors && (
            <div className="mt-8">
              <span className={labelClass}>Colour: {color?.name}</span>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setColorIdx(i);
                      setImgIdx(0);
                    }}
                    aria-label={c.name}
                    title={c.name}
                    className={`h-9 w-9 rounded-full border-2 transition ${
                      i === colorIdx ? "scale-110 border-[var(--text)]" : "border-line"
                    }`}
                    style={{ background: c.hex, boxShadow: "inset 0 0 0 2px var(--bg)" }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <span className={labelClass}>Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-14 px-4 py-3 text-sm font-semibold transition ${
                    size === s ? "bg-brand text-white" : "border border-line text-muted hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <span className={labelClass}>Quantity</span>
            <div className="inline-flex items-center border border-line">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2" aria-label="Decrease">
                −
              </button>
              <span className="min-w-10 text-center">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} className="px-4 py-2" aria-label="Increase">
                +
              </button>
            </div>
          </div>

          <button onClick={add} disabled={!canAdd} className="btn-primary mt-8 w-full">
            {soldOut
              ? "Sold out"
              : size
              ? `Add to bag — ${formatPrice(product.price_ngn * qty, currency)}`
              : "Choose a size"}
          </button>

          <p className="text-muted mt-3 text-xs">
            All sales are final, so please check your size before ordering. See our{" "}
            <Link href="/policies#returns" className="text-brand-light underline">
              returns policy
            </Link>
            .
          </p>

          {paragraphs.length > 0 && (
            <div className="mt-10 border-t border-line pt-8">
              <h2 className="font-display mb-4 text-3xl">About this piece</h2>
              <div className="text-muted flex flex-col gap-3 leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {product.details.length > 0 && (
            <dl className="mt-8 border-t border-line">
              {product.details.map((line, i) => {
                const at = line.indexOf(":");
                const label = at > 0 ? line.slice(0, at).trim() : "";
                const value = at > 0 ? line.slice(at + 1).trim() : line;
                return (
                  <div key={i} className="flex gap-4 border-b border-line py-3 text-sm">
                    {label && <dt className="w-28 shrink-0 font-semibold">{label}</dt>}
                    <dd className="text-muted">{value}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display mb-6 text-4xl md:text-5xl">
            More{category ? ` from ${category.name}` : ""}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
            {related.map((p) => {
              const img = coverImage(p);
              return (
                <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                  <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface-2">
                    {img ? (
                      <img src={img} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="font-display text-6xl text-white/10">SRUF</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{p.name}</h3>
                  <p className="text-muted text-sm">{formatPrice(p.price_ngn, currency)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}