import Link from "next/link";
import Logo from "@/components/Logo";
import SocialIcons from "@/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="px-4 py-14 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <Logo className="h-12" />
        <SocialIcons />
        <Link
          href="/policies"
          className="text-muted text-xs uppercase tracking-[0.2em] transition hover:text-white"
        >
          Policies
        </Link>
        <p className="text-muted text-xs uppercase tracking-[0.2em]">© 2026 SRUF. All rights reserved.</p>
      </div>
    </footer>
  );
}