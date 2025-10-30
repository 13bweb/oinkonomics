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
    },
    {
      key: "MID",
      title: "MID",
      range: "$1,000 – $10,000",
      blurb: "Balanced and climbing. Comfortable with DeFi and building momentum.",
      gradient: "from-sky-200 to-emerald-100",
    },
    {
      key: "RICH",
      title: "RICH",
      range: "> $10,000",
      blurb: "Bold and radiant. Power users with diversified bags and on-chain presence.",
      gradient: "from-fuchsia-200 to-cyan-100",
    },
  ];

  return (
    <section className="px-6 md:px-10 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black">How tiers work</h2>
          <p className="mt-3 text-gray-700">We scan your wallet value in USD and place you in a tier. Each tier mints a different NFT skin.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.key} className={`rounded-3xl border-2 border-black p-6 bg-gradient-to-br ${t.gradient} shadow-hard tilt`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold">{t.title}</h3>
                <span className="text-xs uppercase tracking-widest">Tier</span>
              </div>
              <p className="mt-2 text-sm text-black/70">Range: <span className="font-semibold">{t.range}</span></p>
              <p className="mt-3 text-gray-800">{t.blurb}</p>
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
