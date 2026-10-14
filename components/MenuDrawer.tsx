import type { Category } from "@/lib/types";
import SocialIcons from "@/components/SocialIcons";

type Props = {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSelect: (filter: string) => void;
};

export default function MenuDrawer({ open, categories, onClose, onSelect }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/70 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col border-r border-line bg-surface p-8 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <span className="font-display text-3xl tracking-[0.14em]">SRUF</span>
          <button onClick={onClose} aria-label="Close menu" className="text-3xl leading-none">
            ×
          </button>
        </div>

        <nav className="flex flex-col overflow-y-auto">
          <button
            onClick={() => onSelect("all")}
            className="font-display border-b border-line py-4 text-left text-3xl transition hover:text-brand-light"
          >
            All Collections
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="font-display border-b border-line py-4 text-left text-3xl transition hover:text-brand-light"
            >
              {c.name}
            </button>
          ))}
          <a
            href="/#about"
            onClick={onClose}
            className="font-display border-b border-line py-4 text-3xl transition hover:text-brand-light"
          >
            About
          </a>
        </nav>

        <div className="mt-auto pt-6">
          <p className="text-muted mb-3 text-xs uppercase tracking-[0.2em]">Follow SRUF</p>
          <SocialIcons />
        </div>
      </aside>
    </>
  );
}