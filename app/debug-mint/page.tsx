"use client";

import React, { useMemo, useState } from "react";
import NFTMintingModal from "../../components/NFTMintingModal";

export default function DebugMintPage() {
  const [open, setOpen] = useState(false);

  const mockEnabled = process.env.NEXT_PUBLIC_E2E_MOCK === "1";

  const walletAdapter = useMemo(() => {
    return {
      publicKey: {
        toBase58: () => "9xQeWvG816bUx9EPfS4nZr7Ao7P5PLf4KJc4jVbZ4v2Q",
      },
    } as any;
  }, []);

  // This page is meant for automated tests / local debugging only.
  if (!mockEnabled) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Debug Mint</h1>
          <p className="mt-2 text-sm text-gray-700">
            Disabled. Set <code className="font-mono">NEXT_PUBLIC_E2E_MOCK=1</code> to enable.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <NFTMintingModal
        open={open}
        onClose={() => setOpen(false)}
        walletAdapter={walletAdapter}
        tierInfo={{
          tier: "POOR",
          walletAddress: "9xQeWvG816bUx9EPfS4nZr7Ao7P5PLf4KJc4jVbZ4v2Q",
          balance: 1,
          balanceUSD: 100,
          nftNumber: 12,
          nftRange: [0, 400],
        }}
        mintFn={async (_wallet, _candyMachineId) => ({
          success: true,
          signature: "E2E_SIGNATURE_1111111111111111111111111111111111",
          mintAddress: "So11111111111111111111111111111111111111112",
          message: "E2E mint ok",
        })}
        fetchMintedNft={async () => ({
          name: "E2E Oinkonomics #12",
          imageUrl: "https://example.com/e2e-nft.png",
        })}
      />

      <button
        type="button"
        className="px-6 py-3 rounded-xl border-2 border-black bg-white hover:bg-gray-50 font-bold"
        onClick={() => setOpen(true)}
      >
        Open mint modal (E2E)
      </button>
    </main>
  );
}


