"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Currency, Product } from "@/lib/types";

type Props = {
  product: Product;
  currency: Currency;
  onClose: () => void;
  onConfirm: (size: string, qty: number) => void;
};

export default function SizePicker({ product, currency, onClose, onConfirm }: Props) {
  // If a product has only one size (e.g. "One Size"), pre-select it.
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 md:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-line bg-surface p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl leading-none">{product.name}</h3>
            <p className="text-muted mt-1">{formatPrice(product.price_ngn, currency)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-3xl leading-none">
            ×
          </button>
        </div>

        <p className="text-muted mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]">Select size</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`min-w-14 px-4 py-3 text-sm font-semibold transition ${
                size === s ? "bg-brand text-white" : "border border-line text-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <p className="text-muted mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]">Quantity</p>
        <div className="mb-6 inline-flex items-center border border-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2" aria-label="Decrease">
            −
          </button>
          <span className="min-w-10 text-center">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="px-4 py-2" aria-label="Increase">
            +
          </button>
        </div>

        <button disabled={!size} onClick={() => onConfirm(size, qty)} className="btn-primary w-full">
          {size ? `Add to bag — ${formatPrice(product.price_ngn * qty, currency)}` : "Choose a size"}
        </button>
      </div>
    </div>
  );
}