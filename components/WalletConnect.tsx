'use client';

import { UnifiedWalletButton, useWallet } from '@jup-ag/wallet-adapter';
import React, { ComponentType, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface WalletConnectProps {
  variant?: 'default' | 'compact';
}

const WalletConnect: React.FC<WalletConnectProps> = ({ variant: _variant }) => {
  const [mounted, setMounted] = useState(false);
  const { connected, connecting, wallet } = useWallet();
  const isCompact = _variant === 'compact';

  // Détection mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Feedback de connexion mobile
  useEffect(() => {
    if (connecting && isMobile) {
      toast.loading('Connexion au wallet...', {
        id: 'wallet-connecting',
        duration: 15000, // Augmenté pour laisser plus de temps sur mobile
        position: 'bottom-center',
      });
    } else {
      toast.dismiss('wallet-connecting');
    }
  }, [connecting, isMobile]);

  // Aide supplémentaire pour mobile si pas de wallet connecté après un délai
  useEffect(() => {
    if (isMobile && !connected && !connecting && mounted) {
      const timer = setTimeout(() => {
        // Vérifier si un wallet est disponible
        const hasWallet = typeof window !== 'undefined' && (
          window.solana?.isPhantom ||
          window.solflare?.isSolflare ||
          window.trustWallet?.solana
        );

        if (!hasWallet) {
          toast('💡 Sur mobile, ouvrez cette page depuis l\'application Phantom ou Solflare', {
            id: 'mobile-wallet-hint',
            duration: 8000,
            position: 'bottom-center',
            icon: '💡',
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          });
        }
      }, 3000); // Attendre 3 secondes avant d'afficher l'aide

      return () => clearTimeout(timer);
    }
  }, [isMobile, connected, connecting, mounted]);

  // Type pour les props du UnifiedWalletButton
  interface UnifiedWalletButtonProps {
    overrideContent?: React.ReactNode;
    buttonClassName?: string;
    currentUserClassName?: string;
  }

  const UnifiedWalletButtonComponent = useMemo(() => {
    // Type assertion pour éviter les problèmes de typage avec React 19
    // UnifiedWalletButton est un composant valide, mais TypeScript peut avoir des problèmes avec les types dynamiques
    return UnifiedWalletButton as ComponentType<UnifiedWalletButtonProps>;
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
      {/* Animations décoratives (masquées sur mobile pour performance) */}
      {!isMobile && (
        <>
          <div className="absolute -top-1 -left-2 sm:-top-1.5 sm:-left-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
          <div className="absolute -top-0.5 -right-1.5 sm:-top-1 sm:-right-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-pink-400 rounded-full opacity-80 animate-pulse hidden sm:block" />
          <div className="absolute -bottom-0.5 -left-1.5 sm:-bottom-1 sm:-left-2 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-blue-400 rounded-full opacity-80 animate-bounce hidden sm:block" />
          <div className="absolute -bottom-1 -right-2 sm:-bottom-1.5 sm:-right-3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-400 rounded-full opacity-80 animate-pulse hidden sm:block" />
        </>
      )}

      <UnifiedWalletButtonComponent
        buttonClassName={`wallet-adapter-button-trigger transition-transform active:scale-95 hover:scale-105 sm:border-[4px] border-[3px] ${isCompact ? 'sm:text-sm text-xs sm:px-4 px-3 sm:py-2.5 py-2' : 'sm:text-base text-sm sm:px-5 px-4 sm:py-3 py-2.5'
          } ${isMobile ? 'min-h-[48px] touch-manipulation' : ''}`}
        currentUserClassName="wallet-adapter-button-trigger"
      />

      {/* Message d'aide mobile amélioré */}
      {isMobile && !connected && !connecting && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center px-2">
            📱 Pour connecter sur mobile :
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center px-2">
            Ouvrez cette page depuis l'app Phantom ou Solflare, ou utilisez le bouton ci-dessus
          </p>
        </div>
      )}

      {/* Indicateur de connexion */}
      {connecting && (
        <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2 animate-pulse">
          Connexion en cours...
        </p>
      )}
    </div>
  );
};

export default WalletConnect;
