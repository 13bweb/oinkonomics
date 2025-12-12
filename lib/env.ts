/**
 * Validation des variables d'environnement avec Zod
 * Fait échouer le build si les variables critiques manquent
 */

import { z } from 'zod';

// Schéma de validation pour les variables d'environnement
const envSchema = z.object({
  // Variables publiques (frontend)
  NEXT_PUBLIC_RPC_URL: z.string().url().min(1),
  NEXT_PUBLIC_SOLANA_CLUSTER_LABEL: z.enum(['MAINNET', 'DEVNET', 'TESTNET']).optional(),
  NEXT_PUBLIC_CANDY_MACHINE_ID_POOR: z.string().min(32).optional(),
  NEXT_PUBLIC_CANDY_MACHINE_ID_MID: z.string().min(32).optional(),
  NEXT_PUBLIC_CANDY_MACHINE_ID_RICH: z.string().min(32).optional(),
  NEXT_PUBLIC_CANDY_GUARD: z.string().min(32).optional(),
  NEXT_PUBLIC_COLLECTION_MINT: z.string().min(32).optional(),
  NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY: z.string().min(32).optional(),
  NEXT_PUBLIC_COMPUTE_UNIT_LIMIT: z.string().transform(Number).optional(),
  NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS: z.string().transform(Number).optional(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_ICON: z.string().url().optional(),

  // Variables privées (backend)
  RPC_URL: z.string().url().optional(),
  SERVER_KEYPAIR_PATH: z.string().optional(),
  POOR_CM_ID: z.string().optional(),
  MID_CM_ID: z.string().optional(),
  RICH_CM_ID: z.string().optional(),

  // Rate limiting (optionnel)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Environnement
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Variables requises uniquement en production
const productionEnvSchema = envSchema.extend({
  NEXT_PUBLIC_RPC_URL: z.string().url().min(1).refine(
    (url) => !url.includes('your-') && !url.includes('votre-'),
    { message: 'NEXT_PUBLIC_RPC_URL doit être configuré avec une vraie URL' }
  ),
  NEXT_PUBLIC_COLLECTION_MINT: z.string().min(32).refine(
    (val) => !val.includes('your-') && !val.includes('votre-'),
    { message: 'NEXT_PUBLIC_COLLECTION_MINT doit être configuré' }
  ),
  NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY: z.string().min(32).refine(
    (val) => !val.includes('your-') && !val.includes('votre-'),
    { message: 'NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY doit être configuré' }
  ),
});

/**
 * Valide les variables d'environnement
 * Lance une erreur si les variables critiques manquent en production
 */
export function validateEnv(): z.infer<typeof envSchema> {
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    if (isProduction) {
      return productionEnvSchema.parse(process.env);
    } else {
      return envSchema.parse(process.env);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      console.error('❌ ERREUR: Variables d\'environnement invalides:');
      missingVars.forEach((v) => console.error(`   - ${v}`));

      if (isProduction) {
        throw new Error(
          `Variables d'environnement manquantes ou invalides en production:\n${missingVars.join('\n')}`
        );
      }
    }
    throw error;
  }
}

// Valider au chargement du module (uniquement côté serveur)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // En développement, on affiche juste un warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Variables d\'environnement non validées:', error);
    } else {
      // En production, on fait échouer le build
      throw error;
    }
  }
}

export const env = validateEnv();
