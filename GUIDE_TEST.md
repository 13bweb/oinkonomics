# 🧪 GUIDE DE TEST - OINKONOMICS MINT GRATUIT

## 🎯 Objectif
Tester le mint gratuit des NFTs Oinkonomics sur Solana Mainnet.

---

## ⚠️ PRÉREQUIS

### 1. Wallet Solana
- Phantom, Solflare, ou tout wallet compatible Solana
- **Minimum 0.002 SOL** pour les frais de transaction réseau
- Le mint est **GRATUIT**, seuls les frais réseau sont requis

### 2. Réseau
- Assurez-vous d'être sur **Mainnet** (pas Devnet)

### 3. Configuration
- Toutes les variables d'environnement doivent être configurées
- Exécutez `./verify-config.sh` pour vérifier

---

## 🚀 ÉTAPES DE TEST

### 1. Démarrer le serveur de développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 2. Ouvrir l'application

Ouvrez votre navigateur et allez sur:
```
http://localhost:3000
```

### 3. Connecter votre wallet

1. Cliquez sur le bouton de connexion wallet
2. Sélectionnez votre wallet (Phantom, Solflare, etc.)
3. Approuvez la connexion dans votre wallet

### 4. Vérifier votre tier

1. Cliquez sur **"🐷 Vérifier mes Oinks! 🐷"**
2. L'application va:
   - Récupérer votre solde SOL
   - Calculer la valeur en USD
   - Déterminer votre tier (POOR, MID, ou RICH)
   - Assigner un numéro NFT dans la range de votre tier

### 5. Minter votre NFT

1. Vérifiez le message: **"🎉 Mint GRATUIT : 0 SOL"**
2. Cliquez sur **"🐷 Minter NFT #XXX GRATUITEMENT 🐷"**
3. Approuvez la transaction dans votre wallet
4. Attendez la confirmation (~5-10 secondes)

### 6. Vérifier le résultat

Si le mint réussit, vous verrez:
- ✅ Message de succès avec la signature de transaction
- ✅ L'adresse du NFT minté

---

## 🔍 VÉRIFICATION DU NFT

### Sur Solana Explorer

1. Copiez l'adresse du NFT minté
2. Allez sur: https://explorer.solana.com/?cluster=mainnet
3. Collez l'adresse dans la barre de recherche
4. Vérifiez:
   - ✅ Type: **Programmable NFT (pNFT)**
   - ✅ Collection: `EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y`
   - ✅ Owner: Votre adresse wallet
   - ✅ Transférable: Oui (pas de freeze)

### Dans votre wallet

1. Ouvrez votre wallet (Phantom, Solflare, etc.)
2. Allez dans la section "Collectibles" ou "NFTs"
3. Vous devriez voir votre NFT Oinkonomics

---

## 📊 TIERS ET RANGES NFT

### TOO POOR (< $10)
- ❌ **Pas de mint possible**
- Message: "You need at least $10 to mint!"

### POOR ($10 - $1,000)
- ✅ NFT #1 - #1000
- Couleur: Jaune

### MID ($1,000 - $10,000)
- ✅ NFT #1001 - #2000
- Couleur: Bleu

### RICH (> $10,000)
- ✅ NFT #2001 - #3000
- Couleur: Violet

---

## 🐛 DÉPANNAGE

### Erreur: "Solde insuffisant"

**Cause**: Pas assez de SOL pour les frais réseau

**Solution**: 
- Ajoutez au moins 0.002 SOL à votre wallet
- Le mint est gratuit, mais les frais réseau sont ~0.001 SOL

### Erreur: "Configuration Candy Guard incorrecte"

**Cause**: Problème avec l'adresse du Candy Guard

**Solution**:
1. Vérifiez que `NEXT_PUBLIC_CANDY_GUARD` est bien configuré
2. Valeur attendue: `3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9`
3. Redémarrez le serveur après modification

### Erreur: "Collection épuisée"

**Cause**: Les 3000 NFTs ont tous été mintés

**Solution**:
- Vérifiez sur Solana Explorer combien de NFTs ont été mintés
- Si la collection est épuisée, il n'y a plus de NFTs disponibles

### Erreur: "Problème avec le Rule Set pNFT"

**Cause**: Le Rule Set n'est pas correctement configuré

**Solution**:
1. Vérifiez que `NEXT_PUBLIC_RULE_SET` est configuré
2. Valeur attendue: `eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9`
3. Redémarrez le serveur

### Le wallet ne se connecte pas

**Solutions**:
1. Rafraîchissez la page
2. Assurez-vous que votre wallet est sur Mainnet
3. Essayez un autre navigateur
4. Désactivez les extensions qui pourraient bloquer

---

## 📝 LOGS DE DÉBOGAGE

### Console Navigateur

Ouvrez la console (F12) pour voir les logs détaillés:

```
🎯 MINT GRATUIT - Oinkonomics pNFT...
🔧 Configuration Candy Machine (pNFT):
  - candyMachine: V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
  - candyGuard: 3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
  - collectionMint: EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
  - ruleSet: eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9
✅ NFT Oinkonomics GRATUIT minté avec succès !
```

### Vérifier la transaction

Après un mint réussi, vous recevrez une signature de transaction.

Vérifiez-la sur:
```
https://explorer.solana.com/tx/[SIGNATURE]?cluster=mainnet
```

---

## ✅ CHECKLIST DE TEST

### Avant le test
- [ ] Wallet connecté avec au moins 0.002 SOL
- [ ] Sur Mainnet (pas Devnet)
- [ ] Serveur de dev démarré (`npm run dev`)
- [ ] Configuration vérifiée (`./verify-config.sh`)

### Pendant le test
- [ ] Connexion wallet réussie
- [ ] Vérification du tier réussie
- [ ] Numéro NFT assigné
- [ ] Message "Mint GRATUIT" affiché
- [ ] Transaction approuvée dans le wallet

### Après le test
- [ ] Message de succès affiché
- [ ] Signature de transaction reçue
- [ ] NFT visible sur Solana Explorer
- [ ] NFT visible dans le wallet
- [ ] Type = Programmable NFT (pNFT)
- [ ] Transférable (pas de freeze)

---

## 🎯 TESTS AVANCÉS

### Test 1: Mint Multiple
1. Mintez un premier NFT
2. Attendez la confirmation
3. Mintez un deuxième NFT
4. Vérifiez que vous recevez un numéro différent

### Test 2: Vérification pNFT
1. Après le mint, allez sur Solana Explorer
2. Vérifiez que le NFT est bien de type "Programmable"
3. Vérifiez que le Rule Set est attaché

### Test 3: Transfert
1. Mintez un NFT
2. Essayez de le transférer à un autre wallet
3. Vérifiez que le transfert fonctionne (pas de freeze)

### Test 4: Différents Tiers
1. Testez avec un wallet POOR (< $1,000)
2. Testez avec un wallet MID ($1,000 - $10,000)
3. Testez avec un wallet RICH (> $10,000)
4. Vérifiez que les numéros NFT sont dans les bonnes ranges

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:

1. **Vérifiez les logs** dans la console navigateur (F12)
2. **Vérifiez la configuration** avec `./verify-config.sh`
3. **Vérifiez le Candy Guard** sur Solana Explorer
4. **Testez avec Sugar CLI** pour isoler le problème:
   ```bash
   sugar mint --candy-guard 3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
   ```

---

## 🎉 SUCCÈS !

Si tout fonctionne:
- ✅ Vous avez minté un pNFT gratuitement
- ✅ Le NFT est dans votre wallet
- ✅ Le NFT est transférable
- ✅ La configuration est correcte

**Prêt pour le déploiement en production ! 🚀**
