"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";

type OrderItem = { name: string; size: string; qty: number; price_ngn: number };

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment: "delivery" | "pickup";
  delivery_address: string | null;
  note: string | null;
  items: OrderItem[];
  subtotal_ngn: number | string;
  status: string;
  paystack_reference: string | null;
  rider_name: string | null;
  rider_phone: string | null;
  created_at: string;
};

const STATUSES = [
  { value: "paid", label: "Paid (new)" },
  { value: "processing", label: "Processing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending_payment", label: "Unpaid" },
];

const ACTIVE = ["paid", "processing", "out_for_delivery", "ready_for_pickup"];

type Tab = "active" | "completed" | "other" | "all";

const inputClass = "w-full border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-white";
const labelClass = "text-muted mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em]";

function statusLabel(value: string) {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

// WhatsApp needs the country code. A Nigerian number like 0803... becomes 234803...
function waLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  return `https://wa.me/${digits}`;
}

function OrderCard({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [open, setOpen] = useState(order.status === "paid");
  const [status, setStatus] = useState(order.status);
  const [riderName, setRiderName] = useState(order.rider_name ?? "");
  const [riderPhone, setRiderPhone] = useState(order.rider_phone ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const options = STATUSES.filter((s) => {
    if (s.value === "out_for_delivery") return order.fulfilment === "delivery";
    if (s.value === "ready_for_pickup") return order.fulfilment === "pickup";
    return true;
  });

  async function save() {
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        rider_name: riderName.trim() || null,
        rider_phone: riderPhone.trim() || null,
      })
      .eq("id", order.id);
    setSaving(false);
    if (error) {
      setMsg("Could not save: " + error.message);
      return;
    }
    setMsg("Saved ✓");
    onSaved();
  }

  return (
    <li className="border-b border-line last:border-b-0">
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left">
        <div>
          <p className="font-semibold">
            {order.customer_name}{" "}
            <span className="text-muted text-xs font-normal">
              · {order.fulfilment === "delivery" ? "Delivery" : "Pickup"}
            </span>
          </p>
          <p className="text-muted text-xs">
            {order.paystack_reference} ·{" "}
            {new Date(order.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{formatPrice(Number(order.subtotal_ngn), "NGN")}</span>
          <span
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${
              order.status === "paid" ? "bg-brand text-white" : "border border-line text-muted"
            }`}
          >
            {statusLabel(order.status)}
          </span>
        </div>
      </button>

      {open && (
        <div className="grid gap-6 border-t border-line p-4 md:grid-cols-2">
          <div>
            <p className={labelClass}>Items</p>
            <ul className="mb-4 text-sm">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4 py-1">
                  <span>
                    {it.name} · {it.size} × {it.qty}
                  </span>
                  <span>{formatPrice(it.price_ngn * it.qty, "NGN")}</span>
                </li>
              ))}
            </ul>

            <p className={labelClass}>Customer</p>
            <p className="text-sm">{order.customer_name}</p>
            <p className="text-sm">{order.customer_phone}</p>
            {order.customer_email && <p className="text-sm">{order.customer_email}</p>}
            <div className="mt-2 flex gap-2">
              <a href={`tel:${order.customer_phone}`} className="btn-outline btn-sm">
                Call
              </a>
              <a href={waLink(order.customer_phone)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                WhatsApp
              </a>
            </div>

            {order.fulfilment === "delivery" && (
              <>
                <p className={`${labelClass} mt-4`}>Delivery address</p>
                <p className="text-sm">{order.delivery_address}</p>
              </>
            )}
            {order.note && (
              <>
                <p className={`${labelClass} mt-4`}>Customer note</p>
                <p className="text-sm">{order.note}</p>
              </>
            )}
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mb-4`}>
              {options.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {order.fulfilment === "delivery" && (
              <>
                <label className={labelClass}>Rider name</label>
                <input value={riderName} onChange={(e) => setRiderName(e.target.value)} className={`${inputClass} mb-4`} />
                <label className={labelClass}>Rider phone</label>
                <input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} className={`${inputClass} mb-4`} />
              </>
            )}

            <div className="flex items-center gap-4">
              <button onClick={save} disabled={saving} className="btn-primary btn-sm">
                {saving ? "Saving…" : "Save changes"}
              </button>
              {msg && <span className="text-muted text-sm">{msg}</span>}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("active");

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setError(error.message);
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const counts = {
    active: orders.filter((o) => ACTIVE.includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    other: orders.filter((o) => o.status === "pending_payment" || o.status === "cancelled").length,
    all: orders.length,
  };

  const visible = orders.filter((o) => {
    if (tab === "active") return ACTIVE.includes(o.status);
    if (tab === "completed") return o.status === "completed";
    if (tab === "other") return o.status === "pending_payment" || o.status === "cancelled";
    return true;
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "other", label: "Unpaid / Cancelled" },
    { id: "all", label: "All" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-5xl">Orders</h1>
        <button onClick={load} className="btn-outline btn-sm">
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              tab === t.id ? "bg-brand text-white" : "border border-line text-muted hover:text-white"
            }`}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-muted">No orders here yet.</p>
      ) : (
        <ul className="border border-line">
          {visible.map((o) => (
            <OrderCard key={o.id + o.status} order={o} onSaved={load} />
          ))}
        </ul>
      )}
    </div>
  );
}