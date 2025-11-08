'use client';
import React, { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

// Import styles
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network);
    console.log('Using RPC endpoint:', rpcUrl);
    return rpcUrl;
  }, [network]);

  // Force reconnect on network change
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connection = new Connection(endpoint);
        await connection.getVersion();
        console.log('Connected to Solana network:', network);
      } catch (error) {
        console.error('Failed to connect to Solana network:', error);
      }
    };
    checkConnection();
  }, [endpoint, network]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [network]);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              {children}
              <Footer />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  )
}
