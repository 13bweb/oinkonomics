"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import About from "../components/About";
import Community from "../components/Community";
import ImageSwitcher from "../components/ImageSwitcher";
import NFTMintingModal from "../components/NFTMintingModal";
import TiersExplainer from "../components/TiersExplainer";
import WalletConnect from "../components/WalletConnect";
import logger from "../lib/logger-client";
import { getTierDisplayName } from "../lib/utils";

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
  const { publicKey, wallet, connected, connect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [lastMintSignature, setLastMintSignature] = useState<string | null>(null);
  const lastAutoScannedWalletRef = useRef<string | null>(null);
  const autoOpenModalAfterScanRef = useRef(false);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "";
  const derivedClusterLabel = rpcUrl.includes("devnet")
    ? "DEVNET"
    : rpcUrl.includes("testnet")
      ? "TESTNET"
      : (rpcUrl.includes("mainnet") || rpcUrl.includes("mainnet-beta"))
        ? "MAINNET"
        : null;

  // Affichage: si le RPC indique clairement le cluster, on l'affiche (évite le badge DEVNET alors qu'on est sur mainnet).
  const networkLabel = derivedClusterLabel ?? (process.env.NEXT_PUBLIC_SOLANA_CLUSTER_LABEL ?? "MAINNET");
  const collectionMint = process.env.NEXT_PUBLIC_COLLECTION_MINT ?? "";
  const explorerBase = "https://explorer.solana.com/address";
  const explorerClusterParam = rpcUrl.includes("devnet")
    ? "?cluster=devnet"
    : rpcUrl.includes("testnet")
      ? "?cluster=testnet"
      : rpcUrl.includes("mainnet")
        ? "?cluster=mainnet-beta"
        : "";
  const explorerUrl = collectionMint
    ? `${explorerBase}/${collectionMint}${explorerClusterParam}`
    : "";

  const walletAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const handleScan = useCallback(async () => {
    let finalWalletAddress = walletAddress ?? wallet?.adapter?.publicKey?.toBase58() ?? null;

    if (!finalWalletAddress) {
      if (!wallet?.adapter) {
        setVisible(true);
        toast.error("Connect your wallet first");
        return;
      }

      try {
        // Avoid double-connect (Standard Wallet will throw "requestAccounts already pending")
        if (!wallet.adapter.connected) {
          if (connecting) {
            setVisible(true);
            toast.error("Wallet connection already pending. Please confirm in your wallet.");
            return;
          }
          setVisible(true);
          toast.error("Please connect your wallet first.");
          return;
        }

        if (!wallet.adapter.publicKey) {
          finalWalletAddress = await new Promise<string | null>((resolve, reject) => {
            const start = Date.now();
            const timer = window.setInterval(() => {
              const key = wallet.adapter?.publicKey?.toBase58?.() ?? null;
              if (key) {
                window.clearInterval(timer);
                resolve(key);
              }
              if (Date.now() - start > 8000) {
                window.clearInterval(timer);
                reject(new Error("Wallet did not share a public key"));
              }
            }, 150);
          });
        } else {
          finalWalletAddress = wallet.adapter.publicKey.toBase58();
        }
      } catch (e: unknown) {
        logger.error("[wallet] connect failed", e);
        const errorMessage = e instanceof Error ? e.message : "Failed to finalize wallet connection";
        toast.error(errorMessage);
        return;
      }
    }

    if (!finalWalletAddress) {
      toast.error(connecting ? "Wallet connection in progress…" : "Connect your wallet with the Unified Wallet Kit");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setMintSuccess(false); // Réinitialiser l'état de mint réussi lors d'un nouveau scan
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
      toast.success(`You are ${getTierDisplayName(j.tier)} • $${j.balanceUSD.toLocaleString()}`);
      if (autoOpenModalAfterScanRef.current) {
        autoOpenModalAfterScanRef.current = false;
        // Ouvrir directement la modale pour un flow "connect -> scan -> mint"
        if (j.tier !== "TOO_POOR") setMintModalOpen(true);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Scan failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      toast.dismiss(t);
    }
  }, [walletAddress, wallet, setVisible, connecting]);

  // Flow UX demandé: après "Connect", on scanne automatiquement une fois et on ouvre la modale.
  useEffect(() => {
    if (!connected) return;
    if (!walletAddress) return;
    if (loading) return;
    if (lastAutoScannedWalletRef.current === walletAddress) return;

    // Si on a déjà les données pour ce wallet, ne pas rescan.
    if (data?.walletAddress === walletAddress) {
      lastAutoScannedWalletRef.current = walletAddress;
      return;
    }

    lastAutoScannedWalletRef.current = walletAddress;
    autoOpenModalAfterScanRef.current = true;
    // lancer le scan
    void handleScan();
  }, [connected, walletAddress, loading, data?.walletAddress, handleScan]);

  const openMintModal = useCallback(() => {
    if (!data) {
      toast.error("Please scan your wallet first.");
      return;
    }
    if (!wallet?.adapter?.publicKey) {
      setVisible(true);
      toast.error("Please connect your wallet first.");
      return;
    }
    if (data.tier === "TOO_POOR") {
      toast.error("🥀 Oinkless — You need at least $10 to mint.");
      return;
    }
    setMintModalOpen(true);
  }, [data, wallet?.adapter?.publicKey, setVisible]);

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
      <NFTMintingModal
        open={mintModalOpen}
        onClose={() => setMintModalOpen(false)}
        walletAdapter={wallet?.adapter ?? null}
        tierInfo={
          data
            ? {
                tier: data.tier,
                walletAddress: data.walletAddress,
                balance: data.balance,
                balanceUSD: data.balanceUSD,
                nftNumber: data.nftNumber ?? null,
                nftRange: data.nftRange,
              }
            : null
        }
        rpcUrl={rpcUrl}
        onMinted={(sig) => {
          setLastMintSignature(sig);
          setMintSuccess(true);
          setMintModalOpen(false);
        }}
      />
      {/* WalletConnect referral card */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/40 dark:via-white/5 dark:to-white/10" />

      <section className="px-6 md:px-10 pt-24 md:pt-28 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-black drop-shadow-title">
                OinkonomicsSol
              </h1>
              {networkLabel && (
                <div className="absolute -top-2 -right-4 bg-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold border-2 border-black shadow-hard transform rotate-12">
                  {networkLabel}
                </div>
              )}
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Enter a world where your crypto wallet defines your status. Scan, get ranked, and mint a unique NFT for your tier.
            </p>
            {collectionMint && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  🔧 <strong>Collection Mint:</strong>{' '}
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-orange-600"
                  >
                    {collectionMint}
                  </a>
                </p>
              </div>
            )}
            <ul className="text-gray-900 text-base md:text-lg space-y-1">
              <li><span className="font-semibold text-red-600">Oinkless</span>: Less than $10 (No NFT)</li>
              <li><span className="font-semibold text-yellow-600">Piglets</span>: $10 – $1,000 (NFT #0-400)</li>
              <li><span className="font-semibold text-blue-600">City Swine</span>: $1,000 – $10,000 (NFT #400-800)</li>
              <li><span className="font-semibold text-purple-600">Oinklords</span>: $10,000+ (NFT #800-12000)</li>
            </ul>

            <div className="pt-2">
              <WalletConnect />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleScan}
                disabled={loading}
                className="relative btn-primary group disabled:opacity-60 min-w-[180px]"
              >
                <span className="relative z-10">
                  {loading ? "Scanning…" : "Scan my wallet"}
                </span>
                <span className="btn-shine" />
              </button>

              {data && (
                <div className={`inline-flex items-center gap-3 rounded-2xl border-2 border-black px-4 py-3 bg-gradient-to-r ${tierStyle} shadow-hard tilt animate-float`}>
                  <span className="text-sm font-semibold tracking-widest uppercase">{getTierDisplayName(data.tier)}</span>
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
            { t: "TOO_POOR", label: "Oinkless", d: "🥀 Oinkless — get at least $10 to mint.", c: "from-red-300 to-red-200", nft: "No NFT" },
            { t: "POOR", label: "Piglets", d: "🐷 Piglets — Mint NFT #0-400", c: "from-rose-200 to-amber-100", nft: "#0-400" },
            { t: "MID", label: "City Swine", d: "🐽 City Swine — Mint NFT #400-800", c: "from-sky-200 to-emerald-100", nft: "#400-800" },
            { t: "RICH", label: "Oinklords", d: "🐗 Oinklords — Mint NFT #800-12000", c: "from-fuchsia-200 to-cyan-100", nft: "#800-12000" },
          ].map((x) => (
            <div key={x.t} className={`rounded-3xl border-2 border-black p-6 bg-gradient-to-br ${x.c} shadow-hard tilt transition-transform`}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{x.label}</h3>
                <span className="text-xs uppercase tracking-widest">Tier</span>
              </div>
              <div className="mt-2 text-sm font-bold text-purple-700">NFT Range: {x.nft}</div>
              <p className="mt-3 text-gray-800">{x.d}</p>
              {data?.tier && data.tier === x.t && !mintSuccess && (
                <button
                  onClick={openMintModal}
                  disabled={data.tier === "TOO_POOR"}
                  className={`mt-5 ${data.tier === "TOO_POOR" ? "btn-disabled" : "btn-dark"}`}
                >
                  {data.tier === "TOO_POOR"
                    ? "🥀 OINKLESS — NO MINT"
                    : `Mint NFT #${data.nftNumber}`
                  }
                </button>
              )}
              {data?.tier && data.tier === x.t && mintSuccess && (
                <div className="mt-5 px-4 py-2 bg-green-500 text-white rounded-lg text-center font-bold">
                  ✅ NFT Minté avec succès !
                </div>
              )}
              {data?.tier && data.tier === x.t && mintSuccess && lastMintSignature && (
                <button
                  onClick={() =>
                    window.open(
                      `https://explorer.solana.com/tx/${lastMintSignature}${explorerClusterParam}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="mt-3 w-full px-4 py-2 rounded-lg border-2 border-black bg-white hover:bg-gray-50 font-bold"
                >
                  View tx
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
