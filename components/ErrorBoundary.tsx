'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../lib/logger-client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';
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
      // Réinitialiser l'état pour permettre à l'application de continuer
      this.setState({ hasError: false, error: null });
      return;
    }

    // Logger les autres erreurs
    logger.error('❌ Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const errorMessage = this.state.error.message || '';
      const errorStack = this.state.error.stack || '';
      const errorString = String(this.state.error);

      // Si c'est une erreur 403 de web3modal, ignorer et continuer
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
        return this.props.children;
      }

      // Pour les autres erreurs, afficher le fallback ou un message d'erreur
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur s'est produite</h1>
            <p className="text-gray-700 mb-4">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
