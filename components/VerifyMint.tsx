"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import logger from "../lib/logger-client";
import { getTierDisplayName } from "../lib/utils";
import NFTMintingModal from "./NFTMintingModal";

type Status = "idle" | "loading" | "verified" | "error";
type Tier = "TOO_POOR" | "POOR" | "MID" | "RICH";

interface TierInfo {
  tier: Tier;
  balance: number;
  balanceUSD: number;
  minThreshold: number;
  maxThreshold: number | null;
  nftRange: readonly [number, number] | null;
  nftNumber?: number | null;
  verified: boolean;
  message: string;
  candyMachineId?: string;
}

const VerifyMint: React.FC = () => {
  const { connected, publicKey, wallet } = useWallet();
  const [status, setStatus] = useState<Status>("idle");
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [lastMintSignature, setLastMintSignature] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      logger.log('🔍 Vérification du wallet:', publicKey.toBase58());

      const response = await fetch("/api/verify-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      });

      logger.log('📡 Réponse API:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        logger.log('✅ Données reçues:', data);
        setTierInfo(data);
        setStatus("verified");
        toast.success(`${data.message}`);
      } else {
        const errorData = await response.json();
        logger.error('❌ Erreur API:', errorData);
        setErrorMessage(errorData.message || errorData.error || "Verification failed");
        setStatus("error");
        toast.error(errorData.message || errorData.error || "Verification failed");
      }
    } catch (error) {
      logger.error('❌ Erreur réseau:', error);
      const message = error instanceof Error ? error.message : "Network error";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  };

  const openMintModal = () => {
    if (!wallet?.adapter || !tierInfo) {
      toast.error("Wallet or tier info not available");
      return;
    }
    if (tierInfo.tier === "TOO_POOR") {
      toast.error("🥀 Oinkless — You need at least $10 to mint.");
      return;
    }
    setMintModalOpen(true);
  };

  const getTierLabel = (tier: Tier) => {
    switch (tier) {
      case "TOO_POOR":
        return "Oinkless";
      case "POOR":
        return "Piglets";
      case "MID":
        return "City Swine";
      case "RICH":
        return "Oinklords";
      default:
        return tier;
    }
  };

  const getTierColor = (tier: Tier) => {
    switch (tier) {
      case "TOO_POOR":
        return "bg-red-400 hover:bg-red-500";
      case "POOR":
        return "bg-yellow-300 hover:bg-yellow-400";
      case "MID":
        return "bg-blue-300 hover:bg-blue-400";
      case "RICH":
        return "bg-purple-300 hover:bg-purple-400";
      default:
        return "bg-gray-300 hover:bg-gray-400";
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 relative z-10">
      <NFTMintingModal
        open={mintModalOpen}
        onClose={() => setMintModalOpen(false)}
        walletAdapter={wallet?.adapter ?? null}
        tierInfo={
          tierInfo
            ? {
                tier: tierInfo.tier,
                walletAddress: publicKey?.toBase58() ?? "",
                balance: tierInfo.balance,
                balanceUSD: tierInfo.balanceUSD,
                nftNumber: tierInfo.nftNumber ?? null,
                nftRange: tierInfo.nftRange,
              }
            : null
        }
        onMinted={(sig) => {
          setLastMintSignature(sig);
          setMintModalOpen(false);
        }}
      />
      {!connected ? (
        <div className="card-cartoon p-8 bg-pastel-pink transform rotate-1">
          <h2 className="text-3xl font-pangolin font-bold text-center text-black mb-4">
            🐷 Welcome to Oinkonomics! 🐷
          </h2>
          <p className="text-xl font-pangolin text-center text-gray-800">
            Connect your wallet to discover your tier and mint your NFT!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {status === "idle" && (
            <div className="card-cartoon p-8 bg-pastel-blue transform -rotate-1">
              <h2 className="text-3xl font-pangolin font-bold text-center text-black mb-6">
                Ready to Check Your Oinks?
              </h2>
              <div className="text-center relative">
                <button onClick={handleVerify} className="blob-button bg-gradient-to-r from-pink-400 to-purple-400 text-white font-pangolin font-bold text-2xl px-8 py-4">
                  <span className="relative z-10">🐷 Vérifier mes Oinks! 🐷</span>
                </button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="card-cartoon p-8 bg-pastel-yellow transform rotate-1">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
                <h2 className="text-2xl font-pangolin font-bold text-black">Analyzing your wallet...</h2>
                <p className="text-lg font-pangolin text-gray-700 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}

          {status === "verified" && tierInfo && (
            <div className="card-cartoon p-8 bg-pastel-green transform -rotate-1">
              <h2 className="text-3xl font-pangolin font-bold text-center text-black mb-6">🎉 Congratulations! 🎉</h2>
              <p className="text-xl font-pangolin text-center text-gray-800 mb-4">
                {tierInfo.message}
              </p>

              {/* Détails du solde */}
              <div className="bg-white/70 rounded-lg p-4 mb-6 mx-auto max-w-md">
                <h3 className="text-lg font-pangolin font-bold text-center mb-2">💰 Détails de votre wallet</h3>
                <div className="space-y-1 text-center">
                  <p className="font-pangolin">Solde SOL: <span className="font-bold">{tierInfo.balance.toFixed(4)} SOL</span></p>
                  <p className="font-pangolin text-lg">Valeur Totale (SOL + Tokens): <span className="font-bold text-green-600">${tierInfo.balanceUSD.toLocaleString()}</span></p>
                  <p className="font-pangolin text-sm text-gray-600">
                    Tier {getTierDisplayName(tierInfo.tier)}: ${tierInfo.minThreshold.toLocaleString()} -
                    {tierInfo.maxThreshold ? `$${tierInfo.maxThreshold.toLocaleString()}` : '∞'}
                  </p>
                  {tierInfo.nftNumber && (
                    <p className="font-pangolin text-lg font-bold text-purple-600">
                      🎯 Your NFT: #{tierInfo.nftNumber}
                    </p>
                  )}
                  {tierInfo.nftRange && (
                    <p className="font-pangolin text-sm text-gray-500">
                      Range: #{tierInfo.nftRange[0]}-{tierInfo.nftRange[1]}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center">
                {tierInfo.tier === "TOO_POOR" ? (
                  <button disabled className="blob-button bg-red-400 text-black font-pangolin font-bold text-2xl px-8 py-4 opacity-50 cursor-not-allowed">
                    <span className="relative z-10">🥀 OINKLESS — NO MINT. GET $10 FIRST!</span>
                  </button>
                ) : (
                  <div className="text-center mb-4">
                    <p className="text-lg font-pangolin text-gray-700 mb-2">
                      🎉 Mint GRATUIT : <strong>0 SOL</strong> (seulement ~0.001 SOL de frais réseau)
                    </p>
                    <button onClick={openMintModal} className={`blob-button ${getTierColor(tierInfo.tier)} text-black font-pangolin font-bold text-xl px-8 py-4`}>
                      <span className="relative z-10">🐷 Minter NFT #{tierInfo.nftNumber} GRATUITEMENT 🐷</span>
                    </button>
                    {lastMintSignature && (
                      <button
                        type="button"
                        className="mt-3 px-4 py-2 rounded-xl border-2 border-black bg-white hover:bg-gray-50 font-pangolin font-bold"
                        onClick={() => {
                          const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "";
                          const cluster = rpcUrl.includes("devnet")
                            ? "devnet"
                            : rpcUrl.includes("testnet")
                              ? "testnet"
                              : "mainnet-beta";
                          window.open(
                            `https://explorer.solana.com/tx/${lastMintSignature}?cluster=${cluster}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        View tx
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="card-cartoon p-8 bg-gradient-to-r from-red-200 to-pink-200 transform rotate-1">
              <h2 className="text-2xl font-pangolin font-bold text-center text-black mb-4">Oops! Something went wrong</h2>
              <p className="text-lg font-pangolin text-center text-gray-800 mb-6">{errorMessage || "An unexpected error occurred"}</p>
              <div className="text-center">
                <button
                  onClick={() => {
                    setStatus("idle");
                    setErrorMessage(null);
                  }}
                  className="blob-button bg-gradient-to-r from-gray-400 to-gray-500 text-white font-pangolin font-bold text-xl px-6 py-3"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default VerifyMint;
