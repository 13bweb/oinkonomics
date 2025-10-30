'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';

const WalletConnect = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-5 md:pt-6">
        <div className="relative flex justify-end">
          {/* Decorative elements around wallet button */}
          <div className="absolute -top-1.5 -left-3 w-3.5 h-3.5 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
          <div className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-pink-400 rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute -bottom-1 -left-2 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-80 animate-bounce"></div>
          <div className="absolute -bottom-1.5 -right-3 w-3.5 h-3.5 bg-green-400 rounded-full opacity-80 animate-pulse"></div>

          <WalletMultiButton 
            style={{ 
              backgroundColor: '#FF8AA8', 
              borderRadius: '28px', 
              border: '4px solid black', 
              fontFamily: 'Space Grotesk, Inter, ui-sans-serif, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              padding: '14px 28px',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="hover:scale-110 hover:rotate-1"
          />
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;

