import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/format";
import { store } from "@/lib/store";
import { sendOrderEmails } from "@/lib/email";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";

type OrderItem = { name: string; size: string; color?: string | null; qty: number; price_ngn: number };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16">
      {children}
    </main>
  );
}

export default async function OrderComplete({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const reference = sp.reference || sp.trxref;

  const { data: order } = reference
    ? await supabaseAdmin.from("orders").select("*").eq("paystack_reference", reference).maybeSingle()
    : { data: null };

  if (!order) {
    return (
      <Shell>
        <h1 className="font-display text-5xl">Order not found</h1>
        <p className="text-muted mt-3">We could not find that order.</p>
        <Link href="/" className="btn-primary mt-8 self-start">
          Back to shop
        </Link>
      </Shell>
    );
  }

  // Ask Paystack directly whether this payment really went through
  let paid = order.status !== "pending_payment" && order.status !== "cancelled";

  if (order.status === "pending_payment") {
    try {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference as string)}`,
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store" }
      );
      const json = await res.json();
      const tx = json?.data;
      if (
        tx?.status === "success" &&
        tx.currency === "NGN" &&
        Number(tx.amount) === Math.round(Number(order.subtotal_ngn) * 100)
      ) {
        // .select() returns the rows that actually changed. If none changed, someone
        // else (a refresh, or later the webhook) already marked it paid and sent the emails.
        const { data: changed } = await supabaseAdmin
          .from("orders")
          .update({ status: "paid" })
          .eq("id", order.id)
          .eq("status", "pending_payment")
          .select("id");

        paid = true;

        if (changed && changed.length > 0) {
          await sendOrderEmails({
            paystack_reference: order.paystack_reference,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_email: order.customer_email,
            fulfilment: order.fulfilment,
            delivery_address: order.delivery_address,
            note: order.note,
            items: order.items as OrderItem[],
            subtotal_ngn: order.subtotal_ngn,
          });
        }
      }
    } catch {
      // leave as unpaid; the page below explains
    }
  }

  const items = order.items as OrderItem[];

  if (!paid) {
    return (
      <Shell>
        <h1 className="font-display text-5xl">Payment not completed</h1>
        <p className="text-muted mt-3">
          We have not received a payment for order {order.paystack_reference}. If you were charged, please contact us
          with this order number.
        </p>
        <Link href="/" className="btn-primary mt-8 self-start">
          Back to shop
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <ClearCart />
      <p className="text-brand-light mb-3 text-[11px] font-semibold uppercase tracking-[0.3em]">Payment received</p>
      <h1 className="font-display text-6xl">Thank you, {order.customer_name.split(" ")[0]}.</h1>
      <p className="text-muted mt-3">
        Order number: <span className="font-semibold text-white">{order.paystack_reference}</span>
      </p>

      <ul className="my-8 border border-line">
        {items.map((it, i) => (
          <li key={i} className="flex justify-between gap-4 border-b border-line p-4 text-sm last:border-b-0">
            <span>
              {it.name} · {it.size}{it.color ? ` · ${it.color}` : ""} × {it.qty}
            </span>
            <span>{formatPrice(it.price_ngn * it.qty, "NGN")}</span>
          </li>
        ))}
        <li className="flex justify-between p-4 text-sm font-semibold uppercase tracking-[0.15em]">
          <span>Total paid</span>
          <span>{formatPrice(Number(order.subtotal_ngn), "NGN")}</span>
        </li>
      </ul>

      {order.fulfilment === "delivery" ? (
        <p className="text-muted">
          Delivery to {order.delivery_address}. Your assigned rider will contact you on {order.customer_phone} with the
          delivery fee.
        </p>
      ) : (
        <p className="text-muted">
          Pickup at {store.pickupAddress}.{store.pickupHours ? ` ${store.pickupHours}.` : ""} We will contact you on{" "}
          {order.customer_phone} when your order is ready.
        </p>
      )}

      <Link href="/" className="btn-primary mt-8 self-start">
        Continue shopping
      </Link>
    </Shell>
  );
}