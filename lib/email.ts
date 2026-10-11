import { formatPrice } from "./format";
import { store } from "./store";

type OrderItem = { name: string; size: string; qty: number; price_ngn: number };

export type OrderForEmail = {
  paystack_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment: string;
  delivery_address: string | null;
  note: string | null;
  items: OrderItem[];
  subtotal_ngn: number | string;
};

// Stops customer-typed text from breaking the email's HTML
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is missing, so no email was sent.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "SRUF <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`Email to ${to} failed:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`Email to ${to} failed:`, err);
  }
}

function itemRows(items: OrderItem[]): string {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">${esc(it.name)}<br><span style="color:#6b7280;font-size:13px;">Size ${esc(it.size)} × ${it.qty}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatPrice(it.price_ngn * it.qty, "NGN")}</td>
      </tr>`
    )
    .join("");
}

function wrap(inner: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;">
    <div style="font-size:28px;font-weight:800;letter-spacing:4px;margin-bottom:24px;">SRUF</div>
    ${inner}
  </div>`;
}

export async function sendOrderEmails(order: OrderForEmail): Promise<void> {
  const total = formatPrice(Number(order.subtotal_ngn), "NGN");
  const firstName = esc(order.customer_name.split(" ")[0]);
  const items = order.items;

  const fulfilmentCustomer =
    order.fulfilment === "delivery"
      ? `<p>Your order will be delivered to:<br><strong>${esc(order.delivery_address ?? "")}</strong></p>
         <p>Your assigned rider will contact you on ${esc(order.customer_phone)} with the delivery fee.</p>`
      : `<p>Pickup at: <strong>${esc(store.pickupAddress)}</strong>${store.pickupHours ? `<br>${esc(store.pickupHours)}` : ""}</p>
         <p>We will contact you on ${esc(order.customer_phone)} when your order is ready.</p>`;

  const customerHtml = wrap(`
    <h1 style="font-size:22px;margin:0 0 8px;">Thank you, ${firstName}.</h1>
    <p style="margin:0 0 20px;color:#4b5563;">We have received your payment.</p>
    <p style="margin:0 0 16px;">Order number: <strong>${esc(order.paystack_reference)}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      ${itemRows(items)}
      <tr>
        <td style="padding:12px 0;font-weight:bold;">Total paid</td>
        <td style="padding:12px 0;text-align:right;font-weight:bold;">${total}</td>
      </tr>
    </table>
    ${fulfilmentCustomer}
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Questions? Just reply to this email.</p>
  `);

  const adminHtml = wrap(`
    <h1 style="font-size:22px;margin:0 0 16px;">New paid order</h1>
    <p style="margin:0 0 4px;">Order number: <strong>${esc(order.paystack_reference)}</strong></p>
    <p style="margin:0 0 4px;">Customer: <strong>${esc(order.customer_name)}</strong></p>
    <p style="margin:0 0 4px;">Phone: ${esc(order.customer_phone)}</p>
    <p style="margin:0 0 16px;">Email: ${esc(order.customer_email ?? "-")}</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      ${itemRows(items)}
      <tr>
        <td style="padding:12px 0;font-weight:bold;">Total paid (items only)</td>
        <td style="padding:12px 0;text-align:right;font-weight:bold;">${total}</td>
      </tr>
    </table>
    <p style="margin-top:16px;"><strong>${order.fulfilment === "delivery" ? "DELIVERY" : "PICKUP"}</strong>${
      order.fulfilment === "delivery" ? `<br>${esc(order.delivery_address ?? "")}<br>Delivery fee still to be sent by the rider.` : ""
    }</p>
    ${order.note ? `<p><strong>Customer note:</strong> ${esc(order.note)}</p>` : ""}
  `);

  const jobs: Promise<void>[] = [];
  if (order.customer_email) {
    jobs.push(send(order.customer_email, `Your SRUF order ${order.paystack_reference}`, customerHtml));
  }
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminTo) {
    jobs.push(
      send(adminTo, `New order ${order.paystack_reference}: ${total}`, adminHtml, order.customer_email ?? undefined)
    );
  }
  await Promise.all(jobs);
}