'use client';

import React, { FC, useMemo } from 'react';
import { HARDCODED_WALLET_STANDARDS, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
	TorusWalletAdapter,
	CoinbaseWalletAdapter,
	LedgerWalletAdapter,
	TrustWalletAdapter,
	SafePalWalletAdapter,
	Coin98WalletAdapter,
	MathWalletAdapter,
	NightlyWalletAdapter,
	NufiWalletAdapter,
	SolongWalletAdapter,
	TokenPocketWalletAdapter,
	XDEFIWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
	const network = WalletAdapterNetwork.Devnet;
	const rpcUrl = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), [network]);

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({ network }),
			new TorusWalletAdapter({ params: { network } }),
			new CoinbaseWalletAdapter(),
			new TrustWalletAdapter(),
			new SafePalWalletAdapter(),
			new LedgerWalletAdapter(),
			new Coin98WalletAdapter(),
			new TokenPocketWalletAdapter(),
			new MathWalletAdapter(),
			new NufiWalletAdapter(),
			new NightlyWalletAdapter(),
			new SolongWalletAdapter(),
			new XDEFIWalletAdapter(),
		],
		[network],
	);

	return (
		<UnifiedWalletProvider
			wallets={wallets}
			config={{
				env: network === WalletAdapterNetwork.Devnet ? 'devnet' : 'mainnet-beta',
				autoConnect: true,
				theme: 'dark',
				lang: 'fr',
				hardcodedWallets: HARDCODED_WALLET_STANDARDS,
				metadata: {
					name: 'Oinkonomics',
					description: 'Oinkonomics NFT Mint - Application mobile Solana avec connexion unifiée',
					url: 'https://oinkonomics.vercel.app/',
					iconUrls: ['https://oinkonomics.vercel.app/favicon.ico'],
					additionalInfo: rpcUrl,
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
