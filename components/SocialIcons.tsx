import { socials } from "@/lib/site";

const linkClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:scale-110 hover:border-white";

export default function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socials.instagram && (
        <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={linkClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
          </svg>
        </a>
      )}
      {socials.tiktok && (
        <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={linkClass}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
          </svg>
        </a>
      )}
      {socials.whatsapp && (
        <a href={socials.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={linkClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4L3 21z" />
          </svg>
        </a>
      )}
    </div>
  );
}