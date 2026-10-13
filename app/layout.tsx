import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "SRUF — Wear the Vibe",
  description: "SRUF streetwear. Becoming Collection 2026.",
};

// Runs before the page draws, so there is no flash of the wrong theme.
// The admin area is always dark.
const themeScript = `(function(){try{var t=localStorage.getItem("sruf-theme");if(location.pathname.indexOf("/admin")===0||(t!=="light"&&t!=="dark")){t="dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}