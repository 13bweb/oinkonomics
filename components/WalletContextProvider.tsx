'use client';

import React, { FC, useMemo } from 'react';
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
	const network = WalletAdapterNetwork.Devnet;
	const endpoint = useMemo(() => {
		const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network);
		return rpcUrl;
	}, [network]);

	return (
		<UnifiedWalletProvider
			wallets={[]}
			config={{
				env: network === WalletAdapterNetwork.Devnet ? 'devnet' : 'mainnet-beta',
				autoConnect: true,
				theme: 'dark',
				lang: 'fr',
				metadata: {
					name: 'Oinkonomics',
					description: 'Oinkonomics NFT Mint - Application mobile Solana avec connexion unifiée',
					url: 'https://oinkonomics.vercel.app/',
					iconUrls: ['https://oinkonomics.vercel.app/favicon.ico'],
				},
				notificationCallback: {
					onConnect: () => {
						console.log('[Wallet] Connecté');
						// Toast notification handled by components
					},
					onConnecting: () => {
						console.log('[Wallet] Connexion en cours...');
					},
					onDisconnect: () => {
						console.log('[Wallet] Déconnecté');
						// Toast notification handled by components
					},
					onNotInstalled: () => {
						console.log('[Wallet] Wallet non installé');
					},
				},
			}}
		>
			{children}
		</UnifiedWalletProvider>
	);
};

export default WalletContextProvider;
