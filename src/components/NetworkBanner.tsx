import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore, ARC_CHAIN_ID } from '../store';

export function NetworkBanner() {
  const {
    walletChainId,
    walletSwitching,
    walletError,
    isWalletConnected,
    switchToArcTestnet,
    setWalletError,
  } = useAppStore();

  const isConnected = isWalletConnected();
  const isOnArc = walletChainId === ARC_CHAIN_ID;

  // Only show if CONNECTED and NOT on Arc Testnet
  if (!isConnected || isOnArc) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Wrong Network</p>
            <p className="text-xs text-yellow-400/70">Switch to Arc Testnet (Chain ID: 5042002)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={switchToArcTestnet}
            disabled={walletSwitching}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {walletSwitching ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Switching...</>
            ) : (
              <>Switch Network<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          {walletError && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">{walletError}</span>
              <button onClick={() => setWalletError(null)} className="text-xs text-red-300 underline">Dismiss</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}