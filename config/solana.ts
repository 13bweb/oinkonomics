export const SOLANA_CONFIG = {
    dev: {
        env: 'devnet' as const,
        rpcEndpoint: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
    },
    prod: {
        env: 'mainnet-beta' as const,
        rpcEndpoint: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com',
    },
} as const;

export const getCurrentConfig = () => {
    const isProd = process.env.NODE_ENV === 'production';
    return isProd ? SOLANA_CONFIG.prod : SOLANA_CONFIG.dev;
};
