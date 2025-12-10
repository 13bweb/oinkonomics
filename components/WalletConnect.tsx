'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { isMobile } from '../lib/utils';

interface WalletConnectProps {
  variant?: 'default' | 'compact';
}

const WalletConnect: React.FC<WalletConnectProps> = ({ variant: _variant }) => {
  const [mounted, setMounted] = useState(false);
  const [onMobile, setOnMobile] = useState(false);
  const { connected } = useWallet();
  const isCompact = _variant === 'compact';

  useEffect(() => {
    setMounted(true);
    setOnMobile(isMobile());
  }, []);

  const getPhantomDeeplink = () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: "FFTLr4uWg5HdYpvgtEnxtzMQWHEoFjWVWiPQZ7Wxvsfm",
      cluster: "mainnet-beta",
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
        <div className="px-4 py-2 rounded-lg bg-gray-200 border-2 border-black min-w-[180px] min-h-[40px]" />
      </div>
    );
  }

  return (
    <div className="relative z-50 space-y-3">
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
          padding: isCompact ? '10px 16px' : '12px 20px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: isCompact ? '40px' : '44px',
        }}
        className={`wallet-adapter-button-trigger transition-transform active:scale-95 hover:scale-105 sm:border-[4px] border-[3px] ${
          isCompact ? 'sm:text-sm text-xs sm:px-4 px-3 sm:py-2.5 py-2' : 'sm:text-base text-sm sm:px-5 px-4 sm:py-3 py-2.5'
        }`}
      />

      {onMobile && !connected && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a href={getPhantomDeeplink()} className="text-center px-3 py-2 rounded-lg bg-purple-500 text-white border-2 border-black text-xs font-semibold">
            Open Phantom
          </a>
          <a href={getSolflareDeeplink()} className="text-center px-3 py-2 rounded-lg bg-yellow-500 text-black border-2 border-black text-xs font-semibold">
            Open Solflare
          </a>
          <a href={getBackpackDeeplink()} className="text-center px-3 py-2 rounded-lg bg-blue-500 text-white border-2 border-black text-xs font-semibold">
            Open Backpack
          </a>
          <a href={getGlowDeeplink()} className="text-center px-3 py-2 rounded-lg bg-pink-500 text-white border-2 border-black text-xs font-semibold">
            Open Glow
          </a>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

