'use client';
import React from 'react';
import WalletContextProvider from '../components/WalletContextProvider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Toaster } from 'react-hot-toast';

// Import styles
import './globals.css';
import 'jupiverse-kit/dist/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Load Eruda debug console on mobile
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/eruda';
        script.onload = () => {
          // @ts-ignore
          if (window.eruda) {
            // @ts-ignore
            window.eruda.init();
            console.log('🔍 Eruda Debug Console activée - Cliquez sur l\'icône en bas à droite');
          }
        };
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
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
      </body>
    </html>
  )
}
