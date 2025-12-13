import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NFTMintingModal from "../components/NFTMintingModal";

jest.mock("../lib/utils", () => ({
  getCandyMachineIdForTier: () => "8U521JkUs3AyBJSq8Bm3TEnwgmNrbaVpkmx9tfQDCMU",
  getTierDisplayName: (t: string) => t,
  mintNFT: jest.fn(),
}));

function makeWalletAdapter() {
  return {
    publicKey: {
      toBase58: () => "9xQeWvG816bUx9EPfS4nZr7Ao7P5PLf4KJc4jVbZ4v2Q",
    },
  } as any;
}

describe("NFTMintingModal", () => {
  test("mints (mock) then loads and displays the real minted image (mock metadata)", async () => {
    const mintFn = jest.fn().mockResolvedValue({
      success: true,
      signature: "5Y7r9s9pV3wYpZtX2kYz8n9wqkGQh3XxXk9nYp8m2b1s",
      mintAddress: "So11111111111111111111111111111111111111112",
      message: "ok",
    });

    const fetchMintedNft = jest.fn().mockResolvedValue({
      name: "Oinkonomics #1",
      imageUrl: "https://example.com/nft.png",
    });

    render(
      <NFTMintingModal
        open
        onClose={() => {}}
        walletAdapter={makeWalletAdapter()}
        tierInfo={{
          tier: "POOR",
          walletAddress: "9xQeWvG816bUx9EPfS4nZr7Ao7P5PLf4KJc4jVbZ4v2Q",
          balance: 1,
          balanceUSD: 100,
          nftNumber: 12,
          nftRange: [0, 400],
        }}
        mintFn={mintFn}
        fetchMintedNft={fetchMintedNft}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /mint nft/i }));

    await waitFor(() => expect(mintFn).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(fetchMintedNft).toHaveBeenCalledWith("So11111111111111111111111111111111111111112"));

    await waitFor(() => {
      const img = screen.getByRole("img", { name: /oinkonomics #1/i }) as HTMLImageElement;
      expect(img.getAttribute("src")).toBe("https://example.com/nft.png");
    });

    expect(screen.getByText(/Oinkonomics #1/i)).toBeInTheDocument();
  });
});


