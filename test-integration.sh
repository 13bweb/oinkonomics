#!/bin/bash

echo "🎯 TEST INTÉGRATION COLLECTION RÉELLE OINKONOMICS 🐷"
echo "=================================================="

cd /home/b13/Desktop/Oinkonomics/Web/oinkonomics

echo ""
echo "📋 Vérification de la configuration..."
echo "✅ RPC URL:" $(grep NEXT_PUBLIC_RPC_URL .env.local)
echo "✅ Collection:" $(grep COLLECTION_MINT .env.local)
echo "✅ Candy Machine:" $(grep CANDY_MACHINE_ID .env.local)

echo ""
echo "🔧 Test de compilation..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build réussi !"
else
    echo "❌ Erreur de build"
    exit 1
fi

echo ""
echo "🌐 Application disponible sur:"
echo "   Local: http://localhost:3000"
echo ""
echo "🎯 Tests à effectuer manuellement:"
echo "1. Connecter un wallet Solana (devnet)"
echo "2. Cliquer sur 'Scan My Wallet'"  
echo "3. Vérifier le tier détecté (POOR/MID/RICH)"
echo "4. Cliquer sur 'Mint NFT' pour un mint RÉEL !"
echo ""
echo "🔗 Collection Oinkonomics sur Solana Explorer:"
echo "https://explorer.solana.com/address/9JCdYQL53tH97ef7zZBTYWYtLAcWSQVMocs2AjqjD6a4?cluster=devnet"
echo ""
echo "🎉 INTÉGRATION TERMINÉE - PLUS DE SIMULATION, QUE DU RÉEL ! 🎉"