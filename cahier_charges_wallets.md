
# Cahier des charges – Intégration de **Unified Wallet Kit** (Jupiter) dans l’application mobile

Contexte : Application mobile Solana (dApp) en cours de développement, nécessitant une expérience de connexion portefeuille de niveau *RainbowKit*, optimisée pour **mobile**.

---

## 1. Objectif général

Mettre en place, dans l’application mobile, une **intégration complète et unique** de gestion des portefeuilles Solana basée sur **Unified Wallet Kit** (Jupiter), en remplacement total des solutions existantes, afin de :

- **Standardiser** la connexion aux portefeuilles Solana dans toute l’application.
- **Activer l’auto-connexion** (reconnexion automatique) dès que cela est possible.
- **Reconnaître automatiquement tous les portefeuilles Solana compatibles** (Phantom, Solflare, Backpack, xNFT, etc.) y compris sur mobile, via le **Solana Wallet Standard** et l’architecture **Mobile Wallet Adapter (MWA)**. :contentReference[oaicite:0]{index=0}
- Offrir une **UX moderne et cohérente**, proche de RainbowKit côté Ethereum.

---

## 2. Périmètre

Ce cahier des charges couvre :

1. **Remplacement intégral** de la couche “wallet” existante par Unified Wallet Kit :
   - Suppression des intégrations directes `@solana/wallet-adapter-*` si présentes.
   - Suppression de toute logique Custom Phantom / Solflare / Backpack hardcodée.
2. **Implémentation d’un provider unique** autour de l’application :
   - `UnifiedWalletProvider` comme *root provider* de l’arborescence React / React Native.
3. **Intégration UI côté mobile** :
   - Utilisation de composants fournis (type `UnifiedWalletButton`) pour la connexion.
   - Adaptation du design aux guidelines de l’app tout en gardant la logique du kit.
4. **Gestion des scénarios d’usage mobile** :
   - Deep links / dApp browsers.
   - Compatibilité MWA (Solana Mobile Stack) quand applicable. :contentReference[oaicite:1]{index=1}

---

## 3. Hypothèses techniques

> À adapter si nécessaire par le développeur, mais Copilot doit partir de ces hypothèses par défaut.

- **Stack UI** :  
  - Soit **React Native / Expo** (TypeScript),  
  - Soit application mobile hybride basée sur **React / Next.js** embarqué dans un WebView ou accessible via dApp browser mobile.
- **Langage** : TypeScript.
- **Écosystème** : Solana uniquement (pas de besoin cross-chain dans ce cahier des charges).
- **Architecture** : L’application possède un composant racine type `App` dans lequel on peut envelopper toute l’arborescence avec des providers.

---

## 4. Exigences fonctionnelles

### 4.1 Connexion / déconnexion

- L’utilisateur doit pouvoir :
  - **Connecter** un portefeuille Solana depuis n’importe quel écran via un bouton global (header, menu, etc.).
  - **Changer de portefeuille** (disconnect + reconnect sur un autre wallet).
  - **Se déconnecter** clairement, avec feedback visuel.

- Lors d’une connexion :
  - Le kit doit **lister automatiquement les portefeuilles installés** sur l’appareil (Phantom, Solflare, Backpack, etc.) dans une modale, sans qu’on ait à les gérer un par un. :contentReference[oaicite:2]{index=2}
  - Les wallets non installés doivent idéalement être affichés avec une option d’installation (si fournie par le kit).

### 4.2 Auto-connexion (autoConnect)

- Activer l’option d’**auto-connexion** (si supportée par Unified Wallet Kit) :
  - À l’ouverture de l’application, si un portefeuille a déjà été connecté dans une session précédente et que les permissions sont toujours valides :
    - tenter une **reconnexion silencieuse** ;
    - en cas d’échec (erreur réseau, permissions révoquées), revenir à un état “déconnecté” propre sans écran d’erreur bloquant.
- Comportement attendu :
  - Sur mobile, l’utilisateur ne doit pas être obligé de recliquer sur “Connect” à chaque relance de l’app si sa session est encore valide.

### 4.3 Reconnaissance de **tous les wallets Solana** (Wallet Standard)

- **Utiliser la détection automatique via Solana Wallet Standard** :  
  - Le kit doit être configuré pour **découvrir dynamiquement** les wallets compatibles, sans liste codée en dur. :contentReference[oaicite:3]{index=3}
  - Le tableau `wallets` passé au provider doit être **vide** ou minimal, de manière à laisser Unified Wallet Kit gérer la compatibilité (mode “Bring Your Own Wallet”).
- L’ajout d’un nouveau wallet Solana populaire ne doit pas nécessiter de refactor du code :
  - Il doit apparaître automatiquement dans la liste, pour autant qu’il respecte le Wallet Standard.

### 4.4 UX mobile spécifique

- Le composant de connexion (modale / drawer) doit :
  - Être **responsive mobile**, utilisable au doigt, avec des zones tactiles suffisantes.
  - Utiliser un layout basculant en **drawer** / pleine page sur petit écran si prévu par le kit.
  - Ne pas masquer définitivement le contenu en cas d’erreur de connexion (un simple message + possibilité de réessayer).

- Sur mobile :
  - Si l’application est ouverte dans le **dApp browser** d’un wallet (ex. Phantom in-app browser), la connexion doit passer par la logique la plus directe possible (pas de QR code inutile).
  - Si l’application est ouverte dans un navigateur classique ou une WebView, la connexion doit s’effectuer via deep link / MWA selon les capacités du kit.

### 4.5 Internationalisation (i18n)

- L’interface de connexion doit être **au minimum en anglais**, idéalement **en français** pour les libellés visibles. Unified Wallet Kit propose nativement un système de langues pré-configurées (dont le français). :contentReference[oaicite:4]{index=4}
- Exigences :
  - Paramétrer `lang` à `fr` par défaut.
  - Prévoir une bascule possible `fr` / `en` si l’app est multilingue.

### 4.6 Feedback & notifications

- Lors des actions importantes :
  - Connexion / déconnexion.
  - Reconnexion auto (succès ou échec).
- Le kit doit être configuré pour déclencher des **callbacks de notification** afin de :
  - journaliser les évènements (analytics interne),
  - ou déclencher des toasts / banners dans l’UI.

L’implémentation des toasts (ex. `react-native-toast-message`, `react-hot-toast`, etc.) est laissée au développeur, mais les **callbacks du kit doivent être câblés**.

---

## 5. Exigences techniques – Implémentation Unified Wallet Kit

### 5.1 Dépendances

**À installer :**

```bash
# Exemple pour un projet TypeScript React / React Native
npm install @jup-ag/wallet-adapter @solana/web3.js
# ou
yarn add @jup-ag/wallet-adapter @solana/web3.js
````

Si des dépendances Solana sont déjà présentes, les conserver uniquement si nécessaires pour la logique métier (transactions, comptes, programmes), pas pour la gestion UI des wallets.

**À désinstaller (si existant) :**

* `@solana/wallet-adapter-react`
* `@solana/wallet-adapter-react-ui`
* `@solana/wallet-adapter-wallets`
* Tout wrapper custom type `usePhantomWallet`, etc.

Objectif : **une seule source de vérité** : Unified Wallet Kit.

### 5.2 Provider racine

Créer un composant `WalletProvider` (ou `AppWalletProvider`) qui englobe l’application.

```tsx
// src/providers/AppWalletProvider.tsx
import React, { PropsWithChildren } from 'react';
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';

export function AppWalletProvider({ children }: PropsWithChildren) {
  return (
    <UnifiedWalletProvider
      // Laisser la découverte automatique des wallets via Wallet Standard
      wallets={[]} 
      config={{
        env: 'mainnet-beta',     // à surcharger via env pour devnet/testnet
        autoConnect: true,       // auto-connexion activée
        theme: 'dark',           // 'light' | 'dark' | 'jupiter' selon le design
        lang: 'fr',              // interface en français par défaut
        metadata: {
          name: 'NomDeVotreApp',
          description: 'Application mobile Solana avec connexion unifiée',
          url: 'https://votre-domaine.tld',
          iconUrls: ['https://votre-domaine.tld/icon.png'],
        },
        notificationCallback: {
          onConnect: (wallet) => {
            console.log('[Wallet] Connecté :', wallet?.adapter?.name);
            // TODO: déclencher un toast / analytics
          },
          onDisconnect: () => {
            console.log('[Wallet] Déconnecté');
            // TODO: déclencher un toast / analytics
          },
          onError: (error) => {
            console.error('[Wallet] Erreur de connexion', error);
            // TODO: notifier l’utilisateur si nécessaire
          },
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}
```

Intégration dans l’entrée principale :

```tsx
// App.tsx (React Native) ou _app.tsx (Next.js)
import React from 'react';
import { AppWalletProvider } from './src/providers/AppWalletProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppWalletProvider>
      <RootNavigator />
    </AppWalletProvider>
  );
}
```

### 5.3 Bouton de connexion unifié

Créer un composant de bouton global re-utilisable :

```tsx
// src/components/WalletConnectButton.tsx
import React from 'react';
import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';

export function WalletConnectButton() {
  return (
    <UnifiedWalletButton
      // On laisse Unified Wallet Kit gérer l’UI/UX du bouton
    />
  );
}
```

Intégration dans la navigation / header :

```tsx
// Exemple dans un header de navigation
import React from 'react';
import { View, Text } from 'react-native';
import { WalletConnectButton } from '../components/WalletConnectButton';

export function AppHeader() {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600' }}>NomDeVotreApp</Text>
      <WalletConnectButton />
    </View>
  );
}
```

### 5.4 Gestion mobile / MWA / deep links

Le développeur doit :

1. Vérifier si Unified Wallet Kit expose des options spécifiques pour **Mobile Wallet Adapter** ou pour la détection d’un **Solana Mobile Stack** (Saga / Seeker).
2. Si oui, les activer au niveau de la configuration, de façon à ce que :

   * Sur Android compatible SMS, la connexion se fasse via MWA.
   * Sur les autres devices, la connexion se fasse via deep link / dApp browser.

En parallèle, l’application doit :

* Déclarer les **schémas d’URL** (ex. `yourapp://`) nécessaires aux deep links.
* Gérer la redirection de retour après autorisation dans le wallet mobile.

*(Ce point dépend de la stack exacte : Expo `Linking`, React Navigation, ou natif iOS/Android.)*

### 5.5 Gestion des environnements

* Prévoir une configuration par environnement :

```ts
// src/config/solana.ts
export const SOLANA_ENV = {
  dev: {
    env: 'devnet',
    rpcEndpoint: 'https://api.devnet.solana.com',
  },
  prod: {
    env: 'mainnet-beta',
    rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  },
} as const;
```

* Le `env` passé à Unified Wallet Kit doit être variable selon `NODE_ENV` ou un flag `APP_ENV`.

### 5.6 Sécurité & persistance

* Utiliser les mécanismes de persistance **sécurisée** pour mémoriser la session du wallet :

  * Sur React Native : `SecureStore`, `Keychain`, ou solution équivalente.
* Ne pas stocker de seed / clé privée.
  Seule la **référence de connexion** (adresse publique, type de wallet, etc.) peut être persistée.

---

## 6. Plan de refactoring

1. **Cartographie de l’existant**

   * Lister tous les endroits où l’app utilise :

     * des hooks de connexion (`useWallet`, `useConnection`, etc.),
     * des boutons custom “Connect Phantom / Solflare”.
   * Lister les dépendances `@solana/wallet-adapter-*` et wrappers internes.

2. **Suppression / nettoyage**

   * Retirer les providers `ConnectionProvider`, `WalletProvider`, `WalletModalProvider` existants si utilisés.
   * Supprimer les composants `WalletMultiButton` et équivalents.
   * Supprimer les CSS / styles liés à l’ancienne modale.

3. **Insertion de Unified Wallet Kit**

   * Ajouter `AppWalletProvider` au plus haut niveau de l’app.
   * Injecter `WalletConnectButton` dans les headers / écrans qui en ont besoin.

4. **Adaptation de la logique métier**

   * Remplacer les anciens hooks par les hooks proposés par Unified Wallet Kit (ou continuer à utiliser `@solana/web3.js` pour les transactions avec le provider exposé par le kit).
   * Vérifier que la logique de signature / envoi de transactions fonctionne toujours sur devnet, puis mainnet.

5. **Tests et validation mobile**

   * Tests manuels sur :

     * iOS + Phantom.
     * Android + Phantom.
     * (Optionnel) Solflare / Backpack si disponibles.
   * Tests en dApp browser vs navigateur classique / WebView.

---

## 7. Critères d’acceptation

L’intégration sera considérée comme **réussie** si les points suivants sont vérifiés :

1. **Expérience utilisateur**

   * Depuis l’écran d’accueil, un tap sur le bouton “Connect Wallet” ouvre la modale Unified Wallet Kit avec la liste des wallets disponibles.
   * Si Phantom (ou autre wallet) est installé, il apparaît en tête de liste.
   * L’utilisateur peut se connecter, signer une transaction simple, puis se déconnecter sans erreur.

2. **Auto-connexion**

   * Après une première connexion réussie, si l’utilisateur ferme complètement et rouvre l’application :

     * la connexion est restaurée automatiquement (autoConnect),
     * ou, en cas d’échec, l’application reste stable et affiche l’état “déconnecté”.

3. **Couverture wallets**

   * Au moins les wallets suivants sont correctement détectés et utilisables :

     * Phantom mobile.
     * Solflare mobile.
     * Backpack mobile (si installé).
   * Aucun code spécifique à chacun d’eux n’est nécessaire dans l’app (tout passe par le kit).

4. **Mobile / MWA**

   * Sur un device compatible Solana Mobile (si disponible pour les tests), la connexion fonctionne via le flux natif prévu par le kit.
   * Sur d’autres devices, la connexion via deep link / dApp browser fonctionne.

5. **Internationalisation**

   * L’interface du composant de connexion est en français (ou dans la langue par défaut de l’app), sans chaînes anglaises “brutes” visibles pour l’utilisateur.

6. **Robustesse**

   * En cas de perte de réseau au moment de la connexion :

     * aucune crash,
     * un message d’erreur compréhensible est affiché,
     * l’utilisateur peut réessayer.

---

## 8. Livrables attendus

1. **Code source** :

   * Fichiers TypeScript / TSX comprenant :

     * `AppWalletProvider.tsx` (ou équivalent),
     * `WalletConnectButton.tsx`,
     * les modifications de `App.tsx` / `_app.tsx`,
     * la configuration d’environnements (dev / prod).

2. **Documentation interne** (en Markdown idéalement) :

   * `docs/wallet-integration.md` expliquant :

     * comment fonctionne l’intégration Unified Wallet Kit,
     * comment utiliser les hooks et le provider dans de nouveaux écrans,
     * comment ajouter / modifier des callbacks de notifications.

3. **Plan de tests** (checklist) :

   * Liste des scénarios testés sur iOS / Android,
   * Résultats (OK / KO) et bugs à corriger si nécessaire.

---

## 9. Points de vigilance / recommandations

* Éviter de réintroduire des dépendances à `@solana/wallet-adapter-react-ui` ou autres kits concurrents : **Unified Wallet Kit doit rester la seule brique d’abstraction wallets**.
* Bien séparer :

  * la **logique de connexion / gestion du wallet** (dans le provider),
  * de la **logique métier** (transactions, comptes, programmes Solana).
* Prévoir, à moyen terme, la possibilité d’ajouter **Jupiverse Kit** pour bénéficier de composants DeFi (swap, terminal, etc.), qui s’appuieront naturellement sur Unified Wallet Kit pour la gestion du wallet. 


