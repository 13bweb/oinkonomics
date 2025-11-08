import { NextRequest, NextResponse } from 'next/server';
import { verifyWalletTier } from '../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const tierInfo = await verifyWalletTier(walletAddress);
    
    return NextResponse.json({
      walletAddress,
      tier: tierInfo.tier,
      balance: Math.round(tierInfo.balance * 1000000) / 1000000, // SOL with micro precision
      balanceUSD: Math.round((tierInfo.balanceUSD ?? 0) * 100) / 100,
      minThreshold: tierInfo.minThreshold,
      maxThreshold: tierInfo.maxThreshold,
      nftRange: tierInfo.nftRange,
      nftNumber: tierInfo.nftNumber,
      verified: true,
      message: getTierMessage(tierInfo.tier, tierInfo.nftNumber ?? null)
    });

  } catch (error) {
    console.error('❌ Erreur API verify-tier:', error);
    return NextResponse.json(
      { error: 'Verification failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

function getTierMessage(tier: string, nftNumber: number | null): string {
  switch (tier) {
    case 'TOO_POOR':
      return "😱 You need at least $10 to mint! Come back when you're less poor!";
    case 'POOR':
      return "🥉 Bronze Tier - You can mint NFT #" + nftNumber + " (Range: #1-100)";
    case 'MID':
      return "🥈 Silver Tier - You can mint NFT #" + nftNumber + " (Range: #100-200)";
    case 'RICH':
      return "🥇 Gold Tier - You can mint NFT #" + nftNumber + " (Range: #200-300)";
    default:
      return 'Unknown tier';
  }
}
