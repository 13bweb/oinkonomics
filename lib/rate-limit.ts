/**
 * Rate limiting pour les endpoints API
 * Utilise @upstash/ratelimit avec Redis pour un rate limiting distribué
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuration Redis depuis les variables d'environnement
// Si UPSTASH_REDIS n'est pas configuré, on utilise un rate limiter en mémoire (fallback)
let ratelimit: Ratelimit | null = null;

try {
  // Essayer d'utiliser Upstash Redis si configuré
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requêtes par minute
      analytics: true,
    });
  }
} catch (error) {
  console.warn('⚠️ Upstash Redis non configuré, rate limiting désactivé');
}

/**
 * Rate limiter en mémoire (fallback si Redis n'est pas disponible)
 * Note: Ne fonctionne que sur un seul serveur, pas distribué
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Nettoyer les requêtes anciennes
    const recentRequests = requests.filter((time) => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return { success: false };
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return { success: true };
  }
}

// Fallback en mémoire si Redis n'est pas disponible
const fallbackLimiter = new InMemoryRateLimiter(10, 60000);

/**
 * Vérifie le rate limit pour un identifiant (IP ou wallet address)
 */
export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier);
      return {
        success: result.success,
        limit: 10,
        remaining: result.remaining,
      };
    } catch (error) {
      // En cas d'erreur avec Redis, utiliser le fallback
      console.warn('Erreur rate limiting Redis, utilisation du fallback:', error);
      const result = await fallbackLimiter.limit(identifier);
      return {
        success: result.success,
        limit: 10,
        remaining: result.success ? 9 : 0,
      };
    }
  }

  // Utiliser le fallback en mémoire
  const result = await fallbackLimiter.limit(identifier);
  return {
    success: result.success,
    limit: 10,
    remaining: result.success ? 9 : 0,
  };
}

/**
 * Middleware pour protéger un endpoint API avec rate limiting
 */
export async function withRateLimit(
  identifier: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimitResult = await checkRateLimit(identifier);

  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'Retry-After': '60',
        },
      }
    );
  }

  return handler();
}
