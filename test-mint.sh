#!/bin/bash

echo "🐷 Test du Système de Mint Oinkonomics 🐷"
echo "=========================================="
echo ""

echo "✅ Vérifications préalables:"
echo "1. Serveur Next.js: http://localhost:3002"
echo "2. Devnet configuré: ✅"
echo "3. Système de tiers: TOO_POOR, POOR, MID, RICH"
echo "4. NFT numérotés: 1-100, 100-200, 200-300"
echo ""

echo "🔍 Pour tester le mint:"
echo "1. Ouvrez http://localhost:3002"
echo "2. Connectez votre wallet (devnet)"
echo "3. Cliquez 'Scan my wallet'"
echo "4. Cliquez 'Mint NFT #XX' selon votre tier"
echo ""

echo "📊 Simulation de mint avec différentes adresses:"
echo ""

# Test avec différentes adresses
test_addresses=(
    "11111111111111111111111111111112"  # Adresse de test 1
    "So11111111111111111111111111111111111111112"  # Wrapped SOL
)

for addr in "${test_addresses[@]}"; do
    echo "🎯 Test avec adresse: $addr"
    
    response=$(curl -s -X POST http://localhost:3002/api/verify-tier \
        -H "Content-Type: application/json" \
        -d "{\"walletAddress\":\"$addr\"}" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ Réponse API reçue"
        echo "$response" | jq -r '
            if .tier then 
                "   Tier: \(.tier)"
            else 
                "   Erreur: \(.error // "Réponse invalide")"
            end
        ' 2>/dev/null || echo "   $response"
    else
        echo "❌ Erreur de connexion à l'API"
    fi
    echo ""
done

echo "🔧 Debug - Commandes utiles:"
echo "- Voir les logs du serveur dans le terminal"
echo "- Ouvrir la console du navigateur (F12)"
echo "- Vérifier que le wallet est connecté en devnet"
echo ""
echo "💡 Si le mint ne fonctionne toujours pas:"
echo "1. Vérifiez la console du navigateur pour les erreurs"
echo "2. Assurez-vous d'avoir du SOL devnet"
echo "3. Le système utilise actuellement des simulations (placeholders)"