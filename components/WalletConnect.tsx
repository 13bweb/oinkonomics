'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { isMobile } from '../lib/utils'; // Assurez-vous que ce chemin est correct

const WalletConnect = () => {
  const [mounted, setMounted] = useState(false);
  const [onMobile, setOnMobile] = useState(false);
  const { wallet, connect, connected } = useWallet();

  useEffect(() => {
    setMounted(true);
    setOnMobile(isMobile());
    // Déclenche la connexion automatique si on est dans le navigateur Phantom ou Solflare
    if (isMobile() && (window.navigator.userAgent.includes('Phantom') || window.navigator.userAgent.includes('Solflare'))) {
      if (wallet && !connected) {
        connect();
      }
    }
  }, [wallet, connected, connect]);

  const getPhantomDeeplink = () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: "FFTLr4uWg5HdYpvgtEnxtzMQWHEoFjWVWiPQZ7Wxvsfm",
      cluster: "mainnet-beta", // ou "devnet"
      app_url: "https://oinkonomics.vercel.app/",
      redirect_link: window.location.href,
    });
    return `https://phantom.app/ul/v1/connect?${params.toString()}`;
  };

  const getSolflareDeeplink = () => {
    const params = new URLSearchParams({
      ref: "https://oinkonomics.vercel.app/",
      redirect_link: window.location.href,
    });
    return `https://solflare.com/ul/v1/connect?${params.toString()}`;
  };

  const getBackpackDeeplink = () => {
    return `backpack://browser?url=${encodeURIComponent(window.location.href)}`;
  };

  const getGlowDeeplink = () => {
    return `glow://browser?url=${encodeURIComponent(window.location.href)}`;
  };

  if (!mounted) {
    return (
      <div className="relative">
        <div 
          className="px-4 py-2 rounded-lg bg-gray-200 border-2 border-black"
          style={{ minWidth: '180px', minHeight: '40px' }}
        />
      </div>
    );
  }

  if (onMobile && !wallet && !connected) {
    return (
      <div className="flex flex-col space-y-2">
        <a href={getPhantomDeeplink()} className="text-center px-4 py-2 rounded-lg bg-purple-500 text-white border-2 border-black">
          Open in Phantom
        </a>
        <a href={getSolflareDeeplink()} className="text-center px-4 py-2 rounded-lg bg-yellow-500 text-white border-2 border-black">
          Open in Solflare
        </a>
        <a href={getBackpackDeeplink()} className="text-center px-4 py-2 rounded-lg bg-blue-500 text-white border-2 border-black">
          Open in Backpack
        </a>
        <a href={getGlowDeeplink()} className="text-center px-4 py-2 rounded-lg bg-pink-500 text-white border-2 border-black">
          Open in Glow
        </a>
      </div>
    );
  }

  return (
    <div className="relative z-50">
      {/* Decorative elements (hidden on very small screens) */}
      <div className="absolute -top-1 -left-2 sm:-top-1.5 sm:-left-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
      <div className="absolute -top-0.5 -right-1.5 sm:-top-1 sm:-right-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-pink-400 rounded-full opacity-80 animate-pulse hidden sm:block" />
      <div className="absolute -bottom-0.5 -left-1.5 sm:-bottom-1 sm:-left-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-blue-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
      <div className="absolute -bottom-1 -right-2 sm:-bottom-1.5 sm:-right-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-400 rounded-full opacity-80 animate-pulse hidden sm:block" />

      <WalletMultiButton
        style={{
          background: 'linear-gradient(135deg, #FF8AA8 0%, #FFD36E 100%)',
          borderRadius: '28px',
          border: '4px solid black',
          fontFamily: 'Space Grotesk, Inter, ui-sans-serif, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          padding: '12px 20px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: '44px',
        }}
        className="wallet-adapter-button-trigger transition-transform active:scale-95 hover:scale-105 sm:text-base text-sm sm:px-5 px-4 sm:py-3 py-2.5 sm:border-[4px] border-[3px]"
      />
    </div>
  );
};

export default WalletConnect;

