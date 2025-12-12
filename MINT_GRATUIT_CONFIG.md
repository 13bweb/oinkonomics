# 🎉 OINKONOMICS - CONFIGURATION MINT GRATUIT COMPLÈTE

## ✅ STATUT: PRÊT POUR LE MINT

Date de configuration: 2025-12-11
Type: Mint Gratuit Sans Restrictions (pNFT)
Réseau: Solana Mainnet

---

## 📋 RÉSUMÉ CONFIGURATION

### Collection NFT
- **Nom**: Oinkonomics
- **Symbol**: OINK
- **Total NFTs**: 3000
- **Mintés**: 3 / 3000
- **Restants**: 2997
- **Type**: pNFT (Programmable NFT)
- **Prix**: **GRATUIT** (0 SOL - seulement frais réseau ~0.001 SOL)

### Restrictions
- ✅ **Mint illimité** (pas de limite par wallet)
- ✅ **Pas de soulbound** (transférable immédiatement)
- ✅ **Pas de paiement requis**
- ✅ **Accessible à tous**

---

## 🔑 ADRESSES BLOCKCHAIN

### Candy Machine
```
V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
```
- Authority: `FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf`
- Token Standard: pNFT (Programmable NFT)
- Sequential: true (mint dans l'ordre 1, 2, 3...)

### Candy Guard (NOUVEAU - Sans Restrictions)
```
3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
```
- Créé le: 2025-12-11
- Guards: **AUCUN** (mint gratuit et illimité)
- Base: `6HZvRCQZHQfModLRM6kiNt4tgVn4N1ZiJDg5e5VYP13m`

### Collection
```
EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
```
- Update Authority: `FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf`
- Symbol: OINK
- Name Prefix: Oinkonomics #

### Rule Set (pNFT - OBLIGATOIRE)
```
eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9
```

### Wallet Authority
```
FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf
```
- Balance: ~0.109 SOL
- Rôle: Authority du Candy Machine et Candy Guard

---

## 🌐 CONFIGURATION RÉSEAU

### RPC Endpoint (Helius)
```
https://mainnet.helius-rpc.com/?api-key=76bb04a0-52d9-4e33-a5d0-d716f97434ec
```

### Network
```
mainnet-beta
```

---

## 💻 INTÉGRATION FRONTEND

### ✅ Fichiers Modifiés

1. **`.env.local`** - Configuration complète des variables d'environnement
2. **`lib/utils.ts`** - Fonction `mintNFT` mise à jour pour mintV2 avec pNFT
3. **`components/VerifyMint.tsx`** - Interface utilisateur mise à jour pour mint gratuit

### 📦 Dépendances Installées

```json
{
  "@metaplex-foundation/mpl-candy-machine": "^6.1.0",
  "@metaplex-foundation/mpl-token-metadata": "^3.4.0",
  "@metaplex-foundation/mpl-toolbox": "^0.9.0",
  "@metaplex-foundation/umi": "^0.9.0",
  "@metaplex-foundation/umi-bundle-defaults": "^0.9.0",
  "@metaplex-foundation/umi-signer-wallet-adapters": "^0.9.0"
}
```

### 🔧 Points Techniques Importants

#### 1. Utilisation de `mintV2` (pas `mint`)
```typescript
import { mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { findTokenRecordPda } from '@metaplex-foundation/mpl-token-metadata';
```

#### 2. Token Record PDA (OBLIGATOIRE pour pNFT)
Les pNFTs nécessitent un **Token Record** en plus du Token Account standard. Ce Token Record doit être calculé et passé à `mintV2`:

```typescript
// Calculer le Token Record PDA
const tokenRecord = findTokenRecordPda(umi, {
  mint: nftMint.publicKey,
  token: publicKey(umi.identity.publicKey)
});
```

#### 3. Configuration pNFT
Le `tokenStandard` (pNFT) et le `ruleSet` sont **configurés dans la Candy Machine elle-même**. Seul le `tokenRecord` doit être passé explicitement à `mintV2`.

#### 4. Structure de l'appel mintV2
```typescript
const tx = await transactionBuilder()
  .add(setComputeUnitLimit(umi, { units: 400000 }))
  .add(
    mintV2(umi, {
      candyMachine,
      candyGuard,
      nftMint,
      collectionMint,
      collectionUpdateAuthority,
      tokenRecord, // ✅ IMPORTANT: Token Record PDA pour pNFT
      mintArgs: {} // Vide car pas de guards actifs
    })
  )
  .sendAndConfirm(umi);
```

#### 5. Pas de MintArgs
Comme il n'y a **aucun guard actif**, les `mintArgs` doivent être vides:
```typescript
mintArgs: {}
```

---

## 🔗 LIENS SOLANA EXPLORER

- **Candy Machine**: https://explorer.solana.com/address/V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV?cluster=mainnet
- **Candy Guard**: https://explorer.solana.com/address/3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9?cluster=mainnet
- **Collection**: https://explorer.solana.com/address/EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y?cluster=mainnet
- **Rule Set**: https://explorer.solana.com/address/eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9?cluster=mainnet

---

## 📜 HISTORIQUE TRANSACTIONS

### Suppression Ancien Candy Guard (avec paiement)
```
KoHr9L8YuGWKqmUHMvo8KCy5iqSa9Pz3WoQvPohoJcTc4ftQ4LKmmbV3SAKGTQ5eQFGeX9bzabRMpVNpTf8Yhng
```

### Création Nouveau Candy Guard (sans restrictions)
```
4e8jXKvdt5Gri4BFVDUq4yyenfEx2R95uF8J7ZPGzzbgFDhHkT6yzAWqpNocFiaCQ4LrNRNH2UVaAHib2MDj5kSS
```

### Wrapping Candy Guard
```
3cXmQFGT6UcKVtr3KzSLDVFWJRrEZvdfuX3f5tdLUNuvUehKHHemJfUG95aSNJZf3qB3GnHDR3PRxbbA5qJrHMmA
```

### Test Mint
```
NFT Address: 7SjFBu68ET9JoeNDnkFuZZb2obXwL5c3VPPaXH2v67u
```

---

## 🧪 TESTS

### Via Sugar CLI

#### Mint un NFT
```bash
sugar mint --candy-guard 3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
```

#### Vérifier la configuration du Guard
```bash
sugar guard show --candy-guard 3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
```

#### Vérifier la Candy Machine
```bash
sugar show V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
```

### Via Frontend

1. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

2. **Ouvrir** `http://localhost:3000`

3. **Connecter un wallet** (Phantom, Solflare, etc.)

4. **Cliquer sur** "Vérifier mes Oinks"

5. **Cliquer sur** "Minter NFT GRATUITEMENT"

---

## ✅ CHECKLIST FINALE

- ✅ Dépendances Metaplex installées
- ✅ Fichier `.env.local` créé avec toutes les variables
- ✅ Variable `NEXT_PUBLIC_CANDY_GUARD` configurée
- ✅ Variable `NEXT_PUBLIC_RULE_SET` configurée
- ✅ Code `mintNFT` mis à jour pour `mintV2`
- ✅ Support pNFT intégré
- ✅ Interface utilisateur mise à jour (mint gratuit)
- ✅ Build réussi sans erreurs
- ⏳ Test de mint en production (à faire)

---

## 🚀 DÉPLOIEMENT

### Variables d'environnement requises sur Vercel/Production

Assurez-vous que toutes ces variables sont configurées:

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=76bb04a0-52d9-4e33-a5d0-d716f97434ec
NEXT_PUBLIC_CANDY_MACHINE_ID=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_GUARD=3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
NEXT_PUBLIC_COLLECTION_MINT=EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf
NEXT_PUBLIC_RULE_SET=eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9
NEXT_PUBLIC_MINT_PRICE=0
NEXT_PUBLIC_COMPUTE_UNIT_LIMIT=400000
```

---

## ⚠️ POINTS D'ATTENTION

### 1. Token Standard = pNFT
Le Candy Machine est configuré pour créer des **Programmable NFTs (pNFT)**, pas des NFTs standards.

### 2. Rule Set Obligatoire
Le Rule Set `eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9` est **obligatoire** pour les pNFTs.

### 3. Mint Gratuit
- Prix: **0 SOL**
- Frais réseau: ~**0.001 SOL** (frais de transaction Solana)
- Pas de destination wallet pour paiement

### 4. Pas de Restrictions
- ✅ Mint illimité par wallet
- ✅ Pas de freeze/soulbound
- ✅ Transférable immédiatement
- ✅ Accessible à tous (pas de whitelist)

---

## 📞 SUPPORT

En cas de problème:

1. Vérifier les logs de la console navigateur
2. Vérifier que le wallet a au moins 0.001 SOL pour les frais
3. Vérifier la configuration du Candy Guard sur Solana Explorer
4. Tester avec Sugar CLI pour isoler le problème

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Configuration terminée
2. ⏳ Test de mint en local (`npm run dev`)
3. ⏳ Test de mint sur production
4. ⏳ Monitoring des premiers mints
5. ⏳ Ajustements si nécessaire

---

**Tout est prêt pour un mint gratuit et sans restrictions ! 🚀🐷**
