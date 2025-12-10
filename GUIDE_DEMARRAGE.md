# 🚀 Guide de Démarrage - Oinkonomics

## Prérequis

- Node.js 18+ installé
- npm ou yarn
- Un wallet Solana (Phantom, Solflare, etc.)

## 📋 Étapes de Démarrage

### 1. Vérifier les dépendances

```bash
# Vérifier que node_modules existe
ls node_modules

# Si node_modules n'existe pas, installer les dépendances
npm install
```

### 2. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp env.example .env.local

# Éditer .env.local avec vos valeurs
nano .env.local  # ou votre éditeur préféré
```

**Variables minimales requises pour tester :**

```env
# RPC Endpoint (utilisez devnet pour les tests)
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL=DEVNET

# Collection (remplacez par vos IDs réels)
NEXT_PUBLIC_COLLECTION_MINT=votre-collection-mint-id
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=votre-update-authority-id

# Candy Machines (remplacez par vos IDs réels)
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR=votre-cm-poor-id
NEXT_PUBLIC_CANDY_MACHINE_ID_MID=votre-cm-mid-id
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH=votre-cm-rich-id
```

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

Le serveur démarrera sur **<http://localhost:3000>**

### 4. Tester l'application

1. **Ouvrir dans le navigateur :** <http://localhost:3000>
2. **Connecter un wallet :** Cliquez sur le bouton "Connect Wallet"
3. **Scanner le wallet :** Cliquez sur "Scan my wallet"
4. **Vérifier le tier :** Votre tier devrait s'afficher
5. **Tester le mint :** Si vous avez le tier approprié, testez le mint

## 🧪 Checklist de Test

### Tests Fonctionnels

- [ ] L'application se charge sans erreur
- [ ] Le bouton de connexion wallet fonctionne
- [ ] La connexion wallet réussit (desktop)
- [ ] La connexion wallet réussit (mobile)
- [ ] Le scan de wallet fonctionne
- [ ] Le tier est correctement calculé
- [ ] Les messages d'erreur sont clairs
- [ ] Le mint fonctionne (si solde suffisant)

### Tests de Sécurité

- [ ] Aucune variable d'environnement n'est loggée en production
- [ ] Les messages d'erreur API ne révèlent pas de détails sensibles
- [ ] La validation des adresses wallet fonctionne
- [ ] Les types TypeScript sont corrects (pas d'erreurs)

### Tests Mobile

- [ ] La détection mobile fonctionne
- [ ] Les messages d'aide s'affichent correctement
- [ ] La connexion wallet fonctionne sur mobile
- [ ] Les deep links fonctionnent (si configurés)

## 🐛 Dépannage

### Erreur : "Cannot find module"

```bash
npm install
```

### Erreur : "Port 3000 already in use"

```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

### Erreur : "Invalid wallet address"

- Vérifiez que vous utilisez une adresse Solana valide
- Vérifiez que le wallet est connecté

### Erreur : "Candy Guard incorrect"

- Vérifiez vos IDs de Candy Machine dans .env.local
- Assurez-vous que les Candy Machines sont correctement configurées

## 📝 Notes Importantes

1. **Mode Devnet recommandé pour les tests :** Utilisez devnet pour éviter de dépenser du SOL réel
2. **Wallet Devnet :** Assurez-vous d'avoir un wallet configuré sur devnet avec des SOL de test
3. **RPC Endpoint :** Pour la production, utilisez un RPC payant (Helius, QuickNode, etc.)
4. **Variables d'environnement :** Ne commitez jamais le fichier .env.local

## 🔗 Liens Utiles

- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Solana Explorer Devnet](https://explorer.solana.com/?cluster=devnet)
- [Documentation Metaplex](https://docs.metaplex.com/)
