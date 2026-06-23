import { create } from 'zustand';

export interface Vault {
  id: string;
  name: string;
  asset: string;
  assetSymbol: string;
  apy: number;
  tvl: number;
  maturity: string;
  maturityDays: number;
  protocol: string;
  risk: 'low' | 'medium' | 'high';
  ptPrice: number;
  ytPrice: number;
  totalDeposited: number;
}

export interface Position {
  id: string;
  vaultId: string;
  vaultName: string;
  asset: string;
  ptBalance: number;
  ytBalance: number;
  depositedAmount: number;
  yieldAccrued: number;
  depositTime: number;
  maturityTime: number;
  apy: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'claim' | 'mint';
  vaultId: string;
  vaultName: string;
  amount: number;
  ptAmount: number;
  ytAmount: number;
  timestamp: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  endTime: number;
}

// Arc Testnet Configuration
export const ARC_CHAIN_ID = 5042002;
export const ARC_CHAIN_ID_HEX = '0x4D59E6';

// Arc Testnet chain parameters for wallet_addEthereumChain
export const ARC_TESTNET_CONFIG = {
  chainId: ARC_CHAIN_ID_HEX,
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'Arc',
    symbol: 'ARC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

interface AppState {
  walletAddress: string | null;
  walletChainId: number | null;
  walletConnecting: boolean;
  walletSwitching: boolean;
  walletInitialized: boolean;
  walletError: string | null;

  vaults: Vault[];
  positions: Position[];
  transactions: Transaction[];
  proposals: Proposal[];
  selectedVault: Vault | null;
  totalYieldEarned: number;

  isWalletConnected: () => boolean;
  isArcTestnet: () => boolean;

  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToArcTestnet: () => Promise<void>;
  setWalletError: (err: string | null) => void;
  setWalletConnected: (address: string) => void;
  setWalletDisconnected: () => void;
  initWallet: () => Promise<void>;

  selectVault: (vault: Vault | null) => void;
  deposit: (vaultId: string, amount: number) => { pt: number; yt: number };
  withdraw: (positionId: string, amount: number) => void;
  claimYield: (positionId: string) => number;
  accrueYield: () => void;
}

const initialVaults: Vault[] = [
  { id: '1', name: 'Arc USDC Vault', asset: 'USDC', assetSymbol: 'USDC', apy: 18.5, tvl: 2450000, maturity: '2025-03-15', maturityDays: 90, protocol: 'Aave V3', risk: 'low', ptPrice: 0.955, ytPrice: 0.045, totalDeposited: 0 },
  { id: '2', name: 'Arc ETH Yield', asset: 'ETH', assetSymbol: 'WETH', apy: 24.2, tvl: 1820000, maturity: '2025-06-30', maturityDays: 180, protocol: 'Lido', risk: 'medium', ptPrice: 0.88, ytPrice: 0.12, totalDeposited: 0 },
  { id: '3', name: 'Arc BTC Strategy', asset: 'BTC', assetSymbol: 'WBTC', apy: 15.8, tvl: 3200000, maturity: '2025-12-31', maturityDays: 365, protocol: 'Compound', risk: 'low', ptPrice: 0.842, ytPrice: 0.158, totalDeposited: 0 },
  { id: '4', name: 'Arc Stable Pool', asset: 'USDC', assetSymbol: 'USDC', apy: 12.4, tvl: 5600000, maturity: '2025-02-28', maturityDays: 60, protocol: 'Curve', risk: 'low', ptPrice: 0.98, ytPrice: 0.02, totalDeposited: 0 },
  { id: '5', name: 'Arc Growth Fund', asset: 'ARC', assetSymbol: 'ARC', apy: 32.5, tvl: 890000, maturity: '2025-09-30', maturityDays: 270, protocol: 'Native', risk: 'high', ptPrice: 0.675, ytPrice: 0.325, totalDeposited: 0 },
  { id: '6', name: 'Arc Liquid Staking', asset: 'ETH', assetSymbol: 'stETH', apy: 21.8, tvl: 4100000, maturity: '2025-04-15', maturityDays: 105, protocol: 'Rocket Pool', risk: 'low', ptPrice: 0.912, ytPrice: 0.088, totalDeposited: 0 },
];

const initialProposals: Proposal[] = [
  { id: '1', title: 'Increase Protocol Fee to 10%', description: 'Proposal to increase protocol fees from 5% to 10% to fund development and security audits.', status: 'active', votesFor: 2450000, votesAgainst: 890000, endTime: Date.now() + 3 * 24 * 60 * 60 * 1000 },
  { id: '2', title: 'Add Support for ARB Token', description: 'Enable ARB as a collateral asset and create new yield vaults for Arbitrum ecosystem.', status: 'passed', votesFor: 4200000, votesAgainst: 320000, endTime: Date.now() - 24 * 60 * 60 * 1000 },
  { id: '3', title: 'Treasury Diversification', description: 'Diversify 30% of treasury holdings into stablecoins for operational stability.', status: 'executed', votesFor: 3800000, votesAgainst: 450000, endTime: Date.now() - 7 * 24 * 60 * 60 * 1000 },
];

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

let listenersSetup = false;

function setupWalletListeners(set: (partial: Partial<AppState>) => void) {
  if (listenersSetup || typeof window === 'undefined') return;
  listenersSetup = true;

  const ethereum = (window as any).ethereum;
  if (!ethereum) return;

  ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length > 0) {
      set({ walletAddress: accounts[0] });
    } else {
      set({ walletAddress: null, walletChainId: null });
    }
  });

  ethereum.on('chainChanged', (chain: string) => {
    set({ walletChainId: parseInt(chain, 16) });
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  walletAddress: null,
  walletChainId: null,
  walletConnecting: false,
  walletSwitching: false,
  walletInitialized: false,
  walletError: null,

  vaults: initialVaults,
  positions: [],
  transactions: [],
  proposals: initialProposals,
  selectedVault: null,
  totalYieldEarned: 0,

  isWalletConnected: () => {
    const s = get();
    return !!(s.walletAddress && s.walletChainId !== null);
  },

  isArcTestnet: () => {
    return get().walletChainId === ARC_CHAIN_ID;
  },

  initWallet: async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      set({ walletInitialized: true });
      return;
    }

    try {
      // Only check existing accounts - DO NOT request connection
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const chain = await ethereum.request({ method: 'eth_chainId' });

      if (accounts.length > 0 && chain) {
        set({
          walletAddress: accounts[0],
          walletChainId: parseInt(chain, 16),
          walletInitialized: true,
        });
      } else {
        set({ walletInitialized: true });
      }
    } catch (e) {
      console.log('Wallet init check failed:', e);
      set({ walletInitialized: true });
    }

    setupWalletListeners(set);
  },

  connectWallet: async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      set({ walletError: 'No wallet detected. Please install MetaMask or another Web3 wallet.' });
      return;
    }

    set({ walletConnecting: true, walletError: null });

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chain = await ethereum.request({ method: 'eth_chainId' });

      if (accounts.length > 0 && chain) {
        set({
          walletAddress: accounts[0],
          walletChainId: parseInt(chain, 16),
          walletConnecting: false,
          walletInitialized: true,
        });
      } else {
        set({ walletConnecting: false, walletInitialized: true });
      }
    } catch (err: any) {
      set({
        walletError: err.code === 4001 ? 'Connection rejected by user' : (err.message || 'Failed to connect'),
        walletConnecting: false,
        walletInitialized: true,
      });
    }

    setupWalletListeners(set);
  },

  disconnectWallet: () => {
    set({ walletAddress: null, walletChainId: null, walletError: null });
  },

  switchToArcTestnet: async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      set({ walletError: 'No wallet detected. Please install MetaMask.' });
      return;
    }

    set({ walletSwitching: true, walletError: null });

    try {
      // Try to switch to Arc Testnet
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_CHAIN_ID_HEX }],
      });

      // Refresh chain state after switch
      const chain = await ethereum.request({ method: 'eth_chainId' });
      set({ walletChainId: parseInt(chain, 16), walletSwitching: false });
    } catch (switchError: any) {
      // If chain not found (error 4902), add it via wallet_addEthereumChain
      if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain') || switchError.message?.includes('not recognized')) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARC_TESTNET_CONFIG],
          });

          // Refresh chain state after adding
          const chain = await ethereum.request({ method: 'eth_chainId' });
          set({ walletChainId: parseInt(chain, 16), walletSwitching: false });
        } catch (addError: any) {
          set({
            walletError: addError.message || 'Failed to add Arc Testnet. Please add it manually in your wallet.',
            walletSwitching: false,
          });
        }
      } else if (switchError.code === 4001) {
        set({ walletError: 'Network switch rejected by user.', walletSwitching: false });
      } else {
        set({
          walletError: switchError.message || 'Failed to switch network. Please try adding Arc Testnet manually.',
          walletSwitching: false,
        });
      }
    }
  },

  setWalletError: (err) => set({ walletError: err }),

  setWalletConnected: (address: string) => {
    set({ walletAddress: address });
  },

  setWalletDisconnected: () => {
    set({ walletAddress: null, walletChainId: null, walletError: null });
  },

  selectVault: (vault) => set({ selectedVault: vault }),

  deposit: (vaultId, amount) => {
    const vault = get().vaults.find(v => v.id === vaultId);
    if (!vault) return { pt: 0, yt: 0 };

    const now = Date.now();
    const maturityDate = new Date(vault.maturity).getTime();
    const timeRemaining = (maturityDate - now) / (1000 * 60 * 60 * 24);
    const annualYield = amount * (vault.apy / 100);
    const yieldForPeriod = annualYield * (timeRemaining / 365);
    const ptAmount = amount;
    const ytAmount = yieldForPeriod;

    const newPosition: Position = {
      id: Date.now().toString(),
      vaultId, vaultName: vault.name, asset: vault.asset,
      ptBalance: ptAmount, ytBalance: ytAmount,
      depositedAmount: amount, yieldAccrued: 0,
      depositTime: now, maturityTime: maturityDate, apy: vault.apy,
    };

    const newTransaction: Transaction = {
      id: Date.now().toString(), type: 'deposit',
      vaultId, vaultName: vault.name, amount,
      ptAmount, ytAmount, timestamp: now,
    };

    set(state => ({
      positions: [...state.positions, newPosition],
      transactions: [...state.transactions, newTransaction],
      vaults: state.vaults.map(v =>
        v.id === vaultId ? { ...v, tvl: v.tvl + amount, totalDeposited: v.totalDeposited + amount } : v
      ),
    }));

    return { pt: ptAmount, yt: ytAmount };
  },

  withdraw: (positionId, amount) => {
    const position = get().positions.find(p => p.id === positionId);
    if (!position) return;
    const withdrawAmount = Math.min(amount, position.ptBalance);

    set(state => ({
      positions: state.positions.map(p =>
        p.id === positionId ? { ...p, ptBalance: p.ptBalance - withdrawAmount, depositedAmount: p.depositedAmount - withdrawAmount } : p
      ).filter(p => p.ptBalance > 0),
      transactions: [...state.transactions, {
        id: Date.now().toString(), type: 'withdraw',
        vaultId: position.vaultId, vaultName: position.vaultName,
        amount: withdrawAmount, ptAmount: withdrawAmount, ytAmount: 0, timestamp: Date.now(),
      }],
    }));
  },

  claimYield: (positionId) => {
    const position = get().positions.find(p => p.id === positionId);
    if (!position) return 0;
    const yieldToClaim = position.yieldAccrued;

    set(state => ({
      positions: state.positions.map(p => p.id === positionId ? { ...p, yieldAccrued: 0 } : p),
      transactions: [...state.transactions, {
        id: Date.now().toString(), type: 'claim',
        vaultId: position.vaultId, vaultName: position.vaultName,
        amount: yieldToClaim, ptAmount: 0, ytAmount: 0, timestamp: Date.now(),
      }],
      totalYieldEarned: state.totalYieldEarned + yieldToClaim,
    }));

    return yieldToClaim;
  },

  accrueYield: () => {
    const now = Date.now();
    set(state => ({
      positions: state.positions.map(p => {
        const timeElapsed = (now - p.depositTime) / (1000 * 60 * 60 * 24);
        const annualYield = p.depositedAmount * (p.apy / 100);
        return { ...p, yieldAccrued: annualYield * (timeElapsed / 365) };
      }),
    }));
  },
}));
