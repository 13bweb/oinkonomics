# 🔧 DÉPANNAGE - "Failed to verify tier"

## ❌ ERREUR RENCONTRÉE

**Message**: "Failed to verify tier"

Cette erreur se produit quand l'API `/api/verify-tier` ne peut pas vérifier votre wallet.

---

## 🔍 CAUSES POSSIBLES

### 1. **Problème de Connexion RPC**
L'API ne peut pas se connecter au RPC Solana pour récupérer votre solde.

### 2. **Wallet Non Connecté**
Le wallet n'est pas correctement connecté ou l'adresse n'est pas valide.

### 3. **Erreur API CoinGecko/DeFiLlama**
Les APIs externes pour récupérer les prix sont indisponibles.

### 4. **Timeout**
La requête prend trop de temps et expire.

---

## ✅ SOLUTIONS

### **Solution 1: Vérifier la Console**

1. **Ouvrez la console** (F12)
2. **Regardez les erreurs** en rouge
3. **Cherchez**:
   ```
   ❌ Erreur API verify-tier: ...
   ```

**Partagez-moi l'erreur exacte** pour que je puisse vous aider !

---

### **Solution 2: Vérifier le Serveur**

Le serveur tourne sur **http://localhost:3001** (pas 3000).

1. **Ouvrez** `http://localhost:3001` dans votre navigateur
2. **Rafraîchissez** la page (F5)
3. **Reconnectez** votre wallet
4. **Réessayez** "Vérifier mes Oinks"

---

### **Solution 3: Vérifier les Logs Serveur**

Dans le terminal où tourne `npm run dev`, vous devriez voir:

**Logs normaux**:
```
💰 Valeur totale du wallet: {
  solBalance: "X.XXXX",
  solValueUSD: "XX.XX",
  tokensValueUSD: "XX.XX",
  totalUSD: "XXX.XX"
}
🎯 Tier calculé: { tier: "POOR", ... }
```

**Logs d'erreur** (si problème):
```
❌ Erreur API verify-tier: ...
```

**Partagez-moi les logs** pour diagnostic !

---

### **Solution 4: Test Manuel de l'API**

Testons l'API directement pour voir si elle fonctionne.

1. **Ouvrez un nouvel onglet**
2. **Collez cette URL** (remplacez `VOTRE_ADRESSE` par votre adresse wallet):
   ```
   http://localhost:3001/api/verify-tier
   ```

3. **Ouvrez la console** (F12) > onglet "Network"
4. **Dans la console**, exécutez:
   ```javascript
   fetch('http://localhost:3001/api/verify-tier', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       walletAddress: 'VOTRE_ADRESSE_WALLET_ICI' 
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

**Résultat attendu**:
```json
{
  "tier": "POOR",
  "balance": 0.1234,
  "balanceUSD": 25.67,
  "nftNumber": 456,
  ...
}
```

**Si erreur**:
```json
{
  "error": "Message d'erreur"
}
```

---

### **Solution 5: Vérifier le RPC**

Le RPC Helius peut avoir des problèmes. Testons-le:

```javascript
// Dans la console du navigateur
fetch('https://mainnet.helius-rpc.com/?api-key=76bb04a0-52d9-4e33-a5d0-d716f97434ec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getHealth'
  })
})
.then(r => r.json())
.then(console.log)
```

**Résultat attendu**:
```json
{
  "jsonrpc": "2.0",
  "result": "ok",
  "id": 1
}
```

---

### **Solution 6: Vérifier CoinGecko**

L'API CoinGecko peut être limitée. Testons:

```javascript
fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
  .then(r => r.json())
  .then(console.log)
```

**Résultat attendu**:
```json
{
  "solana": {
    "usd": 200
  }
}
```

**Si erreur 429**: Rate limit dépassé (trop de requêtes)

---

### **Solution 7: Mode Dégradé**

Si les APIs externes ne fonctionnent pas, on peut utiliser un prix fixe pour SOL.

**Modifiez temporairement** `lib/utils.ts`:

```typescript
export async function fetchSOLPriceUSD(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    if (!res.ok) {
      console.warn('CoinGecko indisponible, utilisation prix fixe');
      return 200; // Prix fixe de $200
    }
    const j = await res.json();
    return j?.solana?.usd ?? 200;
  } catch (error) {
    console.warn('Erreur CoinGecko, utilisation prix fixe:', error);
    return 200; // Prix fixe de $200
  }
}
```

---

## 🧪 CHECKLIST DE DÉPANNAGE

- [ ] Console ouverte (F12)
- [ ] Erreur exacte copiée
- [ ] URL correcte (localhost:3001)
- [ ] Wallet connecté
- [ ] Logs serveur vérifiés
- [ ] Test API manuel effectué
- [ ] Test RPC effectué
- [ ] Test CoinGecko effectué

---

## 📞 AIDE RAPIDE

**Partagez-moi**:

1. **L'erreur exacte** dans la console (copier-coller)
2. **Les logs du serveur** (dans le terminal)
3. **Résultat du test API manuel**

Je pourrai alors vous aider précisément ! 😊

---

## 🎯 ACTIONS IMMÉDIATES

### **Étape 1**: Ouvrir la console
```
F12 > onglet Console
```

### **Étape 2**: Copier l'erreur
```
Cherchez les lignes rouges avec "Error" ou "Failed"
```

### **Étape 3**: Partager
```
Copiez-collez l'erreur complète
```

---

**Je suis là pour vous aider ! Partagez-moi les détails de l'erreur ! 🚀**
