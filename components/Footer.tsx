"use client";

import React from "react";

export default function Footer() {
  const links = [
    { name: "X", href: "https://x.com/OinkonomicsSol/", svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M18.244 2H21l-6.5 7.43L22 22h-6.828l-4.79-6.277L4.8 22H2l7.077-8.09L2 2h6.914l4.36 5.802L18.244 2Zm-1.195 18h1.874L7.02 4h-1.9l11.93 16Z"/>
      </svg>
    )},
    { name: "Telegram", href: "https://t.me/", svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M9.04 15.47 8.9 19.3c.4 0 .57-.17.77-.38l1.86-1.8 3.86 2.83c.71.39 1.22.19 1.42-.66l2.57-12.08h.01c.23-1.05-.38-1.46-1.07-1.2L3.46 9.63c-1.03.4-1.02.98-.18 1.24l4.43 1.38 10.3-6.5c.48-.3.92-.13.56.18L9.04 15.47Z"/>
      </svg>
    )},
    { name: "Discord", href: "https://discord.com/invite/", svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.19.34-.41.8-.56 1.16a17.27 17.27 0 0 0-4-.02c-.16-.36-.38-.82-.58-1.16A19.79 19.79 0 0 0 6.101 4.37C3.278 8.5 2.548 12.53 2.86 16.5a19.98 19.98 0 0 0 4.864 2.5c.39-.52.74-1.07 1.04-1.65-.57-.22-1.12-.5-1.64-.82.14-.1.27-.21.4-.32a13.9 13.9 0 0 0 12.7 0c.13.11.26.22.4.32-.52.32-1.07.6-1.64.82.3.58.66 1.13 1.04 1.65a19.98 19.98 0 0 0 4.864-2.5c.38-4.78-.77-8.78-3.247-12.13ZM9.508 14.29c-.956 0-1.733-.9-1.733-2.01 0-1.11.766-2.01 1.733-2.01s1.753.9 1.733 2.01c0 1.11-.777 2.01-1.733 2.01Zm5.004 0c-.956 0-1.733-.9-1.733-2.01 0-1.11.777-2.01 1.733-2.01s1.733.9 1.733 2.01c0 1.11-.777 2.01-1.733 2.01Z"/>
      </svg>
    )},
  ];

  return (
    <footer className="mt-12 sm:mt-20 border-t-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl font-black">OinkonomicsSol</span>
          <span className="text-[10px] sm:text-xs text-black/60">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {links.map(l => (
            <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border-2 border-black px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-hard hover:-translate-y-0.5 transition-transform">
              <span className="text-black/80">{l.svg}</span>
              <span className="text-xs sm:text-sm font-semibold">{l.name}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
