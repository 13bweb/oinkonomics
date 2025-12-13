# 🐷 OINKONOMICS - NFT Collection

Collection de 3000 NFTs sur Solana Mainnet avec **mint gratuit** et sans restrictions.

![Oinkonomics](https://oinkonomics.vercel.app/icon.png)

---

## 🎯 Caractéristiques

- **🆓 Mint Gratuit**: 0 SOL (seulement ~0.001 SOL de frais réseau)
- **🔓 Sans Restrictions**: Mint illimité, pas de whitelist
- **🔄 Transférable**: Pas de freeze/soulbound
- **🎨 NFT Standard**: NFTs Metaplex standard
- **⚡ Sequential**: Mint dans l'ordre (1, 2, 3...)
- **🎲 Tiers**: 3 tiers basés sur la valeur du wallet

---

## 📊 Tiers NFT

### 🟡 POOR ($10 - $1,000)
- NFT #1 - #1000
- Wallet entre $10 et $1,000 USD

### 🔵 MID ($1,000 - $10,000)
- NFT #1001 - #2000
- Wallet entre $1,000 et $10,000 USD

### 🟣 RICH (> $10,000)
- NFT #2001 - #3000
- Wallet supérieur à $10,000 USD

### ❌ TOO POOR (< $10)
- Pas de mint possible
- Wallet inférieur à $10 USD

---

## 🚀 Démarrage Rapide

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/oinkonomics.git
cd oinkonomics

# Installer les dépendances
npm install

# Vérifier la configuration
./verify-config.sh

# Démarrer le serveur de développement
npm run dev
```

### Configuration

Le fichier `.env.local` est déjà configuré avec toutes les variables nécessaires.

Pour vérifier la configuration:
```bash
./verify-config.sh
```

---

## 📦 Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana (Mainnet)
- **NFT Standard**: Metaplex NFT Standard
- **Wallet**: Unified Wallet Kit (Jupiter)
- **RPC**: Helius

---

## 🔑 Adresses Blockchain

### Candy Machine
```
V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
```

### Candy Guard
```
3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
```

### Collection
```
EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
```

---

## 🧪 Tests

### Vérifier la configuration
```bash
./verify-config.sh
```

### Lancer les tests
```bash
npm run dev
```

Puis ouvrez `http://localhost:3000` et suivez le [Guide de Test](./GUIDE_TEST.md).

---

## 📚 Documentation

- **[Audit Suppression pNFT](./AUDIT_SUPPRESSION_PNFT.md)**: Détails de la migration vers NFTs standards
- **[Configuration Complète](./MINT_GRATUIT_CONFIG.md)**: Toutes les adresses et paramètres
- **[Guide de Test](./GUIDE_TEST.md)**: Instructions détaillées pour tester le mint

---

## 🔗 Liens Utiles

- **Solana Explorer**: https://explorer.solana.com/?cluster=mainnet
- **Candy Machine**: https://explorer.solana.com/address/V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV?cluster=mainnet
- **Collection**: https://explorer.solana.com/address/EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y?cluster=mainnet

---

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de dev

# Production
npm run build        # Build pour production
npm run start        # Démarrer en production

# Utilitaires
npm run lint         # Linter le code
./verify-config.sh   # Vérifier la configuration
```

---

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Wallet Solana (Phantom, Solflare, etc.)
- Minimum 0.002 SOL pour les frais de transaction

---

## 🐛 Dépannage

### Erreur: "Solde insuffisant"
Ajoutez au moins 0.002 SOL à votre wallet pour les frais réseau.

### Erreur: "Configuration Candy Guard incorrecte"
Vérifiez que `NEXT_PUBLIC_CANDY_GUARD` est bien configuré dans `.env.local`.

### Le wallet ne se connecte pas
1. Rafraîchissez la page
2. Assurez-vous d'être sur Mainnet
3. Essayez un autre navigateur

Pour plus de détails, consultez le [Guide de Test](./GUIDE_TEST.md).

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

## 📄 Licence

MIT License - voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 🎉 Statut

- ✅ Configuration complète
- ✅ Build réussi
- ✅ Migration vers NFTs standards
- ✅ Tests locaux OK
- ⏳ Déploiement production (à venir)

---

## 📞 Support

- **Discord**: [Lien Discord]
- **Twitter**: [@Oinkonomics]
- **Email**: support@oinkonomics.io

---

## 🔄 Changelog

### v2.0.0 - 2025-12-12
- ✅ Migration complète vers NFTs standards
- ❌ Suppression de la logique pNFT
- ✅ Simplification du code de mint
- ✅ Réduction de la complexité

### v1.0.0 - 2025-12-11
- ✅ Version initiale avec pNFTs

---

**Fait avec ❤️ pour la communauté Solana** 🐷🚀
