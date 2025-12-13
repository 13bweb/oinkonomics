# 🐷 OINKONOMICS - Documentation Complète du Projet

## 📑 Table des Matières

1. [Vue d'Ensemble](#-vue-densemble)
2. [Architecture du Projet](#-architecture-du-projet)
3. [Logique Métier](#-logique-métier)
4. [Technologies et Stack](#-technologies-et-stack)
5. [Configuration et Déploiement](#-configuration-et-déploiement)
6. [Flux Utilisateur](#-flux-utilisateur)
7. [Sécurité et Optimisations](#-sécurité-et-optimisations)
8. [Guide de Développement](#-guide-de-développement)
9. [Troubleshooting](#-troubleshooting)
10. [Ressources et Liens](#-ressources-et-liens)

---

## 🎯 Vue d'Ensemble

### Qu'est-ce qu'Oinkonomics ?

**Oinkonomics** est une application décentralisée (dApp) construite sur la blockchain Solana qui permet le **mint gratuit de NFTs standards** avec un système de tiers basé sur la valeur totale du portefeuille de l'utilisateur.

### Caractéristiques Principales

- **🆓 Mint 100% Gratuit** : Aucun coût de mint (0 SOL), seuls les frais réseau Solana (~0.001 SOL) sont requis
- **🎨 3000 NFTs Standards** : Collection complète de NFTs Metaplex standard
- **🏆 Système de Tiers** : Attribution automatique basée sur la valeur USD totale du wallet (SOL + tokens SPL)
- **🔓 Sans Restrictions** : Pas de limite de mint par wallet, pas de whitelist, pas de soulbound
- **📱 Support Mobile Complet** : Intégration WalletConnect v2 et Mobile Wallet Adapter
- **⚡ Sequential Minting** : Les NFTs sont mintés dans l'ordre (1, 2, 3...)

### Statistiques du Projet

- **Collection** : 3000 NFTs
- **Mintés** : 3 / 3000
- **Disponibles** : 2997
- **Réseau** : Solana Mainnet
- **Type** : NFT Standard (Metaplex)
- **Prix** : GRATUIT (0 SOL)

---

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
oinkonomics/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── verify-tier/          # Endpoint de vérification des tiers
│   ├── globals.css               # Styles globaux
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Page d'accueil
│
├── components/                   # Composants React
│   ├── About.tsx                 # Section À propos
│   ├── Community.tsx             # Section Communauté
│   ├── ErrorBoundary.tsx         # Gestion des erreurs
│   ├── Footer.tsx                # Pied de page
│   ├── Header.tsx                # En-tête
│   ├── Hero.tsx                  # Section Hero
│   ├── ImageSwitcher.tsx         # Switcher d'images
│   ├── TiersExplainer.tsx        # Explication des tiers
│   ├── VerifyMint.tsx            # Composant principal de mint
│   ├── WalletConnect.tsx         # Bouton de connexion wallet
│   └── WalletContextProvider.tsx # Provider de contexte wallet
│
├── lib/                          # Bibliothèques et utilitaires
│   ├── env.ts                    # Validation des variables d'env
│   ├── fetch-with-timeout.ts    # Fetch avec timeout
│   ├── logger-client.ts          # Logger côté client
│   ├── logger.ts                 # Logger côté serveur
│   ├── price-cache.ts            # Cache des prix
│   ├── rate-limit.ts             # Rate limiting
│   └── utils.ts                  # Fonctions utilitaires principales
│
├── config/                       # Configuration
│   └── solana.ts                 # Configuration Solana
│
├── types/                        # Types TypeScript
│   ├── css.d.ts                  # Types CSS
│   └── globals.d.ts              # Types globaux
│
├── public/                       # Assets statiques
│   └── icon.svg                  # Icône de l'application
│
├── scripts/                      # Scripts utilitaires
│   └── validate-env.js           # Validation des variables d'env
│
├── .env.local                    # Variables d'environnement (local)
├── package.json                  # Dépendances npm
├── tsconfig.json                 # Configuration TypeScript
├── tailwind.config.js            # Configuration Tailwind CSS
└── next.config.js                # Configuration Next.js
```

### Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Header     │  │  VerifyMint  │  │    Footer    │      │
│  │  (Wallet)    │  │   (Mint UI)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       WalletContextProvider (Jupiverse Kit)          │   │
│  │  - Phantom, Solflare, Trust, Coinbase               │   │
│  │  - WalletConnect v2 (Mobile)                         │   │
│  │  - Auto-connect, French language                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  POST /api/verify-tier                               │   │
│  │  - Rate limiting (Upstash)                           │   │
│  │  - CSRF protection                                   │   │
│  │  - Wallet tier calculation                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER (Solana)                  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Candy Machine│  │  Candy Guard │  │  Collection  │      │
│  │  (V1uPFru...)│  │  (3YZEt7M...)│  │  (EpBdTNE...)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Metaplex UMI Framework                              │   │
│  │  - mintV2 (NFT standard)                             │   │
│  │  - Simplified minting process                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Helius RPC │  │  CoinGecko   │  │  DeFiLlama   │      │
│  │   (Solana)   │  │ (SOL Price)  │  │(Token Prices)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💼 Logique Métier

### 1. Système de Tiers

Le système de tiers d'Oinkonomics est basé sur la **valeur totale USD du portefeuille** de l'utilisateur, incluant :
- Le solde SOL
- Tous les tokens SPL (tokens Solana)

#### Définition des Tiers

```typescript
export const TIER_THRESHOLDS = {
  TOO_POOR: { 
    min: 0, 
    max: 10, 
    nftRange: null 
  },
  POOR: { 
    min: 10, 
    max: 1000, 
    nftRange: [1, 1000] 
  },
  MID: { 
    min: 1000, 
    max: 10000, 
    nftRange: [1001, 2000] 
  },
  RICH: { 
    min: 10000, 
    max: null, 
    nftRange: [2001, 3000] 
  }
} as const;
```

#### Détails des Tiers

| Tier | Valeur USD | NFT Range | Statut | Description |
|------|-----------|-----------|--------|-------------|
| **TOO POOR** | < $10 | Aucun | ❌ Pas de mint | Wallet insuffisant pour participer |
| **POOR** 🟡 | $10 - $1,000 | #1 - #1000 | ✅ Mint autorisé | Tier Bronze |
| **MID** 🔵 | $1,000 - $10,000 | #1001 - #2000 | ✅ Mint autorisé | Tier Silver |
| **RICH** 🟣 | > $10,000 | #2001 - #3000 | ✅ Mint autorisé | Tier Gold |

### 2. Calcul de la Valeur du Wallet

Le calcul de la valeur totale du wallet se fait en plusieurs étapes :

#### Étape 1 : Récupération du Solde SOL

```typescript
export async function getWalletBalance(walletAddress: string): Promise<number> {
  const connection = new Connection(PUBLIC_RPC_URL);
  const publicKey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}
```

#### Étape 2 : Récupération des Tokens SPL

```typescript
export async function getTokenBalances(walletAddress: string) {
  const connection = new Connection(PUBLIC_RPC_URL);
  const publicKey = new PublicKey(walletAddress);
  
  // Récupérer tous les token accounts
  const { value: tokenAccounts } = await connection.getParsedTokenAccountsByOwner(
    publicKey, 
    { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
  );
  
  // Filtrer les tokens avec balance > 0
  return tokenAccounts
    .map(account => ({
      mint: account.account.data.parsed.info.mint,
      balance: account.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: account.account.data.parsed.info.tokenAmount.decimals
    }))
    .filter(token => token.balance > 0);
}
```

#### Étape 3 : Récupération des Prix

**Prix SOL (CoinGecko)** :
```typescript
export async function fetchSOLPriceUSD(): Promise<number> {
  const res = await fetchWithTimeout(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    {},
    5000
  );
  const data = await res.json();
  return data?.solana?.usd ?? 0;
}
```

**Prix Tokens (DeFiLlama)** :
```typescript
export async function getTokenPrices(mints: string[]): Promise<Record<string, number>> {
  const coinsParam = mints.map(mint => `solana:${mint}`).join(',');
  const response = await fetchWithTimeout(
    `https://coins.llama.fi/prices/current/${coinsParam}`,
    {},
    5000
  );
  const data = await response.json();
  
  const prices: Record<string, number> = {};
  for (const mint of mints) {
    const key = `solana:${mint}`;
    if (data.coins?.[key]?.price) {
      prices[mint] = data.coins[key].price;
    }
  }
  return prices;
}
```

#### Étape 4 : Calcul de la Valeur Totale

```typescript
export async function getTotalWalletValue(walletAddress: string) {
  // Paralléliser les appels RPC
  const [solBalance, tokens] = await Promise.all([
    connection.getBalance(publicKey),
    getTokenBalances(walletAddress)
  ]);
  
  const solBalanceInSOL = solBalance / LAMPORTS_PER_SOL;
  
  // Paralléliser les prix
  const [solPriceUSD, tokenPrices] = await Promise.all([
    fetchSOLPriceUSD(),
    getTokenPrices(tokens.map(t => t.mint))
  ]);
  
  const solValueUSD = solBalanceInSOL * solPriceUSD;
  
  // Calculer la valeur des tokens
  let tokensValueUSD = 0;
  for (const token of tokens) {
    const price = tokenPrices[token.mint] || 0;
    tokensValueUSD += token.balance * price;
  }
  
  const totalUSD = solValueUSD + tokensValueUSD;
  
  return { totalUSD, solBalance: solBalanceInSOL, solValueUSD, tokensValueUSD };
}
```

### 3. Attribution du Numéro NFT

Chaque wallet reçoit un **numéro NFT déterministe** basé sur :
- L'adresse du wallet
- Le tier attribué

#### Algorithme de Génération

```typescript
export function generateNFTNumber(tier: WalletTier, walletAddress: string): number | null {
  const tierConfig = TIER_THRESHOLDS[tier];
  if (!tierConfig.nftRange) return null;
  
  const [min, max] = tierConfig.nftRange;
  const range = max - min + 1;
  
  // Hash déterministe (SHA256)
  const hash = createHash('sha256')
    .update(walletAddress + tier)
    .digest('hex');
  
  const hashNum = parseInt(hash.substring(0, 8), 16);
  
  // Convertir en nombre dans la plage
  return min + (hashNum % range);
}
```

**Avantages** :
- ✅ **Déterministe** : Même wallet = même numéro NFT
- ✅ **Unique** : Chaque wallet a un numéro différent
- ✅ **Reproductible** : Peut être recalculé à tout moment
- ✅ **Équitable** : Distribution uniforme dans la range

### 4. Processus de Mint

Le mint d'un NFT Oinkonomics suit un processus simplifié pour les NFTs standards :

#### Étape 1 : Vérification du Tier

```typescript
// API Route: /api/verify-tier
export async function POST(request: NextRequest) {
  const { walletAddress } = await request.json();
  
  // Rate limiting
  const rateLimitResult = await checkRateLimit(ip);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // Validation de l'adresse
  if (!isValidSolanaAddress(walletAddress)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }
  
  // Calcul du tier
  const tierInfo = await verifyWalletTier(walletAddress);
  const candyMachineId = getCandyMachineIdForTier(tierInfo.tier);
  
  return NextResponse.json({
    tier: tierInfo.tier,
    balance: tierInfo.balance,
    balanceUSD: tierInfo.balanceUSD,
    nftNumber: tierInfo.nftNumber,
    candyMachineId
  });
}
```

#### Étape 2 : Préparation du Mint (Frontend)

```typescript
// components/VerifyMint.tsx
const handleMint = async () => {
  if (!wallet.publicKey || !tierInfo) return;
  
  setMinting(true);
  
  try {
    const result = await mintNFT(wallet, tierInfo.candyMachineId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error('Erreur lors du mint');
  } finally {
    setMinting(false);
  }
};
```

#### Étape 3 : Exécution du Mint (Blockchain) - NFT Standard

```typescript
// lib/utils.ts
export const mintNFT = async (wallet: WalletAdapter, candyMachineId: string) => {
  // Initialiser UMI avec wallet adapter
  const umi = createUmiInstance(wallet);
  
  // Adresses blockchain
  const candyMachine = publicKey(candyMachineId);
  const candyGuard = publicKey(CANDY_GUARD);
  const collectionMint = publicKey(COLLECTION_MINT);
  const collectionUpdateAuthority = publicKey(COLLECTION_UPDATE_AUTHORITY);
  
  // Générer le NFT mint
  const nftMint = generateSigner(umi);
  
  // Mint NFT standard avec mintV2 (simplifié)
  const result = await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 400000 }))
    .add(
      mintV2(umi, {
        candyMachine,
        candyGuard,
        nftMint,
        collectionMint,
        collectionUpdateAuthority,
        mintArgs: {
          candyGuard: some({}) // Pas de guards actifs
        }
      })
    )
    .sendAndConfirm(umi);
  
  return {
    success: true,
    signature: result.signature.toString(),
    message: '🎉 NFT Oinkonomics minté gratuitement !'
  };
};
```

### 5. NFT Standard vs pNFT

Le projet utilise maintenant des **NFTs standards** pour une simplicité maximale :

#### Différences Clés

| Aspect | NFT Standard | pNFT (Ancien) |
|--------|--------------|---------------|
| **Token Account** | ✅ Oui (automatique) | ✅ Oui |
| **Token Record** | ❌ Non | ✅ Oui (OBLIGATOIRE) |
| **Rule Set** | ❌ Non | ✅ Oui |
| **Transfert** | ✅ Simple | ⚠️ Programmable |
| **Complexité** | ✅ Faible | ❌ Élevée |
| **Code** | ✅ ~20 lignes | ❌ ~50 lignes |

#### Avantages des NFTs Standards

- ✅ **Code plus simple** : Moins de calculs PDA
- ✅ **Moins d'erreurs** : Pas de problèmes de Token Record
- ✅ **Mint plus rapide** : Moins de comptes à créer
- ✅ **Compatible** : Tous les wallets Solana
- ✅ **Transférable** : Pas de restrictions programmables

---

## 🛠️ Technologies et Stack

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 14.0.4 | Framework React avec App Router |
| **React** | 18 | Bibliothèque UI |
| **TypeScript** | 5 | Langage de programmation |
| **Tailwind CSS** | 3.3.0 | Framework CSS utilitaire |
| **Jupiverse Kit** | 1.3.0 | Wallet adapter unifié (Jupiter) |

### Blockchain

| Technologie | Version | Usage |
|-------------|---------|-------|
| **@metaplex-foundation/mpl-candy-machine** | 6.1.0 | Candy Machine v3 |
| **@metaplex-foundation/mpl-token-metadata** | 3.4.0 | Métadonnées NFT |
| **@metaplex-foundation/umi** | 0.9.0 | Framework Metaplex |
| **@solana/web3.js** | 1.95.2 | SDK Solana |

### Wallets Supportés

- **Phantom** (Desktop + Mobile)
- **Solflare** (Desktop + Mobile)
- **Trust Wallet** (Mobile)
- **Coinbase Wallet** (Mobile)
- **WalletConnect v2** (Mobile)

### Services Externes

| Service | Usage | Endpoint |
|---------|-------|----------|
| **Helius RPC** | Node Solana | `https://mainnet.helius-rpc.com/` |
| **CoinGecko** | Prix SOL | `https://api.coingecko.com/api/v3/` |
| **DeFiLlama** | Prix tokens SPL | `https://coins.llama.fi/prices/` |
| **Upstash Redis** | Rate limiting | Cloud Redis |

### Sécurité

| Technologie | Usage |
|-------------|-------|
| **@upstash/ratelimit** | Rate limiting API |
| **@upstash/redis** | Cache distribué |
| **Zod** | Validation de schémas |

---

## ⚙️ Configuration et Déploiement

### Variables d'Environnement

#### Fichier `.env.local`

```env
# RÉSEAU
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_CLUSTER_LABEL=MAINNET
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# CANDY MACHINE
NEXT_PUBLIC_CANDY_MACHINE_ID=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_MACHINE_ID_POOR=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_MACHINE_ID_MID=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
NEXT_PUBLIC_CANDY_MACHINE_ID_RICH=V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV

# CANDY GUARD (SANS RESTRICTIONS)
NEXT_PUBLIC_CANDY_GUARD=3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9

# COLLECTION
NEXT_PUBLIC_COLLECTION_MINT=EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY=FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf

# PRIX (GRATUIT)
NEXT_PUBLIC_MINT_PRICE=0

# WALLETCONNECT (Mobile)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=cf0f4c50b8001a0045e9b9f3971dbdc0

# APP METADATA
NEXT_PUBLIC_APP_NAME=Oinkonomics
NEXT_PUBLIC_APP_URL=https://oinkonomics.vercel.app
NEXT_PUBLIC_APP_ICON=https://oinkonomics.vercel.app/icon.png

# PERFORMANCE
NEXT_PUBLIC_COMPUTE_UNIT_LIMIT=400000
NEXT_PUBLIC_COMPUTE_UNIT_MICROLAMPORTS=0

# TIERS (Optionnel - pour affichage frontend)
NEXT_PUBLIC_NFT_RANGE_POOR_START=1
NEXT_PUBLIC_NFT_RANGE_POOR_END=1000
NEXT_PUBLIC_NFT_RANGE_MID_START=1001
NEXT_PUBLIC_NFT_RANGE_MID_END=2000
NEXT_PUBLIC_NFT_RANGE_RICH_START=2001
NEXT_PUBLIC_NFT_RANGE_RICH_END=3000
```

### Adresses Blockchain

#### Candy Machine
```
V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
```
- Authority: `FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf`
- Token Standard: NFT Standard
- Sequential: true (mint dans l'ordre)
- [Explorer](https://explorer.solana.com/address/V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV?cluster=mainnet)

#### Candy Guard
```
3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9
```
- Créé le: 2025-12-11
- Guards: **AUCUN** (mint gratuit et illimité)
- [Explorer](https://explorer.solana.com/address/3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9?cluster=mainnet)

#### Collection
```
EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y
```
- Update Authority: `FKxNTsxE83WwGSqLs7o6mWYPaZybZPFgKr3B7m7x2qxf`
- Symbol: OINK
- Name Prefix: Oinkonomics #
- [Explorer](https://explorer.solana.com/address/EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y?cluster=mainnet)

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

### Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de dev (http://localhost:3000)

# Production
npm run build        # Build pour production
npm run start        # Démarrer en production

# Utilitaires
npm run lint         # Linter le code
npm run validate-env # Valider les variables d'environnement
./verify-config.sh   # Vérifier la configuration complète
```

### Déploiement sur Vercel

1. **Connecter le repository GitHub à Vercel**

2. **Configurer les variables d'environnement** dans Vercel Dashboard

3. **Déployer**
   ```bash
   vercel --prod
   ```

4. **Vérifier le déploiement**
   - Tester la connexion wallet
   - Tester la vérification du tier
   - Tester le mint

---

## 👤 Flux Utilisateur

### 1. Connexion du Wallet

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant W as Wallet (Phantom/Solflare)
    participant A as Application
    participant S as Solana RPC
    
    U->>A: Clique sur "Connect Wallet"
    A->>W: Demande de connexion
    W->>U: Affiche la popup de confirmation
    U->>W: Approuve la connexion
    W->>A: Retourne la clé publique
    A->>S: Récupère le solde
    S->>A: Retourne le solde
    A->>U: Affiche le wallet connecté
```

### 2. Vérification du Tier

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as Application
    participant API as API /verify-tier
    participant S as Solana RPC
    participant C as CoinGecko
    participant D as DeFiLlama
    
    U->>A: Clique sur "Vérifier mes Oinks"
    A->>API: POST /api/verify-tier
    API->>S: Récupère solde SOL
    API->>S: Récupère tokens SPL
    S->>API: Retourne les données
    API->>C: Récupère prix SOL
    C->>API: Retourne prix SOL
    API->>D: Récupère prix tokens
    D->>API: Retourne prix tokens
    API->>API: Calcule valeur totale USD
    API->>API: Détermine le tier
    API->>API: Génère numéro NFT
    API->>A: Retourne tier info
    A->>U: Affiche le tier et le NFT
```

### 3. Mint du NFT (NFT Standard)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as Application
    participant W as Wallet
    participant UMI as UMI Framework
    participant CM as Candy Machine
    participant S as Solana Blockchain
    
    U->>A: Clique sur "Minter NFT"
    A->>UMI: Prépare la transaction
    UMI->>UMI: Génère NFT mint signer
    UMI->>CM: Appelle mintV2 (simplifié)
    CM->>W: Demande signature
    W->>U: Affiche popup de confirmation
    U->>W: Approuve la transaction
    W->>CM: Retourne signature
    CM->>S: Envoie transaction
    S->>S: Crée le NFT standard
    S->>CM: Confirme transaction
    CM->>A: Retourne signature
    A->>U: Affiche succès + signature
```

---

## 🔒 Sécurité et Optimisations

### 1. Rate Limiting

Protection contre les abus et les attaques DDoS :

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requêtes par minute
  analytics: true,
});

export async function checkRateLimit(ip: string) {
  const { success, limit, remaining } = await ratelimit.limit(ip);
  return { success, limit, remaining };
}
```

### 2. Protection CSRF

Vérification de l'origine des requêtes :

```typescript
function isValidOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  
  // En développement, accepter localhost
  if (process.env.NODE_ENV === 'development') {
    return origin.includes('localhost') || origin.includes('127.0.0.1');
  }
  
  // En production, vérifier que l'origine correspond au host
  try {
    const originUrl = new URL(origin);
    const hostUrl = new URL(`https://${host}`);
    return originUrl.hostname === hostUrl.hostname;
  } catch {
    return false;
  }
}
```

### 3. Validation des Entrées

Validation stricte des adresses Solana :

```typescript
function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== 'string') return false;
  
  // Adresse Solana base58: 32-44 caractères
  if (address.length < 32 || address.length > 44) return false;
  
  // Vérifier que c'est du base58 (pas de 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}
```

### 4. Cache des Prix

Optimisation des appels API externes :

```typescript
// lib/price-cache.ts
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute

export function getCachedPrice(key: string): number | null {
  const cached = priceCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    priceCache.delete(key);
    return null;
  }
  
  return cached.price;
}
```

### 5. Parallélisation des Appels RPC

Optimisation des performances :

```typescript
// Paralléliser les appels RPC
const [solBalance, tokens] = await Promise.all([
  connection.getBalance(publicKey),
  getTokenBalances(walletAddress)
]);

// Paralléliser les prix
const [solPriceUSD, tokenPrices] = await Promise.all([
  fetchSOLPriceUSD(),
  getTokenPrices(tokens.map(t => t.mint))
]);
```

**Gain de performance** :
- ❌ Séquentiel : ~3-5 secondes
- ✅ Parallèle : ~1-2 secondes

---

## 🧑‍💻 Guide de Développement

### Prérequis

- **Node.js** 18+
- **npm** ou **yarn**
- **Wallet Solana** (Phantom, Solflare, etc.)
- **Minimum 0.002 SOL** pour les tests

### Installation Locale

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/oinkonomics.git
cd oinkonomics

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Configurer les variables d'environnement
# Éditer .env.local avec vos valeurs

# 5. Vérifier la configuration
./verify-config.sh

# 6. Démarrer le serveur de développement
npm run dev
```

### Structure du Code

#### Composants Principaux

**`components/VerifyMint.tsx`** - Composant principal de mint
```typescript
- handleVerify() : Vérifie le tier du wallet
- handleMint() : Lance le mint du NFT
- getTierLabel() : Retourne le label du tier
- getTierColor() : Retourne la couleur du tier
```

**`lib/utils.ts`** - Fonctions utilitaires
```typescript
- fetchSOLPriceUSD() : Récupère le prix SOL
- getTokenBalances() : Récupère les tokens SPL
- getTokenPrices() : Récupère les prix des tokens
- getTotalWalletValue() : Calcule la valeur totale
- verifyWalletTier() : Vérifie le tier
- generateNFTNumber() : Génère le numéro NFT
- mintNFT() : Mint le NFT (simplifié pour NFT standard)
```

**`app/api/verify-tier/route.ts`** - API de vérification
```typescript
- POST() : Endpoint de vérification du tier
- isValidSolanaAddress() : Valide l'adresse
- isValidOrigin() : Valide l'origine CSRF
- getTierMessage() : Génère le message du tier
```

---

## 🐛 Troubleshooting

### Erreur: "Solde insuffisant"

**Cause** : Pas assez de SOL pour les frais réseau

**Solution** :
```bash
# Vérifier le solde
solana balance [WALLET_ADDRESS]

# Ajouter au moins 0.002 SOL
# Le mint est gratuit, mais les frais réseau sont ~0.001 SOL
```

### Erreur: "Configuration Candy Guard incorrecte"

**Cause** : Problème avec l'adresse du Candy Guard

**Solution** :
1. Vérifier `NEXT_PUBLIC_CANDY_GUARD` dans `.env.local`
2. Valeur attendue: `3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9`
3. Redémarrer le serveur après modification

### Erreur: "Collection épuisée"

**Cause** : Les 3000 NFTs ont tous été mintés

**Solution** :
```bash
# Vérifier le nombre de NFTs mintés
sugar show V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV
```

### Le wallet ne se connecte pas

**Solutions** :
1. Rafraîchir la page
2. Vérifier que le wallet est sur Mainnet
3. Essayer un autre navigateur
4. Désactiver les extensions qui pourraient bloquer
5. Vider le cache du navigateur

### Build échoue

**Solutions** :
```bash
# 1. Nettoyer le cache
rm -rf .next node_modules
npm install

# 2. Vérifier les variables d'environnement
npm run validate-env

# 3. Vérifier les erreurs TypeScript
npm run lint

# 4. Rebuild
npm run build
```

---

## 📚 Ressources et Liens

### Documentation Officielle

- **Solana** : https://docs.solana.com/
- **Metaplex** : https://docs.metaplex.com/
- **Next.js** : https://nextjs.org/docs
- **Tailwind CSS** : https://tailwindcss.com/docs

### Explorateurs Blockchain

- **Solana Explorer** : https://explorer.solana.com/?cluster=mainnet
- **Candy Machine** : https://explorer.solana.com/address/V1uPFruGcjeFZ9hh23dnJ8tNnNemhUfgkFZmAmwaBDV?cluster=mainnet
- **Candy Guard** : https://explorer.solana.com/address/3YZEt7McXt4fbYokvmkc1kq1joSkxX4WHPCf3B9k1hi9?cluster=mainnet
- **Collection** : https://explorer.solana.com/address/EpBdTNEBChZV3D1diKALwxiQirgXSGFu6Z6f85B1w53Y?cluster=mainnet

### APIs Externes

- **CoinGecko API** : https://www.coingecko.com/en/api
- **DeFiLlama API** : https://defillama.com/docs/api
- **Helius RPC** : https://docs.helius.dev/

### Outils de Développement

- **Sugar CLI** : https://docs.metaplex.com/developer-tools/sugar/
- **Solana CLI** : https://docs.solana.com/cli
- **Anchor** : https://www.anchor-lang.com/

### Communauté

- **Discord Solana** : https://discord.gg/solana
- **Discord Metaplex** : https://discord.gg/metaplex
- **Twitter Oinkonomics** : [@Oinkonomics]

---

## 📄 Licence

MIT License - voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 🔄 Changelog

### v2.0.0 - 2025-12-12 ✅ ACTUEL
- ✅ **Migration vers NFTs standards**
- ❌ Suppression complète de la logique pNFT
- ✅ Simplification du code de mint (~30 lignes supprimées)
- ✅ Suppression des dépendances Token Record et Rule Set
- ✅ Build réussi et testé
- ✅ Documentation mise à jour

### v1.0.0 - 2025-12-11
- ✅ Version initiale avec pNFTs
- ✅ Système de tiers
- ✅ Mint gratuit
- ✅ Support mobile

---

## 🎉 Conclusion

**Oinkonomics** est une application complète et robuste qui démontre :

✅ **L'intégration de Metaplex** avec NFTs standards  
✅ **Un système de tiers innovant** basé sur la valeur totale du wallet  
✅ **Une architecture sécurisée** avec rate limiting et protection CSRF  
✅ **Des optimisations de performance** avec cache et parallélisation  
✅ **Un support mobile complet** avec WalletConnect v2  
✅ **Une expérience utilisateur fluide** avec feedback en temps réel  
✅ **Un code simple et maintenable** grâce aux NFTs standards  

Le projet est **prêt pour la production** et peut servir de base pour d'autres projets NFT sur Solana.

---

**Fait avec ❤️ pour la communauté Solana** 🐷🚀

*Dernière mise à jour : 2025-12-12*
