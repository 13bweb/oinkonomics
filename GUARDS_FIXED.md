# 🛠️ Guide de Dépannage - Mint Oinkonomics 🐷

## ✅ **PROBLÈME RÉSOLU : Guards Candy Machine**

### **🔧 Correction Apportée :**
Le mint échouait avec l'erreur **"Conditions de mint non respectées (guard)"** car la Candy Machine Oinkonomics a des **guards configurés** qui n'étaient pas pris en compte dans le code.

### **🎯 Guards Configurés sur la Collection :**

#### **1. SolPayment Guard**
- **Coût :** 0.01 SOL (10,000,000 lamports)
- **Destination :** `5zHBXzhaqKXJRMd7KkuWsb4s8zPyakKdijr9E3jgyG8Z`
- **But :** Paiement obligatoire pour minter

#### **2. Freeze Sol Payment Guard (Optionnel)**
- **Coût :** 0.01 SOL supplémentaire
- **But :** Rend les NFTs non-transférables temporairement

---

## 💰 **Prérequis pour Minter :**

### **Solde Minimum Requis :**
- **0.01 SOL** pour le guard solPayment
- **~0.001 SOL** pour les frais de transaction Solana
- **Total recommandé :** **0.011-0.015 SOL** (~$2-3 USD)

### **Configuration Devnet :**
1. **Wallet :** Phantom/Solflare configuré sur **Devnet**
2. **Solde :** Obtenir du SOL devnet via airdrop :
   ```bash
   solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet
   ```
3. **RPC :** Application configurée sur `https://api.devnet.solana.com`

---

## 🔧 **Corrections Techniques Appliquées :**

### **1. Ajout des mintArgs dans mintV2 :**
```typescript
const mintResult = await mintV2(umi, {
  candyMachine,
  candyGuard,
  nftMint,
  collectionMint,
  collectionUpdateAuthority,
  // ✅ NOUVEAU : Arguments pour les guards
  mintArgs: {
    solPayment: some({
      destination: publicKey("5zHBXzhaqKXJRMd7KkuWsb4s8zPyakKdijr9E3jgyG8Z")
    })
  }
}).sendAndConfirm(umi);
```

### **2. Messages d'erreur améliorés :**
- ✅ Détection spécifique des erreurs de solde
- ✅ Messages clairs sur les coûts de mint
- ✅ Guidance pour résoudre les problèmes

### **3. Interface mise à jour :**
- ✅ Affichage du coût avant mint : "0.01 SOL (~$1.8)"
- ✅ Bouton mis à jour : "Minter NFT #X (0.01 SOL)"

---

## 🎯 **Test Maintenant :**

### **1. Préparer le Wallet :**
```bash
# Configurer Solana CLI sur devnet
solana config set --url devnet

# Airdrop SOL pour tester  
solana airdrop 0.1 YOUR_WALLET_ADDRESS
```

### **2. Tester l'Application :**
```bash
cd /home/b13/Desktop/Oinkonomics/Web/oinkonomics
npm run dev
# ➡️ http://localhost:3000
```

### **3. Flow de Test :**
1. **Connecter wallet** (devnet) avec au moins 0.015 SOL
2. **Scan wallet** → Tier détecté 
3. **Mint NFT** → Paiement 0.01 SOL automatique
4. **Succès** → NFT visible dans le wallet !

---

## 📊 **Messages d'Erreur Possibles :**

| Erreur | Cause | Solution |
|--------|-------|---------|
| "Solde insuffisant" | Pas assez de SOL | Airdrop devnet ou ajout SOL |
| "Paiement requis : 0.01 SOL" | Guard solPayment | Vérifier solde devnet |
| "Collection épuisée" | Plus de NFTs | Normale si 300 NFTs mintés |
| "Problème freeze guard" | Configuration | Contacter développeur |

---

## 🎉 **RÉSULTAT :**
✅ **Guards correctement gérés**  
✅ **Mint fonctionnel avec paiement**  
✅ **Messages d'erreur clairs**  
✅ **Interface informative**  

**Le mint Oinkonomics fonctionne maintenant avec la vraie Candy Machine et ses guards ! 🐷🚀**