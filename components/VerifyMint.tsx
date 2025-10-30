"use client";
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { mintNFT } from "../lib/utils";

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

  const handleVerify = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/verify-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      });

      if (response.ok) {
        const data = await response.json();
        setTierInfo(data);
        setStatus("verified");
        toast.success(`${data.message}`);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Verification failed");
        setStatus("error");
        toast.error(errorData.message || "Verification failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  };

    const handleMint = async () => {
    if (!wallet?.adapter || !tierInfo) {
      toast.error("Wallet or tier info not available");
      return;
    }

    // Empêcher le mint pour TOO_POOR
    if (tierInfo.tier === "TOO_POOR") {
      toast.error("😱 You need at least $10 to mint! Come back when you're less poor!");
      return;
    }

    // VRAIE Candy Machine unique qui gère toute la collection Oinkonomics 
    // La logique de tier se base sur le numéro NFT assigné (0-99 POOR, 100-199 MID, 200-299 RICH)
    const CANDY_MACHINE_ID = "8HTSVL3fNTg8CugR8veRGVEyLhz5CBbkW2T4m54zdTAn";

    setStatus("loading");

    try {
      console.log('🎯 VerifyMint - Tentative de mint RÉEL:', { 
        tier: tierInfo.tier, 
        nftNumber: tierInfo.nftNumber,
        candyMachine: CANDY_MACHINE_ID 
      });
      
      const result = await mintNFT(wallet.adapter, CANDY_MACHINE_ID);
      
      if (result.success) {
        toast.success(result.message || `🎉 NFT #${tierInfo.nftNumber} minté !`);
        setStatus("verified");
      } else {
        throw new Error(result.error || 'Échec du mint');
      }
    } catch (error) {
      console.error('❌ VerifyMint - Erreur:', error);
      const message = error instanceof Error ? error.message : "Minting failed";
      toast.error(`❌ ${message}`);
      setStatus("error");
    }
  };

  const getTierLabel = (tier: Tier) => {
    switch (tier) {
      case "TOO_POOR":
        return "Too Poor";
      case "POOR":
        return "Poor";
      case "MID":
        return "MID";
      case "RICH":
        return "Rich";
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
                  <p className="font-pangolin">Solde: <span className="font-bold">{tierInfo.balance.toFixed(4)} SOL</span></p>
                  <p className="font-pangolin">Valeur: <span className="font-bold">${tierInfo.balanceUSD.toLocaleString()}</span></p>
                  <p className="font-pangolin text-sm text-gray-600">
                    Tier {tierInfo.tier}: ${tierInfo.minThreshold.toLocaleString()} - 
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
                    <span className="relative z-10">❌ NO MINT FOR YOU! GET $10 FIRST!</span>
                  </button>
                ) : (
                  <div className="text-center mb-4">
                    <p className="text-lg font-pangolin text-gray-700 mb-2">
                      💰 Mint coût : <strong>0.01 SOL</strong> (~$1.8)
                    </p>
                    <button onClick={handleMint} className={`blob-button ${getTierColor(tierInfo.tier)} text-black font-pangolin font-bold text-xl px-8 py-4`}>
                      <span className="relative z-10">🐷 Minter NFT #{tierInfo.nftNumber} (0.01 SOL) 🐷</span>
                    </button>
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
