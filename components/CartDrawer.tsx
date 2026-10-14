import { formatPrice } from "@/lib/format";
import { coverImage } from "@/lib/product";
import type { CartLine, Currency } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  currency: Currency;
  totalNGN: number;
  onChange: (key: string, delta: number) => void;
  onCheckout: () => void;
};

export default function CartDrawer({ open, onClose, lines, currency, totalNGN, onChange, onCheckout }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/70 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-surface transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-6">
          <h2 className="font-display text-3xl">Your Bag</h2>
          <button onClick={onClose} aria-label="Close bag" className="text-3xl leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {lines.length === 0 ? (
            <p className="text-muted">Your bag is empty.</p>
          ) : (
            <ul className="flex flex-col gap-5">
              {lines.map(({ key, product, size, color, qty }) => {
                const img = coverImage(product, color);
                return (
                  <li key={key} className="flex gap-4">
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden bg-surface-2">
                      {img ? (
                        <img src={img} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-2xl text-white/10">SRUF</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-muted text-sm">
                        {color ? `${color} · ` : ""}Size: {size} · {formatPrice(product.price_ngn, currency)}
                      </p>
                      <div className="mt-3 inline-flex items-center border border-line">
                        <button onClick={() => onChange(key, -1)} className="px-3 py-1" aria-label="Decrease">
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{qty}</span>
                        <button onClick={() => onChange(key, 1)} className="px-3 py-1" aria-label="Increase">
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-line p-6">
          <div className="mb-4 flex justify-between text-sm font-semibold uppercase tracking-[0.15em]">
            <span>Total</span>
            <span>{formatPrice(totalNGN, currency)}</span>
          </div>
          <button disabled={lines.length === 0} onClick={onCheckout} className="btn-primary w-full">
            Proceed to checkout
          </button>
          <p className="text-muted mt-3 text-center text-xs">Delivery fee is confirmed by your rider after you order.</p>
        </div>
      </aside>
    </>
  );
}