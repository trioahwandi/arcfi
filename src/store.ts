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

interface AppState {
  isConnected: boolean;
  walletAddress: string | null;
  vaults: Vault[];
  positions: Position[];
  transactions: Transaction[];
  proposals: Proposal[];
  selectedVault: Vault | null;
  totalYieldEarned: number;
  
  connectWallet: () => void;
  disconnectWallet: () => void;
  selectVault: (vault: Vault | null) => void;
  deposit: (vaultId: string, amount: number) => { pt: number; yt: number };
  withdraw: (positionId: string, amount: number) => void;
  claimYield: (positionId: string) => number;
  accrueYield: () => void;
}

const initialVaults: Vault[] = [
  {
    id: '1',
    name: 'Arc USDC Vault',
    asset: 'USDC',
    assetSymbol: 'USDC',
    apy: 18.5,
    tvl: 2450000,
    maturity: '2025-03-15',
    maturityDays: 90,
    protocol: 'Aave V3',
    risk: 'low',
    ptPrice: 0.955,
    ytPrice: 0.045,
    totalDeposited: 0
  },
  {
    id: '2',
    name: 'Arc ETH Yield',
    asset: 'ETH',
    assetSymbol: 'WETH',
    apy: 24.2,
    tvl: 1820000,
    maturity: '2025-06-30',
    maturityDays: 180,
    protocol: 'Lido',
    risk: 'medium',
    ptPrice: 0.88,
    ytPrice: 0.12,
    totalDeposited: 0
  },
  {
    id: '3',
    name: 'Arc BTC Strategy',
    asset: 'BTC',
    assetSymbol: 'WBTC',
    apy: 15.8,
    tvl: 3200000,
    maturity: '2025-12-31',
    maturityDays: 365,
    protocol: 'Compound',
    risk: 'low',
    ptPrice: 0.842,
    ytPrice: 0.158,
    totalDeposited: 0
  },
  {
    id: '4',
    name: 'Arc Stable Pool',
    asset: 'USDC',
    assetSymbol: 'USDC',
    apy: 12.4,
    tvl: 5600000,
    maturity: '2025-02-28',
    maturityDays: 60,
    protocol: 'Curve',
    risk: 'low',
    ptPrice: 0.98,
    ytPrice: 0.02,
    totalDeposited: 0
  },
  {
    id: '5',
    name: 'Arc Growth Fund',
    asset: 'ARC',
    assetSymbol: 'ARC',
    apy: 32.5,
    tvl: 890000,
    maturity: '2025-09-30',
    maturityDays: 270,
    protocol: 'Native',
    risk: 'high',
    ptPrice: 0.675,
    ytPrice: 0.325,
    totalDeposited: 0
  },
  {
    id: '6',
    name: 'Arc Liquid Staking',
    asset: 'ETH',
    assetSymbol: 'stETH',
    apy: 21.8,
    tvl: 4100000,
    maturity: '2025-04-15',
    maturityDays: 105,
    protocol: 'Rocket Pool',
    risk: 'low',
    ptPrice: 0.912,
    ytPrice: 0.088,
    totalDeposited: 0
  }
];

const initialProposals: Proposal[] = [
  {
    id: '1',
    title: 'Increase Protocol Fee to 10%',
    description: 'Proposal to increase protocol fees from 5% to 10% to fund development and security audits.',
    status: 'active',
    votesFor: 2450000,
    votesAgainst: 890000,
    endTime: Date.now() + 3 * 24 * 60 * 60 * 1000
  },
  {
    id: '2',
    title: 'Add Support for ARB Token',
    description: 'Enable ARB as a collateral asset and create new yield vaults for Arbitrum ecosystem.',
    status: 'passed',
    votesFor: 4200000,
    votesAgainst: 320000,
    endTime: Date.now() - 24 * 60 * 60 * 1000
  },
  {
    id: '3',
    title: 'Treasury Diversification',
    description: 'Diversify 30% of treasury holdings into stablecoins for operational stability.',
    status: 'executed',
    votesFor: 3800000,
    votesAgainst: 450000,
    endTime: Date.now() - 7 * 24 * 60 * 60 * 1000
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  isConnected: false,
  walletAddress: null,
  vaults: initialVaults,
  positions: [],
  transactions: [],
  proposals: initialProposals,
  selectedVault: null,
  totalYieldEarned: 0,

  connectWallet: () => {
    const mockAddress = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    set({ isConnected: true, walletAddress: mockAddress });
  },

  disconnectWallet: () => {
    set({ 
      isConnected: false, 
      walletAddress: null, 
      positions: [], 
      transactions: [],
      totalYieldEarned: 0 
    });
  },

  selectVault: (vault) => set({ selectedVault: vault }),

  deposit: (vaultId, amount) => {
    const vault = get().vaults.find(v => v.id === vaultId);
    if (!vault) return { pt: 0, yt: 0 };

    const now = Date.now();
    const maturityDate = new Date(vault.maturity).getTime();
    const timeRemaining = (maturityDate - now) / (1000 * 60 * 60 * 24);
    
    // Real PT/YT calculation
    const annualYield = amount * (vault.apy / 100);
    const yieldForPeriod = annualYield * (timeRemaining / 365);
    
    const ptAmount = amount; // PT is always 1:1 with deposited amount
    const ytAmount = yieldForPeriod; // YT represents future yield

    const newPosition: Position = {
      id: Date.now().toString(),
      vaultId,
      vaultName: vault.name,
      asset: vault.asset,
      ptBalance: ptAmount,
      ytBalance: ytAmount,
      depositedAmount: amount,
      yieldAccrued: 0,
      depositTime: now,
      maturityTime: maturityDate,
      apy: vault.apy
    };

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      vaultId,
      vaultName: vault.name,
      amount,
      ptAmount,
      ytAmount,
      timestamp: now
    };

    set(state => ({
      positions: [...state.positions, newPosition],
      transactions: [...state.transactions, newTransaction],
      vaults: state.vaults.map(v => 
        v.id === vaultId 
          ? { ...v, tvl: v.tvl + amount, totalDeposited: v.totalDeposited + amount }
          : v
      )
    }));

    return { pt: ptAmount, yt: ytAmount };
  },

  withdraw: (positionId, amount) => {
    const position = get().positions.find(p => p.id === positionId);
    if (!position) return;

    const withdrawAmount = Math.min(amount, position.ptBalance);
    const now = Date.now();

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdraw',
      vaultId: position.vaultId,
      vaultName: position.vaultName,
      amount: withdrawAmount,
      ptAmount: withdrawAmount,
      ytAmount: 0,
      timestamp: now
    };

    set(state => ({
      positions: state.positions.map(p => 
        p.id === positionId 
          ? { ...p, ptBalance: p.ptBalance - withdrawAmount, depositedAmount: p.depositedAmount - withdrawAmount }
          : p
      ).filter(p => p.ptBalance > 0),
      transactions: [...state.transactions, newTransaction]
    }));
  },

  claimYield: (positionId) => {
    const position = get().positions.find(p => p.id === positionId);
    if (!position) return 0;

    const yieldToClaim = position.yieldAccrued;
    const now = Date.now();

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'claim',
      vaultId: position.vaultId,
      vaultName: position.vaultName,
      amount: yieldToClaim,
      ptAmount: 0,
      ytAmount: 0,
      timestamp: now
    };

    set(state => ({
      positions: state.positions.map(p => 
        p.id === positionId ? { ...p, yieldAccrued: 0 } : p
      ),
      transactions: [...state.transactions, newTransaction],
      totalYieldEarned: state.totalYieldEarned + yieldToClaim
    }));

    return yieldToClaim;
  },

  accrueYield: () => {
    const now = Date.now();
    set(state => ({
      positions: state.positions.map(p => {
        const timeElapsed = (now - p.depositTime) / (1000 * 60 * 60 * 24);
        const annualYield = p.depositedAmount * (p.apy / 100);
        const newYield = annualYield * (timeElapsed / 365);
        return { ...p, yieldAccrued: newYield };
      })
    }));
  }
}));
