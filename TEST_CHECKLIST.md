# ✅ Checklist de Test - Oinkonomics

## 🚀 Serveur de Développement

Le serveur devrait être accessible sur : **<http://localhost:3000>**

---

## 📋 Tests à Effectuer

### 1. Tests de Base

- [ ] **Page d'accueil se charge**
  - Ouvrir <http://localhost:3000>
  - Vérifier que la page se charge sans erreur
  - Vérifier que le logo et le titre s'affichent

- [ ] **Console navigateur sans erreurs**
  - Ouvrir la console (F12)
  - Vérifier qu'il n'y a pas d'erreurs critiques
  - Vérifier les logs de démarrage

### 2. Tests de Connexion Wallet (Desktop)

- [ ] **Bouton de connexion visible**
  - Vérifier que le bouton "Connect Wallet" est visible
  - Vérifier le style et la position

- [ ] **Connexion Phantom**
  - Cliquer sur "Connect Wallet"
  - Sélectionner Phantom
  - Vérifier que la connexion réussit
  - Vérifier le toast de succès

- [ ] **Connexion Solflare**
  - Déconnecter le wallet
  - Reconnecter avec Solflare
  - Vérifier que la connexion réussit

### 3. Tests de Scan de Wallet

- [ ] **Scan avec wallet connecté**
  - Connecter un wallet
  - Cliquer sur "Scan my wallet"
  - Vérifier que le scan fonctionne
  - Vérifier que le tier s'affiche correctement

- [ ] **Scan sans wallet connecté**
  - Déconnecter le wallet
  - Cliquer sur "Scan my wallet"
  - Vérifier le message d'erreur approprié

- [ ] **Validation des adresses**
  - Tester avec une adresse invalide (via l'API directement)
  - Vérifier que l'erreur est gérée correctement

### 4. Tests de Calcul de Tier

- [ ] **Tier TOO_POOR**
  - Utiliser un wallet avec < $10
  - Vérifier que le tier est "TOO_POOR"
  - Vérifier que le mint est désactivé

- [ ] **Tier POOR**
  - Utiliser un wallet avec $10-$1000
  - Vérifier que le tier est "POOR"
  - Vérifier que le numéro NFT est dans la plage #1-1000

- [ ] **Tier MID**
  - Utiliser un wallet avec $1000-$10000
  - Vérifier que le tier est "MID"
  - Vérifier que le numéro NFT est dans la plage #1001-2000

- [ ] **Tier RICH**
  - Utiliser un wallet avec > $10000
  - Vérifier que le tier est "RICH"
  - Vérifier que le numéro NFT est dans la plage #2001-3000

### 5. Tests de Mint

- [ ] **Mint avec solde suffisant**
  - Utiliser un wallet avec > 0.023 SOL
  - Scanner le wallet
  - Cliquer sur "Mint NFT"
  - Vérifier que le mint fonctionne
  - Vérifier le message de succès

- [ ] **Mint avec solde insuffisant**
  - Utiliser un wallet avec < 0.023 SOL
  - Tenter le mint
  - Vérifier le message d'erreur approprié

- [ ] **Mint pour TOO_POOR**
  - Utiliser un wallet TOO_POOR
  - Vérifier que le bouton de mint est désactivé
  - Vérifier le message approprié

### 6. Tests de Gestion d'Erreurs

- [ ] **Erreur Candy Guard**
  - Si erreur "AccountOwnedByWrongProgram"
  - Vérifier que le message est clair et informatif

- [ ] **Erreur solde insuffisant**
  - Vérifier que le message indique le montant requis (0.023 SOL)

- [ ] **Erreur collection épuisée**
  - Si applicable, vérifier le message approprié

- [ ] **Messages d'erreur API**
  - Vérifier que les messages ne révèlent pas de détails sensibles
  - Vérifier que les logs serveur contiennent les détails complets

### 7. Tests Mobile (si possible)

- [ ] **Détection mobile**
  - Ouvrir sur un appareil mobile
  - Vérifier que la détection fonctionne
  - Vérifier les messages d'aide

- [ ] **Connexion wallet mobile**
  - Tester la connexion sur mobile
  - Vérifier les deep links (si configurés)
  - Vérifier les messages d'aide contextuels

### 8. Tests de Sécurité

- [ ] **Pas de logs de variables d'environnement**
  - Vérifier la console
  - Vérifier qu'aucune variable sensible n'est loggée

- [ ] **Validation des entrées API**
  - Tester avec des adresses invalides
  - Vérifier que la validation fonctionne

- [ ] **Messages d'erreur sécurisés**
  - Vérifier que les messages ne révèlent pas de détails internes

### 9. Tests de Performance

- [ ] **Temps de chargement**
  - Vérifier que la page se charge rapidement
  - Vérifier que les images se chargent correctement

- [ ] **Réactivité**
  - Vérifier que les interactions sont fluides
  - Vérifier que les toasts s'affichent correctement

---

## 🐛 Problèmes Connus à Vérifier

1. **Candy Guard Configuration**
   - Si erreur "AccountOwnedByWrongProgram", vérifier la configuration
   - Le code utilise maintenant `mint()` sans guard, ce qui devrait fonctionner

2. **Prix du Mint**
   - Vérifier que le prix affiché est 0.022 SOL
   - Vérifier que le message d'erreur indique 0.023 SOL (avec frais)

3. **Connexion Mobile**
   - Si problème de connexion, vérifier NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
   - Vérifier que les deep links sont configurés

---

## 📝 Notes de Test

**Date du test :** _______________

**Environnement :** ☐ Devnet  ☐ Mainnet

**Wallet utilisé :** _______________

**Résultats :**

- Tests réussis : ___/___
- Problèmes rencontrés : _______________
- Commentaires : _______________

---

## ✅ Résultat Final

- [ ] Tous les tests passent
- [ ] Aucun problème critique
- [ ] Prêt pour la production
