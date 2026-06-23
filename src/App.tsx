import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Vault, Wallet, PieChart, Vote, FileText, 
  Menu, X, Moon, Sun,
  TrendingUp, Activity, DollarSign, Users,
  ChevronRight, Shield, Zap
} from 'lucide-react';
import { useAppStore, formatNumber, ARC_CHAIN_ID } from './store';
import { VaultCard, DepositModal, PositionCard, StatCard } from './components';
import { WalletButton } from './components/WalletButton';
import { NetworkBanner } from './components/NetworkBanner';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'vaults', label: 'Vaults', icon: Vault },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'rewards', label: 'Rewards', icon: Zap },
  { id: 'governance', label: 'Governance', icon: Vote },
  { id: 'docs', label: 'Docs', icon: FileText },
];

export default function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const {
    vaults,
    positions,
    proposals,
    selectedVault,
    totalYieldEarned,
    walletChainId,
    isWalletConnected,
    selectVault,
    deposit,
    withdraw,
    claimYield,
    accrueYield,
    initWallet,
  } = useAppStore();

  const isConnected = isWalletConnected();
  const isOnArc = walletChainId === ARC_CHAIN_ID;

  useEffect(() => {
    initWallet();
  }, [initWallet]);

  useEffect(() => {
    if (isConnected && positions.length > 0) {
      const interval = setInterval(() => { accrueYield(); }, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected, positions.length, accrueYield]);

  const handleDeposit = (vaultId: string, amount: number) => deposit(vaultId, amount);
  const totalTvl = vaults.reduce((sum, v) => sum + v.tvl, 0);
  const avgApy = vaults.reduce((sum, v) => sum + v.apy, 0) / vaults.length;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <NetworkBanner />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center animate-pulse-glow">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ArcFi</h1>
                <p className="text-xs text-[var(--muted)] -mt-0.5">Yield Layer</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeNav === item.id ? 'bg-[var(--primary)]/20 text-[var(--secondary)]' : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                  }`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <WalletButton />
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-[var(--border)]">
              <nav className="p-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.id} onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeNav === item.id ? 'bg-[var(--primary)]/20 text-[var(--secondary)]' : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeNav === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <section className="text-center py-16">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6">
                    <Shield className="w-4 h-4 text-[var(--secondary)]" />
                    <span className="text-sm text-[var(--secondary)]">Built on Arc Testnet</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-gradient">Structured Yield</span>
                    <br />
                    <span className="text-white">Protocol on Arc</span>
                  </h1>
                  <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
                    Separate yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT).
                  </p>
                </motion.div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <button className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                    {isConnected ? 'Launch App' : 'Connect Wallet'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveNav('docs')} className="px-8 py-4 rounded-xl border border-[var(--border)] hover:bg-white/5 transition-colors text-lg font-medium">
                    Read Docs
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <StatCard title="Total Value Locked" value={`$${formatNumber(totalTvl)}`} change={12.5} icon={<DollarSign className="w-5 h-5" />} index={0} />
                  <StatCard title="Average APY" value={`${avgApy.toFixed(1)}%`} change={3.2} icon={<TrendingUp className="w-5 h-5" />} index={1} />
                  <StatCard title="Active Vaults" value={vaults.length.toString()} icon={<Vault className="w-5 h-5" />} index={2} />
                  <StatCard title="Total Users" value="2,847" change={18.3} icon={<Users className="w-5 h-5" />} index={3} />
                </div>
              </section>

              <section className="py-12">
                <h2 className="text-2xl font-bold text-center mb-8">How ArcFi Works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { step: '01', title: 'Deposit Assets', desc: 'Deposit USDC, ETH, or other supported assets.' },
                    { step: '02', title: 'Receive PT + YT', desc: 'Get Principal Tokens and Yield Tokens.' },
                    { step: '03', title: 'Trade or Hold', desc: 'Hold to maturity or trade on secondary markets.' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="glass rounded-2xl p-6 text-center card-hover">
                      <div className="text-4xl font-bold text-gradient mb-4">{item.step}</div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-[var(--muted)]">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="py-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Featured Vaults</h2>
                  <button onClick={() => setActiveNav('vaults')} className="text-sm text-[var(--secondary)] hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vaults.slice(0, 3).map((vault, i) => (
                    <motion.div key={vault.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      onClick={() => { selectVault(vault); setActiveNav('vaults'); }} className="glass rounded-2xl p-6 card-hover cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div><h3 className="font-semibold">{vault.name}</h3><p className="text-sm text-[var(--muted)]">{vault.protocol}</p></div>
                        <span className="text-2xl font-bold text-gradient">{vault.apy}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted)]">TVL: ${formatNumber(vault.tvl)}</span>
                        <span className="text-[var(--muted)]">{vault.maturityDays}d</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeNav === 'vaults' && (
            <motion.div key="vaults" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div><h1 className="text-3xl font-bold">Yield Vaults</h1><p className="text-[var(--muted)]">Deposit assets and mint PT + YT tokens</p></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vaults.map((vault, i) => (
                  <VaultCard key={vault.id} vault={vault} onClick={() => { selectVault(vault); setShowDepositModal(true); }} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {activeNav === 'portfolio' && (
            <motion.div key="portfolio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div><h1 className="text-3xl font-bold">Portfolio</h1><p className="text-[var(--muted)]">Your PT/YT positions</p></div>
              {!isConnected ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
                  <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                  <p className="text-[var(--muted)]">View your positions and track yield</p>
                </div>
              ) : !isOnArc ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-xl font-semibold mb-2">Switch to Arc Testnet</h2>
                  <p className="text-[var(--muted)]">Chain ID: 5042002</p>
                </div>
              ) : positions.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
                  <h2 className="text-xl font-semibold mb-2">No Positions</h2>
                  <button onClick={() => setActiveNav('vaults')} className="btn-primary px-6 py-3 rounded-xl font-semibold mt-4">Browse Vaults</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-4"><p className="text-xs text-[var(--muted)]">Deposited</p><p className="text-xl font-bold">${formatNumber(positions.reduce((s, p) => s + p.depositedAmount, 0))}</p></div>
                    <div className="glass rounded-xl p-4"><p className="text-xs text-[var(--muted)]">PT</p><p className="text-xl font-bold">{positions.reduce((s, p) => s + p.ptBalance, 0).toFixed(2)}</p></div>
                    <div className="glass rounded-xl p-4"><p className="text-xs text-[var(--muted)]">YT</p><p className="text-xl font-bold text-[var(--accent)]">{positions.reduce((s, p) => s + p.ytBalance, 0).toFixed(4)}</p></div>
                    <div className="glass rounded-xl p-4 bg-green-500/10"><p className="text-xs text-[var(--muted)]">Yield</p><p className="text-xl font-bold text-green-400">${formatNumber(totalYieldEarned + positions.reduce((s, p) => s + p.yieldAccrued, 0))}</p></div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {positions.map((p) => (
                      <PositionCard key={p.id} position={p} onClaim={() => claimYield(p.id)} onWithdraw={() => withdraw(p.id, p.ptBalance)} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeNav === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div><h1 className="text-3xl font-bold">Rewards</h1><p className="text-[var(--muted)]">Earn AFI tokens</p></div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Your Rewards</h2>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-xl">
                    <div><p className="text-sm text-[var(--muted)]">AFI Earned</p><p className="text-4xl font-bold text-gradient">{isConnected && isOnArc ? '1,247.82' : '0.00'}</p></div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center animate-float">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Claim</h2>
                  <div className="p-4 rounded-xl bg-[var(--surface)]"><p className="text-xs text-[var(--muted)]">Available</p><p className="text-2xl font-bold">247.50 AFI</p></div>
                  <button disabled={!isConnected || !isOnArc} className="w-full btn-primary py-3 rounded-xl font-semibold mt-4 disabled:opacity-50">Claim</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeNav === 'governance' && (
            <motion.div key="governance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div><h1 className="text-3xl font-bold">Governance</h1><p className="text-[var(--muted)]">Vote on proposals</p></div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {proposals.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : p.status === 'passed' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{p.status.toUpperCase()}</span>
                      <h3 className="text-lg font-semibold mt-2">{p.title}</h3>
                      <p className="text-sm text-[var(--muted)] mb-4">{p.description}</p>
                      <div className="flex justify-between text-sm"><span className="text-green-400">For: {formatNumber(p.votesFor)}</span><span className="text-red-400">Against: {formatNumber(p.votesAgainst)}</span></div>
                    </motion.div>
                  ))}
                </div>
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Voting Power</h2>
                  <p className="text-3xl font-bold text-gradient text-center py-4">{isConnected && isOnArc ? '1,247.82' : '0.00'}</p>
                  <p className="text-sm text-[var(--muted)] text-center">vAFI</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeNav === 'docs' && (
            <motion.div key="docs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div><h1 className="text-3xl font-bold">Documentation</h1><p className="text-[var(--muted)]">Learn how ArcFi works</p></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Getting Started', desc: 'Quick start guide', icon: Activity },
                  { title: 'PT/YT Mechanics', desc: 'Token mechanics', icon: PieChart },
                  { title: 'Vault Strategies', desc: 'Yield strategies', icon: TrendingUp },
                  { title: 'Smart Contracts', desc: 'Contract architecture', icon: Shield },
                  { title: 'Governance', desc: 'Voting mechanics', icon: Vote },
                  { title: 'FAQ', desc: 'Common questions', icon: FileText },
                ].map((doc, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6 card-hover cursor-pointer group">
                    <doc.icon className="w-8 h-8 text-[var(--secondary)] mb-4" />
                    <h3 className="font-semibold group-hover:text-[var(--secondary)]">{doc.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{doc.desc}</p>
                  </motion.div>
                ))}
              </div>
              <div className="glass rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-4">Arc Testnet (Chain ID: 5042002)</h2>
                <div className="space-y-3">
                  {[
                    { name: 'RPC', value: 'https://rpc.testnet.arc.network' },
                    { name: 'Explorer', value: 'https://testnet.arcscan.app' },
                    { name: 'Chain ID', value: '5042002 (0x4D59E6)' },
                  ].map((c, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-xl bg-[var(--surface)]">
                      <span className="text-sm font-medium">{c.name}</span>
                      <code className="text-xs text-[var(--muted)]">{c.value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showDepositModal && selectedVault && (
          <DepositModal vault={selectedVault} onClose={() => { setShowDepositModal(false); selectVault(null); }} onDeposit={(amt) => handleDeposit(selectedVault.id, amt)} />
        )}
      </AnimatePresence>

      <footer className="border-t border-[var(--border)] mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">ArcFi</span>
              </div>
              <p className="text-sm text-[var(--muted)]">Structured yield protocol on Arc Testnet.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="https://docs.arc.io/" className="hover:text-white">Arc Docs</a></li>
                <li><a href="https://testnet.arcscan.app" className="hover:text-white">Explorer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="https://x.com/arc" className="hover:text-white">X (Twitter)</a></li>
                <li><span className="hover:text-white cursor-pointer">Discord</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="https://docs.arc.io/terms" className="hover:text-white">Terms</a></li>
                <li><a href="https://www.circle.com/legal/privacy-policy" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-8 text-center">
            <p className="text-sm text-[var(--muted)]">Built on Arc Testnet (Chain ID: 5042002)</p>
            <p className="text-xs text-[var(--muted)] mt-2">ArcFi is an independent community project. Not affiliated with Arc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
