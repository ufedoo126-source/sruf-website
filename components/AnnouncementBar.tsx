import type { Currency } from "@/lib/types";

type Props = {
  currency: Currency;
  onCurrency: (c: Currency) => void;
};

export default function AnnouncementBar({ currency, onCurrency }: Props) {
  return (
    <div className="bg-brand text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] md:px-8">
        <span className="hidden sm:block">SRUF @ 5!</span>
        <span className="mx-auto sm:mx-0">Worldwide shipping available</span>
        <select
          value={currency}
          onChange={(e) => onCurrency(e.target.value as Currency)}
          aria-label="Currency"
          className="cursor-pointer bg-transparent text-[11px] font-semibold uppercase tracking-[0.18em] outline-none"
        >
          <option value="NGN" className="bg-[#07090f]">NGN ₦</option>
          <option value="USD" className="bg-[#07090f]">USD $</option>
        </select>
      </div>
    </div>
  );
}