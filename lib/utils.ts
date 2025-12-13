import { mint, mintV2, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { generateSigner, publicKey, transactionBuilder } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { type ClassValue, clsx } from "clsx";
import { createHash } from 'crypto';
import { twMerge } from "tailwind-merge";
import { WalletTier, WalletTierInfo } from '../types/globals';
import { fetchWithTimeout } from './fetch-with-timeout';
import { logger } from './logger';
import { getCachedPrice, setCachedPrice } from './price-cache';

const PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
// Candy Guard ID (OPTIONNEL).
// - Si la Candy Machine est "guarded", configurez NEXT_PUBLIC_CANDY_GUARD.
// - Si vous voulez des NFTs standards sans guard, laissez vide.
const CANDY_GUARD = (process.env.NEXT_PUBLIC_CANDY_GUARD ?? "").trim();
// Collection Mint (FORCÉ) — correction CollectionKeyMismatch
const COLLECTION_MINT = 'BFrUnaC3S7c5vD4BrySjhmVRLhEkLw74UhGVVX1FZxDE';
const COLLECTION_UPDATE_AUTHORITY = process.env.NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY || '';
const COMPUTE_UNIT_LIMIT = Number(process.env.NEXT_PUBLIC_COMPUTE_UNIT_LIMIT ?? 400000);
const COMPUTE_UNIT_MICROLAMPORTS = Number(process.env.NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS ?? 0);
// Candy Machine ID (FORCÉ) — pour éviter les mauvaises configs locales.
// Si vous voulez changer, modifiez ce fichier ou repassez à une lecture env.
const DEFAULT_CANDY_MACHINE_ID = '8U521JkUs3AyBJSq8Bm3TEnwgmNrbaVpkmx9tfQDCMU';

const candyMachineByTier: Record<WalletTier, string | null> = {
  TOO_POOR: null,
  POOR: DEFAULT_CANDY_MACHINE_ID,
  MID: DEFAULT_CANDY_MACHINE_ID,
  RICH: DEFAULT_CANDY_MACHINE_ID,
};

// Validation des variables d'environnement critiques en production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL.includes('your-') || process.env.NEXT_PUBLIC_RPC_URL.includes('votre-')) {
    missingVars.push('NEXT_PUBLIC_RPC_URL');
  }
  if (!COLLECTION_MINT || COLLECTION_MINT.includes('your-') || COLLECTION_MINT.includes('votre-')) {
    missingVars.push('NEXT_PUBLIC_COLLECTION_MINT');
  }
  if (!COLLECTION_UPDATE_AUTHORITY || COLLECTION_UPDATE_AUTHORITY.includes('your-') || COLLECTION_UPDATE_AUTHORITY.includes('votre-')) {
    missingVars.push('NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY');
  }
  // Candy Machine IDs: accepte soit une valeur globale, soit les 3 valeurs par tier
  const hasGlobalCandyMachine = Boolean(
    DEFAULT_CANDY_MACHINE_ID &&
    !DEFAULT_CANDY_MACHINE_ID.includes('your-') &&
    !DEFAULT_CANDY_MACHINE_ID.includes('votre-')
  );

  if (!hasGlobalCandyMachine) {
    if (!process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_POOR || process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_POOR.includes('your-') || process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_POOR.includes('votre-')) {
      missingVars.push('NEXT_PUBLIC_CANDY_MACHINE_ID_POOR');
    }
    if (!process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_MID || process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_MID.includes('your-') || process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_MID.includes('votre-')) {
      missingVars.push('NEXT_PUBLIC_CANDY_MACHINE_ID_MID');
    }
    if (!process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_RICH || process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_RICH.includes('your-') || process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_RICH.includes('votre-')) {
      missingVars.push('NEXT_PUBLIC_CANDY_MACHINE_ID_RICH');
    }
  }

  if (missingVars.length > 0) {
    logger.error('❌ ERREUR: Variables d\'environnement manquantes ou non configurées:');
    missingVars.forEach(v => logger.error(`   - ${v}`));
    logger.error('⚠️  Configurez toutes les variables requises avant le déploiement.');
  }
}

// Validation des variables d'environnement critiques (uniquement en développement)
if (process.env.NODE_ENV === 'development') {
  logger.log('🚀 OINKONOMICS - Mode développement actif');
  // Ne pas logger les valeurs sensibles même en dev
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Types pour les instructions Solana
interface SolanaInstructionKey {
  pubkey: { toBase58(): string; };
  isSigner: boolean;
  isWritable: boolean;
}

interface SolanaInstruction {
  programId: { toBase58(): string; };
  keys: SolanaInstructionKey[];
  data: Uint8Array | Buffer | number[];
}

// Helper pour convertir les instructions Solana en format UMI (exactement comme hashlips)
function toUmiInstruction(ix: SolanaInstruction) {
  return {
    instruction: {
      programId: publicKey(ix.programId.toBase58()),
      keys: ix.keys.map((key: SolanaInstructionKey) => ({
        pubkey: publicKey(key.pubkey.toBase58()),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: new Uint8Array(ix.data),
    },
    signers: [],
    bytesCreatedOnChain: 0,
  };
}

// Configuration des tiers basés sur la valeur USD avec numéros NFT
export const TIER_THRESHOLDS = {
  TOO_POOR: { min: 0, max: 10, nftRange: null },              // Moins de 10$ - pas de mint possible
  // Ranges de numéros NFT (demandés): POOR 0-400, MID 400-800, RICH 800-12000
  POOR: { min: 10, max: 1000, nftRange: [0, 400] },
  MID: { min: 1000, max: 10000, nftRange: [400, 800] },
  RICH: { min: 10000, max: null, nftRange: [800, 12000] }
} as const;

export function getTierDisplayName(tier: string): string {
  switch (tier) {
    case 'TOO_POOR':
      return 'Oinkless';
    case 'POOR':
      return 'Piglets';
    case 'MID':
      return 'City Swine';
    case 'RICH':
      return 'Oinklords';
    default:
      return tier;
  }
}

// Récupère le prix SOL en USD via CoinGecko (fallback à 0 si échec)
// Utilise un cache et un timeout pour éviter les blocages
export async function fetchSOLPriceUSD(): Promise<number> {
  const cacheKey = 'sol_price_usd';

  // Vérifier le cache
  const cachedPrice = getCachedPrice(cacheKey);
  if (cachedPrice !== null) {
    logger.debug('SOL price from cache:', cachedPrice);
    return cachedPrice;
  }

  try {
    const res = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {},
      5000 // 5 secondes timeout
    );

    if (!res.ok) {
      logger.warn('CoinGecko returned non-ok status for SOL price:', res.status);
      return 0;
    }

    const j = await res.json();
    const price = j?.solana?.usd ?? 0;

    if (typeof price === 'number' && price > 0) {
      // Mettre en cache uniquement si le prix est valide
      setCachedPrice(cacheKey, price);
      return price;
    }

    return 0;
  } catch (error) {
    logger.warn('Failed to fetch SOL price from CoinGecko:', error);
    return 0;
  }
}

export function getWalletTier(balanceSOL: number, solPriceUSD: number, walletAddress?: string): WalletTierInfo {
  const balanceUSD = balanceSOL * (solPriceUSD || 0);

  // balance is expressed in SOL, balanceUSD added separately in the returned object
  if (balanceUSD < TIER_THRESHOLDS.TOO_POOR.max) {
    return {
      tier: 'TOO_POOR',
      balance: balanceSOL,
      balanceUSD,
      minThreshold: TIER_THRESHOLDS.TOO_POOR.min,
      maxThreshold: TIER_THRESHOLDS.TOO_POOR.max,
      nftRange: TIER_THRESHOLDS.TOO_POOR.nftRange
    };
  } else if (balanceUSD < TIER_THRESHOLDS.POOR.max) {
    const tier = 'POOR';
    return {
      tier,
      balance: balanceSOL,
      balanceUSD,
      minThreshold: TIER_THRESHOLDS.POOR.min,
      maxThreshold: TIER_THRESHOLDS.POOR.max,
      nftRange: TIER_THRESHOLDS.POOR.nftRange,
      nftNumber: walletAddress ? generateNFTNumber(tier, walletAddress) : null
    };
  } else if (balanceUSD < TIER_THRESHOLDS.MID.max) {
    const tier = 'MID';
    return {
      tier,
      balance: balanceSOL,
      balanceUSD,
      minThreshold: TIER_THRESHOLDS.MID.min,
      maxThreshold: TIER_THRESHOLDS.MID.max,
      nftRange: TIER_THRESHOLDS.MID.nftRange,
      nftNumber: walletAddress ? generateNFTNumber(tier, walletAddress) : null
    };
  } else {
    const tier = 'RICH';
    return {
      tier,
      balance: balanceSOL,
      balanceUSD,
      minThreshold: TIER_THRESHOLDS.RICH.min,
      maxThreshold: TIER_THRESHOLDS.RICH.max,
      nftRange: TIER_THRESHOLDS.RICH.nftRange,
      nftNumber: walletAddress ? generateNFTNumber(tier, walletAddress) : null
    };
  }
}

// Nouvelle fonction: calcule le tier basé sur la valeur USD TOTALE (SOL + tokens)
export function getWalletTierFromUSD(totalUSD: number, solBalance: number, walletAddress?: string): WalletTierInfo {
  // Utilise totalUSD pour déterminer le tier (au lieu de balanceSOL * solPriceUSD)
  if (totalUSD < TIER_THRESHOLDS.TOO_POOR.max) {
    return {
      tier: 'TOO_POOR',
      balance: solBalance,
      balanceUSD: totalUSD,
      minThreshold: TIER_THRESHOLDS.TOO_POOR.min,
      maxThreshold: TIER_THRESHOLDS.TOO_POOR.max,
      nftRange: TIER_THRESHOLDS.TOO_POOR.nftRange
    };
  } else if (totalUSD < TIER_THRESHOLDS.POOR.max) {
    const tier = 'POOR';
    return {
      tier,
      balance: solBalance,
      balanceUSD: totalUSD,
      minThreshold: TIER_THRESHOLDS.POOR.min,
      maxThreshold: TIER_THRESHOLDS.POOR.max,
      nftRange: TIER_THRESHOLDS.POOR.nftRange,
      nftNumber: walletAddress ? generateNFTNumber(tier, walletAddress) : null
    };
  } else if (totalUSD < TIER_THRESHOLDS.MID.max) {
    const tier = 'MID';
    return {
      tier,
      balance: solBalance,
      balanceUSD: totalUSD,
      minThreshold: TIER_THRESHOLDS.MID.min,
      maxThreshold: TIER_THRESHOLDS.MID.max,
      nftRange: TIER_THRESHOLDS.MID.nftRange,
      nftNumber: walletAddress ? generateNFTNumber(tier, walletAddress) : null
    };
  } else {
    const tier = 'RICH';
    return {
      tier,
      balance: solBalance,
      balanceUSD: totalUSD,
      minThreshold: TIER_THRESHOLDS.RICH.min,
      maxThreshold: TIER_THRESHOLDS.RICH.max,
      nftRange: TIER_THRESHOLDS.RICH.nftRange,
      nftNumber: walletAddress ? generateNFTNumber(tier, walletAddress) : null
    };
  }
}

// Récupère tous les tokens SPL d'un wallet avec leurs prix en USD
export async function getTokenBalances(walletAddress: string): Promise<{ mint: string; balance: number; decimals: number; }[]> {
  try {
    const connection = new Connection(PUBLIC_RPC_URL);
    const publicKey = new PublicKey(walletAddress);

    // Récupérer tous les token accounts
    const { value: tokenAccounts } = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program
    });

    const tokens: { mint: string; balance: number; decimals: number; }[] = [];

    for (const account of tokenAccounts) {
      const parsedInfo = account.account.data.parsed.info;
      const balance = parsedInfo.tokenAmount.uiAmount;

      // Ignorer les tokens avec balance 0
      if (balance > 0) {
        tokens.push({
          mint: parsedInfo.mint,
          balance: balance,
          decimals: parsedInfo.tokenAmount.decimals,
        });
      }
    }

    return tokens;
  } catch (error) {
    logger.warn('Erreur lors de la récupération des tokens:', error);
    return [];
  }
}

// Récupère les prix des tokens depuis DeFiLlama avec cache et timeout
export async function getTokenPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) return {};

  const prices: Record<string, number> = {};
  const uncachedMints: string[] = [];

  // Vérifier le cache pour chaque mint
  for (const mint of mints) {
    const cacheKey = `token_price_${mint}`;
    const cachedPrice = getCachedPrice(cacheKey);
    if (cachedPrice !== null) {
      prices[mint] = cachedPrice;
    } else {
      uncachedMints.push(mint);
    }
  }

  // Si tous les prix sont en cache, retourner directement
  if (uncachedMints.length === 0) {
    return prices;
  }

  try {
    // DeFiLlama API pour les prix Solana
    const coinsParam = uncachedMints.map(mint => `solana:${mint}`).join(',');
    const response = await fetchWithTimeout(
      `https://coins.llama.fi/prices/current/${coinsParam}`,
      {},
      5000 // 5 secondes timeout
    );

    if (!response.ok) {
      logger.warn('DeFiLlama API error:', response.status);
      return prices; // Retourner les prix en cache même si l'API échoue
    }

    const data = await response.json();

    for (const mint of uncachedMints) {
      const key = `solana:${mint}`;
      if (data.coins?.[key]?.price) {
        const price = data.coins[key].price;
        prices[mint] = price;
        // Mettre en cache
        setCachedPrice(`token_price_${mint}`, price);
      }
    }

    return prices;
  } catch (error) {
    logger.warn('Erreur lors de la récupération des prix:', error);
    return prices; // Retourner les prix en cache même en cas d'erreur
  }
}

// Calcule la valeur totale du wallet (SOL + tous les tokens SPL)
// Optimisé avec parallélisation des appels RPC
export async function getTotalWalletValue(walletAddress: string): Promise<{ totalUSD: number; solBalance: number; solValueUSD: number; tokensValueUSD: number; }> {
  try {
    const connection = new Connection(PUBLIC_RPC_URL);
    const publicKey = new PublicKey(walletAddress);

    // Paralléliser les appels RPC pour améliorer les performances
    const [solBalance, tokens] = await Promise.all([
      connection.getBalance(publicKey),
      getTokenBalances(walletAddress)
    ]);

    const solBalanceInSOL = solBalance / LAMPORTS_PER_SOL;

    // Paralléliser la récupération du prix SOL et des prix des tokens
    const [solPriceUSD, prices] = await Promise.all([
      fetchSOLPriceUSD(),
      getTokenPrices(tokens.map(t => t.mint))
    ]);

    const solValueUSD = solBalanceInSOL * solPriceUSD;

    // Calculer la valeur totale des tokens
    let tokensValueUSD = 0;
    for (const token of tokens) {
      const price = prices[token.mint] || 0;
      tokensValueUSD += token.balance * price;
    }

    const totalUSD = solValueUSD + tokensValueUSD;

    logger.log('💰 Valeur totale du wallet:', {
      solBalance: solBalanceInSOL.toFixed(4),
      solValueUSD: solValueUSD.toFixed(2),
      tokensValueUSD: tokensValueUSD.toFixed(2),
      totalUSD: totalUSD.toFixed(2),
      tokensCount: tokens.length
    });

    return {
      totalUSD,
      solBalance: solBalanceInSOL,
      solValueUSD,
      tokensValueUSD
    };
  } catch (error) {
    logger.error('Erreur lors du calcul de la valeur totale:', error);
    throw new Error('Impossible de calculer la valeur totale du wallet');
  }
}

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(PUBLIC_RPC_URL);
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    logger.error('Erreur lors de la récupération du solde:', error);
    throw new Error('Impossible de récupérer le solde du wallet');
  }
}

export async function verifyWalletTier(walletAddress: string): Promise<WalletTierInfo> {
  try {
    // Calculer la valeur totale du wallet (SOL + tokens)
    const { totalUSD, solBalance } = await getTotalWalletValue(walletAddress);

    // Utiliser la NOUVELLE fonction qui calcule le tier avec totalUSD directement
    // Passer walletAddress pour génération NFT déterministe
    const tierInfo = getWalletTierFromUSD(totalUSD, solBalance, walletAddress);

    logger.log('🎯 Tier calculé:', {
      totalUSD: totalUSD.toFixed(2),
      solBalance: solBalance.toFixed(4),
      tier: tierInfo.tier,
      nftNumber: tierInfo.nftNumber
    });

    return tierInfo;
  } catch (error) {
    logger.error('Erreur lors de la vérification du tier:', error);
    throw error;
  }
}

/**
 * Génère un numéro NFT déterministe basé sur l'adresse du wallet et le tier
 * Utilise SHA256 pour garantir l'unicité et la reproductibilité
 */
export function generateNFTNumber(tier: WalletTier, walletAddress: string): number | null {
  const tierConfig = TIER_THRESHOLDS[tier];
  if (!tierConfig.nftRange) return null;

  const [min, max] = tierConfig.nftRange;
  const range = max - min + 1;

  // Hash déterministe basé sur l'adresse du wallet et le tier
  // Utilise crypto.createHash côté serveur, ou une implémentation côté client
  let hashNum: number;

  if (typeof window === 'undefined') {
    // Côté serveur: utiliser crypto
    const hash = createHash('sha256')
      .update(walletAddress + tier)
      .digest('hex');
    hashNum = parseInt(hash.substring(0, 8), 16);
  } else {
    // Côté client: utiliser Web Crypto API
    // Note: Cette fonction devrait principalement être appelée côté serveur
    // Pour le client, on peut utiliser une version simplifiée
    const str = walletAddress + tier;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    hashNum = Math.abs(hash);
  }

  // Convertir en nombre dans la plage
  return min + (hashNum % range);
}

export function getNFTRangeForTier(tier: WalletTier): string {
  const tierConfig = TIER_THRESHOLDS[tier];
  if (!tierConfig.nftRange) return "Aucun NFT disponible";

  const [min, max] = tierConfig.nftRange;
  return `NFT #${min}-${max}`;
}

export const createUmiInstance = (wallet: WalletAdapter) => {
  const umi = createUmi(PUBLIC_RPC_URL);
  return umi
    .use(walletAdapterIdentity(wallet))
    .use(mplTokenMetadata())
    .use(mplCandyMachine());
};

export const getCandyMachineIdForTier = (tier: WalletTier): string | null => {
  return candyMachineByTier[tier] ?? null;
};

export const mintNFT = async (wallet: WalletAdapter, candyMachineId: string) => {
  try {
    logger.log('🎯 MINT GRATUIT - Oinkonomics NFT...', { candyMachineId });

    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet non connecté');
    }

    if (!COLLECTION_MINT || !COLLECTION_UPDATE_AUTHORITY) {
      throw new Error('Configuration mint incomplète. Vérifiez les variables NEXT_PUBLIC_COLLECTION_MINT et NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY.');
    }

    // Initialiser UMI avec wallet adapter
    const umi = createUmiInstance(wallet);

    // Informations de la Candy Machine Oinkonomics
    const candyMachine = publicKey(candyMachineId);
    const collectionMint = publicKey(COLLECTION_MINT);
    const collectionUpdateAuthority = publicKey(COLLECTION_UPDATE_AUTHORITY);

    // Générer le NFT mint
    const nftMint = generateSigner(umi);

    logger.log('🔧 Configuration Candy Machine:', {
      candyMachine: candyMachine.toString(),
      candyGuard: CANDY_GUARD ? CANDY_GUARD : '(none)',
      collectionMint: collectionMint.toString(),
      collectionUpdateAuthority: collectionUpdateAuthority.toString(),
      nftMint: nftMint.publicKey.toString()
    });

    // Mint:
    // - si NEXT_PUBLIC_CANDY_GUARD est configuré => mintV2 (Candy Guard actif)
    // - sinon => mint (Candy Machine sans guard)
    const builder = transactionBuilder().add(setComputeUnitLimit(umi, { units: COMPUTE_UNIT_LIMIT }));

    const result = CANDY_GUARD
      ? await builder
        .add(
          mintV2(umi, {
            candyMachine,
            candyGuard: publicKey(CANDY_GUARD),
            nftMint,
            collectionMint,
            collectionUpdateAuthority,
            // IMPORTANT: si des guards (allowList/solPayment/...) sont actifs on-chain,
            // il faut fournir les mintArgs correspondants. Ici on force le mint public/gratuit,
            // donc aucun solPayment/allowList n'est envoyé.
            mintArgs: {}
          } as any)
        )
        .sendAndConfirm(umi)
      : await builder
        .add(
          mint(umi, {
            candyMachine,
            nftMint: nftMint.publicKey,
            collectionMint,
            collectionUpdateAuthority,
          } as any)
        )
        .sendAndConfirm(umi);

    logger.log('✅ NFT Oinkonomics GRATUIT minté avec succès !', {
      signature: result.signature.toString()
    });

    // Note: mintFromCandyMachineV2 retourne { signature } mais pas le mint address directement
    // Le mint address peut être récupéré depuis les logs de transaction si nécessaire

    return {
      success: true,
      signature: result.signature.toString(),
      mintAddress: nftMint.publicKey.toString(),
      message: `🎉 NFT Oinkonomics minté gratuitement ! Signature: ${result.signature.toString().substring(0, 8)}...`
    };

  } catch (error) {
    logger.error('❌ Erreur de mint Candy Machine:', error);

    // Messages d'erreur améliorés et spécifiques
    let errorMessage = 'Erreur inconnue lors du mint';
    if (error instanceof Error) {
      const errorStr = error.toString();
      const errorMessageLower = error.message.toLowerCase();

      // Allowlist / Guard
      if (errorStr.includes('AddressNotFoundInAllowedList') || errorMessageLower.includes('allowed list')) {
        errorMessage = '🚫 Votre wallet n’est pas dans l’allowlist. Pour un mint public/gratuit, retirez le guard allowList (Candy Guard) sur la Candy Machine.';
      }
      // pNFT / Token Record
      else if (errorStr.includes('MissingTokenRecord') || errorMessageLower.includes('missing token record')) {
        errorMessage = '🚫 Cette Candy Machine semble configurée en pNFT (Programmable NFTs) / TokenRecord. Pour des NFTs standards, il faut redéployer ou reconfigurer la Candy Machine (token standard = NonFungible) et retirer les guards liés.';
      }
      // Erreur spécifique de Candy Guard mal configuré
      else if (errorStr.includes('AccountOwnedByWrongProgram') ||
        errorStr.includes('3007') ||
        errorMessageLower.includes('owned by a different program')) {
        errorMessage = '🚫 Configuration Candy Guard incorrecte. Contactez le support technique.';
      }
      // Erreur de solde insuffisant (pour les frais de transaction)
      else if (errorMessageLower.includes('insufficient') ||
        errorMessageLower.includes('lamports') ||
        errorMessageLower.includes('not enough')) {
        errorMessage = `💰 Solde insuffisant ! Vous avez besoin d'environ 0.001 SOL pour les frais de transaction`;
      }
      // Collection épuisée
      else if (errorMessageLower.includes('sold out') ||
        errorMessageLower.includes('empty') ||
        errorMessageLower.includes('no items remaining')) {
        errorMessage = '😱 Collection épuisée ! Plus de NFTs disponibles dans cette Candy Machine';
      }
      // Erreur générique avec détails limités
      else {
        // Limiter la longueur du message pour éviter d'exposer trop de détails
        const shortMessage = error.message.substring(0, 150);
        errorMessage = `🔥 Erreur blockchain: ${shortMessage}${error.message.length > 150 ? '...' : ''}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};
