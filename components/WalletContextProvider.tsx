'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
	CoinbaseWalletAdapter,
	PhantomWalletAdapter,
	SolflareWalletAdapter,
	TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, { FC, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import logger from '../lib/logger-client';

const WalletNotificationHandler: FC = () => {
	const { connected, wallet, connecting } = useWallet();

	const isMobile = useMemo(() => {
		if (typeof window === 'undefined') return false;
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	useEffect(() => {
		if (connected && wallet) {
			const walletName = wallet?.adapter?.name || 'Wallet';
			logger.log('[Wallet] Connecté:', walletName, 'Mobile:', isMobile);
			toast.success(`✅ ${walletName} connecté!`, {
				duration: 3000,
				position: isMobile ? 'bottom-center' : 'top-right',
			});
		}
	}, [connected, wallet, isMobile]);

	useEffect(() => {
		if (!connected && !connecting) {
			const hasBeenConnected = sessionStorage.getItem('wallet_was_connected');
			if (hasBeenConnected) {
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

const WalletContextProvider: FC<{ children: React.ReactNode; }> = ({ children }) => {
	const network = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), [network]);

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({ network }),
			new TrustWalletAdapter(),
			new CoinbaseWalletAdapter(),
		],
		[network]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect={false}>
				<WalletModalProvider>
					<WalletNotificationHandler />
					{children}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default WalletContextProvider;
