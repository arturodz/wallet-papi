import type { MetadataRoute } from "next";

// Web app manifest, served at /manifest.webmanifest (Next auto-links it in <head>).
// Dark "instrument panel" theming so installed PWA matches the in-app glass cockpit.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wallet PAPI",
    short_name: "PAPI",
    description:
      "Aircraft logbook, expenses, and total cost of ownership — your glass-cockpit wallet.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
    categories: ["productivity", "utilities", "finance"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
