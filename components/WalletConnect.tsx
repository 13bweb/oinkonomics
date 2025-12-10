'use client';

import { UnifiedWalletButton, useWallet } from '@jup-ag/wallet-adapter';
import React, { useEffect, useState } from 'react';

interface WalletConnectProps {
  variant?: 'default' | 'compact';
}

const WalletConnect: React.FC<WalletConnectProps> = ({ variant: _variant }) => {
  const [mounted, setMounted] = useState(false);
  const { connected } = useWallet();
  const isCompact = _variant === 'compact';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative">
        <div className="px-4 py-2 rounded-lg bg-gray-200 border-2 border-black min-w-[180px] min-h-[40px]" />
      </div>
    );
  }

  return (
    <div className="relative z-50">
      <div className="absolute -top-1 -left-2 sm:-top-1.5 sm:-left-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
      <div className="absolute -top-0.5 -right-1.5 sm:-top-1 sm:-right-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-pink-400 rounded-full opacity-80 animate-pulse hidden sm:block" />
      <div className="absolute -bottom-0.5 -left-1.5 sm:-bottom-1 sm:-left-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-blue-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
      <div className="absolute -bottom-1 -right-2 sm:-bottom-1.5 sm:-right-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-400 rounded-full opacity-80 animate-pulse hidden sm:block" />

      <UnifiedWalletButton
        buttonClassName={`wallet-adapter-button-trigger transition-transform active:scale-95 hover:scale-105 sm:border-[4px] border-[3px] ${isCompact ? 'sm:text-sm text-xs sm:px-4 px-3 sm:py-2.5 py-2' : 'sm:text-base text-sm sm:px-5 px-4 sm:py-3 py-2.5'
          }`}
        currentUserClassName="wallet-adapter-button-trigger"
      />
    </div>
  );
};

export default WalletConnect;

