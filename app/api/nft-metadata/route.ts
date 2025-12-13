import { NextRequest, NextResponse } from "next/server";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, fetchMetadata, findMetadataPda } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

export const runtime = "nodejs";

type Ok = {
  ok: true;
  mintAddress: string;
  name?: string;
  symbol?: string;
  uri?: string;
  imageUrl?: string;
};

type Err = {
  ok: false;
  error: string;
};

function isValidSolanaAddress(s: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { mintAddress?: string };
    const mintAddress = (body?.mintAddress ?? "").trim();

    if (!mintAddress || !isValidSolanaAddress(mintAddress)) {
      return NextResponse.json<Err>({ ok: false, error: "Invalid mintAddress" }, { status: 400 });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
    const umi = createUmi(rpcUrl).use(mplTokenMetadata());

    const mintPk = publicKey(mintAddress);
    const metadataPda = findMetadataPda(umi, { mint: mintPk });
    const md = await fetchMetadata(umi, metadataPda);

    // `fetchMetadata` returns an Account-like object where fields are exposed directly (uri/name/symbol).
    const uri = ((md as any)?.uri ?? "").toString().trim();
    const name = ((md as any)?.name ?? "").toString().trim();
    const symbol = ((md as any)?.symbol ?? "").toString().trim();

    let imageUrl: string | undefined = undefined;
    if (uri) {
      const metaRes = await fetch(uri, { headers: { accept: "application/json" } });
      if (metaRes.ok) {
        const j = (await metaRes.json().catch(() => null)) as any;
        const candidate = (j?.image ?? j?.image_url ?? j?.properties?.image ?? "").toString();
        if (candidate) imageUrl = candidate;
      }
    }

    return NextResponse.json<Ok>({
      ok: true,
      mintAddress,
      name: name || undefined,
      symbol: symbol || undefined,
      uri: uri || undefined,
      imageUrl,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to resolve NFT metadata";
    return NextResponse.json<Err>({ ok: false, error: msg }, { status: 500 });
  }
}


