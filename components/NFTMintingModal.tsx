"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { getCandyMachineIdForTier, getTierDisplayName, mintNFT } from "../lib/utils";

type Tier = "TOO_POOR" | "POOR" | "MID" | "RICH";

export type MintModalTierInfo = {
  tier: Tier;
  walletAddress: string;
  balance: number;
  balanceUSD: number;
  nftNumber?: number | null;
  nftRange: readonly [number, number] | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  walletAdapter: WalletAdapter | null;
  tierInfo: MintModalTierInfo | null;
  rpcUrl?: string;
  previewImageUrl?: string;
  appName?: string;
  onMinted?: (signature: string) => void;
};

type Step = 1 | 2 | 3 | 4;
type Phase = "idle" | "minting" | "success" | "error";

function explorerTxUrl(signature: string, rpcUrl: string) {
  const cluster =
    rpcUrl.includes("devnet") ? "devnet" : rpcUrl.includes("testnet") ? "testnet" : "mainnet-beta";
  // Explorer accepte mainnet-beta via ?cluster=mainnet-beta (ou pas de param). On met le param pour être explicite.
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

function StepBar({ step }: { step: Step }) {
  const pct = (step / 4) * 100;
  return (
    <div className="w-full bg-black/10 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function NFTMintingModal({
  open,
  onClose,
  walletAdapter,
  tierInfo,
  rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "",
  previewImageUrl = process.env.NEXT_PUBLIC_NFT_PREVIEW_IMAGE_URL ?? "https://i.ibb.co/HTVh40XZ/image.png",
  appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Oinkonomics",
  onMinted,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const canMint = useMemo(() => {
    if (!tierInfo) return false;
    if (!walletAdapter?.publicKey) return false;
    if (tierInfo.tier === "TOO_POOR") return false;
    return true;
  }, [tierInfo, walletAdapter]);

  const candyMachineId = useMemo(() => {
    if (!tierInfo) return null;
    return getCandyMachineIdForTier(tierInfo.tier);
  }, [tierInfo]);

  const title = useMemo(() => {
    if (!tierInfo) return `Mint NFT`;
    const tierName = getTierDisplayName(tierInfo.tier);
    return `Mint ${tierName} NFT`;
  }, [tierInfo]);

  const reset = useCallback(() => {
    setPhase("idle");
    setStep(1);
    setError(null);
    setSignature(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const stepText = useMemo(() => {
    switch (step) {
      case 1:
        return "Preparing mint…";
      case 2:
        return "Building transaction…";
      case 3:
        return "Confirm in your wallet…";
      case 4:
        return "Finalizing on-chain…";
      default:
        return "Minting…";
    }
  }, [step]);

  const handleMint = useCallback(async () => {
    if (!tierInfo) {
      toast.error("Missing tier data. Please re-scan.");
      return;
    }
    if (!walletAdapter?.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (tierInfo.tier === "TOO_POOR") {
      toast.error("🥀 Oinkless — You need at least $10 to mint.");
      return;
    }
    if (!candyMachineId) {
      toast.error("Missing Candy Machine configuration for this tier.");
      return;
    }

    setPhase("minting");
    setError(null);
    setSignature(null);

    const toastId = toast.loading(`Minting NFT #${tierInfo.nftNumber ?? "?"}…`);

    try {
      setStep(1);
      await new Promise((r) => setTimeout(r, 200));
      setStep(2);
      await new Promise((r) => setTimeout(r, 200));
      setStep(3);

      const res = await mintNFT(walletAdapter, candyMachineId);

      setStep(4);

      if (!res.success || !res.signature) {
        throw new Error(res.error || "Mint failed");
      }

      setSignature(res.signature);
      setPhase("success");
      toast.success("🎉 Mint successful!");
      onMinted?.(res.signature);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Mint failed";
      setError(msg);
      setPhase("error");
      toast.error(msg);
    } finally {
      toast.dismiss(toastId);
    }
  }, [tierInfo, walletAdapter, candyMachineId, onMinted]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border-2 border-black bg-white shadow-hard p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xl font-pangolin font-bold text-black">{title}</div>
            <div className="text-sm text-gray-700">
              {appName} • Network fee only (~0.001 SOL)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg border-2 border-black bg-white hover:bg-gray-50 font-pangolin font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border-2 border-black overflow-hidden mb-4 bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100">
          <div className="w-full h-44 sm:h-52 bg-black/10">
            <img
              src={previewImageUrl}
              alt="NFT preview"
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-pangolin text-gray-800">
                Tier:{" "}
                <span className="font-bold text-black">
                  {tierInfo ? getTierDisplayName(tierInfo.tier) : "—"}
                </span>
              </div>
              <div className="text-sm font-pangolin text-gray-800">
                NFT:{" "}
                <span className="font-bold text-black">
                  #{tierInfo?.nftNumber ?? "—"}
                </span>
              </div>
            </div>
            {tierInfo?.nftRange && (
              <div className="mt-1 text-xs text-gray-700 font-pangolin">
                Range: #{tierInfo.nftRange[0]}–{tierInfo.nftRange[1]}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-700 font-mono break-all">
              {tierInfo?.walletAddress ? `Wallet: ${tierInfo.walletAddress}` : ""}
            </div>
          </div>
        </div>

        {phase === "minting" && (
          <div className="mb-4 p-4 rounded-xl border-2 border-black bg-pastel-yellow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-pangolin font-bold text-black">Minting…</div>
              <div className="text-sm font-pangolin text-gray-800">
                {step}/4
              </div>
            </div>
            <StepBar step={step} />
            <div className="mt-3 text-sm font-pangolin text-gray-800">{stepText}</div>
          </div>
        )}

        {phase === "error" && error && (
          <div className="mb-4 p-4 rounded-xl border-2 border-black bg-red-100">
            <div className="font-pangolin font-bold text-black mb-1">Minting error</div>
            <div className="text-sm text-gray-800">{error}</div>
          </div>
        )}

        {phase === "success" && signature && (
          <div className="mb-4 p-4 rounded-xl border-2 border-black bg-pastel-green">
            <div className="font-pangolin font-bold text-black mb-1">Mint successful</div>
            <div className="text-xs font-mono break-all text-gray-900">{signature}</div>
          </div>
        )}

        <div className="grid gap-2">
          {phase !== "success" && (
            <button
              type="button"
              onClick={handleMint}
              disabled={!canMint || phase === "minting"}
              className="blob-button bg-gradient-to-r from-pink-400 to-purple-400 text-white font-pangolin font-bold text-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {tierInfo?.tier === "TOO_POOR"
                  ? "🥀 OINKLESS — NO MINT"
                  : `🐷 Mint NFT #${tierInfo?.nftNumber ?? "?"} 🐷`}
              </span>
            </button>
          )}

          {phase === "success" && signature && (
            <button
              type="button"
              onClick={() => window.open(explorerTxUrl(signature, rpcUrl), "_blank", "noopener,noreferrer")}
              className="px-4 py-3 rounded-xl border-2 border-black bg-white hover:bg-gray-50 font-pangolin font-bold"
            >
              View on Solana Explorer
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl border-2 border-black bg-white hover:bg-gray-50 font-pangolin font-bold"
          >
            {phase === "success" ? "Close" : "Cancel"}
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-600 font-pangolin">
          {rpcUrl
            ? `RPC: ${rpcUrl.includes("devnet") ? "devnet" : rpcUrl.includes("testnet") ? "testnet" : "mainnet"}`
            : "RPC: default"}
        </div>
      </div>
    </div>
  );
}


