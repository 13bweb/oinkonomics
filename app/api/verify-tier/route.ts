import { NextRequest, NextResponse } from 'next/server';
import { getCandyMachineIdForTier, verifyWalletTier } from '../../../lib/utils';

// Fonction de validation d'adresse Solana
function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== 'string') return false;
  // Adresse Solana base58: 32-44 caractères
  if (address.length < 32 || address.length > 44) return false;
  // Vérifier que c'est du base58 (pas de 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    // Validation de la présence
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validation du type
    if (typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Wallet address must be a string' },
        { status: 400 }
      );
    }

    // Validation du format (adresse Solana valide)
    if (!isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Limiter la longueur pour éviter les attaques DoS
    if (walletAddress.length > 44) {
      return NextResponse.json(
        { error: 'Wallet address too long' },
        { status: 400 }
      );
    }

    const tierInfo = await verifyWalletTier(walletAddress);
    const candyMachineId = getCandyMachineIdForTier(tierInfo.tier);

    return NextResponse.json({
      walletAddress,
      tier: tierInfo.tier,
      balance: Math.round(tierInfo.balance * 1000000) / 1000000, // SOL with micro precision
      balanceUSD: Math.round((tierInfo.balanceUSD ?? 0) * 100) / 100,
      minThreshold: tierInfo.minThreshold,
      maxThreshold: tierInfo.maxThreshold,
      nftRange: tierInfo.nftRange,
      nftNumber: tierInfo.nftNumber,
      candyMachineId: candyMachineId,
      verified: true,
      message: getTierMessage(tierInfo.tier, tierInfo.nftNumber ?? null)
    });

  } catch (error) {
    // Logger l'erreur complète côté serveur uniquement
    console.error('❌ Erreur API verify-tier:', error);

    // Ne pas exposer les détails de l'erreur au client
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: isDevelopment
          ? `Verification failed: ${errorMessage}`
          : 'Verification failed. Please try again later.'
      },
      { status: 500 }
    );
  }
}

function getTierMessage(tier: string, nftNumber: number | null): string {
  switch (tier) {
    case 'TOO_POOR':
      return "😱 You need at least $10 to mint! Come back when you're less poor!";
    case 'POOR':
      return "🥉 Bronze Tier - You can mint NFT #" + nftNumber + " (Range: #1-1000)";
    case 'MID':
      return "🥈 Silver Tier - You can mint NFT #" + nftNumber + " (Range: #1001-2000)";
    case 'RICH':
      return "🥇 Gold Tier - You can mint NFT #" + nftNumber + " (Range: #2001-3000)";
    default:
      return 'Unknown tier';
  }
}
