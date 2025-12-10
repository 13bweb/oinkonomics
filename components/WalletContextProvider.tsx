'use client';

import React, { FC, useMemo } from 'react';
import { JupiverseKitProvider } from 'jupiverse-kit';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
	const network = WalletAdapterNetwork.Devnet;
	const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), [network]);
	const env = network === WalletAdapterNetwork.Devnet ? 'devnet' : 'mainnet-beta';

	return (
		<JupiverseKitProvider
			autoConnect
			env={env}
			endpoint={endpoint}
			theme="dark"
			lang="fr"
			metadata={{
				name: 'Oinkonomics',
				description: 'Oinkonomics NFT Mint - Application mobile Solana avec connexion unifiée',
				url: 'https://oinkonomics.vercel.app/',
				iconUrls: ['https://oinkonomics.vercel.app/favicon.ico'],
			}}
		>
			{children}
		</JupiverseKitProvider>
	);
};

export default WalletContextProvider;
