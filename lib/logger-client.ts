/**
 * Système de logging conditionnel pour le client (navigateur)
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

/**
 * Logger conditionnel qui respecte l'environnement (côté client)
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
  },

  error: (...args: unknown[]) => {
    // Toujours logger les erreurs, même en production
    console.error(...args);
  },

  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

export default logger;
