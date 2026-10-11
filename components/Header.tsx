type Props = {
  count: number;
  onMenu: () => void;
  onCart: () => void;
};

export default function Header({ count, onMenu, onCart }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(7,9,15,0.85)] backdrop-blur">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 md:px-8">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="flex h-10 w-10 flex-col items-start justify-center gap-[5px]"
        >
          <span className="block h-[2px] w-7 bg-white" />
          <span className="block h-[2px] w-7 bg-white" />
          <span className="block h-[2px] w-5 bg-white" />
        </button>

        <a href="#top" className="font-display justify-self-center text-4xl leading-none tracking-[0.14em]">
          SRUF
        </a>

        <button onClick={onCart} className="btn-primary btn-sm justify-self-end">
          Bag ({count})
        </button>
      </div>
    </header>
  );
}