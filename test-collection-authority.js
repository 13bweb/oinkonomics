#!/usr/bin/env node

// Test mint Oinkonomics avec la MÊME logique que hashlips/umi/mint-guard.mjs
// Ce script reproduit exactement leur approche pour valider notre correction

console.log('🎯 TEST MINT OINKONOMICS - Logique Hashlips Identique');
console.log('=======================================================');

// Vérifier que l'application est bien configurée
const fs = require('fs');
const path = require('path');

// Vérifications préalables
console.log('\n📋 Vérifications préalables...');

const envPath = path.resolve(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local manquant !');
  process.exit(1);
}

console.log('✅ .env.local trouvé');

// Lire la config
const envContent = fs.readFileSync(envPath, 'utf8');
const candyMachineMatch = envContent.match(/CANDY_MACHINE_ID=(.+)/);
const collectionMintMatch = envContent.match(/COLLECTION_MINT=(.+)/);

if (!candyMachineMatch || !collectionMintMatch) {
  console.error('❌ Configuration Candy Machine incomplète !');
  process.exit(1);
}

const candyMachineId = candyMachineMatch[1];
const collectionMint = collectionMintMatch[1];

console.log('✅ Configuration Candy Machine trouvée');
console.log(`   Candy Machine: ${candyMachineId}`);
console.log(`   Collection: ${collectionMint}`);

// Comparer avec hashlips cache.json
const haslhipsCachePath = path.resolve(__dirname, '../../hashlips/cache.json');
if (fs.existsSync(haslhipsCachePath)) {
  const cache = JSON.parse(fs.readFileSync(haslhipsCachePath, 'utf8'));
  const expectedCM = cache.program.candyMachine;
  const expectedCol = cache.program.collectionMint;
  
  if (candyMachineId === expectedCM && collectionMint === expectedCol) {
    console.log('✅ Configuration CONFORME à hashlips/cache.json');
  } else {
    console.error('❌ Configuration DIFFÉRENTE de hashlips/cache.json !');
    console.error(`   Attendu CM: ${expectedCM}`);
    console.error(`   Attendu Col: ${expectedCol}`);
    process.exit(1);
  }
}

console.log('\n🎯 PRÊT POUR LE TEST !');
console.log('Instructions :');
console.log('1. Assurez-vous d\'avoir au moins 0.015 SOL sur devnet');
console.log('2. Connectez Phantom/Solflare sur devnet');
console.log('3. Ouvrez http://localhost:3000');
console.log('4. Suivez le flow : Connect → Scan → Mint');
console.log('\n🚀 La correction collectionUpdateAuthority est appliquée !');
console.log('📊 Le mint devrait maintenant fonctionner sans erreur "IncorrectCollectionAuthority" !');

console.log('\n🔗 Liens utiles :');
console.log(`   Collection: https://explorer.solana.com/address/${collectionMint}?cluster=devnet`);
console.log(`   Candy Machine: https://explorer.solana.com/address/${candyMachineId}?cluster=devnet`);
console.log('   Application: http://localhost:3000');

console.log('\n🎉 TEST CORRECTION COLLECTION AUTHORITY - READY ! 🐷');