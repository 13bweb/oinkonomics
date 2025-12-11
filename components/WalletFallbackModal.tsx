import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onUseWalletConnect: () => void;
  onOpenPhantom: () => void;
};

export default function WalletFallbackModal({ open, onClose, onUseWalletConnect, onOpenPhantom }: Props) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 z-10 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Problème de connexion au wallet</h3>
        <p className="text-sm mb-4">Nous n'avons pas détecté de wallet natif. Choisissez une option :</p>
        <div className="flex gap-3">
          <button
            onClick={onOpenPhantom}
            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded"
          >
            Ouvrir Phantom
          </button>
          <button
            onClick={onUseWalletConnect}
            className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Utiliser WalletConnect
          </button>
        </div>
        <button onClick={onClose} className="mt-4 text-xs text-gray-500">Annuler</button>
      </div>
    </div>
  );
}
