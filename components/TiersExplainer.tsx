"use client";

import React from "react";

export default function TiersExplainer() {
  const tiers = [
    {
      key: "POOR",
      title: "POOR",
      range: "< $1,000",
      blurb: "Playful, gritty, and hungry. Entry tier for beginners and degen explorers.",
      gradient: "from-rose-200 to-amber-100",
      pigImage: "/images/poor-pig.png"
    },
    {
      key: "MID",
      title: "MID",
      range: "$1,000 – $10,000",
      blurb: "Balanced and climbing. Comfortable with DeFi and building momentum.",
      gradient: "from-sky-200 to-emerald-100",
      pigImage: "/images/mid-pig.png"
    },
    {
      key: "RICH",
      title: "RICH",
      range: "> $10,000",
      blurb: "Bold and radiant. Power users with diversified bags and on-chain presence.",
      gradient: "from-fuchsia-200 to-cyan-100",
      pigImage: "/images/rich-pig.png"
    },
  ];

  return (
    <section className="px-4 sm:px-6 md:px-10 py-10 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">How tiers work</h2>
          <p className="mt-2 sm:mt-3 text-gray-700 text-sm sm:text-base px-2">We scan your wallet value in USD and place you in a tier. Each tier mints a different NFT skin.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {tiers.map((t) => (
            <div key={t.key} className={`rounded-2xl sm:rounded-3xl border-2 border-black p-4 sm:p-6 bg-gradient-to-br ${t.gradient} shadow-hard tilt hover:translate-y-[-2px] transition-transform duration-200`}>
                            <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-black shadow-hard bg-white overflow-hidden flex items-center justify-center">
                  <div className="text-xs font-bold">{t.title.charAt(0)}</div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="font-bold text-lg sm:text-xl">{t.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-700">{t.range}</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700">{t.blurb}</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1 text-black/80">
                <li>Scan your wallet to detect total value</li>
                <li>Get your tier instantly</li>
                <li>Mint the matching NFT style</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
