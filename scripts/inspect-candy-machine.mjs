import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { mplCandyMachine, fetchCandyMachine } from "@metaplex-foundation/mpl-candy-machine";

const candyMachineId =
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ID ||
  process.env.CANDY_MACHINE_ID ||
  "8U521JkUs3AyBJSq8Bm3TEnwgmNrbaVpkmx9tfQDCMU";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

async function main() {
  const umi = createUmi(rpcUrl).use(mplCandyMachine());
  const cmPk = publicKey(candyMachineId);

  const cm = await fetchCandyMachine(umi, cmPk);

  const itemsAvailable = Number(cm.data.itemsAvailable ?? 0);
  const itemsRedeemed = Number(cm.itemsRedeemed ?? 0);

  // Some versions expose features tokenStandard etc; we keep it defensive.
  console.log("=== Candy Machine Inspect ===");
  console.log("RPC:", rpcUrl);
  console.log("CandyMachine:", candyMachineId);
  console.log("Authority:", cm.authority?.toString?.() ?? String(cm.authority));
  console.log("MintAuthority:", cm.mintAuthority?.toString?.() ?? String(cm.mintAuthority));
  console.log("CollectionMint:", cm.collectionMint?.toString?.() ?? String(cm.collectionMint));
  console.log("TokenStandard:", cm.tokenStandard ?? "(unknown)");
  console.log("ItemsAvailable:", itemsAvailable);
  console.log("ItemsRedeemed:", itemsRedeemed);
  console.log("ItemsRemaining:", Math.max(0, itemsAvailable - itemsRedeemed));
  console.log("IsSoldOut:", itemsAvailable > 0 ? itemsRedeemed >= itemsAvailable : "(unknown)");
  console.log("=============================");
}

main().catch((e) => {
  console.error("inspect-candy-machine failed:", e);
  process.exit(1);
});


