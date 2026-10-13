/* eslint-disable @next/next/no-img-element */

// Put these two files in the public folder. If the logo is an SVG, change the endings to .svg
const LOGO_FOR_DARK_THEME = "/logo-on-dark.png"; // a light or white logo
const LOGO_FOR_LIGHT_THEME = "/logo-on-light.png"; // a dark or black logo

export default function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <>
      <img src={LOGO_FOR_DARK_THEME} alt="SRUF" className={`logo-on-dark w-auto ${className}`} />
      <img src={LOGO_FOR_LIGHT_THEME} alt="SRUF" className={`logo-on-light w-auto ${className}`} />
    </>
  );
}