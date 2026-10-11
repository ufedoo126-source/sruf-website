import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderEmails } from "@/lib/email";

type OrderItem = { name: string; size: string; qty: number; price_ngn: number };

const ok = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  // 1. Make sure this really came from Paystack. They sign every message with your secret key.
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(raw)
    .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  // 2. We only care about successful payments
  if (event.event !== "charge.success") return ok();

  const tx = event.data;
  const reference: string | undefined = tx?.reference;
  if (!reference) return ok();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (!order || order.status !== "pending_payment") return ok(); // unknown, or already handled

  // 3. The amount paid must match the order
  if (tx.currency !== "NGN" || Number(tx.amount) !== Math.round(Number(order.subtotal_ngn) * 100)) {
    console.error("Webhook amount mismatch for", reference);
    return ok();
  }

  // 4. Mark paid. Only the request that really changes the row sends the emails.
  const { data: changed } = await supabaseAdmin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id)
    .eq("status", "pending_payment")
    .select("id");

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

  return ok();
}