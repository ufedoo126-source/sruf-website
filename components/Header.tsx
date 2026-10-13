import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

type Props = {
  count: number;
  onMenu: () => void;
  onCart: () => void;
};

export default function Header({ count, onMenu, onCart }: Props) {
  return (
    <header className="site-header sticky top-0 z-40 border-b border-line backdrop-blur">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 md:px-8">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="flex h-10 w-10 flex-col items-start justify-center gap-[5px]"
        >
          <span className="block h-[2px] w-7 bg-current" />
          <span className="block h-[2px] w-7 bg-current" />
          <span className="block h-[2px] w-5 bg-current" />
        </button>

        <a href="#top" aria-label="SRUF home" className="justify-self-center">
          <Logo className="h-9" />
        </a>

        <div className="flex items-center gap-2 justify-self-end">
          <ThemeToggle />
          <button onClick={onCart} className="btn-primary btn-sm">
            Bag ({count})
          </button>
        </div>
      </div>
    </header>
  );
}