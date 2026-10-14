import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Incoming = {
  items?: { productId?: string; size?: string; color?: string | null; qty?: number }[];
  name?: string;
  phone?: string;
  email?: string;
  fulfilment?: string;
  address?: string;
  city?: string;
  country?: string;
  note?: string;
  acceptedTerms?: boolean;
};

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Incoming;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.");
  }

  // 1. Check the customer details
  const name = clean(body.name, 100);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 120).toLowerCase();
  const fulfilment = body.fulfilment === "pickup" ? "pickup" : body.fulfilment === "delivery" ? "delivery" : "";
  const note = clean(body.note, 500);

  if (!name) return bad("Please enter your name.");
  if (phone.replace(/\D/g, "").length < 7) return bad("Please enter a valid phone number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Please enter a valid email address.");
  if (!fulfilment) return bad("Choose delivery or pickup.");
  if (body.acceptedTerms !== true) return bad("Please accept our policies before paying.");

  let deliveryAddress: string | null = null;
  if (fulfilment === "delivery") {
    const address = clean(body.address, 200);
    const city = clean(body.city, 80);
    const country = clean(body.country, 80);
    if (!address || !city || !country) return bad("Please fill in your full delivery address.");
    deliveryAddress = [address, city, country].join(", ");
  }

  // 2. Check the items
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return bad("Your bag is empty.");

  for (const i of items) {
    if (
      typeof i.productId !== "string" ||
      typeof i.size !== "string" ||
      !Number.isInteger(i.qty) ||
      (i.qty as number) < 1 ||
      (i.qty as number) > 20 ||
      (i.color !== undefined && i.color !== null && typeof i.color !== "string")
    ) {
      return bad("Something is wrong with your bag. Please refresh and try again.");
    }
  }

  // 3. Look up REAL prices, sizes and colours from the database (never trust the browser)
  const ids = [...new Set(items.map((i) => i.productId as string))];
  const { data: prods, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("id, name, price_ngn, sizes, colors, active")
    .in("id", ids);

  if (prodErr || !prods) return bad("Could not check your items. Please try again.", 500);

  const lines = [];
  let subtotal = 0;
  for (const i of items) {
    const p = prods.find((x) => x.id === i.productId);
    if (!p || !p.active || !p.sizes.includes(i.size as string)) {
      return bad("Some items in your bag are no longer available. Please remove them and try again.");
    }

    const colors = (p.colors ?? []) as { name: string }[];
    const chosen = typeof i.color === "string" && i.color.trim() ? i.color.trim() : null;
    if (colors.length > 0) {
      if (!chosen || !colors.some((c) => c.name === chosen)) {
        return bad(`Please choose a colour for ${p.name}.`);
      }
    } else if (chosen) {
      return bad("Some items in your bag are no longer available. Please remove them and try again.");
    }

    const price = Number(p.price_ngn);
    subtotal += price * (i.qty as number);
    lines.push({
      product_id: p.id,
      name: p.name,
      size: i.size,
      color: chosen,
      qty: i.qty,
      price_ngn: price,
    });
  }

  // 4. Save the order as "pending payment", with the time the policies were accepted
  const reference = `SRUF-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

  const { error: insErr } = await supabaseAdmin.from("orders").insert({
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    fulfilment,
    delivery_address: deliveryAddress,
    note: note || null,
    items: lines,
    subtotal_ngn: subtotal,
    status: "pending_payment",
    paystack_reference: reference,
    terms_accepted_at: new Date().toISOString(),
  });
  if (insErr) return bad("Could not save your order. Please try again.", 500);

  // 5. Ask Paystack for a payment link
  const origin = new URL(req.url).origin;
  let json: { status?: boolean; message?: string; data?: { authorization_url?: string } } | null = null;
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(subtotal * 100), // Paystack wants kobo
        currency: "NGN",
        reference,
        callback_url: `${origin}/order/complete`,
        metadata: { customer_name: name, phone, fulfilment },
      }),
    });
    json = await res.json();
  } catch {
    json = null;
  }

  if (!json?.status || !json.data?.authorization_url) {
    await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("paystack_reference", reference);
    return bad("Could not start the payment. Please try again.", 502);
  }

  return NextResponse.json({ url: json.data.authorization_url });
}