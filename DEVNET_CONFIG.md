# 🛠️ Configuration DEVNET - Oinkonomics 🐷

## ✅ **Application Configurée pour DEVNET**

L'application Oinkonomics est maintenant **complètement configurée** pour fonctionner sur le **devnet de Solana**.

### 🔧 **Modifications Effectuées :**

#### **1. Wallet Adapter (layout.tsx)**
```typescript
// Changé de Mainnet vers Devnet
const network = WalletAdapterNetwork.Devnet;
const endpoint = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network);
```

#### **2. Variables d'Environnement (.env.local)**
```bash
# Frontend & Backend - DEVNET
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
RPC_URL=https://api.devnet.solana.com

# Collection NFT sur devnet
NEXT_PUBLIC_COLLECTION_TOKEN=9JCdYQL53tH97ef7zZBTYWYtLAcWSQVMocs2AjqjD6a4
```

#### **3. Utilitaires (lib/utils.ts)**
```typescript
// Endpoints mis à jour pour devnet
const connection = new Connection('https://api.devnet.solana.com');
const umi = createUmi('https://api.devnet.solana.com');
```

#### **4. Interface Utilisateur**
- ✅ **Badge DEVNET** affiché sur le titre principal
- ✅ **Collection Token** visible dans l'interface
- ✅ **Tiers mis à jour** avec numéros NFT et TOO_POOR
- ✅ **Couleurs distinctes** par tier

### 🎯 **Collection NFT Devnet :**
- **Token :** `9JCdYQL53tH97ef7zZBTYWYtLAcWSQVMocs2AjqjD6a4`
- **Network :** Solana Devnet
- **Total NFTs :** 300 numérotés (1-300)

### 📊 **Système de Tiers Devnet :**
- 🔴 **TOO_POOR** : < $10 (Aucun NFT)
- 🟡 **POOR** : $10-$1,000 (NFT #1-100)
- 🔵 **MID** : $1,000-$10,000 (NFT #100-200)  
- 🟣 **RICH** : $10,000+ (NFT #200-300)

## 🌐 **Application Disponible :**

**URL :** http://localhost:3002

### 🔍 **Fonctionnalités Testables sur Devnet :**
1. **Connexion Wallet** (Phantom, Solflare, etc. en mode devnet)
2. **Vérification de Tier** basée sur le solde devnet
3. **Génération de numéros NFT** selon le tier
4. **Mint simulation** (candy machines à configurer)

## ⚠️ **Important pour les Tests :**

### **Wallets Devnet :**
- Assurez-vous que vos wallets sont sur **devnet**
- Utilisez des **SOL devnet** (gratuits via faucet)
- Les soldes devnet déterminent votre tier

### **Faucet Devnet :**
- https://faucet.solana.com/
- Obtenez des SOL gratuits pour tester

### **Candy Machines :**
Les IDs actuels sont des placeholders :
```
# ✅ NOUVELLE CONFIG - Collection Réelle Hashlips Intégrée !
CANDY_MACHINE_ID=8HTSVL3fNTg8CugR8veRGVEyLhz5CBbkW2T4m54zdTAn
# Plus de tiers séparés, une seule Candy Machine intelligente !
# NFT #0-99 = POOR, #100-199 = MID, #200-299 = RICH
```

## 🎨 **Interface Devnet :**
- Badge orange **"DEVNET"** en haut à droite du titre
- Collection token affiché dans un encadré orange
- Tiers colorés avec numéros NFT visibles
- Messages indiquant les plages NFT par tier

**L'application est maintenant 100% configurée pour le devnet Solana ! 🚀**

Tous les appels RPC, connexions wallet et fonctionnalités utilisent les endpoints devnet.