/**
 * Système de logging conditionnel pour Oinkonomics
 * Les logs sont désactivés en production sauf pour les erreurs
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug';

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger conditionnel qui respecte l'environnement
 */
export const logger: Logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
    // En production, on peut envoyer les warnings à un service de monitoring
    // TODO: Intégrer Sentry ou similaire
  },

  error: (...args: unknown[]) => {
    // Toujours logger les erreurs, même en production
    console.error(...args);
    // TODO: Envoyer à un service de logging (Sentry, etc.)
  },

  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

/**
 * Helper pour logger les informations sensibles (masquées en production)
 */
export function logSensitive(label: string, data: Record<string, unknown>): void {
  if (isDevelopment) {
    logger.log(`🔐 ${label}:`, data);
  } else {
    // En production, logger uniquement les clés sans valeurs
    logger.log(`🔐 ${label}:`, Object.keys(data).join(', '));
  }
}

export default logger;
