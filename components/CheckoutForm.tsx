"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { store } from "@/lib/store";
import type { CartLine, Currency } from "@/lib/types";

type Props = {
  lines: CartLine[];
  currency: Currency;
  totalNGN: number;
  onClose: () => void;
};

const inputClass = "w-full border border-line bg-surface-2 px-3 py-3 text-sm outline-none focus:border-white";
const labelClass = "text-muted mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em]";

export default function CheckoutForm({ lines, currency, totalNGN, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.product.id, size: l.size, qty: l.qty })),
          name,
          phone,
          email,
          fulfilment,
          address,
          city,
          country,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong. Please try again.");
      window.location.href = data.url; // off to Paystack
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/80">
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-lg border border-line bg-surface p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-4xl">Checkout</h2>
          <button onClick={onClose} aria-label="Close checkout" className="text-3xl leading-none">
            ×
          </button>
        </div>

        <ul className="mb-6 border border-line text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-4 border-b border-line p-3">
              <span>
                {l.product.name} · {l.size} × {l.qty}
              </span>
              <span>{formatPrice(l.product.price_ngn * l.qty, currency)}</span>
            </li>
          ))}
          <li className="flex justify-between p-3 font-semibold">
            <span>Items total</span>
            <span>{formatPrice(totalNGN, currency)}</span>
          </li>
        </ul>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Phone number</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>How do you want to get your order?</label>
            <div className="grid grid-cols-2 gap-2">
              {(["delivery", "pickup"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFulfilment(f)}
                  className={`py-3 text-xs font-semibold uppercase tracking-[0.18em] ${
                    fulfilment === f ? "bg-brand text-white" : "border border-line text-muted"
                  }`}
                >
                  {f === "delivery" ? "Delivery" : "Pickup"}
                </button>
              ))}
            </div>
          </div>

          {fulfilment === "delivery" ? (
            <>
              <div>
                <label className={labelClass}>Delivery address</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number and street"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>City / State</label>
                  <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                </div>
              </div>
              <p className="text-muted text-sm">
                Delivery fee is not included. Your assigned rider will contact you with the fee.
              </p>
            </>
          ) : (
            <p className="text-muted border border-line p-3 text-sm">
              Pickup at <span className="text-white">{store.pickupAddress}</span>.
              {store.pickupHours ? ` ${store.pickupHours}.` : ""} We will contact you when your order is ready.
            </p>
          )}

          <div>
            <label className={labelClass}>Note (optional)</label>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Taking you to payment…" : `Pay ${formatPrice(totalNGN, "NGN")} with Paystack`}
          </button>
          <p className="text-muted text-center text-xs">Payments are processed in naira (₦).</p>
        </form>
      </div>
    </div>
  );
}