/**
 * Cache simple en mémoire pour les prix des tokens
 * TTL: 5 minutes pour éviter trop de requêtes aux APIs externes
 */

interface CachedPrice {
  price: number;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const priceCache = new Map<string, CachedPrice>();

/**
 * Récupère un prix depuis le cache s'il est encore valide
 */
export function getCachedPrice(key: string): number | null {
  const cached = priceCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    priceCache.delete(key);
    return null;
  }

  return cached.price;
}

/**
 * Met en cache un prix
 */
export function setCachedPrice(key: string, price: number): void {
  priceCache.set(key, {
    price,
    timestamp: Date.now(),
  });
}

/**
 * Nettoie le cache (supprime les entrées expirées)
 */
export function cleanCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // Collecter les clés à supprimer
  priceCache.forEach((cached, key) => {
    if (now - cached.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });

  // Supprimer les entrées expirées
  keysToDelete.forEach(key => priceCache.delete(key));
}

// Nettoyer le cache toutes les 10 minutes
if (typeof window === 'undefined') {
  setInterval(cleanCache, 10 * 60 * 1000);
}
