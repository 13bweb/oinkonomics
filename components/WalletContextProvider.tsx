'use client';

import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    MathWalletAdapter,
    Coin98WalletAdapter,
    CoinbaseWalletAdapter,
    TrustWalletAdapter,
    SolongWalletAdapter,
    TokenPocketWalletAdapter,
    TokenaryWalletAdapter,
    SafePalWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { 
    SolanaMobileWalletAdapter, 
    createDefaultAuthorizationResultCache, 
    createDefaultAddressSelector,
    createDefaultWalletNotFoundHandler 
} from '@solana-mobile/wallet-adapter-mobile';

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network);
        return rpcUrl;
    }, [network]);

    const wallets = useMemo(() => [
        new SolanaMobileWalletAdapter({
            addressSelector: createDefaultAddressSelector(),
            appIdentity: {
                name: 'Oinkonomics',
                uri: 'https://oinkonomics.vercel.app/',
                icon: '/favicon.ico'
            },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            cluster: network,
            onWalletNotFound: createDefaultWalletNotFoundHandler()
        }),
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new WalletConnectWalletAdapter({
            network: network,
            options: {
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
                metadata: {
                    name: 'Oinkonomics',
                    description: 'Oinkonomics NFT Mint',
                    url: 'https://oinkonomics.vercel.app/',
                    icons: ['https://oinkonomics.vercel.app/favicon.ico']
                }
            }
        }),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new MathWalletAdapter(),
        new Coin98WalletAdapter(),
        new CoinbaseWalletAdapter(),
        new TrustWalletAdapter(),
        new SolongWalletAdapter(),
        new TokenPocketWalletAdapter(),
        new TokenaryWalletAdapter(),
        new SafePalWalletAdapter()
    ], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletContextProvider;
