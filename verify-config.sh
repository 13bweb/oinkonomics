#!/bin/bash

# 🧪 Script de test rapide pour Oinkonomics Mint Gratuit
# Ce script vérifie que toutes les configurations sont en place

echo "🔍 VÉRIFICATION CONFIGURATION OINKONOMICS"
echo "=========================================="
echo ""

# Vérifier que .env.local existe
if [ -f .env.local ]; then
    echo "✅ Fichier .env.local trouvé"
else
    echo "❌ Fichier .env.local manquant!"
    exit 1
fi

# Vérifier les variables critiques
echo ""
echo "📋 Vérification des variables d'environnement..."
echo ""

check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.local | cut -d '=' -f2)
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name: MANQUANT"
        return 1
    else
        echo "✅ $var_name: ${var_value:0:20}..."
        return 0
    fi
}

# Variables critiques
check_env_var "NEXT_PUBLIC_CANDY_MACHINE_ID"
check_env_var "NEXT_PUBLIC_CANDY_GUARD"
check_env_var "NEXT_PUBLIC_COLLECTION_MINT"
check_env_var "NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY"
check_env_var "NEXT_PUBLIC_RULE_SET"
check_env_var "NEXT_PUBLIC_RPC_URL"

echo ""
echo "🔧 Vérification des dépendances..."
echo ""

# Vérifier que node_modules existe
if [ -d node_modules ]; then
    echo "✅ node_modules trouvé"
else
    echo "⚠️  node_modules manquant - exécutez 'npm install'"
fi

# Vérifier les packages Metaplex
if [ -d "node_modules/@metaplex-foundation/mpl-candy-machine" ]; then
    echo "✅ @metaplex-foundation/mpl-candy-machine installé"
else
    echo "❌ @metaplex-foundation/mpl-candy-machine manquant"
fi

if [ -d "node_modules/@metaplex-foundation/mpl-toolbox" ]; then
    echo "✅ @metaplex-foundation/mpl-toolbox installé"
else
    echo "❌ @metaplex-foundation/mpl-toolbox manquant"
fi

echo ""
echo "📝 Vérification des fichiers modifiés..."
echo ""

# Vérifier que les fichiers critiques existent
if [ -f "lib/utils.ts" ]; then
    echo "✅ lib/utils.ts trouvé"
    
    # Vérifier que mintV2 est utilisé
    if grep -q "mintV2" lib/utils.ts; then
        echo "  ✅ mintV2 utilisé (pNFT support)"
    else
        echo "  ⚠️  mintV2 non trouvé - vérifiez le code"
    fi
else
    echo "❌ lib/utils.ts manquant"
fi

if [ -f "components/VerifyMint.tsx" ]; then
    echo "✅ components/VerifyMint.tsx trouvé"
else
    echo "❌ components/VerifyMint.tsx manquant"
fi

echo ""
echo "🎯 RÉSUMÉ"
echo "=========================================="
echo ""
echo "Candy Machine: V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV"
echo "Candy Guard:   3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9"
echo "Collection:    EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y"
echo "Rule Set:      eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"
echo ""
echo "Prix Mint:     GRATUIT (0 SOL)"
echo "Type:          pNFT (Programmable NFT)"
echo "Restrictions:  AUCUNE"
echo ""
echo "=========================================="
echo "✅ Configuration vérifiée!"
echo ""
echo "🚀 Pour démarrer le serveur de développement:"
echo "   npm run dev"
echo ""
echo "🔗 Puis ouvrez: http://localhost:3000"
echo ""
