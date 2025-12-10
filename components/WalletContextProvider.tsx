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

// Composant interne pour gérer les notifications de connexion
const WalletNotificationHandler: FC = () => {
	const { connected, wallet, connecting } = useWallet();

	const isMobile = useMemo(() => {
		if (typeof window === 'undefined') return false;
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	useEffect(() => {
		if (connected && wallet) {
			const walletName = wallet?.adapter?.name || 'Wallet';
			console.log('[Wallet] Connecté:', walletName, 'Mobile:', isMobile);

			toast.success(`✅ ${walletName} connecté!`, {
				duration: 3000,
				icon: '🎉',
				position: isMobile ? 'bottom-center' : 'top-right',
			});
		}
	}, [connected, wallet, isMobile]);

	useEffect(() => {
		if (!connected && !connecting) {
			// Wallet déconnecté (ne pas afficher au chargement initial)
			const hasBeenConnected = sessionStorage.getItem('wallet_was_connected');
			if (hasBeenConnected) {
				console.log('[Wallet] Déconnecté');
				toast.success('Wallet déconnecté', {
					duration: 2000,
					position: isMobile ? 'bottom-center' : 'top-right',
				});
				sessionStorage.removeItem('wallet_was_connected');
			}
		} else if (connected) {
			sessionStorage.setItem('wallet_was_connected', 'true');
		}
	}, [connected, connecting, isMobile]);

	return null;
};

const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
	const network = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), [network]);
	const env = network === WalletAdapterNetwork.Mainnet ? 'mainnet-beta' : 'devnet';

	// Détection mobile
	const isMobile = useMemo(() => {
		if (typeof window === 'undefined') return false;
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	// Configuration des wallets avec support mobile
	const wallets = useMemo(() => {
		const adapters = [];

		// Phantom - Support desktop + mobile (via deep link)
		adapters.push(new PhantomWalletAdapter());

		// Solflare - Support desktop + mobile
		adapters.push(new SolflareWalletAdapter());

		// Trust Wallet - Mobile-first
		adapters.push(new TrustWalletAdapter());

		// Coinbase Wallet - Support mobile
		adapters.push(new CoinbaseWalletAdapter());

		console.log(`✅ ${adapters.length} wallets configurés (Mobile: ${isMobile ? 'OUI' : 'NON'})`);
		return adapters;
	}, [isMobile]);

	// Metadata WalletConnect v2 avec Project ID
	const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

	useEffect(() => {
		if (!walletConnectProjectId && isMobile) {
			console.warn('⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID manquant - Connexion mobile limitée');
		}
	}, [walletConnectProjectId, isMobile]);

	return (
		<JupiverseKitProvider
			autoConnect={!isMobile} // Désactiver autoConnect sur mobile pour meilleure UX
			env={env}
			endpoint={endpoint}
			wallets={wallets}
			theme="dark"
			lang="fr"
			metadata={{
				name: process.env.NEXT_PUBLIC_APP_NAME || 'Oinkonomics',
				description: 'Oinkonomics NFT Mint - Application Solana avec support mobile complet',
				url: process.env.NEXT_PUBLIC_APP_URL || 'https://oinkonomics.vercel.app/',
				iconUrls: [process.env.NEXT_PUBLIC_APP_ICON || 'https://oinkonomics.vercel.app/icon.png'],
				// WalletConnect v2 configuration
				...(walletConnectProjectId && {
					walletConnectProjectId,
					redirect: {
						native: 'oinkonomics://',
						universal: 'https://oinkonomics.vercel.app/wallet-callback',
					},
				}),
			}}
		>
			<WalletNotificationHandler />
			{children}
		</JupiverseKitProvider>
	);
};

export default WalletContextProvider;
