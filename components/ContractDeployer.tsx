'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  FileCode2,
  Wallet,
  ExternalLink,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  Hash,
  Clock,
  Box,
  Share2,
  User,
  Plus,
  Sparkles,
  Trophy,
  Crown,
  Rocket,
  Gem,
  Star
} from 'lucide-react';
import { sdk } from '@farcaster/miniapp-sdk';

// Type for Farcaster user context
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

// Type for deployed contract history
interface DeployedContract {
  address: string;
  contractType: string;
  contractName: string;
  txHash: string;
  timestamp: number;
  inputValue?: string;
}

// REAL CONTRACT TEMPLATES - Compiled with Solidity 0.8.19 via Hardhat
const CONTRACT_TEMPLATES = {
  string: {
    name: "String Storage",
    description: "Store and retrieve a string value",
    bytecode: "0x608060405234801561001057600080fd5b5060405161041238038061041283398101604081905261002f91610058565b600061003b82826101aa565b5050610269565b634e487b7160e01b600052604160045260246000fd5b6000602080838503121561006b57600080fd5b82516001600160401b038082111561008257600080fd5b818501915085601f83011261009657600080fd5b8151818111156100a8576100a8610042565b604051601f8201601f19908116603f011681019083821181831017156100d0576100d0610042565b8160405282815288868487010111156100e857600080fd5b600093505b8284101561010a57848401860151818501870152928501926100ed565b600086848301015280965050505050505092915050565b600181811c9082168061013557607f821691505b60208210810361015557634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156101a557600081815260208120601f850160051c810160208610156101825750805b601f850160051c820191505b818110156101a15782815560010161018e565b5050505b505050565b81516001600160401b038111156101c3576101c3610042565b6101d7816101d18454610121565b8461015b565b602080601f83116001811461020c57600084156101f45750858301515b600019600386901b1c1916600185901b1785556101a1565b600085815260208120601f198616915b8281101561023b5788860151825594840194600190910190840161021c565b50858210156102595787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61019a806102786000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80633fa4f24514610030575b600080fd5b61003861004e565b60405161004591906100dc565b60405180910390f35b6000805461005b9061012a565b80601f01602080910402602001604051908101604052809291908181526020018280546100879061012a565b80156100d45780601f106100a9576101008083540402835291602001916100d4565b820191906000526020600020905b8154815290600101906020018083116100b757829003601f168201915b505050505081565b600060208083528351808285015260005b81811015610109578581018301518582016040015282016100ed565b506000604082860101526040601f19601f8301168501019250505092915050565b600181811c9082168061013e57607f821691505b60208210810361015e57634e487b7160e01b600052602260045260246000fd5b5091905056fea26469706673582212201896186d8023c8890809ba2e34d529de3be16e577695c0d06d7912de42e0a71c64736f6c63430008130033",
    abi: [
      {
        "inputs": [{"internalType": "string", "name": "_value", "type": "string"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "value",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "string",
    inputLabel: "Initial String Value",
    inputPlaceholder: "Enter a string to store...",
    icon: FileCode2
  },
  calculator: {
    name: "Calculator",
    description: "Store a number and perform arithmetic",
    bytecode: "0x608060405234801561001057600080fd5b506040516101dc3803806101dc83398101604081905261002f91610037565b600055610050565b60006020828403121561004957600080fd5b5051919050565b61017d8061005f6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063165c4a16146100515780633ef5e445146100765780636537214714610089578063771602f714610092575b600080fd5b61006461005f3660046100d2565b6100a5565b60405190815260200160405180910390f35b6100646100843660046100d2565b6100ba565b61006460005481565b6100646100a03660046100d2565b6100c6565b60006100b1828461010a565b90505b92915050565b60006100b18284610121565b60006100b18284610134565b600080604083850312156100e557600080fd5b50508035926020909101359150565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176100b4576100b46100f4565b818103818111156100b4576100b46100f4565b808201808211156100b4576100b46100f456fea2646970667358221220363dc859aae181dcf18cff8e03199d10b99a6dd9da525db9313bf2bc1d51b12f64736f6c63430008130033",
    abi: [
      {
        "inputs": [{"internalType": "uint256", "name": "_initial", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "result",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "a", "type": "uint256"},
          {"internalType": "uint256", "name": "b", "type": "uint256"}
        ],
        "name": "add",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "a", "type": "uint256"},
          {"internalType": "uint256", "name": "b", "type": "uint256"}
        ],
        "name": "subtract",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "a", "type": "uint256"},
          {"internalType": "uint256", "name": "b", "type": "uint256"}
        ],
        "name": "multiply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
      }
    ],
    hasInput: true,
    inputType: "number",
    inputLabel: "Initial Number",
    inputPlaceholder: "Enter initial value (e.g. 100)",
    icon: Hash
  },
  counter: {
    name: "Simple Counter",
    description: "A counter starting at zero",
    bytecode: "0x608060405234801561001057600080fd5b5060c98061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd146037578063d09de08a146051575b600080fd5b603f60005481565b60405190815260200160405180910390f35b60576059565b005b600080549080606683606d565b9190505550565b600060018201608c57634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220a02110a9a84ab223d1690a10c39cb0c3bca1e90e51d76ed4e57cbeca5e4c8c5264736f6c63430008130033",
    abi: [
      {
        "inputs": [],
        "name": "count",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "increment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    hasInput: false,
    icon: Zap
  }
};

const STORAGE_KEY = 'base-deployer-contracts';
const SHOW_HISTORY_KEY = 'base-deployer-show-history';
const ACHIEVEMENTS_KEY = 'base-deployer-achievements';
const REFERRAL_KEY = 'base-deployer-referral';

// Achievement system
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  milestone: number;
  unlocked: boolean;
  unlockedAt?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First Deploy', description: 'Deploy your first contract', icon: Sparkles, milestone: 1, unlocked: false },
  { id: 'five', name: 'Power User', description: 'Deploy 5 contracts', icon: Zap, milestone: 5, unlocked: false },
  { id: 'ten', name: 'Contract Master', description: 'Deploy 10 contracts', icon: Trophy, milestone: 10, unlocked: false },
  { id: 'twenty', name: 'Deployment Legend', description: 'Deploy 20 contracts', icon: Crown, milestone: 20, unlocked: false },
  { id: 'fifty', name: 'Base Builder', description: 'Deploy 50 contracts', icon: Rocket, milestone: 50, unlocked: false },
  { id: 'hundred', name: 'Contract Deity', description: 'Deploy 100 contracts', icon: Gem, milestone: 100, unlocked: false },
];

function ContractDeployer() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<keyof typeof CONTRACT_TEMPLATES>('string');
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'farcaster' | 'external' | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isAppAdded, setIsAppAdded] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Load deployed contracts, achievements, and referral code from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load achievements FIRST (before checking)
      const achievementsStored = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (achievementsStored) {
        try {
          const loadedAchievements = JSON.parse(achievementsStored);
          setAchievements(loadedAchievements);
        } catch (e) {
          console.error('Failed to parse achievements:', e);
        }
      }
      
      // Load contracts
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const contracts = JSON.parse(stored);
          setDeployedContracts(contracts);
          // Don't check achievements on page load - only when new contract is deployed
        } catch (e) {
          console.error('Failed to parse stored contracts:', e);
        }
      }
      // Load show history preference
      const showHistoryStored = localStorage.getItem(SHOW_HISTORY_KEY);
      if (showHistoryStored !== null) {
        setShowHistory(showHistoryStored === 'true');
      }
      // Load referral code
      const referralStored = localStorage.getItem(REFERRAL_KEY);
      if (referralStored) {
        setReferralCode(referralStored);
      }
      // Check for referral in URL
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref && !referralStored) {
        // Track referral (could send to analytics/backend)
        console.log('Referred by:', ref);
      }
    }
  }, [farcasterUser?.fid]);

  // Check and unlock achievements (only show popup for newly unlocked)
  const checkAchievements = (count: number, showPopup: boolean = true) => {
    try {
      setAchievements(currentAchievements => {
        const updated = currentAchievements.map(achievement => {
          if (!achievement.unlocked && count >= achievement.milestone) {
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: Date.now()
            };
          }
          return achievement;
        });
        
        // Only show popup if this is a new unlock (not on page load)
        if (showPopup) {
          const newlyUnlocked = updated.find(a => 
            a.unlocked && 
            !currentAchievements.find(oldA => oldA.id === a.id && oldA.unlocked)
          );
          
          if (newlyUnlocked) {
            // Use setTimeout to ensure state is updated
            setTimeout(() => {
              setNewAchievement(newlyUnlocked);
              // Auto-hide after 1.5 seconds with fade out
              setTimeout(() => {
                setNewAchievement(null);
              }, 1500);
            }, 100);
          }
        }
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save achievements:', e);
          }
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Error checking achievements:', error);
      // Don't crash the app - just log the error
    }
  };

  // Toggle show history and save to localStorage
  const toggleShowHistory = () => {
    const newValue = !showHistory;
    setShowHistory(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHOW_HISTORY_KEY, String(newValue));
    }
  };

  // Save deployed contracts to localStorage
  const saveContract = (contract: DeployedContract) => {
    const updated = [contract, ...deployedContracts];
    setDeployedContracts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Check for new achievements
      checkAchievements(updated.length);
    }
  };

  const removeContract = (address: string) => {
    const updated = deployedContracts.filter(c => c.address !== address);
    setDeployedContracts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    // Get Farcaster context (ready() is called at page level)
    const initSDK = async () => {
      setSdkReady(true);
      
      // Try to get user context from Farcaster
      try {
        const context = await sdk.context;
        console.log('Farcaster context:', context);
        
        if (context?.user) {
          setIsInFarcaster(true);
          const user = {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl
          };
          setFarcasterUser(user);
          console.log('Farcaster user:', context.user);
          
          // Generate referral code if not exists
          if (typeof window !== 'undefined') {
            const referralStored = localStorage.getItem(REFERRAL_KEY);
            if (!referralStored && user.fid) {
              const code = `ref-${user.fid}`;
              setReferralCode(code);
              localStorage.setItem(REFERRAL_KEY, code);
            }
          }
        }
        
        // Check if app is already added
        if (context?.client?.added) {
          setIsAppAdded(true);
        }
      } catch (contextError) {
        console.log('Farcaster context error (normal outside Farcaster):', contextError);
        setIsInFarcaster(false);
      }
    };

    initSDK();
    
    return () => {
      if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const chain = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chain);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  const getProvider = () => {
    if (walletType === 'farcaster' && sdk?.wallet?.ethProvider) {
      return sdk.wallet.ethProvider;
    }
    return window.ethereum;
  };

  const switchToBase = async () => {
    const provider = getProvider();
    if (!provider) return false;
    const BASE_MAINNET_CHAIN_ID = '0x2105';
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_MAINNET_CHAIN_ID }],
      });
      setChainId(BASE_MAINNET_CHAIN_ID);
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          if (!provider) throw new Error('Wallet not available');
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_MAINNET_CHAIN_ID,
              chainName: 'Base',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
          setChainId(BASE_MAINNET_CHAIN_ID);
          return true;
        } catch (addError) {
          throw new Error('Failed to add Base network');
        }
      }
      throw switchError;
    }
  };

  const connectFarcasterWallet = async () => {
    try {
      setError(null);
      
      if (!sdk || !sdk.wallet) {
        setError('Farcaster wallet not available');
        return;
      }

      // Connect using Farcaster's ethProvider
      const ethProvider = sdk.wallet.ethProvider;
      
      if (!ethProvider) {
        setError('Farcaster wallet provider not available');
        return;
      }

      const accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setWalletType('farcaster');
        
        const chain = await ethProvider.request({ method: 'eth_chainId' });
        setChainId(chain);
        
        if (chain !== '0x2105') {
          try {
            await ethProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }],
            });
            setChainId('0x2105');
          } catch (switchErr: any) {
            if (switchErr.code === 4902) {
              await ethProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105',
                  chainName: 'Base',
                  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org']
                }]
              });
              setChainId('0x2105');
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Farcaster wallet error:', err);
      setError(err.message || 'Failed to connect Farcaster wallet');
    }
  };

  const connectExternalWallet = async () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask or a Web3 wallet');
      return;
    }

    try {
      setError(null);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setWalletType('external');
      
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chain);
      
      // Set up listeners for external wallet
      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
      
      if (chain !== '0x2105') {
        await switchToBase();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setWalletType(null);
    setError(null);
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Use public RPC to fetch receipt - more reliable than wallet provider
  const fetchReceiptFromRPC = async (txHash: string): Promise<any> => {
    const response = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      })
    });
    const data = await response.json();
    return data.result;
  };

  const encodeConstructorParams = (template: typeof CONTRACT_TEMPLATES[keyof typeof CONTRACT_TEMPLATES], value: string): string => {
    if (!template.hasInput || !value) return '';
    
    const inputType = 'inputType' in template ? template.inputType : undefined;
    if (inputType === 'string') {
      const utf8Bytes = new TextEncoder().encode(value);
      const hex = Array.from(utf8Bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const length = utf8Bytes.length.toString(16).padStart(64, '0');
      const paddedHex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
      return '0000000000000000000000000000000000000000000000000000000000000020' + length + paddedHex;
    } else if (inputType === 'number') {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) throw new Error('Invalid number');
      return num.toString(16).padStart(64, '0');
    }
    return '';
  };

  const deployContract = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    const provider = getProvider();
    if (!provider) {
      setError('No wallet provider available');
      return;
    }

    if (chainId !== '0x2105') {
      try {
        await switchToBase();
      } catch (err) {
        setError('Please switch to Base Mainnet');
        return;
      }
    }

    const template = CONTRACT_TEMPLATES[selectedContract];
    
    if (template.hasInput && !inputValue.trim()) {
      const inputType = 'inputType' in template ? template.inputType : 'value';
      setError(`Please enter a ${inputType === 'string' ? 'string value' : 'number'}`);
      return;
    }

    setDeploying(true);
    setError(null);
    setDeployedAddress(null);
    setTxHash(null);

    try {
      let bytecode = template.bytecode;
      if (!bytecode.startsWith('0x')) {
        bytecode = '0x' + bytecode;
      }
      
      let deploymentData = bytecode;
      
      if (template.hasInput && inputValue.trim()) {
        try {
          const encodedParams = encodeConstructorParams(template, inputValue);
          const bytecodeWithoutPrefix = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
          deploymentData = '0x' + bytecodeWithoutPrefix + encodedParams;
        } catch (encodeError: any) {
          setError(`Failed to encode parameters: ${encodeError.message}`);
          setDeploying(false);
          return;
        }
      }

      let gasEstimate: string;
      try {
        const estimatedGas = await provider.request({
          method: 'eth_estimateGas',
          params: [{ from: account as `0x${string}`, data: deploymentData as `0x${string}` }]
        });
        const gasWithBuffer = Math.floor(parseInt(estimatedGas, 16) * 1.2);
        gasEstimate = '0x' + gasWithBuffer.toString(16);
      } catch (err) {
        gasEstimate = '0x200000';
      }
      
      const isCoinbaseWallet = walletType === 'external' && window.ethereum && 
                               (window.ethereum.isCoinbaseWallet || (window.ethereum as any).isCoinbaseWallet);
      
      // For contract deployment, we need to handle 'to' field carefully
      // The Farcaster wallet calls eth_createAccessList internally and adds 'to: ""' if missing
      // Setting it to null might help, but some RPCs reject null. Let's try omitting it first.
      // If that fails, the wallet will add it, and we might need to work around at RPC level
      const txParams: any = {
        from: account as `0x${string}`,
        data: deploymentData as `0x${string}`,
        gas: gasEstimate,
        value: '0x0'
        // 'to' field intentionally omitted - wallet may add it as "", but RPC should handle contract creation
      };
      
      if (isCoinbaseWallet) {
        txParams.type = '0x2';
      }
      
      // Workaround: For Farcaster wallet, it calls eth_createAccessList internally
      // and adds 'to: ""' which causes RPC errors. We can't prevent this, but
      // we can try to ensure our params are as clean as possible.
      // The wallet will still add 'to: ""' during validation, which is a wallet bug.
      // This might require a fix from Farcaster team or using a different RPC endpoint.
      
      // Ensure 'to' is never in the object before sending
      if ('to' in txParams) {
        delete txParams.to;
      }
      
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      setTxHash(hash);

      // Poll for receipt using public RPC (more reliable than wallet provider)
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 90; // 3 minutes max
      
      while (!receipt && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          // Use public RPC endpoint instead of wallet provider for reliable receipt fetching
          receipt = await fetchReceiptFromRPC(hash);
          if (receipt) {
            console.log('Receipt found:', receipt);
          }
        } catch (err) {
          console.error('Error fetching receipt:', err);
        }
        attempts++;
      }

      if (receipt) {
        const status = receipt.status;
        const contractAddress = receipt.contractAddress;
        
        // Check for successful status (handle both hex string and number formats)
        const isSuccess = status === '0x1' || status === '0x01' || status === 1 || status === true;
        const isFailed = status === '0x0' || status === '0x00' || status === 0 || status === false;
        
        if (isSuccess) {
          if (contractAddress && contractAddress !== '0x' && contractAddress !== '0x0000000000000000000000000000000000000000') {
            setDeployedAddress(contractAddress);
            
            // Save to history
            saveContract({
              address: contractAddress,
              contractType: selectedContract,
              contractName: template.name,
              txHash: hash,
              timestamp: Date.now(),
              inputValue: inputValue || undefined
            });
            
            setInputValue('');
          } else {
            // Transaction succeeded but no contract address - likely account abstraction
            // Try to get more info from the transaction
            try {
              const txResponse = await fetch('https://mainnet.base.org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionByHash',
                  params: [hash],
                  id: 1
                })
              });
              const txData = await txResponse.json();
              const tx = txData.result;
              
              if (tx && tx.to === null) {
                setError(`Transaction succeeded but contract address not in receipt. Check BaseScan: https://basescan.org/tx/${hash}`);
              } else {
                const bundlerAddress = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
                if (tx?.to?.toLowerCase() === bundlerAddress.toLowerCase()) {
                  setError(
                    `Account Abstraction Detected: Transaction routed to bundler. ` +
                    `Disable account abstraction in wallet settings or use MetaMask. ` +
                    `Check BaseScan: https://basescan.org/tx/${hash}`
                  );
                } else {
                  setError(`Transaction sent to ${tx?.to}, not contract creation. Check BaseScan: https://basescan.org/tx/${hash}`);
                }
              }
            } catch (txErr) {
              setError(`Contract address not found. Check BaseScan: https://basescan.org/tx/${hash}`);
            }
          }
        } else if (isFailed) {
          setError(`Transaction failed. Check BaseScan: https://basescan.org/tx/${hash}`);
        } else {
          setError(`Unknown status (${status}). Check BaseScan: https://basescan.org/tx/${hash}`);
        }
      } else {
        setError(`Transaction still pending after timeout. Check BaseScan: https://basescan.org/tx/${hash}`);
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        setError('Transaction cancelled');
      } else {
        setError(err.message || 'Deployment failed');
      }
    } finally {
      setDeploying(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get achievement badges for share (using names instead of emojis)
  const getAchievementBadges = (): string => {
    const unlocked = achievements.filter(a => a.unlocked);
    if (unlocked.length === 0) return '';
    const top3 = unlocked.slice(-3).reverse(); // Get latest 3
    return top3.map(a => a.name).join(' • ');
  };

  // Get share message with achievements
  const getShareMessage = (): string => {
    const contractCount = deployedContracts.length;
    const badges = getAchievementBadges();
    const refParam = referralCode ? `?ref=${referralCode}` : '';
    const appUrl = typeof window !== 'undefined' ? `${window.location.origin}${refParam}` : '';
    
    if (contractCount === 0) {
      return `Deploy contracts on Base in zip zap! 🚀 One tap, instant deploy!\n\n${appUrl}`;
    }
    
    const latestAchievement = achievements.filter(a => a.unlocked).pop();
    const achievementText = latestAchievement 
      ? `\n\nJust unlocked: ${latestAchievement.name}! 🚀`
      : '';
    
    return `I've deployed ${contractCount} contract${contractCount > 1 ? 's' : ''} on Base! ${badges}\n\nDeploy smart contracts in zip zap - no code needed!${achievementText}\n\n${appUrl}`;
  };

  // Share the app via Farcaster
  const shareApp = async () => {
    try {
      if (sdk?.actions?.composeCast) {
        const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const shareText = getShareMessage();
        
        await sdk.actions.composeCast({
          text: shareText,
          embeds: [appUrl]
        });
      } else {
        // Fallback for non-Farcaster environments
        if (navigator.share) {
          await navigator.share({
            title: '1-Tap Contract Deployer',
            text: getShareMessage(),
            url: window.location.href
          });
        } else {
          // Copy link to clipboard
          const shareText = getShareMessage();
          await navigator.clipboard.writeText(shareText);
          setError('Share text copied to clipboard!');
          setTimeout(() => setError(null), 2000);
        }
      }
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  // Add app to user's Farcaster client
  const addApp = async () => {
    try {
      if (sdk?.actions?.addMiniApp) {
        await sdk.actions.addMiniApp();
        setIsAppAdded(true);
      }
    } catch (err) {
      console.log('Add app error:', err);
    }
  };

  const isExternalCoinbaseWallet = typeof window !== 'undefined' && window.ethereum && 
    walletType === 'external' && (window.ethereum.isCoinbaseWallet || (window.ethereum as any).isCoinbaseWallet);

  return (
    <div className="min-h-screen bg-[var(--paper)] pencil-sketch-bg p-4">
      <div className="max-w-xl mx-auto pt-6 pb-12">
        
        {/* Achievement Celebration Modal - Subtle with Error Handling */}
        {newAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 pointer-events-none">
            <div className="bg-[var(--paper)] border-2 border-[var(--ink)] p-6 max-w-xs w-full text-center animate-fade-in">
              {(() => {
                try {
                  const Icon = newAchievement.icon;
                  if (Icon && typeof Icon === 'function') {
                    return <Icon className="w-12 h-12 mx-auto mb-3 text-[var(--ink)]" strokeWidth={2} />;
                  }
                  return <div className="w-12 h-12 mx-auto mb-3 text-[var(--ink)] text-2xl">✓</div>;
                } catch (error) {
                  console.error('Error rendering achievement icon:', error);
                  return <div className="w-12 h-12 mx-auto mb-3 text-[var(--ink)] text-2xl">✓</div>;
                }
              })()}
              <h3 className="text-lg font-bold text-[var(--ink)] mb-1">
                {newAchievement?.name || 'Achievement Unlocked'}
              </h3>
              <p className="text-sm text-[var(--graphite)]">
                {newAchievement?.description || ''}
              </p>
            </div>
          </div>
        )}

        {/* Top Bar - User Profile & Actions */}
        <div className="flex items-center justify-between mb-6">
          {/* Left side - Share & Add buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={shareApp}
              className="p-2 border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--light)] transition-colors"
              title="Share app"
            >
              <Share2 className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            </button>
            {isInFarcaster && !isAppAdded && (
              <button
                onClick={addApp}
                className="p-2 border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--light)] transition-colors"
                title="Add to your apps"
              >
                <Plus className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Right side - User Profile */}
          {farcasterUser && (
            <div className="flex items-center gap-3 px-3 py-2 border-2 border-[var(--ink)] bg-[var(--paper)]">
              {farcasterUser.pfpUrl ? (
                <img 
                  src={farcasterUser.pfpUrl} 
                  alt={farcasterUser.displayName || farcasterUser.username || 'User'}
                  className="w-8 h-8 rounded-full border border-[var(--ink)]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-[var(--ink)] bg-[var(--light)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--ink)] leading-tight">
                  {farcasterUser.displayName || farcasterUser.username || 'User'}
                </p>
                <p className="text-xs text-[var(--graphite)]">
                  @{farcasterUser.username || `fid:${farcasterUser.fid}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-2 border-[var(--ink)] rounded-full bg-[var(--ink)]">
            <span className="text-3xl font-black text-[var(--paper)]">B</span>
          </div>
          <h1 className="google-sans-title text-4xl mb-2">
            Base Deployer
          </h1>
          <p className="text-[var(--graphite)] text-lg font-medium tracking-wide">
            Deploy smart contracts with one tap
          </p>
        </header>

        {/* Main Card */}
        <div className="sketch-card p-6 mb-6">
          
          {/* Mainnet Notice */}
          <div className="flex items-start gap-3 p-4 mb-6 border-2 border-dashed border-[var(--pencil)] bg-[var(--highlight)]">
            <AlertTriangle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="font-bold text-[var(--ink)] text-sm tracking-wide uppercase">Mainnet Deployment</p>
              <p className="text-[var(--graphite)] text-sm mt-1">
                Deploys to Base mainnet. Real ETH required for gas.
              </p>
            </div>
          </div>

          {/* Coinbase Wallet Notice */}
          {account && isExternalCoinbaseWallet && (
            <div className="flex items-start gap-3 p-4 mb-6 border-2 border-[var(--pencil)] bg-[var(--light)]">
              <AlertCircle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="font-bold text-[var(--ink)] text-sm tracking-wide uppercase">Coinbase Wallet</p>
                <p className="text-[var(--graphite)] text-sm mt-1">
                  Account abstraction may interfere. Use MetaMask if deployment fails.
                </p>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <div className="mb-6">
            {!account ? (
              <div className="space-y-3">
                {/* Primary: Farcaster Wallet */}
                <button
                  onClick={connectFarcasterWallet}
                  className="ink-button w-full py-4 px-6 flex items-center justify-center gap-3 text-lg"
                >
                  <Wallet className="w-5 h-5" strokeWidth={2} />
                  Connect Farcaster Wallet
                </button>
                
                {/* Secondary: External Wallet */}
                <button
                  onClick={connectExternalWallet}
                  className="ink-button-outline w-full py-3 px-6 flex items-center justify-center gap-3 text-sm"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                  Use External Wallet
                </button>
              </div>
            ) : (
              <div className="p-4 border-2 border-[var(--ink)] bg-[var(--paper)]">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-3 h-3 bg-[var(--ink)] rounded-full pulse-ring flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-[var(--ink)] whitespace-nowrap">
                          {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                        <span className="text-xs text-[var(--graphite)] whitespace-nowrap">
                          ({walletType === 'farcaster' ? 'Farcaster' : 'External'})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {chainId !== '0x2105' && (
                      <button
                        onClick={switchToBase}
                        className="ink-button-outline px-3 py-1.5 text-xs whitespace-nowrap"
                      >
                        Switch to Base
                      </button>
                    )}
                    <button
                      onClick={disconnectWallet}
                      className="px-3 py-1.5 text-xs text-[var(--graphite)] hover:text-[var(--ink)] transition-colors whitespace-nowrap"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contract Selection */}
          <div className="mb-6">
            <p className="block text-sm font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
              Select Contract
            </p>
            <div className="space-y-3">
              {Object.entries(CONTRACT_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon;
                const isSelected = selectedContract === key;
                const handleSelect = () => {
                  setSelectedContract(key as keyof typeof CONTRACT_TEMPLATES);
                  setInputValue('');
                  setError(null);
                };
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleSelect}
                    className={`
                      w-full p-4 text-left transition-all border-2
                      ${isSelected 
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' 
                        : 'border-[var(--pencil)] bg-[var(--paper)] hover:border-[var(--ink)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isSelected 
                            ? 'border-[var(--paper)] bg-[var(--paper)]' 
                            : 'border-[var(--ink)] bg-transparent'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[var(--ink)]" />
                        )}
                      </div>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base ${isSelected ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`}>
                          {template.name}
                        </h3>
                        <p className={`text-sm mt-0.5 ${isSelected ? 'text-[var(--light)]' : 'text-[var(--graphite)]'}`}>
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Field */}
          {CONTRACT_TEMPLATES[selectedContract].hasInput && 'inputLabel' in CONTRACT_TEMPLATES[selectedContract] && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-[var(--ink)] mb-2 uppercase tracking-wider">
                {'inputLabel' in CONTRACT_TEMPLATES[selectedContract] ? String(CONTRACT_TEMPLATES[selectedContract].inputLabel) : ''}
              </label>
              <input
                type={'inputType' in CONTRACT_TEMPLATES[selectedContract] && CONTRACT_TEMPLATES[selectedContract].inputType === 'number' ? 'number' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={'inputPlaceholder' in CONTRACT_TEMPLATES[selectedContract] ? String(CONTRACT_TEMPLATES[selectedContract].inputPlaceholder || '') : ''}
                className="sketch-input w-full px-4 py-3"
                min={'inputType' in CONTRACT_TEMPLATES[selectedContract] && CONTRACT_TEMPLATES[selectedContract].inputType === 'number' ? '0' : undefined}
              />
            </div>
          )}

          {/* Deploy Button */}
          <button
            onClick={deployContract}
            disabled={!account || deploying || chainId !== '0x2105'}
            className="ink-button w-full py-4 px-6 text-lg"
          >
            {deploying ? (
              <span className="flex items-center justify-center gap-3">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </span>
            ) : chainId !== '0x2105' ? (
              'Switch to Base'
            ) : (
              'Deploy Contract'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 border-2 border-[var(--ink)] bg-[var(--paper)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-[var(--ink)]">{error}</p>
              </div>
            </div>
          )}

          {/* Transaction Pending */}
          {txHash && !deployedAddress && !error && (
            <div className="mt-4 p-4 border-2 border-dashed border-[var(--pencil)] bg-[var(--highlight)]">
              <p className="font-bold text-[var(--ink)] text-sm uppercase tracking-wide mb-2">Transaction Submitted</p>
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sketch-link text-sm inline-flex items-center gap-2"
              >
                View on BaseScan
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </a>
            </div>
          )}

          {/* Success Message */}
          {deployedAddress && (
            <div className="mt-4 p-4 border-2 border-[var(--ink)] bg-[var(--paper)]">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
                <p className="font-bold text-[var(--ink)] text-sm uppercase tracking-wide">Deployed Successfully</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[var(--light)] border border-[var(--pencil)]">
                <code className="flex-1 text-xs font-mono text-[var(--ink)] break-all">
                  {deployedAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(deployedAddress)}
                  className="p-2 hover:bg-[var(--highlight)] transition-colors"
                  title="Copy address"
                >
                  {copiedAddress === deployedAddress ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                  )}
                </button>
              </div>
              <a
                href={`https://basescan.org/address/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sketch-link text-sm inline-flex items-center gap-2 mt-3"
              >
                View on BaseScan
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </a>
            </div>
          )}
        </div>

        {/* Contracts Deployed Section */}
        <div className="sketch-card">
          <button
            onClick={toggleShowHistory}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
              <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-sm">
                Contracts Deployed
              </span>
              {deployedContracts.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[var(--ink)] text-[var(--paper)]">
                  {deployedContracts.length}
                </span>
              )}
            </div>
            {showHistory ? (
              <ChevronUp className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--ink)]" strokeWidth={2} />
            )}
          </button>
          
          {showHistory && (
            <div className="border-t-2 border-[var(--ink)]">
              {deployedContracts.length === 0 ? (
                <div className="p-6 text-center">
                  <FileCode2 className="w-8 h-8 text-[var(--shade)] mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[var(--graphite)] text-sm">No contracts deployed yet</p>
                </div>
              ) : (
                <div className={`divide-y-2 divide-[var(--light)] ${deployedContracts.length > 5 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
                  {deployedContracts.map((contract, index) => {
                    const template = CONTRACT_TEMPLATES[contract.contractType as keyof typeof CONTRACT_TEMPLATES];
                    const Icon = template?.icon || FileCode2;
                    return (
                      <div 
                        key={contract.address} 
                        className={`p-4 animate-slide-in stagger-${Math.min(index + 1, 3)}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Icon className="w-5 h-5 text-[var(--ink)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-[var(--ink)] text-sm">
                                  {contract.contractName}
                                </span>
                                <span className="text-xs text-[var(--shade)]">
                                  {formatDate(contract.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-[var(--graphite)] truncate">
                                  {contract.address}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(contract.address)}
                                  className="p-1 hover:bg-[var(--light)] transition-colors flex-shrink-0"
                                >
                                  {copiedAddress === contract.address ? (
                                    <CheckCircle2 className="w-3 h-3 text-[var(--ink)]" strokeWidth={2} />
                                  ) : (
                                    <Copy className="w-3 h-3 text-[var(--pencil)]" strokeWidth={2} />
                                  )}
                                </button>
                              </div>
                              {contract.inputValue && (
                                <p className="text-xs text-[var(--shade)] mt-1 italic">
                                  Initial: "{contract.inputValue}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={`https://basescan.org/address/${contract.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-[var(--light)] transition-colors"
                              title="View on BaseScan"
                            >
                              <ExternalLink className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
                            </a>
                            <button
                              onClick={() => removeContract(contract.address)}
                              className="p-2 hover:bg-[var(--light)] transition-colors"
                              title="Remove from history"
                            >
                              <Trash2 className="w-4 h-4 text-[var(--pencil)]" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats & Achievements Section - Always Visible at Bottom with Gap */}
        <div className="mt-8 mb-6 p-4 border-2 border-[var(--ink)] bg-[var(--paper)] pencil-sketch-bg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--ink)] text-sm uppercase tracking-wider">
              Your Stats & Achievements
            </h3>
            {referralCode && (
              <div className="text-xs text-[var(--graphite)]">
                Ref: <span className="font-mono">{referralCode}</span>
              </div>
            )}
          </div>
          
          {/* Stats Row */}
          <div className="mb-4 pb-4 border-b-2 border-[var(--light)]">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-[var(--ink)]">
                  {deployedContracts.length}
                </div>
                <div className="text-xs text-[var(--graphite)]">Contracts Deployed</div>
              </div>
            </div>
          </div>

          {/* Achievements Grid - Doodle Themed */}
          <div>
            <h4 className="font-bold text-[var(--ink)] text-xs uppercase tracking-wider mb-3">
              Achievements
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((achievement, index) => {
                const Icon = achievement.icon;
                const isUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked || false;
                return (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center p-3 border-2 animate-slide-in stagger-${Math.min(index + 1, 3)} ${
                      isUnlocked 
                        ? 'border-[var(--ink)] bg-[var(--paper)]' 
                        : 'border-[var(--pencil)] bg-[var(--light)] opacity-50'
                    }`}
                    title={isUnlocked ? `${achievement.name}: ${achievement.description}` : `Locked: ${achievement.description}`}
                  >
                    <Icon 
                      className={`w-6 h-6 mb-2 ${isUnlocked ? 'text-[var(--ink)]' : 'text-[var(--graphite)]'}`} 
                      strokeWidth={2} 
                    />
                    <div className={`text-xs text-center font-semibold ${isUnlocked ? 'text-[var(--ink)]' : 'text-[var(--graphite)]'}`}>
                      {achievement.milestone}
                    </div>
                  </div>
                );
              })}
            </div>
            {achievements.filter(a => !a.unlocked).length > 0 && (
              <div className="text-xs text-[var(--graphite)] mt-3 text-center">
                Next: {achievements.find(a => !a.unlocked)?.name} ({achievements.find(a => !a.unlocked)?.milestone} contracts)
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[var(--shade)] text-sm font-medium tracking-wide">
            Base Mainnet / Chain ID: 8453
          </p>
          <p className="text-[var(--shade)] text-xs mt-1">
            Compiled with Solidity 0.8.19
          </p>
        </footer>
      </div>
    </div>
  );
}

export default ContractDeployer;
