import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { fetchCandyMachine, mplCandyMachine, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { generateSigner, publicKey, percentAmount, some } from '@metaplex-foundation/umi';
import { Connection, PublicKey, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import { WalletTier, WalletTierInfo } from '../types/globals';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from 'react-hot-toast';

const PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const CANDY_GUARD = process.env.NEXT_PUBLIC_CANDY_GUARD || '';
const COLLECTION_MINT = process.env.NEXT_PUBLIC_COLLECTION_MINT || '';
const COLLECTION_UPDATE_AUTHORITY = process.env.NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY || '';
const SOL_PAYMENT_DESTINATION = process.env.NEXT_PUBLIC_SOL_PAYMENT_DESTINATION || '';
const COMPUTE_UNIT_LIMIT = Number(process.env.NEXT_PUBLIC_COMPUTE_UNIT_LIMIT ?? 400000);
const COMPUTE_UNIT_MICROLAMPORTS = Number(process.env.NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS ?? 0);

const candyMachineByTier: Record<WalletTier, string | null> = {
  TOO_POOR: null,
  POOR: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_POOR ?? null,
  MID: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_MID ?? null,
  RICH: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_RICH ?? null,
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Helper pour convertir les instructions Solana en format UMI (exactement comme hashlips)
function toUmiInstruction(ix: any) {
  return {
    instruction: {
      programId: publicKey(ix.programId.toBase58()),
      keys: ix.keys.map((key: any) => ({
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
  TOO_POOR: { min: 0, max: 10, nftRange: null },           // Moins de 10$ - pas de mint possible
  POOR: { min: 10, max: 1000, nftRange: [1, 100] },       // 10$ à 1000$ → NFT #1-100
  MID: { min: 1000, max: 10000, nftRange: [100, 200] },   // 1000$ à 10000$ → NFT #100-200
  RICH: { min: 10000, max: null, nftRange: [200, 300] }   // 10000$+ → NFT #200-300
} as const

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
    }
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
    }
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
    }
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
    }
  }
}

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(PUBLIC_RPC_URL);
    
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    throw new Error('Impossible de récupérer le solde du wallet');
  }
}

export async function verifyWalletTier(walletAddress: string): Promise<WalletTierInfo> {
  try {
    const balanceSOL = await getWalletBalance(walletAddress);
    const solPriceUSD = await fetchSOLPriceUSD();
    return getWalletTier(balanceSOL, solPriceUSD);
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

    if (!CANDY_GUARD || !COLLECTION_MINT || !COLLECTION_UPDATE_AUTHORITY || !SOL_PAYMENT_DESTINATION) {
      throw new Error('Configuration mint incomplète. Vérifiez les variables NEXT_PUBLIC_CANDY_GUARD, NEXT_PUBLIC_COLLECTION_MINT, NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY et NEXT_PUBLIC_SOL_PAYMENT_DESTINATION.');
    }

    console.log('✅ Mint vers la collection Oinkonomics configurée', {
      candyMachineId,
      candyGuard: CANDY_GUARD,
      collectionMint: COLLECTION_MINT,
    });
    
    // Initialiser UMI avec wallet adapter
    const umi = createUmiInstance(wallet);
    
    // Générer le mint signer pour le nouveau NFT
    const nftMint = generateSigner(umi);
    
    console.log('🎯 NFT Mint généré:', nftMint.publicKey.toString());

    // mintV2 est importé en haut du fichier
    
    // Informations de la Candy Machine Oinkonomics depuis hashlips/cache.json
    const candyMachine = publicKey(candyMachineId);
    const candyGuard = publicKey(CANDY_GUARD);
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
    
    console.log('🔧 Configuration Candy Machine (EXACTE hashlips):', {
      candyMachine: candyMachine.toString(),
      candyGuard: candyGuard.toString(), 
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

    // Paramètres mint EXACTEMENT comme hashlips réussi
    const params = {
      candyMachine,
      candyGuard,
      nftMint,
      collectionMint,
      collectionUpdateAuthority,
      mintArgs: {
        solPayment: some({
          destination: publicKey(SOL_PAYMENT_DESTINATION)
        })
      }
    };

    // Builder avec compute budget (exactement comme hashlips)
    const builder = mintV2(umi, params);
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
    
    // Messages d'erreur plus spécifiques aux guards Oinkonomics
    let errorMessage = 'Erreur inconnue lors du mint';
    if (error instanceof Error) {
      if (error.message.includes('insufficient') || error.message.includes('lamports')) {
        errorMessage = '💰 Solde insuffisant ! Vous avez besoin de ~0.011 SOL pour minter (0.01 + frais réseau)';
      } else if (error.message.includes('guard') || error.message.includes('sol_payment')) {
        errorMessage = '🚫 Paiement requis : 0.01 SOL. Vérifiez votre solde et réessayez !';
      } else if (error.message.includes('sold out') || error.message.includes('empty')) {
        errorMessage = '😱 Collection épuisée ! Plus de NFTs disponibles dans cette Candy Machine';
      } else if (error.message.includes('freeze')) {
        errorMessage = '🧊 Problème avec le freeze guard - contactez le support';
      } else {
        errorMessage = `🔥 Erreur blockchain: ${error.message}`;
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};
