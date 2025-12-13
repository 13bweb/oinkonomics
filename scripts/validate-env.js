#!/usr/bin/env node

/**
 * Script de validation des variables d'environnement
 * Utilisation: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const requiredVars = [
  {
    name: 'NEXT_PUBLIC_RPC_URL',
    description: 'RPC Endpoint Solana (utilisez un service payant)',
    validate: (val) => val && !val.includes('your-') && !val.includes('votre-') && val.startsWith('http'),
  },
  {
    name: 'NEXT_PUBLIC_SOLANA_CLUSTER_LABEL',
    description: 'Label du réseau (MAINNET ou DEVNET)',
    validate: (val) => val && ['MAINNET', 'DEVNET', 'TESTNET'].includes(val),
  },
  {
    name: 'NEXT_PUBLIC_COLLECTION_MINT',
    description: 'Mint de la collection NFT',
    validate: (val) => val && !val.includes('your-') && !val.includes('votre-') && val.length > 20,
  },
  {
    name: 'NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY',
    description: 'Update Authority de la collection',
    validate: (val) => val && !val.includes('your-') && !val.includes('votre-') && val.length > 20,
  },
  {
    name: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    description: 'Project ID WalletConnect (OBLIGATOIRE pour mobile)',
    validate: (val) => val && !val.includes('your-') && !val.includes('votre-') && val.length > 10,
    warning: 'Sans ce Project ID, la connexion mobile ne fonctionnera PAS correctement.',
  },
  {
    name: 'NEXT_PUBLIC_APP_NAME',
    description: 'Nom de l\'application',
    validate: (val) => val && val.length > 0,
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'URL de l\'application (domaine de production)',
    validate: (val) => val && !val.includes('your-') && !val.includes('votre-') && val.startsWith('http'),
  },
];

const optionalVars = [
  {
    name: 'NEXT_PUBLIC_APP_ICON',
    description: 'URL de l\'icône de l\'application',
  },
  {
    name: 'NEXT_PUBLIC_COMPUTE_UNIT_LIMIT',
    description: 'Limite de compute units',
  },
  {
    name: 'NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS',
    description: 'Prix des compute units',
  },
];

console.log('🔍 Validation des variables d\'environnement...\n');

let hasErrors = false;
let hasWarnings = false;

// Vérifier les variables requises
requiredVars.forEach(({ name, description, validate, warning }) => {
  const value = process.env[name];

  if (!value) {
    console.error(`❌ ${name}`);
    console.error(`   Manquant: ${description}`);
    hasErrors = true;
  } else if (!validate(value)) {
    console.error(`❌ ${name}`);
    console.error(`   Valeur invalide: ${description}`);
    console.error(`   Valeur actuelle: ${value.substring(0, 50)}...`);
    hasErrors = true;
  } else {
    console.log(`✅ ${name}`);
    if (warning) {
      console.warn(`   ⚠️  ${warning}`);
      hasWarnings = true;
    }
  }
});

// Vérifier Candy Machine IDs:
// - soit NEXT_PUBLIC_CANDY_MACHINE_ID (global)
// - soit les 3 variables par tier
const isValidCandyMachineId = (val) =>
  val && !val.includes('your-') && !val.includes('votre-') && val.length > 20;

const globalCandyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
const poorCandyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_POOR;
const midCandyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_MID;
const richCandyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID_RICH;

const hasGlobalCM = isValidCandyMachineId(globalCandyMachineId);
const hasTierCMs =
  isValidCandyMachineId(poorCandyMachineId) &&
  isValidCandyMachineId(midCandyMachineId) &&
  isValidCandyMachineId(richCandyMachineId);

if (hasGlobalCM) {
  console.log('✅ NEXT_PUBLIC_CANDY_MACHINE_ID');
} else if (hasTierCMs) {
  console.log('✅ NEXT_PUBLIC_CANDY_MACHINE_ID_POOR');
  console.log('✅ NEXT_PUBLIC_CANDY_MACHINE_ID_MID');
  console.log('✅ NEXT_PUBLIC_CANDY_MACHINE_ID_RICH');
} else {
  console.error('❌ Candy Machine IDs manquants');
  console.error('   Fournissez soit NEXT_PUBLIC_CANDY_MACHINE_ID (global), soit les 3 IDs par tier:');
  console.error('   - NEXT_PUBLIC_CANDY_MACHINE_ID_POOR');
  console.error('   - NEXT_PUBLIC_CANDY_MACHINE_ID_MID');
  console.error('   - NEXT_PUBLIC_CANDY_MACHINE_ID_RICH');
  hasErrors = true;
}

console.log('\n📋 Variables optionnelles:');

// Afficher les variables optionnelles
optionalVars.forEach(({ name, description }) => {
  const value = process.env[name];
  if (value) {
    console.log(`   ✅ ${name}: ${description}`);
  } else {
    console.log(`   ⚪ ${name}: ${description} (non configurée)`);
  }
});

// Vérifications spéciales
console.log('\n🔍 Vérifications spéciales:');

// Vérifier que RPC n'est pas le endpoint public
if (process.env.NEXT_PUBLIC_RPC_URL?.includes('api.mainnet-beta.solana.com') ||
  process.env.NEXT_PUBLIC_RPC_URL?.includes('api.devnet.solana.com')) {
  console.warn('⚠️  Vous utilisez un RPC endpoint public.');
  console.warn('   Pour la production, utilisez un service payant (Helius, QuickNode, etc.)');
  console.warn('   pour éviter le rate limiting.');
  hasWarnings = true;
}

// Vérifier que l'URL de l'app n'est pas localhost en production
if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') &&
  process.env.NODE_ENV === 'production') {
  console.error('❌ NEXT_PUBLIC_APP_URL ne doit pas être localhost en production');
  hasErrors = true;
}

// Résumé
console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.error('\n❌ ERREURS DÉTECTÉES');
  console.error('Corrigez les erreurs ci-dessus avant de déployer en production.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  AVERTISSEMENTS DÉTECTÉS');
  console.warn('Vérifiez les avertissements ci-dessus.\n');
  process.exit(0);
} else {
  console.log('\n✅ TOUTES LES VARIABLES SONT CONFIGURÉES CORRECTEMENT');
  console.log('Le projet est prêt pour le déploiement en production !\n');
  process.exit(0);
}
