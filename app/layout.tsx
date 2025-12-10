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
