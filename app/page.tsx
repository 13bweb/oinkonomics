"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import toast, { Toaster } from "react-hot-toast";
// WalletConnect is now rendered inside the Header component
import About from "../components/About";
import ImageSwitcher from "../components/ImageSwitcher";
import TiersExplainer from "../components/TiersExplainer";
import Community from "../components/Community";
import { mintNFT } from "../lib/utils";

type VerifyResponse = {
  tier: "TOO_POOR" | "POOR" | "MID" | "RICH";
  walletAddress: string;
  balance: number;
  balanceUSD: number;
  minThreshold: number;
  maxThreshold: number | null;
  nftRange: readonly [number, number] | null;
  nftNumber?: number | null;
  verified: boolean;
  message: string;
};

export default function HomePage() {
  const { publicKey, wallet, connected, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const handleScan = useCallback(async () => {
    let finalWalletAddress = walletAddress;

    if (!finalWalletAddress) {
      // If not connected, try to trigger the wallet connect flow (useful when user clicks Scan)
      if (typeof connect === 'function') {
        try {
          await connect();
        } catch (e) {
          toast.error('Failed to connect wallet');
          return;
        }
      }

      // Try to read public key from the adapter after connect
      finalWalletAddress = wallet?.adapter?.publicKey?.toBase58() ?? null;
    }

    if (!finalWalletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    const t = toast.loading("Scanning your wallet…");
    try {
      const res = await fetch("/api/verify-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: finalWalletAddress }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to verify tier");
      }
      const j: VerifyResponse = await res.json();
      setData(j);
      toast.success(`You are ${j.tier} • $${j.balanceUSD.toLocaleString()}`);
    } catch (e: any) {
      const msg = e?.message || "Scan failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      toast.dismiss(t);
    }
  }, [walletAddress]);

  const handleMint = useCallback(async () => {
    if (!wallet?.adapter || !data) return;
    
    // Empêcher le mint pour TOO_POOR
    if (data.tier === "TOO_POOR") {
      toast.error("😱 You need at least $10 to mint! Come back when you're less poor!");
      return;
    }
    
    // Définir les Candy Machine IDs par tier
    const candyMachineIds = {
      TOO_POOR: "", // Pas de mint possible
      POOR: "8HTSVL3fNTg8CugR8veRGVEyLhz5CBbkW2T4m54zdTAn", // Vrai Candy Machine ID
      MID: "8HTSVL3fNTg8CugR8veRGVEyLhz5CBbkW2T4m54zdTAn",  // Vrai Candy Machine ID  
      RICH: "8HTSVL3fNTg8CugR8veRGVEyLhz5CBbkW2T4m54zdTAn"  // Vrai Candy Machine ID
    };
    
    setMinting(true);
    const t = toast.loading(`Minting NFT #${data.nftNumber}…`);
    
    try {
      const candyMachineId = candyMachineIds[data.tier];
      console.log('🎯 Tentative de mint:', { tier: data.tier, nftNumber: data.nftNumber, candyMachineId });
      
      const res = await mintNFT(wallet.adapter, candyMachineId);
      
      if (res.success) {
        toast.success(res.message || `🎉 NFT #${data.nftNumber} minté avec succès !`);
        console.log('✅ Mint réussi:', res);
      } else {
        throw new Error(res.error || 'Échec du mint');
      }
    } catch (e: any) {
      console.error('❌ Erreur mint:', e);
      toast.error(`❌ Échec du mint: ${e?.message || "Erreur inconnue"}`);
    } finally {
      setMinting(false);
      toast.dismiss(t);
    }
  }, [wallet?.adapter, data]);

  const tierStyle = useMemo(() => {
    if (!data?.tier) return "";
    if (data.tier === "TOO_POOR") return "from-red-400 to-red-600";
    if (data.tier === "POOR") return "from-rose-300 to-amber-200";
    if (data.tier === "MID") return "from-sky-300 to-emerald-200";
    return "from-fuchsia-300 to-cyan-200";
  }, [data?.tier]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Toaster position="top-center" />
      {/* WalletConnect now lives in the Header component */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/40 dark:via-white/5 dark:to-white/10" />

      <section className="px-6 md:px-10 pt-24 md:pt-28 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-black drop-shadow-title">
                OinkonomicsSol
              </h1>
              <div className="absolute -top-2 -right-4 bg-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold border-2 border-black shadow-hard transform rotate-12">
                DEVNET
              </div>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Enter a world where your crypto wallet defines your status. Scan, get ranked, and mint a unique NFT for your tier.
            </p>
            <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                🔧 <strong>Devnet Collection:</strong> 9JCdYQL53tH97ef7zZBTYWYtLAcWSQVMocs2AjqjD6a4
              </p>
            </div>
            <ul className="text-gray-900 text-base md:text-lg space-y-1">
              <li><span className="font-semibold text-red-600">TOO_POOR</span>: Less than $10 (No NFT)</li>
              <li><span className="font-semibold text-yellow-600">POOR</span>: $10 – $1,000 (NFT #1-100)</li>
              <li><span className="font-semibold text-blue-600">MID</span>: $1,000 – $10,000 (NFT #100-200)</li>
              <li><span className="font-semibold text-purple-600">RICH</span>: $10,000+ (NFT #200-300)</li>
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleScan}
                disabled={loading}
                className="relative btn-primary group disabled:opacity-60 min-w-[180px]"
              >
                <span className="relative z-10">
                  {loading ? "Scanning…" : connected ? "Scan my wallet" : "Connect & Scan"}
                </span>
                <span className="btn-shine" />
                {!connected && (
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-green-400 rounded-full animate-ping" />
                )}
              </button>

              {data && (
                <div className={`inline-flex items-center gap-3 rounded-2xl border-2 border-black px-4 py-3 bg-gradient-to-r ${tierStyle} shadow-hard tilt animate-float`}>
                  <span className="text-sm font-semibold tracking-widest uppercase">{data.tier}</span>
                  <span className="text-sm text-black/80">${data.balanceUSD.toLocaleString()}</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="relative h-[300px] md:h-[420px]">
            <div className="absolute inset-0 rounded-[28px] border-4 border-black bg-gradient-to-tr from-pink-200 via-yellow-200 to-sky-200 shadow-hard overflow-hidden tilt animate-scan">
              <ImageSwitcher
                images={[
                  "https://i.ibb.co/jXKRxQz/WizardHS.jpg",
                  "https://i.ibb.co/0yDNJ3D9/Rich-Chain-Pig.jpg",
                  "https://i.ibb.co/7xH0KMDq/Rich-Crown-Guy.jpg",
                  "https://i.ibb.co/2rWvjBH/Poor-Worker1.jpg",
                  "https://i.ibb.co/ymVmV4cb/Poor-Beaten-Up1.jpg",
                ]}
                intervalMs={2500}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.5),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.5),transparent_40%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10 overflow-hidden">
                <div className="h-full w-1/3 bg-black/60 animate-marquee" />
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full border-2 border-black shadow-hard animate-float" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-300 rounded-2xl border-2 border-black shadow-hard animate-float-delayed" />
            <div className="absolute top-8 -right-3 w-10 h-10 bg-sky-300 rounded-lg border-2 border-black shadow-hard animate-float-slow" />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            { t: "TOO_POOR", d: "😱 HOW ARE YOU THAT POOR?! Get at least $10!", c: "from-red-300 to-red-200", nft: "No NFT" },
            { t: "POOR", d: "Playful, gritty, and hungry for more. Mint NFT #1-100", c: "from-rose-200 to-amber-100", nft: "#1-100" },
            { t: "MID", d: "Balanced, confident, and on the rise. Mint NFT #100-200", c: "from-sky-200 to-emerald-100", nft: "#100-200" },
            { t: "RICH", d: "Bold, radiant, and unmistakable. Mint NFT #200-300", c: "from-fuchsia-200 to-cyan-100", nft: "#200-300" },
          ].map((x) => (
            <div key={x.t} className={`rounded-3xl border-2 border-black p-6 bg-gradient-to-br ${x.c} shadow-hard tilt transition-transform` }>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{x.t}</h3>
                <span className="text-xs uppercase tracking-widest">Tier</span>
              </div>
              <div className="mt-2 text-sm font-bold text-purple-700">NFT Range: {x.nft}</div>
              <p className="mt-3 text-gray-800">{x.d}</p>
              {data?.tier && data.tier === x.t && (
                <button
                  onClick={handleMint}
                  disabled={minting || data.tier === "TOO_POOR"}
                  className={`mt-5 ${data.tier === "TOO_POOR" ? "btn-disabled" : "btn-dark"}`}
                >
                  {data.tier === "TOO_POOR" 
                    ? "❌ NO MINT FOR YOU!" 
                    : minting ? "Minting…" : `Mint NFT #${data.nftNumber}`
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Detailed explainer section */}
      <TiersExplainer />

      {/* Community CTA */}
      <Community />

      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <About />
        </div>
      </section>
    </main>
  );
}

