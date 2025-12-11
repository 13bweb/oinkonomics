'use client';

import React, { FC, useMemo, useEffect } from 'react';
import { JupiverseKitProvider } from 'jupiverse-kit';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useWallet } from '@jup-ag/wallet-adapter';
import toast from 'react-hot-toast';

// NOTE:
// We attempt to dynamically load MobileWalletAdapter and WalletConnectAdapter.
// If packages aren't present, fallback gracefully so build doesn't break.

type AnyAdapter = any;

const tryRequire = (pkg: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(pkg);
  } catch (e) {
    return null;
  }
};

// Composant interne pour gérer les notifications de connexion
const WalletNotificationHandler: FC = () => {
  const { connected, wallet, connecting } = useWallet();

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }, []);

  useEffect(() => {
    if (connected && wallet) {
      toast.success(`Wallet connecté: ${wallet.adapter?.name || wallet?.name || 'unknown'}`);
    } else if (!connected && !connecting && isMobile) {
      // help hints for mobile (non-blocking)
      // Do not spam toasts; only show minor hint if user attempted to connect but failed
      // This trace helps debugging in prod
      // console.debug available for dev
    }
  }, [connected, wallet, connecting, isMobile]);

  return null;
};

const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }, []);

  // Metadata WalletConnect v2 avec Project ID
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

  useEffect(() => {
    if (!walletConnectProjectId && isMobile) {
      console.warn(
        '⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID manquant - Connexion mobile limitée. Prévoir WalletConnect v2 Project ID.',
      );
    }
  }, [walletConnectProjectId, isMobile]);

  const adapters = useMemo<AnyAdapter[]>(() => {
    const adaptersList: AnyAdapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ];

    // Try to load a Mobile Wallet Adapter (MWA) if available.
    const mobilePkg = tryRequire('@solana/wallet-adapter-mobile') || tryRequire('@solana-mobile/mobile-wallet-adapter');
    if (isMobile && mobilePkg) {
      try {
        const MobileWalletAdapter = mobilePkg?.MobileWalletAdapter || mobilePkg?.default || mobilePkg;
        if (MobileWalletAdapter) {
          adaptersList.unshift(new MobileWalletAdapter());
        }
      } catch (err) {
        console.warn('MobileWalletAdapter initialisation échouée', err);
      }
    }

    // Try to attach WalletConnect adapter as fallback (requires project id)
    if (walletConnectProjectId) {
      const wcPkg = tryRequire('@solana/wallet-adapter-walletconnect') || tryRequire('@solana/wallet-adapter-walletconnect-v2');
      if (wcPkg) {
        try {
          const WalletConnectAdapter = wcPkg?.WalletConnectAdapter || wcPkg?.default || wcPkg;
          if (WalletConnectAdapter) {
            adaptersList.push(new WalletConnectAdapter({ projectId: walletConnectProjectId }));
          }
        } catch (err) {
          console.warn('WalletConnectAdapter initialisation échouée', err);
        }
      }
    }

    console.log(`✅ ${adaptersList.length} wallets configurés (Mobile: ${isMobile ? 'OUI' : 'NON'})`);
    return adaptersList;
  }, [isMobile, walletConnectProjectId]);

  // Decide autoConnect policy:
  // - Desktop: enable autoConnect (expected UX)
  // - Mobile: enable autoConnect if we found a mobile adapter or walletconnect project id is set
  const autoConnect = useMemo(() => {
    if (!isMobile) return true;
    const hasMobileAdapter = adapters.some((a) => {
      const name = a?.constructor?.name?.toLowerCase?.() || '';
      return name.includes('mobile') || name.includes('saga') || name.includes('mobilewallet');
    });
    const hasWalletConnect = Boolean(walletConnectProjectId);
    return Boolean(hasMobileAdapter || hasWalletConnect);
  }, [isMobile, adapters, walletConnectProjectId]);

  const env = (process.env.NEXT_PUBLIC_SOLANA_ENV as WalletAdapterNetwork) || 'devnet';
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(env || 'devnet');

  return (
    <JupiverseKitProvider
      autoConnect={autoConnect}
      env={env}
      endpoint={endpoint}
      wallets={adapters}
      theme="dark"
      lang="fr"
      metadata={{
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Oinkonomics',
        description: 'Oinkonomics NFT Mint - Application Solana avec support mobile complet',
      }}
    >
      <WalletNotificationHandler />
      {children}
    </JupiverseKitProvider>
  );
};

export default WalletContextProvider;
