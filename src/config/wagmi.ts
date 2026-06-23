// Arc Testnet Configuration
export const ARC_CHAIN_ID = 5042002;
export const ARC_CHAIN_ID_HEX = '0x4D59E6';

export const arcTestnet = {
  id: ARC_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
};

export const config = {};

declare module 'wagmi' {
  export interface Register {
    config: typeof config;
  }
}
