import { mint, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { WalletTier, WalletTierInfo } from '../types/globals';

const PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
// CandyGuard removed - not needed for this setup
const COLLECTION_MINT = process.env.NEXT_PUBLIC_COLLECTION_MINT || '';
const COLLECTION_UPDATE_AUTHORITY = process.env.NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY || '';
const COMPUTE_UNIT_LIMIT = Number(process.env.NEXT_PUBLIC_COMPUTE_UNIT_LIMIT ?? 400000);
const COMPUTE_UNIT_MICROLAMPORTS = Number(process.env.NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS ?? 0);

const candyMachineByTier: Record<WalletTier, string | null> = {
  TOO_POOR: null,
  POOR: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_POOR ?? null,
  MID: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_MID ?? null,
  RICH: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_RICH ?? null,
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
  if (!candyMachineByTier.POOR || candyMachineByTier.POOR.includes('your-') || candyMachineByTier.POOR.includes('votre-')) {
    missingVars.push('NEXT_PUBLIC_CANDY_MACHINE_ID_POOR');
  }
  if (!candyMachineByTier.MID || candyMachineByTier.MID.includes('your-') || candyMachineByTier.MID.includes('votre-')) {
    missingVars.push('NEXT_PUBLIC_CANDY_MACHINE_ID_MID');
  }
  if (!candyMachineByTier.RICH || candyMachineByTier.RICH.includes('your-') || candyMachineByTier.RICH.includes('votre-')) {
    missingVars.push('NEXT_PUBLIC_CANDY_MACHINE_ID_RICH');
  }

  if (missingVars.length > 0) {
    console.error('❌ ERREUR: Variables d\'environnement manquantes ou non configurées:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('⚠️  Configurez toutes les variables requises avant le déploiement.');
  }
}

// Validation des variables d'environnement critiques (uniquement en développement)
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 OINKONOMICS - Mode développement actif');
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
  POOR: { min: 10, max: 1000, nftRange: [1, 1000] },          // 10$ à 1000$ → NFT #1-1000
  MID: { min: 1000, max: 10000, nftRange: [1001, 2000] },     // 1000$ à 10000$ → NFT #1001-2000
  RICH: { min: 10000, max: null, nftRange: [2001, 3000] }     // 10000$+ → NFT #2001-3000
} as const;

// Récupère le prix SOL en USD via CoinGecko (fallback à 0 si échec)
export async function fetchSOLPriceUSD(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    if (!res.ok) {
      console.warn('CoinGecko returned non-ok status for SOL price');
      return 0;
    }
    const j = await res.json();
    const price = j?.solana?.usd ?? 0;
    return typeof price === 'number' ? price : 0;
  } catch (error) {
    console.warn('Failed to fetch SOL price from CoinGecko:', error);
    return 0;
  }
}

export function getWalletTier(balanceSOL: number, solPriceUSD: number): WalletTierInfo {
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
      nftNumber: generateNFTNumber(tier)
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
      nftNumber: generateNFTNumber(tier)
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
      nftNumber: generateNFTNumber(tier)
    };
  }
}

// Nouvelle fonction: calcule le tier basé sur la valeur USD TOTALE (SOL + tokens)
export function getWalletTierFromUSD(totalUSD: number, solBalance: number): WalletTierInfo {
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
      nftNumber: generateNFTNumber(tier)
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
      nftNumber: generateNFTNumber(tier)
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
      nftNumber: generateNFTNumber(tier)
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
    console.warn('Erreur lors de la récupération des tokens:', error);
    return [];
  }
}

// Récupère les prix des tokens depuis DeFiLlama
export async function getTokenPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) return {};

  try {
    // DeFiLlama API pour les prix Solana
    const coinsParam = mints.map(mint => `solana:${mint}`).join(',');
    const response = await fetch(`https://coins.llama.fi/prices/current/${coinsParam}`);

    if (!response.ok) {
      console.warn('DeFiLlama API error:', response.status);
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const mint of mints) {
      const key = `solana:${mint}`;
      if (data.coins?.[key]?.price) {
        prices[mint] = data.coins[key].price;
      }
    }

    return prices;
  } catch (error) {
    console.warn('Erreur lors de la récupération des prix:', error);
    return {};
  }
}

// Calcule la valeur totale du wallet (SOL + tous les tokens SPL)
export async function getTotalWalletValue(walletAddress: string): Promise<{ totalUSD: number; solBalance: number; solValueUSD: number; tokensValueUSD: number; }> {
  try {
    const connection = new Connection(PUBLIC_RPC_URL);
    const publicKey = new PublicKey(walletAddress);

    // 1. Récupérer le solde SOL
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceInSOL = solBalance / LAMPORTS_PER_SOL;

    // 2. Récupérer le prix du SOL
    const solPriceUSD = await fetchSOLPriceUSD();
    const solValueUSD = solBalanceInSOL * solPriceUSD;

    // 3. Récupérer tous les tokens SPL
    const tokens = await getTokenBalances(walletAddress);

    // 4. Récupérer les prix des tokens
    const mints = tokens.map(t => t.mint);
    const prices = await getTokenPrices(mints);

    // 5. Calculer la valeur totale des tokens
    let tokensValueUSD = 0;
    for (const token of tokens) {
      const price = prices[token.mint] || 0;
      tokensValueUSD += token.balance * price;
    }

    const totalUSD = solValueUSD + tokensValueUSD;

    console.log('💰 Valeur totale du wallet:', {
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
    console.error('Erreur lors du calcul de la valeur totale:', error);
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
    console.error('Erreur lors de la récupération du solde:', error);
    throw new Error('Impossible de récupérer le solde du wallet');
  }
}

export async function verifyWalletTier(walletAddress: string): Promise<WalletTierInfo> {
  try {
    // Calculer la valeur totale du wallet (SOL + tokens)
    const { totalUSD, solBalance } = await getTotalWalletValue(walletAddress);

    // Utiliser la NOUVELLE fonction qui calcule le tier avec totalUSD directement
    const tierInfo = getWalletTierFromUSD(totalUSD, solBalance);

    console.log('🎯 Tier calculé:', {
      totalUSD: totalUSD.toFixed(2),
      solBalance: solBalance.toFixed(4),
      tier: tierInfo.tier,
      nftNumber: tierInfo.nftNumber
    });

    return tierInfo;
  } catch (error) {
    console.error('Erreur lors de la vérification du tier:', error);
    throw error;
  }
}

export function generateNFTNumber(tier: WalletTier): number | null {
  const tierConfig = TIER_THRESHOLDS[tier];
  if (!tierConfig.nftRange) return null;

  const [min, max] = tierConfig.nftRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    console.log('🎯 MINT RÉEL depuis Candy Machine Oinkonomics...', { candyMachineId });

    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet non connecté');
    }

    if (!COLLECTION_MINT || !COLLECTION_UPDATE_AUTHORITY) {
      throw new Error('Configuration mint incomplète. Vérifiez les variables NEXT_PUBLIC_COLLECTION_MINT et NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY.');
    }

    // Initialiser UMI avec wallet adapter
    const umi = createUmiInstance(wallet);

    // Adresse de la Candy Machine (pas de CandyGuard)
    const candyMachine = publicKey(candyMachineId);

    // Générer le mint signer pour le nouveau NFT
    const nftMint = generateSigner(umi);

    console.log('🎯 NFT Mint généré:', nftMint.publicKey.toString());

    // Informations de la Candy Machine Oinkonomics
    const collectionMint = publicKey(COLLECTION_MINT);

    // Récupérer la VRAIE collection update authority depuis la blockchain (comme dans hashlips)
    let collectionUpdateAuthorityStr = COLLECTION_UPDATE_AUTHORITY;

    try {
      const { fetchDigitalAsset } = await import('@metaplex-foundation/mpl-token-metadata');
      const asset = await fetchDigitalAsset(umi, collectionMint);
      const onChainAuthority = asset.metadata.updateAuthority;

      if (onChainAuthority && onChainAuthority.toString() !== collectionUpdateAuthorityStr) {
        console.log('🔄 Utilisation de l\'update authority on-chain:', onChainAuthority.toString());
        collectionUpdateAuthorityStr = onChainAuthority.toString();
      }
    } catch (error) {
      console.warn('⚠️ Impossible de vérifier la collection, utilisation du cache:', error);
    }

    const collectionUpdateAuthority = publicKey(collectionUpdateAuthorityStr);

    console.log('🔧 Configuration Candy Machine:', {
      candyMachine: candyMachine.toString(),
      collectionMint: collectionMint.toString(),
      collectionUpdateAuthority: collectionUpdateAuthority.toString(),
      nftMint: nftMint.publicKey.toString()
    });

    // Ajouter compute budget instructions si configuré pour éviter les erreurs de compute units
    const computeUnits = COMPUTE_UNIT_LIMIT;
    const priorityMicrolamports = COMPUTE_UNIT_MICROLAMPORTS;

    const extras = [];
    if (computeUnits > 0) {
      extras.push(toUmiInstruction(ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits })));
    }
    if (priorityMicrolamports > 0) {
      extras.push(toUmiInstruction(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityMicrolamports })));
    }

    // Paramètres mint - La Candy Machine gère le paiement automatiquement (SANS CandyGuard)
    const params = {
      candyMachine,
      nftMint: nftMint.publicKey,
      collectionMint,
      collectionUpdateAuthority
    };

    console.log('🔍 Configuration mint:', {
      candyMachine: candyMachineId,
      nftMint: nftMint.publicKey.toString(),
      collectionMint: COLLECTION_MINT,
      collectionUpdateAuthority: COLLECTION_UPDATE_AUTHORITY
    });

    // Builder avec compute budget - utilise mint (v1) pour CM sans guard
    const builder = mint(umi, params);
    const fullBuilder = extras.length ? builder.prepend(extras) : builder;

    // Exécuter le mint avec compute budget
    const { signature } = await fullBuilder.sendAndConfirm(umi);
    const mintResult = { signature };

    console.log('✅ NFT Oinkonomics RÉEL minté avec succès !', {
      signature: mintResult.signature.toString(),
      mint: nftMint.publicKey.toString()
    });

    // Récupérer les métadonnées pour afficher le nom/numéro
    let nftName = 'Oinkonomics NFT';
    try {
      const { fetchMetadata } = await import('@metaplex-foundation/mpl-token-metadata');
      const metadata = await fetchMetadata(umi, nftMint.publicKey);
      nftName = metadata.name;
    } catch (metaError) {
      console.warn('⚠️ Impossible de récupérer les métadonnées:', metaError);
    }

    return {
      success: true,
      signature: mintResult.signature.toString(),
      mint: nftMint.publicKey.toString(),
      message: `🎉 ${nftName} minté avec succès ! Mint: ${nftMint.publicKey.toString().substring(0, 8)}...`
    };

  } catch (error) {
    console.error('❌ Erreur de mint Candy Machine:', error);

    // Messages d'erreur améliorés et spécifiques
    let errorMessage = 'Erreur inconnue lors du mint';
    if (error instanceof Error) {
      const errorStr = error.toString();
      const errorMessageLower = error.message.toLowerCase();

      // Erreur spécifique de Candy Guard mal configuré
      if (errorStr.includes('AccountOwnedByWrongProgram') ||
        errorStr.includes('3007') ||
        errorMessageLower.includes('owned by a different program')) {
        errorMessage = '🚫 Configuration Candy Guard incorrecte. La Candy Machine n\'a pas de Candy Guard valide. Contactez le support technique.';
      }
      // Erreur de solde insuffisant
      else if (errorMessageLower.includes('insufficient') ||
        errorMessageLower.includes('lamports') ||
        errorMessageLower.includes('not enough')) {
        errorMessage = `💰 Solde insuffisant ! Vous avez besoin d'environ 0.023 SOL (0.022 pour le mint + ~0.001 pour les frais réseau)`;
      }
      // Collection épuisée
      else if (errorMessageLower.includes('sold out') ||
        errorMessageLower.includes('empty') ||
        errorMessageLower.includes('no items remaining')) {
        errorMessage = '😱 Collection épuisée ! Plus de NFTs disponibles dans cette Candy Machine';
      }
      // Problème de freeze guard
      else if (errorMessageLower.includes('freeze')) {
        errorMessage = '🧊 Problème avec le freeze guard - contactez le support';
      }
      // Erreur de paiement
      else if (errorMessageLower.includes('payment') ||
        errorMessageLower.includes('sol_payment') ||
        errorMessageLower.includes('guard')) {
        errorMessage = '🚫 Erreur de paiement. Vérifiez que vous avez assez de SOL (minimum 0.023 SOL requis)';
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
