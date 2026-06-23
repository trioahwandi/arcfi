import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAppStore, formatAddress, ARC_CHAIN_ID } from '../store';

export function WalletButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const {
    walletAddress,
    walletChainId,
    walletConnecting,
    walletSwitching,
    walletError,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    switchToArcTestnet,
    setWalletError,
  } = useAppStore();

  const isConnected = isWalletConnected();
  const isOnArc = walletChainId === ARC_CHAIN_ID;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // STATE 1: Not connected
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={connectWallet}
          disabled={walletConnecting}
          className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {walletConnecting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Connecting...</>
          ) : (
            <><Wallet className="w-4 h-4" />Connect Wallet</>
          )}
        </button>
        {walletError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-64 glass-strong rounded-xl p-3 shadow-xl z-50 text-sm text-red-400"
          >
            {walletError}
            <button onClick={() => setWalletError(null)} className="ml-2 underline text-xs">Dismiss</button>
          </motion.div>
        )}
      </div>
    );
  }

  // STATE 2: Connected but wrong network (only switch if NOT on Arc Testnet)
  if (!isOnArc) {
    return (
      <div className="relative">
        <button
          onClick={switchToArcTestnet}
          disabled={walletSwitching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
        >
          {walletSwitching ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Switching...</>
          ) : (
            <><AlertCircle className="w-4 h-4" />Switch to Arc Testnet</>
          )}
        </button>
        {walletError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-72 glass-strong rounded-xl p-3 shadow-xl z-50 text-sm text-red-400"
          >
            {walletError}
            <button onClick={() => setWalletError(null)} className="ml-2 underline text-xs">Dismiss</button>
          </motion.div>
        )}
      </div>
    );
  }

  // STATE 3: Connected and on Arc Testnet
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/20 border border-[var(--primary)]/30 hover:bg-[var(--primary)]/30 transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-sm font-medium">{formatAddress(walletAddress!)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-56 glass-strong rounded-xl p-2 shadow-xl z-50"
          >
            <div className="px-3 py-2 border-b border-[var(--border)] mb-2">
              <p className="text-xs text-[var(--muted)]">Connected to Arc Testnet</p>
              <p className="text-sm font-medium">{formatAddress(walletAddress!)}</p>
            </div>
            <button onClick={handleCopy} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--muted)]" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>
            <button onClick={() => window.open(`https://testnet.arcscan.app/address/${walletAddress}`, '_blank')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              <ExternalLink className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">View on Explorer</span>
            </button>
            <div className="border-t border-[var(--border)] my-2" />
            <button onClick={() => { disconnectWallet(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left text-red-400">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Disconnect</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
