import { NextRequest, NextResponse } from 'next/server';
import { getCandyMachineIdForTier, getTierDisplayName, verifyWalletTier } from '../../../lib/utils';
import { checkRateLimit } from '../../../lib/rate-limit';
import { logger } from '../../../lib/logger';

// Constantes de sécurité
const MAX_BODY_SIZE = 1024; // 1KB max pour le body

// Fonction de validation d'adresse Solana
function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== 'string') return false;
  // Adresse Solana base58: 32-44 caractères
  if (address.length < 32 || address.length > 44) return false;
  // Vérifier que c'est du base58 (pas de 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

// Protection CSRF basique - vérifier l'origine
function isValidOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;

  // En développement, accepter localhost
  if (process.env.NODE_ENV === 'development') {
    return origin.includes('localhost') || origin.includes('127.0.0.1');
  }

  // En production, vérifier que l'origine correspond au host
  try {
    const originUrl = new URL(origin);
    const hostUrl = new URL(`https://${host}`);
    return originUrl.hostname === hostUrl.hostname;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const rateLimitResult = await checkRateLimit(ip);

    if (!rateLimitResult.success) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': '60',
          },
        }
      );
    }

    // 2. Protection CSRF - vérifier l'origine
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (!isValidOrigin(origin, host)) {
      logger.warn(`Invalid origin: ${origin} for host: ${host}`);
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }

    // 3. Validation de la taille du body
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Lire le body avec limitation de taille
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
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
    logger.error('❌ Erreur API verify-tier:', error);

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
  const label = getTierDisplayName(tier);
  switch (tier) {
    case 'TOO_POOR':
      return "🥀 Oinkless — You need at least $10 to mint. Come back when you’re not oinkless!";
    case 'POOR':
      return `🐷 ${label} — You can mint NFT #${nftNumber} (Range: #0-400)`;
    case 'MID':
      return `🐽 ${label} — You can mint NFT #${nftNumber} (Range: #400-800)`;
    case 'RICH':
      return `🐗 ${label} — You can mint NFT #${nftNumber} (Range: #800-12000)`;
    default:
      return 'Unknown tier';
  }
}
