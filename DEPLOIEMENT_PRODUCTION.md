# 🚀 DÉPLOIEMENT PRODUCTION - OINKONOMICS

## ✅ PRÉREQUIS

Avant de déployer en production, assurez-vous que:

- ✅ Le build local réussit (`npm run build`)
- ✅ Les tests locaux sont concluants (`npm run dev`)
- ✅ Au moins un NFT a été minté avec succès en local
- ✅ La configuration a été vérifiée (`./verify-config.sh`)

---

## 🌐 DÉPLOIEMENT SUR VERCEL

### 1. Préparer le repository

```bash
# Ajouter tous les fichiers
git add .

# Commit
git commit -m "feat: Configuration mint gratuit pNFT - Mainnet"

# Push vers GitHub
git push origin main
```

### 2. Configurer les variables d'environnement sur Vercel

Allez dans **Settings > Environment Variables** et ajoutez:

#### Variables Réseau
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL=MAINNET
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=76bb04a0-52d9-4e33-a5d0-d716f97434ec
```

#### Variables Candy Machine
```
NEXT_PUBLIC_CANDY_MACHINE_ID=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_MACHINE_ID_MID=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
```

#### Variables Candy Guard & Collection
```
NEXT_PUBLIC_CANDY_GUARD=3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
NEXT_PUBLIC_COLLECTION_MINT=EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf
```

#### Variables pNFT
```
NEXT_PUBLIC_RULE_SET=eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9
```

#### Variables Prix & Performance
```
NEXT_PUBLIC_MINT_PRICE=0
NEXT_PUBLIC_COMPUTE_UNIT_LIMIT=400000
NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS=0
```

#### Variables WalletConnect
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=cf0f4c50b8001a0045e9b9f3971dbdc0
```

#### Variables App
```
NEXT_PUBLIC_APP_NAME=Oinkonomics
NEXT_PUBLIC_APP_URL=https://oinkonomics.vercel.app
NEXT_PUBLIC_APP_ICON=https://oinkonomics.vercel.app/icon.png
```

#### Variables Tiers (Optionnel)
```
NEXT_PUBLIC_NFT_RANGE_POOR_START=1
NEXT_PUBLIC_NFT_RANGE_POOR_END=1000
NEXT_PUBLIC_NFT_RANGE_MID_START=1001
NEXT_PUBLIC_NFT_RANGE_MID_END=2000
NEXT_PUBLIC_NFT_RANGE_RICH_START=2001
NEXT_PUBLIC_NFT_RANGE_RICH_END=3000
```

### 3. Déployer

1. Cliquez sur **Deploy** dans Vercel
2. Attendez la fin du build
3. Vérifiez qu'il n'y a pas d'erreurs

---

## 🧪 TESTS POST-DÉPLOIEMENT

### 1. Vérification de base

1. Ouvrez l'URL de production (ex: `https://oinkonomics.vercel.app`)
2. Vérifiez que la page se charge correctement
3. Ouvrez la console (F12) et vérifiez qu'il n'y a pas d'erreurs

### 2. Test de connexion wallet

1. Cliquez sur le bouton de connexion wallet
2. Connectez votre wallet (Phantom, Solflare, etc.)
3. Vérifiez que la connexion fonctionne

### 3. Test de vérification tier

1. Cliquez sur "Vérifier mes Oinks"
2. Vérifiez que le tier est calculé correctement
3. Vérifiez que le numéro NFT est assigné

### 4. Test de mint

⚠️ **ATTENTION**: Vous allez minter un vrai NFT sur Mainnet !

1. Assurez-vous d'avoir au moins 0.002 SOL
2. Cliquez sur "Minter NFT GRATUITEMENT"
3. Approuvez la transaction
4. Attendez la confirmation
5. Vérifiez le NFT sur Solana Explorer

### 5. Vérification du NFT

1. Copiez l'adresse du NFT minté
2. Allez sur https://explorer.solana.com/?cluster=mainnet
3. Vérifiez:
   - Type: Programmable NFT (pNFT)
   - Collection: `EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y`
   - Owner: Votre wallet
   - Transférable: Oui

---

## 📊 MONITORING

### Métriques à surveiller

1. **Nombre de NFTs mintés**
   - Vérifiez régulièrement sur Solana Explorer
   - URL: https://explorer.solana.com/address/V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV?cluster=mainnet

2. **Erreurs de mint**
   - Surveillez les logs Vercel
   - Surveillez les erreurs dans Sentry (si configuré)

3. **Performance**
   - Temps de chargement de la page
   - Temps de réponse de l'API `/api/verify-tier`
   - Temps de confirmation des transactions

### Outils de monitoring

- **Vercel Analytics**: Pour le trafic et la performance
- **Solana Explorer**: Pour les transactions et NFTs
- **Console navigateur**: Pour les erreurs frontend

---

## 🔒 SÉCURITÉ

### Variables sensibles

⚠️ **NE JAMAIS** commiter dans Git:
- Clés privées
- Seeds de wallet
- Clés API privées

✅ **OK pour commit** (variables publiques):
- `NEXT_PUBLIC_*` (toutes les variables publiques)
- Adresses publiques blockchain
- IDs de Candy Machine, Collection, etc.

### Bonnes pratiques

1. **RPC Endpoint**
   - Utilisez un RPC endpoint privé (Helius, QuickNode, etc.)
   - Ne partagez pas votre clé API publiquement
   - Configurez des rate limits

2. **Wallet Authority**
   - Gardez la clé privée du wallet authority en sécurité
   - Ne l'utilisez QUE pour les opérations Candy Machine
   - Sauvegardez la seed phrase dans un endroit sûr

3. **Monitoring**
   - Surveillez les transactions suspectes
   - Configurez des alertes pour les erreurs
   - Vérifiez régulièrement le solde du wallet authority

---

## 🐛 DÉPANNAGE PRODUCTION

### Build échoue sur Vercel

**Cause**: Variables d'environnement manquantes ou erreurs TypeScript

**Solution**:
1. Vérifiez que toutes les variables sont configurées
2. Vérifiez les logs de build Vercel
3. Testez le build localement: `npm run build`

### Mint échoue en production mais fonctionne en local

**Cause**: Différence de configuration entre local et production

**Solution**:
1. Comparez les variables d'environnement
2. Vérifiez les logs Vercel
3. Testez avec la même configuration que production en local

### "Configuration Candy Guard incorrecte"

**Cause**: Variable `NEXT_PUBLIC_CANDY_GUARD` mal configurée

**Solution**:
1. Vérifiez la valeur sur Vercel
2. Valeur attendue: `3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9`
3. Redéployez après correction

### RPC rate limit dépassé

**Cause**: Trop de requêtes vers le RPC endpoint

**Solution**:
1. Passez à un plan payant Helius
2. Ou utilisez un autre provider (QuickNode, Alchemy)
3. Implémentez du caching côté frontend

---

## 📈 OPTIMISATIONS

### Performance

1. **Caching**
   - Cachez les résultats de vérification tier
   - Utilisez SWR ou React Query pour les requêtes

2. **Images**
   - Optimisez les images NFT
   - Utilisez Next.js Image component
   - Configurez un CDN

3. **Bundle size**
   - Analysez le bundle: `npm run build`
   - Supprimez les dépendances inutilisées
   - Code splitting si nécessaire

### UX

1. **Loading states**
   - Ajoutez des spinners pendant les transactions
   - Affichez des messages de progression

2. **Error handling**
   - Messages d'erreur clairs et en français
   - Suggestions de résolution

3. **Mobile**
   - Testez sur mobile (iOS et Android)
   - Vérifiez les deep links wallet

---

## 🎯 CHECKLIST DÉPLOIEMENT

### Avant déploiement
- [ ] Build local réussi
- [ ] Tests locaux concluants
- [ ] Au moins 1 NFT minté en local
- [ ] Configuration vérifiée
- [ ] Code committé et pushé

### Configuration Vercel
- [ ] Toutes les variables d'environnement configurées
- [ ] Variables vérifiées (pas de typos)
- [ ] Build Vercel réussi

### Tests production
- [ ] Page se charge correctement
- [ ] Wallet se connecte
- [ ] Tier se calcule correctement
- [ ] Mint fonctionne
- [ ] NFT visible sur Explorer
- [ ] NFT visible dans wallet

### Monitoring
- [ ] Analytics configuré
- [ ] Logs vérifiés
- [ ] Alertes configurées (optionnel)

---

## 🎉 LANCEMENT

Une fois tous les tests passés:

1. **Annoncez le lancement** sur vos canaux (Twitter, Discord, etc.)
2. **Surveillez les premiers mints** de près
3. **Répondez rapidement** aux questions/problèmes
4. **Collectez les retours** pour améliorer

---

## 📞 SUPPORT POST-LANCEMENT

### Canaux de support

- Discord: Pour la communauté
- Twitter: Pour les annonces
- Email: Pour le support direct

### FAQ à préparer

1. **Comment minter un NFT ?**
2. **Pourquoi je ne peux pas minter ?** (TOO_POOR)
3. **Combien ça coûte ?** (Gratuit + frais réseau)
4. **Quel wallet utiliser ?** (Phantom, Solflare, etc.)
5. **Comment voir mon NFT ?** (Dans le wallet ou Explorer)

---

## 🔄 MISES À JOUR FUTURES

### Améliorations possibles

1. **Rarity system**: Ajouter des traits rares
2. **Staking**: Permettre le staking des NFTs
3. **Marketplace**: Intégrer un marketplace
4. **Gamification**: Ajouter des quêtes, récompenses
5. **DAO**: Gouvernance communautaire

---

**Tout est prêt pour le lancement ! 🚀🐷**

Bonne chance avec Oinkonomics ! 🎉
