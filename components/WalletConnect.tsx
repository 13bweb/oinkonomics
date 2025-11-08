'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';

const WalletConnect = () => {
  const { connected, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [detectedWallet, setDetectedWallet] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const detectWallet = async () => {
      setMounted(true);
      try {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
        setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(ua));

        const w = (window as any) || {};
        
        // Attendre un court instant pour la détection du wallet
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (w?.solana?.isPhantom) {
          setDetectedWallet('Phantom');
          setConnectionError(null);
        }
        else if (w?.solana?.isSolflare || w?.solflare?.isSolflare) {
          setDetectedWallet('Solflare');
          setConnectionError(null);
        }
        else if (w?.solana?.isGlow) {
          setDetectedWallet('Glow');
          setConnectionError(null);
        }
        else {
          setDetectedWallet(null);
          if (isMobile) {
            setConnectionError('Aucun wallet mobile détecté. Veuillez installer Phantom ou Solflare.');
          }
        }
      } catch (e) {
        console.error('Erreur de détection du wallet:', e);
        setIsMobile(false);
        setDetectedWallet(null);
        setConnectionError('Erreur lors de la détection du wallet. Veuillez rafraîchir la page.');
      }
    };

    detectWallet();
    
    // Vérifier périodiquement la présence d'un wallet
    timeoutId = setInterval(detectWallet, 2000);

    return () => {
      if (timeoutId) clearInterval(timeoutId);
    };
  }, []);

  if (!mounted) return null;

  const pillClass = 'px-3 py-1 rounded-md bg-black/80 text-white text-sm font-semibold';

  return (
    <div className="relative z-50">
      {/* decorative elements (hidden on very small screens) */}
      <div className="absolute -top-1 -left-2 sm:-top-1.5 sm:-left-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
      <div className="absolute -top-0.5 -right-1.5 sm:-top-1 sm:-right-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-pink-400 rounded-full opacity-80 animate-pulse hidden sm:block" />
      <div className="absolute -bottom-0.5 -left-1.5 sm:-bottom-1 sm:-left-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-blue-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
      <div className="absolute -bottom-1 -right-2 sm:-bottom-1.5 sm:-right-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-400 rounded-full opacity-80 animate-pulse hidden sm:block" />

      {isMobile ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3">
            <div className={`${pillClass} ${connectionError ? 'bg-red-500/90' : connected ? 'bg-green-500/90' : ''}`}>
              {connecting ? 'Connexion en cours...' :
               connected ? 'Connecté' :
               connectionError ? connectionError :
               detectedWallet ? `Détecté : ${detectedWallet}` : 'Aucun wallet détecté'}
            </div>
          </div>

          {/* Keep WalletMultiButton as a fallback (some mobile browsers support it) */}
          <div className="inline-block">
            <WalletMultiButton
              style={{
                backgroundColor: '#FF8AA8',
                borderRadius: '12px',
                border: '2px solid black',
                fontFamily: 'Space Grotesk, Inter, ui-sans-serif, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                padding: '8px 14px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.25s ease',
                position: 'relative',
                minWidth: '150px',
                maxWidth: '260px',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              className="hover:scale-105 active:scale-95"
            />
          </div>

          {/* Deep-link quick actions for common mobile wallets */}
          <div className="flex gap-2">
            <a
              href="phantom://"
              className="px-3 py-2 rounded-md bg-gradient-to-r from-pink-400 to-pink-600 text-white text-sm font-medium shadow-md"
              title="Open Phantom"
            >
              Phantom
            </a>
            <a
              href="solflare://"
              className="px-3 py-2 rounded-md bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-sm font-medium shadow-md"
              title="Open Solflare"
            >
              Solflare
            </a>
          </div>
        </div>
      ) : (
        <div className="relative flex">
          <WalletMultiButton
            style={{
              backgroundColor: '#FF8AA8',
              borderRadius: '12px',
              border: '2px solid black',
              fontFamily: 'Space Grotesk, Inter, ui-sans-serif, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              padding: '8px 16px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.25s ease',
              position: 'relative',
              minWidth: '180px',
              maxWidth: '240px',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            className="hover:scale-105 active:scale-95 sm:hover:scale-110 sm:hover:rotate-1"
          />
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

