import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Clock, Shield, AlertCircle, 
  ChevronRight, X, Wallet, ExternalLink, Copy, Check,
  BarChart3, PieChart, Activity, DollarSign, Users, Zap
} from 'lucide-react';
import { useState } from 'react';
import { Vault, Position } from './store';

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getRiskBg(risk: string): string {
  switch (risk) {
    case 'low': return 'bg-green-500/10 border-green-500/20';
    case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'high': return 'bg-red-500/10 border-red-500/20';
    default: return 'bg-gray-500/10 border-gray-500/20';
  }
}

interface VaultCardProps {
  vault: Vault;
  onClick: () => void;
  index: number;
}

export function VaultCard({ vault, onClick, index }: VaultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="glass rounded-2xl p-6 card-hover cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-[var(--secondary)] transition-colors">
            {vault.name}
          </h3>
          <p className="text-sm text-[var(--muted)]">{vault.protocol}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBg(vault.risk)}`}>
          <span className={getRiskColor(vault.risk)}>{vault.risk.toUpperCase()}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">APY</p>
          <p className="text-2xl font-bold text-gradient">{vault.apy}%</p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">TVL</p>
          <p className="text-xl font-semibold">${formatNumber(vault.tvl)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Clock className="w-4 h-4" />
          <span>{vault.maturityDays} days</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">{vault.assetSymbol}</span>
          <ChevronRight className="w-4 h-4 text-[var(--primary)] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

interface DepositModalProps {
  vault: Vault;
  onClose: () => void;
  onDeposit: (amount: number) => void;
}

export function DepositModal({ vault, onClose, onDeposit }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState({ pt: 0, yt: 0 });

  const now = Date.now();
  const maturityDate = new Date(vault.maturity).getTime();
  const timeRemaining = Math.max(0, (maturityDate - now) / (1000 * 60 * 60 * 24));
  
  const numAmount = parseFloat(amount) || 0;
  const annualYield = numAmount * (vault.apy / 100);
  const projectedYield = annualYield * (timeRemaining / 365);

  const handleDeposit = () => {
    if (numAmount <= 0) return;
    const depositResult = onDeposit(numAmount);
    setResult({ pt: depositResult.pt, yt: depositResult.yt });
    setShowResult(true);
  };

  const handleClose = () => {
    setShowResult(false);
    setAmount('');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-8 max-w-md w-full glow-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Deposit to {vault.name}</h2>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showResult ? (
          <>
            <div className="mb-6">
              <label className="block text-sm text-[var(--muted)] mb-2">Amount ({vault.assetSymbol})</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-4 text-xl font-semibold focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button 
                  onClick={() => setAmount('1000')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--primary)] hover:underline"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="glass rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">APY</span>
                <span className="text-[var(--secondary)] font-semibold">{vault.apy}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Time to Maturity</span>
                <span>{Math.floor(timeRemaining)} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Projected Yield</span>
                <span className="text-[var(--success)] font-semibold">{projectedYield.toFixed(4)} {vault.assetSymbol}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">PT Amount (Principal)</span>
                  <span className="font-semibold">{numAmount.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[var(--muted)]">YT Amount (Yield)</span>
                  <span className="text-[var(--accent)] font-semibold">{projectedYield.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={numAmount <= 0}
              className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deposit & Mint PT + YT
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Deposit Successful!</h3>
            <p className="text-[var(--muted)] mb-6">Your tokens have been minted</p>
            
            <div className="glass rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Principal Tokens</span>
                <span className="font-bold">{result.pt.toFixed(4)} PT-{vault.assetSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Yield Tokens</span>
                <span className="font-bold text-[var(--accent)]">{result.yt.toFixed(4)} YT-{vault.assetSymbol}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full btn-primary py-3 rounded-xl font-semibold"
            >
              View Portfolio
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface PositionCardProps {
  position: Position;
  onClaim: () => void;
  onWithdraw: () => void;
}

export function PositionCard({ position, onClaim, onWithdraw }: PositionCardProps) {
  const now = Date.now();
  const progress = Math.min(100, ((now - position.depositTime) / (position.maturityTime - position.depositTime)) * 100);
  const isMatured = now >= position.maturityTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{position.vaultName}</h3>
          <p className="text-sm text-[var(--muted)]">{position.asset}</p>
        </div>
        {isMatured && (
          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
            MATURED
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--muted)]">Time Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="glass rounded-xl p-3">
          <p className="text-xs text-[var(--muted)] mb-1">PT Balance</p>
          <p className="text-lg font-bold">{position.ptBalance.toFixed(4)}</p>
          <p className="text-xs text-[var(--muted)]">Principal Token</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-xs text-[var(--muted)] mb-1">YT Balance</p>
          <p className="text-lg font-bold text-[var(--accent)]">{position.ytBalance.toFixed(4)}</p>
          <p className="text-xs text-[var(--muted)]">Yield Token</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-[var(--success)]/10 rounded-xl border border-[var(--success)]/20 mb-4">
        <div>
          <p className="text-xs text-[var(--muted)]">Yield Accrued</p>
          <p className="text-xl font-bold text-[var(--success)]">{position.yieldAccrued.toFixed(4)} {position.asset}</p>
        </div>
        <Activity className="w-5 h-5 text-[var(--success)]" />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onWithdraw}
          className="flex-1 py-2 rounded-xl border border-[var(--border)] hover:bg-white/5 transition-colors text-sm"
        >
          Withdraw PT
        </button>
        <button
          onClick={onClaim}
          disabled={position.yieldAccrued <= 0}
          className="flex-1 py-2 rounded-xl btn-primary text-sm disabled:opacity-50"
        >
          Claim Yield
        </button>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  index: number;
}

export function StatCard({ title, value, change, icon, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--secondary)]">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-[var(--muted)] mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

interface YieldChartProps {
  apy: number;
  amount: number;
  days: number;
}

export function YieldChart({ apy, amount, days }: YieldChartProps) {
  const data = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const yieldValue = amount * (apy / 100) * (day / 365);
    return { day, yield: yieldValue };
  });

  const maxYield = Math.max(...data.map(d => d.yield));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Yield Projection</h3>
      <div className="h-48 flex items-end gap-1">
        {data.filter((_, i) => i % Math.max(1, Math.floor(days / 30)) === 0).map((d, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(d.yield / maxYield) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="flex-1 bg-gradient-to-t from-[var(--primary)] to-[var(--accent)] rounded-t-sm min-h-[4px]"
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
        <span>Day 1</span>
        <span>Day {Math.floor(days / 2)}</span>
        <span>Day {days}</span>
      </div>
    </div>
  );
}
