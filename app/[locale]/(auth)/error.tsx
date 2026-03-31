'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/routing';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur d&apos;authentification
        </h1>
        <p className="text-gray-600 mb-6">
          Une erreur inattendue s&apos;est produite. Veuillez réessayer.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-3 bg-[#187A58] text-white font-medium rounded-lg hover:bg-[#145f45] transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
