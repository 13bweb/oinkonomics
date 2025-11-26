declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@solana/wallet-adapter-react-ui/styles.css';
declare module './globals.css';

// Types pour les tiers de wallet
export type WalletTier = 'TOO_POOR' | 'POOR' | 'MID' | 'RICH';

export interface WalletTierInfo {
  tier: WalletTier;
  balance: number; // SOL balance
  balanceUSD: number; // USD-converted value
  minThreshold: number;
  maxThreshold: number | null;
  nftRange: readonly [number, number] | null;
  nftNumber?: number | null;
}