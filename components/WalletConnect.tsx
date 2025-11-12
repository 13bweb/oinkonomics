'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletConnect = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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

