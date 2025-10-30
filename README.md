# Oinkonomics - Solana NFT Minting Application

## Overview
Oinkonomics is a Proof-of-Wealth NFT collection on Solana that transforms wallet value into collectible pig NFTs. Users connect their wallet, get verified for their portfolio value, and mint free NFTs based on their tier (Poor, MID, or Rich).

## Features
- 🐷 Wallet connection with Solana Wallet Adapter
- 💰 Real-time portfolio value calculation using Jupiter API
- 🎯 Tier-based NFT minting (Poor, MID, Rich)
- 🔒 Secure backend verification and allowlist management
- 🎨 Cartoon-style UI inspired by Sia Skateson's art
- ⚡ Built with Next.js 14, TypeScript, and Tailwind CSS

## Prerequisites
- Node.js 16.15+ 
- Solana CLI installed and configured
- Sugar CLI installed
- A funded Solana wallet for server operations
- RPC endpoint (paid service recommended for production)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd oinkonomics
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - Set your RPC endpoints
   - Add your server keypair path
   - Add your Candy Machine IDs (after deployment)

## Deployment Process

### 1. Deploy Candy Machines
For each tier (Poor, MID, Rich), create a separate directory with:
- `config.json` - Candy Machine configuration
- `assets/` - NFT images and metadata

Deploy each tier:
```bash
sugar launch -k /path/to/your/keypair.json -r YOUR_RPC_ENDPOINT
```

Save the Candy Machine IDs returned by Sugar.

### 2. Configure Backend
Update `.env.local` with:
- Your Candy Machine IDs
- Server keypair path
- RPC endpoints

### 3. Run the Application
```bash
npm run dev
```

## Architecture

### Frontend
- Next.js 14 with App Router
- Solana Wallet Adapter for wallet connection
- Metaplex Umi for NFT minting
- Tailwind CSS for styling

### Backend API
- `/api/verify-tier` - Verifies wallet value and adds to allowlist
- Uses Jupiter API for real-time token pricing
- Executes Sugar CLI commands for allowlist management

### Security
- All wallet verification happens on the backend
- Server keypair used for allowlist transactions
- No client-side manipulation possible

## Tier Thresholds
- **Ineligible**: < $10
- **Poor**: $10 - $999
- **MID**: $1,000 - $9,999  
- **Rich**: $10,000+

## Development

### Testing
1. Switch to devnet in `app/layout.tsx`
2. Deploy test Candy Machines on devnet
3. Test with devnet wallets

### Production Checklist
- [ ] Deploy Candy Machines on mainnet
- [ ] Configure production RPC endpoints
- [ ] Fund server wallet with SOL
- [ ] Test end-to-end flow
- [ ] Update environment variables

## Contributing
Built by Sia Skateson (@siaskateson) and TreizeB (@TreizeB__)
Supported by SuperteamBLKN and SuperteamFRANCE

## License
MIT License
