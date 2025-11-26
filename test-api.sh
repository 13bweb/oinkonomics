#!/bin/bash

echo "🐷 Test de l'API de vérification des tiers de wallet Oinkonomics 🐷"
echo "=================================================================="
echo ""

# Test avec une adresse wallet valide (exemple - remplacez par une vraie adresse)
TEST_WALLET="11111111111111111111111111111112"

echo "📡 Test de l'API avec l'adresse: $TEST_WALLET"
echo ""

curl -X POST http://localhost:3000/api/verify-tier \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"$TEST_WALLET\"}" \
  --silent \
  --show-error \
  | jq . || echo "Erreur lors de la requête API"

echo ""
echo ""
echo "📝 Si vous voyez une erreur, c'est normal car l'adresse de test n'existe pas."
echo "Connectez un vrai wallet via l'interface web pour voir le système fonctionner !"
echo ""
echo "🌐 Ouvrez votre navigateur sur: http://localhost:3000"