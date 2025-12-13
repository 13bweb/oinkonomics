'use client';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '../components/ErrorBoundary';
import Footer from '../components/Footer';
import Header from '../components/Header';
import WalletContextProvider from '../components/WalletContextProvider';
import logger from '../lib/logger-client';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load Eruda debug console on mobile
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/eruda';
        script.onload = () => {
          if (window.eruda) {
            window.eruda.init();
            logger.log("Eruda Debug Console activée - Cliquez sur l'icône en bas à droite");
          }
        };
        document.body.appendChild(script);
      }

      // Gestionnaire d'erreurs global pour les promesses non gérées
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason;
        const errorMessage = error?.message || String(error);
        const errorStack = error?.stack || '';
        const errorString = String(error);

        // Ignorer les erreurs 403 de l'API web3modal (non critiques)
        const isWeb3ModalError =
          errorMessage?.includes('HTTP status code: 403') ||
          errorMessage?.includes('fetchWalletButtons') ||
          errorMessage?.includes('web3modal') ||
          errorMessage?.includes('api.web3modal.org') ||
          errorStack?.includes('fetchWalletButtons') ||
          errorStack?.includes('ApiController') ||
          errorStack?.includes('FetchUtil') ||
          errorString?.includes('403') && errorString?.includes('web3modal');

        if (isWeb3ModalError) {
          logger.warn('⚠️ Erreur API web3modal ignorée (non critique):', errorMessage || errorString);
          event.preventDefault(); // Empêcher l'affichage de l'erreur dans la console
          event.stopPropagation(); // Empêcher la propagation
          return false; // Indiquer que l'erreur a été gérée
        }

        // Logger les autres erreurs mais ne pas les bloquer
        logger.error('❌ Promesse rejetée non gérée:', error);
      };

      // Gestionnaire d'erreurs global pour les erreurs synchrones
      const handleError = (event: ErrorEvent) => {
        const error = event.error;
        const errorMessage = error?.message || event.message || '';
        const errorStack = error?.stack || '';
        const errorString = String(error || event.message);

        // Auto-heal: si un chunk Next.js ne charge pas (souvent après un rebuild/redeploy),
        // forcer un refresh une seule fois pour récupérer les nouveaux assets.
        // Sinon l'app reste cassée (ChunkLoadError + erreurs React minifiées).
        const isChunkLoadError =
          errorMessage.includes('ChunkLoadError') ||
          errorMessage.includes('Loading chunk') ||
          errorString.includes('/_next/static/chunks/') && (errorString.includes('ERR_ABORTED') || errorString.includes('400') || errorString.includes('404'));

        if (isChunkLoadError) {
          try {
            const key = '__oink_chunk_reload__';
            const last = Number(sessionStorage.getItem(key) || '0');
            const now = Date.now();
            // éviter boucle infinie
            if (!last || now - last > 20_000) {
              sessionStorage.setItem(key, String(now));
              window.location.reload();
            }
          } catch {
            // ignore
          }
        }

        // Ignorer les erreurs 403 de l'API web3modal (non critiques)
        const isWeb3ModalError =
          errorMessage?.includes('HTTP status code: 403') ||
          errorMessage?.includes('fetchWalletButtons') ||
          errorMessage?.includes('web3modal') ||
          errorMessage?.includes('api.web3modal.org') ||
          errorStack?.includes('fetchWalletButtons') ||
          errorStack?.includes('ApiController') ||
          errorStack?.includes('FetchUtil') ||
          errorString?.includes('403') && errorString?.includes('web3modal');

        if (isWeb3ModalError) {
          logger.warn('⚠️ Erreur API web3modal ignorée (non critique):', errorMessage || errorString);
          event.preventDefault(); // Empêcher l'affichage de l'erreur dans la console
          return false; // Indiquer que l'erreur a été gérée
        }
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <html lang="fr">
      <body suppressHydrationWarning={true}>
        <ErrorBoundary>
          <WalletContextProvider>
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
            <Header />
            {children}
            <Footer />
          </WalletContextProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
