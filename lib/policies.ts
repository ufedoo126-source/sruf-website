import { store } from "./store";

export const policiesUpdated = "October 2026";

// Returns and Sizing follow what the client said. The other sections are
// starting drafts that she should confirm (especially Delivery).
export const policies: { id: string; title: string; body: string[] }[] = [
  {
    id: "orders-payment",
    title: "Orders and payment",
    body: [
      "All prices are in Nigerian naira (₦). If you view prices in US dollars, that is for reference only. Your payment is always charged in naira.",
      "Payments are processed securely by Paystack. We never see or store your card details.",
      "Your order is confirmed once your payment is received, and you will receive a confirmation with your order number.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    body: [
      "The delivery fee is not included in your order total. After you order, your assigned rider will contact you on the phone number you provided to confirm the delivery fee and arrange delivery.",
      "Please make sure your phone number and address are correct and that you can be reached. We are not responsible for delays or failed deliveries caused by incorrect or incomplete details.",
      "We deliver within Nigeria and internationally. Delivery fees and times depend on your location, and we will give you an estimated delivery time when we contact you.",
    ],
  },
  {
    id: "pickup",
    title: "Pickup",
    body: [
      `Pickup is available at ${store.pickupAddress}.${store.pickupHours ? ` ${store.pickupHours}.` : ""}`,
      "We will contact you when your order is ready. Please bring your order number.",
    ],
  },
  {
    id: "returns",
    title: "Returns",
    body: [
      "All sales are final. We do not accept returns after a purchase, except where the fault is on our side, for example a faulty or damaged item, or an item that is different from what you ordered.",
      "If this happens, contact us with your order number and photos so we can put it right.",
      "Please be sure of your size before placing an order. We cannot accept returns because of a wrong size choice.",
    ],
  },
  {
    id: "sizing",
    title: "Sizing",
    body: [
      "Our sizes run from S to XXL, and some items (such as caps) come in one size. Fit can vary between products.",
      "Please check your size carefully before ordering, as wrong-size orders cannot be returned. If you are unsure, contact us before you order.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "We collect your name, phone number, email and delivery address only to process and deliver your order and to contact you about it.",
      "Payments are handled by Paystack. We share your details with our delivery riders only as needed to deliver your order. We do not sell your information.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about your order? Reply to your order confirmation or message us through the social pages linked at the bottom of the site.",
    ],
  },
];