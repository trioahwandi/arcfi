import { useCallback, useEffect, useState } from 'react';
import { ARC_CHAIN_ID, ARC_CHAIN_ID_HEX } from '../config/wagmi';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useArcWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only consider connected if we have BOTH address AND chainId
  // This prevents false positives during initial load
  const isConnected = !!(address && chainId !== null);
  const isArcTestnet = chainId === ARC_CHAIN_ID;

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const chain = await window.ethereum.request({ method: 'eth_chainId' });
          
          // Only set address if we have both accounts AND chain
          if (accounts.length > 0 && chain) {
            setAddress(accounts[0]);
            setChainId(parseInt(chain, 16));
          }
        } catch (e) {
          // Ignore errors on initial check
          console.log('Initial wallet check:', e);
        }
      }
      // Mark as initialized after first check
      setIsInitialized(true);
    };
    
    checkConnection();

    // Listen for account and chain changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
          setChainId(null);
        }
      };

      const handleChainChanged = (chain: string) => {
        setChainId(parseInt(chain, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    } else {
      // No ethereum provider, mark as initialized
      setIsInitialized(true);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask or another Web3 wallet.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0 && chain) {
        setAddress(accounts[0]);
        setChainId(parseInt(chain, 16));
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  const switchToArcTestnet = useCallback(async () => {
    if (!window.ethereum) {
      setError('No wallet detected');
      return;
    }

    setError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_CHAIN_ID_HEX }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ARC_CHAIN_ID_HEX,
              chainName: 'Arc Testnet',
              nativeCurrency: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
              },
              rpcUrls: ['https://rpc.testnet.arc.network'],
              blockExplorerUrls: ['https://testnet.arcscan.app'],
            }],
          });
        } catch (addError: any) {
          setError(addError.message || 'Failed to add Arc Testnet');
        }
      } else {
        setError(err.message || 'Failed to switch network');
      }
    }
  }, []);

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    // State
    address,
    chainId,
    isConnected,
    isConnecting,
    isInitialized,
    isArcTestnet,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToArcTestnet,
    setError,
    
    // Helpers
    formatAddress,
  };
}