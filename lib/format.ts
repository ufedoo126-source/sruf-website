import { USD_RATE } from "./site";
import type { Currency } from "./types";

export function formatPrice(priceNGN: number, currency: Currency): string {
  if (currency === "NGN") return "₦" + priceNGN.toLocaleString("en-NG");
  return "$" + (priceNGN / USD_RATE).toFixed(2);
}