import SocialIcons from "@/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="px-4 py-14 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <span className="font-display text-5xl tracking-[0.14em]">SRUF</span>
        <SocialIcons />
        <p className="text-muted text-xs uppercase tracking-[0.2em]">© 2026 SRUF. All rights reserved.</p>
      </div>
    </footer>
  );
}