# 🚀 Guide de Déploiement Production - Oinkonomics

## 📋 Checklist Pré-Déploiement

### ✅ Étape 1 : Configuration des Variables d'Environnement

**OBLIGATOIRE :** Configurez toutes les variables dans votre plateforme de déploiement.

#### Variables Critiques (DOIVENT être configurées)

```env
# 1. RPC Endpoint (Service payant OBLIGATOIRE)
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=VOTRE_CLE
# OU
NEXT_PUBLIC_RPC_URL=https://votre-endpoint.quiknode.pro/VOTRE_CLE

# 2. Label du réseau
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL=MAINNET

# 3. Candy Machines (IDs réels)
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR=votre-id-reel-poor
NEXT_PUBLIC_CANDY_MACHINE_ID_MID=votre-id-reel-mid
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH=votre-id-reel-rich

# 4. Collection NFT
NEXT_PUBLIC_COLLECTION_MINT=votre-collection-mint-id
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=votre-update-authority-id

# 5. WalletConnect (OBLIGATOIRE pour mobile)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre-project-id-walletconnect

# 6. Application
NEXT_PUBLIC_APP_NAME=Oinkonomics
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_PUBLIC_APP_ICON=https://votre-domaine.com/icon.png
```

#### Validation

Exécutez le script de validation avant le déploiement :

```bash
npm run validate-env
```

---

### ✅ Étape 2 : Obtenir le WalletConnect Project ID

1. **Créer un compte** sur <https://dashboard.reown.com> (gratuit)
2. **Créer un nouveau projet**
3. **Copier le Project ID**
4. **Ajouter dans les variables d'environnement**

⚠️ **Sans ce Project ID, la connexion mobile ne fonctionnera PAS.**

---

### ✅ Étape 3 : Configuration RPC

**N'utilisez PAS** les endpoints publics en production :

- ❌ `https://api.mainnet-beta.solana.com` (rate limiting)
- ❌ `https://api.devnet.solana.com` (rate limiting)

**Utilisez un service payant :**

- ✅ **Helius** : <https://www.helius.dev/> (gratuit jusqu'à 100k requêtes/mois)
- ✅ **QuickNode** : <https://www.quicknode.com/>
- ✅ **Triton** : <https://triton.one/>

---

### ✅ Étape 4 : Build et Tests Locaux

```bash
# 1. Valider les variables
npm run validate-env

# 2. Build de production
npm run build

# 3. Tester le build localement
npm run start

# 4. Tester sur http://localhost:3000
```

---

## 🌐 Déploiement sur Vercel

### Configuration Vercel

1. **Connecter le repository GitHub**
2. **Aller dans Settings → Environment Variables**
3. **Ajouter toutes les variables `NEXT_PUBLIC_*`**
4. **Déployer**

### Variables Vercel

Dans le dashboard Vercel, ajoutez :

```
NEXT_PUBLIC_RPC_URL = https://votre-rpc-endpoint.com
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL = MAINNET
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR = votre-id
NEXT_PUBLIC_CANDY_MACHINE_ID_MID = votre-id
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH = votre-id
NEXT_PUBLIC_COLLECTION_MINT = votre-id
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY = votre-id
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = votre-project-id
NEXT_PUBLIC_APP_NAME = Oinkonomics
NEXT_PUBLIC_APP_URL = https://votre-domaine.com
NEXT_PUBLIC_APP_ICON = https://votre-domaine.com/icon.png
```

---

## 📱 Configuration Mobile

### Deep Links

Les deep links sont automatiquement configurés avec :

- **Schéma natif :** `oinkonomics://`
- **URL universelle :** `https://votre-domaine.com/wallet-callback`

### Wallets Supportés

- ✅ **Phantom** (Desktop + Mobile)
- ✅ **Solflare** (Desktop + Mobile)
- ✅ **Trust Wallet** (Mobile)
- ✅ **Coinbase Wallet** (Mobile)

### Test Mobile

1. **Ouvrir l'application sur mobile**
2. **Cliquer sur "Connect Wallet"**
3. **Sélectionner un wallet**
4. **Vérifier que la connexion fonctionne**
5. **Tester le scan de wallet**
6. **Tester le mint (si solde suffisant)**

---

## 🧪 Tests Post-Déploiement

### Tests Desktop

- [ ] Page se charge correctement
- [ ] Connexion wallet fonctionne (Phantom, Solflare)
- [ ] Scan de wallet fonctionne
- [ ] Calcul de tier correct
- [ ] Mint fonctionne (si solde suffisant)
- [ ] Messages d'erreur appropriés

### Tests Mobile

- [ ] Page se charge correctement
- [ ] Connexion wallet fonctionne
- [ ] Deep links fonctionnent
- [ ] WalletConnect fonctionne (nécessite Project ID)
- [ ] Scan de wallet fonctionne
- [ ] Mint fonctionne

### Tests API

- [ ] Endpoint `/api/verify-tier` fonctionne
- [ ] Validation des adresses wallet
- [ ] Gestion d'erreurs appropriée
- [ ] Pas d'exposition de détails sensibles

---

## ⚠️ Points Critiques

1. **RPC Endpoint :** Utilisez un service payant
2. **WalletConnect Project ID :** OBLIGATOIRE pour mobile
3. **Candy Machine IDs :** Vérifiez qu'ils sont corrects
4. **Collection Mint :** Vérifiez que la collection existe
5. **URL de l'application :** Doit correspondre à votre domaine

---

## 🔍 Dépannage

### Erreur : "Variables d'environnement manquantes"

```bash
# Exécuter le script de validation
npm run validate-env

# Corriger les variables manquantes
# Re-déployer
```

### Erreur : "WalletConnect 403"

- Vérifiez que `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` est configuré
- Vérifiez que le Project ID est correct
- Vérifiez que le projet est actif sur dashboard.reown.com

### Erreur : "Candy Guard incorrect"

- Vérifiez que les IDs de Candy Machine sont corrects
- Vérifiez que les Candy Machines sont déployées
- Vérifiez que la collection est correctement configurée

### Connexion mobile ne fonctionne pas

- Vérifiez que `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` est configuré
- Vérifiez que `NEXT_PUBLIC_APP_URL` correspond à votre domaine
- Testez avec différents wallets (Phantom, Solflare)

---

## 📝 Checklist Finale

Avant de déployer, vérifiez :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Le script `validate-env` passe sans erreur
- [ ] Le build de production fonctionne (`npm run build`)
- [ ] Les tests locaux passent
- [ ] WalletConnect Project ID est configuré
- [ ] RPC endpoint est un service payant
- [ ] Tous les IDs de Candy Machine sont corrects
- [ ] La collection NFT est correctement configurée
- [ ] L'URL de l'application correspond au domaine de production

---

## 🎉 Déploiement Réussi

Une fois déployé :

1. **Tester sur desktop**
2. **Tester sur mobile**
3. **Vérifier les logs** pour les erreurs
4. **Monitorer les performances**

---

**Le projet est maintenant prêt pour la production !** 🚀
