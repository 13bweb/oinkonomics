# 🚀 Configuration Production - Oinkonomics

## 📋 Checklist de Configuration Complète

### ✅ Variables d'Environnement Requises

Toutes les variables suivantes **DOIVENT** être configurées avant le déploiement en production.

---

## 🔧 Configuration Frontend (NEXT_PUBLIC_*)

### 1. Configuration Solana RPC

```env
# RPC Endpoint (OBLIGATOIRE - Utilisez un service payant pour la production)
NEXT_PUBLIC_RPC_URL=https://votre-rpc-endpoint.com
# Exemples de services payants :
# - Helius: https://mainnet.helius-rpc.com/?api-key=VOTRE_CLE
# - QuickNode: https://votre-endpoint.quiknode.pro/VOTRE_CLE
# - Triton: https://votre-endpoint.triton.one/VOTRE_CLE

# Label du réseau (affiché dans l'UI)
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL=MAINNET
```

⚠️ **IMPORTANT :** N'utilisez **PAS** `https://api.mainnet-beta.solana.com` en production (rate limiting). Utilisez un service payant.

---

### 2. Configuration Candy Machines

```env
# IDs des Candy Machines pour chaque tier (OBLIGATOIRE)
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR=votre-candy-machine-poor-id
NEXT_PUBLIC_CANDY_MACHINE_ID_MID=votre-candy-machine-mid-id
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH=votre-candy-machine-rich-id
```

**Comment obtenir ces IDs :**

1. Déployez vos Candy Machines avec Sugar CLI
2. Récupérez les IDs depuis le fichier `cache.json` généré
3. Ou utilisez `sugar show` pour voir les IDs

---

### 3. Configuration Collection NFT

```env
# Mint de la collection (OBLIGATOIRE)
NEXT_PUBLIC_COLLECTION_MINT=votre-collection-mint-id

# Update Authority de la collection (OBLIGATOIRE)
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=votre-update-authority-id
```

**Comment obtenir ces valeurs :**

1. Créez votre collection NFT avec Metaplex
2. Le `COLLECTION_MINT` est l'adresse du token de la collection
3. Le `COLLECTION_UPDATE_AUTHORITY` est l'adresse du wallet qui contrôle la collection

---

### 4. Configuration WalletConnect (OBLIGATOIRE pour Mobile)

```env
# Project ID WalletConnect (OBLIGATOIRE pour la connexion mobile)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre-project-id-walletconnect
```

**Comment obtenir le Project ID :**

1. Allez sur <https://dashboard.reown.com>
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Copiez le Project ID
5. Ajoutez-le dans `.env.local`

**Sans ce Project ID, la connexion mobile ne fonctionnera PAS correctement.**

---

### 5. Configuration Application

```env
# Nom de l'application
NEXT_PUBLIC_APP_NAME=Oinkonomics

# URL de l'application (votre domaine de production)
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# URL de l'icône de l'application
NEXT_PUBLIC_APP_ICON=https://votre-domaine.com/icon.png
```

---

### 6. Configuration Performance (Optionnel)

```env
# Limite de compute units pour les transactions
NEXT_PUBLIC_COMPUTE_UNIT_LIMIT=400000

# Prix des compute units (pour priorité)
NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS=0
```

---

## 🔒 Configuration Backend (Variables Secrètes)

Ces variables ne sont **PAS** utilisées dans le code actuel mais peuvent être nécessaires pour des fonctionnalités futures.

```env
# RPC privé pour le backend (si nécessaire)
RPC_URL=https://votre-rpc-prive.com

# Chemin vers le keypair du serveur (si nécessaire)
SERVER_KEYPAIR_PATH=/chemin/vers/votre/keypair.json
```

---

## ✅ Script de Validation

Créez un fichier `scripts/validate-env.js` pour valider toutes les variables :

```javascript
// scripts/validate-env.js
const requiredVars = [
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_SOLANA_CLUSTER_LABEL',
  'NEXT_PUBLIC_CANDY_MACHINE_ID_POOR',
  'NEXT_PUBLIC_CANDY_MACHINE_ID_MID',
  'NEXT_PUBLIC_CANDY_MACHINE_ID_RICH',
  'NEXT_PUBLIC_COLLECTION_MINT',
  'NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_URL',
];

const missing = requiredVars.filter(v => !process.env[v] || process.env[v].includes('your-') || process.env[v].includes('votre-'));

if (missing.length > 0) {
  console.error('❌ Variables manquantes ou non configurées:');
  missing.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

console.log('✅ Toutes les variables d\'environnement sont configurées');
```

---

## 📱 Configuration Mobile Spécifique

### Deep Links

Les deep links sont automatiquement gérés par Unified Wallet Kit avec la configuration suivante :

```typescript
// Dans WalletContextProvider.tsx
redirect: {
  native: 'oinkonomics://',  // Schéma de deep link
  universal: 'https://votre-domaine.com/wallet-callback',  // URL de callback
}
```

**Pour activer les deep links :**

1. Configurez `NEXT_PUBLIC_APP_URL` avec votre domaine de production
2. Le deep link `oinkonomics://` sera automatiquement utilisé
3. Les wallets mobiles (Phantom, Solflare) utiliseront ce schéma

---

## 🧪 Tests Avant Déploiement

### 1. Test Desktop

- [ ] Connexion wallet fonctionne (Phantom, Solflare)
- [ ] Scan de wallet fonctionne
- [ ] Calcul de tier correct
- [ ] Mint fonctionne (si solde suffisant)

### 2. Test Mobile

- [ ] Connexion wallet fonctionne sur mobile
- [ ] Deep links fonctionnent
- [ ] WalletConnect fonctionne (nécessite Project ID)
- [ ] Scan de wallet fonctionne
- [ ] Mint fonctionne

### 3. Test API

- [ ] Endpoint `/api/verify-tier` fonctionne
- [ ] Validation des adresses wallet fonctionne
- [ ] Gestion d'erreurs appropriée

---

## 🚀 Déploiement

### Vercel (Recommandé)

1. **Connecter le repository GitHub**
2. **Configurer les variables d'environnement** dans Vercel Dashboard
3. **Déployer**

**Variables à configurer dans Vercel :**

- Toutes les variables `NEXT_PUBLIC_*` listées ci-dessus

### Autres Plateformes

Assurez-vous que :

- Toutes les variables `NEXT_PUBLIC_*` sont configurées
- Le build passe sans erreur
- Les tests fonctionnent

---

## ⚠️ Points Critiques

1. **RPC Endpoint :** Utilisez un service payant (Helius, QuickNode, etc.)
2. **WalletConnect Project ID :** OBLIGATOIRE pour mobile
3. **Candy Machine IDs :** Vérifiez qu'ils sont corrects et déployés
4. **Collection Mint :** Vérifiez que la collection existe et est correcte
5. **URL de l'application :** Doit correspondre à votre domaine de production

---

## 📝 Exemple de `.env.local` Complet

```env
# ============================================
# CONFIGURATION PRODUCTION - OINKONOMICS
# ============================================

# RPC Endpoint (Service payant recommandé)
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=VOTRE_CLE_API
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL=MAINNET

# Candy Machines
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR=GKjKjrSQyYsn8DnwoSYjTRa1joPQTEXguBNhM4rSLBqZ
NEXT_PUBLIC_CANDY_MACHINE_ID_MID=votre-cm-mid-id
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH=votre-cm-rich-id

# Collection
NEXT_PUBLIC_COLLECTION_MINT=EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=votre-update-authority-id

# WalletConnect (OBLIGATOIRE pour mobile)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre-project-id-walletconnect

# Application
NEXT_PUBLIC_APP_NAME=Oinkonomics
NEXT_PUBLIC_APP_URL=https://oinkonomics.vercel.app
NEXT_PUBLIC_APP_ICON=https://oinkonomics.vercel.app/icon.png

# Performance
NEXT_PUBLIC_COMPUTE_UNIT_LIMIT=400000
NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS=0
```

---

**⚠️ IMPORTANT :** Remplacez **TOUTES** les valeurs `votre-*` et `VOTRE_*` par vos vraies valeurs avant le déploiement !
